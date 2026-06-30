declare module '*.md' {
  const value: string;
  export default value;
}

declare module '*?lingui' {
  export const messages: Record<string, string[]>;
}

// File Handling API (launchQueue) — not yet in TypeScript's DOM lib.
// FileSystemFileHandle already is.
interface LaunchParams {
  readonly files?: ReadonlyArray<FileSystemFileHandle>;
}

interface LaunchQueue {
  setConsumer: (consumer: (params: LaunchParams) => void) => void;
}

interface Window {
  readonly launchQueue?: LaunchQueue;
}
