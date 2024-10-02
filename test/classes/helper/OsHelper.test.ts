import * as os from "os";
import { OsHelper } from "../../../src/classes/helper/OsHelper";
import { describe, expect, it } from "@jest/globals";

describe("OsHelper", () => {
  describe("getOsUsername", () => {
    it("should return the username of the current OS user", () => {
      const expectedUsername = os.userInfo().username;

      const actualUsername = OsHelper.getOsUsername();

      expect(actualUsername).toBe(expectedUsername);
    });
  });
});
