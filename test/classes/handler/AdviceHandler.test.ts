import { AdviceHandler } from "../../../src/classes/handler/AdviceHandler";
import { ConstraintHandler } from "../../../src/classes/handler/ConstraintHandler";
import { describe, expect, it, jest } from "@jest/globals";
import {
  ConsumerConstraintHandlerProvider,
  instanceOfConsumerConstraintHandlerProvider,
} from "../../../src/interfaces/ConsumerConstraintHandlerProvider";

const adviceObject = [{}, {}];

const adviceHandlers = [
  {
    prototype: {
      isResponsible: () => {
        return true;
      },
      getHandler: () => {
        return () => {
          console.log("advice handler");
        };
      },
    },
  } as object,
  {
    prototype: {
      isResponsible: () => {
        return false;
      },
      getHandler: () => {
        return () => {
          console.log("advice handler");
        };
      },
    },
  } as object,
] as unknown as ConsumerConstraintHandlerProvider[];

describe("AdviceHandler", () => {
  describe("handleAdvice", () => {
    it("should call ConstraintHandler.handleConstraints with the correct arguments", () => {
      const constraintHandlerSpy = jest.spyOn(
        ConstraintHandler,
        "handleConstraints"
      );

      const adviceHandler = new AdviceHandler(adviceObject, adviceHandlers);
      adviceHandler.handleAdvice();

      expect(constraintHandlerSpy).toHaveBeenCalledWith(
        adviceHandlers,
        adviceObject
      );
    });

    it("should return the value returned by ConstraintHandler.handleConstraints", () => {
      const expectedResult = true;
      jest
        .spyOn(ConstraintHandler, "handleConstraints")
        .mockReturnValue(expectedResult);

      const adviceHandler = new AdviceHandler(adviceObject, adviceHandlers);
      const result = adviceHandler.handleAdvice();

      expect(result).toBe(expectedResult);
    });
  });

  it("should return true while calling istanceOfConsumerConstraintHandlerProvider", () => {
    const adviceHandlerObject = {
      isResponsible: () => {
        return true;
      },
      getHandler: () => {
        return () => {
          console.log("advice handler");
        };
      },
    } as unknown as ConsumerConstraintHandlerProvider[];

    const result =
      instanceOfConsumerConstraintHandlerProvider(adviceHandlerObject);
    expect(result).toBe(true);
  });
});
