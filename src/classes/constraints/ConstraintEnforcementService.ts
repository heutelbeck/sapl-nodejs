import { FunctionUtil } from "./FunctionUtil";
import { Decision } from "../../interfaces/Decision";
import {
  RunnableConstraintHandlerProvider,
  Event as Event,
} from "../../interfaces/constraints/RunnableConstraintHandlerProvider";
import { ContentFilteringProvider } from "./providers/ContentFilteringProvider";
import { ReactiveConstraintHandlerBundle } from "./ReactiveConstraintHandlerBundle";
import { BlockingConstraintHandlerBundle } from "./BlockingConstraintHandlerBundle";
import { ErrorHandlerProvider } from "../../interfaces/constraints/ErrorHandlerProvider";
import { ContentFilterPredicateProvider } from "./providers/ContentFilterPredicateProvider";
import { RequestHandlerProvider } from "../../interfaces/constraints/RequestHandlerProvider";
import { SubscriptionHandlerProvider } from "../../interfaces/constraints/SubscriptionHandlerProvider";
import { ConsumerConstraintHandlerProvider } from "../../interfaces/ConsumerConstraintHandlerProvider";
import { MappingConstraintHandlerProvider } from "../../interfaces/constraints/MappingConstraintHandlerProvider";
import { ErrorMappingConstraintHandlerProvider } from "../../interfaces/constraints/ErrorMappingConstraintHandlerProvider";
import { FilterPredicateConstraintHandlerProvider } from "../../interfaces/constraints/FilterPredicateConstraintHandlerProvider";
import { MethodInvocationConstraintHandlerProvider } from "../../interfaces/constraints/MethodInvocationConstraintHandlerProvider";

export class ConstraintEnforcementService {
  // prettier-ignore
  private readonly registeredOnDecisionObligationHandlersContainer: any[] = [];
  // prettier-ignore
  private readonly registeredMethodInvocationHandlersContainer: MethodInvocationConstraintHandlerProvider[] = [];
  // prettier-ignore
  private readonly registeredOnNextHandlersContainer: ConsumerConstraintHandlerProvider[] = [];
  // prettier-ignore
  private readonly registeredOnMapNextHandlersContainer: MappingConstraintHandlerProvider[] = [];
  private readonly registeredOnErrorHandlersContainer: ErrorHandlerProvider[] = [];
  // prettier-ignore
  private readonly registeredMapErrorHandlersContainer: ErrorMappingConstraintHandlerProvider[] = [];
  // prettier-ignore
  private readonly registeredFilterConstraintHandlersContainer: FilterPredicateConstraintHandlerProvider[] = [];
  // prettier-ignore
  private readonly registeredSubscriptionHandlersContainer: SubscriptionHandlerProvider[] = [];
  private readonly registeredRequestHandlerContainer: RequestHandlerProvider[] = [];
  // prettier-ignore
  private readonly registeredRunnableHandlersForSignalContainer: RunnableConstraintHandlerProvider[] = [];
  private onDecisionObligationHandlersContainer: any[] = [];
  // prettier-ignore
  private methodInvocationHandlersContainer: MethodInvocationConstraintHandlerProvider[] = [];
  private onNextHandlersContainer: ConsumerConstraintHandlerProvider[] = [];
  private onMapNextHandlersContainer: MappingConstraintHandlerProvider[] = [];
  private onErrorHandlersContainer: ErrorHandlerProvider[] = [];
  // prettier-ignore
  private mapErrorHandlersContainer: ErrorMappingConstraintHandlerProvider[] = [];
  // prettier-ignore
  private filterConstraintHandlersContainer: FilterPredicateConstraintHandlerProvider[] = [];
  private subscriptionHandlersContainer: SubscriptionHandlerProvider[] = [];
  private requestHandlerContainer: RequestHandlerProvider[] = [];
  // prettier-ignore
  private runnableHandlersForSignalContainer: RunnableConstraintHandlerProvider[] = [];
  private unhandledObligations: any[] = [];
  private prioritizedHandlers: { priority: number; object: any }[] = [];

