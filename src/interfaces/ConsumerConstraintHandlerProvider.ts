import { Responsible } from "./constraints/Responsible";

export interface ConsumerConstraintHandlerProvider extends Responsible {
  /**
   * Get the handler for the constraint object.
   * @param constraint Constraint object.
   */
  getHandler(constraint: object): any;
}
/**
 * Function to check if an object is an instance of ConsumerConstraintHandlerProvider.
 * @deprecated use setter Methods of sapl-nodejs\src\classes\constraints\ConstraintEnforcementService.ts instead.
 *
 * @param object Object to check.
 * @returns Boolean value indicating if the object is an instance of ConsumerConstraintHandlerProvider.
 */
export function instanceOfConsumerConstraintHandlerProvider(
  object: any
): object is ConsumerConstraintHandlerProvider {
  if (
    typeof object === "object" &&
    "isResponsible" in object &&
    typeof object.isResponsible === "function" &&
    "getHandler" in object &&
    typeof object.getHandler === "function"
  )
    return true;
}
