# Umbraco Testing Instances — Setup Guide

Provision Umbraco 13 and 17 test instances on the SplatDev .25 VPS for
plugin QA testing.

## Prerequisites

- Operator with root/sudo access on .25 (169.197.183.25)
- MSSQL SA password (use existing `hostmssql` or set a new one)
- DNS A records for `u13-testing.splatdev.tech` and `u17-testing.splatdev.tech` → 169.197.183.25
- `.NET 8 SDK` and `.NET 10 SDK` for building (on WSL or wherever `dotnet` is available)

## DNS (operator — one time)

Create these A records at the DNS provider (GoDaddy / Cloudflare):

| Hostname | Type | Value | TTL |
|----------|------|-------|-----|
| u13-testing.splatdev.tech | A | 169.197.183.25 | 600 |
| u17-testing.splatdev.tech | A | 169.197.183.25 | 600 |

> GoDaddy: Domain Suite says `dns_write` is supported but the current account may need
> Domain Pro. If that fails, switch to Cloudflare or ask operator to create manually.

## Build (operator — WSL)

Build both Umbraco images from the repo root:

```bash
cd ~/paperclip-surfers/SplatDev.Umbraco.Plugins

# Restore all packages
dotnet restore SplatDev.Core.sln

# Build U13 image (uses Dockerfile.u13)
docker build -t umbraco-u13-testing:latest \
  -f test-environments/Dockerfile.u13 .

# Build U17 image (uses Dockerfile.u17)
docker build -t umbraco-u17-testing:latest \
  -f test-environments/Dockerfile.u17 .
```

## Deploy to .25

### 1. Transfer images

```bash
# Save and transfer
docker save umbraco-u13-testing:latest umbraco-u17-testing:latest | \
  ssh root@169.197.183.25 "docker load"
```

### 2. Copy compose + configs

```bash
scp test-environments/docker-compose.testing.yml root@169.197.183.25:/opt/umbraco-testing/
scp test-environments/nginx/u13-testing.conf root@169.197.183.25:/etc/nginx/sites-enabled/
scp test-environments/nginx/u17-testing.conf root@169.197.183.25:/etc/nginx/sites-enabled/
```

### 3. Start containers

```bash
ssh root@169.197.183.25
cd /opt/umbraco-testing
export MSSQL_SA_PASSWORD="<production-password>"
docker compose -f docker-compose.testing.yml up -d
```

### 4. Reload nginx

```bash
nginx -t && nginx -s reload
```

> **aaPanel note:** If nginx is managed via aaPanel, add the vhost configs through
> the aaPanel UI: Websites → Add Site → enter the domain, then set the
> reverse proxy target to `http://127.0.0.1:5100` (U13) or `http://127.0.0.1:5101` (U17).

## Verify

```bash
# U13 backoffice
curl -I http://u13-testing.splatdev.tech/umbraco

# U17 backoffice
curl -I http://u17-testing.splatdev.tech/umbraco
```

Both should return HTTP 302 (redirect to login). The Umbraco install screen
appears on first visit — follow the wizard to create admin credentials.

## Admin Credentials

Store admin credentials in the Umbraco Plugins project (Paperclip documents,
not committed to repo). After first-run setup:

| Instance | URL | Admin User |
|----------|-----|------------|
| U13 | http://u13-testing.splatdev.tech/umbraco | (set during install) |
| U17 | http://u17-testing.splatdev.tech/umbraco | (set during install) |

## Troubleshooting

### Container won't start
```bash
docker logs umbraco-u13-testing
docker logs umbraco-u17-testing
```

### MSSQL connection failed
Verify `hostmssql` is reachable from the umbraco-testing network:
```bash
docker exec umbraco-u13-testing ping hostmssql
```

### Port already in use
Check if 5100/5101 are bound:
```bash
ss -tlnp | grep -E '5100|5101'
```