  constructor() {
    //set default filtering constraint Handlers
    this.filterConstraintHandlersContainer.push(
      new ContentFilterPredicateProvider()
    );
    this.onMapNextHandlersContainer.push(new ContentFilteringProvider());
  }

  /**
   * Initialize the ConstraintEnforcementService
   */
  private initialize() {
    this.onDecisionObligationHandlersContainer =
      this.registeredOnDecisionObligationHandlersContainer;
    this.methodInvocationHandlersContainer =
      this.registeredMethodInvocationHandlersContainer;
    this.onNextHandlersContainer = this.registeredOnNextHandlersContainer;
    this.onMapNextHandlersContainer = this.registeredOnMapNextHandlersContainer;
    this.onErrorHandlersContainer = this.registeredOnErrorHandlersContainer;
    this.mapErrorHandlersContainer = this.registeredMapErrorHandlersContainer;
    this.filterConstraintHandlersContainer =
      this.registeredFilterConstraintHandlersContainer;
    this.subscriptionHandlersContainer =
      this.registeredSubscriptionHandlersContainer;
    this.requestHandlerContainer = this.registeredRequestHandlerContainer;
    this.runnableHandlersForSignalContainer =
      this.registeredRunnableHandlersForSignalContainer;
    this.prioritizedHandlers = [];
    this.filterConstraintHandlersContainer.push(
      new ContentFilterPredicateProvider()
    );
    this.onMapNextHandlersContainer.push(new ContentFilteringProvider());
  }

  /**
   * Create a ReactiveConstraintHandlerBundle
   * @param decision Decision of the PDP
   * @returns REactiveConstraintHandlerBundle
   */
  public reactiveTypeBundleFor(decision: Decision) {
    this.initialize();
    this.unhandledObligations = decision.getObligations();

    let bundle = new ReactiveConstraintHandlerBundle(
      this.runnableHandlersForEvent(Event.ON_DECISION, decision),
      //side effect handlers
      this.runnableHandlersForEvent(Event.ON_CLOSE, decision),
      this.runnableHandlersForEvent(Event.ON_DATA, decision),
      this.runnableHandlersForEvent(Event.ON_END, decision),
      this.runnableHandlersForEvent(Event.ON_ERROR, decision),
      this.runnableHandlersForEvent(Event.ON_PAUSE, decision),
      this.runnableHandlersForEvent(Event.ON_READABLE, decision),
      this.runnableHandlersForEvent(Event.ON_RESUME, decision),
      //constraint handlers
      this.subscriptionHandlers(decision),
      this.requestHandlers(decision),
      this.onNextHandlers(decision),
      this.mapNextHandlers(decision),
      this.onErrorHandlers(decision),
      this.mapErrorHandlers(decision),
      this.filterConstraintHandlers(decision),
      this.methodInvocationHandlers(decision)
    );

    if (this.unhandledObligations.length > 0)
      throw new Error("Unhandled obligations");

    return bundle;
  }

  /**
   * Create a BlockingConstraintHandlerBundle for PreEnforce
   * @param decision Decision of the PDP
   * @returns REactiveConstraintHandlerBundle
   */
  public blockingPreEnforceBundleFor(decision: Decision) {
    this.initialize();
    this.unhandledObligations = decision.getObligations();

    let bundle =
      BlockingConstraintHandlerBundle.preEnforceConstraintHandlerBundle(
        this.runnableHandlersForEvent(Event.ON_DECISION, decision),
        this.methodInvocationHandlers(decision),
        this.onNextHandlers(decision),
        this.mapNextHandlers(decision),
        this.onErrorHandlers(decision),
        this.mapErrorHandlers(decision),
        this.filterConstraintHandlers(decision),
        this.replaceHandler(decision.getResource())
      );

    if (this.unhandledObligations.length > 0)
      throw new Error("Unhandled obligations");

    return bundle;
  }

