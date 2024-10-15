import { IncomingMessage } from "http";
import { OsHelper } from "./helper/OsHelper";
import { DecoratorHelper } from "./helper/DecoratorHelper";
import { AuthorizationManager } from "./AuthorizationManager";
import { DecoratorCustomizing } from "../types/DecoratorCustomizing";
import { AuthorizationSubscription } from "./AuthorizationSubscription";

/**
 * Service to build an authorization subscription.
 */
export class AuthorizationSubscriptionBuilderService {
  private static instance: AuthorizationSubscriptionBuilderService;

  private constructor() {}

  /**
   * Get the instance of the AuthorizationSubscriptionBuilderService.
   * @returns The instance of the AuthorizationSubscriptionBuilderService.
   */
  public static getInstance(): AuthorizationSubscriptionBuilderService {
    if (!AuthorizationSubscriptionBuilderService.instance) {
      AuthorizationSubscriptionBuilderService.instance =
        new AuthorizationSubscriptionBuilderService();
    }

    return AuthorizationSubscriptionBuilderService.instance;
  }

  /**
   * Build an authorization subscription.
   * @param authorizationManager The authorization manager.
   * @param methodName The original method name.
   * @param decoratorArguments The decorator arguments to customize a PEP.
   * @param message The incoming message (request).
   * @param clazz The decorator proxy.
   * @returns The authorization subscription.
   */
  public static async buildAuthorizationSubscription(
    authorizationManager: AuthorizationManager,
    methodName: any,
    decoratorArguments: DecoratorCustomizing,
    message: IncomingMessage,
    clazz?: any
  ): Promise<AuthorizationSubscription> {
    let subject = await AuthorizationSubscriptionBuilderService.retrieveSubject(
      authorizationManager,
      methodName,
      decoratorArguments,
      clazz,
      message
    );

    let action = AuthorizationSubscriptionBuilderService.retrieveAction(
      methodName,
      decoratorArguments,
      clazz
    );

    let resource = AuthorizationSubscriptionBuilderService.retrieveResource(
      methodName,
      decoratorArguments,
      clazz
    );

    AuthorizationSubscriptionBuilderService.checkForValueInOtherObject(
      subject,
      action,
      resource
    );

    return AuthorizationSubscription.create(subject, action, resource);
  }

  /**
   * Retrieve the resource object.
   * @param methodName The original method name.
   * @param decoratorArguments The decorator arguments to customize a PEP.
   * @param clazz The decorator proxy.
   * @returns The resource object.
   */
  private static retrieveResource(
    methodName: any,
    decoratorArguments: DecoratorCustomizing,
    clazz: any
  ) {
    return AuthorizationSubscriptionBuilderService.getAttributeFromDecoratorArguments(
      decoratorArguments,
      "resource",
      clazz,
      methodName
    );
  }

  /**
   * Retrieve the action object.
   * @param methodName The original method name.
   * @param decoratorArguments The decorator arguments to customize a PEP.
   * @param clazz The decorator proxy.
   * @returns The resource object.
   */
  private static retrieveAction(
    methodName: any,
    decoratorArguments: DecoratorCustomizing,
    clazz: any
  ) {
    if (decoratorArguments.length === 0) {
      return methodName;
    }
    // SonarCloud: Use an object spread instead of `Object.assign` eg: `{ ...foo }`.
    // return Object.assign(
    //   { name: methodName },
    //   AuthorizationSubscriptionBuilderService.getAttributeFromDecoratorArguments(
    //     decoratorArguments,
    //     "action",
    //     clazz,
    //     methodName
    //   )
    // );
    return {
      name: methodName,
      ...AuthorizationSubscriptionBuilderService.getAttributeFromDecoratorArguments(
        decoratorArguments,
        "action",
        clazz,
        methodName
      ),
    };
  }

