export interface MethodCallConfig {
  readonly propLabel: string;
  readonly methodCall: string;
  readonly transformValue: (value: string) => string | string[] | boolean | number;
}

export type MethodCallConfigs = Readonly<Array<MethodCallConfig>>;

export type MultiMethodCalls = Array<{methodName: string; params: Array<string>}>;

export const defaultTransformer = (value: string): string => {
  return value;
};

export const booleanTransformer = (value: string): boolean => {
  return value === '1';
};

export const numberTransformer = (value: string): number => {
  return Number(value);
};
