const core = require('@actions/core');
const proc = require('child_process');
const sslCertificate = require('get-ssl-certificate');

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

function certCheck(url, port, maxDaysLeft) {
  const protocol = 'https:';
  return sslCertificate.get(url, 3000, port, protocol).then(
    (certificate) => {
      const certValidToUnixMillis = Date.parse(certificate.valid_to);
      const daysLeft = (certValidToUnixMillis - new Date().getTime()) / (1000 * 60 * 60 * 24);
      const expireMsg = `Certificate for ${protocol}//${url}:${port} is valid until ${certificate.valid_to} hence it will expire in ${daysLeft} days`;
      core.info(expireMsg);
      if (daysLeft <= maxDaysLeft) {
        core.error(expireMsg);
        core.setFailed(expireMsg);
        return expireMsg;
      }
      return null;
    },
    (err) => {
      core.error(err);
      core.setFailed(err);
      return `${err.message}`;
    },
  );
}

module.exports = { curl, certCheck };
