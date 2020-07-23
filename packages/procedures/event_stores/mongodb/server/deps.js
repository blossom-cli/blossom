const { store } = require("@blossm/mongodb-database");
const { string: dateString } = require("@blossm/datetime");
const eventStore = require("@blossm/event-store");
const saveEvents = require("@blossm/mongodb-event-store-save-events");
const aggregate = require("@blossm/mongodb-event-store-aggregate");
const reserveRootCounts = require("@blossm/mongodb-event-store-reserve-root-counts");
const query = require("@blossm/mongodb-event-store-query");
const stream = require("@blossm/mongodb-event-store-stream");
const rootStream = require("@blossm/mongodb-event-store-root-stream");
const count = require("@blossm/mongodb-event-store-count");
const createTransaction = require("@blossm/mongodb-event-store-create-transaction");
const saveSnapshot = require("@blossm/mongodb-event-store-save-snapshot");
const saveBlock = require("@blossm/mongodb-event-store-save-block");
const latestBlock = require("@blossm/mongodb-event-store-latest-block");
const formatSchema = require("@blossm/format-mongodb-schema");
const idempotencyConflictCheck = require("@blossm/mongodb-event-store-idempotency-conflict-check");
const uuid = require("@blossm/uuid");
const nonce = require("@blossm/nonce");

exports.dateString = dateString;
exports.eventStore = eventStore;
exports.db = { store };
exports.saveEvents = saveEvents;
exports.saveSnapshot = saveSnapshot;
exports.aggregate = aggregate;
exports.reserveRootCounts = reserveRootCounts;
exports.query = query;
exports.stream = stream;
exports.rootStream = rootStream;
exports.createTransaction = createTransaction;
exports.idempotencyConflictCheck = idempotencyConflictCheck;
exports.count = count;
exports.formatSchema = formatSchema;
exports.uuid = uuid;
exports.saveBlock = saveBlock;
exports.latestBlock = latestBlock;
exports.nonce = nonce;
