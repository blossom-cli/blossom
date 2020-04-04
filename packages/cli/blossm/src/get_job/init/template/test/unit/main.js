const { expect } = require("chai")
  .use(require("chai-datetime"))
  .use(require("sinon-chai"));
const { restore, useFakeTimers } = require("sinon");

const main = require("../../main");

let clock;
const now = new Date();

describe("Command handler unit tests", () => {
  beforeEach(() => {
    clock = useFakeTimers(now.getTime());
  });
  afterEach(() => {
    clock.restore();
    restore();
  });
  it("should return successfully", async () => {
    const query = "some-query";

    const result = await main({ query });
    expect(result).to.deep.be.undefined;
  });
});
