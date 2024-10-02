import { Readable } from "stream";
import { Decision } from "../Decision";
import { PdpReturnStatus } from "../../interfaces/Pdp";

/**
 * This class is a stream that emits a decision stream with exponential backoff.
 * Needed if PDP Server is not available.
 */
export class ExponentialBackoffStream extends Readable {
  private decisionStream: Readable;
  private pushedIndeterminate: boolean = false;
  private decision: Decision;

  constructor() {
    super();
  }

  /**
   * @override This method is called when the stream wants to push data to the consumer.
   */
  _read() {
    if (!this.pushedIndeterminate) {
      this.emit(
        "data",
        new TextEncoder().encode(
          JSON.stringify({ decision: PdpReturnStatus.INDETERMINATE })
        )
      );
      this.pushedIndeterminate = true;
    }
  }

  /**
   * This method is called to emit the decision stream.
   * @param decisionStream The decision stream that should be emitted.
   */
  emitDecisionStream(decisionStream: Readable) {
    this.decisionStream = decisionStream;
    const self = this;
    this.decisionStream.on("data", (data) => {
      try {
        let newDecision = new Decision(
          JSON.parse(new TextDecoder().decode(data))
        );
        if (!this.decision) {
          this.decision = newDecision;
          self.emit("data", data);
        } else if (
          // Check if the decision has changed
          JSON.stringify(this.decision) !== JSON.stringify(newDecision)
        ) {
          this.decision = newDecision;
          self.emit("data", data);
        }
      } catch (error) {}
    });
  }
}
