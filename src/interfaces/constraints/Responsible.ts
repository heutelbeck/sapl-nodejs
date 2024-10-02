export interface Responsible {
  /**
   * Check if the constraint object is responsible for the constraint of the policy.
   * @param constraint Constraint object.
   */
  isResponsible(constraint: object): boolean;
}
