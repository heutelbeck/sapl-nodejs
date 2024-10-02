import { beforeEach, describe, expect, it } from "@jest/globals";
import { ContentFilterPredicateProvider } from "../../../../src/classes/constraints/providers/ContentFilterPredicateProvider";

describe("ContentFilterPredicateProvider", () => {
  let contentFilterPredicateProvider: ContentFilterPredicateProvider;
  let constraint: any;
  beforeEach(() => {
    contentFilterPredicateProvider = new ContentFilterPredicateProvider();
    constraint = {
      type: "filterJsonContent",
      actions: [
        {
          type: "blacken",
          path: "$.icd11Code",
          discloseLeft: 2,
        },
        {
          type: "delete",
          path: "$.diagnosis",
        },
      ],
    };
  });

  describe("getHandler", () => {
    it("should return the handler for the given constraint", () => {
      const handler = contentFilterPredicateProvider.getHandler(constraint);
      expect(handler).not.toBeUndefined();
    });
  });

  describe("isResponsible", () => {
    it("should return false if the constraint type does not match", () => {
      const isResponsible =
        contentFilterPredicateProvider.isResponsible(constraint);
      expect(isResponsible).toBe(false);
    });
  });
});
