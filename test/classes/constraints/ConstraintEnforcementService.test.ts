import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { ConstraintEnforcementService } from "../../../src/classes/constraints/ConstraintEnforcementService";
import {
  Event,
  RunnableConstraintHandlerProvider,
} from "../../../src/interfaces/constraints/RunnableConstraintHandlerProvider";
import { MappingConstraintHandlerProvider } from "../../../src/interfaces/constraints/MappingConstraintHandlerProvider";
import { HasPriority } from "../../../src/interfaces/constraints/HasPriority";
import { MethodInvocationConstraintHandlerProvider } from "../../../src/interfaces/constraints/MethodInvocationConstraintHandlerProvider";
import { ConsumerConstraintHandlerProvider } from "../../../src/interfaces/ConsumerConstraintHandlerProvider";
import { ErrorHandlerProvider } from "../../../src/interfaces/constraints/ErrorHandlerProvider";
import { ErrorMappingConstraintHandlerProvider } from "../../../src/interfaces/constraints/ErrorMappingConstraintHandlerProvider";
import { FilterPredicateConstraintHandlerProvider } from "../../../src/interfaces/constraints/FilterPredicateConstraintHandlerProvider";
import { Predicate } from "../../../src/classes/Predicate";
import { SubscriptionHandlerProvider } from "../../../src/interfaces/constraints/SubscriptionHandlerProvider";
import { RequestHandlerProvider } from "../../../src/interfaces/constraints/RequestHandlerProvider";
import { Decision } from "../../../src/classes/Decision";
describe("ConstraintEnforcementService", () => {
  let service: ConstraintEnforcementService;

  beforeEach(() => {
    service = new ConstraintEnforcementService();
  });

  it("should add a constraint handler", () => {
    class RunnableConstraintHandlerProviderClass
      implements RunnableConstraintHandlerProvider
    {
      getSignal(): Event {
        return Event.ON_DECISION;
      }
      getHandler(constraint: object) {
        return {};
      }
      isResponsible(constraint: object): boolean {
        return true;
      }
    }

    const handler = new RunnableConstraintHandlerProviderClass();

    service.addConstraintHandler(handler);

    // Assert that the handler was added
    expect(service["registeredRunnableHandlersForSignalContainer"]).toContain(
      handler
    );

    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    // Assert that the bundle was created
    expect(bundle).toBeDefined();
  });

  it("should add a mapping constraint handler", () => {
    class MappingConstraintHandlerProviderClass
      implements MappingConstraintHandlerProvider
    {
      getHandler(constraint: object) {
        return {};
      }
      isResponsible(constraint: object): boolean {
        return true;
      }
      getPriority(): number {
        return 1;
      }
      compareTo(other: HasPriority): number {
        return 1;
      }
    }
    const handler = new MappingConstraintHandlerProviderClass();
    service.addMappingConstraintHandler(handler);

    // Assert that the handler was added
    expect(service["registeredOnMapNextHandlersContainer"]).toContain(handler);

    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    // Assert that the bundle was created
    expect(bundle).toBeDefined();
  });

  it("should add a method invocation constraint handler", () => {
    class MethodInvocationConstraintHandlerProviderClass
      implements MethodInvocationConstraintHandlerProvider
    {
      getHandler(constraint: object) {
        return jest.fn();
      }
      isResponsible(constraint: object): boolean {
        return true;
      }
    }
    const handler = new MethodInvocationConstraintHandlerProviderClass();
    service.addMethodInvocationConstraintHandler(handler);

    // Assert that the handler was added
    expect(service["registeredMethodInvocationHandlersContainer"]).toContain(
      handler
    );

    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    // Assert that the bundle was created
    expect(bundle).toBeDefined();
  });

  it("should return a on next constraint handler", () => {
    class ConsumerConstraintHandlerProviderClass
      implements ConsumerConstraintHandlerProvider
    {
      getHandler(constraint: object) {
        return jest.fn();
      }
      isResponsible(constraint: object): boolean {
        return true;
      }
    }

    const handler = new ConsumerConstraintHandlerProviderClass();
    service.addOnNextConstraintHandler(handler);

    // Assert that the handler was added
    expect(service["registeredOnNextHandlersContainer"]).toContain(handler);

    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    // Assert that the bundle was created
    expect(bundle).toBeDefined();
  });

  it("should return a on error constraint handler", () => {
    class ErrorHandlerProviderClass implements ErrorHandlerProvider {
      getHandler(constraint: object) {
        return jest.fn();
      }
      isResponsible(constraint: object): boolean {
        return true;
      }
    }

    const handler = new ErrorHandlerProviderClass();
    service.addOnErrorConstraintHandler(handler);

    // Assert that the handler was added
    expect(service["registeredOnErrorHandlersContainer"]).toContain(handler);

    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    // Assert that the bundle was created
    expect(bundle).toBeDefined();
  });

  it("should return a on map error constraint handler", () => {
    class ErrorMappingConstraintHandlerProviderClass
      implements ErrorMappingConstraintHandlerProvider
    {
      getPriority(): number {
        return 1;
      }
      compareTo(other: HasPriority): number {
        return 1;
      }
      getHandler(constraint: object) {
        return jest.fn();
      }
      isResponsible(constraint: object): boolean {
        return true;
      }
    }

    const handler = new ErrorMappingConstraintHandlerProviderClass();
    service.addMapErrorConstraintHandler(handler);

    // Assert that the handler was added
    expect(service["registeredMapErrorHandlersContainer"]).toContain(handler);

    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    // Assert that the bundle was created
    expect(bundle).toBeDefined();
  });

  it("should return a filter predicate constraint handler", () => {
    class FilterPredicateConstraintHandlerProviderClass
      implements FilterPredicateConstraintHandlerProvider
    {
      getHandler(constraint: object): Predicate<object> {
        return new Predicate<object>(() => true);
      }
      getPriority(): number {
        return 1;
      }
      compareTo(other: HasPriority): number {
        return 1;
      }
      isResponsible(constraint: object): boolean {
        return true;
      }
    }

    const handler = new FilterPredicateConstraintHandlerProviderClass();
    service.addFilterConstraintHandler(handler);

    // Assert that the handler was added
    expect(service["registeredFilterConstraintHandlersContainer"]).toContain(
      handler
    );

    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    // Assert that the bundle was created
    expect(bundle).toBeDefined();
  });

  it("should return a on decision constraint handler", () => {
    class ConsumerConstraintHandlerProviderClass
      implements ConsumerConstraintHandlerProvider
    {
      getHandler(constraint: object): Predicate<object> {
        return new Predicate<object>(() => true);
      }
      getPriority(): number {
        return 1;
      }
      compareTo(other: HasPriority): number {
        return 1;
      }
      isResponsible(constraint: object): boolean {
        return true;
      }
    }

    const handler = new ConsumerConstraintHandlerProviderClass();
    service.addOnDecisionObligationHandler(handler);

    // Assert that the handler was added
    expect(
      service["registeredOnDecisionObligationHandlersContainer"]
    ).toContain(handler);

    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    // Assert that the bundle was created
    expect(bundle).toBeDefined();
  });

  it("should return a subscription constraint handler", () => {
    class SubscriptionHandlerProviderClass
      implements SubscriptionHandlerProvider
    {
      getHandler(constraint: object): Predicate<object> {
        return new Predicate<object>(() => true);
      }
      getPriority(): number {
        return 1;
      }
      compareTo(other: HasPriority): number {
        return 1;
      }
      isResponsible(constraint: object): boolean {
        return true;
      }
    }

    const handler = new SubscriptionHandlerProviderClass();
    service.addSubscriptionHandler(handler);

    // Assert that the handler was added
    expect(service["registeredSubscriptionHandlersContainer"]).toContain(
      handler
    );

    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    // Assert that the bundle was created
    expect(bundle).toBeDefined();
  });

  it("should return a request handler constraint handler", () => {
    class RequestHandlerProviderClass implements RequestHandlerProvider {
      getHandler(constraint: object): Predicate<object> {
        return new Predicate<object>(() => true);
      }
      getPriority(): number {
        return 1;
      }
      compareTo(other: HasPriority): number {
        return 1;
      }
      isResponsible(constraint: object): boolean {
        return true;
      }
    }

    const handler = new RequestHandlerProviderClass();
    service.addRequestHandler(handler);

    // Assert that the handler was added
    expect(service["registeredRequestHandlerContainer"]).toContain(handler);

    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    // Assert that the bundle was created
    expect(bundle).toBeDefined();
  });

  it("should return a blocking pre enforce bundle", () => {
    const bundle = service.blockingPreEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    expect(bundle).toBeDefined();
  });

  it("should return a blocking post enforce bundle", () => {
    const bundle = service.blockingPostEnforceBundleFor(
      new Decision({
        decision: "PERMIT",
        obligations: [
          {
            type: "filterJsonContent",
            actions: [
              { type: "blacken", path: "$.icd11Code", discloseLeft: 2 },
              { type: "delete", path: "$.diagnosis" },
            ],
          },
        ],
      })
    );

    expect(bundle).toBeDefined();
  });

  it("should return a new Error 'Unhandled obligations'", () => {
    expect(() => {
      service.reactiveTypeBundleFor(
        new Decision({
          decision: "PERMIT",
          obligations: [
            {
              type: "thisWillFail",
              actions: [{ type: "test", path: "test", discloseLeft: 2 }],
            },
          ],
        })
      );
    }).toThrowError("Unhandled obligations");

    expect(() => {
      service.blockingPreEnforceBundleFor(
        new Decision({
          decision: "PERMIT",
          obligations: [
            {
              type: "thisWillFail",
              actions: [{ type: "test", path: "test", discloseLeft: 2 }],
            },
          ],
        })
      );
    }).toThrowError("Unhandled obligations");

    expect(() => {
      service.blockingPostEnforceBundleFor(
        new Decision({
          decision: "PERMIT",
          obligations: [
            {
              type: "thisWillFail",
              actions: [{ type: "test", path: "test", discloseLeft: 2 }],
            },
          ],
        })
      );
    }).toThrowError("Unhandled obligations");
  });
});
