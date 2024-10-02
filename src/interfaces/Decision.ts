import { PdpReturnStatus } from "./Pdp";

export interface Decision {
  getDecision(): PdpReturnStatus;
  getObligations(): object[];
  getAdvices(): object[];
  getResource(): string;
  getAction(): string;
  getEnvironment(): object;
  getSubject(): object;
}
