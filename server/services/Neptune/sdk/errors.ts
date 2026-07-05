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
 * Error thrown when the HTTP request itself fails (network error,
 * non-2xx status, etc.).
 */
export class NeptuneHTTPError extends Error {
  /** HTTP status code, if available. */
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'NeptuneHTTPError';
    this.status = status;
  }
}
