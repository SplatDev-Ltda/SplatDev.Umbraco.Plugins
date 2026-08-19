# UmbracoCms.Plugins.QuickPoll

A lightweight quick poll plugin for Umbraco 13 and Umbraco 17.


<!-- screenshot:start -->

![QuickPoll dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.QuickPoll/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Features

- Create single-question polls with multiple options
- Active/inactive poll management with optional expiry
- One vote per IP address (enforced at DB level)
- Real-time vote counts and percentage results
- Results displayed as visual percentage bars in the view component
- U17 backoffice dashboard (Lit 3 web component)
- U13 backoffice dashboard (AngularJS)
- Razor view component for embedding polls in Umbraco templates
- EF Core with SQL Server (schema: `quickpoll`)

## Targets

| Framework | Umbraco | EF Core |
|-----------|---------|---------|
| net8.0    | 13.12.0 | 8.0.20  |
| net10.0   | 17.3.4  | 10.0.7  |

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/umbraco/api/quickpoll/getactive` | Get the current active poll |
| GET    | `/umbraco/api/quickpoll/getall` | List all polls |
| GET    | `/umbraco/api/quickpoll/get?id={id}` | Get a specific poll |
| POST   | `/umbraco/api/quickpoll/create` | Create a new poll |
| DELETE | `/umbraco/api/quickpoll/delete?id={id}` | Delete a poll |
| POST   | `/umbraco/api/quickpoll/vote` | Cast a vote |
| GET    | `/umbraco/api/quickpoll/results?pollId={id}` | Get poll results |

## Usage in Templates

```cshtml
@* Show active poll *@
@await Component.InvokeAsync("QuickPoll")

@* Show specific poll *@
@await Component.InvokeAsync("QuickPoll", new { pollId = 1 })
```

## Building the Client

```bash
cd client
npm install
npm run build
```

## Database Schema

Tables in the `quickpoll` schema:
- `Polls` - Poll definitions
- `PollOptions` - Answer options with vote counts
- `PollVotes` - Individual vote records (unique index on PollId + VoterIp)