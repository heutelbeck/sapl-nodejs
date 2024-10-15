import { Readable } from "stream";
import { Decision } from "../Decision";
import { RemotePdp } from "../RemotePdp";
import { TextHelper } from "./TextHelper";
import { isObservable, Observable } from "rxjs";
import { IncomingMessage, ServerResponse } from "http";
import { PdpReturnStatus } from "../../interfaces/Pdp";
import { Frameworks } from "../../interfaces/Frameworks";
import { HttpException, HttpStatus } from "@nestjs/common";
import { WrapperStreamHelper } from "./WrapperStreamHelper";
import { WrapperStream } from "../../interfaces/WrapperStream";
import { WrapperObservableHelper } from "./WrapperObservableHelper";
import { WrapperObservable } from "../../interfaces/WrapperObservable";
import { DecoratorCustomizing } from "../../types/DecoratorCustomizing";
import { ReactiveConstraintHandlerBundle } from "../constraints/ReactiveConstraintHandlerBundle";
import { AuthorizationSubscriptionBuilderService } from "../AuthorizationSubscriptionBuilderService";

/**
 * Helper class for decorators.
 */
export class DecoratorHelper {
  private static readonly obligationHandled: boolean;
  private static readonly preEnforceArguments: DecoratorCustomizing = [];
  private static readonly preEnforceProxy: ProxyConstructor;
  private static readonly postEnforceArguments: DecoratorCustomizing = [];
  private static readonly postEnforceProxy: ProxyConstructor;
  private static postEnforceQueryResult: any;
  private static readonly enforceTillDeniedArguments: DecoratorCustomizing = [];
  private static readonly enforceTillDeniedProxy: ProxyConstructor;
  private static readonly enforceRecoverableIfDeniedArguments: DecoratorCustomizing =
    [];
  private static readonly enforceRecoverableIfDeniedProxy: ProxyConstructor;
  private static readonly enforceDropWhileDeniedArguments: DecoratorCustomizing =
    [];
  private static readonly enforceDropWhileDeniedProxy: ProxyConstructor;
  private static bundle: ReactiveConstraintHandlerBundle<any>;

  //---------------------------------------------------------------------------------------------------------------------
  // public Methods
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Set the custom PreEnforce Arguments
   * @param propertyKey propertyKey of the method
   * @param args The Arguments of the decorator
   */
  public static setPreEnforceArguments(propertyKey: string, args: any[]) {
    if (Array.isArray(args) && args.length > 0) {
      DecoratorHelper.preEnforceArguments.push({
        propertyKey: propertyKey,
        customizing: args,
      });
    }
  }

  /**
   * Get the custom PreEnforce Arguments
   * @param originalMethodName The original method name
   * @returns The custom PreEnforce Arguments
   */
  public static getPreEnforceArguments(
    originalMethodName: string
  ): DecoratorCustomizing {
    return DecoratorHelper.preEnforceArguments.filter(
      (arg) => arg.propertyKey === originalMethodName
    );
  }

  /**
   * Get the proxy class of the PreEnforce base class reference
   * @returns The proxy class
   */
  public static getPreEnforxceProxy() {
    return DecoratorHelper.preEnforceProxy;
  }

  /**
   * Set the custom PostEnforce Arguments
   * @param propertyKey propertyKey of the method
   * @param args The Arguments of the decorator
   */
  public static setPostEnforceArguments(propertyKey: string, args: any[]) {
    if (Array.isArray(args) && args.length > 0) {
      DecoratorHelper.postEnforceArguments.push({
        propertyKey: propertyKey,
        customizing: args,
      });
    }
  }

  /**
   * Get the custom PostEnforce Arguments
   * @param originalMethodName The original method name
   * @returns The custom PostEnforce Arguments
   */
  public static getPostEnforceArguments(
    originalMethodName: string
  ): DecoratorCustomizing {
    return DecoratorHelper.postEnforceArguments.filter(
      (arg) => arg.propertyKey === originalMethodName
    );
  }

  /**
   * Get the proxy class of the PostEnforce base class reference
   * @returns The proxy class
   */
  public static getPostEnforceProxy() {
    return DecoratorHelper.postEnforceProxy;
  }

  /**
   * Set the Query Result of the PostEnforce original method
   * @param queryResult The query result
   */
  public static setPostEnforceQueryResult(queryResult: any) {
    DecoratorHelper.postEnforceQueryResult = queryResult;
  }

  /**
   * Get the Query Result of the PostEnforce original method
   * @returns The custom PostEnforce Query Result
   */
  public static getPostEnforceQueryResult() {
    return DecoratorHelper.postEnforceQueryResult;
  }

