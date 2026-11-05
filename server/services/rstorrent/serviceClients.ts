import {
  type CallOptions,
  type Client,
  type ClientReadableStream,
  type ClientUnaryCall,
  Metadata,
  type ServiceError,
} from '@grpc/grpc-js';

/**
 * Shape shared by ts-proto's generated service definitions
 * (`TorrentServiceService`, `SystemServiceService`, `CommandServiceService`).
 */
export interface GrpcMethodDefinition<TRequest, TResponse> {
  path: string;
  requestSerialize: (value: TRequest) => Buffer;
  responseDeserialize: (value: Buffer) => TResponse;
}

type UnaryCaller<TRequest, TResponse> = (request: TRequest, options?: Partial<CallOptions>) => Promise<TResponse>;

type ServerStreamCaller<TRequest, TResponse> = (
  request: TRequest,
  options?: Partial<CallOptions>,
) => ClientReadableStream<TResponse>;

export type {ServerStreamCaller, UnaryCaller};

/**
 * All service clients share a single `grpc.Client`/channel (ts-proto's client
 * classes each create their own channel, which breaks connectivity watching
 * and multiplies sockets).
 */
export const makeUnaryCaller =
  <TRequest, TResponse>(
    client: Client,
    definition: GrpcMethodDefinition<TRequest, TResponse>,
  ): UnaryCaller<TRequest, TResponse> =>
  (request: TRequest, options: Partial<CallOptions> = {}): Promise<TResponse> =>
    new Promise((resolve, reject) => {
      const call: ClientUnaryCall = client.makeUnaryRequest(
        definition.path,
        definition.requestSerialize,
        definition.responseDeserialize,
        request,
        new Metadata(),
        options,
        (error: ServiceError | null, response?: TResponse) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(response as TResponse);
        },
      );

      call.on('error', reject);
    });

export const makeServerStreamCaller =
  <TRequest, TResponse>(
    client: Client,
    definition: GrpcMethodDefinition<TRequest, TResponse>,
  ): ServerStreamCaller<TRequest, TResponse> =>
  (request: TRequest, options: Partial<CallOptions> = {}): ClientReadableStream<TResponse> =>
    client.makeServerStreamRequest(
      definition.path,
      definition.requestSerialize,
      definition.responseDeserialize,
      request,
      new Metadata(),
      options,
    );
