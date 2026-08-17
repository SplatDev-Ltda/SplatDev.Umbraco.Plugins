param location string = 'East US'
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'dev'

var rgName = 'rg-splatdev-${environment}'

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: rgName
  location: location
}

// Transport security only: network reachability remains unchanged until the
// environment's VNet/private-endpoint design is approved.
resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'stgdev${environment}sa'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    allowCrossTenantReplication: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'kv-splatdev-${environment}'
  location: location
  properties: {
    enableSoftDelete: true
    enablePurgeProtection: true
    sku: {
      name: 'standard'
      family: 'A'
    }
    tenantId: subscription().tenantId
    accessPolicies: []
  }
}

// Service Bus (messaging backbone)
resource serviceBus 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
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

resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: 'web-splatdev-${environment}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      alwaysOn: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
    }
  }
}

output storageAccountName string = storage.name
output keyVaultName string = keyVault.name
output serviceBusNamespace string = serviceBus.name
output webAppName string = webApp.name