  /**
   * Retrieve the subject object.
   * @param authorizationManager The authorization manager.
   * @param methodName The original method name.
   * @param decoratorArguments The decorator arguments to customize a PEP.
   * @param clazz The decorator proxy.
   * @param message The incoming message (request).
   * @returns The resource object.
   */
  private static async retrieveSubject(
    authorizationManager: AuthorizationManager,
    methodName: any,
    decoratorArguments: DecoratorCustomizing,
    clazz: any,
    message: IncomingMessage
  ) {
    let subject =
      await authorizationManager.buildSubjectForAuhorizationSubscription();

    if (subject.name === undefined) {
      subject.name = OsHelper.getOsUsername();
    }

    //@ts-expect-error - user property exists in nestjs request object
    if (message?.user)
      //@ts-expect-error - user property exists in nestjs request object
      subject = Object.assign(subject, { userinformation: message?.user });

    if (decoratorArguments.length === 0 || decoratorArguments === undefined) {
      return subject;
    }

    //merge subject with subject from decorator arguments
    return Object.assign(
      subject,
      AuthorizationSubscriptionBuilderService.getAttributeFromDecoratorArguments(
        decoratorArguments,
        "subject",
        clazz,
        methodName
      )
    );
  }

  /**
   * Get an attribute from the decorator arguments.
   * @param decoratorArguments The decorator arguments to customize a PEP.
   * @param attributeName The attribute name (subject, action or resource).
   * @param clazz The decorator proxy.
   * @param methodName The original method name.
   * @returns The attribute.
   */
  private static getAttributeFromDecoratorArguments(
    decoratorArguments: DecoratorCustomizing,
    attributeName: string,
    clazz: any,
    methodName: any
  ) {
    let attribute = {};
    //create a copy to avoid changing the original object
    let decoratorArgumentsCopy = JSON.parse(
      JSON.stringify(
        decoratorArguments.filter((arg) => arg.propertyKey === methodName)
      )
    );
    decoratorArgumentsCopy?.forEach((arg) => {
      arg.customizing.forEach((customizing) => {
        try {
          if (JSON.stringify(attribute) === "{}") {
            attribute = customizing[attributeName];
            return;
          }
          attribute = Object.assign(attribute, customizing[attributeName]);
        } catch (error) {
          attribute = {};
        }
      });
    });
    AuthorizationSubscriptionBuilderService.checkForClassReference(
      attribute,
      clazz
    );
    return attribute;
  }

  /**
   * Check if the attribute is a class reference and replace it with the class reference.
   * @param attribute The attribute to check.
   * @param clazz The decorator proxy.
   */
  private static checkForClassReference(attribute: any, clazz: any) {
    for (const key in attribute) {
      if (
        typeof attribute[key] === "string" &&
        attribute[key].startsWith("#queryResult")
      ) {
        attribute[key] = DecoratorHelper.getPostEnforceQueryResult();
      } else if (
        typeof attribute[key] === "string" &&
        attribute[key].startsWith("#")
      ) {
        const splitValue = attribute[key].split(".", 2);
        const remainingPart = splitValue[1].replace("()", "");
        if (typeof clazz[remainingPart] === "function") {
          attribute[key] = clazz[remainingPart]();
        }
      }
    }
  }

  /**
   * Check if one of the objects have a value that is a key in another object. If so, replace the value with the key.
   * @param subject The subject object
   * @param action The action object
   * @param resource The resource object
   */
  // NOSONAR
  private static checkForValueInOtherObject(
    subject: object,
    action: object,
    resource: object
  ) {
    // prettier-ignore
    for (const key in subject) {
      if (typeof subject[key] === "string" && action.hasOwnProperty(subject[key]) && action[subject[key]] !== key.toString()) {
        subject[key] = action[subject[key]];
      } else if (typeof subject[key] === "string" && resource.hasOwnProperty(subject[key]) && resource[subject[key]] !== key.toString()) {
        subject[key] = resource[subject[key]];
      }
    }

    // prettier-ignore
    for (const key in action) {
      if (typeof action[key] === "string" && subject.hasOwnProperty(action[key]) && subject[action[key]] !== key.toString()) {
        action[key] = subject[action[key]];
      } else if (typeof action[key] === "string" && resource.hasOwnProperty(action[key]) && resource[action[key]] !== key.toString()) {
        action[key] = resource[action[key]];
      }
    }

    // prettier-ignore
    for (const key in resource) {
      if (typeof resource[key] === "string" && subject.hasOwnProperty(resource[key]) && subject[resource[key]] !== key.toString()) {
        resource[key] = subject[resource[key]];
      } else if (typeof resource[key] === "string" && action.hasOwnProperty(resource[key]) && action[resource[key]] !== key.toString()) {
        resource[key] = action[resource[key]];
      }
    }
  }
}
