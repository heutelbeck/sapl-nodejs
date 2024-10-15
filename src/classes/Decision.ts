import { PdpReturnStatus } from "../interfaces/Pdp";
import { Decision as DecisionInterface } from "../interfaces/Decision";

/**
 * The Decision class represents the decision returned by the PDP.
 */
export class Decision implements DecisionInterface {
  public static readonly DECISION = "decision";

  private readonly action: string;
  private readonly subject: object;
  private readonly resource: string;
  private readonly environment: object;
  private readonly decision: PdpReturnStatus;

  private readonly advices: object[];
  private readonly obligations: object[];

  /**
   * Constructor for the Decision class.
   * @param decision The decision object returned by the PDP
   */
  constructor(decision: any) {
    let decisionObj = decision;
    if (typeof decisionObj !== "object") {
      // try-catch to handle invalid JSON
      try {
        decisionObj = JSON.parse(decisionObj);
      } catch (error) {
        decisionObj = {};
      }
    }
    if (!decisionObj.decision) {
      throw new Error("Decision object is missing the decision field");
    }
    this.decision = decisionObj.decision;
    this.obligations = decisionObj.obligations || [];
    this.advices = decisionObj.advice || [];
    this.resource = decisionObj.resource || [];
    this.action = decisionObj.action || [];
    this.environment = decisionObj.environment || [];
    this.subject = decisionObj.subject || [];
  }

  /**
   * Get the decision of the PDP.
   * @returns The decision of the PDP
   */
  getDecision(): PdpReturnStatus {
    return this.decision;
  }

  /**
   * Get the obligations of the PDP.
   * @returns The obligations of the PDP
   */
  getObligations(): object[] {
    return this.obligations;
  }

  /**
   * Get the advices of the PDP.
   * @returns The advices of the PDP
   */
  getAdvices(): object[] {
    return this.advices;
  }

  /**
   * Get the resource of the PDP.
   * @returns The resource of the PDP
   */
  getResource(): string {
    return this.resource;
  }

  /**
   * Get the action of the PDP.
   * @returns The action of the PDP
   */
  getAction(): string {
    return this.action;
  }

  /**
   * Get the environment of the PDP.
   * @returns The environment of the PDP
   */
  getEnvironment(): object {
    return this.environment;
  }

  /**
   * Get the subject of the PDP.
   * @returns The subject of the PDP
   */
  getSubject(): object {
    return this.subject;
  }
}
