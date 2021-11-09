declare module '*.md' {
  export const react: any;
  const value: any;
  export default value;
}

declare module '@lingui/loader!*.json?raw-lingui' {
  export const messages: Record<string, string[]>;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
