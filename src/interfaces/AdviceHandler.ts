/**
 * Interface for handling advices of the PDP.
 */
export interface AdviceHandler {
  /**
   * The advice to handle.
   */
  readonly advices: object;

  /**
   * Handles the advice of the PDP.
   *
   * @return true if the advices were handled successfully, false otherwise
   */
  handleAdvice(): boolean;
}
