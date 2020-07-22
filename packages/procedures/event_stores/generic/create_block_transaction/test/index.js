const { expect } = require("chai")
  .use(require("chai-datetime"))
  .use(require("sinon-chai"));

const { restore, fake, match, stub, replace, useFakeTimers } = require("sinon");

const create = require("..");
const deps = require("../deps");

let clock;
const now = new Date();

const transaction = "some-transaction";

const previousBoundary = "some-previous-boundary";
const previousHash = "some-previous-hash";
const root = "some-root";
const snapshotHash = "some-snapshot-hash";
const aggregateLastEventNumber = "some-snapshot-last-event-number";
const aggregateState = "some-aggregate-state";
const eventCononicalString = "some-event-connical-string";
const snapshotCononicalString = "some-snapshot-connical-string";
const snapshotMerkleRoot = "some-snapshot-merkle-root";
const hash = "some-hash";
const anotherRoot = "another-root";
const snapshot = "some-snapshot";
const blockMerkleRoot = "some-block-merkle-root";
const previousNumber = 4;

const network = "some-env-network";
const service = "some-env-service";
const domain = "some-env-domain";
process.env.NETWORK = network;
process.env.SERVICE = service;
process.env.DOMAIN = domain;

describe("Event store create block transaction", () => {
  beforeEach(() => {
    clock = useFakeTimers(now.getTime());
  });
  afterEach(() => {
    clock.restore();
    restore();
  });

  it("should call with the correct params", async () => {
    const public = true;
    const latestBlock = {
      boundary: previousBoundary,
      hash: previousHash,
      number: previousNumber,
    };
    const latestBlockFnFake = fake.returns(latestBlock);

    const rootStreamFnFake = stub().yieldsTo("fn", { root });

    const event = {};
    const aggregate = {
      events: [event],
      snapshotHash,
      lastEventNumber: aggregateLastEventNumber,
      state: aggregateState,
    };
    const aggregateFnFake = fake.resolves(aggregate);

    const cononicalStringFake = stub()
      .onFirstCall()
      .returns(eventCononicalString)
      .onSecondCall()
      .returns(snapshotCononicalString);
    replace(deps, "cononicalString", cononicalStringFake);

    const merkleRootFake = stub()
      .onFirstCall()
      .returns(snapshotMerkleRoot)
      .onSecondCall()
      .returns(blockMerkleRoot);
    replace(deps, "merkleRoot", merkleRootFake);

    const hashFnFake = fake.returns(hash);

    const saveSnapshotFnFake = fake.returns(snapshot);

    const saveBlockFnFake = fake();
    await create({
      saveSnapshotFn: saveSnapshotFnFake,
      hashFn: hashFnFake,
      aggregateFn: aggregateFnFake,
      rootStreamFn: rootStreamFnFake,
      latestBlockFn: latestBlockFnFake,
      saveBlockFn: saveBlockFnFake,
      public,
    })(transaction);

    expect(latestBlockFnFake).to.have.been.calledOnceWith();
    expect(rootStreamFnFake).to.have.been.calledOnceWith({
      updatedOnOrAfter: previousBoundary,
      updatedBefore: deps.dateString(),
      parallel: 100,
      fn: match((fn) => {
        const response = fn({ root: anotherRoot });
        return Promise.resolve(response) == response;
      }),
    });
    expect(aggregateFnFake.getCall(0)).to.have.been.calledWith(root);
    expect(aggregateFnFake.getCall(1)).to.have.been.calledWith(anotherRoot);
    expect(aggregateFnFake).to.have.been.calledTwice;
    expect(cononicalStringFake.getCall(0)).to.have.been.calledWith(event);
    expect(merkleRootFake.getCall(0)).to.have.been.calledWith({
      data: [eventCononicalString, snapshotHash],
      hashFn: hashFnFake,
    });

    expect(hashFnFake).to.have.been.calledOnceWith({
      hash: snapshotMerkleRoot,
      previous: snapshotHash,
      data: [eventCononicalString],
      count: 1,
      public,
      lastEventNumber: aggregateLastEventNumber,
      root,
      state: aggregateState,
    });
    expect(saveSnapshotFnFake).to.have.been.calledOnceWith({
      snapshot: {
        data: {
          hash: snapshotMerkleRoot,
          previous: snapshotHash,
          data: [eventCononicalString],
          count: 1,
          public,
          lastEventNumber: aggregateLastEventNumber,
          root,
          state: aggregateState,
        },
        hash,
      },
      transaction,
    });
    expect(cononicalStringFake.getCall(1)).to.have.been.calledWith(snapshot);
    expect(merkleRootFake.getCall(1)).to.have.been.calledWith({
      data: [snapshotCononicalString, previousHash],
      hashFn: hashFnFake,
    });

    expect(saveBlockFnFake).to.have.been.calledOnceWith({
      block: {
        hash: blockMerkleRoot,
        previous: previousHash,
        data: [snapshotCononicalString],
        count: 1,
        number: previousNumber + 1,
        boundary: deps.dateString(),
        network,
        service,
        domain,
      },
      transaction,
    });
  });
  it("should call with the correct params with public false and no transaction", async () => {
    const public = false;
    const latestBlock = {
      boundary: previousBoundary,
      hash: previousHash,
      number: previousNumber,
    };
    const latestBlockFnFake = fake.returns(latestBlock);

    const rootStreamFnFake = stub().yieldsTo("fn", { root });

    const eventHash = "some-event-hash";
    const event = {
      hash: eventHash,
    };
    const aggregate = {
      events: [event],
      snapshotHash,
      lastEventNumber: aggregateLastEventNumber,
      state: aggregateState,
    };
    const aggregateFnFake = fake.resolves(aggregate);

    const cononicalStringFake = fake.returns(snapshotCononicalString);
    replace(deps, "cononicalString", cononicalStringFake);

    const merkleRootFake = stub()
      .onFirstCall()
      .returns(snapshotMerkleRoot)
      .onSecondCall()
      .returns(blockMerkleRoot);
    replace(deps, "merkleRoot", merkleRootFake);

    const hashFnFake = fake.returns(hash);

    const saveSnapshotFnFake = fake.returns(snapshot);

    const saveBlockFnFake = fake();
    await create({
      saveSnapshotFn: saveSnapshotFnFake,
      hashFn: hashFnFake,
      aggregateFn: aggregateFnFake,
      rootStreamFn: rootStreamFnFake,
      latestBlockFn: latestBlockFnFake,
      saveBlockFn: saveBlockFnFake,
      public,
    })();

    expect(latestBlockFnFake).to.have.been.calledOnceWith();
    expect(rootStreamFnFake).to.have.been.calledOnceWith({
      updatedOnOrAfter: previousBoundary,
      updatedBefore: deps.dateString(),
      parallel: 100,
      fn: match((fn) => {
        const response = fn({ root: anotherRoot });
        return Promise.resolve(response) == response;
      }),
    });
    expect(aggregateFnFake.getCall(0)).to.have.been.calledWith(root);
    expect(aggregateFnFake.getCall(1)).to.have.been.calledWith(anotherRoot);
    expect(aggregateFnFake).to.have.been.calledTwice;
    expect(merkleRootFake.getCall(0)).to.have.been.calledWith({
      data: [eventHash, snapshotHash],
      hashFn: hashFnFake,
    });

    expect(hashFnFake).to.have.been.calledOnceWith({
      hash: snapshotMerkleRoot,
      previous: snapshotHash,
      data: [eventHash],
      count: 1,
      public,
      lastEventNumber: aggregateLastEventNumber,
      root,
      state: aggregateState,
    });
    expect(saveSnapshotFnFake).to.have.been.calledOnceWith({
      snapshot: {
        data: {
          hash: snapshotMerkleRoot,
          previous: snapshotHash,
          data: [eventHash],
          count: 1,
          public,
          lastEventNumber: aggregateLastEventNumber,
          root,
          state: aggregateState,
        },
        hash,
      },
    });
    expect(cononicalStringFake).to.have.been.calledOnceWith(snapshot);
    expect(merkleRootFake.getCall(1)).to.have.been.calledWith({
      data: [snapshotCononicalString, previousHash],
      hashFn: hashFnFake,
    });

    expect(saveBlockFnFake).to.have.been.calledOnceWith({
      block: {
        hash: blockMerkleRoot,
        previous: previousHash,
        data: [snapshotCononicalString],
        count: 1,
        number: previousNumber + 1,
        boundary: deps.dateString(),
        network,
        service,
        domain,
      },
    });
  });
  it("should call with the correct params with no events", async () => {
    const public = true;
    const latestBlock = {
      boundary: previousBoundary,
      hash: previousHash,
      number: previousNumber,
    };
    const latestBlockFnFake = fake.returns(latestBlock);

    const rootStreamFnFake = stub().yieldsTo("fn", { root });

    const aggregate = {
      events: [],
      snapshotHash,
      lastEventNumber: aggregateLastEventNumber,
      state: aggregateState,
    };
    const aggregateFnFake = fake.resolves(aggregate);

    const cononicalStringFake = fake();
    replace(deps, "cononicalString", cononicalStringFake);

    const merkleRootFake = fake.returns(blockMerkleRoot);
    replace(deps, "merkleRoot", merkleRootFake);

    const hashFnFake = fake();
    const saveSnapshotFnFake = fake.returns(snapshot);

    const saveBlockFnFake = fake();
    await create({
      saveSnapshotFn: saveSnapshotFnFake,
      hashFn: hashFnFake,
      aggregateFn: aggregateFnFake,
      rootStreamFn: rootStreamFnFake,
      latestBlockFn: latestBlockFnFake,
      saveBlockFn: saveBlockFnFake,
      public,
    })(transaction);

    expect(latestBlockFnFake).to.have.been.calledOnceWith();
    expect(rootStreamFnFake).to.have.been.calledOnceWith({
      updatedOnOrAfter: previousBoundary,
      updatedBefore: deps.dateString(),
      parallel: 100,
      fn: match((fn) => {
        const response = fn({ root: anotherRoot });
        return Promise.resolve(response) == response;
      }),
    });
    expect(aggregateFnFake.getCall(0)).to.have.been.calledWith(root);
    expect(aggregateFnFake.getCall(1)).to.have.been.calledWith(anotherRoot);
    expect(aggregateFnFake).to.have.been.calledTwice;

    expect(hashFnFake).to.not.have.been.called;
    expect(saveSnapshotFnFake).to.not.have.been.called;
    expect(cononicalStringFake).to.not.have.been.called;
    expect(merkleRootFake.getCall(0)).to.have.been.calledWith({
      data: [previousHash],
      hashFn: hashFnFake,
    });

    expect(saveBlockFnFake).to.have.been.calledOnceWith({
      block: {
        hash: blockMerkleRoot,
        previous: previousHash,
        data: [],
        count: 0,
        number: previousNumber + 1,
        boundary: deps.dateString(),
        network,
        service,
        domain,
      },
      transaction,
    });
  });
  it("should call with the correct params with no previous hash", async () => {
    const public = true;
    const latestBlock = {
      boundary: previousBoundary,
      hash: previousHash,
      number: previousNumber,
    };
    const latestBlockFnFake = fake.returns(latestBlock);

    const rootStreamFnFake = stub().yieldsTo("fn", { root });

    const event = {};
    const aggregate = {
      events: [event],
      lastEventNumber: aggregateLastEventNumber,
      state: aggregateState,
    };
    const aggregateFnFake = fake.resolves(aggregate);

    const cononicalStringFake = stub()
      .onFirstCall()
      .returns(eventCononicalString)
      .onSecondCall()
      .returns(snapshotCononicalString);
    replace(deps, "cononicalString", cononicalStringFake);

    const merkleRootFake = stub()
      .onFirstCall()
      .returns(snapshotMerkleRoot)
      .onSecondCall()
      .returns(blockMerkleRoot);
    replace(deps, "merkleRoot", merkleRootFake);

    const hashFnFake = fake.returns(hash);

    const saveSnapshotFnFake = fake.returns(snapshot);

    const saveBlockFnFake = fake();
    await create({
      saveSnapshotFn: saveSnapshotFnFake,
      hashFn: hashFnFake,
      aggregateFn: aggregateFnFake,
      rootStreamFn: rootStreamFnFake,
      latestBlockFn: latestBlockFnFake,
      saveBlockFn: saveBlockFnFake,
      public,
    })(transaction);

    expect(latestBlockFnFake).to.have.been.calledOnceWith();
    expect(rootStreamFnFake).to.have.been.calledOnceWith({
      updatedOnOrAfter: previousBoundary,
      updatedBefore: deps.dateString(),
      parallel: 100,
      fn: match((fn) => {
        const response = fn({ root: anotherRoot });
        return Promise.resolve(response) == response;
      }),
    });
    expect(aggregateFnFake.getCall(0)).to.have.been.calledWith(root);
    expect(aggregateFnFake.getCall(1)).to.have.been.calledWith(anotherRoot);
    expect(aggregateFnFake).to.have.been.calledTwice;
    expect(cononicalStringFake.getCall(0)).to.have.been.calledWith(event);
    expect(merkleRootFake.getCall(0)).to.have.been.calledWith({
      data: [eventCononicalString, "~"],
      hashFn: hashFnFake,
    });

    expect(hashFnFake).to.have.been.calledOnceWith({
      hash: snapshotMerkleRoot,
      previous: "~",
      data: [eventCononicalString],
      count: 1,
      public,
      lastEventNumber: aggregateLastEventNumber,
      root,
      state: aggregateState,
    });
    expect(saveSnapshotFnFake).to.have.been.calledOnceWith({
      snapshot: {
        data: {
          hash: snapshotMerkleRoot,
          previous: "~",
          data: [eventCononicalString],
          count: 1,
          public,
          lastEventNumber: aggregateLastEventNumber,
          root,
          state: aggregateState,
        },
        hash,
      },
      transaction,
    });
    expect(cononicalStringFake.getCall(1)).to.have.been.calledWith(snapshot);
    expect(merkleRootFake.getCall(1)).to.have.been.calledWith({
      data: [snapshotCononicalString, previousHash],
      hashFn: hashFnFake,
    });

    expect(saveBlockFnFake).to.have.been.calledOnceWith({
      block: {
        hash: blockMerkleRoot,
        previous: previousHash,
        data: [snapshotCononicalString],
        count: 1,
        number: previousNumber + 1,
        boundary: deps.dateString(),
        network,
        service,
        domain,
      },
      transaction,
    });
  });
  it("should make a genesis block", async () => {
    const latestBlockFnFake = fake.returns();
    const genesisMerkleRoot = "some-genesis-merkle-root";
    const merkleRootFake = fake.returns(genesisMerkleRoot);
    replace(deps, "merkleRoot", merkleRootFake);
    const saveBlockFnFake = fake();
    const hashFn = "some-hash-fn";
    await create({
      latestBlockFn: latestBlockFnFake,
      saveBlockFn: saveBlockFnFake,
      hashFn,
    })(transaction);
    expect(merkleRootFake).to.have.been.calledOnceWith({
      data: ["Wherever you go, there you are.", "~"],
      hashFn,
    });
    expect(saveBlockFnFake).to.have.been.calledOnceWith({
      block: {
        hash: genesisMerkleRoot,
        previous: "~",
        data: ["Wherever you go, there you are."],
        count: 1,
        number: 0,
        boundary: "2000-01-01T05:00:00.000+00:00",
        network,
        service,
        domain,
      },
      transaction,
    });
  });
});