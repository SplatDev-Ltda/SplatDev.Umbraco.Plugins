# UmbracoCms.Plugins.MostViewed

Most-viewed content tracking plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![MostViewed dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.MostViewed/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

## Features
- Automatic page view recording via ASP.NET Core middleware
- Tracks content key, node name, URL, viewer IP, and timestamp
- Most-viewed content API with configurable count and date range
- View component for front-end rendering
- Umbraco backoffice dashboard (Angular for U13, Lit 3 for U17)

## Quick Start

### 1. Register the plugin
The `MostViewedComposer` is auto-discovered. It registers the DbContext, service, and middleware.

### 2. Run EF Core migrations
```bash
dotnet ef migrations add InitialCreate --context MostViewedDbContext
dotnet ef database update --context MostViewedDbContext
```

### 3. Use the view component in a Razor template
```cshtml
@* Show 5 most-viewed pages from the last 30 days *@
@await Component.InvokeAsync("MostViewed", new { count = 5, days = 30 })
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/umbraco/api/mostviewed/GetMostViewed?count=10&days=30` | Get most-viewed pages |
| GET | `/umbraco/api/mostviewed/GetViewCount?contentKey={guid}` | Get total views for a node |

## Build the backoffice client (U17)
```bash
cd client
npm install
npm run build
```