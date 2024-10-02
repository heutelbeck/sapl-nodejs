import { WrapperStreamHelper } from "../../../src/classes/helper/WrapperStreamHelper";
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { ConstraintEnforcementService } from "../../../src/classes/constraints/ConstraintEnforcementService";
import { Decision } from "../../../src/classes/Decision";
import { AccessDeniedException } from "../../../src/classes/constraints/providers/AccessDeniedException";
import { ReactiveConstraintHandlerBundle } from "../../../src/classes/constraints/ReactiveConstraintHandlerBundle";

describe("WrapperStreamHelper", () => {
  let wrapperStream: WrapperStreamHelper;

  beforeEach(() => {
    wrapperStream = new WrapperStreamHelper({
      readDataAllowed: true,
      killIfDenied: false,
      handleAccessDenied: false,
    });
  });

  it("should transform and pass the chunk if readDataAllowed is true", (done) => {
    const testData = JSON.stringify({ data: "Test" });
    const buffer = Buffer.from(testData);
    const transformCallback = jest.fn((error, transformedChunk) => {
      expect(error).toBeNull();
      expect(transformedChunk).toEqual(testData);
      done();
    });

    wrapperStream.setBundle(
      new ConstraintEnforcementService().reactiveTypeBundleFor(
        new Decision({ decision: "PERMIT" })
      )
    );

    wrapperStream._transform(buffer, "utf-8", transformCallback);
  });

  it("should throw an error if killIfDenied is true", (done) => {
    wrapperStream.setReadDataAllowed(false);
    wrapperStream = new WrapperStreamHelper({
      readDataAllowed: false,
      killIfDenied: true,
      handleAccessDenied: false,
    });

    const data = Buffer.from("test data");
    const transformCallback = jest.fn((error, transformedChunk) => {
      expect(error).toBeInstanceOf(Error);
      expect(transformedChunk).toBeNull();
      done();
    });

    wrapperStream.setBundle(
      new ConstraintEnforcementService().reactiveTypeBundleFor(
        new Decision({ decision: "DENY" })
      )
    );

    wrapperStream._transform(data, "utf-8", transformCallback);
  });

  it("should pass an empty buffer if readDataAllowed and killIfDenied are false", (done) => {
    const handleAccessDeniedSpy = jest.spyOn(
      WrapperStreamHelper.prototype,
      "handleAccessDenied"
    );
    wrapperStream.setReadDataAllowed(false);
    wrapperStream = new WrapperStreamHelper({
      readDataAllowed: false,
      killIfDenied: false,
      handleAccessDenied: true,
    });

    const chunk = Buffer.from("test data");
    const transformCallback = jest.fn((error, transformedChunk) => {
      expect(error).toBeUndefined();
      expect(transformedChunk).toBeUndefined();
      expect(handleAccessDeniedSpy).toBeCalled();
      done();
    });

    wrapperStream.setBundle(
      new ConstraintEnforcementService().reactiveTypeBundleFor(
        new Decision({ decision: "DENY" })
      )
    );

    wrapperStream._transform(chunk, "utf-8", transformCallback);
  });

  it("should return the wrapper stream", () => {
    const returnedStream = wrapperStream.getWrapperStream();
    expect(returnedStream).toBeInstanceOf(WrapperStreamHelper);
    expect(returnedStream).toBe(wrapperStream);
  });

  it("should set the readDataAllowed property", () => {
    const readDataAllowed = false;
    const returnedStream = wrapperStream.setReadDataAllowed(readDataAllowed);
    //@ts-expect-error unty
    expect(wrapperStream.readDataAllowed).toBe(readDataAllowed);
    expect(returnedStream).toBe(wrapperStream);
  });

  it("should throw AccessDeniedException", () => {
    let spyOnReactiveHandleAllOnErrorConstraints = jest.spyOn(
      ReactiveConstraintHandlerBundle.prototype,
      "handleAllOnErrorConstraints"
    );

    wrapperStream.setBundle(
      new ConstraintEnforcementService().reactiveTypeBundleFor(
        new Decision({ decision: "PERMIT" })
      )
    );

    wrapperStream.handleAccessDenied();

    expect(spyOnReactiveHandleAllOnErrorConstraints).toBeCalled();
  });

  it("should return the bHandleAccessDenied property", () => {
    const handleAccessDenied = true;
    wrapperStream = new WrapperStreamHelper({
      readDataAllowed: false,
      killIfDenied: false,
      handleAccessDenied,
    });

    const returnedValue = wrapperStream.getHandleAccessDenied();
    expect(returnedValue).toBe(handleAccessDenied);
  });
});
