import { ConstraintHandler } from "./ConstraintHandler";
import { ObligationHandler as ObligationHandlerInterface } from "../../interfaces/ObligationHandler";
import { ConsumerConstraintHandlerProvider } from "../../interfaces/ConsumerConstraintHandlerProvider";

/**
 * Class to handle obligations from the PDP response.
 * @implements ObligationHandlerInterface
 */
export class ObligationHandler implements ObligationHandlerInterface {
  readonly obligations: object[];
  readonly constraintHandlers: ConsumerConstraintHandlerProvider[];

  /**
   * Constructor of the ObligationHandler class.
   * @param adviceObject Object containing the obligations
   * @param adviceHandlers Array of obligation handlers
   */
  constructor(
    obligationObject: object[],
    constraintHandlers: ConsumerConstraintHandlerProvider[]
  ) {
    this.obligations = obligationObject;
    this.constraintHandlers = constraintHandlers;
  }

  /**
   * Handle the obligations from the PDP response by calling the ConstraintHandler.
   * @returns true if the obligations were handled successfully, false otherwise
   */
  public handleObligations(): boolean {
    return ConstraintHandler.handleConstraints(
      this.constraintHandlers,
      this.obligations
    );
  }
}
