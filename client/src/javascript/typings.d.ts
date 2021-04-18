declare module '*.md' {
  export const react: any;
  const value: any;
  export default value;
}

declare module '@lingui/loader!*.json?raw-lingui' {
  export const messages: Record<string, string[]>;
}
