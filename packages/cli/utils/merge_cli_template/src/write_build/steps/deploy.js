module.exports = ({
  region,
  project,
  service,
  network,
  memory,
  envNameSpecifier,
  envUriSpecifier,
  operationName,
  operationHash,
  secretBucket,
  secretBucketKeyLocation,
  secretBucketKeyRing,
  extension,
  nodeEnv,
  env = "",
  labels = "",
  allowUnauthenticated = false
} = {}) => {
  return {
    name: "gcr.io/cloud-builders/gcloud",
    args: [
      "beta",
      "run",
      "deploy",
      `${region}-${operationName}-${operationHash}`,
      `--image=us.gcr.io/${project}${envNameSpecifier}${service}.${context}${
        extension ? `.${extension}` : ""
      }`,
      "--platform=managed",
      `--memory=${memory}`,
      ...(allowUnauthenticated ? ["--allow-unauthenticated"] : []),
      `--project=${project}${envNameSpecifier}`,
      `--region=${region}`,
      `--set-env-vars=NODE_ENV=${nodeEnv},NETWORK=${region}.${envUriSpecifier}${network},SERVICE=${service},CONTEXT=${context},GCP_PROJECT=${project}${envNameSpecifier},GCP_REGION=${region},GCP_SECRET_BUCKET=${secretBucket},GCP_KMS_SECRET_BUCKET_KEY_LOCATION=${secretBucketKeyLocation},GCP_KMS_SECRET_BUCKET_KEY_RING=${secretBucketKeyRing},${env}`,
      `--labels=service=\${_SERVICE},context=\${_CONTEXT},${labels}`
    ]
  };
};
