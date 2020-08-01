const { oneLine } = require("common-tags");

module.exports = ({ name, project, maxDispatchPerSecond }) => {
  return {
    name: "gcr.io/cloud-builders/gcloud",
    entrypoint: "bash",
    args: [
      "-c",
      oneLine`
    gcloud tasks queues create ${name}
    --log-sampling-ratio=0.1
    --max-dispatches-per-second=${maxDispatchPerSecond}
    --max-concurrent-dispatches=100
    --project=${project} 
    --quiet || exit 0
    `,
    ],
  };
};
