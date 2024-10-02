import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { ReactiveConstraintHandlerBundle } from "../../../src/classes/constraints/ReactiveConstraintHandlerBundle";
import { Predicate } from "../../../src/classes/Predicate";

describe("ReactiveConstraintHandlerBundle", () => {
  let bundle: ReactiveConstraintHandlerBundle<object>;
  let onDecisionHandlers = jest.fn();
  let onCloseHandlers = jest.fn();
  let onDataHandlers = jest.fn();
  let onEndHandlers = jest.fn();
  let onErrorHandlers = jest.fn();
  let onPauseHandlers = jest.fn();
  let onReadableHandlers = jest.fn();
  let onResumeHandlers = jest.fn();
  let onSubscribeHandlers = jest.fn();
  let onRequestHandlers = jest.fn();
  let doOnNextHandlers = jest.fn();
  let onNextMapHandlers = jest.fn();
  let doOnErrorHandlers = jest.fn();
  let onErrorMapHandlers = jest.fn();
  let filterPredicateHandlers = new Predicate<object>(() => true);
  let methodInvocationHandlers = jest.fn();

  beforeEach(() => {
    bundle = new ReactiveConstraintHandlerBundle<object>(
      onDecisionHandlers,
      onCloseHandlers,
      onDataHandlers,
      onEndHandlers,
      onErrorHandlers,
      onPauseHandlers,
      onReadableHandlers,
      onResumeHandlers,
      onSubscribeHandlers,
      onRequestHandlers,
      doOnNextHandlers,
      onNextMapHandlers,
      doOnErrorHandlers,
      onErrorMapHandlers,
      filterPredicateHandlers,
      methodInvocationHandlers
    );
  });

  it("should call onSubscribeHandlers with the provided stream", () => {
    const stream = new ReadableStream();

    bundle.handleOnSubscribeConstraints(stream);
    expect(onSubscribeHandlers).toHaveBeenCalled();
  });

  it("should call handleAllOnNextConstraints with the provided value", () => {
    const value = { data: "value" };
    const filterPredicateTestSpy = jest.spyOn(filterPredicateHandlers, "test");

    bundle.handleAllOnNextConstraints(value);

    expect(filterPredicateTestSpy).toHaveBeenCalledWith("value");
    expect(doOnNextHandlers).toHaveBeenCalledWith(value);
    expect(onNextMapHandlers).toHaveBeenCalledWith(value);
  });

  it("should call handleOnRequestConstraints with the provided value", () => {
    const value = { data: "value" };

    bundle.handleOnRequestConstraints(value);
    expect(onRequestHandlers).toHaveBeenCalledWith(value);
  });

  it("should call all data signal handlers", () => {
    bundle.handleonCloseSignalConstraints();
    bundle.handleOnPauseSignalConstraints();
    bundle.handleOnReadableSignalConstraints();
    bundle.handleOnResumeSignalConstraints();
    bundle.handleOnEndSignalConstraints();

    expect(onCloseHandlers).toHaveBeenCalled();
    expect(onPauseHandlers).toHaveBeenCalled();
    expect(onReadableHandlers).toHaveBeenCalled();
    expect(onResumeHandlers).toHaveBeenCalled();
    expect(onEndHandlers).toHaveBeenCalled();
  });

  it("should call all on Decision signal handlers", () => {
    bundle.handleOnDecisionSignalConstraints();
    expect(onDecisionHandlers).toHaveBeenCalled();
  })

  it("should call all on Method Invocation handlers", () => {
    bundle.handleMethodInvocationHandlers(jest.fn());
    expect(methodInvocationHandlers).toHaveBeenCalled();
  });
});
