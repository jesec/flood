import type {DiffAction} from '../constants/diffActionTypes';

type KeyFromValue<V, T extends Record<string, string>> = {
  [K in keyof T]: V extends T[K] ? K : never;
}[keyof T];

const objectUtil = {
  createStringMapFromArray: <T extends string>(array: Readonly<Array<T>>): Readonly<{[key in T]: key}> => {
    return array.reduce((memo, key) => {
      return Object.assign(memo, {
        [key]: key,
      });
    }, {} as Partial<{[key in T]: key}>) as Readonly<{[key in T]: key}>;
  },

  getDiff: <P extends string, N extends string>(
    prevObject: Partial<Record<P, unknown>>,
    nextObject: Partial<Record<N, unknown>>,
  ) => {
    const prevObjectKeys = Object.keys(prevObject);
    const nextObjectKeys = Object.keys(nextObject);

    let shouldCheckForRemovals = nextObjectKeys.length < prevObjectKeys.length;

    const diff = nextObjectKeys.reduce((accumulator, key) => {
      const prevValue = prevObject[key as P];
      const nextValue = nextObject[key as N];

      if (prevValue == null) {
        shouldCheckForRemovals = true;

        accumulator.push({
          action: 'ITEM_ADDED',
          data: {
            [key]: nextValue,
          },
        } as {
          action: 'ITEM_ADDED';
          data: {
            [key in N]: typeof nextObject[key];
          };
        });
      } else if (prevValue !== nextValue) {
        accumulator.push({
          action: 'ITEM_CHANGED',
          data: {
            [key]: nextValue,
          },
        } as {
          action: 'ITEM_CHANGED';
          data: {
            [key in N]: typeof nextObject[key];
          };
        });
      }

      return accumulator;
    }, [] as DiffAction<Record<N, unknown>>);

    if (shouldCheckForRemovals) {
      prevObjectKeys.forEach((key) => {
        if (nextObject[key as N] == null) {
          diff.push({
            action: 'ITEM_REMOVED',
            data: key as N,
          });
        }
      });
    }

    return diff;
  },

  reflect: <T extends Record<K, string>, K extends keyof T>(
    object: T,
  ): {[value in T[K]]: KeyFromValue<value, T>} & {[key in K]: T[key]} => {
    return Object.assign(
      object,
      Object.keys(object).reduce((memo, key) => {
        return Object.assign(memo, {
          [object[key as K]]: key,
        });
      }, {} as {[value in T[K]]: KeyFromValue<value, T>}),
    );
  },
};

export default objectUtil;
