export interface RPCError extends Error {
  code?: number;
  isRPCError: boolean;
}

export const RPCError = (message?: string, code?: number): RPCError => {
  const e = new Error(message) as RPCError;
  e.code = code;
  e.isRPCError = true;
  return e;
};
