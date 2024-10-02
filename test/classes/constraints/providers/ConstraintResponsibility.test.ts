import { describe, expect, it } from "@jest/globals";
import { ConstraintResponsibility } from "../../../../src/classes/constraints/providers/ConstraintResponsibility";

describe("ConstraintResponsibility", () => {
  describe("isResponsible", () => {
    it("should return true if constraint is responsible", () => {
      const constraint = {
        type: "requiredType",
      };
      const requiredType = "requiredType";

      const result = ConstraintResponsibility.isResponsible(
        constraint,
        requiredType
      );

      expect(result).toBe(true);
    });

    it("should return false if constraint is not responsible", () => {
      const constraint = {
        type: "otherType",
      };
      const requiredType = "requiredType";

      const result = ConstraintResponsibility.isResponsible(
        constraint,
        requiredType
      );

      expect(result).toBe(false);
    });

    it("should return false if constraint is null", () => {
      const constraint = null;
      const requiredType = "requiredType";

      const result = ConstraintResponsibility.isResponsible(
        constraint,
        requiredType
      );

      expect(result).toBe(false);
    });

    it("should return false if constraint is not an object", () => {
      const constraint = "notAnObject";
      const requiredType = "requiredType";

      const result = ConstraintResponsibility.isResponsible(
        constraint,
        requiredType
      );

      expect(result).toBe(false);
    });

    it("should return false if type is undefined", () => {
      const constraint = {};
      const requiredType = "requiredType";

      const result = ConstraintResponsibility.isResponsible(
        constraint,
        requiredType
      );

      expect(result).toBe(false);
    });

    it("should return false if type is not a string", () => {
      const constraint = {
        type: 123,
      };
      const requiredType = "requiredType";

      const result = ConstraintResponsibility.isResponsible(
        constraint,
        requiredType
      );

      expect(result).toBe(false);
    });
  });
});