  /**
   * Create a BlockingConstraintHandlerBundle for PostEnforce
   * @param decision Decision of the PDP
   * @returns REactiveConstraintHandlerBundle
   */
  public blockingPostEnforceBundleFor(decision: Decision) {
    this.initialize();
    this.unhandledObligations = decision.getObligations();

    let bundle =
      BlockingConstraintHandlerBundle.postEnforceConstraintHandlerBundle(
        this.runnableHandlersForEvent(Event.ON_DECISION, decision),
        this.onNextHandlers(decision),
        this.mapNextHandlers(decision),
        this.onErrorHandlers(decision),
        this.mapErrorHandlers(decision),
        this.filterConstraintHandlers(decision),
        this.replaceHandler(decision.getResource())
      );

    if (this.unhandledObligations.length > 0)
      throw new Error("Unhandled obligations");

    return bundle;
  }

  //---------------------------------------------------------------------------------------------------------------------
  // Getter and Setter
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Register a RunnableConstraintHandlerProvider
   * @param handler A implementation of RunnableConstraintHandlerProvider
   * @returns ConstraintEnforcementService
   */
  public addConstraintHandler(handler: RunnableConstraintHandlerProvider) {
    this.registeredRunnableHandlersForSignalContainer.push(handler);
    return this;
  }

  /**
   * Register a MappingConstraintHandlerProvider
   * @param handler A implementation of MappingConstraintHandlerProvider
   * @returns ConstraintEnforcementService
   */
  public addMappingConstraintHandler(
    handler: MappingConstraintHandlerProvider
  ) {
    this.registeredOnMapNextHandlersContainer.push(handler);
    return this;
  }

  /**
   * Register a MethodInvocationConstraintHandlerProvider
   * @param handler A implementation of MethodInvocationConstraintHandlerProvider
   * @returns ConstraintEnforcementService
   */
  public addMethodInvocationConstraintHandler(
    handler: MethodInvocationConstraintHandlerProvider
  ) {
    this.registeredMethodInvocationHandlersContainer.push(handler);
    return this;
  }

  /**
   * Register a ConsumerConstraintHandlerProvider
   * @param handler A implementation of ConsumerConstraintHandlerProvider
   * @returns ConstraintEnforcementService
   */
  public addOnNextConstraintHandler(
    handler: ConsumerConstraintHandlerProvider
  ) {
    this.registeredOnNextHandlersContainer.push(handler);
    return this;
  }

  /**
   * Register a ErrorHandlerProvider
   * @param handler A implementation of ErrorHandlerProvider
   * @returns ConstraintEnforcementService
   */
  public addOnErrorConstraintHandler(handler: ErrorHandlerProvider) {
    this.registeredOnErrorHandlersContainer.push(handler);
    return this;
  }

  /**
   * Register a ErrorMappingConstraintHandlerProvider
   * @param handler A implementation of ErrorMappingConstraintHandlerProvider
   * @returns ConstraintEnforcementService
   */
  public addMapErrorConstraintHandler(
    handler: ErrorMappingConstraintHandlerProvider
  ) {
    this.registeredMapErrorHandlersContainer.push(handler);
    return this;
  }

  /**
   * Register a FilterPredicateConstraintHandlerProvider
   * @param handler A implementation of FilterPredicateConstraintHandlerProvider
   * @returns ConstraintEnforcementService
   */
  public addFilterConstraintHandler(
    handler: FilterPredicateConstraintHandlerProvider
  ) {
    this.registeredFilterConstraintHandlersContainer.push(handler);
    return this;
  }

  /**
   * Register a ConsumerConstraintHandlerProvider
   * @param handler A implementation of ConsumerConstraintHandlerProvider
   * @returns ConstraintEnforcementService
   */
  public addOnDecisionObligationHandler(
    handler: ConsumerConstraintHandlerProvider
  ) {
    this.registeredOnDecisionObligationHandlersContainer.push(handler);
    return this;
  }

