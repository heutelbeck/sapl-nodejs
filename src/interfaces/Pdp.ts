import { AuthorizationManager } from "./AuthorizationManager";
import { AuthorizationSubscription } from "./AuthorizationSubscription";
import { ConstraintEnforcementService } from "../classes/constraints/ConstraintEnforcementService";

export enum PdpType {
  SINGLE = "/api/pdp/decide-once",
  MULTI = "/api/pdp/decide",
  // NOSONAR
  SINGLE_STREAM = "/api/pdp/decide",
}

export enum PdpReturnStatus {
  PERMIT = "PERMIT",
  DENY = "DENY",
  NOT_APPLICABLE = "NOT_APPLICABLE",
  INDETERMINATE = "INDETERMINATE",
}

/**
 * PDP interface
 */
export interface Pdp {
  /**
   * Retrieves the username associated with the current instance.
   *
   * @returns The username associated with the current instance.
   */
  getUsername(): string;

  /**
   * Set the username associated with the current instance and the AuthorizationManager.
   *
   * @returns The username associated with the current instance.
   */
  setUsername(username: string);

  /**
   * Retrieves the authorizationManager associated with the current instance.
   *
   * @returns The authorizationManager associated with the current instance.
   */
  getAuthorizationManager(): AuthorizationManager;

  /**
   * Sets the authorizationManager for the current instance.
   *
   * @param authorizationManager The authorizationManager to be set.
   */
  setAuthorizationManager(path: string);

  /**
   * Sets the host for the current instance.
   *
   * @param host Host
   * @returns RemotePdp
   */
  host(host: string);

  /**
   * Sets the port for the current instance.
   *
   * @param port Port
   * @returns RemotePdp
   */
  port(port: number);

  /**
   * Sets the basicAuth for the current instance.
   *
   * @param username Username
   * @param password Password
   * @returns RemotePdp
   */
  basicAuth(username: string, password: string);

  /**
   * Sets the bearerToken for the current instance.
   *
   * @param token Token
   * @returns RemotePdp
   */
  bearerToken(token: string);

  /**
   * Retrieves the constraintEnforcementService associated with the current instance.
   *
   * @returns The constraintEnforcementService associated with the current instance.
   */
  getConstraintEnforcementService(): ConstraintEnforcementService;

  /**
   * Sends a POST request with the given body to the specified URL and returns a readable stream containing the response data.
   * If a new URL is provided, it overrides the default URL for the request.
   *
   * @param body The body of the POST request.
   * @param url Optional. The URL to which the request should be sent. If provided, it overrides the default URL.
   * @returns A Promise that resolves with a readable stream containing the response data if the request is successful (status code 200).
   *          Otherwise, it logs an error message and rejects the promise.
   */
  multiDecide(
    body: AuthorizationSubscription,
    url?: string
  ): Promise<NodeJS.ReadableStream | undefined>;

  /**
   * Sends a POST request with the given body to the specified URL and returns a readable stream containing the response data.
   * If a new URL is provided, it overrides the default URL for the request.
   *
   * @param body The body of the POST request.
   * @param url Optional. The URL to which the request should be sent. If provided, it overrides the default URL.
   * @returns A Promise that resolves with a readable stream containing the response data if the request is successful (status code 200).
   *          Otherwise, it logs an error message and rejects the promise.
   */
  decideOnce(
    body: AuthorizationSubscription,
    url?: string
  ): Promise<NodeJS.ReadableStream | undefined>;

  /**
   * Sends a POST request with the given body to the specified URL and returns a readable stream containing the response data.
   *
   * @param body Body of the request to be sent to the PDP server. Depending on the body, the request is either a single or multi request.
   * @param url The URL to which the request should be sent. If provided, it overrides the default URL.
   * @returns A Promise that resolves with a readable stream containing the response data if the request is successful (status code 200).
   *          Otherwise, it logs an error message and rejects the promise.
   */
  decide(
    body: AuthorizationSubscription,
    url?: string
  ): Promise<NodeJS.ReadableStream | undefined>;
}
