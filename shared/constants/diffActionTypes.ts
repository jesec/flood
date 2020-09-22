import objectUtil from '../util/objectUtil';

const diffActionTypes = ['ITEM_ADDED', 'ITEM_CHANGED', 'ITEM_REMOVED'] as const;

export default objectUtil.createStringMapFromArray(diffActionTypes);

export type DiffActionType = typeof diffActionTypes[number];

export type DiffAction<T = unknown> = Array<
  | {
      action: Exclude<DiffActionType, 'ITEM_REMOVED'>;
      data: T;
    }
  | {
      action: 'ITEM_REMOVED';
      data: keyof T;
    }
>;