  /**
   * Set the custom EnforceTillDenied Arguments
   * @param propertyKey propertyKey of the method
   * @param args The Arguments of the decorator
   */
  public static setEnforceTillDeniedArguments(
    propertyKey: string,
    args: any[]
  ) {
    if (Array.isArray(args) && args.length > 0) {
      DecoratorHelper.enforceTillDeniedArguments.push({
        propertyKey: propertyKey,
        customizing: args,
      });
    }
  }

  /**
   * Get the custom EnforceTillDenied Arguments
   * @param originalMethodName The original method name
   * @returns The custom EnforceTillDenied Arguments
   */
  public static getEnforceTillDeniedArguments(
    originalMethodName: string
  ): DecoratorCustomizing {
    return DecoratorHelper.enforceTillDeniedArguments.filter(
      (arg) => arg.propertyKey === originalMethodName
    );
  }

  /**
   * Get the proxy class of the EnforceTillDenied base class reference
   * @returns The proxy class
   */
  public static getEnforceTillDeniedProxy(originalMethodName: string) {
    return DecoratorHelper.enforceTillDeniedProxy;
  }

  /**
   * Set the custom EnforceRecoverableIfDenied Arguments
   * @param propertyKey propertyKey of the method
   * @param args The Arguments of the decorator
   */
  public static setEnforceRecoverableIfDeniedArguments(
    propertyKey: string,
    args: any[]
  ) {
    if (Array.isArray(args) && args.length > 0) {
      DecoratorHelper.enforceRecoverableIfDeniedArguments.push({
        propertyKey: propertyKey,
        customizing: args,
      });
    }
  }

  /**
   * Get the custom EnforceRecoverableIfDenied Arguments
   * @param originalMethodName The original method name
   * @returns The custom EnforceRecoverableIfDenied Arguments
   */
  public static getEnforceRecoverableIfDeniedArguments(
    originalMethodName: string
  ): DecoratorCustomizing {
    return DecoratorHelper.enforceRecoverableIfDeniedArguments.filter(
      (arg) => arg.propertyKey === originalMethodName
    );
  }

  /**
   * Get the proxy class of the EnforceRecoverableIfDenied base class reference
   * @returns The proxy class
   */
  public static getEnforceRecoverableIfDeniedProxy() {
    return DecoratorHelper.enforceRecoverableIfDeniedProxy;
  }

  /**
   * Set the custom EnforceDropWhileDenied Arguments
   * @param propertyKey propertyKey of the method
   * @param args The Arguments of the decorator
   */
  public static setEnforceDropWhileDeniedArguments(
    propertyKey: string,
    args: any[]
  ) {
    if (Array.isArray(args) && args.length > 0) {
      DecoratorHelper.enforceDropWhileDeniedArguments.push({
        propertyKey: propertyKey,
        customizing: args,
      });
    }
  }

  /**
   * Get the custom EnforceDropWhileDenied Arguments
   * @param originalMethodName The original method name
   * @returns The custom EnforceDropWhileDenied Arguments
   */
  public static getEnforceDropWhileDeniedArguments(
    originalMethodName: string
  ): DecoratorCustomizing {
    return DecoratorHelper.enforceDropWhileDeniedArguments.filter(
      (arg) => arg.propertyKey === originalMethodName
    );
  }

  /**
   * Get the proxy class of the EnforceDropWhileDenied base class reference
   * @returns The proxy class
   */
  public static getEnforceDropWhileDeniedProxy() {
    return DecoratorHelper.enforceDropWhileDeniedProxy;
  }

  /**
   * Sends a forbidden response to the client.
   * @param args Arguments to check for ServerResponse objects.
   */
  public static sendForbiddenResponse(args: any[]) {
    args.forEach((arg) => {
      if (arg instanceof ServerResponse) {
        arg.statusCode = 403;
        arg.end("403 - FORBIDDEN");
      }
    });
  }

  /**
   * Sends a not applicable response to the client.
   * @param args Arguments to check for ServerResponse objects.
   */
  public static sendNotApplicableResponse(args: any[]) {
    args.forEach((arg) => {
      if (arg instanceof ServerResponse) {
        arg.statusCode = 500;
        arg.end(`500 - ERROR '${PdpReturnStatus.NOT_APPLICABLE}' `);
      }
    });
  }

  /**
   * Sends a indeterminate response to the client.
   * @param args Arguments to check for ServerResponse objects.
   */
  public static sendIndeterminateResponse(args: any[]) {
    args.forEach((arg) => {
      if (arg instanceof ServerResponse) {
        arg.statusCode = 404;
        arg.end(`404 - NOT FOUND '${PdpReturnStatus.INDETERMINATE}' `);
      }
    });
  }

