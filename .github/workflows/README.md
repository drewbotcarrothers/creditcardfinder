# GitHub Actions Workflows

## Available Workflows

### 1. `deploy.yml` - Deploy to Hostinger
**Trigger:** Push to master or manual dispatch

This workflow:
1. Installs dependencies
2. Builds the Next.js app
3. Deploys via FTP to Hostinger
4. Creates a backup artifact if FTP fails
5. Always creates a downloadable artifact for manual upload

**Status:** ⚠️ FTP may timeout due to Hostinger blocking GitHub Actions IPs

**Manual Deploy:** If FTP fails, download the artifact from the workflow and upload via FileZilla.

### 2. `build-only.yml` - Build Verification
**Trigger:** Manual dispatch or Pull Requests

This workflow:
- Builds the app without deploying
- Verifies the build succeeds
- Useful for testing PRs before merging

## Troubleshooting

### FTP Timeout
If you see "Timeout (control socket)" error:
- Hostinger is blocking GitHub Actions IP ranges
- Download the artifact from the workflow
- Upload manually via FileZilla

### FileZilla Settings:
- Host: `premium189.web-hosting.com`
- Username: `u163076614`
- Port: `21`
- Protocol: `FTP`
- Encryption: `Use explicit FTP over TLS if available`
- Remote path: `/home/u163076614/domains/canadiancreditcardfinder.com/public_html/`

## Secrets Required

Create these in GitHub Settings > Secrets > Actions:

- `FTP_HOST`: `premium189.web-hosting.com`
- `FTP_USERNAME`: `u163076614`
- `FTP_PASSWORD`: (Your Hostinger FTP password)
