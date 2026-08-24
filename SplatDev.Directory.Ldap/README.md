# SplatDev.Directory.Ldap

<!-- screenshot:start -->
<!-- screenshot:end -->

Active Directory and generic LDAP provider for [`SplatDev.Directory`](https://www.nuget.org/packages/SplatDev.Directory).

Active Directory is an LDAP server with its own attribute names, so one provider serves
both: `Directory:Ldap:UseActiveDirectorySchema` switches between AD's attributes
(`sAMAccountName`, `userPrincipalName`, `userAccountControl`) and the vendor-neutral ones
(`uid`, `mail`, `inetOrgPerson`).

Built on `System.DirectoryServices.Protocols`, not `AccountManagement`, so it runs on
Linux as well as Windows — an Umbraco site that needs to look a user up is often not
running on a domain-joined Windows box.

## Compatibility

| Umbraco | Target |
| ------- | ------ |
| 13      | net8.0 |
| 17      | net10.0 |

## Installation

```bash
dotnet add package SplatDev.Directory.Ldap
```

```csharp
builder.Services.AddSplatDirectory(builder.Configuration);
builder.Services.AddSplatLdapDirectory();
```

See [`SplatDev.Directory`](https://www.nuget.org/packages/SplatDev.Directory) for the
configuration block.

## Known Limitations

- **Accounts are created disabled.** Active Directory will not enable an account with no
  password, and this deliberately never handles one. Set the password in the directory
  to enable the account.
- Search terms are escaped per RFC 4515, so a term containing `*` or `(` is matched
  rather than changing the shape of the filter.

## Changelog

### 1.0.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 1.0.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 1.0.0 — 2026-08-22
- First release. Search, single lookup, account creation into one configured container,
  and a connection test, against Active Directory or any LDAP v3 server.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
