const { expect } = require("chai").use(require("sinon-chai"));
const { restore, fake, replace } = require("sinon");

const get = require("..");
const deps = require("../deps");

const response = "some-response";
const query = "some-query";
const context = "some-context";

const name = "some-name";
const domain = "some-domain";
const service = "some-service";
const network = "some-network";

process.env.SERVICE = service;
process.env.NETWORK = network;

describe("Gateway post", () => {
  afterEach(() => {
    restore();
  });

  it("should call with the correct params", async () => {
    const readFake = fake.returns(response);
    const setFake = fake.returns({
      read: readFake
    });
    const viewStoreFake = fake.returns({
      set: setFake
    });
    replace(deps, "viewStore", viewStoreFake);
    const req = {
      query,
      params: {
        name,
        domain
      },
      context
    };

    const sendFake = fake();
    const res = {
      send: sendFake
    };

    await get()(req, res);

    expect(viewStoreFake).to.have.been.calledWith({
      name,
      domain,
      service,
      network
    });
    expect(readFake).to.have.been.calledWith(query);
    expect(setFake).to.have.been.calledWith({
      context,
      tokenFn: deps.gcpToken
    });
    expect(sendFake).to.have.been.calledWith(response);
  });
  it("should throw correctly", async () => {
    const errMessage = "some-err-message";
    const readFake = fake.rejects(new Error(errMessage));
    const setFake = fake.returns({
      read: readFake
    });
    const viewStoreFake = fake.returns({
      set: setFake
    });
    replace(deps, "viewStore", viewStoreFake);

    const req = {
      context,
      params: {
        name,
        domain
      }
    };

    const sendFake = fake();
    const statusFake = fake.returns({
      send: sendFake
    });
    const res = {
      status: statusFake
    };

    try {
      await get()(req, res);

      //shouldn't get called
      expect(1).to.equal(0);
    } catch (e) {
      expect(e.message).to.equal(errMessage);
    }
  });
});
