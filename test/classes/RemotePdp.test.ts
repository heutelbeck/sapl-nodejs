import { createServer, Server } from "http";
import { AuthorizationManager } from "../../src/classes/AuthorizationManager";
import { AuthorizationSubscription } from "../../src/classes/AuthorizationSubscription";
import { ConstraintEnforcementService } from "../../src/classes/constraints/ConstraintEnforcementService";
import { RemotePdp } from "../../src/classes/RemotePdp";
import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { debug } from "console";
import { ExponentialBackoffStream } from "../../src/classes/helper/ExponentialBackoffStream";

let server: Server;

beforeEach(() => {
  server = createServer((req, res) => {
    if (req.url === "/api/pdp/decide") {
      res.statusCode = 200;
      res.end();
    } else if (req.url === "/api/pdp/decide-once") {
      res.statusCode = 200;
      res.end(JSON.stringify({ DECISION: "PERMIT" }));
    }
  });

  server.listen(4003);
});

afterEach(() => {
  server.close();
});

describe("RemotePdp", () => {
  describe("create", () => {
    it("should return an instance of RemotePdp", () => {
      const url = "http://localhost",
        username = "testUser",
        password = "testPassword",
        accessToken = "testAccessToken";

      const remotePdp = RemotePdp.create()
        .host(url)
        .port(4003)
        .basicAuth(username, password)
        .bearerToken(accessToken);

      expect(remotePdp).toBeInstanceOf(RemotePdp);
      expect(remotePdp).toBe(RemotePdp.getRemotePdp());
    });

    it("should return the same instance of RemotePdp when called multiple times", () => {
      const url = "http://localhost",
        username = "testUser",
        password = "testPassword",
        accessToken = "testAccessToken";

      const remotePdp1 = RemotePdp.create()
        .host(url)
        .port(4003)
        .basicAuth(username, password)
        .bearerToken(accessToken);
      const remotePdp2 = RemotePdp.create()
        .host(url)
        .port(4003)
        .basicAuth(username, password)
        .bearerToken(accessToken);

      expect(remotePdp1).toBe(remotePdp2);
      expect(remotePdp1).toBe(RemotePdp.getRemotePdp());
    });

    it("should return the members", () => {
      const url = "http://localhost",
        username = "testUser",
        password = "testPassword",
        accessToken = "testAccessToken";

      const remotePdp = RemotePdp.create()
        .host(url)
        .port(4003)
        .basicAuth(username, password)
        .bearerToken(accessToken);

      remotePdp.setAuthorizationManager(
        "http://localhost:4003/authorizationManger"
      );
      expect(remotePdp).toBe(RemotePdp.getRemotePdp());
      expect(remotePdp.getUsername()).toBe(username);
      expect(remotePdp.getAuthorizationManager()).toBeInstanceOf(
        AuthorizationManager
      );
      expect(remotePdp.getConstraintEnforcementService()).toBeInstanceOf(
        ConstraintEnforcementService
      );

      remotePdp.setUsername("newUser");
      expect(remotePdp.getUsername()).toBe("newUser");
    });
  });

  describe("decide, decide-once and multiDecide", () => {
    it("should send a decision request and return a readable stream", async () => {
      const url = "http://localhost",
        username = "testUser",
        password = "testPassword",
        accessToken = "testAccessToken",
        singleBody = new AuthorizationSubscription(
          "testSubject",
          "testAction",
          "testResource"
        ),
        multiBody = new AuthorizationSubscription(
          ["testSubject"],
          ["testAction"],
          ["testResource"]
        );

      const remotePdp = RemotePdp.create()
        .host(url)
        .port(4003)
        .basicAuth(username, password)
        .bearerToken(accessToken);

      const singleResult = await remotePdp.decideOnce(singleBody);
      const multiResult = await remotePdp.multiDecide(multiBody);
      const stream = await remotePdp.decide(singleBody);

      expect(singleResult).not.toBeNull();
      expect(multiResult).not.toBeNull();
      expect(stream).not.toBeNull();
    });

    it("decide should return a exponential backoff stream", async () => {
      const remotePdp = RemotePdp.create()
          .host("http://localhost")
          .port(4004)
          .basicAuth("testUser", "testPassword"),
        singleBody = new AuthorizationSubscription(
          "testSubject",
          "testAction",
          "testResource"
        );

      const stream = await remotePdp.decide(singleBody);

      expect(stream).not.toBeNull();
      expect(stream).toBeInstanceOf(ExponentialBackoffStream);

      RemotePdp.destroy();
    });

    it("decide-once should return a exponential backoff stream", async () => {
      const remotePdp = RemotePdp.create()
          .host("http://localhost")
          .port(4004)
          .basicAuth("testUser", "testPassword"),
        singleBody = new AuthorizationSubscription(
          "testSubject",
          "testAction",
          "testResource"
        );

      const singleResult = await remotePdp.decideOnce(singleBody);

      expect(singleResult).not.toBeNull();
      expect(singleResult).toBeInstanceOf(ExponentialBackoffStream);

      RemotePdp.destroy();
    });

    it("multiDecide should return a exponential backoff stream", async () => {
      const remotePdp = RemotePdp.create()
          .host("http://localhost")
          .port(4004)
          .basicAuth("testUser", "testPassword"),
        multiBody = new AuthorizationSubscription(
          ["testSubject"],
          ["testAction"],
          ["testResource"]
        );

      const multiResult = await remotePdp.multiDecide(multiBody);

      expect(multiResult).not.toBeNull();
      expect(multiResult).toBeInstanceOf(ExponentialBackoffStream);

      RemotePdp.destroy();
    });
  });
});
