import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { RemotePdp } from "../../../src/classes/RemotePdp";
import { DecoratorHelper } from "../../../src/classes/helper/DecoratorHelper";
import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { WrapperStreamHelper } from "../../../src/classes/helper/WrapperStreamHelper";
import { Readable } from "stream";
import { TextHelper } from "../../../src/classes/helper/TextHelper";
import { Decision } from "../../../src/classes/Decision";
import { Observable, Subscriber } from "rxjs";
import { Frameworks } from "../../../src/interfaces/Frameworks";
import { AccessDeniedException } from "../../../src/classes/constraints/providers/AccessDeniedException";
import { Socket } from "net";

let server: Server;
let stream: Readable;
let sourceObservable: Observable<number>;

beforeEach(() => {
  (stream = new Readable({
    read() {
      this.push("chunk");
      this.push(null);
    },
  })),
    (server = createServer((req, res) => {
      if (req.url === "/decision-permit") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ DECISION: "PERMIT" }));
        return;
      } else if (req.url === "/decision-deny") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ DECISION: "DENY" }));
        return;
      } else if (req.url === "/decision-not-applicable") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ DECISION: "NOT_APPLICABLE" }));
        return;
      }
    }));
  sourceObservable = new Observable<number>(
    (subscriber: Subscriber<number>) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.next(4);
      subscriber.complete();
    }
  );

  server.listen(4001);
});

afterEach(() => {
  server.close();
  stream.destroy();
});

describe("sendForbiddenResponse", () => {
  it("should set the status code to 403 and end the response with '403 - FORBIDDEN'", () => {
    const response = new ServerResponse({
      statusCode: 200,
      end: jest.fn(),
    } as any);

    DecoratorHelper.sendForbiddenResponse([response]);

    expect(response.statusCode).toBe(403);
  });
});

describe("sendNotApplicableResponse", () => {
  it("should set the status code to 500 and end the response with '500 - ERROR 'NOT_APPLICABLE''", () => {
    const response = new ServerResponse({
      statusCode: 200,
      end: jest.fn(),
    } as any);

    DecoratorHelper.sendNotApplicableResponse([response]);

    expect(response.statusCode).toBe(500);
  });

  it("should not modify the response if it is not an instance of ServerResponse", () => {
    const response = {
      statusCode: 200,
      end: jest.fn(),
    };

    DecoratorHelper.sendNotApplicableResponse([response, "not a response"]);

    expect(response.statusCode).toBe(200);
    expect(response.end).not.toHaveBeenCalled();
  });
});

describe("searchForIncomingMessage", () => {
  it("should return the incoming message if it is found", () => {
    const incomingMessage = new IncomingMessage(new Socket()),
      args = [incomingMessage, "arg2", "arg3"],
      result = DecoratorHelper.searchForIncommingMessage(args);

    expect(result).toBe(incomingMessage);
  });
});

describe("handleDecision", () => {
  it("should send a forbidden response if the decision includes 'DENY'", () => {
    const target = {},
      remotePdp = RemotePdp.create().host("http://localhost").port(4001),
      decisionData = new TextEncoder().encode(
        JSON.stringify({ decision: "DENY" })
      ),
      args = [],
      originalMethod = jest.fn(),
      response = {
        statusCode: 200,
        end: jest.fn(),
      },
      sendForbiddenResponseSpy = jest.spyOn(
        DecoratorHelper,
        "sendForbiddenResponse"
      );

    let decision = new Decision(TextHelper.decodeData(decisionData));

    DecoratorHelper.handleDecision(decision, args);

    expect(sendForbiddenResponseSpy).toHaveBeenCalledWith(args);
    expect(originalMethod).not.toHaveBeenCalled();
  });

  it("should send a forbidden response if the decision includes 'NOT_APPLICABLE'", () => {
    const target = {},
      remotePdp = RemotePdp.create().host("http://localhost").port(4001),
      decisionData = new TextEncoder().encode(
        JSON.stringify({ decision: "NOT_APPLICABLE" })
      ),
      args = [],
      originalMethod = jest.fn(),
      response = {
        statusCode: 200,
        end: jest.fn(),
      },
      sendNotApplicableResponseSpy = jest.spyOn(
        DecoratorHelper,
        "sendNotApplicableResponse"
      );

    let decision = new Decision(TextHelper.decodeData(decisionData));

    DecoratorHelper.handleDecision(decision, args);
    DecoratorHelper.handleDecision(decision, args, Frameworks.NETSJS);

    expect(sendNotApplicableResponseSpy).toHaveBeenCalledWith(args);
    expect(originalMethod).not.toHaveBeenCalled();
  });

  it("should return true", () => {
    const remotePdp = RemotePdp.create(),
      decisionData = new TextEncoder().encode(
        JSON.stringify({
          decision: "PERMIT",
          obligations: [
            {
              type: "sendMail",
              recipient: "Tester",
              subject: "Obligation Handling",
              message: "Obligation succesfuly handled",
            },
          ],
          advice: [
            {
              type: "logAccess",
              message:
                "Administrator Tester has manipulated patient: undefined",
            },
          ],
        })
      ),
      args = [],
      originalMethod = jest.fn(),
      response = {
        statusCode: 200,
        end: jest.fn(),
      };

    let decision = new Decision(TextHelper.decodeData(decisionData));

    let value = DecoratorHelper.handleDecision(decision, args);

    expect(value).toBe(true);
  });
});

