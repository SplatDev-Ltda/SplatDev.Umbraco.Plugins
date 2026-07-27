# Infrastructure as Code

Azure deployment templates for SplatDev shared services — resource group, storage, Key Vault, Service Bus, and App Service.

## Contents

- `bicep/main.bicep` — minimal skeleton deploying shared Azure resources (dev/staging/prod).

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) with an active subscription.
- [Bicep CLI](https://docs.microsoft.com/azure/azure-resource-manager/bicep/install) (or use `az bicep`).

## Deploy

```sh
az group create -n rg-splatdev-dev -l eastus
az deployment group create \
  --resource-group rg-splatdev-dev \
  --template-file infra/bicep/main.bicep \
  --parameters environment=dev
```

## Resources created

| Resource | Purpose |
|----------|---------|
| Resource Group | `rg-splatdev-{env}` — logical container |
| Storage Account | Blobs, queues, tables for app data |
| Key Vault | Secrets and connection strings |
| Service Bus | Messaging backbone for async operations |
| App Service Plan + Web App | .NET hosting (PremiumV2) |

## Environment parameters

| Parameter | Values | Default |
|-----------|--------|---------|
| `location` | Any Azure region | `East US` |
| `environment` | `dev`, `staging`, `prod` | `dev` |

## Known limitations

- This is a **minimal skeleton** — production deployments should add private endpoints, managed identities, network ACLs, diagnostic settings, and auto-scale rules.
- Key Vault access policies are provisioned empty; add service principals or managed identities as needed.
- Only a single web app is defined — multi-region or slot-based deployments require template extension.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
