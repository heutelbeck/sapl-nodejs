import { describe, expect, it, beforeEach, afterEach } from "@jest/globals";
import { AuthorizationManager } from "../../src/classes/AuthorizationManager";
import { createServer, Server } from "http";

let server: Server;
let failingServer: Server;

beforeEach(() => {
  server = createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(["role1", "role2", "role3"]));
  });
  failingServer = createServer((req, res) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Forbidden" }));
  });

  server.listen(4002);
  failingServer.listen(4003);
});

afterEach(() => {
  server.close();
  failingServer.close();
});

describe("AuthorizationManager", () => {
  describe("getPath", () => {
    it("should return the path set in the constructor", () => {
      const path = "http://localhost:4002/example/path",
        authorizationManager = new AuthorizationManager(path);

      expect(authorizationManager.getPath()).toBe(path);
    });

    it("should return the updated path after calling setPath", () => {
      const initialPath = "/initial/path",
        updatedPath = "/updated/path",
        authorizationManager = new AuthorizationManager(initialPath);

      authorizationManager.setPath(updatedPath);

      expect(authorizationManager.getPath()).toBe(updatedPath);
    });
  });
});
describe("AuthorizationManager", () => {
  describe("getPath", () => {
    it("should return the path set in the constructor", () => {
      const path = "http://localhost:4002/example/path",
        authorizationManager = new AuthorizationManager(path);

      expect(authorizationManager.getPath()).toBe(path);
    });

    it("should return the updated path after calling setPath", () => {
      const initialPath = "/initial/path",
        updatedPath = "/updated/path",
        authorizationManager = new AuthorizationManager(initialPath);

      authorizationManager.setPath(updatedPath);

      expect(authorizationManager.getPath()).toBe(updatedPath);
    });
  });

  describe("getSubjectName", () => {
    it("should return the subject name set in the setter", () => {
      const path = "http://localhost:4002/example/path",
        subjectName = "subject",
        authorizationManager = new AuthorizationManager(path);
      authorizationManager.setSubjectName(subjectName);

      expect(authorizationManager.getSubjectName()).toBe(subjectName);
    });
  });

  describe("buildSubjectForAuhorizationSubscription", () => {
    it("should build the subject for authorization subscription", async () => {
      const result = {
          name: "subject",
          roles: ["role1", "role2", "role3"],
        },
        path = "http://localhost:4002/example/path",
        subjectName = "subject",
        authorizationManager = new AuthorizationManager(path);
      authorizationManager.setSubjectName(subjectName);

      let subjectForAuhorizationSubscription =
        await authorizationManager.buildSubjectForAuhorizationSubscription();
      expect(JSON.stringify(subjectForAuhorizationSubscription)).toEqual(
        JSON.stringify(result)
      );
    });
    it("should throw an error", async () => {
      const path = "http://localhost:4003/example/path",
        subjectName = "subject",
        authorizationManager = new AuthorizationManager(path);
      authorizationManager.setSubjectName(subjectName);
      try {
        let subjectForAuhorizationSubscription =
          await authorizationManager.buildSubjectForAuhorizationSubscription();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe("Authorization failed.");
      }
    });
  });
describe("AuthorizationManager", () => {
  describe("_requestAuthorization", () => {
    it("should return roles when authorization is successful", async () => {
      const path = "http://localhost:4002/example/path",
        subjectName = "subject",
        authorizationManager = new AuthorizationManager(path);
      authorizationManager.setSubjectName(subjectName);

      const response = await authorizationManager["_requestAuthorization"]();
      expect(response).toEqual(["role1", "role2", "role3"]);
    });

    it("should throw an error when authorization fails", async () => {
      const path = "http://localhost:4003/example/path",
        subjectName = "subject",
        authorizationManager = new AuthorizationManager(path);
      authorizationManager.setSubjectName(subjectName);

      await expect(authorizationManager["_requestAuthorization"]()).rejects.toThrow(
        "Authorization failed."
      );
    });
  });
});
});
