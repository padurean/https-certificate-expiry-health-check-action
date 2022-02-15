# TLS/SSL/HTTPS certificate expiration or health check action

GitHub action that checks the health or certificate expiration for given URL(s). Written in JS (calls cURL command) with built-in retry mechanism. Follows redirects.

The action can either perform an endpoint healthcheck:

```yaml
steps:
  - name: Check the health of the specified URL(s)
    uses: padurean/https-certificate-expiry-health-check-action@v1.0.0
    with:
      # Check the following URLs
      url: https://someURL.com|http://someOtherURL.com
      # Follow redirects, or just report success on 3xx reponse status codes
      follow-redirect: no # Optional, defaults to "no"
      # Fail this action after this many failed attempts
      max-attempts: 3 # Optional, defaults to 1
      # Delay between retries
      retry-delay: 3s # Optional, only used if max-attempts > 1
```

Or it can perform a TLS expiration check:

```yaml
steps:
  - name: Check the certificate date for the specified domain(s)
    uses: padurean/https-certificate-expiry-health-check-action@v1.0.0
    with:
      # Check the following domains (do not use https:// prefix for TLS format)
      url: someURL.com|someOtherURL.com
      # Verify TLS certificate, defaults to "no" (port and max-cert-days-left are only used if this is set to "yes")
      port: 443 # Optional, defaults to 443
      # Max number of days till cert expiration; if this value is reached, the check will fail
      max-cert-days-left: 1
```

Check [check.yml](./.github/workflows/check.yml) for a complete example.
You may want to run this periodically, though (instead of on push), for example this triggers the workflow every 15 minutes:

```yaml
on:
  schedule:
    # * is a special character in YAML so you have to quote this string
    - cron:  '*/15 * * * *'
```

[Check this](https://help.github.com/en/actions/reference/events-that-trigger-workflows) for more details on how to trigger GitHub workflows.

The action will fail if any of the URLs reports either 4xx or 5xx status codes or if the TLS certificate is expired.

### Build & Test locally:

```bash
npm run build
npm run test
```

**NOTE**: Build script requires Vercel's [NCC](https://www.npmjs.com/package/@vercel/ncc) to be installed on the machine.
