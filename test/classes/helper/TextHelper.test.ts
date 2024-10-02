import { describe, expect, it } from "@jest/globals";
import { TextHelper } from "../../../src/classes/helper/TextHelper";

describe("TextHelper", () => {
  describe("decodeChunk", () => {
    it("should decode the chunk using TextDecoder and return empty ", () => {
      const chunk = new Uint8Array([104, 101, 108, 108, 111]); // "hello"

      const decodedChunk = TextHelper.decodeData(chunk);

      expect(decodedChunk).toBe("");
    });

    it("should decode the chunk using TextDecoder and return value ", () => {
      const encodedChunk = new TextEncoder().encode(
        JSON.stringify({ data: "hello" })
      );

      const chunk = new Uint8Array(encodedChunk);

      const decodedChunk = TextHelper.decodeData(chunk);

      expect(decodedChunk).not.toBe("");
    });

    it("should return empty string", () => {
      const chunk = new TextEncoder().encode(JSON.stringify(undefined));

      const decodedChunk = TextHelper.decodeData(chunk);

      expect(decodedChunk).toBe("");
    });
  });
});
