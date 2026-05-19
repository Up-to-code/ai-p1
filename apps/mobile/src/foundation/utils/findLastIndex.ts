export function findLastIndex<T>(
  items: readonly T[],
  predicate: (item: T, index: number, array: readonly T[]) => boolean,
) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index]!, index, items)) {
      return index;
    }
  }

  return -1;
}
