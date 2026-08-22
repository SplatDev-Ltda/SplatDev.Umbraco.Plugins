# SplatDev.Directory

Directory service abstraction for Umbraco plugins. Defines one contract —
`IDirectoryProvider` — that Active Directory, a generic LDAP server and Entra ID all
answer, so a plugin can look people up without knowing which of them a site runs.

## Compatibility

| Umbraco | Target |
| ------- | ------ |
| 13      | net8.0 |
| 17      | net10.0 |

## Installation

Install this package and at least one provider:

```bash
dotnet add package SplatDev.Directory
dotnet add package SplatDev.Directory.Ldap      # Active Directory or generic LDAP
dotnet add package SplatDev.Directory.EntraId   # Entra ID via Microsoft Graph
```

```csharp
builder.Services.AddSplatDirectory(builder.Configuration);
builder.Services.AddSplatLdapDirectory();
builder.Services.AddSplatEntraDirectory();
```

Both providers can be registered at once. Each reports itself unconfigured until a site
supplies its settings, and `IDirectoryProviderResolver` picks whichever is usable.

## Configuration

```json
{
  "Directory": {
    "Enabled": true,
    "DefaultProvider": "Active Directory",
    "AllowUserCreation": false,
    "CreateUsersInOrganizationalUnit": "OU=Staff,DC=example,DC=com",
    "Ldap": {
      "Host": "dc01.example.com",
      "Port": 636,
      "UseSsl": true,
      "BaseDn": "DC=example,DC=com",
      "BindDn": "CN=umbraco-reader,OU=Service,DC=example,DC=com",
      "Domain": "EXAMPLE",
      "UseActiveDirectorySchema": true
    },
    "Entra": {
      "TenantId": "...",
      "ClientId": "...",
      "UserPrincipalNameDomain": "example.onmicrosoft.com"
    }
  }
}
```

**Secrets do not belong in `appsettings.json`.** `Ldap:BindPassword` and
`Entra:ClientSecret` should come from environment variables, user secrets or a key
vault.

## Creating accounts

Reading a directory and writing to one are separate concerns, and this treats them that
way:

- Reading needs a bind account with no special rights (`User.Read.All` on Entra).
- Creating needs `AllowUserCreation`, a container named in
  `CreateUsersInOrganizationalUnit`, and write rights (`User.ReadWrite.All` on Entra).

Creation is **off unless a site turns it on**, and is confined to that one container — a
request naming anywhere else is refused rather than redirected. Ask
`IDirectoryProvider.CanCreateUsers` before offering a create control; it tells you
whether the operation will be permitted before anyone tries it.

No password is ever handled here. Accounts are created requiring one to be set by an
administrator, because a password typed into a CMS form travels through the browser and
the request log on its way to the directory.

## Changelog

### 1.0.0 — 2026-08-22
- First release. `IDirectoryProvider` with search, single lookup, account creation and a
  connection test, plus `IDirectoryProviderResolver` for sites that register more than
  one directory.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
