import fetch from "node-fetch";
import * as https from "https";
import { Readable } from "stream";
import { Pdp, PdpType } from "../interfaces/Pdp";
import {
  AuthorizationSubscription,
  AuthorizationSubscriptionType,
} from "../interfaces/AuthorizationSubscription";
import { AuthorizationManager } from "./AuthorizationManager";
import { ExponentialBackoffStream } from "./helper/ExponentialBackoffStream";
import { ConstraintEnforcementService } from "./constraints/ConstraintEnforcementService";

/**
 * Class to establish a connection to the SAPL server.
 * @implements Pdp
 */
export class RemotePdp implements Pdp {
  private username: string;
  private password: string;
  private apiKeyToken: string;
  private static remotePdp: RemotePdp;
  private url: string;
  private accessToken: string;
  private authorizationManager: AuthorizationManager;
  private static constraintEnforcementService: ConstraintEnforcementService;
  private exponentialBackoff: number = 2000;
  private exponentialBackoffStream: ExponentialBackoffStream;

  /**
   * Private constructor for instantiating the class.
   */
  private constructor() {
    RemotePdp.constraintEnforcementService = new ConstraintEnforcementService();
  }

  /**
   * Factory Method for instantiating the class.
   * @param url SAPL Server URL
   * @param username Username for Basic Authorization. Is also used as a Subject in Request.
   * @param password Password for Basic Authorization.
   * @param apiKey API Key for Authorization.
   * @param accessToken Access Token for Authorization.
   * @returns Object Instance
   */
  public static create() {
    if (RemotePdp.remotePdp instanceof RemotePdp) {
      return RemotePdp.remotePdp;
    } else {
      RemotePdp.remotePdp = new RemotePdp();
      return RemotePdp.remotePdp;
    }
  }

  public static destroy() {
    RemotePdp.remotePdp = null;
    RemotePdp.constraintEnforcementService = null;
  }

  //---------------------------------------------------------------------------------------------------------------------
  // Getter and Setter
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Retrieves the RemotePdp associated with the current instance.
   * @returns The RemotePdp associated with the current instance.
   */
  public static getRemotePdp() {
    return RemotePdp.remotePdp;
  }

  /**
   * Get the username.
   * @returns The username.
   */
  public getUsername() {
    return this.username;
  }

  /**
   * Set the username.
   * @param username The username.
   * @returns RemotePdp
   */
  public setUsername(username: string) {
    this.username = username;
    this.authorizationManager.setSubjectName(username);
    return this;
  }

  /**
   * Get the AuthorizationManager.
   * @returns The AuthorizationManager.
   */
  public getAuthorizationManager() {
    return this.authorizationManager;
  }

  /**
   * Set the AuthorizationManager.
   * @param path The path of the AuthorizationManager request.
   * @returns RemotePdp
   */
  public setAuthorizationManager(path: string) {
    this.authorizationManager = new AuthorizationManager(path);
    return this;
  }

  /**
   * Set the host of the SAPL server.
   * @param host The host of the SAPL server.
   * @returns RemotePdp
   */
  public host(host: string) {
    this.url = host;
    return this;
  }

  /**
   * Set the port of the SAPL server.
   * @param port The port of the SAPL server.
   * @returns RemotePdp
   */
  public port(port: number) {
    this.url = `${this.url}:${port}`;
    return this;
  }

  /**
   * Set the credentials for basic auth.
   * @param username The username for basic auth
   * @param password The password for basic auth
   * @returns RemotePdp
   */
  public basicAuth(username: string, password: string) {
    this.username = username;
    this.password = password;
    return this;
  }

  /**
   * Set the Bearer Token for the request.
   * @param key The Bearer Token for the request
   * @returns RemotePdp
   */
  public bearerToken(token: string) {
    this.accessToken = token;
    return this;
  }

  /**
   * Set the API key for the request.
   * @param key The API key for the request
   * @returns RemotePdp
   */
  public apiKey(key: string) {
    this.apiKeyToken = key;
    return this;
  }

  /**
   * Get the ConstraintEnforcementService
   * @returns The ConstraintEnforcementService
   */
  public getConstraintEnforcementService() {
    return RemotePdp.constraintEnforcementService;
  }

  //---------------------------------------------------------------------------------------------------------------------
  // public Methods
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Request to the API to get the decision of the PDP.
   * @param body The AuthorizationSubscription
   * @param url The URL to be used for the request
   * @returns The decision of the PDP as a readable stream
   */
  public async multiDecide(
    body: AuthorizationSubscription,
    url?: string
  ): Promise<NodeJS.ReadableStream> {
    let stream: NodeJS.ReadableStream;
    await this._fetch(body, this._buildUrl(url, PdpType.MULTI))
      .then((response) => {
        /* istanbul ignore next */
        if (process.env.NODE_ENV === "development") {
          console.log(response.status);
        }

        /* istanbul ignore next */ // tested but cause of the delay not in coverage
        if (this.exponentialBackoffStream) {
          // Create a new Readable stream for previousDecidisionStream
          this.exponentialBackoffStream.emitDecisionStream(
            response.body as Readable
          );
          return;
        }

        if (response.status === 200) {
          stream = response.body;
        }

        if (response.status !== 200) {
          if (process.env.NODE_ENV === "development") {
            console.error("Fehler:", response.status);
          }
        }
      })
      .catch(async (error) => {
        console.error(error);
        if (!this.exponentialBackoffStream) {
          stream = this.exponentialBackoffStream =
            new ExponentialBackoffStream();
        }
        // Queue the second call to decide with exponential backoff
        /* istanbul ignore next */ // tested but cause of the delay not in coverage
        setTimeout(() => {
          this.exponentialBackoff *= 2;
          if (this.exponentialBackoff <= 50000) {
            this.decide(body, url);
          }
        }, this.exponentialBackoff);
      });
    return stream;
  }