describe("createWrapperStream", () => {
  it("should return a WrapperStreamHelper instance", () => {
    const wrapperStream = DecoratorHelper.createWrapperStreamHelper();

    expect(wrapperStream).toBeInstanceOf(WrapperStreamHelper);
  });
});

describe("attachStreamData", () => {
  it("should set readDataAllowed to true if attachOnDecisionStream returns true", () => {
    const args = [],
      remotePdp = RemotePdp.create(),
      wrapperStreamHelper = DecoratorHelper.createWrapperStreamHelper(),
      wrapperObservableHelper = DecoratorHelper.createWrapperObservableHelper();

    const handleDecisionSpy = jest
      .spyOn(DecoratorHelper, "handleDecision")
      .mockReturnValue(true);
    const setReadDataAllowedStreamSpy = jest.spyOn(
      wrapperStreamHelper,
      "setReadDataAllowed"
    );
    const setReadDataAllowedObservableSpy = jest.spyOn(
      wrapperObservableHelper,
      "setReadDataAllowed"
    );

    DecoratorHelper.attachOnDecisionStream(
      args,
      stream,
      remotePdp,
      wrapperStreamHelper,
      wrapperObservableHelper
    );

    stream.emit("data", { decision: "PERMIT" });

    expect(handleDecisionSpy).toBeCalled();
    expect(setReadDataAllowedStreamSpy).toHaveBeenCalledWith(true);
    expect(setReadDataAllowedObservableSpy).toHaveBeenCalledWith(true);
  });
});

