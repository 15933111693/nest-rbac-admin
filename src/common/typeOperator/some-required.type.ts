export type SomeRequired<T, U extends keyof T> = Omit<T, U> & {
  [K in U]-?: T[K];
};
