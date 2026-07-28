# Infrastructure as Code — Azure Bicep Templates

Azure Bicep templates for provisioning Umbraco hosting infrastructure on Microsoft Azure. Covers resource groups, storage accounts, and Key Vault across dev/staging/prod environments.

## What's Included

- **Resource Group** — scoped per environment (`dev`, `staging`, `prod`)
- **Storage Account** — Standard_LRS, v2, for Umbraco media and log storage
- **Key Vault** — secrets/keys management with soft-delete enabled
- **Environment parameterisation** — single `environment` param drives naming and SKU selection

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
