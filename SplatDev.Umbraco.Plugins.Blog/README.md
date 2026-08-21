# SplatDev.Umbraco.Plugins.Blog

Blog engine plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![Blog dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Blog/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Blog.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Blog)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.1           |
| 17.x    | 10.0 | 2.0.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Blog
```

## Features

- Blog posts with title, slug, content, excerpt, author, category, tags and view counter
- Categories and tags with slug-based routing
- Archive browsing by year/month
- Comment system with moderation (approve/delete)
- RSS feed at `/umbraco/api/blog/rss`
- Backoffice dashboard (Umbraco 17: Lit 3 element; Umbraco 13: AngularJS)
- ASP.NET Core View Component for front-end rendering

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/umbraco/api/blog/GetPosts` | List posts (paged) |
| GET | `/umbraco/api/blog/GetPost?slug=` | Get single post by slug |
| GET | `/umbraco/api/blog/GetCategories` | List all categories |
| GET | `/umbraco/api/blog/GetTags` | List all tags |
| GET | `/umbraco/api/blog/GetPostsByCategory?categorySlug=` | Posts by category |
| GET | `/umbraco/api/blog/GetPostsByTag?tagSlug=` | Posts by tag |
| GET | `/umbraco/api/blog/GetArchive?year=&month=` | Archive posts |
| GET | `/umbraco/api/blog/GetComments?postId=` | Approved comments |
| POST | `/umbraco/api/blog/AddComment` | Submit comment |
| POST | `/umbraco/api/blog/ApproveComment?commentId=` | Approve comment |
| DELETE | `/umbraco/api/blog/DeleteComment?commentId=` | Delete comment |
| GET | `/umbraco/api/blog/rss` | RSS feed |

## Database

Uses EF Core with SQL Server. Schema: `blog`. Run migrations to create tables:

```bash
dotnet ef migrations add InitialBlog --project UmbracoCms.Plugins.Blog
dotnet ef database update --project UmbracoCms.Plugins.Blog
```

## Front-end View Component

```cshtml
@await Component.InvokeAsync("Blog", new { page = 1, pageSize = 5 })
```

## Building the client

```bash
cd client
npm install
npm run build
```

## Changelog

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)