  /**
   * Request to the API to get the decision of the PDP.
   * @param body The AuthorizationSubscription
   * @param url The URL to be used for the request
   * @returns The decision of the PDP as a readable stream
   */
  public async decideOnce(
    body: AuthorizationSubscription,
    url?: string
  ): Promise<NodeJS.ReadableStream> {
    let stream: ExponentialBackoffStream | NodeJS.ReadableStream;
    await this._fetch(body, this._buildUrl(url, PdpType.SINGLE))
      .then((response) => {
        /* istanbul ignore next */
        if (process.env.NODE_ENV === "development") {
          console.log(response.status);
        }

        /* istanbul ignore next */ // tested but cause of the delay not in coverage
        if (this.exponentialBackoffStream) {
          // Create a new Readable stream for previousDecidisionStream
          this.exponentialBackoffStream.emitDecisionStream(
            response.body as Readable
          );
          return;
        }

        if (response.status === 200) {
          stream = response.body;
        }

        if (response.status !== 200) {
          if (process.env.NODE_ENV === "development") {
            console.error("Fehler:", response.status);
          }
        }
      })
      .catch(async (error) => {
        console.error(error);
        if (!this.exponentialBackoffStream) {
          stream = this.exponentialBackoffStream =
            new ExponentialBackoffStream();
        }
        // Queue the second call to decide with exponential backoff
        /* istanbul ignore next */ // tested but cause of the delay not in coverage
        setTimeout(() => {
          this.exponentialBackoff *= 2;
          if (this.exponentialBackoff <= 50000) {
            this.decide(body, url);
          }
        }, this.exponentialBackoff);
      });
    return stream;
  }

  /**
   * Request to the API to get the decision of the PDP.
   * @param body The AuthorizationSubscription
   * @param url The URL to be used for the request
   * @returns The decision of the PDP as a readable stream
   */
  public async decide(
    body: AuthorizationSubscription,
    url?: string
  ): Promise<NodeJS.ReadableStream> {
    let stream: ExponentialBackoffStream | NodeJS.ReadableStream;
    if (
      body.getAuthorizationSubscriptionType() ===
      AuthorizationSubscriptionType.SINGLE
    ) {
      await this._fetch(body, this._buildUrl(url, PdpType.SINGLE_STREAM))
        .then((response) => {
          /* istanbul ignore next */
          if (process.env.NODE_ENV === "development") {
            console.log(response.status);
          }

          /* istanbul ignore next */ // tested but cause of the delay not in coverage
          if (this.exponentialBackoffStream) {
            // Create a new Readable stream for previousDecidisionStream
            this.exponentialBackoffStream.emitDecisionStream(
              response.body as Readable
            );
            return;
          }

          if (response.status === 200) {
            stream = response.body;
          }
          if (response.status !== 200) {
            if (process.env.NODE_ENV === "development") {
              console.error("Fehler:", response.status);
            }
          }
        })
        .catch(async (error) => {
          console.error(error);
          if (!this.exponentialBackoffStream) {
            stream = this.exponentialBackoffStream =
              new ExponentialBackoffStream();
          }
          // Queue the second call to decide with exponential backoff
          /* istanbul ignore next */ // tested but cause of the delay not in coverage
          setTimeout(() => {
            this.exponentialBackoff *= 2;
            if (this.exponentialBackoff <= 50000) {
              this.decide(body, url);
            }
          }, this.exponentialBackoff);
        });
      return stream;
    }
  }

  //---------------------------------------------------------------------------------------------------------------------
  // private Methods
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Builds the URL with the decisionEndpoint.
   * @param url URL to be used for the request
   * @param decisionEndpoint decisionEndpoint to be used for the request (SINGLE or MULTI)
   * @returns URL with decisionEndpoint
   */
  private _buildUrl(url: string, decisionEndpoint: PdpType) {
    return (url !== undefined ? url : this.url) + decisionEndpoint;
  }

  /**
   * Performs a POST request with the given body to the specified URL.
   * If a new URL is provided, it overrides the default URL.
   * If the URL is HTTPS, it utilizes a custom HTTPS agent to handle self-signed certificates.
   *
   * @param body The body of the POST request.
   * @param url The new URL to which the request should be sent.
   * @returns A Promise that resolves with the response to the POST request.
   */
  private _fetch(body: any, url: string) {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    /* istanbul ignore next */ // unittests are without https
    if (url.includes("https")) {
      return fetch(url, {
        method: "POST",
        headers: this._buildFetchHeader(),
        body: body.asString(),
        agent: httpsAgent,
      });
    } else if (url.includes("http")) {
      return fetch(url, {
        method: "POST",
        headers: this._buildFetchHeader(),
        body: body.asString(),
      });
    }
  }

  /**
   * Builds the headers object for the fetch request based on the authentication credentials.
   * If either an access token or an API key is provided, it includes the Authorization header with the appropriate value.
   * If neither an access token nor an API key is provided, it includes the Authorization header with a Basic authentication token generated from the username and password.
   *
   * @returns The headers object for the fetch request.
   */
  private _buildFetchHeader() {
    if (this.accessToken || this.apiKeyToken) {
      const accessKey =
        this.accessToken !== "" ? this.accessToken : this.apiKeyToken;

      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessKey}`,
      };
    } else {
      return {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
      };
    }
  }
}
