# UmbracoCms.Plugins.Surveys

A full-featured survey builder plugin for Umbraco 13 and Umbraco 17.


<!-- screenshot:start -->

![Surveys dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Surveys/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Features

- Create surveys with multiple question types: Multiple Choice, Free Text, and Rating
- Publish/unpublish surveys with optional expiry dates
- Collect respondent email addresses (optional)
- View aggregated results per question and option
- U17 backoffice dashboard (Lit 3 web component)
- U13 backoffice dashboard (AngularJS)
- Razor view component for embedding surveys in Umbraco templates
- EF Core against Umbraco’s database (schema: `surveys`)

## Targets

| Framework | Umbraco | EF Core |
|-----------|---------|---------|
| net8.0    | 13.12.0 | 8.0.20  |
| net10.0   | 17.3.4  | 10.0.7  |

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/umbraco/api/surveys/getall` | List all surveys |
| GET    | `/umbraco/api/surveys/get?id={id}` | Get survey with questions |
| POST   | `/umbraco/api/surveys/create` | Create a new survey |
| PUT    | `/umbraco/api/surveys/update?id={id}` | Update a survey |
| DELETE | `/umbraco/api/surveys/delete?id={id}` | Delete a survey |
| POST   | `/umbraco/api/surveys/submit?surveyId={id}` | Submit a response |
| GET    | `/umbraco/api/surveys/results?surveyId={id}` | Get aggregated results |

## Usage in Templates

```cshtml
@await Component.InvokeAsync("Survey", new { surveyId = 1 })
```

## Building the Client

```bash
cd client
npm install
npm run build
```

The built file will be placed in `App_Plugins/Surveys/dist/`.

## Database Schema

Tables created in the `surveys` schema:
- `Surveys` - Survey definitions
- `SurveyQuestions` - Questions per survey
- `SurveyOptions` - Answer options for MultipleChoice/Rating questions
- `SurveyResponses` - Individual response submissions
- `SurveyAnswers` - Per-question answers within a response

Run EF Core migrations to create the tables:
The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

## Changelog

### 2.2.3 — 2026-08-21
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
