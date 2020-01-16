const { expect } = require("chai").use(require("sinon-chai"));
const { restore, replace, fake } = require("sinon");

const saveEvent = require("..");

const deps = require("../deps");

const createResult = { a: 1 };
const id = "some-id";

describe("Mongodb event store create event", () => {
  afterEach(() => {
    restore();
  });
  it("should call with the correct params", async () => {
    const eventStore = "some-event-store";

    const createFake = fake.returns([{ ...createResult, __v: 3, _id: 4 }]);

    const db = {
      create: createFake
    };
    replace(deps, "db", db);

    const event = {
      id
    };
    const saveEventFnResult = await saveEvent({ eventStore })(event);
    expect(createFake).to.have.been.calledWith({
      store: eventStore,
      data: event
    });
    expect(saveEventFnResult).to.deep.equal(createResult);
  });
  it("should throw correct error when events have a duplicate id", async () => {
    const eventStore = "some-event-store";

    class DuplicateError extends Error {
      constructor() {
        super();
        this.code = "11000";
        this.keyPattern = { id: 1 };
      }
    }
    const createFake = fake.throws(new DuplicateError());

    const db = {
      create: createFake
    };
    replace(deps, "db", db);

    const event = {
      id,
      headers: {
        number: "some-number"
      }
    };
    try {
      await saveEvent({ eventStore })(event);

      //shouldn't get called
      expect(1).to.equal(2);
    } catch (e) {
      expect(e.statusCode).to.equal(412);
    }
  });
});
