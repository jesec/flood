export async function asyncFilter<T>(
  array: Array<T>,
  predicate: (item: T, index: number) => Promise<boolean>,
): Promise<Array<T>> {
  const results: T[] = [];

  for (const [index, item] of array.entries()) {
    if (await predicate(item, index)) {
      results.push(item);
    }
  }

  return results;
}
