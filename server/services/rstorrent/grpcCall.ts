import {type ServiceError, status} from '@grpc/grpc-js';

export const DEFAULT_CALL_DEADLINE_MS = 10_000;

export const getDeadline = (timeoutMs: number = DEFAULT_CALL_DEADLINE_MS): Date => new Date(Date.now() + timeoutMs);

const TRANSPORT_ERROR_CODES: number[] = [status.UNAVAILABLE, status.DEADLINE_EXCEEDED, status.CANCELLED];

export const isTransportError = (error: unknown): boolean => {
  const code = (error as ServiceError | undefined)?.code;
  return typeof code === 'number' && TRANSPORT_ERROR_CODES.includes(code);
};
