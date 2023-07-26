export async function asyncFilter<T>(
  arr: Array<T>,
  predicate: (item: T, index: number) => Promise<boolean>,
): Promise<Array<T>> {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
}
