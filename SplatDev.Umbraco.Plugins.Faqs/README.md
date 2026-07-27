# SplatDev.Umbraco.Plugins.Faqs

FAQ management plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Faqs.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Faqs)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.1           |
| 17.x    | 10.0 | 2.0.1           |

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

@* Search results: *@
@await Component.InvokeAsync("Faqs", new { searchQuery = Request.Query["faqSearch"].ToString() })
```

## Database

Uses EF Core with SQL Server. Schema: `faqs`. Run migrations:

```bash
dotnet ef migrations add InitialFaqs --project UmbracoCms.Plugins.Faqs
dotnet ef database update --project UmbracoCms.Plugins.Faqs
```

## Building the client

```bash
cd client
npm install
npm run build
```

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
