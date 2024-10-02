import { Predicate } from "../Predicate";
import { FunctionUtil } from "./FunctionUtil";

/**
 * A bundle of handlers for the different constraint types.
 */
export class BlockingConstraintHandlerBundle<T> {
  /**
   * Creates a new instance of BlockingConstraintHandlerBundle.
   */
  constructor(
    private onDecisionHandlers: () => void,
    private methodInvocationHandlers: (t: unknown) => void,
    private doOnNextHandlers: (value: T) => void,
    private onNextMapHandlers: (value: T) => T,
    private doOnErrorHandlers: (error: any) => void,
    private onErrorMapHandlers: (error: any) => any,
    private filterPredicateHandlers: Predicate<object>,
    private replaceResourceHandler: (value: T) => T
  ) {}

  /**
   * Creates a new instance of BlockingConstraintHandlerBundle for PreEnforce.
   * @returns BlockingConstraintHandlerBundle
   */
  public static preEnforceConstraintHandlerBundle<T, U>(
    onDecisionHandlers: () => void,
    methodInvocationHandlers: (t: unknown) => void,
    doOnNextHandlers: (value: T) => void,
    onNextMapHandlers: (value: T) => T,
    doOnErrorHandlers: (error: any) => void,
    onErrorMapHandlers: (error: any) => any,
    filterPredicateHandlers: Predicate<object>,
    replaceResourceHandler: (value: T) => T
  ): BlockingConstraintHandlerBundle<T> {
    return new BlockingConstraintHandlerBundle<T>(
      onDecisionHandlers,
      methodInvocationHandlers,
      doOnNextHandlers,
      onNextMapHandlers,
      doOnErrorHandlers,
      onErrorMapHandlers,
      filterPredicateHandlers,
      replaceResourceHandler
    );
  }

  /**
   * Creates a new instance of BlockingConstraintHandlerBundle for PostEnforce.
   * @returns BlockingConstraintHandlerBundle
   */
  public static postEnforceConstraintHandlerBundle<T, U>(
    onDecisionHandlers: () => void,
    doOnNextHandlers: (value: T) => void,
    onNextMapHandlers: (value: T) => T,
    doOnErrorHandlers: (error: any) => void,
    onErrorMapHandlers: (error: any) => any,
    filterPredicateHandlers: Predicate<object>,
    replaceResourceHandler: (value: T) => T
  ): BlockingConstraintHandlerBundle<T> {
    return new BlockingConstraintHandlerBundle<T>(
      onDecisionHandlers,
      FunctionUtil.sink(),
      doOnNextHandlers,
      onNextMapHandlers,
      doOnErrorHandlers,
      onErrorMapHandlers,
      filterPredicateHandlers,
      replaceResourceHandler
    );
  }

  /**
   * Handles the method invocation handlers.
   * @param t Value to be handled by the method invocation handlers.
   */
  public handleMethodInvocationHandlers(t: unknown): void {
    this.methodInvocationHandlers(t);
  }

  /**
   * Handles all onNext constraints.
   * @param value Value to be handled by the onNext constraints.
   * @returns The value after handling all onNext constraints.
   */
  public handleAllOnNextConstraints(value: T): T {
    let newValue = this.handleFilterPredicateHandlers(value);
    this.handleOnNextConstraints(newValue);
    return this.handleOnNextMapConstraints(newValue);
  }

  /**
   * HJandles all filter predicate handlers.
   * @param value Value to be handled by the filter predicate handlers.
   * @returns The value after handling all filter predicate handlers.
   */
  public handleFilterPredicateHandlers(value: any) {
    return Predicate.handlePredicate(this.filterPredicateHandlers, value);
  }

  /**
   * Handles onNextMapHandlers constraints.
   * @param value Value to be handled by the onNextMapHandlers constraints.
   * @returns The value after handling all onNextMapHandlers constraints.
   */
  private handleOnNextMapConstraints(value: any) {
    let mapped = this.onNextMapHandlers(value);
    return this.replaceResourceHandler(mapped);
  }

  /**
   * Handles doOnNextHandlers constraints.
   * @param value Value to be handled by the doOnNextHandlers constraints.
   * @returns The value after handling all doOnNextHandlers constraints.
   */
  private handleOnNextConstraints(value: any) {
    this.doOnNextHandlers(value);
  }

  /**
   * Handles all onDecision constraints.
   */
  public handleOnDecisionSignalConstraints() {
    this.onDecisionHandlers();
  }

  /**
   * Handles all onError constraints.
   * @param error Error to be handled by the onError constraints.
   * @returns The error after handling all onError constraints.
   */
  public handleAllOnErrorConstraints(error: any) {
    this.handleOnErrorConstraints(error);
    return this.handleOnErrorMapConstraints(error);
  }

  /**
   * Handles onErrorMap constraints.
   * @param error Error to be handled by the onErrorMap constraints.
   * @returns The error after handling all onErrorMap constraints.
   */
  private handleOnErrorMapConstraints(error: any) {
    return this.onErrorMapHandlers(error);
  }

  /**
   * Handles onError constraints.
   * @param error Error to be handled by the onError constraints.
   * @returns The error after handling all onError constraints.
   */
  private handleOnErrorConstraints(error: any) {
    this.doOnErrorHandlers(error);
  }
}
