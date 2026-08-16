param location string = 'East US'
param environment string = 'dev' // dev, staging, prod

var rgName = 'rg-splatdev-${environment}'

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: rgName
  location: location
}

// Minimal skeleton resources to illustrate an Azure deployment structure
// Storage
resource storage 'Microsoft.Storage/storageAccounts@2021-04-01' = {
  name: 'stgdev${environment}sa'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {}
}

// Key Vault (secrets/keys management)
resource keyVault 'Microsoft.KeyVault/vaults@2021-10-01' = {
  name: 'kv-splatdev-${environment}'
  location: location
  properties: {
    enableSoftDelete: true
    sku: {
      name: 'standard'
      family: 'A'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
  }
}

// Service Bus (messaging backbone)
resource serviceBus 'Microsoft.ServiceBus/namespaces@2021-06-01' = {
  name: 'sb-splatdev-${environment}'
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {}
}

// App Service Plan and Web App (minimal skeleton)
resource appServicePlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: 'asp-splatdev-${environment}'
  location: location
  sku: { name: 'P1v2', tier: 'PremiumV2' }
  properties: {
    perSiteScaling: false
  }
}

resource webApp 'Microsoft.Web/sites@2021-02-01' = {
  name: 'web-splatdev-${environment}'
  location: location
  // Enable a system-assigned identity for passwordless Azure resource access.
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    // Enforce HTTPS for all HTTP requests to the App Service.
    httpsOnly: true
    siteConfig: {
      alwaysOn: true
    }
  }
}

output storageAccountName string = storage.name
output keyVaultName string = keyVault.name
output serviceBusNamespace string = serviceBus.name
output webAppName string = webApp.name
