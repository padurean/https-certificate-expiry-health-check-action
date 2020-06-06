const core = require('@actions/core');
const duration = require('duration-js');
const checkers = require('./checkers');

function toBool(str) {
  return str && ['yes', 'true', 'y', '1'].includes(str);
}

try {
  const urls = core.getInput('url', { required: true }).split('|');
  const maxAttempts = parseInt(core.getInput('max-attempts'), 10);
  const retryDelay = duration.parse(core.getInput('retry-delay')).seconds();
  const followRedirect = toBool(core.getInput('follow-redirect'));
  const checkCert = toBool(core.getInput('check-cert'));
  const port = parseInt(core.getInput('port'), 10);
  const maxDaysLeft = parseInt(core.getInput('max-cert-days-left'), 10);

  urls.forEach((u) => {
    if (checkCert) {
      checkers.certCheck(u, port, maxDaysLeft);
    } else {
      checkers.curl(u, { maxAttempts, retryDelay, followRedirect });
    }
  });

  core.info('Success');
} catch (err) {
  core.error(`${err.message}:${err.message}`);
  core.setFailed(`Error running action: ${err}`);
}
