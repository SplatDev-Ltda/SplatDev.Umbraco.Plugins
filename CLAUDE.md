# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`SplatDev.Umbraco.Core` — a monorepo (~153 `.csproj`) of Umbraco plugins, themes, tools and standalone .NET libraries published as NuGet packages by SplatDev Ltda. Remote is `splatdevtech/SplatDev.Umbraco.Plugins`.

Everything multi-targets **`net8.0;net10.0`** in a single project: `net8.0` → Umbraco 13 (AngularJS backoffice), `net10.0` → Umbraco 17 (Lit 3 / web-components backoffice). There is no per-version project split — one `.csproj` with two conditional `<ItemGroup>`s pinning `Umbraco.Cms.*` 13.12.0 vs 17.3.4, and ~46 `.cs` files use `#if NET10_0_OR_GREATER` to fork the API surface. Umbraco 13 and 17 differ substantially (e.g. `Umbraco.Cms.Web.BackOffice` only exists on net8.0; `Umbraco.Cms.Api.Management` only on net10.0), so **any change to a backoffice controller, composer or migration must be checked against both targets.**

## Commands

```bash
# Restore / build / test the whole solution
dotnet restore SplatDev.Core.sln
dotnet build   SplatDev.Core.sln -c Release
dotnet test    SplatDev.Core.sln -c Release --filter "Category!=Integration&Category!=InDevelopment"

# One project, one target framework (fastest inner loop)
dotnet build SplatDev.Umbraco.Plugins.CacheManager/SplatDev.Umbraco.Plugins.CacheManager.csproj -c Release -f net10.0

# One test project / one test
dotnet test SplatDev.Umbraco.Plugins.Tests/SplatDev.Umbraco.Plugins.Tests.csproj -f net10.0
dotnet test SplatDev.Tests/SplatDev.Tests.csproj --filter "FullyQualifiedName~CacheTests.WarmsUrls"
```

xUnit + Moq. Two `Trait("Category", …)` values gate CI: `Integration` (hits live third-party APIs) and `InDevelopment` (theme assemblies still churning). CI excludes both — mirror that filter locally or you will hit live payment/SMS endpoints.

### Frontend (Umbraco 17 backoffice only)

Lit 3 + TypeScript, built with Vite in library mode. Each plugin owns a `client/` folder that emits into `App_Plugins/<Name>/dist/`, and the built JS is committed (the `.csproj` ships `App_Plugins/**` as content, it does not run npm).

```bash
cd SplatDev.Umbraco.Plugins.<Name>/client
npm install --include=dev
npx vite build          # or: npm run dev  (vite build --watch)
```

`./build-all-plugins.sh` builds every plugin's client at once. Note it hardcodes `BASE=/mnt/e/Source/Repos/Umbraco Projects` and symlinks `node_modules` from CacheManager to save disk.

For Umbraco 13, the same plugin keeps a legacy AngularJS bundle under a second `App_Plugins/<LegacyName>/` folder (`package.manifest` + `controller.js` + `view.html`); Umbraco 17 uses `umbraco-package.json`. Both folders ship in the same NuGet package.

### Docker E2E

```bash
docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
SKIP_U13=1 docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

Spins up Umbraco 13 (`:5001`) and Umbraco 17 (`:5000`) baselines plus a Playwright runner on a shared network; screenshots land in `docker/test/output/screenshots/{u13,u17}/`. Baseline sites live in `test-environments/Umbraco13.Baseline` and `test-environments/Umbraco17.Baseline` and can be run directly with `dotnet run` for manual plugin testing.

## Conventions that bite

**Naming (`ARCHITECTURE.md`).** `SplatDev.` prefix is mandatory. Folder name = `.csproj` filename = `<PackageId>` = `<AssemblyName>` = root namespace, all identical. Plugins are `SplatDev.Umbraco.Plugins.<Name>`, with `.<Category>.<Name>` when nested (`…Plugins.Payments.BancoInter`). Cross-cutting Umbraco concerns are `SplatDev.Umbraco.<Concern>.<Name>`; non-Umbraco libraries are `SplatDev.<Name>`; tests append `.Tests`. Legacy `UmbracoCms.*` / bare `Umbraco.Plugins.*` package IDs still exist in the wild and are considered non-conforming.

**`App_Plugins/<folder>` names are runtime paths, not project names.** They drop the `SplatDev.Umbraco.Plugins.` prefix (`App_Plugins/CacheManager/`). Renaming one requires updating `umbraco-package.json`, the Vite `outDir`/`base`, and the `<Content Include>` glob together.

**CI skips some plugins.** Both `build.yml` and `publish.yml` iterate `find -maxdepth 3 -name "SplatDev.Umbraco.Plugins.*.csproj"` and `grep -v` out `Tests|BackupManager|FormsClone|CodeFirst|PdfCurator`. If you add a plugin that must ship, confirm it survives that filter; if you exclude one, edit both workflows.

**Not every project is in `SplatDev.Core.sln`.** Getnet, Santander and Schema2Yaml build only via their own `.csproj`, which is why CI builds per-project without `--no-restore`. `SplatDev.Publishable.slnf` is the publishable subset; `SplatDev.Core.slnx` is the newer solution format kept alongside the `.sln`.

**Private feed.** `nuget.config` maps `PdfCurator.*` to `https://nuget.pkg.github.com/splatdevtech/` and reads `%GITHUB_ACTOR%` / `%GITHUB_TOKEN%` from the environment. Restore of PdfCurator fails without those set.

