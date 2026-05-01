declare module '*.md' {
  const value: string;
  export default value;
}

declare module '*?lingui' {
  export const messages: Record<string, string[]>;
}
