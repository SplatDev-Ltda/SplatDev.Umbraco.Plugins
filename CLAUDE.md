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

**A publishable plugin must be in `SplatDev.Core.sln`, or it is silently dropped from every release.** `publish.yml` restores the solution *once* and then builds each plugin with `--no-restore`, so a project outside the solution has no assets file, fails instantly, and is skipped with a `::warning::` that nothing surfaces. Getnet and Santander sat outside it and went unpublished for an unknown number of tags — Santander's API-key hardening was stuck at 1.1.6 on NuGet while the repo said 1.3.0. Both are now in the solution. `tools/check-solution-membership.sh` guards this and must search at the same depth `publish.yml` discovers at — it used `-maxdepth 2` against the publisher's `-maxdepth 3`, so nested plugins under `SplatDev.Umbraco.Plugins.Yaml/` were invisible to the guard while still being built, and Schema2Yaml was dropped from v2.1.5 exactly that way. (This paragraph used to say CI builds per-project *without* `--no-restore`, which stopped being true and is exactly how the gap survived.) `SplatDev.Publishable.slnf` is the publishable subset; `SplatDev.Core.slnx` is the newer solution format kept alongside the `.sln`.

**Only one version of each package should be listed, and it is not the highest one.**
`.github/workflows/unlist-old-versions.yml` keeps the version this repo ships and unlists
the rest, taking the keeper from each project's `<Version>` rather than by sorting the
published list — because for three ids the highest published version is the Umbraco 8
build (`Backups` 8.18.7.2 over 3.3.2, `CopyValue` 8.18.8.1 over 2.4.0, `DefaultValue`
8.18.7.1 over 2.3.0). A "keep the latest" rule would unlist the current release and keep
the Umbraco 8 one, which is the failure that made a published security fix unreachable in
the first place. `tools/plan-unlist.py` builds the plan, refuses to plan anything for a
package whose shipped version is not on NuGet yet (unlisting the rest would leave it with
nothing listed), and the workflow re-checks every entry against `<Version>` before acting.

**Publish before unlisting, or the plan collapses.** That same guard means a release which
bumps a lot of packages leaves their new versions unpublished, so the planner skips them:
immediately after the v2.8.0 metadata bumps the plan fell from ~777 entries to 44, with 135
packages skipped. Tag and publish first, then unlist. The run is batched — `batch_size`,
`delay_seconds`, `batch_pause_seconds` — and reports a `start_at` offset so a partial run
resumes rather than restarting.

**NuGet rate-limits a long unlist run, and a discarded stderr hides it.** The first full
run unlisted 571 versions and recorded 323 failures — roughly 250 consecutive successes and
then failures interleaving, across 51 unrelated packages, which is throttling rather than
anything wrong with those packages. No shipped version was lost, because the guard held.
Two things made it worse than it needed to be: the step sent `dotnet nuget delete` output to
`/dev/null`, so the reason for every failure was unrecoverable, and there was no retry, so a
transient throttle was recorded as permanent. Both are fixed — four attempts with quadratic
backoff, 403 breaking out immediately since a permission problem never succeeds, and the
failure line now carries the message.

The second run pinned the shape down: 240 unlisted with **zero** failures, then 130
consecutive failures and nothing after. Same cliff as run 1, which managed roughly 250.
It is a ceiling of about 240 operations per key per run, not random loss, so a plan larger
than that cannot finish however gently it is paced — cap the run (`max_entries`, default
200) and resume with `start_at`.

The retry added after run 1 fired exactly **once** across those 130 failures. NuGet answers
403 for a throttled key as well as an unowned one, and the "403 is ownership, never retry"
rule — correct for `SplatDevUmbracoPluginBackup` — made every throttled call give up
instantly. The two are now told apart by evidence: an id that has already unlisted
successfully in this run is proven owned, so a later 403 on it is throttling and is
retried; an id that has never succeeded keeps the immediate break. The run also stops after
8 consecutive failures instead of grinding through the remainder, and reports the
`start_at` to resume from.

The failure line was truncated to 160 characters from the front, and `dotnet nuget delete`
opens with a `warn : Deleting <id> <version> from …` line — so the cut landed before the
status code and run 2's 130 failures recorded no reason at all, again. It now selects the
line carrying the status.

