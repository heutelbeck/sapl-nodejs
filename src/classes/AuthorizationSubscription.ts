import { OsHelper } from "./helper/OsHelper";
import {
  AuthorizationSubscription as AuthorizationSubscriptionInterface,
  AuthorizationSubscriptionType,
} from "../interfaces/AuthorizationSubscription";

export class AuthorizationSubscription
  implements AuthorizationSubscriptionInterface
{
  private subject: any;
  private action: string;
  private resource: string;
  private environment: string;
  private subjects: string[];
  private actions: string[];
  private resources: string[];
  private authorizationSubscriptionType: AuthorizationSubscriptionType;
  /**
   * Structure of the individual subscriptions through the arrays of subjects, actions and resources.
   */
  private authorizationSubscriptions: object = {};

  /**
   * Structure method for POST request of the multi-decision
   * @param subject Subject that wants to execute the access
   * @param action Action to be executed
   * @param resource Resource to be accessed
   * @param environment
   */
  constructor(subject: any, action: any, resource: any, environment?: string) {
    this._mapper(subject, action, resource);
    this.environment = environment;
  }

  /**
   * Structure method for POST request of the multi-decision
   * @param subject Subject that wants to execute the access
   * @param action Action to be executed
   * @param resource Resource to be accessed
   * @param environment
   * @returns Instance of AuthorizationSubscription
   */
  public static create(
    subject: any,
    action: any,
    resource: any,
    environment?: string
  ) {
    return new AuthorizationSubscription(
      (subject = subject),
      (action = action),
      (resource = resource),
      (environment = environment)
    );
  }

  /**
   * Get the subject of the authorization subscription.
   * @returns The subject of the authorization subscription.
   */
  public getSubject(): any {
    return this.subject ? this.subject : this.subjects.join(", ");
  }

  /**
   * Get the action of the authorization subscription.
   * @returns The action of the authorization subscription.
   */
  public getAction(): string {
    return this.action ? this.action : this.actions.join(", ");
  }

  /**
   * Get the resource of the authorization subscription.
   * @returns The resource of the authorization subscription.
   */
  public getResource(): string {
    return this.resource ? this.resource : this.resources.join(", ");
  }

  /**
   * Get the environment of the authorization subscription.
   * @returns The environment of the authorization subscription.
   */
  public getEnvironment(): string {
    return this.environment;
  }

  /**
   * Get the authorization subscriptions.
   * @returns The authorization subscriptions.
   */
  public getAuthorizationSubscriptionType(): AuthorizationSubscriptionType {
    return this.authorizationSubscriptionType;
  }

  /**
   * Get the authorization subscription as a string.
   * @returns The authorization subscription as a string.
   */
  public asString(): string {
    if (
      this.authorizationSubscriptionType ===
        AuthorizationSubscriptionType.SINGLE ||
      this.authorizationSubscriptionType ===
        AuthorizationSubscriptionType.SINGLE_STREAM
    ) {
      return `{"subject": ${JSON.stringify(
        this.subject
      )}, "action": ${JSON.stringify(
        this.action
      )}, "resource": ${JSON.stringify(this.resource)}}`;
    } else {
      return `{"subjects": ${JSON.stringify(
        this.subjects
      )}, "actions": ${JSON.stringify(
        this.actions
      )}, "resources": ${JSON.stringify(
        this.resources
      )}, "authorizationSubscriptions": ${JSON.stringify(
        this.authorizationSubscriptions
      )}}`;
    }
  }

  /**
   * Check if the parameters are an array or a single value
   * @param subject Subject that wants to execute the access
   * @param action Action to be executed
   * @param resource Resource to be accessed
   */
  private _mapper(subject: any, action: any, resource: any) {
    /**
     * Check if the subject is an array or a single value
     */
    if (Array.isArray(subject)) {
      this.subjects = subject.map((s) => s.toString());
    } else if (typeof subject === "object") {
      this.subject = subject;
    } else {
      this.subject = subject ? subject : OsHelper.getOsUsername();
    }
    /**
     * Check if the action is an array or a single value
     */
    if (Array.isArray(action)) {
      this.actions = action.map((s) => s.toString());
    } else if (typeof action === "object") {
      this.action = action;
    } else {
      this.action = action.toString(); //TODO usefully default value?
    }
    /**
     * Check if the resource is an array or a single value
     */
    if (Array.isArray(resource)) {
      this.resources = resource.map((s) => s.toString());
    } else if (typeof resource === "object") {
      this.resource = resource;
    } else {
      this.resource = resource.toString(); //TODO usefully default value?
    }

    this.authorizationSubscriptionType = AuthorizationSubscriptionType.MULTI;
    if (this.subjects || this.actions || this.resources) {
      this.authorizationSubscriptionType = AuthorizationSubscriptionType.MULTI;
      this._buildAuthorizationSubscriptionObjects();
    } else {
      this.authorizationSubscriptionType = AuthorizationSubscriptionType.SINGLE;
    }
  }

  /**
   * Get the array with the maximum size
   * @returns The array with the maximum size
   */
  private _getArrayWithMaxSize() {
    /* istanbul ignore next */
    let maxEntries = Math.max(
      this.subjects ? this.subjects.length : 0,
      this.actions ? this.actions.length : 0,
      this.resources ? this.resources.length : 0
    );

    if (maxEntries === this.subjects.length) {
      return this.subjects;
    } else if (maxEntries === this.actions.length) {
      return this.actions;
    } else if (maxEntries === this.resources.length) {
      return this.resources;
    }
  }

  /**
   * Build the authorization subscription objects
   */
  private _buildAuthorizationSubscriptionObjects() {
    this._getArrayWithMaxSize().forEach(() => {
      let forEachCounter = 0;
      let idCounter = 1;
      /* istanbul ignore next */
      let authorizationSubscriptionObject = {
        subjectId: this.subjects[forEachCounter] ? forEachCounter : "ERROR",
        actionId: this.actions[forEachCounter] ? forEachCounter : "ERROR",
        resourceId: this.resources[forEachCounter] ? forEachCounter : "ERROR",
      };

      this.authorizationSubscriptions[`id-${idCounter}`] =
        authorizationSubscriptionObject;
      idCounter++;
      forEachCounter++;
    });
  }
}