**Versioning/publish.** `<Version>` is per-`.csproj` (no central version). Pushing a `v*` tag runs `publish.yml`, which packs each publishable plugin and pushes to NuGet.org (skipping versions that already exist) and GitHub Packages. `Directory.Build.props` supplies Authors/Company/Copyright/license only — keep it that way. It used to declare `MailKit`/`MimeKit` repo-wide, which made every package depend on an email stack it never used and silently overrode Mailer's own pinned version; add package references to the project that needs them.

**Shipping `App_Plugins` takes three things, and two of them are easy to miss.** Every plugin embeds `App_Plugins/**` as `EmbeddedResource` and carries a generated `Composers/EmbeddedAppPluginsComposer.cs` that does all of this. Change one, change all 69 — they are generated from one template.

1. *Embed the files* — `EmbeddedResource` + `GenerateEmbeddedFilesManifest`. (Copying content into the consuming site via `buildTransitive` also works and is what the site at splatdev.com still relies on, but it puts loose files in someone else's repo and silently no-ops if the target is missing.)
2. *Serve them* — add a `ManifestEmbeddedFileProvider` to `StaticFileOptions`. **Compose, never assign.** A null `FileProvider` does not mean "nothing is serving files", it means the middleware falls back to the web root; assigning into it unmounts `wwwroot` for the entire site and 404s every asset including the whole backoffice. Compose against `env.WebRootFileProvider`. Pass no `root` — the manifest already mirrors the project layout, and `root: "App_Plugins"` resolves to `App_Plugins/App_Plugins/…`.
3. *Register the manifest* — **serving the file is not enough.** Umbraco discovers extensions by enumerating *physical* directories under `App_Plugins`, so an embedded-only plugin is invisible however happily `umbraco-package.json` answers over HTTP: no section, no error, nothing. Each plugin registers an `IPackageManifestReader` (net10.0 only) that reads its embedded manifest directly.

Verify with the manifest endpoint, not a file fetch: `GET /umbraco/management/api/v1/manifest/manifest/private` must list the plugin with a non-zero extension count. A 200 on `umbraco-package.json` proves only that step 2 works.

**A custom backoffice section is not granted automatically.** Registering a `section` extension in `umbraco-package.json` makes it *available*, not *visible* — Umbraco only shows it once the alias is added to a user group's allowed sections. A freshly installed plugin therefore looks like it did nothing, even to an administrator.

## Branching

Per `README.md` and `Instructions.md`: `u13` (Umbraco 13 / net8.0) and `u17` (Umbraco 17 / net10.0) are the major branches; feature work goes on `feature/SPL-XXXX-description` or `fix/SPL-XXXX-description` branched from the relevant major branch, one PR per feature, never a direct commit to `u13`/`u17`/`master`. Cross-cutting changes (shared libs, infra, CI) get one PR per major branch. Archived work lives under `archive/`.

Reality check: CI only triggers on `master`/`main`, `origin/HEAD` is `master`, and recent history is squash-merged PRs onto `master`. Confirm the intended target branch before opening a PR rather than assuming.

## Architecture notes

Plugin internals follow a consistent shape — `Composers/` (`IComposer` registering services), `Controllers/` (backoffice API, forked by target framework), `Services/` + `Repositories/`, `Models/`, `Migrations/` (Umbraco `MigrationBase`), `Components/` (`INotificationHandler` / background services), `Extensions/` (DI + helper extension methods).

Provider-style subsystems are abstraction-first: `SplatDev.Messaging` / `SplatDev.Payments` / `SplatDev.Search` / `SplatDev.Cache` define the contracts, and sibling packages (`.SendGrid`, `.Twilio`, `.Stripe`, `.MercadoPago`, `.Elastic`, `.Redis`, …) implement them. Add a new provider as a new sibling project against the existing abstraction rather than extending the core package.

`ARCHITECTURE.md` records the Azure-first PaaS stance (App Service, Azure SQL, Redis, Service Bus/Event Grid, Key Vault + managed identity, App Insights, Bicep IaC under `infra/`) and the decision to standardize API versioning through `SplatDev.Api.Common.ApiVersioning` (`AddSplatApiVersioning`).

`customers/` holds per-client integration code (e.g. `findlay-auto`) that is not published to NuGet.
