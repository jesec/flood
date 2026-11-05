import PQueue from 'p-queue';

import {RPCError} from '../rTorrent/types/RPCError';
import type {
  MethodCallParameters,
  MultiMethodCalls,
  RTorrentMethodCallTransport,
} from '../rTorrent/util/rTorrentMethodCallUtil';
import type RstorrentConnectionManager from './connectionManager';
import {getDeadline, isTransportError} from './grpcCall';
import {fromObjectValue, toObjectValue} from './objectValueCodec';
import type {CommandRequest} from './proto/rstorrent';

const HASH_RE = /^[0-9a-fA-F]{40}$/;

type ParsedTarget =
  | {kind: 'none'}
  | {kind: 'download'; hash: string}
  | {kind: 'file'; hash: string; index: number}
  | {kind: 'tracker'; hash: string; index: number};

/**
 * Mirrors rstorrent's `Target::parse_target_str` (crates/rt-rpc/src/target.rs),
 * which the SCGI/XML-RPC entry point uses to decide whether the first parameter
 * is a target or a regular argument.
 *
 * Returns null when the value is a plain argument (the Rust side returns Err).
 */
export const parseTargetString = (value: string): ParsedTarget | null => {
  if (value === '') {
    return {kind: 'none'};
  }

  if (value.length < 40) {
    return null;
  }

  const hash = value.slice(0, 40);
  if (!HASH_RE.test(hash)) {
    return null;
  }

  if (value.length === 40) {
    return {kind: 'download', hash};
  }

  if (value[40] === ':' && value.length >= 42) {
    const targetType = value[41];

    if (targetType === 'd') {
      return {kind: 'download', hash};
    }

    if (value.length < 43) {
      return null;
    }

    const index = Number(value.slice(42));
    if (!Number.isSafeInteger(index) || index < 0 || index > 0xffffffff) {
      return null;
    }

    if (targetType === 'f') {
      return {kind: 'file', hash, index};
    }

    if (targetType === 't') {
      return {kind: 'tracker', hash, index};
    }

    return null;
  }

  return {kind: 'download', hash};
};

/** `d.hash=` (stringified getter) is not a command name in rstorrent. */
const normalizeCommandName = (methodName: string): string =>
  methodName.endsWith('=') ? methodName.slice(0, -1) : methodName;

const toCommandRequest = (methodName: string, parameters: MethodCallParameters): CommandRequest => {
  const params = [...parameters];
  let targetHash = '';

  if (params.length > 0 && typeof params[0] === 'string') {
    const target = parseTargetString(params[0]);

    if (target != null) {
      params.shift();

      if (target.kind === 'file' || target.kind === 'tracker') {
        throw RPCError(
          `Parameterized targets (${target.kind}:${target.index}) are not supported by the gRPC command service`,
        );
      }

      if (target.kind === 'download') {
        targetHash = target.hash;
      }
    }
  }

  return {
    command: normalizeCommandName(methodName),
    args: params.map(toObjectValue),
    targetHash,
    // Flood is a trusted local client; rt-rpc rejects commands that are not
    // flagged as untrusted-safe unless this is set.
    trusted: true,
  };
};

/**
 * gRPC implementation of the exact contract the SCGI request manager exposes
 * (`methodCall(methodName, parameters)`), backed by CommandService.
 *
 * Two legacy behaviours are reproduced here:
 * - the XML-RPC target heuristic (first string parameter may be a target),
 * - `system.multicall`, which rstorrent does not implement, mapped onto the
 *   gRPC `Multicall` RPC (flat response, matching the JSON-RPC transport).
 */
export default class RstorrentClientRequestManager implements RTorrentMethodCallTransport {
  /**
   * Only relevant to the legacy JSON-RPC path; kept so inherited workarounds
   * (`-32700` fallback) stay inert instead of being special-cased.
   */
  isJSONCapable = true;

  // Sequential calls preserve the SCGI semantics (load.* followed by
  // d.custom.* assignments / d.save_full_session, etc.).
  private queue = new PQueue({autoStart: true, concurrency: 1});

  constructor(private connection: RstorrentConnectionManager) {}

  methodCall = (methodName: string, parameters: MethodCallParameters): Promise<any> =>
    this.queue.add(() => this.sendMethodCall(methodName, parameters)) as Promise<any>;

  async listCommands(): Promise<string[]> {
    const response = await this.connection.commandClient.listCommands({}, {deadline: getDeadline()});
    return response.commands;
  }

  private async sendMethodCall(methodName: string, parameters: MethodCallParameters): Promise<unknown> {
    if (normalizeCommandName(methodName) === 'system.multicall') {
      return this.sendMulticall(parameters);
    }

    return this.runCommandRequest(toCommandRequest(methodName, parameters));
  }

  private async sendMulticall(parameters: MethodCallParameters): Promise<unknown> {
    const calls = parameters[0];

    if (!Array.isArray(calls)) {
      throw RPCError('system.multicall expects an array of calls');
    }

    const response = await this.connection.commandClient.multicall(
      {
        calls: (calls as MultiMethodCalls).map((call) => toCommandRequest(call.methodName, call.params)),
      },
      {deadline: getDeadline()},
    );

    // The JSON-RPC transport returned a flat array of result values and threw
    // on the first fault; keep that contract.
    return response.results.map((result) => {
      if (!result.success) {
        throw RPCError(result.errorMessage);
      }

      return fromObjectValue(result.result);
    });
  }

  private async runCommandRequest(request: CommandRequest): Promise<unknown> {
    try {
      const response = await this.connection.commandClient.execute(request, {deadline: getDeadline()});

      if (!response.success) {
        throw RPCError(response.errorMessage);
      }

      return fromObjectValue(response.result);
    } catch (error) {
      if (isTransportError(error)) {
        // Connection-level failure: let the gateway retry timer handle it.
        throw error;
      }

      if ((error as RPCError).isRPCError) {
        throw error;
      }

      throw RPCError((error as Error).message);
    }
  }
}
