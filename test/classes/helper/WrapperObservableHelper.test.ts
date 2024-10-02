import { Observable, Subscriber } from "rxjs";
import { Decision } from "../../../src/classes/Decision";
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { WrapperObservableHelper } from "../../../src/classes/helper/WrapperObservableHelper";
import { ConstraintEnforcementService } from "../../../src/classes/constraints/ConstraintEnforcementService";
import { BlockingConstraintHandlerBundle } from "../../../src/classes/constraints/BlockingConstraintHandlerBundle";
import { ReactiveConstraintHandlerBundle } from "../../../src/classes/constraints/ReactiveConstraintHandlerBundle";

describe("WrapperObservableHelper", () => {
  let wrapperObservable: WrapperObservableHelper<number>;
  let wrapperObservableWithError: WrapperObservableHelper<number>;
  let wrapperObservableKillIfDenied: WrapperObservableHelper<number>;
  let sourceObservable: Observable<number>;
  let sourceObservableWithError: Observable<number>;
  let sourceObservableKillIfDenied: Observable<number>;
  let blockingPreEnforceBundle: BlockingConstraintHandlerBundle<any>;
  let blockingPostEnforceBundle: BlockingConstraintHandlerBundle<any>;
  let reactiveBundle: ReactiveConstraintHandlerBundle<any>;

  beforeEach(() => {
    sourceObservable = new Observable<number>(
      (subscriber: Subscriber<number>) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.next(4);
        subscriber.complete();
      }
    );
    sourceObservableWithError = new Observable<number>(
      (subscriber: Subscriber<number>) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.error("Error");
        setTimeout(() => {
          subscriber.next(4);
          subscriber.complete();
        }, 1000);
      }
    );
    sourceObservableKillIfDenied = new Observable<number>(
      (subscriber: Subscriber<number>) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.error("Error");
        setTimeout(() => {
          subscriber.next(4);
          subscriber.complete();
        }, 1000);
      }
    );

    blockingPreEnforceBundle =
      new ConstraintEnforcementService().blockingPreEnforceBundleFor(
        new Decision({ decision: "PERMIT" })
      );
    blockingPostEnforceBundle =
      new ConstraintEnforcementService().blockingPostEnforceBundleFor(
        new Decision({ decision: "PERMIT" })
      );
    reactiveBundle = new ConstraintEnforcementService().reactiveTypeBundleFor(
      new Decision({ decision: "PERMIT" })
    );

    wrapperObservable = new WrapperObservableHelper({
      readDataAllowed: true,
      killIfDenied: false,
      handleAccessDenied: true,
    });
    wrapperObservableWithError = new WrapperObservableHelper({
      readDataAllowed: true,
      killIfDenied: false,
      handleAccessDenied: true,
    });
    wrapperObservableKillIfDenied = new WrapperObservableHelper({
      readDataAllowed: false,
      killIfDenied: true,
      handleAccessDenied: true,
    });
    wrapperObservable.setSource(sourceObservable);
    wrapperObservableWithError.setSource(sourceObservableWithError);
    wrapperObservableKillIfDenied.setSource(sourceObservableKillIfDenied);
  });

  it("should create an instance of WrapperObservableHelper", () => {
    expect(wrapperObservable.getWrapperObservable()).toBeInstanceOf(
      WrapperObservableHelper
    );
  });

  it("should throw 'Source Observable is not set.'", () => {
    let localWrapperObservable = new WrapperObservableHelper({
      readDataAllowed: true,
      killIfDenied: false,
      handleAccessDenied: true,
    });
    localWrapperObservable.subscribe({
      next: (value) => {},
      error: (err) => {
        expect(err.message).toBe("Source Observable is not set.");
      },
    });
  });

  it("should set the readDataAllowed property", () => {
    const readDataAllowed = false;
    wrapperObservable.setReadDataAllowed(readDataAllowed);
    expect(wrapperObservable["readDataAllowed"]).toBe(readDataAllowed);
  });

  it("should set the bundle", () => {
    wrapperObservable.setBundle(reactiveBundle);
    expect(wrapperObservable["reactiveBundle"]).toBe(reactiveBundle);
  });

  it("should throw an AccessDeniedException", () => {
    let spyOnBlockingHandleAllOnErrorConstraints = jest.spyOn(
      BlockingConstraintHandlerBundle.prototype,
      "handleAllOnErrorConstraints"
    );
    let spyOnReactiveHandleAllOnErrorConstraints = jest.spyOn(
      ReactiveConstraintHandlerBundle.prototype,
      "handleAllOnErrorConstraints"
    );
    wrapperObservable.setBundle(reactiveBundle);
    wrapperObservable.setBundle(blockingPreEnforceBundle);

    wrapperObservable.handleAccessDenied();

    expect(spyOnBlockingHandleAllOnErrorConstraints).toBeCalled();
    expect(spyOnReactiveHandleAllOnErrorConstraints).toBeCalled();
  });

  it("should get the handleAccessDenied property", () => {
    const handleAccessDenied = wrapperObservable.getHandleAccessDenied();
    expect(handleAccessDenied).toBe(true);
  });

  it("should get the content from subscribtion", () => {
    wrapperObservable.setReadDataAllowed(true);
    wrapperObservable.setBundle(reactiveBundle);
    wrapperObservable
      .subscribe((value) => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(4);
      })
      .unsubscribe();
  });

  it("should get the content from subscribtion with blocking Bundle", () => {
    wrapperObservable.setReadDataAllowed(true);
    wrapperObservable.setBundle(blockingPreEnforceBundle);
    wrapperObservable
      .subscribe((value) => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(4);
      })
      .unsubscribe();
  });

  it("should get the content from subscribtion with reactive Bundle", () => {
    wrapperObservable.setReadDataAllowed(true);
    wrapperObservable.setBundle(blockingPostEnforceBundle);
    wrapperObservable
      .subscribe((value) => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(4);
      })
      .unsubscribe();
  });

  it("should get undefinied from subscribtion", () => {
    wrapperObservable.setReadDataAllowed(false);
    wrapperObservable
      .subscribe((value) => {
        expect(value).toBeUndefined();
      })
      .unsubscribe();
  });

  it("should get the error from subscribtion", () => {
    wrapperObservableWithError.setReadDataAllowed(true);
    wrapperObservableWithError.subscribe({
      next: (value) => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(4);
      },
      error: (err) => {
        expect(err).toBe("Error");
      },
    });
  });

  it("should get the error from subscribtion with blocking bundle", () => {
    wrapperObservableWithError.setReadDataAllowed(true);
    wrapperObservableWithError.setBundle(blockingPreEnforceBundle);
    wrapperObservableWithError
      .subscribe({
        next: (value) => {
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(4);
        },
        error: (err) => {
          expect(err).toBe("Error");
        },
      })
      .unsubscribe();
  });

  it("should get the error from subscribtion with reactive bundle", () => {
    wrapperObservableWithError.setReadDataAllowed(true);
    wrapperObservableWithError.setBundle(reactiveBundle);
    wrapperObservableWithError
      .subscribe({
        next: (value) => {
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(4);
        },
        error: (err) => {
          expect(err).toBe("Error");
        },
      })
      .unsubscribe();
  });

  it("should get a AccesDeniedException from subscribtion with blocking bundle", () => {
    wrapperObservableKillIfDenied.setBundle(blockingPreEnforceBundle);
    wrapperObservableKillIfDenied
      .subscribe({
        next: (value) => {
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(4);
        },
        error: (err) => {
          expect(err.message).toBe("Access Denied. Action not permitted.");
        },
      })
      .unsubscribe();
  });

  it("should get AccesDeniedException from subscribtion with reactive bundle", () => {
    wrapperObservableKillIfDenied.setBundle(reactiveBundle);
    wrapperObservableKillIfDenied
      .subscribe({
        next: (value) => {
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(4);
        },
        error: (err) => {
          expect(err.message).toBe("Access Denied. Action not permitted.");
        },
      })
      .unsubscribe();
  });
});