  /**
   * Register a SubscriptionHandlerProvider
   * @param handler A implementation of SubscriptionHandlerProvider
   * @returns ConstraintEnforcementService
   */
  public addSubscriptionHandler(handler: SubscriptionHandlerProvider) {
    this.registeredSubscriptionHandlersContainer.push(handler);
    return this;
  }

  /**
   * Register a RequestHandlerProvider
   * @param handler A implementation of RequestHandlerProvider
   * @returns ConstraintEnforcementService
   */
  public addRequestHandler(handler: RequestHandlerProvider) {
    this.registeredRequestHandlerContainer.push(handler);
    return this;
  }

  //---------------------------------------------------------------------------------------------------------------------
  // private Methods
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Remove unhandled obligation
   * @param object Constraint to remove
   */
  private _removeUnhandledObligation(object) {
    this.unhandledObligations = this.unhandledObligations.filter(
      (obligation) => obligation !== object
    );
  }

  //---------------------------------------------------------------------------------------------------------------------
  // bundle Methods
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Runnable handlers for signal
   * @param signal Signal
   * @param decision Decision
   * @param unhandledObligations Unhandled obligations
   * @returns Runnable handlers
   */
  private runnableHandlersForEvent(
    signal: string,
    decision: Decision
  ): () => void {
    const onDecisionObligationHandlers = this.obligationRunnable(
      this.constructRunnableHandlersForConstraints(
        signal,
        decision.getObligations(),
        this._removeUnhandledObligation.bind(this)
      )
    );

    const onDecisionAdviceHandlers = this.adviceRunnable(
      this.constructRunnableHandlersForConstraints(
        signal,
        decision.getAdvices(),
        FunctionUtil.sink()
      )
    );

    return this.runBoth(onDecisionObligationHandlers, onDecisionAdviceHandlers);
  }

  /**
   * Build subscription handlers
   * @param decision Decision
   * @returns Runnable handlers
   */
  private subscriptionHandlers(
    decision: Decision
  ): (stream: ReadableStream) => void {
    const obligationHandlers = this.obligation(
      this.constructSubscriptionHandlersForConstraints(
        decision.getObligations(),
        this._removeUnhandledObligation.bind(this)
      )
    );
    const adviceHandlers = this.advice(
      this.constructSubscriptionHandlersForConstraints(
        decision.getAdvices(),
        FunctionUtil.sink()
      )
    );
    return this.consumeWithBoth(obligationHandlers, adviceHandlers);
  }

  /**
   * Build request handlers
   * @param decision Decision
   * @returns Runnable handlers
   */
  private requestHandlers(decision: Decision): (value: unknown) => void {
    const obligationHandlers = this.obligation(
      this.constructRequestHandlersForConstraints(
        decision.getObligations(),
        this._removeUnhandledObligation.bind(this)
      )
    );
    const adviceHandlers = this.advice(
      this.constructRequestHandlersForConstraints(
        decision.getAdvices(),
        FunctionUtil.sink()
      )
    );
    return this.consumeWithBoth(obligationHandlers, adviceHandlers);
  }

  /**
   * Build onNext handlers
   * @param decision Decision
   * @returns Runnable handlers
   */
  private onNextHandlers(decision: Decision): (value: any) => void {
    const obligationHandlers = this.obligation(
      this.constructOnNextHandlersForConstraints(
        decision.getObligations(),
        this._removeUnhandledObligation.bind(this)
      )
    );
    const adviceHandlers = this.advice(
      this.constructOnNextHandlersForConstraints(
        decision.getAdvices(),
        FunctionUtil.sink()
      )
    );
    return this.consumeWithBoth(obligationHandlers, adviceHandlers);
  }

