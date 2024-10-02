import { Observable, Subscriber, Subscription } from "rxjs";
import { AccessDeniedException } from "../constraints/providers/AccessDeniedException";
import { ReactiveConstraintHandlerBundle } from "../constraints/ReactiveConstraintHandlerBundle";
import { BlockingConstraintHandlerBundle } from "../constraints/BlockingConstraintHandlerBundle";

/**
 * WrapperObservableHelper class which extends/overrides the Observable
 * to handle the data and control the access to the data
 * based on the decision of the PDP.
 */
export class WrapperObservableHelper<T> extends Observable<T> {
  private killIfDenied: boolean;
  private readDataAllowed: boolean;
  private bHandleAccessDenied: boolean;
  private reactiveBundle: ReactiveConstraintHandlerBundle<T>;
  private blockingBundle: BlockingConstraintHandlerBundle<T>;
  private sourceObservable?: Observable<T>;
  private sourceSubscription?: Subscription;

  /**
   * Creates a new WrapperObservableHelper.
   * @param options Options for the WrapperObservableHelper
   */
  constructor(options) {
    super((subscriber: Subscriber<T>) => {
      if (!this.sourceObservable) {
        throw new Error("Source Observable is not set.");
      }

      this.sourceSubscription = this.sourceObservable.subscribe({
        next: (value: T) => {
          if (this.readDataAllowed) {
            if (this.blockingBundle) {
              this.blockingBundle.handleAllOnNextConstraints(value);
            }
            if (this.reactiveBundle) {
              this.reactiveBundle?.handleAllOnNextConstraints(value);
            }
            subscriber.next(value);
          } else if (this.killIfDenied) {
            if (this.blockingBundle) {
              this.blockingBundle.handleAllOnErrorConstraints(
                new AccessDeniedException(
                  "Access Denied. Action not permitted."
                )
              );
            }
            if (this.reactiveBundle) {
              this.reactiveBundle?.handleAllOnErrorConstraints(
                new AccessDeniedException(
                  "Access Denied. Action not permitted."
                )
              );
            }
            subscriber.error(
              new AccessDeniedException("Access Denied. Action not permitted.")
            );
          } else {
            if (this.getHandleAccessDenied()) {
              this.handleAccessDenied();
            }
            subscriber.next();
          }
        },
        error: (err) => {
          if (this.blockingBundle)
            this.blockingBundle.handleAllOnErrorConstraints(err);
          if (this.reactiveBundle)
            this.reactiveBundle?.handleAllOnErrorConstraints(err);
          subscriber.error(err);
        },
        complete: () => {
          if (this.reactiveBundle)
            this.reactiveBundle?.handleOnEndSignalConstraints();
          subscriber.complete();
        },
      });

      return () => this.sourceSubscription?.unsubscribe();
    });

    this.readDataAllowed = options.readDataAllowed;
    this.killIfDenied = options.killIfDenied;
    this.bHandleAccessDenied = options.handleAccessDenied;
  }

  /**
   * Returns the observable.
   * @returns @this
   */
  getWrapperObservable() {
    return this;
  }

  /**
   * Sets the readDataAllowed property.
   * @param readDataAllowed ReadDataAllowed
   * @returns WrapperStreamHelper
   */
  setReadDataAllowed(readDataAllowed: boolean) {
    this.readDataAllowed = readDataAllowed;
    return this;
  }

  /**
   * Set and evaluate the type of bundle.
   * @param bundle The bundle to set
   */
  setBundle(
    bundle:
      | ReactiveConstraintHandlerBundle<any>
      | BlockingConstraintHandlerBundle<T>
  ) {
    if (bundle instanceof ReactiveConstraintHandlerBundle)
      this.reactiveBundle = bundle;
    else this.blockingBundle = bundle;
  }

  /**
   * Handles the access denied error.
   */
  handleAccessDenied() {
    if (this.blockingBundle) {
      this.blockingBundle.handleAllOnErrorConstraints(
        new Error("Access Denied. Action not permitted.")
      );
    }
    if (this.reactiveBundle) {
      this.reactiveBundle?.handleAllOnErrorConstraints(
        new Error("Access Denied. Action not permitted.")
      );
    }
  }

  /**
   * Sets the source observable.
   * @param source The source observable
   */
  setSource(source: Observable<T>) {
    this.sourceObservable = source;
  }

  /**
   * Returns the bHandleAccessDenied property.
   * @returns bHandleAccessDenied
   */
  getHandleAccessDenied() {
    return this.bHandleAccessDenied;
  }
}
