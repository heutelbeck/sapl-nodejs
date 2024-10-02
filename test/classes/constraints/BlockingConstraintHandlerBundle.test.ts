import { describe, expect, it, jest } from "@jest/globals";
import { BlockingConstraintHandlerBundle } from "../../../src/classes/constraints/BlockingConstraintHandlerBundle";
import { Predicate } from "../../../src/classes/Predicate";

describe("BlockingConstraintHandlerBundle", () => {
  it("should handle method invocation handlers", () => {
    const mockOnDecisionHandlers = jest.fn();

    const bundle = new BlockingConstraintHandlerBundle(
      () => {},
      (t: unknown) => {
        mockOnDecisionHandlers();
      },
      () => {},
      () => {},
      () => {},
      () => {},
      <Predicate<object>>{},
      () => {}
    );

    const t = {};
    bundle.handleMethodInvocationHandlers(t);
    expect(mockOnDecisionHandlers).toHaveBeenCalled();
  });

  it("should handle all onNext constraints", () => {
    const mockOnDecisionHandlers = jest.fn();

    const bundle = new BlockingConstraintHandlerBundle<object>(
      () => {},
      () => {},
      (value: any) => {
        mockOnDecisionHandlers();
      },
      (value: object): object => {
        mockOnDecisionHandlers();
        return {};
      },
      () => {},
      () => {},
      <Predicate<object>>{},
      () => {
        return {};
      }
    );

    const value = {}; // Test input
    const result = bundle.handleAllOnNextConstraints(value);

    expect(mockOnDecisionHandlers).toHaveBeenCalledTimes(2);
  });

  // New test
  it("should handle filter predicate handlers", () => {
    const predicate = new Predicate<object>(() => true);
    const predicateTestSpy = jest.spyOn(predicate, "test");
    const bundle = new BlockingConstraintHandlerBundle(
      () => {},
      () => {},
      () => {},
      () => {},
      () => {},
      () => {},
      predicate,
      () => {}
    );

    const value = { data: "test" };
    bundle.handleFilterPredicateHandlers(value);

    expect(predicateTestSpy).toHaveBeenCalled();
  });

  it("should handle all onError constraints", () => {
    const mockAllOnErrorConstraints = jest.fn();

    const bundle = new BlockingConstraintHandlerBundle(
      () => {},
      () => {},
      () => {},
      () => {},
      (error: any) => {
        mockAllOnErrorConstraints();
      },
      (error: any) => {
        mockAllOnErrorConstraints();
      },
      <Predicate<object>>{},
      () => {}
    );

    const error = new Error();
    bundle.handleAllOnErrorConstraints(error);

    expect(mockAllOnErrorConstraints).toHaveBeenCalledTimes(2);
  });

  it("should handle onDecision signal constraints", () => {
    const mockHandleOnDecisionSignalConstraints = jest.fn();

    const bundle = new BlockingConstraintHandlerBundle(
      () => {
        mockHandleOnDecisionSignalConstraints();
      },
      () => {},
      () => {},
      () => {},
      () => {},
      () => {},
      <Predicate<object>>{},
      () => {}
    );

    bundle.handleOnDecisionSignalConstraints();

    expect(mockHandleOnDecisionSignalConstraints).toHaveBeenCalled();
  });
});
