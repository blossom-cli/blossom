require("localenv");
const { expect } = require("chai");
const { string: stringDate } = require("@blossm/datetime");
const eventStore = require("@blossm/event-store-rpc");

const request = require("@blossm/request");

const url = `http://${process.env.MAIN_CONTAINER_NAME}`;

const name = "A-name";

describe("Command gateway integration tests", () => {
  it("should return successfully", async () => {
    const response = await request.post(`${url}/some-other-action`, {
      body: {
        headers: {
          issued: stringDate()
        },
        payload: {
          name
        }
      }
    });

    const root = JSON.parse(response.body).root;

    const aggregate = await eventStore({
      domain: process.env.DOMAIN
    }).aggregate(root);

    expect(aggregate.headers.root).to.equal(root);
    expect(aggregate.state.name).to.equal(name.toLowerCase());
    expect(response.statusCode).to.equal(200);
  });
  it("should return an error if incorrect params", async () => {
    const phone = { a: 1 };
    const response = await request.post(`${url}/some-other-action`, {
      body: {
        headers: {
          issued: stringDate()
        },
        payload: {
          phone
        }
      }
    });
    expect(response.statusCode).to.equal(409);
  });
});
