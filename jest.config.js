/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/classes/helper/ExponentialBackoffStream.ts", // Exclude this specific file
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/**/*.test.ts"],
};
