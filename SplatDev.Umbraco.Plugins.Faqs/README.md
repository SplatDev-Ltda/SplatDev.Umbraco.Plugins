# SplatDev.Umbraco.Plugins.Faqs

FAQ management plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).


<!-- screenshot:start -->

![Faqs property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Faqs/docs/screenshots/02-property-editor.png)

![Faqs data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Faqs/docs/screenshots/03-data-type.png)

![Faqs on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Faqs/docs/screenshots/04-front-end.png)

<!-- screenshot:end -->

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Faqs.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Faqs)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.4.2           |
| 17.x    | 10.0 | 2.4.2           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Faqs
```

## Features

- FAQ categories with slug and sort order
- FAQ items with question, answer, category, sort order and publish toggle
- Full-text search across questions and answers
- Accordion-style front-end view component using native HTML `<details>`/`<summary>`
- Backoffice dashboard (Umbraco 17: Lit 3 element; Umbraco 13: AngularJS)
- Overview tab with live accordion preview

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/umbraco/api/faqs/GetCategories?publishedOnly=` | List categories with items |
| GET | `/umbraco/api/faqs/GetCategory?slug=&publishedOnly=` | Get category by slug |
| GET | `/umbraco/api/faqs/GetItems?categoryId=&publishedOnly=` | List all FAQ items |
| GET | `/umbraco/api/faqs/GetItem?id=` | Get single FAQ item |
| GET | `/umbraco/api/faqs/Search?q=&publishedOnly=` | Search FAQs |
| POST | `/umbraco/api/faqs/CreateItem` | Create FAQ item |
| PUT | `/umbraco/api/faqs/UpdateItem` | Update FAQ item |
| DELETE | `/umbraco/api/faqs/DeleteItem?id=` | Delete FAQ item |
| POST | `/umbraco/api/faqs/PublishItem?id=&publish=` | Toggle publish state |
| POST | `/umbraco/api/faqs/CreateCategory` | Create category |
| DELETE | `/umbraco/api/faqs/DeleteCategory?categoryId=` | Delete category |

## Front-end View Component

```cshtml
@* All FAQs grouped by category: *@
@await Component.InvokeAsync("Faqs")

@* Specific category only: *@
@await Component.InvokeAsync("Faqs", new { categorySlug = "general" })

@* Or the category chosen on this page with the FAQ Category property editor: *@
@await Component.InvokeAsync("Faqs", new { categoryId = Model.Value<int>("faqCategory") })

@* Search results: *@
@await Component.InvokeAsync("Faqs", new { searchQuery = Request.Query["faqSearch"].ToString() })
```

## Database

Uses EF Core against Umbraco’s own database. Schema: `faqs`.

The tables are created for you the first time the site starts: the plugin runs its own
Umbraco migration against the database Umbraco is already using, on whichever provider
it is configured with — SQL Server or SQLite. There is nothing to scaffold and nothing
to run by hand.

## Building the client

```bash
cd client
npm install
npm run build
```

## Changelog

### 2.4.2 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.4.1 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.4.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

The view also still referenced the package's pre-rename namespace, so it would not have compiled even had it shipped. That is fixed, and the view is now built with the project — a broken view fails the build instead of failing a visitor's request.

### 2.3.0 — 2026-08-23
- A content editor can choose which FAQ category a page shows. The view component takes a numeric id, so until now putting a set of FAQs on a page meant knowing that id and writing it into a template by hand — there was no way to pick one.
- Creating a FAQ item through the API works. The endpoint took the entity, whose Category navigation property is not nullable, so validation rejected every request with "The Category field is required." — a caller was expected to send a whole category to attach an item to one. It now takes the category's id.
- Categories with items can be listed. The listing loads each category's items, every item carries a reference back to its category, and the serializer looped — so the endpoint would have failed as soon as a single FAQ existed. A category with no items serialised fine, which is why it went unnoticed.

### 2.2.3 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.
- README no longer tells you to scaffold EF Core migrations by hand — the plugin creates its own tables on first start, on SQL Server or SQLite.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)