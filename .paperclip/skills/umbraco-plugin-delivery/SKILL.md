---
name: umbraco-plugin-delivery
description: End-to-end delivery of Umbraco plugins and themes as shippable products — clarify scope with the operator, wireframe the back-office UI for board approval, build BackOffice (Lit v14+/AngularJS v13) plus Front-End (Razor/Lit) components, create logos and icons, package as NuGet, and publish to the Umbraco Marketplace with technical and non-technical listing copy. Use whenever creating, completing, reviewing, packaging or publishing an Umbraco plugin/theme/package, or writing its README, wireframes, branding assets or marketplace listing.
---

# Umbraco Plugin & Theme Delivery

Turning an Umbraco plugin or theme into a **shippable product**: scope → wireframe → build
(back-office + front-end) → brand → package → publish.

> **This is the delivery pipeline, not the coding standards.** For controllers, ModelsBuilder,
> Block List/Grid, composers, migrations and version-specific API guidance, use the **`umbraco`**
> skill. Load both when implementing.

---

## Rule 0 — If the plugin is not clear, STOP and ask the operator

**Never invent a plugin's purpose.** If you cannot state, in one sentence, what the plugin does and
who it is for, you are not ready to spec, wireframe or code it.

Ask the operator explicitly:

- **What does it do?** The single user-visible outcome.
- **Why does it exist?** The problem it solves; what people do today without it.
- **Who uses it** — editor in the back office, site visitor, or a developer consuming an API?
- **What exactly should be implemented now** vs. deliberately deferred.
- **How** — any required integration, provider, protocol or third-party account.
- **Is there existing code?** Read it first; an empty README does not mean an empty project.

Ask **before** writing a spec, and ask **one batch of concrete questions**, not a trickle. An
assumption recorded as a requirement is the most expensive mistake in this pipeline — it survives
into the wireframe, the code, the NuGet description and the public marketplace listing.

When reviewing a **solution of many plugins**, do the pass project-by-project and list the unclear
ones for the operator in a single message rather than guessing individually.

---

## 1. Naming, structure, README

- **Every package carries the house suffix/prefix agreed for the solution** (e.g.
  `SplatDev.Messaging.SMSTools`). Match the existing solution — never introduce a second convention.
- **The README is the contract.** Before implementation it states intent; after implementation it
  states reality. A README that describes unbuilt behaviour is a defect.
  - What it does · who it is for (state the audience — usually **developers**) · install ·
    configure · use · extend.
  - **`appsettings.json` snippets with placeholder values only.** Never a real key, connection
    string, token or password — these files land in a public NuGet and often a public repo.
- **Public API surface is deliberate.** If consumers are meant to call it, it is `public` and
  documented; otherwise `internal`. Publishing accidental API means you own it forever.
- **Real async.** `async`/`await` all the way down. No `.Result`, no `.Wait()`, no
  `Task.Run` wrappers around sync I/O to fake it.
- **Umbraco 17 registers through DI** — composers/extension methods, not statics or service
  location.

---

## 2. Back-office UI — pick the right surface, then wireframe it

Most plugins need a back-office interface. **Choose the extension type deliberately:**

| Need | Extension type |
|---|---|
| Edit one value on a document/media type | **Property editor** |
| Overview / at-a-glance for editors | **Dashboard** |
| A whole workspace with its own tree | **Section + tree** |
| Act on an existing item | **Context / workspace action** |
| Configure the package globally | **Settings dashboard** |

**Version determines the technology — do not mix them up:**

- **Umbraco 14+ (incl. v17) → Lit + TypeScript** web components, on the Bellissima back office.
  Register via `umbraco-package.json` manifests.
- **Umbraco 13 → AngularJS** (`.html` view + controller), registered via `package.manifest`.

**Use Umbraco's own UI components** (`@umbraco-ui/uui-*` / the UUI library) rather than hand-rolled
markup. It is the difference between a plugin that looks native and one that looks bolted on, and
you inherit theming, dark mode, spacing and accessibility for free. Hand-roll only what genuinely
has no UUI equivalent.

### Wireframes before code — board approval gate

**Produce wireframes and present them to the board for approval before implementing UI.** They are
cheap to change and expensive to retrofit.

- One wireframe per screen/state, including **empty, loading and error** states — these are where
  back-office plugins actually feel unfinished.
