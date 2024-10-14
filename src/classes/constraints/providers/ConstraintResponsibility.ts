/**
 * This class is responsible for checking if a constraint is responsible for a given type.
 */
export class ConstraintResponsibility {
  private static readonly TYPE: string = "type";

  /**
   * Checks if a constraint is responsible for a given type.
   * @param constraint The constraint to check.
   * @param requiredType The type to check for.
   * @returns True if the constraint is responsible for the given type, false otherwise
   */
  public static isResponsible(constraint: any, requiredType: string): boolean {
    if (constraint == null || !(typeof constraint === "object")) return false;

    const type = constraint[ConstraintResponsibility.TYPE];

    if (type === undefined || !(typeof type === "string")) return false;

    return requiredType === type;
  }
}
