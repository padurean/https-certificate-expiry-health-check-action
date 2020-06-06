const core = require('@actions/core');
const proc = require('child_process');
const duration = require('duration-js');
const checkCertExpiration = require('check-cert-expiration');

function asBoolean(str) {
  return str && ['yes', 'true', 'y', '1'].includes(str);
}

const processConfig = {
  stdio: 'inherit',
  encoding: 'utf8',
};

function curl(url, { maxAttempts, retryDelay, followRedirect }) {
  const retrySettings = maxAttempts <= 1
    ? ''
    : `--retry ${maxAttempts} --retry-delay ${retryDelay}`;
  const redirectSettings = followRedirect ? '-L' : '';

  core.info(`Checking ${url}`);
  const command = `curl --fail -sv ${redirectSettings} ${url} ${retrySettings}`;
  core.debug(`Command: ${command}`);

  const out = proc.execSync(command, processConfig);

  core.info(out);
}

async function certCheck(url, maxDaysLeft) {
  try {
    const { daysLeft, host, port } = await checkCertExpiration(url);
    core.info(`${daysLeft} days until the certificate expires for ${host}:${port}`);
    if (daysLeft <= maxDaysLeft) {
      const errMsg = `Certificate for ${url} will expire in ${daysLeft} days (<= ${maxDaysLeft} days)`;
      core.error(errMsg);
      core.setFailed(errMsg);
    }
  } catch (err) {
    core.error(`${err.name}:${err.message}`);
    core.setFailed(`Error checking cert expiration for ${url}: ${err}`);
  }
}

try {
  const urls = core.getInput('url', { required: true }).split('|');
  const maxAttempts = parseInt(core.getInput('max-attempts'), 10);
  const retryDelay = duration.parse(core.getInput('retry-delay')).seconds();
  const followRedirect = asBoolean(core.getInput('follow-redirect'));
  const checkCert = asBoolean(core.getInput('check-cert'));

  urls.forEach((u) => {
    curl(u, { maxAttempts, retryDelay, followRedirect });
    if (checkCert) {
      certCheck(u);
    }
  });

  core.info('Success');
} catch (err) {
  core.error(`${err.message}:${err.message}`);
  core.setFailed(`Error running action: ${err}`);
}