`tools/plan-unlist.py` also reads the **registration** index rather than the flat container,
because the flat container lists unlisted versions too — planning from it re-attempts
everything a previous run already unlisted, which is exactly the work a rate-limited retry
cannot afford. After the first run the remaining plan was 289, not 911.

**Legacy Umbraco 8 versions can outrank the current package — resolved, but this is the mechanism to watch.** Several ids carried `8.18.x` builds whose version numbers sort *above* today's `2.x`/`3.x`, so NuGet resolved the v8 assembly as latest. This is about versions *within one package id*, which is exactly what version sorting governs — unlike the search-ranking claim above, which was a confusion of the two.

Verified clear as of 2026-08-25: `Backups`, `CopyValue` and `DefaultValue` each resolve to their current release (3.3.3, 2.4.2, 2.4.0) with no `8.18.x` version listed. `Backups` in fact has a single listed version, which is the goal state for every id here. This is not cosmetic: `Backups` served 8.18.7.2 over the 3.3.0 that added authorization to its anonymous `Restore` and `Delete` endpoints, making a published security fix unreachable. Unlist the legacy versions — `.github/workflows/unlist-legacy.yml`, manual dispatch — and check the *search* index, not the flat container, which lists unlisted versions too:
`curl -s "https://azuresearch-usnc.nuget.org/query?q=packageid:<id>&prerelease=true"`.

**Some package ids were replaced rather than updated, and the dead one often looks newer.** A plugin rebuilt under a conforming name left its old id on NuGet, still resolvable, sometimes at a higher version than its replacement — so a search turns up both and the stale one wins the eye:

Verified against the search index after v2.7.0: seven of the eight are unlisted, so only
the last row still turns up in a search.

| Superseded id | Its version | Unlisted? | Use instead | Current |
| --- | --- | --- | --- | --- |
| `…Plugins.SocialMediaChannels` | 3.0.8.4 (Umbraco 7) | yes | `…Plugins.SocialMedia.Channels` | 2.3.0 |
| `…Plugins.SimpleAnalytics` | 2.0.0.6 (Umbraco 7) | yes | `…Plugins.Analytics` | 2.1.5 |
| `…Plugin.Backups13` | 13.2.0.12 | yes | `…Plugins.Backups` | 3.3.2 |
| `SplatDevUmbracoPluginBackup` | 9.5.4 | **no — still listed** | `…Plugins.Backups` | 3.3.2 |
| `…Plugins.CharLimitRestrict` | 2.0.1 | yes | `…Plugins.CharLimit` | 1.4.0 |
| `…Plugins.OnOffButton` | 2.0.1 | yes | `…Plugins.OnOff` | 2.3.0 |
| `…Plugins.RestrictPage` | 2.0.1 | yes | `…Plugins.Restricted` | 2.5.0 |
| `…Plugins.YouTubePreview` | 2.0.1 | yes | `…Plugins.VideoPreview` | 2.3.0 |

The one still listed is `SplatDevUmbracoPluginBackup`, and the reason recorded here for
prioritising it was wrong. It said 9.5.4 "sorts above the 3.3.2 that replaced it, so it
wins the search outright". It does not, and cannot: NuGet's search ranks *different ids*
by relevance and downloads, not by version number. Measured across four queries —

| query | rank of `…Plugins.Backups` | rank of `SplatDevUmbracoPluginBackup` |
| --- | --- | --- |
| `umbraco backup` | **1** | 2 |
| `backups` | 3 | not in top 5 |
| `splatdev backup` | **1** | 3 |
| `SplatDevUmbracoPluginBackup` | 2 | 1 |

— the replacement wins everywhere except a search for the dead id by name.

That confuses two different mechanisms. Version numbers decide which version of *one* id
resolves as latest, which is the real Umbraco 8 problem below. They have nothing to do with
which of *two* ids a search surfaces first.

So this is a lower priority than it read: the id is still listed and installable, with 321
downloads, and anyone already depending on it gets no signal pointing at the replacement.
That is what deprecation fixes, and it is worth doing — but it is not outranking anything.

The two jobs nuget.org gives no API for — deprecating the superseded ids, and the ownership
transfer `SplatDevUmbracoPluginBackup` needs — are written up with exact values and a draft
support request in `docs/nuget-housekeeping.md`.

