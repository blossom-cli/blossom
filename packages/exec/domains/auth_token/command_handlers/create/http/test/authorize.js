const { expect } = require("chai");
const authorize = require("../src/authorize");

describe("Authorize", () => {
  it("should handle correct params correctly", async () => {
    const params = {};

    expect(await authorize(params)).to.not.throw;
  });
});
