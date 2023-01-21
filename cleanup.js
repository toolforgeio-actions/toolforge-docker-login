const core = require('@actions/core');
const exec = require('@actions/exec');

/**
 * When the GitHub Actions job is done, logout of Docker registry.
 */

const STATES = {
    registry: 'registry'
};

async function cleanup() {
    try {
        const registry = core.getState(STATES.registry);
        if (registry) {
            core.info(`Logging out of registry ${registry}`);

            // Execute the docker logout command
            let doLogoutStdout = '';
            let doLogoutStderr = '';
            const exitCode = await exec.exec('docker', ['logout', registry], {
                silent: true,
                ignoreReturnCode: true,
                listeners: {
                    stdout: (data) => {
                        doLogoutStdout += data.toString();
                    },
                    stderr: (data) => {
                        doLogoutStderr += data.toString();
                    }
                }
            });
            if (exitCode !== 0) {
                core.debug(doLogoutStdout);
                throw new Error(`Failed to logout of registry ${registry}`);
            }
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

module.exports = {
    cleanup
};

if (require.main === module) {
    cleanup();
}