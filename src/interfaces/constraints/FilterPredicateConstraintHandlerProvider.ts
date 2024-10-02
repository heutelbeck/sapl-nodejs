import { Responsible } from "./Responsible";
import { Predicate } from "../../classes/Predicate";

export interface FilterPredicateConstraintHandlerProvider extends Responsible {
  /**
   * Get the handler for the constraint object.
   * @param constraint Constraint object.
   */
  getHandler(constraint: object): Predicate<object>;
}
