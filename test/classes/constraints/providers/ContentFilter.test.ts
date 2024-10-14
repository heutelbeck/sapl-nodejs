import { beforeEach, describe, expect, it } from "@jest/globals";
import { ContentFilter } from "../../../../src/classes/constraints/providers/ContentFilter";
import { AccessConstraintViolationException } from "../../../../src/classes/constraints/providers/AccessConstraintViolationException";

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

  describe("noConditionsPresent", () => {
    it("should return true when conditions are undefined", () => {
      const constraint = {};
      const result = ContentFilter["noConditionsPresent"](constraint);
      expect(result).toBe(true);
    });

    it("should return true when conditions are null", () => {
      const constraint = { conditions: null };
      const result = ContentFilter["noConditionsPresent"](constraint);
      expect(result).toBe(true);
    });

    it("should return false when conditions are present", () => {
      const constraint = {
        conditions: [{ path: "foo", type: "==", value: "bar" }],
      };
      const result = ContentFilter["noConditionsPresent"](constraint);
      expect(result).toBe(false);
    });
  });

  describe("equalsCondition", () => {
    it("should return a predicate that evaluates to true when the value matches the string condition", () => {
      const condition = { path: "foo", type: "==", value: "bar" };
      const predicate = ContentFilter["equalsCondition"](condition, "foo");

      expect(predicate.test({ foo: "bar" })).toBe(true);
      expect(predicate.test({ foo: "baz" })).toBe(false);
    });

    it("should return a predicate that evaluates to true when the value matches the number condition", () => {
      const condition = { path: "foo", type: "==", value: 42 };
      const predicate = ContentFilter["equalsCondition"](condition, "foo");

      expect(predicate.test({ foo: 42 })).toBe(true);
      expect(predicate.test({ foo: 43 })).toBe(false);
    });

    it("should throw an exception when the value is not a string or number", () => {
      const condition = { path: "foo", type: "==", value: { bar: "baz" } };

      expect(() => {
        ContentFilter["equalsCondition"](condition, "foo");
      }).toThrow(
        new AccessConstraintViolationException(
          ContentFilter["NOT_A_VALID_PREDICATE_CONDITION"] + condition
        )
      );
    });

    it("should return a predicate that evaluates to false when the path does not exist", () => {
      const condition = { path: "foo", type: "==", value: "bar" };
      const predicate = ContentFilter["equalsCondition"](condition, "foo");

      expect(predicate.test({})).toBe(false);
    });

    it("should return a predicate that evaluates to false when the value at the path is not a string", () => {
      const condition = { path: "foo", type: "==", value: "bar" };
      const predicate = ContentFilter["equalsCondition"](condition, "foo");

      expect(predicate.test({ foo: 42 })).toBe(false);
    });
  });

  describe("notEqualsCondition", () => {
    it("should return a predicate that evaluates to true when the value does not match the string condition", () => {
      const condition = { path: "foo", type: "!=", value: "bar" };
      const predicate = ContentFilter["notEqualsCondition"](condition, "foo");

      expect(predicate.test({ foo: "baz" })).toBe(true);
      expect(predicate.test({ foo: "bar" })).toBe(false);
    });

    it("should return a predicate that evaluates to true when the value does not match the number condition", () => {
      const condition = { path: "foo", type: "!=", value: 42 };
      const predicate = ContentFilter["notEqualsCondition"](condition, "foo");

      expect(predicate.test({ foo: 43 })).toBe(true);
      expect(predicate.test({ foo: 42 })).toBe(false);
    });

    it("should throw an exception when the value is not a string or number", () => {
      const condition = { path: "foo", type: "!=", value: { bar: "baz" } };

      expect(() => {
        ContentFilter["notEqualsCondition"](condition, "foo");
      }).toThrow(
        new AccessConstraintViolationException(
          ContentFilter["NOT_A_VALID_PREDICATE_CONDITION"] + condition
        )
      );
    });

    it("should return a predicate that evaluates to false when the value at the path is not a string", () => {
      const condition = { path: "foo", type: "!=", value: "bar" };
      const predicate = ContentFilter["notEqualsCondition"](condition, "foo");

      expect(predicate.test({ foo: 42 })).toBe(false);
    });
  });

  describe("geqCondition", () => {
    it("should return a predicate that evaluates to true when the value is greater than or equal to the condition", () => {
      const condition = { path: "foo", type: ">=", value: 10 };
      const predicate = ContentFilter["geqCondition"](condition, "foo");

      expect(predicate.test({ foo: 15 })).toBe(true);
      expect(predicate.test({ foo: 10 })).toBe(true);
      expect(predicate.test({ foo: 5 })).toBe(false);
    });

    it("should throw an exception when the value is not a number", () => {
      const condition = { path: "foo", type: ">=", value: "bar" };

      expect(() => {
        ContentFilter["geqCondition"](condition, "foo");
      }).toThrow(
        new AccessConstraintViolationException(
          ContentFilter["NOT_A_VALID_PREDICATE_CONDITION"] + condition
        )
      );
    });

    it("should return a predicate that evaluates to false when the path does not exist", () => {
      const condition = { path: "foo", type: ">=", value: 10 };
      const predicate = ContentFilter["geqCondition"](condition, "foo");

      expect(predicate.test({})).toBe(false);
    });

    it("should return a predicate that evaluates to false when the value at the path is not a number", () => {
      const condition = { path: "foo", type: ">=", value: 10 };
      const predicate = ContentFilter["geqCondition"](condition, "foo");

      expect(predicate.test({ foo: "bar" })).toBe(false);
    });
  });
  describe("leqCondition", () => {
    it("should return a predicate that evaluates to true when the value is less than or equal to the condition", () => {
      const condition = { path: "foo", type: "<=", value: 10 };
      const predicate = ContentFilter["leqCondition"](condition, "foo");

      expect(predicate.test({ foo: 5 })).toBe(true);
      expect(predicate.test({ foo: 10 })).toBe(true);
      expect(predicate.test({ foo: 15 })).toBe(false);
    });

    it("should throw an exception when the value is not a number", () => {
      const condition = { path: "foo", type: "<=", value: "bar" };

      expect(() => {
        ContentFilter["leqCondition"](condition, "foo");
      }).toThrow(
        new AccessConstraintViolationException(
          ContentFilter["NOT_A_VALID_PREDICATE_CONDITION"] + condition
        )
      );
    });

    it("should return a predicate that evaluates to false when the path does not exist", () => {
      const condition = { path: "foo", type: "<=", value: 10 };
      const predicate = ContentFilter["leqCondition"](condition, "foo");

      expect(predicate.test({})).toBe(false);
    });

    it("should return a predicate that evaluates to false when the value at the path is not a number", () => {
      const condition = { path: "foo", type: "<=", value: 10 };
      const predicate = ContentFilter["leqCondition"](condition, "foo");

      expect(predicate.test({ foo: "bar" })).toBe(false);
    });
  });
  describe("ltCondition", () => {
    it("should return a predicate that evaluates to true when the value is less than the condition", () => {
      const condition = { path: "foo", type: "<", value: 10 };
      const predicate = ContentFilter["ltCondition"](condition, "foo");

      expect(predicate.test({ foo: 5 })).toBe(true);
      expect(predicate.test({ foo: 10 })).toBe(false);
      expect(predicate.test({ foo: 15 })).toBe(false);
    });

    it("should throw an exception when the value is not a number", () => {
      const condition = { path: "foo", type: "<", value: "bar" };

      expect(() => {
        ContentFilter["ltCondition"](condition, "foo");
      }).toThrow(
        new AccessConstraintViolationException(
          ContentFilter["NOT_A_VALID_PREDICATE_CONDITION"] + condition
        )
      );
    });

    it("should return a predicate that evaluates to false when the path does not exist", () => {
      const condition = { path: "foo", type: "<", value: 10 };
      const predicate = ContentFilter["ltCondition"](condition, "foo");

      expect(predicate.test({})).toBe(false);
    });

    it("should return a predicate that evaluates to false when the value at the path is not a number", () => {
      const condition = { path: "foo", type: "<", value: 10 };
      const predicate = ContentFilter["ltCondition"](condition, "foo");

      expect(predicate.test({ foo: "bar" })).toBe(false);
    });
  });
  describe("gtCondition", () => {
    it("should return a predicate that evaluates to true when the value is greater than the condition", () => {
      const condition = { path: "foo", type: ">", value: 10 };
      const predicate = ContentFilter["gtCondition"](condition, "foo");

      expect(predicate.test({ foo: 15 })).toBe(true);
      expect(predicate.test({ foo: 10 })).toBe(false);
      expect(predicate.test({ foo: 5 })).toBe(false);
    });

    it("should throw an exception when the value is not a number", () => {
      const condition = { path: "foo", type: ">", value: "bar" };

      expect(() => {
        ContentFilter["gtCondition"](condition, "foo");
      }).toThrow(
        new AccessConstraintViolationException(
          ContentFilter["NOT_A_VALID_PREDICATE_CONDITION"] + condition
        )
      );
    });

    it("should return a predicate that evaluates to false when the path does not exist", () => {
      const condition = { path: "foo", type: ">", value: 10 };
      const predicate = ContentFilter["gtCondition"](condition, "foo");

      expect(predicate.test({})).toBe(false);
    });

    it("should return a predicate that evaluates to false when the value at the path is not a number", () => {
      const condition = { path: "foo", type: ">", value: 10 };
      const predicate = ContentFilter["gtCondition"](condition, "foo");

      expect(predicate.test({ foo: "bar" })).toBe(false);
    });
  });
  describe("regexCondition", () => {
    it("should return a predicate that evaluates to true when the value matches the regex pattern", () => {
      const condition = { path: "foo", type: "=~", value: "^bar$" };
      const predicate = ContentFilter["regexCondition"](condition, "foo");

      expect(predicate.test({ foo: "bar" })).toBe(true);
      expect(predicate.test({ foo: "baz" })).toBe(false);
    });

    it("should return a predicate that evaluates to false when the value does not match the regex pattern", () => {
      const condition = { path: "foo", type: "=~", value: "^bar$" };
      const predicate = ContentFilter["regexCondition"](condition, "foo");

      expect(predicate.test({ foo: "barbaz" })).toBe(false);
      expect(predicate.test({ foo: "bazbar" })).toBe(false);
    });

    it("should throw an exception when the value is not a string", () => {
      const condition = { path: "foo", type: "=~", value: 42 };

      expect(() => {
        ContentFilter["regexCondition"](condition, "foo");
      }).toThrow(
        new AccessConstraintViolationException(
          ContentFilter["NOT_A_VALID_PREDICATE_CONDITION"] + condition
        )
      );
    });

    it("should return a predicate that evaluates to false when the path does not exist", () => {
      const condition = { path: "foo", type: "=~", value: "^bar$" };
      const predicate = ContentFilter["regexCondition"](condition, "foo");

      expect(predicate.test({})).toBe(false);
    });

    it("should return a predicate that evaluates to false when the value at the path is not a string", () => {
      const condition = { path: "foo", type: "=~", value: "^bar$" };
      const predicate = ContentFilter["regexCondition"](condition, "foo");

      expect(predicate.test({ foo: 42 })).toBe(false);
    });
  });
});
