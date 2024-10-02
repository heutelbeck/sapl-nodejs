import { beforeEach, describe, expect, it } from "@jest/globals";
import { ContentFilter } from "../../../../src/classes/constraints/providers/ContentFilter";

describe("ContentFilter", () => {
  describe("predicateFromConditions", () => {
    it("should return a predicate that always evaluates to true when no conditions are present", () => {
      const constraint = {};
      const objectMapper = {};

      const predicate = ContentFilter.predicateFromConditions(
        constraint,
        objectMapper
      );

      expect(predicate.test({})).toBe(true);
      expect(predicate.test({ foo: "bar" })).toBe(true);
    });

    it("should return a predicate that evaluates to true when all conditions are met", () => {
      const equalsConstraint = {
          conditions: [{ path: "foo", type: "==", value: "bar" }],
        },
        leConstraint = {
          conditions: [{ path: "baz", type: "<=", value: 10 }],
        },
        geConstraint = {
          conditions: [{ path: "baz", type: ">=", value: 10 }],
        },
        ltConstraint = {
          conditions: [{ path: "baz", type: "<", value: 10 }],
        },
        gtConstraint = {
          conditions: [{ path: "baz", type: ">", value: 10 }],
        };

      const objectMapper = {};

      const eqPredicate = ContentFilter.predicateFromConditions(
          equalsConstraint,
          objectMapper
        ),
        lePredicate = ContentFilter.predicateFromConditions(
          leConstraint,
          objectMapper
        ),
        gePredicate = ContentFilter.predicateFromConditions(
          geConstraint,
          objectMapper
        ),
        ltPredicate = ContentFilter.predicateFromConditions(
          ltConstraint,
          objectMapper
        ),
        gtPredicate = ContentFilter.predicateFromConditions(
          gtConstraint,
          objectMapper
        );

      expect(eqPredicate.test(JSON.stringify({ foo: "bar", baz: 20 }))).toBe(
        true
      );
      expect(eqPredicate.test(JSON.stringify({ foo: "baz", baz: 20 }))).toBe(
        false
      );

      expect(lePredicate.test(JSON.stringify({ foo: "baz", baz: 5 }))).toBe(
        true
      );
      expect(lePredicate.test(JSON.stringify({ foo: "baz", baz: 10 }))).toBe(
        true
      );
      expect(lePredicate.test(JSON.stringify({ foo: "baz", baz: 15 }))).toBe(
        false
      );

      expect(gePredicate.test(JSON.stringify({ foo: "baz", baz: 15 }))).toBe(
        true
      );
      expect(gePredicate.test(JSON.stringify({ foo: "baz", baz: 10 }))).toBe(
        true
      );
      expect(gePredicate.test(JSON.stringify({ foo: "baz", baz: 5 }))).toBe(
        false
      );

      expect(ltPredicate.test(JSON.stringify({ foo: "baz", baz: 5 }))).toBe(
        true
      );
      expect(ltPredicate.test(JSON.stringify({ foo: "baz", baz: 10 }))).toBe(
        false
      );

      expect(gtPredicate.test(JSON.stringify({ foo: "baz", baz: 15 }))).toBe(
        true
      );
      expect(gtPredicate.test(JSON.stringify({ foo: "baz", baz: 10 }))).toBe(
        false
      );
    });

    it("should throw an exception when a condition is not valid", () => {
      const constraint = {
        conditions: [
          { path: "foo", type: "==", value: "bar" },
          { path: "baz", value: 10 }, // Missing 'type' property
        ],
      };
      const objectMapper = {};

      expect(() => {
        ContentFilter.predicateFromConditions(constraint, objectMapper);
      }).toThrow();
    });
  });

  describe("getHandler", () => {
    it("should return a function that applies the transformation and predicate to the payload", () => {
      const replaceConstraint = {
          conditions: [{ path: "foo", type: "==", value: "bar" }],
          actions: [{ path: "baz", type: "replace", replacement: "qux" }],
        },
        blackenConstraint = {
          conditions: [{ path: "foo", type: "==", value: "bar" }],
          actions: [
            {
              path: "foo",
              type: "blacken",
              discloseLeft: 2,
            },
            {
              path: "baz",
              type: "blacken",
              discloseRight: 2,
            },
          ],
        },
        deleteConstraint = {
          conditions: [{ path: "foo", type: "==", value: "bar" }],
          actions: [
            {
              type: "delete",
              path: "foo",
            },
          ],
        };
      const objectMapper = {};

      const payload = JSON.stringify({ data: { foo: "bar", baz: "hello" } });

      const replaceHandler = ContentFilter.getHandler(
          replaceConstraint,
          objectMapper
        ),
        blackenHandler = ContentFilter.getHandler(
          blackenConstraint,
          objectMapper
        ),
        deleteHandler = ContentFilter.getHandler(
          deleteConstraint,
          objectMapper
        );

      const transformedReplacePayload = replaceHandler(payload);
      const transformedBlackenPayload = blackenHandler(payload);
      const transformedDeletePayload = deleteHandler(payload);

      expect(transformedReplacePayload).toEqual({
        data: { foo: "bar", baz: "qux" },
      });
      expect(transformedBlackenPayload).toEqual({
        data: { foo: "ba█", baz: "███lo" },
      });
      expect(transformedDeletePayload).toEqual({
        data: { foo: null, baz: "hello" },
      });
    });

    it("should return the original payload when no conditions are present", () => {
      const constraint = {};
      const objectMapper = {};

      const handler = ContentFilter.getHandler(constraint, objectMapper);

      const payload = { foo: "bar", baz: "hello" };
      const transformedPayload = handler(payload);

      expect(transformedPayload).toBe(payload);
    });
  });
});
