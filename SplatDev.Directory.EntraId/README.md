# SplatDev.Directory.EntraId

Entra ID provider for [`SplatDev.Directory`](https://www.nuget.org/packages/SplatDev.Directory), over Microsoft Graph.

Talks to Graph over HTTP with a token from MSAL rather than taking the Graph SDK as a
dependency — three endpoints are needed, and the SDK is a large thing to carry into every
site for that.

## Compatibility

| Umbraco | Target |
| ------- | ------ |
| 13      | net8.0 |
| 17      | net10.0 |

## Installation

```bash
dotnet add package SplatDev.Directory.EntraId
```

```csharp
builder.Services.AddSplatDirectory(builder.Configuration);
builder.Services.AddSplatEntraDirectory();
```

## Permissions

| Operation | Application permission |
| --------- | ---------------------- |
| Search and read | `User.Read.All` |
| Create accounts | `User.ReadWrite.All` |

Grant `User.ReadWrite.All` only if the site is actually meant to create accounts.
`Directory:AllowUserCreation` must also be on, and
`Directory:Entra:UserPrincipalNameDomain` must name a verified domain — a UPN has to
belong to one.

## Known Limitations

- **A password is never returned.** Graph will not create a user without one, so a strong
  random password is generated, used once and discarded; the account is created requiring
  a change at first sign-in. Issue a reset in Entra before the account is used.
- Search uses Graph's `$search` with `ConsistencyLevel: eventual`.

## Changelog

### 1.0.0 — 2026-08-22
- First release. Search, single lookup, account creation and a connection test against
  Entra ID.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
