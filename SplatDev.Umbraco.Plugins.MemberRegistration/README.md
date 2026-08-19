# UmbracoCms.Plugins.MemberRegistration

Member registration plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![MemberRegistration dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.MemberRegistration/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Features

- Registration form with name, email, username, password
- Email verification via token stored in SQL (schema: `memberreg`)
- Admin approval workflow for new members
- Pending member listing and bulk approval

## Database

Uses EF Core with a dedicated schema `memberreg`. Table: `RegistrationTokens`.

Run migrations or use EF Core tooling to create the schema:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/umbraco/api/memberregistration/Register` | Register a new member |
| POST | `/umbraco/api/memberregistration/VerifyEmail` | Verify email with token |
| POST | `/umbraco/api/memberregistration/Approve?memberId=X` | Approve a pending member |
| GET | `/umbraco/api/memberregistration/GetPending` | List unapproved members |

## View Component

```cshtml
@await Component.InvokeAsync("MemberRegistration", new { redirectUrl = "/welcome" })
```