  /**
   * Build mapNext handlers
   * @param decision Decision
   * @returns Runnable handlers
   */
  private mapNextHandlers(decision: Decision) {
    const obligationHandlers = this.obligation(
      this.constructMapNextHandlersForConstraints(
        decision.getObligations(),
        this._removeUnhandledObligation.bind(this)
      )
    );
    const adviceHandlers = this.advice(
      this.constructMapNextHandlersForConstraints(
        decision.getAdvices(),
        FunctionUtil.sink()
      )
    );
    return this.mapBoth(obligationHandlers, adviceHandlers);
  }

  /**
   * Build mapErrorHandlers handlers
   * @param decision Decision
   * @returns Runnable handlers
   */
  private mapErrorHandlers(decision: Decision) {
    const obligationHandlers = this.obligation(
      this.constructMapNextHandlersForConstraints(
        decision.getObligations(),
        this._removeUnhandledObligation.bind(this)
      )
    );
    const adviceHandlers = this.advice(
      this.constructMapNextHandlersForConstraints(
        decision.getAdvices(),
        FunctionUtil.sink()
      )
    );
    return this.mapBoth(obligationHandlers, adviceHandlers);
  }

  /**
   * Build onErrorHandlers handlers
   * @param decision Decision
   * @returns Runnable handlers
   */
  private onErrorHandlers(decision: Decision) {
    const obligationHandlers = this.obligation(
      this.constructOnErrorHandlersForConstraints(
        decision.getObligations(),
        this._removeUnhandledObligation.bind(this)
      )
    );
    const adviceHandlers = this.advice(
      this.constructOnErrorHandlersForConstraints(
        decision.getAdvices(),
        FunctionUtil.sink()
      )
    );
    return this.consumeWithBoth(obligationHandlers, adviceHandlers);
  }

  /**
   * Build filterConstraintHandlers handlers
   * @param decision Decision
   * @returns Runnable handlers
   */
  private filterConstraintHandlers(decision: Decision) {
    const obligationHandlers = this.constructFilterHandlersForConstraint(
      decision.getObligations(),
      this._removeUnhandledObligation.bind(this)
    );

    const adviceHandlers = this.constructFilterHandlersForConstraint(
      decision.getAdvices(),
      FunctionUtil.sink()
    );
    return obligationHandlers.and(adviceHandlers);
  }

  /**
   * Build methodInvocationHandlers handlers
   * @param decision Decision
   * @returns Runnable handlers
   */
  private methodInvocationHandlers(decision: Decision) {
    const obligationHandlers = this.obligation(
      this.constructMethodInvocationHandlersForConstraints(
        decision.getObligations(),
        this._removeUnhandledObligation.bind(this)
      )
    );
    const adviceHandlers = this.advice(
      this.constructMethodInvocationHandlersForConstraints(
        decision.getAdvices(),
        FunctionUtil.sink()
      )
    );
    return this.consumeWithBoth(obligationHandlers, adviceHandlers);
  }

  private replaceHandler(resource: any) {
    //TODO check how this method is woriking in spring
    if (resource === "") {
      return FunctionUtil.sink();
    }

    return (t) => {
      return t;
    };
  }

  //---------------------------------------------------------------------------------------------------------------------
  // bundle helper methods
  //---------------------------------------------------------------------------------------------------------------------

  /**
   * Construct runnable handlers for constraints
   * @param signal Signal
   * @param constraints Constraints
   * @param onHandlerFound Callback Function
   * @returns Runnable handlers
   */
  private constructRunnableHandlersForConstraints(
    signal: string,
    constraints: object[],
    onHandlerFound: (constraint: any) => void
  ): () => void {
    let handler = () => {};

    if (constraints.length === 0) {
      return handler;
    }

    constraints.forEach((constraint: any) => {
      this.runnableHandlersForSignalContainer
        .filter((constraintHandler) => constraintHandler.getSignal() === signal)
        .forEach((constraintHandler) => {
          if (constraintHandler.isResponsible(constraint)) {
            handler = this.runBoth(
              handler,
              constraintHandler.getHandler(constraint)
            );
            onHandlerFound(constraint);
          }
        });
    });

    return handler;
  }

