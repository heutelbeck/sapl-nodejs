import { FunctionUtil } from "../../../src/classes/constraints/FunctionUtil";
import { describe, it, expect } from "@jest/globals";

describe("FunctionUtil", () => {
  describe("sink", () => {
    it("should return a function doing nothing", () => {
      const fn = FunctionUtil.sink();
      expect(fn("test")).toBe("test");
    });
  });

  describe("longSink", () => {
    it("should return a function doing nothing for long values", () => {
      const fn = FunctionUtil.longSink();
      expect(fn(1)).toBe(1);
    });
  });

  describe("all", () => {
    it("should return a predicate that always returns true", () => {
      const predicate = FunctionUtil.all();
      expect(predicate.test({ data: "Test" })).toBe(true);
    });
  });

  describe("noop", () => {
    it("should return a Runnable doing nothing", () => {
      const runnable = FunctionUtil.noop();
      expect(runnable).not.toBeUndefined();
    });
  });
});
