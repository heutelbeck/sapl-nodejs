export interface Predicate<T> {
  // NOSONAR
  (arg: T): boolean;
}
