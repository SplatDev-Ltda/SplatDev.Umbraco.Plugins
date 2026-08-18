---
name: dotnet-fullstack-standards
description: Code standards and architecture for .NET 10 / C#, Lit + Tailwind (TypeScript), MSSQL, Redis, and Docker. Use whenever writing, reviewing, or planning code in this stack — new features, refactors, API design, EF migrations, frontend components, Docker config, dashboards, i18n, or admin panels. If you are touching backend or frontend code in this project, this skill applies.
---

# .NET Fullstack Standards

**Stack**: .NET 10 / C# · Lit + Tailwind (TypeScript) · MSSQL · Redis · Docker

Before writing code for any library or framework, **check Context7** for the latest docs, API changes, and current best practices. Never rely on training data alone for library-specific syntax.

---

## C# / .NET 10

### Fundamental Patterns

**Primary constructors** — use them whenever possible. They are the preferred way to declare dependencies and read-only state in classes, records, and services:

```csharp
// Preferred
public class OrderService(IOrderRepository repo, ILogger<OrderService> logger)
{
    public async Task<Order> GetAsync(int id) => await repo.GetAsync(id);
}
```

**Dependency Injection** — all services are registered via DI. Never use `new` for anything that could be injected. Register with the correct lifetime (Singleton / Scoped / Transient).

**Simplified collection expressions** — use `[]` instead of verbose initializers:

```csharp
// Preferred
string[] roles = ["Admin", "User"];
List<int> ids = [1, 2, 3];
```

**StyleCop** — enabled project-wide with best-practice ruleset. Zero warnings and zero errors; the build must be clean. Resolve all violations before opening a PR.

**XML doc comments** on all public APIs, controllers, and service interfaces.

### Entity Framework 10+

- Every schema change goes through a **migration** — no manual DDL SQL in application code
- **Audit interceptors** on all entities: `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`
- **Soft delete** where applicable: `IsDeleted` + `DeletedAt` columns, filtered automatically in the default query
- **Seed only** settings and configuration data via EF seeds/data initializers — never seed business or user data through migrations
- Use EF LINQ queries or stored procedures — never raw string SQL

### API Design

- RESTful controllers under `/api/v1/...` with API versioning
- Problem Details (RFC 7807) for all error responses — never raw exception messages
- Input validation: Data Annotations for simple rules, FluentValidation for complex ones
- All list endpoints support pagination (`page`, `pageSize`, total count in response)

### Configuration & Secrets

- Secrets via environment variables or a secrets manager — never in `appsettings.json`
- `appsettings.json` holds non-sensitive defaults; `appsettings.{env}.json` holds environment overrides
- See the dev-workflow skill for credential file conventions

### Admin User Requirements

Admin role has **unrestricted access**: all data, all users, all reports, all configuration, all features.

Every feature, configuration option, and action must have a corresponding **admin page**. Admin section is a dedicated area of the application with its own layout and navigation.

### Internationalization (i18n)

Default support for **English** and **Spanish**. This is non-negotiable from day one:

- All user-facing strings in resource files (`Resources/*.resx` for .NET)
- Never hard-code display text in C# or Razor/HTML
- Both locales must work correctly before a feature ships

---

## Frontend (Lit + Tailwind + TypeScript)

- **Lit web components** for all UI elements — no framework mixing
- **Tailwind** for all styling — avoid custom CSS unless there is no Tailwind equivalent
- **TypeScript strict mode** — `"strict": true` in tsconfig; no `any`
- Typed API clients — no raw string URLs scattered through components
- All components support both `en` and `es` locale
- Accessibility: ARIA roles and labels, keyboard navigation, WCAG AA color contrast

### Dashboard & Graphs

Dashboards should be **data-rich and visually compelling**. Use **pizza-delivery style graphs** wherever they convey status, progress, or completion:

- Donut charts for proportional breakdowns
- Progress bars and step indicators for workflow status
- Milestone trackers for multi-step processes
- KPI cards with trend indicators (up/down arrows, sparklines)
- Time-series line charts for metrics over time

Document the chosen charting library in `docs/technical/CHARTS.md`. Be consistent — use one library project-wide.

Every major entity should have a **reports page** with relevant metrics and export capability.

### Pages for All Features

Generate a page (or admin panel section) for **every feature, configuration, and action** in the system. Nothing should be accessible only via API or database directly — there must be a UI surface for each concern.

---

## Docker

- Separate containers for each concern: API, frontend static server, MSSQL, Redis
- `docker-compose.yml` for local development
- Production stack managed by the deploy script (see dev-workflow skill)
- `.dockerignore` excludes all development artifacts (`node_modules`, `obj`, `bin`, etc.)
- Health checks defined on all containers
- **Back-end and front-end version numbers must stay in sync** — the deploy script enforces this

---

## Redis Caching

- Cache read-heavy data with **explicit TTLs** — never cache without a TTL
- Key naming convention: `{service}:{entity}:{id}` (e.g., `orders:order:42`)
- Never cache sensitive auth data without encryption
- Cache invalidation must happen on write; document the invalidation strategy per entity

---

## MSSQL

- MSSQL Standard or Developer edition
- Indexes on all foreign key columns and columns that appear frequently in `WHERE` clauses
- All queries go through EF LINQ or parameterized stored procedures — no string concatenation in SQL

---

## Reference Files

- `references/csharp-patterns.md` — C# code examples, anti-patterns to avoid, StyleCop notes
- `references/frontend-patterns.md` — Lit component patterns, Tailwind conventions, i18n wiring