`.github/workflows/unlist-superseded.yml` unlists these wholesale (manual dispatch, dry-run by default). Unlisting hides an id from search and resolution without deleting it, and the Umbraco Marketplace takes its listings from NuGet so the entry goes with it. It is **not** deprecation: NuGet's deprecation flag adds a banner naming the replacement, which is what someone who already installed one needs to see, and it can only be set in the nuget.org UI — do both.

`SplatDevUmbracoPluginBackup` could not be unlisted from CI: the NuGet api key answered **403 Forbidden**. This was recorded here as a package-id glob problem — that the id has no dot and a `SplatDev.*` glob misses it — and that was wrong. The key's glob is `*` and it holds the *Unlist or relist package versions* scope, so it covers the id fine.

The actual reason is ownership. A NuGet key is scoped to one **package owner**, and this key's is `SplatDev`, while `SplatDevUmbracoPluginBackup` is owned by `Shuchita`:

```
SplatDevUmbracoPluginBackup       owners=['Shuchita']
SplatDev.Umbraco.Plugins.Backups  owners=['SplatDev']
```

No key issued under `SplatDev` can touch it, whatever the glob. The seven ids that did unlist are all `SplatDev`-owned. Fix it by adding `SplatDev` as a co-owner of that package from the `Shuchita` account (nuget.org allows several owners), after which the existing key works — or have `Shuchita` unlist and deprecate it directly. Widening the glob achieves nothing.

Check ownership before blaming a key: `curl -s "https://azuresearch-usnc.nuget.org/query?q=packageid:<id>" | jq '.data[0].owners'`.

The workflow used to report that run as a clean success — it counted attempts, not outcomes — and now fails the job instead.

Two ids in this group are deliberately left alone. `…Plugins.AdPreview` (0.0.3.5, Umbraco 7) has a v17 port in PR #118 that will publish under the same id, and `…Plugins.HideContent` (1.0.1, a `umbracoNaviHide` visual) has no current equivalent to point anyone at.

**Private feed.** `nuget.config` maps `PdfCurator.*` to `https://nuget.pkg.github.com/splatdevtech/` and reads `%GITHUB_ACTOR%` / `%GITHUB_TOKEN%` from the environment. Restore of PdfCurator fails without those set.

**A package NuGet is still validating looks exactly like one it rejected.** Both answer
404 from the flat container, the registration and the package page, and neither says why.
`SocialMedia.Channels.PropertyEditor 1.1.0` took a little over an hour — it was 13 MB
where the others are under 0.5 MB — and was written off as rejected somewhere around the
45-minute mark, which put a wrong claim into a tag message and a changelog. Validation
time scales with size, so give a large package hours before concluding anything, and read
the status from the owner's nuget.org account rather than inferring it from a 404.

**The GitHub Packages half of `publish.yml` had never worked.** It pushed to
`nuget.pkg.github.com/SplatDev-Ltda` while the repository lives under `splatdevtech`, and
`GITHUB_TOKEN` is scoped to the repository's own owner and nothing else — so every push
answered **403 Forbidden**, on v2.7.0 and every release before it. The job had no
`permissions:` block either, so the token was read-only regardless. Both are fixed, and
the feed owner now comes from `${{ github.repository_owner }}` so it cannot drift again.

What hid it is the same defect this repo has now found three times: the step ended each
push with `|| echo "::warning::..."`, so 72 consecutive failures left the job green. A
step that reports success having done nothing is worse than one that fails. Count
outcomes, not attempts, and fail the job — `publish.yml` and `unlist-superseded.yml` both
do now.

**Versioning/publish.** `<Version>` is per-`.csproj` (no central version). Pushing a `v*` tag runs `publish.yml`, which packs each publishable plugin and pushes to NuGet.org (skipping versions that already exist) and GitHub Packages. `Directory.Build.props` supplies Authors/Company/Copyright/license only — keep it that way. It used to declare `MailKit`/`MimeKit` repo-wide, which made every package depend on an email stack it never used and silently overrode Mailer's own pinned version; add package references to the project that needs them.

**Shipping `App_Plugins` takes three things, and two of them are easy to miss.** Every plugin embeds `App_Plugins/**` as `EmbeddedResource` and carries a generated `Composers/EmbeddedAppPluginsComposer.cs` that does all of this. Change one, change all 69 — they are generated from one template.

