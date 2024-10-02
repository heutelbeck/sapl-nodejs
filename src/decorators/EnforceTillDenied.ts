import { RemotePdp } from "../classes/RemotePdp";
import { DecoratorHelper } from "../classes/helper/DecoratorHelper";

/**
 * @deprecated dont use this decorator
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 * @returns 
 */
export function EnforceTillDenied(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const wrapperStreamHelper = DecoratorHelper.createWrapperStreamHelper({
    killIfDenied: true,
  });
  const wrapperObservableHelper = DecoratorHelper.createWrapperObservableHelper(
    {
      killIfDenied: true,
    }
  );

  descriptor.value = async function (...args: any[]) {
    let remotePdp = RemotePdp.getRemotePdp();

    if (remotePdp instanceof RemotePdp) {
      await DecoratorHelper.remotePdpDecide(remotePdp, originalMethod).then(
        (stream) => {
          DecoratorHelper.attachOnDecisionStream(
            args,
            stream,
            remotePdp,
            wrapperStreamHelper,
            wrapperObservableHelper
          );

          DecoratorHelper.attachOnEndStream(stream);

          DecoratorHelper.attachOnErrorStream(stream, wrapperStreamHelper);
        }
      );
    }

    // Call the original method and get its Stream
    let originalStream = originalMethod.apply(this, args);

    // Check if the result is a Promise
    if (originalStream instanceof Promise) {
      originalStream = await originalStream;
    }

    // Attach the signal handlers to the stream
    return DecoratorHelper.attachHandlersToStream(
      originalStream,
      wrapperStreamHelper,
      wrapperObservableHelper
    );
  };

  return descriptor;
}
