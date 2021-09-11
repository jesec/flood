export interface MethodCallConfig {
  readonly methodCall: string;
  readonly transformValue: (value: unknown) => string | boolean | number | string[] | Record<string, unknown>;
}

export type MethodCallConfigs = Readonly<{
  [propLabel: string]: MethodCallConfig;
}>;

export type MultiMethodCalls = Array<{
  methodName: string;
  params: Array<string | Buffer>;
}>;

export const stringTransformer = (value: unknown): string => {
  return value as string;
};

export const stringArrayTransformer = (value: unknown): string[] => {
  return value as string[];
};

export const booleanTransformer = (value: unknown): boolean => {
  return value !== 0 && value !== '0';
};

export const numberTransformer = (value: unknown): number => {
  return Number(value);
};

export const getMethodCalls = (configs: MethodCallConfigs) => {
  return Object.values(configs).map((config) => config.methodCall);
};

export const processMethodCallResponse = async <T extends MethodCallConfigs, P extends keyof T>(
  response: Array<Parameters<T[P]['transformValue']>[0]>,
  configs: T,
): Promise<{
  [propLabel in P]: ReturnType<T[propLabel]['transformValue']>;
}> => {
  return Object.assign(
    {},
    ...(await Promise.all(
      Object.keys(configs).map(async (propLabel, index) => {
        return {
          [propLabel]: configs[propLabel].transformValue(response[index]),
        };
      }),
    )),
  );
};
