export interface ObligationHandler {
  /**
   * The obligations to handle.
   */
  readonly obligations: object;
  /**
   * Handles the obligations of the PDP.
   *
   * @return true if the obligations were handled successfully, false otherwise
   */
  handleObligations(): boolean;
}
