const deps = require("./deps");

module.exports = ({
  saveEventsFn,
  reserveRootCountsFn,
  publishFn,
  hashFn,
  createTransactionFn,
  idempotencyConflictCheckFn,
}) => async (req, res) => {
  const uniqueEventData = [];
  await Promise.all(
    req.body.eventData.map(async ({ event, number }) => {
      if (event.headers.idempotency != undefined) {
        const conflict = await idempotencyConflictCheckFn(
          event.headers.idempotency
        );

        //If theres no idempotency conflict in the database and no local conflict, proceed.
        if (
          conflict ||
          uniqueEventData.some(
            ({ event: uniqueEvent }) =>
              uniqueEvent.headers.idempotency == event.headers.idempotency
          )
        )
          return;
      }
      uniqueEventData.push({ event, ...(number && { number }) });
    })
  );

  const { events } = await createTransactionFn(
    deps.postTransaction({
      eventData: uniqueEventData,
      scenario: req.body.scenario,
      saveEventsFn,
      reserveRootCountsFn,
      hashFn,
    })
  );

  //No need to publish to the same topic twice.
  let publishedTopics = [];
  await Promise.all(
    events.map((e) => {
      if (publishedTopics.includes(e.headers.topic)) return;
      publishedTopics.push(e.headers.topic);
      return publishFn(
        {
          from: e.headers.created,
        },
        e.headers.topic
      );
    })
  );

  res.sendStatus(204);
};
