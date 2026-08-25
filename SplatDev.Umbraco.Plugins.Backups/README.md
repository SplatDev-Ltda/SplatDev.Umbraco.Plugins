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
| Umbraco 13.x | net8.0 | 3.3.4 |
| Umbraco 17.x | net10.0 | 3.3.4 |

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

No registration call is needed. The package ships Umbraco composers, so the
`AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the
package is referenced.

Configure it in `appsettings.json`:

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

## Changelog

### 3.3.4 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call `.AddBackups()`, which does not exist; following it produced a compile error. The plugin registers itself through its Umbraco composer and needs no call at all.

### 3.3.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 3.3.2 — 2026-08-22
- Encrypting a backup no longer leaves the unencrypted copy next to it. The engine wrote the archive but kept the plain `.json` it had wrapped, so the content the key was meant to protect sat in the same folder in the clear.
- Compressing or encrypting also no longer leaves that `.json` behind as dead weight, which had doubled the disk every backup cost.
- One backup now lists as one row. The list enumerated files rather than backups, so a compressed or encrypted backup appeared twice under the same name with two different sizes.
- Deleting a backup removes every file belonging to it. It removed only the first match, so a backup with a leftover file stayed in the list and appeared to survive being deleted.

### 3.3.1 — 2026-08-21
- The dashboard can now take a backup. It previously made no requests at all — it showed a hardcoded "Active" badge and a Save button that set a flag for three seconds and wrote nothing — while the API underneath supported all of this the whole time.
- Choose what to include (content, media, database), whether to compress, whether to encrypt and with which key, which cloud providers to copy to, and whether to keep a local copy.
- Restore from any listed backup, choosing scope, whether to overwrite existing items, and supplying the decryption key when the archive is encrypted.
- Delete backups, and test a cloud provider's credentials before relying on it.
- Four endpoints moved: CreateAdvanced, Restore, GetCloudProviders and TestProvider had action-level route templates that appended to the controller prefix, so they lived at URLs like /umbraco/api/backups/GetCloudProviders/providers. They now sit at /umbraco/api/backups/<Action> with the rest. No shipped UI called them, so nothing that worked before stops working.
