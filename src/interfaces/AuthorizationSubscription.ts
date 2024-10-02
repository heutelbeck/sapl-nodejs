export enum AuthorizationSubscriptionType {
  SINGLE = "/api/pdp/decide-once",
  MULTI = "/api/pdp/multi-decide",
  SINGLE_STREAM = "/api/pdp/decide",
}
export interface AuthorizationSubscription {
  /**
   * Getter for the subject member
   *
   * @returns The subject
   */
  getSubject(): any;

  /**
   * Getter for the action member
   *
   * @returns The action
   */
  getAction(): string;

  /**
   * Getter for the resource member
   *
   * @returns The resource
   */
  getResource(): string;

  /**
   * Getter for the environment member
   *
   * @returns The environment
   */
  getEnvironment(): string;

  /**
   * Get the AuthorizationSubscriptionType
   *
   * @returns The AuthorizationSubscriptionType
   */
  getAuthorizationSubscriptionType(): AuthorizationSubscriptionType;

  /**
   * Get the string representation of the AuthorizationSubscription
   *
   * @returns The string representation of the AuthorizationSubscription
   */
  asString(): string;
}