  /**
   * Handles the chunk of data from the remote PDP.
   * @param chunk chunk of data
   * @param args object which contains the parameters of the method e.g. ServerResponse
   * @param framework framework used e.g. NETSJS
   * @returns true if everything could be handled, false or an exception if not
   */
  public static handleDecision(
    decision: Decision,
    args: any[],
    framework?: Frameworks
  ) {
    // logs for development
    if (process.env.NODE_ENV === "development") {
      console.log(JSON.stringify(decision));
    }

    // DENY handling
    if (decision.getDecision() === PdpReturnStatus.DENY) {
      // If the decision is to deny, send a forbidden response
      if (framework === Frameworks.NETSJS) {
        return new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      } else {
        DecoratorHelper.sendForbiddenResponse(args);
      }
      return false;
    }
    // NOT_APPLICABLE handling
    else if (decision.getDecision() === PdpReturnStatus.NOT_APPLICABLE) {
      // If the decision is not applicable, send a not applicable response
      if (framework === Frameworks.NETSJS) {
        return new HttpException("Not Applicable", HttpStatus.NOT_IMPLEMENTED);
      } else {
        DecoratorHelper.sendNotApplicableResponse(args);
      }
      return false;
    } else if (decision.getDecision() === PdpReturnStatus.INDETERMINATE) {
      if (framework === Frameworks.NETSJS) {
        return new HttpException("Indeterminate", HttpStatus.NOT_FOUND);
      } else {
        DecoratorHelper.sendIndeterminateResponse(args);
      }
      return false;
    }
    // PERMIT handling
    else if (decision.getDecision() === PdpReturnStatus.PERMIT) {
      return true;
    }
  }

  /**
   * Creates a new instance of the WrapperStreamHelper.
   * @param config wrapperStreamConfig
   * @returns WrapperStreamHelper
   */
  public static createWrapperStreamHelper(
    config?: WrapperStream["wrapperStreamConfig"]
  ) {
    return new WrapperStreamHelper({
      readDataAllowed: false,
      handleAccessDenied: !!config?.handleAccessDenied,
      killIfDenied: !!config?.killIfDenied,
    });
  }

  public static createWrapperObservableHelper(
    config?: WrapperObservable["wrapperObservableConfig"]
  ) {
    return new WrapperObservableHelper({
      readDataAllowed: !!config?.readDataAllowed,
      handleAccessDenied: !!config?.handleAccessDenied,
      killIfDenied: !!config?.killIfDenied,
    });
  }

  /**
   * Attaches the event listeners to the stream event **data**.
   * @param args object which contains the parameters of the method e.g. ServerResponse
   * @param stream the stream to attach the event listeners
   * @param remotePdp the instance of the remote PDP
   * @param wrapperStreamHelper the instance of the wrapperStreamHelper
   * @param wrapperObservableHelper the instance of the wrapperObservableHelper
   * @param framework framework used e.g. NETSJS
   */
  public static async attachOnDecisionStream(
    args: any[],
    stream: NodeJS.ReadableStream,
    remotePdp: RemotePdp,
    wrapperStreamHelper: WrapperStreamHelper,
    wrapperObservableHelper: WrapperObservableHelper<any>,
    framework?: Frameworks
  ) {
    let result: any;

    //new Promise is needed to catch the error within the stream.on("data") event
    await new Promise<void>((resolve, reject) => {
      stream.on("data", (decisionData) => {
        let decision: Decision;
        const decodeData = TextHelper.decodeData(decisionData);
        // check to avoid errors
        // server sends keep alive messages
        if (decodeData[Decision.DECISION] !== undefined) {
          decision = new Decision(decodeData);

          DecoratorHelper.bundle = remotePdp
            .getConstraintEnforcementService()
            .reactiveTypeBundleFor(decision);

          DecoratorHelper.bundle.handleOnDataSignalConstraints(decision);

          wrapperStreamHelper?.setBundle(DecoratorHelper.bundle);
          wrapperObservableHelper?.setBundle(DecoratorHelper.bundle);

          const isPermitted = DecoratorHelper.handleDecision(
            decision,
            args,
            framework
          );

          if (isPermitted === true) {
            wrapperStreamHelper?.setReadDataAllowed(true);
            wrapperObservableHelper?.setReadDataAllowed(true);
            resolve();
          } else {
            wrapperStreamHelper?.setReadDataAllowed(false);
            wrapperObservableHelper?.setReadDataAllowed(false);
            // HttpException
            reject(isPermitted);
          }
        }
      });
    }).catch((error) => {
      result = error;
    });
    return result;
  }

