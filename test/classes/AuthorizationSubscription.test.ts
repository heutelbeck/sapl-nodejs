import { AuthorizationSubscription } from "../../src/classes/AuthorizationSubscription";
import { AuthorizationSubscriptionType } from "../../src/interfaces/AuthorizationSubscription";
import { describe, expect, it, beforeEach } from "@jest/globals";

describe("AuthorizationSubscription", () => {
  let authorizationSubscription: AuthorizationSubscription;
  let authorizationSubscriptionArray: AuthorizationSubscription;
  let authorizationSubscriptionArray2: AuthorizationSubscription;
  let authorizationSubscriptionArray3: AuthorizationSubscription;

  beforeEach(() => {
    authorizationSubscription = new AuthorizationSubscription(
      "user",
      "read",
      "document",
      ""
    );
    authorizationSubscriptionArray = new AuthorizationSubscription(
      ["user1", "user2"],
      ["read1", "read2"],
      ["document1", "document2"],
      ""
    );
    authorizationSubscriptionArray2 = new AuthorizationSubscription(
      ["user1"],
      ["read1", "read2"],
      ["document1"],
      ""
    );
    authorizationSubscriptionArray3 = new AuthorizationSubscription(
      ["user1"],
      ["read1"],
      ["document1", "document2"],
      ""
    );
  });

  it("should return the correct string representation", () => {
    expect(authorizationSubscription.asString()).toBe(
      `{"subject": "user", "action": "read", "resource": "document"}`
    );
    expect(authorizationSubscriptionArray.asString()).toBe(
      `{"subjects": ["user1","user2"], "actions": ["read1","read2"], "resources": ["document1","document2"], "authorizationSubscriptions": {"id-1":{"subjectId":0,"actionId":0,"resourceId":0}}}`
    );
  });

  it("should create an instance of AuthorizationSubscription", () => {
    expect(authorizationSubscription).toBeInstanceOf(AuthorizationSubscription);
  });

  it("should have the correct subject, action, and resource", () => {
    expect(authorizationSubscription.getSubject()).toBe("user");
    expect(authorizationSubscription.getAction()).toBe("read");
    expect(authorizationSubscription.getResource()).toBe("document");
    expect(authorizationSubscription.getEnvironment()).toBe("");
    expect(authorizationSubscriptionArray.getSubject()).toBe("user1, user2");
    expect(authorizationSubscriptionArray.getAction()).toBe("read1, read2");
    expect(authorizationSubscriptionArray.getResource()).toBe(
      "document1, document2"
    );
    expect(authorizationSubscriptionArray.getEnvironment()).toBe("");
    expect(authorizationSubscriptionArray2.getSubject()).toBe("user1");
    expect(authorizationSubscriptionArray2.getAction()).toBe("read1, read2");
    expect(authorizationSubscriptionArray2.getResource()).toBe("document1");
    expect(authorizationSubscriptionArray2.getEnvironment()).toBe("");
    expect(authorizationSubscriptionArray3.getSubject()).toBe("user1");
    expect(authorizationSubscriptionArray3.getAction()).toBe("read1");
    expect(authorizationSubscriptionArray3.getResource()).toBe(
      "document1, document2"
    );
    expect(authorizationSubscriptionArray3.getEnvironment()).toBe("");
  });

  it("should have the correct authorization subscription type", () => {
    expect(authorizationSubscription.getAuthorizationSubscriptionType()).toBe(
      AuthorizationSubscriptionType.SINGLE
    );
  });

  it("should load the username as subject", () => {
    const createdAuthorizationSubscription = AuthorizationSubscription.create(
      "",
      "read",
      "document1",
      ""
    );
    expect(createdAuthorizationSubscription.getSubject()).not.toBe("");
  });

  it("should do something", () => {
    const createdAuthorizationSubscriptionArray =
      AuthorizationSubscription.create([], [], [], "");
    expect(createdAuthorizationSubscriptionArray).toBeDefined();
  });

  it("should create an instance of AuthorizationSubscription using the create method", () => {
    const createdAuthorizationSubscription = AuthorizationSubscription.create(
      "user",
      "read",
      "document",
      ""
    );
    const createdAuthorizationSubscriptionArray =
      AuthorizationSubscription.create(
        ["user1", "user2"],
        ["read1", "read2"],
        ["document1", "document2"],
        ""
      );

    expect(createdAuthorizationSubscription).toBeInstanceOf(
      AuthorizationSubscription
    );
    expect(createdAuthorizationSubscription.getSubject()).toBe("user");
    expect(createdAuthorizationSubscription.getAction()).toBe("read");
    expect(createdAuthorizationSubscription.getResource()).toBe("document");
    expect(createdAuthorizationSubscription.getEnvironment()).toBe("");
    expect(createdAuthorizationSubscriptionArray.getSubject()).toBe(
      "user1, user2"
    );
    expect(createdAuthorizationSubscriptionArray.getAction()).toBe(
      "read1, read2"
    );
    expect(createdAuthorizationSubscriptionArray.getResource()).toBe(
      "document1, document2"
    );
    expect(createdAuthorizationSubscriptionArray.getEnvironment()).toBe("");
  });
});
