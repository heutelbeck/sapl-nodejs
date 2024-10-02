export interface HasPriority {
  getPriority(): number;

  compareTo(other: HasPriority): number;
}
