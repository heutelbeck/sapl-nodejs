import { Responsible } from "./Responsible";

export interface SubscriptionHandlerProvider extends Responsible {
  /**
   * Get the handler for the constraint object.
   * @param constraint Constraint object.
   */
  getHandler(constraint: object): any;
}
