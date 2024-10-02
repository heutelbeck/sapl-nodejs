import { Observable, of } from "rxjs";
import { Predicate } from "../../src/classes/Predicate";
import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";

describe("Predicate", () => {
  it("should return true when the predicate function returns true", () => {
    const predicate = new Predicate<number>((arg) => arg > 0);
    expect(predicate.test(5)).toBe(true);
  });

  it("should return false when the predicate function returns false", () => {
    const predicate = new Predicate<number>((arg) => arg > 0);
    expect(predicate.test(-5)).toBe(false);
  });

  it("should return true when both predicates return true", () => {
    const predicate1 = new Predicate<number>((arg) => arg > 0);
    const predicate2 = new Predicate<number>((arg) => arg < 10);
    const combinedPredicate = predicate1.and(predicate2);
    expect(combinedPredicate.test(5)).toBe(true);
  });

  it("should return false when one of the predicates returns false", () => {
    const predicate1 = new Predicate<number>((arg) => arg > 0);
    const predicate2 = new Predicate<number>((arg) => arg < 10);
    const combinedPredicate = predicate1.and(predicate2);
    expect(combinedPredicate.test(15)).toBe(false);
  });

  it("should return true when at least one of the predicates returns true", () => {
    const predicate1 = new Predicate<number>((arg) => arg > 0);
    const predicate2 = new Predicate<number>((arg) => arg < -10);
    const combinedPredicate = predicate1.or(predicate2);
    expect(combinedPredicate.test(5)).toBe(true);
  });

  it("should return false when both predicates return false", () => {
    const predicate1 = new Predicate<number>((arg) => arg > 0);
    const predicate2 = new Predicate<number>((arg) => arg < -10);
    const combinedPredicate = predicate1.or(predicate2);
    expect(combinedPredicate.test(-5)).toBe(false);
  });

  it("should return true when the predicate returns false", () => {
    const predicate = new Predicate<number>((arg) => arg > 0);
    const negatedPredicate = predicate.negate();
    expect(negatedPredicate.test(-5)).toBe(true);
  });

  it("should return true when the value is equal to the target reference", () => {
    const targetRef = "test";
    const isEqualPredicate = Predicate.isEqual(targetRef);
    expect(isEqualPredicate.test("test")).toBe(true);
  });

  it("should return false when the value is not equal to the target reference", () => {
    const targetRef = "test";
    const isEqualPredicate = Predicate.isEqual(targetRef);
    expect(isEqualPredicate.test("other")).toBe(false);
  });

  it("should return the value if it passes the predicate test", () => {
    const predicate = new Predicate<number>((arg) => arg > 0);
    const value = 5;
    const result = Predicate.handlePredicate(predicate, value);
    expect(result).toBe(value);
  });

  it("should return undefined if the value does not pass the predicate test", () => {
    const predicate = new Predicate<number>((arg) => arg > 0);
    const value = -5;
    const result = Predicate.handlePredicate(predicate, value);
    expect(result).toBeUndefined();
  });

  it("should return the filtered array if the value is an array", () => {
    const predicate = new Predicate<number>((arg) => arg > 0);
    const value = [1, -2, 3, -4, 5];
    const result = Predicate.handlePredicate(predicate, value);
    expect(result).toEqual([1, 3, 5]);
  });

  it("should return the filtered object if the value is an object", () => {
    const predicate = new Predicate<number>((arg) => arg > 0);
    const value = { a: 1, b: -2, c: 3, d: -4, e: 5 };
    const result = Predicate.handlePredicate(predicate, value);
    expect(result).toEqual({ a: 1, c: 3, e: 5 });
  });

  it("should return the transformed observable if the value is an observable", () => {
    const predicate = new Predicate<number>((arg) => arg > 0);
    const value = of(1, -2, 3, -4, 5);
    const result = Predicate.handlePredicate(predicate, value);
    <Observable<any>>result.subscribe((data) => {
      expect(data).not.toBe(-2);
      expect(data).not.toBe(-4);
    });
  });

  it("should return empty if value is undefined", () => {
    const predicate = new Predicate<number>((arg) => arg > 0);
    const value = undefined;
    const result = Predicate.handlePredicate(predicate, value);
    expect(result).toBeUndefined();
  });

  it("should decode the buffer if the value is a buffer", () => {
    const predicate = new Predicate<string>((arg) => true);
    const data = JSON.stringify({ test: "test" });
    const value = new TextEncoder().encode(data);
    const result = Predicate.handlePredicate(predicate, value);
    expect(JSON.stringify(result)).toBe(data);
  });
});
