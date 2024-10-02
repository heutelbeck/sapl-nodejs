import { ContentFilter } from "./ContentFilter";
import { ConstraintResponsibility } from "./ConstraintResponsibility";
import { HasPriority } from "../../../interfaces/constraints/HasPriority";
import { MappingConstraintHandlerProvider } from "../../../interfaces/constraints/MappingConstraintHandlerProvider";

/**
 * This class is responsible for providing the content filtering handler.
 * @implements MappingConstraintHandlerProvider
 */
export class ContentFilteringProvider
  implements MappingConstraintHandlerProvider
{
  private static readonly CONSTRAINT_TYPE = "filterJsonContent";

  /**
   * Get the handler for the constraint object.
   * @param constraint The constraint object.
   * @returns The handler for the constraint object.
   */
  getHandler(constraint: object) {
    return ContentFilter.getHandler(
      constraint,
      ContentFilteringProvider.CONSTRAINT_TYPE
    );
  }

  /**
   * Checks if the constraint is responsible for the given type.
   * @param constraint The constraint to check.
   * @returns True if the constraint is responsible for the given type, false otherwise.
   */
  isResponsible(constraint: object): boolean {
    return ConstraintResponsibility.isResponsible(
      constraint,
      ContentFilteringProvider.CONSTRAINT_TYPE
    );
  }

  /**
   * Get the priority of the provider.
   * @returns The priority of the provider.
   */
  getPriority(): number {
    return 0;
  }

  /**
   * Compares the priority of the provider with another.
   * @param other The other provider to compare to.
   * @returns The comparison result.
   */
  compareTo(other: HasPriority): number {
    return other.getPriority() < this.getPriority()
      ? -1
      : other.getPriority() === this.getPriority()
      ? 0
      : 1;
  }
}
