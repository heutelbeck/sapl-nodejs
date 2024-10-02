import { ConsumerConstraintHandlerProvider } from "../../interfaces/ConsumerConstraintHandlerProvider";

/**
 * Class to handle constraints from the PDP response.
 */
export class ConstraintHandler {
  /**
   * Handles the constraints of the PDP.
   *
   * @param constraints The constraints to handle.
   * @param constraintObject The constraints to handle.
   * @return true if the constraints were handled successfully, false otherwise
   */
  public static handleConstraints(
    constraints: ConsumerConstraintHandlerProvider[],
    constraintObject: object[]
  ): boolean {
    var handled = false;
    constraintObject.forEach((constraint: any) => {
      constraints.forEach((handler: any) => {
        if (handler.prototype.isResponsible(constraint)) {
          const handlerFunction = handler.prototype.getHandler(constraint);
          handlerFunction();
          handled = true;
        }
      });
    });

    return handled;
  }
}
