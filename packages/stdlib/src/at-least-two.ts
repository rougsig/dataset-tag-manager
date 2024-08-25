export const atLeastTwo = <T>(arr: T[]): [T, T, ...T[]] => {
  if (arr.length < 2) throw new Error('Instantiated with fewer than two items')

  return arr as [T, T, ...T[]]
}
