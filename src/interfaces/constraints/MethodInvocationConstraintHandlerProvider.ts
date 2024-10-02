import { Responsible } from "./Responsible";

export interface MethodInvocationConstraintHandlerProvider extends Responsible {
  /**
   * Get the handler for the constraint object.
   * @param constraint Constraint object.
   */
  getHandler(constraint: object): any;
}
