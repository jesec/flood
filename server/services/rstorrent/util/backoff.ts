export interface BackoffOptions {
  initialMs: number;
  maxMs: number;
  factor?: number;
  jitter?: number;
}

export interface Backoff {
  next: () => number;
  reset: () => void;
}

/**
 * Deterministic-by-default exponential backoff. `jitter` (0..1) adds a random
 * portion of the computed delay, which keeps reconnecting clients from
 * stampeding the daemon.
 */
export const createBackoff = ({initialMs, maxMs, factor = 2, jitter = 0}: BackoffOptions): Backoff => {
  let attempt = 0;

  return {
    next: () => {
      const delay = Math.min(initialMs * factor ** attempt, maxMs);
      attempt += 1;
      return jitter > 0 ? delay * (1 - jitter + Math.random() * jitter) : delay;
    },
    reset: () => {
      attempt = 0;
    },
  };
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms).unref();
  });