  /**
   * Construct subscription handlers for constraints
   * @param constraints Constraints
   * @param onHandlerFound Callback Function
   * @returns Runnable handlers
   */
  private constructSubscriptionHandlersForConstraints(
    constraints: object[],
    onHandlerFound: (constraint: any) => void
  ): (t) => void {
    let handler = FunctionUtil.sink();

    if (constraints.length === 0) {
      return handler;
    }

    constraints.forEach((constraint: any) => {
      this.subscriptionHandlersContainer.forEach((constraintHandler) => {
        if (constraintHandler.isResponsible(constraint)) {
          handler = this.consumeWithBoth(
            handler,
            constraintHandler.getHandler(constraint)
          );
          onHandlerFound(constraint);
        }
      });
    });

    return handler;
  }

  /**
   * Construct request handlers for constraints
   * @param constraints Constraints
   * @param onHandlerFound Callback Function
   * @returns Runnable handlers
   */
  private constructRequestHandlersForConstraints(
    constraints: object[],
    onHandlerFound: (constraint: any) => void
  ): (t) => void {
    let handler = FunctionUtil.sink();

    if (constraints.length === 0) {
      return handler;
    }

    constraints.forEach((constraint: any) => {
      this.requestHandlerContainer.forEach((constraintHandler) => {
        if (constraintHandler.isResponsible(constraint)) {
          handler = this.consumeWithBoth(
            handler,
            constraintHandler.getHandler(constraint)
          );
          onHandlerFound(constraint);
        }
      });
    });

    return handler;
  }

  /**
   * Construct onNext handlers for constraints
   * @param constraints Constraints
   * @param onHandlerFound Callback Function
   * @returns Runnable handlers
   */
  private constructOnNextHandlersForConstraints(
    constraints: object[],
    onHandlerFound: (constraint: any) => void
  ): (t) => void {
    let handler = FunctionUtil.sink();

    if (constraints.length === 0) {
      return handler;
    }

    constraints.forEach((constraint: any) => {
      this.onNextHandlersContainer.forEach((constraintHandler) => {
        if (constraintHandler.isResponsible(constraint)) {
          handler = this.consumeWithBoth(
            handler,
            constraintHandler.getHandler(constraint)
          );
          onHandlerFound(constraint);
        }
      });
    });

    return handler;
  }

  /**
   * Construct mapNext handlers for constraints
   * @param constraints Constraints
   * @param onHandlerFound Callback Function
   * @returns Runnable handlers
   */
  private constructMapNextHandlersForConstraints(
    constraints: object[],
    onHandlerFound: (constraint: any) => void
  ) {
    let handler = FunctionUtil.sink();

    if (constraints.length === 0) {
      return handler;
    }

    constraints.forEach((constraint: any) => {
      this.onMapNextHandlersContainer.forEach((constraintHandler) => {
        if (constraintHandler.isResponsible(constraint)) {
          onHandlerFound(constraint);
          this.prioritizedHandlers.push({
            priority: constraintHandler.getPriority(),
            object: constraintHandler.getHandler(constraint),
          });
        }
      });
    });

    this.prioritizedHandlers.sort((a, b) => a.priority - b.priority);

    this.prioritizedHandlers.forEach((handlerObject) => {
      handler = this.mapBoth(handler, handlerObject.object);
    });

    return handler;
  }

  /**
   * Construct onError handlers for constraints
   * @param constraints Constraints
   * @param onHandlerFound Callback Function
   * @returns Runnable handlers
   */
  private constructOnErrorHandlersForConstraints(
    constraints: object[],
    onHandlerFound: (constraint: any) => void
  ) {
    let handler = FunctionUtil.sink();

    if (constraints.length === 0) {
      return handler;
    }

    constraints.forEach((constraint: any) => {
      this.onErrorHandlersContainer.forEach((constraintHandler) => {
        if (constraintHandler.isResponsible(constraint)) {
          handler = this.consumeWithBoth(
            handler,
            constraintHandler.getHandler(constraint)
          );
          onHandlerFound(constraint);
        }
      });
    });

    return handler;
  }

