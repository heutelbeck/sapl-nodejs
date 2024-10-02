import { HasPriority } from "./HasPriority";
import { Responsible } from "./Responsible";

export interface ErrorMappingConstraintHandlerProvider
  extends Responsible,
    HasPriority {
  /**
   * Get the handler for the constraint object.
   * @param constraint Constraint object.
   */
  getHandler(constraint: object): any;
}
