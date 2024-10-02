import { Predicate } from "../Predicate";

export class ReactiveConstraintHandlerBundle<T> {
  constructor(
    private onDecisionHandlers: () => void,
    private onCloseHandlers: () => void,
    private onDataHandlers: () => void,
    private onEndHandlers: () => void,
    private onErrorHandlers: () => void,
    private onPauseHandlers: () => void,
    private onReadableHandlers: () => void,
    private onResumeHandlers: () => void,
    private onSubscribeHandlers: (stream: ReadableStream) => void,
    private onRequestHandlers: (value: T) => void,
    private doOnNextHandlers: (value: T) => void,
    private onNextMapHandlers: (value: T) => void,
    private doOnErrorHandlers: (error: any) => void,
    private onErrorMapHandlers: (error) => void,
    private filterPredicateHandlers: Predicate<object>,
    private methodInvocationHandlers: (t: unknown) => void
  ) {}

  /**
   * Runs all onSubscription handlers.
   * @param stream the Subscription.
   */
  public handleOnSubscribeConstraints(stream: ReadableStream): void {
    this.onSubscribeHandlers(stream);
  }

  /**
   * Executes all onNext constraint handlers, potentially transforming the value.
   * @param value a return value
   * @return the return value after constraint handling
   */
  public handleAllOnNextConstraints(value: T) {
    this.handleFilterPredicateHandlers(value);
    this.handleOnNextConstraints(value);
    return this.handleOnNextMapConstraints(value);
  }

  /**
   * Executes all filter predicate constraint handlers.
   * @param value the value to filter
   */
  public handleFilterPredicateHandlers(value: any) {
    Predicate.handlePredicate(this.filterPredicateHandlers, value);
  }

  /**
   * Executes doOnNext constraint handlers.
   * @param value The value to handle
   */
  private handleOnNextConstraints(value: T) {
    this.doOnNextHandlers(value);
  }

  /**
   * Executes onNextMap constraint handlers.
   * @param value the value to map
   */
  private handleOnNextMapConstraints(value: T) {
    return this.onNextMapHandlers(value);
  }

  /**
   * Runs all onRequest handlers.
   * @param value number of events requested
   */
  public handleOnRequestConstraints(value: T) {
    this.onRequestHandlers(value);
  }

  /**
   * Runs all onEndHandlers handlers.
   */
  public handleOnEndSignalConstraints() {
    this.onEndHandlers();
  }

  /**
   * Runs all onErrorHandlers handlers.
   */
  public handleOnErrorSignalConstraints(error: any) {
    this.onErrorHandlers();
  }

  /**
   * Runs all onCloseHandlers handlers.
   */
  public handleonCloseSignalConstraints() {
    this.onCloseHandlers();
  }

  /**
   * Runs all onPauseHandlers handlers.
   */
  public handleOnPauseSignalConstraints() {
    this.onPauseHandlers();
  }

  /**
   * Runs all onDataHandlers handlers.
   */
  public handleOnDataSignalConstraints(data: any) {
    this.onDataHandlers();
  }

  /**
   * Runs all onReadableHandlers handlers.
   */
  public handleOnReadableSignalConstraints() {
    this.onReadableHandlers();
  }

  /**
   * Runs all onResumeHandlers handlers.
   */
  public handleOnResumeSignalConstraints() {
    this.onResumeHandlers();
  }

  /**
   * Runs all onResumeHandlers handlers.
   */
  public handleOnDecisionSignalConstraints() {
    this.onDecisionHandlers();
  }

  /**
   * Runs all method invocation handlers. These handlers may modify the
   * methodInvocation.
   *
   * @param methodInvocation the method invocation to examine and potentially
   *                         modify
   */
  public handleMethodInvocationHandlers(methodInvocation) {
    this.methodInvocationHandlers(methodInvocation);
  }

  /**
   * Executes all onError constraint handlers, potentially transforming the error.
   *
   * @param error the error
   * @return the error after all handlers have run
   */
  public handleAllOnErrorConstraints(error) {
    this.handleOnErrorConstraints(error);
    return this.handleOnErrorMapConstraints(error);
  }

  /**
   * Executes onErrorMap constraint handlers.
   * @param error Error to handle
   * @returns Returns the error after all handlers have run
   */
  private handleOnErrorMapConstraints(error) {
    return this.onErrorMapHandlers(error);
  }

  /**
   * Executes doOnErrorHandlers constraint handlers.
   * @param error Error to handle
   * @returns Returns the error after all handlers have run
   */
  private handleOnErrorConstraints(error) {
    this.doOnErrorHandlers(error);
  }
}
