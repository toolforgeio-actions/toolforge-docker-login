const core = require('@actions/core');
const exec = require('@actions/exec');
const fetch = require('node-fetch');

const INPUTS = {
  apiBaseUrl: 'api-base-url',
  registry: 'registry',
  apiKey: 'api-key'
};

const OUTPUTS = {
  registry: 'registry',
  dockerUsername: 'docker-username',
  dockerPassword: 'docker-password'
};

const STATES = {
  registry: 'registry'
};

async function getDockerCredentials(apiBaseUrl, apiKey) {
  const response = await fetch(`${apiBaseUrl}/docker/otp`, {
    method: "POST",
    headers: {
      authorization: `bearer ${apiKey}`
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to generate docker credentials with status ${response.status}`);
  }
  return await response.json();
}

async function doDockerLogin(registry, username, password) {
  let doDockerLoginStdout = '';
  let doDockerLoginStderr = '';
  const exitCode = await exec.exec('docker', ['login', '-u', username, '-p', password, registry], {
    silent: true,
    ignoreReturnCode: true,
    listeners: {
      stdout: (data) => {
        doDockerLoginStdout += data.toString();
      },
      stderr: (data) => {
        doDockerLoginStderr += data.toString();
      }
    }
  });
  if (exitCode !== 0) {
    core.debug(doDockerLoginStdout);
    throw new Error(`Could not login to registry ${registry}: ${doDockerLoginStderr}`);
  }
}

const DEFAULT_API_BASE_URL = "https://api.toolforge.io/v1";
const DEFAULT_DOCKER_REGISTRY = "docker.toolforge.io";

async function run() {
  // Get inputs
  const apiBaseUrl = core.getInput(INPUTS.apiBaseUrl, { required: false }) || DEFAULT_API_BASE_URL;
  const registry = core.getInput(INPUTS.registry, { required: false }) || DEFAULT_DOCKER_REGISTRY;
  const apiKey = core.getInput(INPUTS.apiKey, { required: true });

  let registryState = null;
  try {
    core.info(`Logging in to ${registry}...`)

    const { username, password } = await getDockerCredentials(apiBaseUrl, apiKey);

    await doDockerLogin(registry, username, password);

    core.info("Done!");

    core.setOutput(OUTPUTS.registry, registry);
    core.setOutput(OUTPUTS.dockerUsername, username);
    core.setOutput(OUTPUTS.dockerPassword, password);
    core.setSecret(password);

    registryState = registry;
  }
  catch (error) {
    core.setFailed(error.message);
  }

  if (registryState) {
    core.saveState(STATES.registry, registryState);
  }
}

module.exports = {
  run
};

if (require.main === module) {
  run();
}
