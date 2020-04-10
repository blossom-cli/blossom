const deps = require("./deps");

module.exports = async ({
  commands,
  domain = process.env.DOMAIN,
  service = process.env.SERVICE,
  internalTokenFn,
  externalTokenFn,
  algorithm,
  audience,
  whitelist,
  permissionsLookupFn,
  terminatedSessionCheckFn,
  verifyFn,
  keyClaimsFn
}) => {
  let server = deps.server({
    prehook: app =>
      deps.corsMiddleware({
        app,
        whitelist,
        credentials: true,
        methods: ["POST"]
      })
  });

  for (const {
    name,
    network,
    service: commandService,
    key = "access",
    priviledges,
    protection = "strict",
    basic = false,
    context
  } of commands) {
    server = server.post(
      deps.post({
        name,
        domain,
        service: commandService || service,
        ...(network && { network }),
        internalTokenFn,
        externalTokenFn
      }),
      {
        path: `/${name}`,
        ...(protection != "none" && {
          preMiddleware: [
            deps.authentication({
              verifyFn: verifyFn({ key }),
              keyClaimsFn,
              audience,
              algorithm,
              strict: protection == "strict",
              allowBasic: basic
            }),
            ...(protection == "strict"
              ? [
                  deps.authorization({
                    permissionsLookupFn,
                    terminatedSessionCheckFn,
                    context,
                    permissions:
                      priviledges instanceof Array
                        ? priviledges.map(priviledge => {
                            return { service, domain, priviledge };
                          })
                        : priviledges
                  })
                ]
              : [])
          ]
        })
      }
    );
  }

  server.listen();
};
