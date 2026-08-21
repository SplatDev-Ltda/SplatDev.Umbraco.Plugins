# UmbracoCms.Plugins.MemberGroups

Member group management plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![MemberGroups dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.MemberGroups/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

Upgraded from Umbraco 8 (net472) to modern SDK-style multi-targeting.

## Upgrade Summary (Umbraco 8 → 13/17)

| Old | New |
|-----|-----|
| `Umbraco.Core.Services.*` | `Umbraco.Cms.Core.Services.*` |
| `Umbraco.Core.Models.*` | `Umbraco.Cms.Core.Models.*` |
| `Umbraco.Web.Composing.Current.Services.*` | DI constructor injection |
| `Umbraco.Core.Logging.ILogger` | `Microsoft.Extensions.Logging.ILogger<T>` |
| `SplatDev.Html.Helpers.Sanitize()` | Inline `Regex.Replace` extension |
| `System.Web.Security.Membership` | Removed (use Umbraco services) |
| `UsersMembershipProvider` | Removed (use Umbraco Users API) |
| `IUmbracoDatabase` | Removed (no DB needed) |
| `MembershipHelper` | Removed (use `IMemberService`) |

## Features

- Assign/remove members from groups
- Create and edit user groups
- Enable/disable Umbraco users
- Look up members by email
- List member groups and member types
- Bulk operations via API

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/membergroups/GetMemberGroups` | List all member groups |
| GET | `/umbraco/api/membergroups/GetMemberTypes` | List all member types |
| POST | `/umbraco/api/membergroups/AddToGroup` | Add member to a group |
| POST | `/umbraco/api/membergroups/CreateGroup` | Create a new user group |
| POST | `/umbraco/api/membergroups/EditGroup?oldName=X` | Edit an existing group |
| POST | `/umbraco/api/membergroups/EnableUser?username=X` | Enable a user |
| POST | `/umbraco/api/membergroups/DisableUser?username=X` | Disable a user |
| GET | `/umbraco/api/membergroups/GetMemberByEmail?email=X` | Lookup member by email |
| POST | `/umbraco/api/membergroups/SaveMemberGroup?groupName=X` | Save a member group |

## Note on Password Management

In Umbraco 13+, direct password hash assignment (`RawPasswordValue`) is not available.
Password operations must use the Umbraco Users API or `IMemberService.SavePassword()`.
The `ChangeUserPassword` and `ResetUserPassword` methods log a warning and return guidance.

## Changelog

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
