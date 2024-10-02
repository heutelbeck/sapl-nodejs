import { ConstraintHandler } from "./ConstraintHandler";
import { AdviceHandler as AdviceHandlerInterface } from "../../interfaces/AdviceHandler";
import { ConsumerConstraintHandlerProvider } from "../../interfaces/ConsumerConstraintHandlerProvider";

/**
 * Class to handle advices from the PDP response.
 * @implements AdviceHandlerInterface
 */
export class AdviceHandler implements AdviceHandlerInterface {
  readonly advices: object[];
  readonly adviceHandlers: ConsumerConstraintHandlerProvider[];

  /**
   * Constructor of the AdviceHandler class.
   * @param adviceObject Object containing the advices
   * @param adviceHandlers Array of advice handlers
   */
  constructor(
    adviceObject: object[],
    adviceHandlers: ConsumerConstraintHandlerProvider[]
  ) {
    this.advices = adviceObject;
    this.adviceHandlers = adviceHandlers;
  }

  /**
   * Handles the advice.
   * @returns True if the advice was handled, false otherwise.
   */
  handleAdvice(): boolean {
    return ConstraintHandler.handleConstraints(
      this.adviceHandlers,
      this.advices
    );
  }
}
