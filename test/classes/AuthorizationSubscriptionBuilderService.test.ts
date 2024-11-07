import { createServer, IncomingMessage, Server } from "http";
import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { DecoratorCustomizing } from "../../src/types/DecoratorCustomizing";
import { AuthorizationManager } from "../../src/classes/AuthorizationManager";
import { AuthorizationSubscription } from "../../src/classes/AuthorizationSubscription";
import { AuthorizationSubscriptionBuilderService } from "../../src/classes/AuthorizationSubscriptionBuilderService";
import { DecoratorHelper } from "../../src/classes/helper/DecoratorHelper";

describe("AuthorizationSubscriptionBuilderService", () => {
  let authorizationManager: AuthorizationManager;
  let message: IncomingMessage;
  let decoratorArguments: DecoratorCustomizing;
  let server: Server;
  let failingServer: Server;

  beforeEach(() => {
    server = createServer((req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(["role1", "role2", "role3"]));
    });

    server.listen(4004);

    authorizationManager = new AuthorizationManager(
      "http://localhost:4004/example/path"
    );
    authorizationManager.setSubjectName("userId");
    message = {} as IncomingMessage;
    decoratorArguments = [];
  });

  afterEach(() => {
    server.close();
  });

  it("should create an instance of AuthorizationSubscriptionBuilderService", () => {
    const instance = AuthorizationSubscriptionBuilderService.getInstance();
    expect(instance).toBeInstanceOf(AuthorizationSubscriptionBuilderService);
  });

  it("should build an AuthorizationSubscription", async () => {
    const methodName = "testMethod";
    const decoratorProxy = {};

    const spy = jest
      .spyOn(
        AuthorizationManager.prototype,
        "_requestAuthorization" as keyof AuthorizationManager
      )
      //@ts-ignore
      .mockResolvedValue(["role1", "role2", "role3"]);

    const result =
      await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
        authorizationManager,
        methodName,
        decoratorArguments,
        message,
        decoratorProxy
      );

    expect(result).toBeInstanceOf(AuthorizationSubscription);
  });

  it("should retrieve subject with user information from message", async () => {
    const methodName = "testMethod";
    const decoratorProxy = {};

    //@ts-expect-error property will be created
    message.user = { id: "userId" };

    const result =
      await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
        authorizationManager,
        methodName,
        decoratorArguments,
        message,
        decoratorProxy
      );

    expect(result).toBeInstanceOf(AuthorizationSubscription);
    expect(result.getSubject().userinformation).toEqual({ id: "userId" });
  });

  it("should retrieve subject with OS Username", async () => {
    const methodName = "testMethod";
    const decoratorProxy = {};
    authorizationManager = new AuthorizationManager(
      "http://localhost:4004/example/path"
    );

    const result =
      await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
        authorizationManager,
        methodName,
        decoratorArguments,
        message,
        decoratorProxy
      );

    expect(result).toBeInstanceOf(AuthorizationSubscription);
    expect(result.getSubject().name).not.toBeUndefined();
  });

  it("should retrieve subject without decorator arguments", async () => {
    const methodName = "testMethod";
    const decoratorProxy = {};

    const result =
      await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
        authorizationManager,
        methodName,
        decoratorArguments,
        message,
        decoratorProxy
      );

    expect(result).toBeInstanceOf(AuthorizationSubscription);
    expect(result.getSubject().name).not.toBeUndefined();
  });

  it("should retrieve action with method name", async () => {
    const methodName = "testMethod";
    const decoratorProxy = {};

    const result =
      await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
        authorizationManager,
        methodName,
        decoratorArguments,
        message,
        decoratorProxy
      );

    expect(result).toBeInstanceOf(AuthorizationSubscription);
    expect(result.getAction()).toBe(methodName);
  });

  it("should retrieve resource from decorator arguments", async () => {
    const methodName = "testMethod";
    const decoratorProxy = {};
    decoratorArguments = [
      {
        propertyKey: methodName,
        customizing: [{ resource: { id: "resourceId", test: "test" } }],
      },
      {
        propertyKey: methodName,
        customizing: [{ resource: { id2: "resourceId2", test2: "test2" } }],
      },
    ];

    const result =
      await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
        authorizationManager,
        methodName,
        decoratorArguments,
        message,
        decoratorProxy
      );

    expect(result).toBeInstanceOf(AuthorizationSubscription);
    //@ts-expect-error property will be created
    expect(result.getResource().id).toBe("resourceId");
    //@ts-expect-error property will be created
    expect(result.getResource().test).toBe("test");
    //@ts-expect-error property will be created
    expect(result.getResource().id2).toBe("resourceId2");
    //@ts-expect-error property will be created
    expect(result.getResource().test2).toBe("test2");
  });

  it("should retrieve queryResult", async () => {
    const methodName = "testMethod";
    const decoratorProxy = {};
    decoratorArguments = [
      {
        propertyKey: methodName,
        customizing: [
          { resource: { id: "resourceId", value: "#queryResult" } },
        ],
      },
    ];

    DecoratorHelper.setPostEnforceQueryResult("test");

    const result =
      await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
        authorizationManager,
        methodName,
        decoratorArguments,
        message,
        decoratorProxy
      );

    expect(result).toBeInstanceOf(AuthorizationSubscription);
    //@ts-expect-error property will be created
    expect(result.getResource().value).toBe("test");
  });

  it("should retrieve value from class reference", async () => {
    const methodName = "testMethod";
    const decoratorProxy = new (class Test {
      getValue() {
        return "test";
      }
    })();
    decoratorArguments = [
      {
        propertyKey: methodName,
        customizing: [
          {
            resource: { id: "resourceId", value: "#this.getValue()" },
            action: { id: "resourceId", value: "value" },
          },
        ],
      },
    ];

    DecoratorHelper.setPostEnforceQueryResult("test");

    const result =
      await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
        authorizationManager,
        methodName,
        decoratorArguments,
        message,
        decoratorProxy
      );

    expect(result).toBeInstanceOf(AuthorizationSubscription);
    //@ts-expect-error property will be created
    expect(result.getResource().value).toBe("test");
    //@ts-expect-error property will be created
    expect(result.getAction().value).toBe("test");
  });

  it("should handle undefined authorizationManager", async () => {
    const methodName = "testMethod";
    const decoratorProxy = {};

    const result =
      await AuthorizationSubscriptionBuilderService.buildAuthorizationSubscription(
        undefined,
        methodName,
        decoratorArguments,
        message,
        decoratorProxy
      );

    expect(result).toBeInstanceOf(AuthorizationSubscription);
    expect(result.getSubject().name).not.toBeUndefined();

  });
});