  /**
   * Construct filter handlers for constraints
   * @param constraints Constraints
   * @param onHandlerFound Callback Function
   * @returns Runnable handlers
   */
  private constructFilterHandlersForConstraint(
    constraints: object[],
    onHandlerFound: (constraint: any) => void
  ) {
    // let handler = new Predicate<object>(() => true);
    let handlers = FunctionUtil.all();

    if (constraints.length === 0) {
      return handlers;
    }

    constraints.forEach((constraint: any) => {
      this.filterConstraintHandlersContainer.forEach((constraintHandler) => {
        if (constraintHandler.isResponsible(constraint)) {
          onHandlerFound(constraint);
          handlers = handlers.and(constraintHandler.getHandler(constraint));
        }
      });
    });

    return handlers;
  }

  /**
   * Construct methodInvocation handlers for constraints
   * @param constraints Constraints
   * @param onHandlerFound Callback Function
   * @returns Runnable handlers
   */
  private constructMethodInvocationHandlersForConstraints(
    constraints: object[],
    onHandlerFound: (constraint: any) => void
  ) {
    let handler = FunctionUtil.sink();

    if (constraints.length === 0) {
      return handler;
    }

    constraints.forEach((constraint: any) => {
      this.methodInvocationHandlersContainer.forEach((constraintHandler) => {
        if (constraintHandler.isResponsible(constraint)) {
          handler = this.consumeWithBoth(
            handler,
            constraintHandler.getHandler(constraint)
          );
          onHandlerFound(constraint);
        }
      });
    });

    return handler;
  }

  /**
   * Run both handlers as one runnable
   * @param handler1 Handler 1
   * @param handler2 Hadnler 2
   * @returns runnable for both handlers
   */
  private runBoth(handler1: () => void, handler2: () => void): () => void {
    return () => {
      handler1();
      handler2();
    };
  }

  /**
   * Map both handlers as one runnable
   * @param first First Handler
   * @param second Second Handler
   * @returns A runnable for both handlers
   */
  private mapBoth<T>(first: (t: T) => T, second: (t: T) => T): (t: T) => T {
    return (t: T) => second(first(t));
  }

  /**
   * Execute both handlers as one runnable with Input
   * @param a Handler 1
   * @param b Handler 2
   * @returns a runnable for both handlers
   */
  private consumeWithBoth(a: any, b: any) {
    return (t) => {
      a(t);
      b(t);
    };
  }

  /**
   * Build runnable handlers for obligations with input
   * @param handlers Handler
   * @returns Result of handler
   */
  private obligation(handlers: (t) => void): (t) => void {
    return (t) => {
      try {
        return handlers(t);
      } catch (error) {
        throw error;
      }
    };
  }

  /**
   * Build runnable handlers for advices with input
   * @param handlers Handler
   * @returns Result of handler
   */
  private advice(handlers: (t) => void): (t) => void {
    return (t) => {
      try {
        return handlers(t);
      } catch (error) {
        throw error;
      }
    };
  }

  /**
   * Build runnable handlers for obligations
   * @param handlers Handler
   * @returns Result of handler
   */
  private obligationRunnable(handlers: () => void): () => void {
    return () => {
      try {
        handlers();
      } catch (error) {
        throw error;
      }
    };
  }

  /**
   * Build runnable handlers for obligations
   * @param handlers Handler
   * @returns Result of handler
   */
  private adviceRunnable(handlers: () => void): () => void {
    return () => {
      try {
        handlers();
      } catch (error) {
        throw error;
      }
    };
  }
}
