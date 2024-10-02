import { isObservable, map } from "rxjs";
import { TextHelper } from "./helper/TextHelper";

/**
 * A predicate is a function that returns a boolean value.
 * @param T The type of the argument to test.
 * For more information, see the [article about Java Predicate](https://docs.oracle.com/javase/8/docs/api/java/util/function/Predicate.html).
 */
export class Predicate<T> {
  private predicate: (arg: T) => boolean;

  /**
   * Constructor for the Predicate class.
   * @param predicate The predicate function.
   */
  constructor(predicate: (arg: T) => boolean) {
    this.predicate = predicate;
  }

  /**
   * Test the predicate with the given argument.
   * @param arg The argument to test.
   * @returns The result of the test.
   */
  test(arg: T): boolean {
    return this.predicate(arg);
  }

  /**
   * Evaluate the predicate with the given argument.
   * @param other another predicate
   * @returns the AND-result of this predicate and the other predicate
   */
  and(other: Predicate<T>): Predicate<T> {
    return new Predicate<T>((arg: T) => this.test(arg) && other.test(arg));
  }

  /**
   * Evaluate the predicate with the given argument.
   * @param other another predicate
   * @returns the OR-result of this predicate and the other predicate
   */
  or(other: Predicate<T>): Predicate<T> {
    return new Predicate<T>((arg: T) => this.test(arg) || other.test(arg));
  }

  /**
   * Returns a predicate that represents the logical negation of this predicate.
   * @returns the negation of this predicate
   */
  negate(): Predicate<T> {
    return new Predicate<T>((arg: T) => !this.test(arg));
  }

  /**
   * Returns a predicate that represents the logical equality of this predicate and the targetRef.
   * @param targetRef the target reference
   * @returns the equality predicate
   */
  static isEqual<U>(targetRef: U): Predicate<U> {
    return new Predicate<U>((arg: U) => arg === targetRef);
  }

  /**
   * Modify the value with the predicate .
   * @param targetRef the target reference
   * @returns the modified value
   */
  static handlePredicate(predicate: Predicate<any>, value: any) {
    if (value === undefined) {
      return;
    }

    if (isObservable(value)) {
      return value.pipe(map((v) => (predicate.test(v) ? v : undefined)));
    }

    if (value instanceof Buffer || ArrayBuffer.isView(value)) {
      value = TextHelper.decodeData(value);
    }

    if (Array.isArray(value)) {
      return value.filter((v) => predicate.test(v));
    }

    if (typeof value === "object") {
      return Predicate._handlePredicateObject(predicate, value);
    }

    return predicate.test(value) ? value : undefined;
  }

  /**
   * Modify the object values with the predicate.
   * @param predicate The predicate function.
   * @param value The value to test.
   * @returns The modified value.
   */
  private static _handlePredicateObject(predicate: Predicate<any>, value: any) {
    return Object.keys(value).reduce((acc, key) => {
      if (predicate.test(value[key])) {
        acc[key] = value[key];
      }
      return acc;
    }, {} as any);
  }
}
