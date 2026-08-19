# SplatDev.Umbraco.Plugins.Backups

A comprehensive backup plugin for Umbraco that lets you create, schedule, and restore backups directly from the backoffice. Supports multiple cloud storage providers.


<!-- screenshot:start -->

![Backups dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Backups/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Backups)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Backups)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Compatibility

| Umbraco Version | .NET Target | Package Version |
|---|---|---|
| Umbraco 13.x | net8.0 | 3.1.x |
| Umbraco 17.x | net10.0 | 3.1.x |

## Features

- Create full or partial backups from the Umbraco backoffice
- Schedule automatic backups via CRON expressions
- Restore from any stored backup
- **10+ cloud storage providers** out of the box:
  - Azure Blob Storage
  - Amazon S3
  - Dropbox
  - Google Drive
  - OneDrive
  - Box
  - Mega
  - Seafile
  - SFTP
  - Local file system
- Backup retention policies (keep N most recent backups)
- Email notifications on backup success/failure

## Installation

```bash
dotnet add package SplatDev.Umbraco.Plugins.Backups
```

Or via the Package Manager Console:

```powershell
Install-Package SplatDev.Umbraco.Plugins.Backups
```

## Quick Start

Add to your `Program.cs` (or `Startup.cs`):

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddBackups()  // Add this line
    .Build();
```

Then configure in `appsettings.json`:

```json
{
  "SplatDev": {
    "Backups": {
      "Enabled": true,
      "RetentionDays": 30,
      "CloudProviders": [
        {
          "ProviderType": "AzureBlob",
          "Enabled": true,
          "Settings": {
            "ConnectionString": "DefaultEndpointsProtocol=https;...",
            "ContainerName": "umbraco-backups"
          }
        }
      ]
    }
  }
}
```

## Configuration

### Azure Blob Storage

```json
{
  "ProviderType": "AzureBlob",
  "Enabled": true,
  "Settings": {
    "ConnectionString": "<your-connection-string>",
    "ContainerName": "umbraco-backups"
  }
}
```

### Amazon S3

```json
{
  "ProviderType": "S3",
  "Enabled": true,
  "Settings": {
    "AccessKey": "<access-key>",
    "SecretKey": "<secret-key>",
    "BucketName": "umbraco-backups",
    "Region": "us-east-1"
  }
}
```

### SFTP

```json
{
  "ProviderType": "SFTP",
  "Enabled": true,
  "Settings": {
    "Host": "sftp.example.com",
    "Port": "22",
    "Username": "backupuser",
    "Password": "<password>",
    "FolderPath": "/backups"
  }
}
```

### Dropbox

```json
{
  "ProviderType": "Dropbox",
  "Enabled": true,
  "Settings": {
    "AccessToken": "<access-token>",
    "FolderPath": "/Backups"
  }
}
```

### Mega

```json
{
  "ProviderType": "Mega",
  "Enabled": true,
  "Settings": {
    "Email": "your@email.com",
    "Password": "<password>",
    "FolderPath": "Backups"
  }
}
```

## Backoffice

After installation, navigate to **Settings → Backups** in the Umbraco backoffice to:

- Run backups on demand
- Configure scheduled backups
- View backup history
- Restore from a backup
- Test cloud provider connections

## License

MIT — see [LICENSE](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins/blob/master/LICENSE) for details.

## Contributing

Issues and PRs welcome at [github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins](https://github.com/SplatDev-Ltda/SplatDev.Umbraco.Plugins).