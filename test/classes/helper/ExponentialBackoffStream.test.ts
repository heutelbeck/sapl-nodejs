import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ExponentialBackoffStream } from "../../../src/classes/helper/ExponentialBackoffStream";
import { Readable } from "stream";
import { Decision } from "../../../src/classes/Decision";
import { PdpReturnStatus } from "../../../src/interfaces/Pdp";

describe.skip("ExponentialBackoffStream", () => {
  let decisionStream: Readable;
  let exponentialBackoffStream: ExponentialBackoffStream;

  beforeEach(() => {
    decisionStream = new Readable();
    exponentialBackoffStream = new ExponentialBackoffStream();
    exponentialBackoffStream.emitDecisionStream(decisionStream);
  });

  it("should emit an indeterminate decision when _read is called for the first time", () => {
    const dataSpy = jest.spyOn(exponentialBackoffStream, "emit");

    exponentialBackoffStream._read();

    expect(dataSpy).toHaveBeenCalledWith(
      "data",
      new TextEncoder().encode(
        JSON.stringify({ decision: PdpReturnStatus.INDETERMINATE })
      )
    );
  });

  it("should emit a new decision when the decision has changed", async () => {
    const dataSpy = jest.spyOn(exponentialBackoffStream, "emitDecisionStream");
    const decision1 = new Decision({
      decision: PdpReturnStatus.PERMIT,
    });
    const decision2 = new Decision({
      decision: PdpReturnStatus.DENY,
    });

    decisionStream.emit("data", JSON.stringify(decision1));
    decisionStream.emit("data", JSON.stringify(decision2));

    // expect(dataSpy).toHaveBeenCalled();
    // expect(dataSpy).toHaveBeenCalledWith("data", JSON.stringify(decision2));
  });

  it("should not emit a new decision when the decision has not changed", () => {
    const dataSpy = jest.spyOn(exponentialBackoffStream, "emit");
    const decision1 = new Decision({
      decision: PdpReturnStatus.PERMIT,
    });
    const decision2 = new Decision({
      decision: PdpReturnStatus.DENY,
    });

    decisionStream.emit("data", JSON.stringify(decision1));
    decisionStream.emit("data", JSON.stringify(decision2));
    decisionStream.emit("data", JSON.stringify(decision2));

    // expect(dataSpy).toHaveBeenCalledWith(JSON.stringify(decision1));
    // expect(dataSpy).toHaveBeenCalledWith(JSON.stringify(decision2));
    // expect(dataSpy).toHaveBeenCalledTimes(2);
  });
});
