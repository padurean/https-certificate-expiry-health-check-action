# TLS/SSL/HTTPS certificate expiration and health check action

A JS & cURL-based post-deploy TLS certificate expiry verifying and health check action with build-in redirect & retry.

```yaml
steps:
  - name: Check the health and certificate date for the specified URL(s)
    uses: padurean/https-certificate-expiry-health-check-action@v1.0
    with:
      # Check the following URLs
      url: https://someURL.com|http://someOtherURL.com
      # Follow redirects, or just report success on 3xx reponse status codes
      follow-redirect: no # Optional, defaults to "no"
      # Fail this action after this many failed attempts
      max-attempts: 3 # Optional, defaults to 1
      # Delay between retries
      retry-delay: 3s # Optional, only used if max-attempts > 1


Check [check.yml](./.github/worflows/check.yml) for a complete example.
You may want to run this periodically, though (instead of on push), for example this triggers the workflow every 15 minutes:

```yaml
on:
  schedule:
    # * is a special character in YAML so you have to quote this string
    - cron:  '*/15 * * * *'
```

[Check this](https://help.github.com/en/actions/reference/events-that-trigger-workflows) for more details on how to trigger GitHub workflows.

The action will fail if any of the URLs reports either 4xx or 5xx status codes or if the TLS certificate is expired.

*NOTE* Build script requires Vercel's [NCC](https://www.npmjs.com/package/@zeit/ncc) to be installed on the machine.
