const deps = require("./deps");

module.exports = ({ name, domain, context } = {}) => async (req, res) => {
  const response = await deps
    .viewStore({
      name,
      ...(domain && { domain }),
      ...(context && { context })
    })
    .set({
      tokenFns: { internal: deps.gcpToken },
      context: req.context,
      claims: req.claims
    })
    .read(req.query);

  res.status(200).send(response);
};
