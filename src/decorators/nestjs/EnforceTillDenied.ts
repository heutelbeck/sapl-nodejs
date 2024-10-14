import { RemotePdp } from "../../classes/RemotePdp";
import { Frameworks } from "../../interfaces/Frameworks";
import { DecoratorHelper } from "../../classes/helper/DecoratorHelper";

let decoratorArguments: any;

/**
 * This decorator is used to enforce the access control policy decision until it is denied.
 * The Client will receive a non-recoverable error in case of a denied access.
 * @returns
 */
export function EnforceTillDenied(...args: any[]): MethodDecorator {
  
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    DecoratorHelper.setEnforceTillDeniedArguments(propertyKey, decoratorArguments);
    const wrapperStreamHelper = DecoratorHelper.createWrapperStreamHelper({
      killIfDenied: true,
    });
    const wrapperObservableHelper =
      DecoratorHelper.createWrapperObservableHelper({
        killIfDenied: true,
      });

    let result: any = undefined;

    descriptor.value = async function (...args: any[]) {
      let remotePdp = RemotePdp.getRemotePdp();

      await DecoratorHelper.remotePdpDecide(
        remotePdp,
        originalMethod,
        DecoratorHelper.getEnforceTillDeniedArguments(originalMethod.name),
        DecoratorHelper.searchForIncommingMessage(args),
        this
      ).then((stream) => {
        DecoratorHelper.attachOnDecisionStream(
          args,
          stream,
          remotePdp,
          wrapperStreamHelper,
          wrapperObservableHelper,
          Frameworks.NETSJS
        );

        DecoratorHelper.attachOnEndStream(stream);

        DecoratorHelper.attachOnErrorStream(stream, wrapperStreamHelper);
      });

      // Call the original method and get its Stream
      let originalStream = originalMethod.apply(this, args);

      // Check if the result is a Promise
      if (originalStream instanceof Promise) {
        originalStream = await originalStream;
      }

      // Attach the signal handlers to the stream
      result = DecoratorHelper.attachHandlersToStream(
        originalStream,
        wrapperStreamHelper,
        wrapperObservableHelper
      );

      return result;
    };
    return descriptor;
  };
}