  /**
   * Attaches the event listeners to the stream event **end**.
   * @param stream the stream to attach the event listeners
   */
  public static attachOnEndStream(stream: NodeJS.ReadableStream) {
    stream.on("end", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("Lesen abgeschlossen.");
      }
    });
  }

  /**
   * Attaches the event listeners to the stream event **error**.
   * @param stream the stream to attach the event listeners
   * @param wrapperStreamHelper the instance of the wrapperStreamHelper
   */
  public static attachOnErrorStream(
    stream: NodeJS.ReadableStream,
    wrapperStreamHelper?: WrapperStreamHelper
  ) {
    stream.on("error", (err) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Fehler beim Lesen:", err);
      }
      wrapperStreamHelper?.setReadDataAllowed(false);
    });
  }

  /**
   * Calls the remote PDP to decide on the authorization subscription.
   * @param remotePdp the instance of the remote PDP
   * @param originalMethod the original method
   * @param decoratorArguments the arguments of the decorator to customize a PEP
   * @param message the incoming message (request)
   * @param clazz the clazz reference
   * @returns {Promise<NodeJS.ReadableStream>} Returns a stream
   */
  public static async remotePdpDecide(
    remotePdp: RemotePdp,
    originalMethod: any,
    decoratorArguments?: DecoratorCustomizing,
    message?: IncomingMessage,
    clazz?: ProxyConstructor
  ) {
    return remotePdp.decide(
      await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
        remotePdp.getAuthorizationManager(),
        originalMethod.name,
        decoratorArguments,
        message,
        clazz
      )
    );
  }

  /**
   * Attaches the event listeners to the stream events.
   * @param originalStream the original stream
   */
  private static attachSignalHandlersToStream(originalStream: Readable) {
    originalStream.on("data", (data) => {
      DecoratorHelper.bundle?.handleOnDataSignalConstraints(data);
      DecoratorHelper.bundle?.handleAllOnNextConstraints(data);
    });

    originalStream.on("end", () => {
      DecoratorHelper.bundle?.handleOnEndSignalConstraints();
    });

    originalStream.on("error", (error) => {
      DecoratorHelper.bundle?.handleOnErrorSignalConstraints(error);
      DecoratorHelper.bundle?.handleAllOnErrorConstraints(error);
    });

    originalStream.on("close", () => {
      DecoratorHelper.bundle?.handleonCloseSignalConstraints();
    });

    originalStream.on("pause", () => {
      DecoratorHelper.bundle?.handleOnPauseSignalConstraints();
    });

    originalStream.on("readable", () => {
      let data;
      while ((data = originalStream.read()) !== null) {
        console.log(TextHelper.decodeData(data));
      }
      DecoratorHelper.bundle?.handleOnReadableSignalConstraints();
    });

    originalStream.on("resume", () => {
      DecoratorHelper.bundle?.handleOnResumeSignalConstraints();
    });
  }

  /**
   * Attaches the event listeners to the stream events.
   * It evaluates if the stream is an Observable or a Readable Stream.
   * @param stream the stream to attach the event listeners
   * @param wrapperStreamHelper the instance of the wrapperStreamHelper
   * @param wrapperObservableHelper the instance of the wrapperObservableHelper
   */
  public static attachHandlersToStream(
    stream: any,
    wrapperStreamHelper?: WrapperStreamHelper,
    wrapperObservableHelper?: WrapperObservableHelper<any>
  ) {
    if (isObservable(stream)) {
      DecoratorHelper.attachHandlersToObservable(stream);
      wrapperObservableHelper.setSource(stream);
      return wrapperObservableHelper;
      // return stream;
    } else if (stream instanceof Readable) {
      DecoratorHelper.attachSignalHandlersToStream(stream);
      stream.pipe(wrapperStreamHelper);
      return wrapperStreamHelper;
    }
  }

  /**
   * Attaches the event listeners to the observable events.
   * @param returnValue the observable to attach the event listeners
   */
  public static attachHandlersToObservable(returnValue: Observable<any>) {
    // only good for side effects cause it access Data via subscribe
    returnValue.subscribe({
      next: (data) => {},
      error: (error) => {},
      complete: () => {},
    });
  }

  /**
   * Searches for the incoming message in the arguments.
   * @param args The arguments of the method
   * @returns The incoming message
   */
  public static searchForIncommingMessage(args: any[]) {
    let message: IncomingMessage | undefined;
    args.forEach((arg) => {
      if (arg instanceof IncomingMessage) {
        message = arg;
        return;
      }
    });
    return message;
  }
}
