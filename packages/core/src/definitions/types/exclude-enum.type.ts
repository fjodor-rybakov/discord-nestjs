export type ExcludeEnum<T, K extends keyof T> = Exclude<
  keyof T | T[keyof T],
  K | T[K]
>;