1. *Embed the files* — `EmbeddedResource` + `GenerateEmbeddedFilesManifest`. (Copying content into the consuming site via `buildTransitive` also works and is what the site at splatdev.com still relies on, but it puts loose files in someone else's repo and silently no-ops if the target is missing.)
2. *Serve them* — add a `ManifestEmbeddedFileProvider` to `StaticFileOptions`. **Compose, never assign.** A null `FileProvider` does not mean "nothing is serving files", it means the middleware falls back to the web root; assigning into it unmounts `wwwroot` for the entire site and 404s every asset including the whole backoffice. Compose against `env.WebRootFileProvider`. Pass no `root` — the manifest already mirrors the project layout, and `root: "App_Plugins"` resolves to `App_Plugins/App_Plugins/…`.
3. *Register the manifest* — **serving the file is not enough.** Umbraco discovers extensions by enumerating *physical* directories under `App_Plugins`, so an embedded-only plugin is invisible however happily `umbraco-package.json` answers over HTTP: no section, no error, nothing. Each plugin registers an `IPackageManifestReader` (net10.0 only) that reads its embedded manifest directly.

Verify with the manifest endpoint, not a file fetch: `GET /umbraco/management/api/v1/manifest/manifest/private` must list the plugin with a non-zero extension count. A 200 on `umbraco-package.json` proves only that step 2 works.

**A v17 dashboard must send an `Authorization` header, or its own API returns 401.** Umbraco 13 authenticates the backoffice with a cookie, so a plain `fetch("/umbraco/api/...")` works there. Umbraco 17 does not: the cookie is present but nothing tells the server to look in it, so the call arrives anonymous and any `AuthorizationPolicies.BackOfficeAccess` guard returns 401. Every Lit dashboard in this repo had this, introduced by the authorization work in #124 — before it the endpoints were anonymous, so the credential-less fetch happened to succeed. Each plugin now has a `client/src/auth-fetch.ts` helper; use it rather than bare `fetch`.

Two things make this hard to spot. First, `getLatestToken()` does **not** return a JWT on 17.3 — it returns the literal string `"[redacted]"`, the real token lives in an httpOnly cookie, and `HideBackOfficeTokensHandler` swaps it in server-side. The `Bearer ` prefix is what makes the swap fire; sending the bare sentinel is still a 401. Second, `consumeContext` resolves asynchronously, so a request issued before it lands goes out with no header at all — await a readiness promise, as `WhatsApp/api.ts` and `auth-fetch.ts` do.

Above all, **a dashboard that gates on `response.ok` and renders its empty state otherwise makes a 401 indistinguishable from a site with no data.** That is why this survived: MemberTypes reported "No member types found" on an install that has member types. 25 dashboards still have that shape.

**A built bundle nothing loads is invisible.** CharLimit's `umbraco-package.json` pointed at a hand-written `dashboard.js` sitting beside the `charlimit-dashboard.js` that vite actually emits, so every rebuild updated a file the manifest never referenced. Check that each manifest `element` path is a current build output — and if the built module exports a named symbol rather than a default, the manifest also needs `elementName`, or the extension registers and still renders nothing.

**Every plugin README carries a `## Changelog`, and it is updated with the version bump.** One `### <version> — <date>` block per release, plain sentences describing what changed for someone using the plugin — not commit subjects. It sits directly above `## License`. A version bump without a changelog entry is incomplete: `<Version>` is per-`.csproj` and there is no central release note, so the README is the only place a consumer can see what a new version actually did.

**A dashboard can render perfectly and fail every call behind it.** Checking that the element renders only proves the first half. Six dashboards drew correctly while their APIs returned 500 or 404, and nothing on screen said so. Two distinct causes, both worth checking on any plugin with its own tables or controllers:

- *Tables that were never created.* Umbraco's `Create.Table<T>()` names a table after the **entity**; EF names it from the entity's `[Table]` attribute (or the `DbSet` property). When they disagree the migration *succeeds*, records itself as done, and leaves the plugin querying something that does not exist — Lgpd created `Consentimento` and queried `Consentimentos`; VisitorCounter created `VisitorSession` and queried `VisitorCounter_Session`. Generate the DDL from the EF model (`GenerateCreateScript()` inside a `MigrationBase`, as `CreateCopyValueTables` does) so the names come from the same place the queries do. Equally, never pin a provider-specific column type: CopyValue's `HasColumnType("nvarchar(max)")` was emitted verbatim into SQLite DDL, failing with `near "max": syntax error`, which aborted the migration for good.
- *Routes that only exist on Umbraco 13.* `/umbraco/backoffice/api/<Controller>/<Action>` is the v13 convention. Umbraco 17 does not route a `ManagementApiControllerBase` by convention at all, so without an explicit `[Route]` the controller is **not mapped** and every call 404s. Add the route under `#if NET10_0_OR_GREATER` only — the v13 AngularJS bundle still calls the old URL — and point the Lit client at the *route templates the actions declare* (`statistics`, `url-not-found`, `all`), not at their method names.

**A `css` block that interpolates a plain string kills the whole dashboard.** Lit's `css` tag accepts only nested `css` results or numbers; anything else throws *while the module evaluates*, so the `@customElement` decorator never runs, `customElements.get(tag)` stays false, and the panel is simply blank with no clue on screen. PagSeguro interpolated its brand colours as strings and had never rendered on any install. Wrap such values in `unsafeCSS(...)` (keep the plain string too if `render()` needs it for an inline `style` attribute).

**`wwwroot/App_Plugins` is not served.** Schema2Yaml and Yaml2Schema kept their backoffice assets there under a plain `Microsoft.NET.Sdk`, so they were neither static web assets nor embedded content: `/App_Plugins/<Name>/umbraco-package.json` 404'd, and so did `/_content/<PackageId>/…`. Both dashboards were unreachable on every install while the package still shipped them via a `buildTransitive` copy. Embed `App_Plugins` and register the manifest reader like every other plugin.

**Verify a dashboard with the browser, not with the file.** `/tmp/shot/audit-render.js` walks every dashboard and reports three things per plugin: whether the custom element is defined, the rendered height, and any console error or failed request. That last column is what surfaced all six API failures above; a render-only check called them healthy. When a plugin is missing from `test-environments/Umbraco17.Baseline`, "the dashboard does not render" usually means the test site does not have the plugin — all publishable plugins are now referenced there, and each payments plugin needs its `SplatDev.Payments.*` sibling referenced directly too, or the project reference resolves `compileOnly` and Umbraco's assembly scan takes the site down at startup.

**A custom backoffice section is not granted automatically.** Registering a `section` extension in `umbraco-package.json` makes it *available*, not *visible* — Umbraco only shows it once the alias is added to a user group's allowed sections. A freshly installed plugin therefore looks like it did nothing, even to an administrator.

## Branching

Per `README.md` and `Instructions.md`: `u13` (Umbraco 13 / net8.0) and `u17` (Umbraco 17 / net10.0) are the major branches; feature work goes on `feature/SPL-XXXX-description` or `fix/SPL-XXXX-description` branched from the relevant major branch, one PR per feature, never a direct commit to `u13`/`u17`/`master`. Cross-cutting changes (shared libs, infra, CI) get one PR per major branch. Archived work lives under `archive/`.

Reality check: CI only triggers on `master`/`main`, `origin/HEAD` is `master`, and recent history is squash-merged PRs onto `master`. Confirm the intended target branch before opening a PR rather than assuming.

## Architecture notes

Plugin internals follow a consistent shape — `Composers/` (`IComposer` registering services), `Controllers/` (backoffice API, forked by target framework), `Services/` + `Repositories/`, `Models/`, `Migrations/` (Umbraco `MigrationBase`), `Components/` (`INotificationHandler` / background services), `Extensions/` (DI + helper extension methods).

Provider-style subsystems are abstraction-first: `SplatDev.Messaging` / `SplatDev.Payments` / `SplatDev.Search` / `SplatDev.Cache` define the contracts, and sibling packages (`.SendGrid`, `.Twilio`, `.Stripe`, `.MercadoPago`, `.Elastic`, `.Redis`, …) implement them. Add a new provider as a new sibling project against the existing abstraction rather than extending the core package.

`ARCHITECTURE.md` records the Azure-first PaaS stance (App Service, Azure SQL, Redis, Service Bus/Event Grid, Key Vault + managed identity, App Insights, Bicep IaC under `infra/`) and the decision to standardize API versioning through `SplatDev.Api.Common.ApiVersioning` (`AddSplatApiVersioning`).

`customers/` holds per-client integration code (e.g. `findlay-auto`) that is not published to NuGet.
