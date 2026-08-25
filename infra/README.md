# Infrastructure as Code — Azure Bicep Templates

Azure Bicep templates for provisioning Umbraco hosting infrastructure on Microsoft Azure, across dev/staging/prod environments.

## What's Included

`bicep/main.bicep` deploys six resources. The list below is what the template actually
declares — it previously named three of them and omitted the App Service the site runs on.

- **Resource Group** — scoped per environment (`dev`, `staging`, `prod`)
- **Storage Account** — Standard_LRS, v2, for Umbraco media and log storage. Public blob
  access off, cross-tenant replication off, TLS 1.2 minimum, HTTPS only
- **Key Vault** — secrets and keys, with soft delete and purge protection enabled
- **Service Bus namespace** — for the messaging packages
- **App Service plan** and **App Service** — `httpsOnly`, TLS 1.2 minimum, FTPS disabled,
  always on
- **Environment parameterisation** — a single `environment` param drives naming and SKU

Network reachability is deliberately left alone: the template hardens transport but does
not restrict who can reach the site, because there is no VNet or private endpoint here to
reach it by. Disabling public access without one removes the only route to the app rather
than narrowing it. That is a decision waiting on a VNet design, not an oversight.

## Usage

```bash
az deployment sub create \
  --location eastus \
  --template-file infra/bicep/main.bicep \
  --parameters environment=staging
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `location` | `East US` | Azure region for all resources |
| `environment` | `dev` | Deployment target: `dev`, `staging`, or `prod` |

## Compatibility

Works with Azure CLI 2.60+ and Bicep CLI 0.28+. The templates target the Azure Resource Manager API versions current as of 2024.

## Known Limitations

- This is a minimal skeleton — production deployments should add an App Service Plan, SQL Server/database, Application Insights, and network security groups.
- Storage account name uses a static prefix (`stgdev`) — multi-environment deployments with the same subscription require unique names.
- Key Vault access policies are not defined in this skeleton; add them per environment before use.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
