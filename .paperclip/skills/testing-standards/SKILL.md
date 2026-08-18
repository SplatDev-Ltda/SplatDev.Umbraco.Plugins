---
name: testing-standards
description: Testing standards for .NET 10 (xUnit), Playwright E2E, and MSSQL projects. Use whenever writing unit tests, integration tests, E2E tests, or regression tests, setting up QA, generating test or demo data, or creating demo credentials. Invoke even if the user just says "write tests for X" or "add coverage" — these standards must be followed for all test work. Also applies when creating demo SQL scripts or seeding a test environment.
---

# Testing Standards

**Stack**: xUnit (.NET) · Playwright (TypeScript, E2E) · MSSQL

> **Which QA skill?** This one is the *stack mechanics* of writing tests in the
> .NET stack. For the platform-agnostic QA *standards* (test types, all-paths
> coverage, bug-issue format, perf thresholds) use **qa-standards**. To run a
> **manual click-through of a deployed app** in a browser (every role/workflow,
> UI-vs-DB cross-verification, artifact run-dir) use **project-click-test-qa**.

---

## Unit Tests

- Framework: **xUnit**
- Target: all service-layer and domain logic; aim for >80% line coverage on business logic
- No I/O in unit tests — mock all external dependencies (repositories, HTTP clients, etc.)
- Use `AutoFixture` or builder patterns to generate test data; avoid hand-crafting large objects

**Test naming**: `MethodName_Scenario_ExpectedResult`

```csharp
[Fact]
public async Task GetOrder_WhenOrderNotFound_ReturnsNull() { ... }
```

**Grouped assertions** — never scatter multiple `Assert.*` calls that would hide downstream failures. Group them:

```csharp
// Preferred
Assert.Multiple(
    () => Assert.Equal(expected.Id, result.Id),
    () => Assert.Equal(expected.Total, result.Total),
    () => Assert.Equal(expected.Status, result.Status)
);
```

**Traits** for categorization:

```csharp
[Trait("Category", "Unit")]
[Trait("Category", "Integration")]
[Trait("Category", "Regression")]
```

---

## Integration Tests

- Hit a **real MSSQL database** — no in-memory substitutes (EF InMemory, SQLite) for integration tests; mock/prod divergence causes production failures
- Use a dedicated test database, reset between test runs with the provided SQL scripts
- Test the full stack: HTTP request → controller → service → DB → response
- Use `WebApplicationFactory<T>` for API integration tests

---

## E2E Tests (Playwright)

- **Page Object Model (POM)** — every page/component gets a corresponding page object class
- Cover all major user flows (happy paths)
- Cover all critical admin flows
- Run against a seeded test environment (demo data loaded via `scripts/insert-demo-data.sql`)
- On failure: save screenshots and traces automatically (configure in `playwright.config.ts`)
- Runnable via: `npm run test:e2e`
- Tag browser-specific tests where coverage differs

---

## Regression Tests

- Every bug fix includes a regression test that would have caught the original bug
- Tag with `[Trait("Category", "Regression")]`
- Reference the bug document in the test's XML doc comment:
  ```csharp
  /// <summary>Regression for docs/bugs/BUG-042-order-total-overflow.md</summary>
  ```

---

## CI/CD Integration

- Unit and integration tests run on **every PR** — no red PRs merge
- E2E tests run on the deploy branch or on a schedule
- All suites must pass before merging

---

## Demo / Test Data

### Credentials Document

Generate `docs/credentials/DEMO_CREDENTIALS.md` using the template in the dev-workflow skill's `references/documentation-templates.md`. Include:

- Demo user accounts per role (username, password)
- Admin credentials
- Local database connection details
- Any API keys needed for testing

Never include real production credentials.

### SQL Data Scripts

Maintain two idempotent scripts in `scripts/`:

| Script | Purpose |
|--------|---------|
| `scripts/insert-demo-data.sql` | Inserts realistic demo/test data for demos and E2E tests |
| `scripts/remove-demo-data.sql` | Cleanly removes all demo data |

**Rules:**
- Scripts must be **idempotent** — safe to run multiple times without duplicating data
- Cover all major entities with realistic sample data
- Include at least one record per role and permission level
- Use clearly fake values (names, emails, etc.) that are obviously not real

### Seed Data (Migrations)

Only settings and configuration data are seeded through EF migrations. Business data, user accounts, and demo content are **not** seeded — they are inserted via the SQL scripts above.

---

## Reference Files

- `references/test-patterns.md` — xUnit patterns, Playwright setup, fixture examples
