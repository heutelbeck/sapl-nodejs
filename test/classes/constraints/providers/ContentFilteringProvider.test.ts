import { beforeEach, describe, expect, it } from "@jest/globals";
import { ContentFilteringProvider } from "../../../../src/classes/constraints/providers/ContentFilteringProvider";

describe("ContentFilteringProvider", () => {
  let contentFilteringProvider: ContentFilteringProvider;

  beforeEach(() => {
    contentFilteringProvider = new ContentFilteringProvider();
  });

  it("should return the correct handler", () => {
    const constraint = {
      /* mock constraint object */
    };
    const handler = contentFilteringProvider.getHandler(constraint);

    expect(handler).not.toBeUndefined();
  });

  it("should return true if responsible for the constraint", () => {
    const constraint = {
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

    const isResponsible = contentFilteringProvider.isResponsible(constraint);

    expect(isResponsible).toBe(true);
  });

  it("should return false if not responsible for the constraint", () => {
    const constraint = {
      type: "trololo",
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

    const isResponsible = contentFilteringProvider.isResponsible(constraint);

    expect(isResponsible).toBe(false);
  });

  it("should return the correct priority", () => {
    const expectedPriority = 0;

    const priority = contentFilteringProvider.getPriority();

    expect(priority).toBe(expectedPriority);
  });

  it("should correctly compare priorities", () => {
    const otherPriority = new ContentFilteringProvider();

    const compareToResult = contentFilteringProvider.compareTo(otherPriority);

    expect(compareToResult).toBe(0);
  });
});
