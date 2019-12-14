const normalize = require("@blossm/normalize-cli");
const roboSay = require("@blossm/robo-say");
const fs = require("fs");
const yaml = require("yaml");
const path = require("path");
const { red } = require("chalk");

const config = require("./config");
const begin = require("./begin");
const init = require("./init");
const issue = require("./issue");
const set = require("./set");
const secret = require("./secret");

const domains = ["begin", "config", "init", "issue", "set"];

const tryShortcuts = input => {
  const inputPath =
    input.positionalArgs.length > 0 ? input.positionalArgs[0] : ".";
  const configPath = path.resolve(process.cwd(), inputPath, "blossm.yaml");
  const config = yaml.parse(fs.readFileSync(configPath, "utf8"));

  if (!config.context) throw "Context not set.";

  const args = [config.context];

  switch (input.domain) {
    case "test":
      break;
    case "deploy":
      break;
  }
  if (input.domain == "test") {
    args.push("deploy");
    args.push("--test-only");
  } else {
    args.push(input.domain);
  }
  args.push(...input.args);
  issue(args);
};

const forward = input => {
  switch (input.domain) {
    case "begin":
      return begin(input.args);
    case "config":
      return config(input.args);
    case "init":
      return init(input.args);
    case "issue":
      return issue(input.args);
    case "secret":
      return secret(input.args);
    case "set":
      return set(input.args);
    default: {
      try {
        tryShortcuts(input);
      } catch (e) {
        //eslint-disable-next-line no-console
        console.error(
          roboSay(
            `This domain isn't recognized. Choose from one of these [${domains.join(
              ", "
            )}], or from one of these shortcuts [deploy, test]`
          ),
          red.bold("error")
        );
      }
    }
  }
};

exports.cli = async rawArgs => {
  const input = await normalize({
    entrypointType: "domain",
    args: rawArgs.slice(2)
  });

  forward(input);
};