describe("attachStreamEnd", () => {
  it("should not log anything to the console if not in development mode", () => {
    const consoleLogSpy = jest.spyOn(console, "log");
    process.env.NODE_ENV = "production";

    DecoratorHelper.attachOnEndStream(stream);

    stream.emit("end");

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it("should log 'Lesen abgeschlossen.' to the console in development mode", () => {
    const consoleLogSpy = jest.spyOn(console, "log");
    process.env.NODE_ENV = "development";

    DecoratorHelper.attachOnEndStream(stream);

    stream.emit("end");

    expect(consoleLogSpy).toHaveBeenCalledWith("Lesen abgeschlossen.");
  });
});

describe("attachStreamError", () => {
  it("should set readDataAllowed to false and log the error to the console", () => {
    const wrapperStreamHelper = DecoratorHelper.createWrapperStreamHelper();

    const consoleErrorSpy = jest.spyOn(console, "error");
    const setReadDataAllowedSpy = jest.spyOn(
      wrapperStreamHelper,
      "setReadDataAllowed"
    );

    DecoratorHelper.attachOnErrorStream(stream, wrapperStreamHelper);

    const error = new Error("Test error");
    stream.emit("error", error);

    expect(consoleErrorSpy).toHaveBeenCalledWith("Fehler beim Lesen:", error);
    expect(setReadDataAllowedSpy).toHaveBeenCalledWith(false);
  });

  describe("attachHandlersToStream", () => {
    it("should attach the event listeners to the stream", async () => {
      const wrapperStreamHelper = DecoratorHelper.createWrapperStreamHelper();

      DecoratorHelper.attachHandlersToStream(stream, wrapperStreamHelper);
      expect(stream).toBeDefined();

      stream.emit("data", JSON.stringify({ decision: "PERMIT" }));
      stream.emit("end");
      stream.emit("error", new Error("Test error"));
    });
    it("should attach the event listeners to the observable stream", () => {
      const sourceObservable = new Observable<number>(
        (subscriber: Subscriber<number>) => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.next(3);
          subscriber.next(4);
          subscriber.complete();
        }
      );

      const observableStreamHelper =
        DecoratorHelper.createWrapperObservableHelper();

      DecoratorHelper.attachHandlersToStream(
        sourceObservable,
        undefined,
        observableStreamHelper
      );
      expect(stream).toBeDefined();
      sourceObservable.subscribe((value) => {
        let data = value;
      });
    });
  });
});

describe("getPreEnforceArguments", () => {
  it("should return the custom PreEnforce Arguments for the given method name", () => {
    const propertyKey = "testMethod";
    const args = ["arg1", "arg2"];
    DecoratorHelper.setPreEnforceArguments(propertyKey, args);

    const result = DecoratorHelper.getPreEnforceArguments(propertyKey);

    expect(result).toEqual([
      {
        propertyKey: propertyKey,
        customizing: args,
      },
    ]);
  });

  it("should return an empty array if no arguments are set for the given method name", () => {
    const result = DecoratorHelper.getPreEnforceArguments("nonExistentMethod");

    expect(result).toEqual([]);
  });
});

describe("getPostEnforceArguments", () => {
  it("should return the custom PostEnforce Arguments for the given method name", () => {
    const propertyKey = "testMethod";
    const args = ["arg1", "arg2"];
    DecoratorHelper.setPostEnforceArguments(propertyKey, args);

    const result = DecoratorHelper.getPostEnforceArguments(propertyKey);

    expect(result).toEqual([
      {
        propertyKey: propertyKey,
        customizing: args,
      },
    ]);
  });

  it("should return an empty array if no arguments are set for the given method name", () => {
    const result = DecoratorHelper.getPostEnforceArguments("nonExistentMethod");

    expect(result).toEqual([]);
  });
});

describe("EnforceDropWhileDeniedArguments", () => {
  it("should return the custom PostEnforce Arguments for the given method name", () => {
    const propertyKey = "testMethod";
    const args = ["arg1", "arg2"];
    DecoratorHelper.setEnforceDropWhileDeniedArguments(propertyKey, args);

    const result =
      DecoratorHelper.getEnforceDropWhileDeniedArguments(propertyKey);

    expect(result).toEqual([
      {
        propertyKey: propertyKey,
        customizing: args,
      },
    ]);
  });

  it("should return an empty array if no arguments are set for the given method name", () => {
    const result =
      DecoratorHelper.getEnforceDropWhileDeniedArguments("nonExistentMethod");

    expect(result).toEqual([]);
  });
});

describe("EnforceTillDeniedArguments", () => {
  it("should return the custom PostEnforce Arguments for the given method name", () => {
    const propertyKey = "testMethod";
    const args = ["arg1", "arg2"];
    DecoratorHelper.setEnforceTillDeniedArguments(propertyKey, args);

    const result = DecoratorHelper.getEnforceTillDeniedArguments(propertyKey);

    expect(result).toEqual([
      {
        propertyKey: propertyKey,
        customizing: args,
      },
    ]);
  });

  it("should return an empty array if no arguments are set for the given method name", () => {
    const result =
      DecoratorHelper.getEnforceTillDeniedArguments("nonExistentMethod");

    expect(result).toEqual([]);
  });
});

describe("EnforceRecoverableIfDeniedArguments", () => {
  it("should return the custom PostEnforce Arguments for the given method name", () => {
    const propertyKey = "testMethod";
    const args = ["arg1", "arg2"];
    DecoratorHelper.setEnforceRecoverableIfDeniedArguments(propertyKey, args);

    const result =
      DecoratorHelper.getEnforceRecoverableIfDeniedArguments(propertyKey);

    expect(result).toEqual([
      {
        propertyKey: propertyKey,
        customizing: args,
      },
    ]);
  });

  it("should return an empty array if no arguments are set for the given method name", () => {
    const result =
      DecoratorHelper.getEnforceDropWhileDeniedArguments("nonExistentMethod");

    expect(result).toEqual([]);
  });
});

describe("get Proxys", () => {
  it("should return the preEnforceProxy", () => {
    const proxy = DecoratorHelper.getPreEnforxceProxy();
    expect(proxy).toBe(DecoratorHelper["preEnforceProxy"]);
  });
  it("should return the preEnforceProxy", () => {
    const proxy = DecoratorHelper.getPostEnforceProxy();
    expect(proxy).toBe(DecoratorHelper["postEnforceProxy"]);
  });
  it("should return the preEnforceProxy", () => {
    const proxy = DecoratorHelper.getEnforceDropWhileDeniedProxy();
    expect(proxy).toBe(DecoratorHelper["enforceDropWhileDeniedProxy"]);
  });
  it("should return the preEnforceProxy", () => {
    const proxy = DecoratorHelper.getEnforceRecoverableIfDeniedProxy();
    expect(proxy).toBe(DecoratorHelper["enforceRecoverableIfDeniedProxy"]);
  });
  it("should return the preEnforceProxy", () => {
    const proxy = DecoratorHelper.getEnforceTillDeniedProxy();
    expect(proxy).toBe(DecoratorHelper["enforceTillDeniedProxy"]);
  });
});
describe("sendIndeterminateResponse", () => {
  it("should set the status code to 404", () => {
    const response = new ServerResponse({
      statusCode: 200,
      end: jest.fn(),
    } as any);

    DecoratorHelper.sendIndeterminateResponse([response]);

    expect(response.statusCode).toBe(404);
  });

  it("should not modify the response if it is not an instance of ServerResponse", () => {
    const response = {
      statusCode: 200,
      end: jest.fn(),
    };

    DecoratorHelper.sendIndeterminateResponse([response, "not a response"]);

    expect(response.statusCode).toBe(200);
    expect(response.end).not.toHaveBeenCalled();
  });
});
