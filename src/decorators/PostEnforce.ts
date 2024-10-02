import { Readable } from "stream";
import { isObservable } from "rxjs";
import { Decision } from "../classes/Decision";
import { RemotePdp } from "../classes/RemotePdp";
import { TextHelper } from "../classes/helper/TextHelper";
import { DecoratorHelper } from "../classes/helper/DecoratorHelper";
import { AuthorizationSubscription } from "../classes/AuthorizationSubscription";
import { AccessDeniedException } from "../classes/constraints/providers/AccessDeniedException";
import { BlockingConstraintHandlerBundle } from "../classes/constraints/BlockingConstraintHandlerBundle";

/**
 * @deprecated dont use this decorator
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 * @returns 
 */
export function PostEnforce(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    let result = originalMethod.apply(this, args);

    // Check if the result is a Promise
    if (result instanceof Promise) {
      result = await result;
    }

    let remotePdp = RemotePdp.getRemotePdp();

    const wrapperObservableHelper =
      DecoratorHelper.createWrapperObservableHelper({ readDataAllowed: true });

    if (remotePdp instanceof RemotePdp) {
      await remotePdp
        .decideOnce(
          AuthorizationSubscription.create(
            await remotePdp
              .getAuthorizationManager()
              .buildSubjectForAuhorizationSubscription(),
            originalMethod.name,
            ""
          )
        )
        .then((stream) => {
          stream.on("data", (decisionData) => {
            let decision = new Decision(TextHelper.decodeData(decisionData));
            let bundle: BlockingConstraintHandlerBundle<any>;

            if (bundle === undefined) {
              throw new AccessDeniedException(
                "Access Denied by @PostEnforce PEP. Failed to construct constraint handlers for decision. The ConstraintEnforcementService unexpectedly returned null"
              );
            }

            wrapperObservableHelper?.setBundle(bundle);

            try {
              bundle = remotePdp
                .getConstraintEnforcementService()
                .blockingPostEnforceBundleFor(decision);
            } catch (error) {
              throw new AccessDeniedException(
                "Access Denied by @PostEnforce PEP. Failed to construct constraint handlers for decision."
              );
            }

            try {
              bundle.handleOnDecisionSignalConstraints();
              const isPermitted = DecoratorHelper.handleDecision(
                decision,
                args
              );

              if (!isPermitted) {
                throw new AccessDeniedException(
                  "Access Denied by @PostEnforce PEP. Decision was not permitted."
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
            } catch (error) {
              result = bundle.handleAllOnErrorConstraints(error);
            }
          });

          DecoratorHelper.attachOnEndStream(stream);

          DecoratorHelper.attachOnErrorStream(stream);
        });
    }
    return result;
  };

  return descriptor;
}
