import fetch = require("node-fetch");
import {
  AuthorizationManager as AuthorizationManagerInterface,
  Subject,
} from "../interfaces/AuthorizationManager";

export class AuthorizationManager implements AuthorizationManagerInterface {
  private path: string;
  private subject: Subject;
  private subjectName: string;

  /**
   * Constructor for the AuthorizationManager class.
   * @param path The path of the authorization manager.
   */
  constructor(path: string) {
    this.path = path;
  }

  //---------------------------------------------------------------------------------------------------------------------
  // Getter and Setter
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Get the path of the authorization manager.
   * @returns The path of the authorization manager.
   */
  public getPath(): string {
    return this.path;
  }

  /**
   * Set the path of the authorization manager.
   * @param path The path of the authorization manager.
   */
  public setPath(path: string) {
    this.path = path;
  }

  /**
   * Set the subject name.
   * @param subjectName The subject name.
   */
  public setSubjectName(subjectName: string) {
    this.subjectName = subjectName;
  }

  /**
   * Get the subject name.
   * @returns The subject name.
   */
  public getSubjectName(): string {
    return this.subjectName;
  }

  //---------------------------------------------------------------------------------------------------------------------
  // public Methods
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Build the subject for the authorization subscription.
   */
  public async buildSubjectForAuhorizationSubscription() {
    await this._buildSubject();
    return this.subject;
  }

  //---------------------------------------------------------------------------------------------------------------------
  // private Methods
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Build the subject for the authorization subscription.
   */
  private async _buildSubject() {
    this.subject = {
      name: this.subjectName,
      roles: [],
    };
    await this._requestAuthorization().then((response) => {
      /* istanbul ignore next */
      if (process.env.NODE_ENV === "development") {
        /* istanbul ignore next */
        console.log(response);
      }
      response.forEach((role: string) => {
        this.subject.roles.push(role);
      });
    });
  }

  /**
   * Request the authorization.
   * @returns The response of the authorization request.
   */
  private async _requestAuthorization() {
    const url = new URL(this.path);
    url.searchParams.append("username", this.subjectName);

    return await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Authorization failed.");
    });
  }
}
