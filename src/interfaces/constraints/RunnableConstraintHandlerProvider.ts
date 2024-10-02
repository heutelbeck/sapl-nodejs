import { Responsible } from "./Responsible";

export enum Event {
  ON_DECISION = "decision",
  ON_CLOSE = "close",
  ON_DATA = "data",
  ON_END = "end",
  ON_ERROR = "error",
  ON_PAUSE = "pause",
  ON_READABLE = "readable",
  ON_RESUME = "resume",
}
export interface RunnableConstraintHandlerProvider extends Responsible {
  getSignal(): Event;
  getHandler(constraint: object): any;
}
