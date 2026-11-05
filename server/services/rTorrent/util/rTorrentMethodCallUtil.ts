export interface MethodCallConfig {
  readonly methodCall: string | readonly string[];
  readonly transformValue: (value: unknown) => string | boolean | number | string[] | Record<string, unknown>;
}

export type MethodCallConfigs = Readonly<{
  [propLabel: string]: MethodCallConfig;
}>;

export type MultiMethodCalls = Array<{
  methodName: string;
  params: Array<string | Buffer>;
}>;

export type MethodCallParameters = Array<string | Buffer | MultiMethodCalls>;

/**
 * Transport contract shared by the SCGI/XML-RPC manager and the gRPC manager.
 */
export interface RTorrentMethodCallTransport {
  // Legacy transport results are untyped by design (multicall values).

  methodCall(methodName: string, parameters: MethodCallParameters): Promise<any>;
}

export const stringTransformer = (value: unknown): string => {
  return value as string;
};

export const stringArrayTransformer = (value: unknown): string[] => {
  return value as string[];
};

export const booleanTransformer = (value: unknown): boolean => {
  // `false=` sentinels for unavailable methods come back as empty values from
  // clients that do not implement the `false` command (e.g. rstorrent).
  if (value === '' || value == null) {
    return false;
  }

  return value !== 0 && value !== '0';
};

export const numberTransformer = (value: unknown): number => {
  return Number(value);
};

/**
 * Extracts the command name from a method-call expression.
 *
 * `d.hash=` -> `d.hash`, `cat="$t.multicall=..."` -> `cat`. Without this,
 * expression-based fields were treated as unavailable and replaced by the
 * `false=` sentinel.
 */
export const getMethodCommandName = (method: string): string =>
  method.split('=')[0].split(/\s+/)[0].replace(/["']$/, '');

export const getMethodCalls = (configs: MethodCallConfigs, methodList?: string[]): string[] => {
  return Object.values(configs).map((config) => {
    const methods = Array.isArray(config.methodCall) ? config.methodCall : [config.methodCall];
    if (methodList && methodList.length > 0) {
      for (const method of methods) {
        if (methodList.includes(getMethodCommandName(method))) return method;
      }
      return 'false=';
    }
    return methods[0];
  });
};

export const processMethodCallResponse = async <T extends MethodCallConfigs, P extends keyof T>(
  response: Array<Parameters<T[P]['transformValue']>[0]>,
  configs: T,
): Promise<{
  [propLabel in P]: ReturnType<T[propLabel]['transformValue']>;
}> => {
  return Object.assign(
    {},
    ...(await Promise.all(
      Object.keys(configs).map(async (propLabel, index) => {
        return {
          [propLabel]: configs[propLabel].transformValue(response[index]),
        };
      }),
    )),
  );
};
