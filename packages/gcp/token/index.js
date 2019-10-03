const deps = require("./deps");
const logger = require("@sustainers/logger");

const serverId = () => {
  switch (process.env.NODE_ENV) {
  case "staging":
    return "p3u6hkyfwa";
  case "sandbox":
    return "ixixyzl3ea";
  case "production":
    return "qzhmgyrp2q";
  default:
    return null;
  }
};

///https://cloud.google.com/run/docs/authenticating/service-to-service
module.exports = async ({ operation }) => {
  const id = serverId();

  if (!id) return null;

  const metadataServerTokenUrl =
    "http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=";

  const headers = { "Metadata-Flavor": "Google" };

  const operationName = operation
    .split(".")
    .reverse()
    .join("-");

  const url = `https://${operationName}-${id}-uc.a.run.app`;

  logger.info("url is: ", { url, full: metadataServerTokenUrl + url, headers });
  const response = await deps.get(metadataServerTokenUrl + url, null, headers);

  logger.info("res: ", { response });
  if (response.statusCode >= 300) return null;
  return response.body;
};
