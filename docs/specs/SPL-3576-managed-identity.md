# SPL-3576 — Enable managed identity for Azure web apps

## Goal
Resolve CKV_AZURE_71 for the shared App Service Bicep template by enabling a system-assigned managed identity on the web app resource.

## Acceptance criteria
- `infra/bicep/main.bicep` declares `identity.type: 'SystemAssigned'` on `Microsoft.Web/sites`.
- No credentials or deployment-specific identifiers are added.
- Bicep syntax/lint validation passes where the Azure CLI is available.

## Scope
Source-only change in `SplatDev.Umbraco.Plugins`; no Azure deployment is performed by this change.

## Testing approach
Review the compiled resource shape and run `az bicep build --file infra/bicep/main.bicep` when Azure CLI is available.