- Show where the extension appears in the Umbraco chrome (which section, which tab, which panel),
  not just the panel in isolation.
- Annotate what each control does and what happens on save/failure.
- Keep them in the project (e.g. `docs/wireframes/`) and link them from the README and the spec.
- **Get explicit approval before building.** Record it.

---

## 3. Ship BOTH halves when applicable

A plugin is not done when the back office works.

- **Back office** — Lit (v14+) or AngularJS (v13) as above.
- **Front end** — **Razor** views/partials/view components for server-rendered output, and **Lit**
  web components where the visitor-facing surface needs interactivity.
- **Themes** ship front-end assets plus any back-office configuration the editor needs to control
  them.

Both halves ship **inside the same NuGet package** — a consumer installs one package and gets a
working feature, not a kit of parts.

---

## 4. Branding — logo and icon per package

Every plugin/theme gets its **own logo and icon**, derived from what the plugin does and, where it
integrates a third party, that provider's branding (Banco Inter, PagBank, Santander, Correios, …).

- **Icon** — simple, legible at 16–32 px, readable in light and dark back office. Prefer SVG.
- **Logo** — used on the marketplace listing and README; larger, can carry the provider mark.
- Where the plugin integrates a provider, make the association **instantly recognisable** — an
  editor scanning a list should know "this is the PagBank one" without reading.

> ⚠️ **Third-party marks are the provider's property.** Use official assets from their brand/press
> kit, follow their brand guidelines (clear space, colour, no distortion), and do **not** imply
> endorsement, partnership or certification that does not exist. Prefer neutral phrasing —
> *"integration for X"*, not *"official X plugin"*. If the provider's guidelines forbid the use,
> ship a neutral icon instead. When in doubt, ask the operator.

---

## 5. NuGet packaging

The package must install cleanly into a real Umbraco site and do something immediately.

- Target the framework matching the Umbraco major (v13 → .NET 8; v17 → the current target).
- `PackageId`, `Version` (SemVer), `Authors`, `Description`, `PackageTags`, `PackageIcon`,
  `PackageReadmeFile`, `PackageLicenseExpression`, `RepositoryUrl`.
- **Reference Umbraco packages, don't bundle them** — and keep the version range as permissive as
  is actually supported so you don't force consumer upgrades.
- Ship back-office assets under **`App_Plugins/<PackageName>/`** with the manifest
  (`umbraco-package.json` for v14+, `package.manifest` for v13) and mark them to be copied on
  install.
- **Install must be non-destructive**: no forced config rewrites, no migrations that assume an empty
  database, sensible defaults so the site still boots if nothing is configured.
- Verify by installing the built `.nupkg` into a **clean** Umbraco site — not only the dev solution
  where everything is already wired.

---

## 6. Umbraco Marketplace publishing

The listing is the product for everyone who has not read the code.

- **Marketplace assets:** logo, at least one **back-office screenshot** of the real UI, and where it
  helps, a short demo clip. Screenshots must be of the shipped build, never a mockup.
- **Two registers of copy, both required:**
  - **Non-technical** — what it does and why it is worth installing, in plain language for a site
    owner or editor. Lead with the outcome, not the architecture.
  - **Technical** — supported Umbraco versions, dependencies, configuration keys, extension points,
    limitations, and what it explicitly does *not* do.
- **Usage instructions** that go install → configure → first successful use, with the
  `appsettings.json` keys spelled out (placeholder values only).
- State **supported Umbraco versions** honestly and keep them current as majors ship.
- Include support/repository/issue links.

---

## Definition of done

- [ ] Purpose confirmed with the operator (or already unambiguous) — **Rule 0**
- [ ] README matches what is actually implemented; secrets are placeholders
- [ ] Wireframes produced **and board-approved** before UI implementation
- [ ] Back-office extension uses the right type and the right tech for the Umbraco major, built from
      UUI components
- [ ] Front-end (Razor / Lit) shipped where applicable, in the same package
- [ ] Logo + icon created; third-party marks used within the provider's guidelines
- [ ] `.nupkg` builds and installs cleanly into a **clean** Umbraco site
- [ ] Marketplace listing: assets, technical **and** non-technical copy, usage instructions,
      supported versions
- [ ] Real async throughout; DI registration; deliberate public surface
