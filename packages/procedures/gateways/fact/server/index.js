const deps = require("./deps");

module.exports = async ({
  facts,
  domain = process.env.DOMAIN,
  service = process.env.SERVICE,
  allow,
  permissionsLookupFn,
  terminatedSessionCheckFn,
  deletedSceneCheckFn,
  verifyFn,
  internalTokenFn,
  nodeExternalTokenFn,
  algorithm,
  audience,
}) => {
  let server = deps.server({
    prehook: (app) =>
      deps.corsMiddleware({
        app,
        allow,
        credentials: true,
        methods: ["GET"],
      }),
  });

  for (const {
    name,
    network,
    service: factService,
    key = "access",
    privileges,
    protection = "strict",
    context,
  } of facts) {
    const get = ({ stream }) =>
      deps.get({
        name,
        domain,
        service: factService || service,
        ...(network && { network }),
        internalTokenFn,
        nodeExternalTokenFn,
        key,
        stream,
      });
    const preMiddleware = {
      ...(protection != "none" && {
        preMiddleware: [
          deps.authentication({
            verifyFn: verifyFn({ key }),
            audience,
            algorithm,
            protection,
            cookieKey: key,
          }),
          ...(protection == "strict"
            ? [
                deps.authorization({
                  permissionsLookupFn,
                  terminatedSessionCheckFn,
                  deletedSceneCheckFn,
                  internalTokenFn,
                  context,
                  permissions:
                    privileges instanceof Array
                      ? privileges.map((privilege) => {
                          return { service, domain, privilege };
                        })
                      : privileges,
                }),
              ]
            : []),
        ],
      }),
    };
    server = server
      .get(get({ stream: false }), {
        path: `/${name}/:root?`,
        ...preMiddleware,
      })
      .get(get({ stream: true }), {
        path: `/${name}/stream/:root?`,
        ...preMiddleware,
      });
  }

  server.listen();
};
