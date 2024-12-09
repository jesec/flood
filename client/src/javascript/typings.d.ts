declare module '*.md' {
  const value: string;
  export default value;
}

declare module '@lingui/loader!*.json?raw-lingui' {
  export const messages: Record<string, string[]>;
}
