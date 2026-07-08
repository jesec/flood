/**
 * Error thrown when the Neptune JSON-RPC server returns an error response.
 *
 * Standard JSON-RPC 2.0 error codes:
 * - `-32700` Parse error
 * - `-32600` Invalid Request
 * - `-32601` Method not found
 * - `-32602` Invalid params
 * - `-32603` Internal error
 *
 * Application-level codes (positive integers) indicate specific Neptune errors.
 */
export class NeptuneRPCError extends Error {
  /** JSON-RPC error code. */
  code: number;
  /** Optional additional error data. */
  data?: string;

  constructor(code: number, message: string, data?: string) {
    super(message);
    this.name = 'NeptuneRPCError';
    this.code = code;
    this.data = data;
  }
}

/**
 * Error thrown when a low-level connection failure occurs (DNS resolution,
 * connection refused, timeout, etc.).
 */
export class NeptuneConnectionError extends Error {
  /** The original error that caused the connection failure, if available. */
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'NeptuneConnectionError';
    this.cause = cause;
  }
}

/**
 * Error thrown when the server returns a non-2xx HTTP status.
 */
export class NeptuneHTTPError extends Error {
  /** HTTP status code returned by the server. */
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'NeptuneHTTPError';
    this.status = status;
  }
}
