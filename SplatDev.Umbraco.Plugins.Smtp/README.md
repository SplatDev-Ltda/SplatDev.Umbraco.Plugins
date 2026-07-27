# Smtp

SMTP email configuration UI for Umbraco backoffice — configure, test, and manage SMTP email settings directly from the backoffice dashboard.

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Smtp.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Smtp)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Smtp
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddSmtp()   // <-- add this
    .Build();
```

## Configuration

Add to `appsettings.json`:

```json
{
  "Smtp": {
    "Host": "smtp.example.com",
    "Port": 587,
    "Username": "your-smtp-username",
    "Password": "your-smtp-password",
    "EnableSsl": true,
    "FromAddress": "noreply@example.com"
  }
}
```

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `Host` | string | (required) | SMTP server hostname |
| `Port` | int | 587 | SMTP server port |
| `Username` | string | (optional) | SMTP authentication username |
| `Password` | string | (optional) | SMTP authentication password |
| `EnableSsl` | bool | true | Use TLS/SSL |
| `FromAddress` | string | (required) | Default sender email address |

## Usage

After registration, the Smtp dashboard appears in the Umbraco backoffice. Navigate to the dashboard to:
- View and edit SMTP configuration
- Send a test email to verify settings
- Update SMTP credentials without restarting the application

## Known Limitations

- SMTP credentials are stored in `appsettings.json` — consider using User Secrets or Azure Key Vault in production
- Single SMTP server configuration only — no support for multiple providers or per-domain SMTP settings
- No built-in email queue or retry mechanism; email delivery depends on the configured SMTP server

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
