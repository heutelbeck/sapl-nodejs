import { Readable } from "stream";
import { isObservable } from "rxjs";
import { Decision } from "../../classes/Decision";
import { RemotePdp } from "../../classes/RemotePdp";
import { Frameworks } from "../../interfaces/Frameworks";
import { HttpException, HttpStatus } from "@nestjs/common";
import { TextHelper } from "../../classes/helper/TextHelper";
import { DecoratorHelper } from "../../classes/helper/DecoratorHelper";
import { AccessDeniedException } from "../../classes/constraints/providers/AccessDeniedException";
import { BlockingConstraintHandlerBundle } from "../../classes/constraints/BlockingConstraintHandlerBundle";
import { AuthorizationSubscriptionBuilderService } from "../../classes/AuthorizationSubscriptionBuilderService";

let decoratorArguments: any;

/**
 * This decorator is used to enforce the access control policy decision after the method execution.
 * The Client will receive a non-recoverable error in case of a denied access.
 * @returns MethodDecorator
 */
export function PostEnforce(...args: any[]): MethodDecorator {
  decoratorArguments = args;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    DecoratorHelper.setPostEnforceArguments(propertyKey, decoratorArguments);

    const wrapperObservableHelper =
      DecoratorHelper.createWrapperObservableHelper({ readDataAllowed: true });

    let result: any = undefined;

    descriptor.value = async function (...args: any[]) {
      result = originalMethod.apply(this, args);

      // Check if the result is a Promise
      if (result instanceof Promise) {
        result = await result;
      }

      DecoratorHelper.setPostEnforceQueryResult(result);

      let remotePdp = RemotePdp.getRemotePdp();

      const promise = remotePdp.decideOnce(
        await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
          remotePdp.getAuthorizationManager(),
          originalMethod.name,
          DecoratorHelper.getPostEnforceArguments(originalMethod.name),
          DecoratorHelper.searchForIncommingMessage(args),
          this
        )
      );

      /**
       * IMPORTANT: This is a workaround to blocking the runtime until the decision data is received.
       * This is necessary because the original method may only be executed if the on-Event receives data.
       * Without this workaround, the NestJS runtime would go on and the result would be empty.
       */
      await new Promise<void>((resolve, reject) => {
        promise.then(async (stream) => {
          stream.on("data", async (decisionData) => {
            let decision = new Decision(TextHelper.decodeData(decisionData));
            let bundle: BlockingConstraintHandlerBundle<any>;

            try {
              bundle = remotePdp
                .getConstraintEnforcementService()
                .blockingPostEnforceBundleFor(decision);
            } catch (error) {
              throw new AccessDeniedException(
                "Access Denied by @PostEnforce PEP. Failed to construct constraint handlers for decision."
              );
            }

            wrapperObservableHelper?.setBundle(bundle);

            try {
              bundle.handleOnDecisionSignalConstraints();

              const isPermitted = await DecoratorHelper.handleDecision(
                decision,
                args,
                Frameworks.NETSJS
              );

              if (isPermitted instanceof HttpException) {
                result = isPermitted;
                throw new AccessDeniedException(
                  "Access Denied. Action not permitted."
                );
              }

              if (result instanceof Readable || isObservable(result)) {
                result = DecoratorHelper.attachHandlersToStream(
                  result,
                  undefined,
                  wrapperObservableHelper
                );
              } else {
                result = bundle.handleAllOnNextConstraints(result);
              }
              resolve();
            } catch (error) {
              result = new HttpException(
                "Internal Server Error",
                HttpStatus.INTERNAL_SERVER_ERROR
              );
              result = bundle.handleAllOnErrorConstraints(error);
              reject(error);
            }
          });

          DecoratorHelper.attachOnEndStream(stream);

          DecoratorHelper.attachOnErrorStream(stream);
        });
      });

      return result;
    };
    return descriptor;
  };
}
