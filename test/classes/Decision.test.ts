import { expect, it } from "@jest/globals";
import { Decision } from "../../src/classes/Decision";

it("should initialize the decision object correctly", () => {
  const decision = JSON.stringify({
    decision: "PERMIT",
    obligations: [{ id: 1, name: "obligation" }],
    advice: [{ id: 1, name: "advice" }],
    resource: "resource",
    action: "action",
    environment: { key: "value" },
    subject: { key: "value" },
  });

  const decisionInstance = new Decision(decision);

  expect(decisionInstance.getDecision()).toBe("PERMIT");
  expect(decisionInstance.getObligations()).toEqual([
    { id: 1, name: "obligation" },
  ]);
  expect(decisionInstance.getAdvices()).toEqual([{ id: 1, name: "advice" }]);
  expect(decisionInstance.getResource()).toBe("resource");
  expect(decisionInstance.getAction()).toBe("action");
  expect(decisionInstance.getEnvironment()).toEqual({ key: "value" });
  expect(decisionInstance.getSubject()).toEqual({ key: "value" });
});

it("should throw an error if decision object is missing the decision field", () => {
  const decision = {};

  expect(() => {
    new Decision(decision);
  }).toThrow(Error);
});
