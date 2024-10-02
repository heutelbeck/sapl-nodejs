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
export function PreEnforce(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    let remotePdp = RemotePdp.getRemotePdp();
    let result: any;

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
          stream.on("data", async (decisionData) => {
            let decision = new Decision(TextHelper.decodeData(decisionData));
            let bundle: BlockingConstraintHandlerBundle<any>;

            try {
              bundle = remotePdp
                .getConstraintEnforcementService()
                .blockingPreEnforceBundleFor(decision);
            } catch (error) {
              throw new AccessDeniedException(
                "Access Denied by @PostEnforce PEP. Failed to construct constraint handlers for decision."
              );
            }

            if (bundle === undefined) {
              throw new AccessDeniedException(
                "Access Denied by @PreEnforce PEP. Failed to construct constraint handlers for decision. The ConstraintEnforcementService unexpectedly returned null"
              );
            }

            wrapperObservableHelper?.setBundle(bundle);

            try {
              bundle.handleOnDecisionSignalConstraints();

              bundle.handleMethodInvocationHandlers(originalMethod);

              const isPermitted = DecoratorHelper.handleDecision(
                decision,
                args
              );

              if (!isPermitted) {
                throw new AccessDeniedException(
                  "Access Denied. Action not permitted."
                );
              }

              //TODO Wert muss verändert zurückgegeben werden --> nest
              result = originalMethod.apply(this, args);

              // Check if the result is a Promise
              if (result instanceof Promise) {
                result = await result;
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
              result = error;
              result = bundle.handleAllOnErrorConstraints(error);
            }
          });

          DecoratorHelper.attachOnEndStream(stream);

          DecoratorHelper.attachOnErrorStream(stream);
        });
      return result;
    }
  };

  return descriptor;
}
