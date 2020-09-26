const deps = require("./deps");

const defaultFormatFn = (content) => content;

module.exports = async ({
  streamFn,
  findFn,
  writeFn,
  removeFn,
  queryFn,
  sortFn,
  updateFn,
  formatFn = defaultFormatFn,
  emptyFn,
  countFn,
  groupsLookupFn,
  one,
  group,
  updateKey,
} = {}) => {
  deps
    .server()
    .get(deps.idStream({ streamFn, ...(queryFn && { queryFn }) }), {
      path: "/stream-ids",
    })
    .get(
      deps.get({
        findFn,
        countFn,
        groupsLookupFn,
        ...(queryFn && { queryFn }),
        ...(sortFn && { sortFn }),
        ...(formatFn && { formatFn }),
        ...(emptyFn && { emptyFn }),
        ...(one && { one }),
        ...(group && { group }),
        ...(updateKey && { updateKey }),
      }),
      {
        path: "/:id?",
      }
    )
    .put(
      deps.put(
        {
          writeFn,
          ...(updateFn && { updateFn }),
          ...(formatFn && { formatFn }),
          ...(updateKey && { updateKey }),
        },
        {
          path: "/:id",
        }
      )
    )
    .delete(
      deps.delete(
        { removeFn, groupsLookupFn, ...(group && { group }) },
        {
          path: "/:id?",
        }
      )
    )
    .listen();
};
