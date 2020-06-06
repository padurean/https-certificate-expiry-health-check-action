const Duration = require('duration-js');
const checkers = require('./checkers');

test('cURL-based health check', () => {
  const maxAttempts = 1;
  const retryDelay = new Duration().seconds();
  const followRedirect = true;
  expect(() => checkers.curl(
    'https://postman-echo.com/status/200',
    { maxAttempts, retryDelay, followRedirect },
  )).not.toThrow();
});

test('TLS cert check', () => {
  return expect(checkers.certCheck('postman-echo.com', 443, 3)).resolves.toBeNull();
});
