---
name: nopcommerce-marketplace-deploy
description: Package and submit (or update) a nopCommerce plugin or theme on the official nopCommerce.com marketplace (the seller Partner portal - Upload extension flow). Use whenever the user wants to publish, submit, list, deploy, release, or update a nopCommerce plugin/theme on the marketplace; mentions the marketplace/partner portal, "upload extension", "upload-product", "uploadedItems.json", "ready to deploy package", a marketplace listing/submission, or preparing the source + compiled ZIPs, logos, screenshots, and descriptions for a listing.
---

# Deploy a nopCommerce Plugin/Theme to the Marketplace

## Purpose

Take a built nopCommerce plugin or theme and get it **listed (or updated) on the official
nopCommerce.com marketplace**. There is **no public deploy API** — submission is a web form in the
seller Partner portal followed by a **manual review** by the nopCommerce team. This skill covers
packaging the required artifacts, the exact form fields and their constraints, and the
**check-first / update-don't-duplicate** rule.

This skill is deployment-only. For building the plugin/theme use the **`nopcommerce`** skill. **Logos are
generated with `nanobanana`** per the **Logos** rules below (the `nopcommerce-plugin-logo` skill only
covers wiring an existing `logo.png` into the `.csproj`/admin, not creating the artwork).

## Prerequisites

- **Approved nopCommerce.com seller/partner account.** Credentials are referenced by secret key name
  only (e.g. `$NOPCOMMERCE_SELLER_USER` / `$NOPCOMMERCE_SELLER_PASSWORD`) via `secretService` —
  **never in source control**. The operator inserts credentials in the browser (copilot).
- **A browser tool** (Playwright/Chrome) — the operator logs in; the agent drives the form.
- **The built plugin/theme**, versioned to match its `plugin.json` `Version`, compiled clean (the
  `.csproj` `ClearPluginAssemblies`/`NopTarget` step strips framework DLLs from the output).
- Source repo (SplatDev baseline): `github.com/splatdevtech/SplatDev.NopCommerce.Plugins` (branch `main`).
  Local canonical clone: `/mnt/e/source/repos/nopCommerce Projects`.

### Canonical marketplace tooling (use it — don't re-derive)

The canonical repo ships a `marketplace/` folder that IS the deployment source of truth:
- **`marketplace/marketplace-listings.json`** — per-plugin `name`, `shortDesc`, `fullDesc` (HTML),
  `category`, `price`, `zipFile`, `iconKey`, `sysName`, `ready`, `supportedVersions`, `sourceCodeUrl`.
- **`scripts/build-marketplace-zips.sh`** — builds each plugin (dotnet SDK 9.0) and produces the
  ready-to-deploy ZIP **with a correct `uploadedItems.json`** (`Type`/`SupportedVersion`/
  `DirectoryPath`/`SystemName`). `--skip-build` repackages existing output. Zips are **not** committed.
- **`marketplace/images/`** — `mp-{iconKey}.png` (catalog icon) + `icon-{iconKey}.png` (banner).
- **`marketplace/SUBMISSION-GUIDE.md`** — the wave-by-wave plugin/zip/sysName/category table + login.
- Seller login user `ccasalicchio`; password lives in Paperclip issue **SPL-76** (secret, never in source).
- **Hosting:** built ZIPs are uploaded to **Dropbox** and referenced as `?dl=1` direct links in the two
  URL fields (free listings may instead upload the ZIP directly to nop servers).

## Workflow

### 1. Check first — reuse an existing listing; never duplicate

1. Log in, then open the seller listings: **`https://www.nopcommerce.com/en/customer/products`**
   ("My account → My extensions").
2. **ALWAYS check for an existing listing first — including ones NOT yet approved.** Scan the full
   My-extensions list for a listing of this exact plugin **in ANY status** — `Approved`, **`Under
   review` (pending)**, or `Rejected`. A pending/under-review listing for the plugin still counts:
   never create a second one just because the first isn't approved yet. Match by brand/plugin name and,
   when unsure, open the candidate's Edit page and confirm the SystemName/package. Duplicates are
   rejected and waste review cycles.
3. Decide which listing to write to, in this priority order:
   1. **A listing for THIS exact plugin already exists (any status)** → click its **Edit** link
      (`/en/upload-product/{id}`) and **update it in place** (bump the compiled/source packages, tick
      any newly-supported versions). **Never** open a second listing for the same plugin.
   2. **No listing for this plugin yet, but reusable placeholders exist → EXHAUST the placeholder pool
      before creating anything new.** The leftover **wrong-submission** rows — seen labelled
      `DELETE, it's a wrong submission` and, once claimed as a reuse slot, renamed to
      **`IGNORE, it's a wrong submission (NOW A PLACEHOLDER)`** — are a reuse pool from earlier failed
      attempts (typically `Status: Under review`). **Repurpose one**: open its **Edit** page and
      overwrite every field with the new plugin's data. You MUST use up every remaining placeholder
      before ever clicking "Upload extension". Leftover placeholders also carry **stale images** — see
      the placeholder-cleanup note in step 3.
   3. **Placeholder pool is fully exhausted** (no wrong-submission rows left in any status) → only then
      click **Upload extension** (`/en/upload-product`) to create a **fresh** listing.
3. One listing per plugin covers **all** supported nopCommerce versions in a single package — never
   make a separate listing per version.
4. **Reconcile, don't regress.** When updating an existing listing, the **live listing may be more
   current than `marketplace-listings.json`** (hand-curated descriptions, the newer category taxonomy
   e.g. `Shipping & delivery >> Shipping carriers`, live Dropbox package links). Do **not** blind-overwrite
   from the registry. Default update = **refresh the ZIP + tick any newly-supported versions**, keep the
   curated live copy, and only fix live rule violations (e.g. a short/full description that lists
   supported versions — the form forbids that). Diff registry vs live and surface conflicts to the
   operator before overwriting curated fields.

### 2. Produce the marketplace deliverables (pre-submission checklist)

Per the SplatDev nopCommerce project rules' Definition of Done, assemble **all** of these before
touching the form:

- [ ] **Compiled "ready-to-deploy" ZIP** (≤ 10 MB) — the built plugin/theme, installable via
      **Admin → Configuration → Local plugins → "Upload plugin or theme"**. It **must contain
      `uploadedItems.json`** at the archive root (a manifest mapping each supported version to its
      plugin/theme directory + `SystemName` + `Type` of `Plugin`/`Theme`). A merchant must never have
      to FTP files manually. To match the exact structure, download an official example (e.g. the
      2Checkout payment module: `/en/2checkout-payment-module`) and mirror its layout.
- [ ] **Source-code ZIP** — full source for **all** supported versions, **with no `.git`** — for the
      nop team's technical/anti-clone review. (Or a GitHub URL granting read access to
      `github.com/AndreiMaz`.)
- [ ] **Logo 140×140** and **large logo 512×512**, **generated with `nanobanana`** and **cartoonish**
      in style. Two cases (see **Logos** section below for the full rules + prompt recipe):
      - **Brand plugin** (implements a named service — MercadoPago, PagBank, Pagar.me, Correios, …):
        the logo MUST include that service's **original, unmodified brand logo** (e.g. the MercadoPago
        plugin logo embeds the real MercadoPago mark), set in a cartoonish scene.
      - **Non-brand plugin** (Motoboy, RequestGuard, …): the logo/icon must depict **what the plugin
        does** — e.g. Motoboy = a motorbike **delivery-person silhouette** with **speed dashes** behind
        the bike to show it moving fast.
- [ ] **≥ 2 screenshots** (JPG/PNG, **min width 600px**; first image is the catalog thumbnail).
      **MANDATORY for every new submission: a real screenshot of the plugin's Admin _Configure_ page.**
      **Add a front-end/storefront screenshot too whenever the plugin has a customer-facing surface**
      (payment method at checkout, shipping options at checkout, a widget on the storefront, etc.);
      admin-only plugins may use a second admin view instead. Capture these live from the store admin
      (the plugin must be installed): navigate to `Admin/<Plugin>/Configure` and, for the front-end, the
      relevant storefront page. Never ship a listing whose only images are banners/logos — the nop team
      wants to see the actual UI.
- [ ] **Short description** — plain text, **≤ 250 chars**, no HTML, no versions/pricing/superlatives.
- [ ] **Full description** — HTML, **≥ 700 chars**; features as bullets, usage examples, support/docs
      links, and (for themes, **required**) a live-demo link.

### 2a. Logos — generate with `nanobanana` (cartoonish)

Every plugin logo is **generated with `nanobanana`**, in a **cartoonish** style. Produce **BOTH sizes
and commit both to canonical** in the plugin folder:
- **`logo.png` — 140×140** (the nopCommerce plugin/admin logo, bundled in the package).
- **`logo-512.png` — 512×512** (the marketplace "large logo").

Do NOT hand-draw shapes in PIL/SVG or just download-and-resize — those don't meet the bar. (PIL is only
for the mechanical **trim-to-square + resize** of the generated art into the two sizes.)

Two cases decide the subject:

1. **Brand plugin** — the plugin implements a named third-party service (payment gateway, carrier, ERP:
   MercadoPago, PagBank, Pagar.me, Cielo, Correios, Omie, …). The logo **must contain that service's
   real, original, unmodified brand logo/mark** — do not redraw, recolor, or stylize the brand mark
   itself; place the genuine mark into a cartoonish surround. Example prompt shape:
   *"Cartoonish app icon featuring the official MercadoPago logo, unmodified, centered; playful rounded
   background; clean, flat, friendly style; 512×512."*
2. **Non-brand plugin** — the plugin is a capability, not a brand (Motoboy, RequestGuard, …). The
   logo/icon must **depict what the plugin does**. Examples:
   - **Motoboy** → a **motorbike delivery-person silhouette** with **speed dashes** behind the bike
     (conveys fast local delivery).
   - **RequestGuard** (auto-bans abusive IPs) → a guard/shield blocking bad bots.

#### Getting the real brand mark — the step that was missing, and the reason Jadlog/JSL failed

"Must contain the service's real, unmodified brand logo" is not something a generator can invent.
You have to GO AND FETCH IT. Measured 2026-08-12: the Jadlog and JSL submissions shipped white
italic text on a red/blue rectangle — no carrier mark anywhere — because nobody sourced the asset
and the model filled the gap with typography.

1. **Find the official asset.** `searxng` for `"<Brand> logo png official"` / `"<Brand> imprensa
   marca"` / `"<Brand> brand assets"`. Carriers and gateways almost always publish a press or
   brand page.
2. **Fetch it** with `firecrawl` (or `playwright` if it is behind a viewer). Prefer SVG/PNG with
   transparency from the company's own domain — not a search-result thumbnail, not a reseller's
   copy, not a favicon upscaled.
3. **Composite, do not redraw.** Place the genuine mark, unmodified, into a cartoonish surround
   generated with nanobanana. Do not recolour, restyle, re-letter or "clean up" the mark.
4. **If you cannot find an official asset, STOP and ask the operator.** Shipping typed text as a
   stand-in is what produced the two rejected listings — it is worse than an unfinished one,
   because it looks finished.

Reference points, both real and both in-tree:

- `Shipping.Motoboy` — a non-brand plugin, genuine nanobanana art (a delivery scooter with speed
  dashes). This is the bar for `brandPlugin=false`.
- `Payments.PagBank` — a brand plugin carrying the actual PagBank mark and wordmark. Flat, and
  perfectly acceptable, **because the real mark is there**.
- `Shipping.Jadlog` / `Shipping.Jsl` — statistically almost identical to PagBank, and wrong: the
  text is the only content. This is the failure to avoid.

#### Verify before you submit — mandatory

```
python3 /app/skills/nopcommerce-marketplace-deploy/scripts/check-logo.py Plugins/<PluginDir>
```

**Use the absolute `/app/skills/...` path.** Your working directory is the PROJECT
directory, not this repo, so a relative `skills/...` path does not resolve and the command
fails with *file not found*. A gate that errors is a gate that gets skipped — which is how
the two rejected listings shipped in the first place.

It enforces both sizes and rejects text-on-a-flat-fill. It exits non-zero on `FAIL`.

**A `WARN` is not a pass.** It means the image is flat enough that only a human eye can tell a real
wordmark from typed text — PagBank and Jadlog score the same. Open the PNG, confirm the genuine
brand mark is visibly present, and say so in the issue comment. If you cannot see the mark, the
logo is not done.

**Deriving the prompt:** when the subject isn't obvious from the name, read the plugin's **README and
business logic** (`plugin.json` `Description`, `*Settings.cs`, `*Plugin.cs`, Configure view) and build
the prompt from what it actually does. **If it is still unclear after reading the code, ASK THE
OPERATOR** what the icon should depict — do not guess.

**Generating (nanobanana = Gemini 2.5 Flash Image).** If a nanobanana MCP is connected, use it. If it
is NOT surfaced to the session (MCP servers load at startup; a freshly-added one won't appear until the
session restarts), call the **Gemini image API directly** with an API key — this IS nanobanana:
`POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=<KEY>`
with body `{"contents":[{"parts":[{"text":"<prompt>"}]}],"generationConfig":{"responseModalities":["IMAGE"]}}`;
the PNG comes back base64 in `candidates[0].content.parts[].inlineData.data`. Then **trim the white
border to a square and resize** to 512×512 (marketplace) + 140×140 (`logo.png` in the plugin/package).
Keep the API key in an env var; **never commit it.**

### 2b. Packaging the "ready-to-deploy" ZIP — the host-DLL gotcha (this is where agents get stuck)

The canonical `scripts/build-marketplace-zips.sh` produces a correct ZIP **only when it builds the
whole solution first.** MSBuild's `NopClear` target strips the nopCommerce host DLLs
(`Nop.Core/Data/Services/Web/Web.Framework.dll`) from a plugin's output *after* a full-solution
build. When you build a **single plugin in isolation** — the script's substring filter
(`build-marketplace-zips.sh Correios`) or a bare `dotnet build <one>.csproj` — NopClear does **not**
run, the host DLLs stay in the output, and the script's guard correctly refuses:

```
FAILED (host assemblies in package: Nop.Core.dll Nop.Services.dll ...)
```

This is not a bug in your plugin, and the answer is **not** to disable the guard (shipping host DLLs
inside a plugin can break a merchant's store at runtime and is a rejection trigger). Two fixes:

- **Full build** (`./scripts/build-marketplace-zips.sh`, no filter) — slow, but NopClear runs and
  every zip is clean. Best when packaging several plugins.
- **Fast path for one plugin — hand-stage a keep-list ZIP** with the bundled script, which keeps the
  plugin's own files and drops the host DLLs regardless of whether NopClear ran:
  ```bash
  dotnet build Plugins/<PluginProjectName>/<PluginProjectName>.csproj -c Release
  python <skill-dir>/scripts/stage-marketplace-zip.py \
      Presentation/Nop.Web/Plugins/<Category>.<Short> \
      marketplace/zips/<ZipFileName>.zip
  ```
  (In this repo the same script lives at `marketplace/scripts/stage-marketplace-zip.py`.) It reads
  `SystemName`/`FileName` from the built `plugin.json`, writes the root `uploadedItems.json`, and
  re-runs the host-assembly guard so a genuine leak still fails loudly. Exit 0 = verified package.

**What a correct package contains** (nothing more): at the ZIP root `uploadedItems.json`; under
`<AssemblyName>/`: `plugin.json`, `<AssemblyName>.dll`, `<AssemblyName>.deps.json`, `logo.png`,
`Views/**`, `Localization/**`, and any genuinely third-party DLL the plugin ships. **No `Nop.*.dll`,
no `.pdb`, no `refs/`, no `logo-512.png`** (that's the listing's large-logo image, not a package
file). Always verify before submitting:

```bash
unzip -l marketplace/zips/<ZipFileName>.zip | grep -iE 'uploadedItems.json|\.dll$'
```

`uploadedItems.json`'s `SystemName` **must equal** `plugin.json`'s `SystemName` — a stale/renamed
SystemName is a real bug that has shipped here before (a `Correios.zip` once carried
`Shipping.SplatDev.Correios` while `plugin.json` said `Shipping.Correios`). Build fresh; never reuse
an old zip's manifest.

### 3. Fill the upload form (`/en/upload-product`, or the Edit page for updates)

Field-by-field (all `*` are required):

1. **Name** * — ≤ **57 chars**. **Pattern: `<Brand> (Brazil)`** — the brand/product name plus the
   region in parentheses. **Do NOT include:** "nopCommerce"; the vendor name ("SplatDev"); the
   **category word** ("Shipping", "Payment", "Widget", "Gateway", etc.); "best/top rated"; version; or
   price. Examples: `Correios (Brazil)`, `InfinityPay (Brazil)`, `Pagar.me (Brazil)`,
   `PagBank/PagSeguro (Brazil)`. The vendor ("SplatDev") and the category belong in the **full
   description**, never the title. When updating an existing listing whose name already matches this
   pattern, **keep it** — do not overwrite the name with the registry's "SplatDev … Gateway" string.
2. **Short description** * — ≤ **250 chars**, **no HTML**.
3. **Full description** * — ≥ **700 chars**, HTML allowed but **no `<h1>`**, **no `<script>`**, no
   large/non-standard fonts or colors; scope any custom CSS under the parent `.full-description`
   selector; verify mobile layout with the form's **Preview** button.
4. **Price** — `0.00` for free; USD; informational only (you process payments; nop takes no share).
5. **Available on your own website** ☑ — **paid → MUST tick** and self-host the package (the paid page
   on your site must allow immediate purchase, not just a contact form). Free → may leave unticked to
   host on nopCommerce servers (that reveals the direct **Upload extension package** field).
6. **Category** * — pick the correct **leaf subcategory** (parent categories can't be submitted).
7. **Supported versions** ☑ — tick every version the single package genuinely supports.
8. **Images** — the first image is the catalog thumbnail; ≤ **3 total**, min width 600px. **Reused
   placeholder listings carry stale leftover images** (e.g. an old Stripe icon) that count toward the 3
   and would otherwise become your thumbnail. The uploader has three quirks to work around:
   - **One file per input**: the jQuery MultiFile widget accepts a **single** file per `imageFiles`
     input, then clones a new empty input (`MultiFile1`, `MultiFile1_F1`, …) for the next — upload one
     file per input, not an array.
   - **`max: N` counts existing images**: with 2 leftover images you can add only 1 (a "Too many files
     — max: 1" alert), and you **cannot delete the last remaining image** ("At least one image is
     required") until a new one is committed.
   - **Deleting an image is an AJAX call that re-renders and CLEARS queued (not-yet-saved) file
     inputs.** So do deletes and uploads in this order: (1) delete what leftovers you can, (2) upload
     your screenshots **last, immediately before Save** (re-tick the terms box, which the re-render may
     have cleared).
   - **A picture deletion only COMMITS on Save** — it is form-tied, not an immediate server-side delete.
     If you delete a thumbnail and navigate away without saving (or the save then fails), the image
     comes back. Always click **Save after deleting**, then reload to verify the deletion stuck.
   - **Each image must be ≤ 500 KB** (hard server limit; the error is "Error on uploading: Image maximum
     size is 500 KB", and it makes the WHOLE save fail — reverting your deletions and uploads). Device-
     scale screenshots and detailed logos blow past this. **Compress before upload**: resize to ~1400px
     wide (screenshots) / ~1000px (logos) and save as JPG (q≈85); that lands well under 500 KB.
   - **Full swap to [logo, Configure screenshot]** on a listing that already has 2 images: delete one
     (mark), upload logo + Configure (≤500 KB each), Save → [old, logo, cfg]; reopen, delete the old
     one, **Save again**, reload to confirm [logo, cfg]. The logo (uploaded first) becomes the thumbnail.
9. **Upload extension package** — the compiled ZIP (only shown when not self-hosting).
10. **Hyperlink/instructions — source code** * — the source ZIP/repo URL (private to nop team).
11. **Hyperlink/instructions — "ready to deploy" package** * — the compiled ZIP URL (private to nop team).
12. **I agree with the author terms** * → **Save**.

#### Exact HTML field names (for driving the form with a browser tool)

The Edit/Upload page (`/en/upload-product[/{id}]`) uses these input `name`s — target them directly
instead of guessing from labels, which drift:

| Field | Input `name` | Notes |
|---|---|---|
| Name | `Name` | keep the `<Brand> (Brazil)` value on updates |
| Short / full description | `ShortDescription` / `FullDescription` | |
| Price | `Price` | `0.00` for free |
| Self-host toggle | `IsRedirected` | **unchecked → the `uploadedFile` upload input appears** (free hosting); checked → self-host, no direct upload |
| **Compiled package upload** | `uploadedFile` | the file input for the ready-to-deploy ZIP (only when `IsRedirected` is unchecked) |
| Source-code URL/instructions | `SourceCode` | private, nop-team only |
| Ready-to-deploy URL/instructions | `DeployPackage` | private, nop-team only |
| Supported versions | `Versions[i].Selected` | tick every version the one package supports (4.90 is usually index 0) |
| Images | `imageFiles` (id `MultiFile1`, clones `MultiFile1_F1`…) | **one file per input** — see the uploader quirks above |
| Author terms | `IsCustomerAcceptTerms` | must be checked before Save; a re-render (e.g. after an image delete) can clear it — re-tick |

**Login** is username `ccasalicchio` (a **username**, not an email — the field is `Username`), password
from Paperclip **SPL-76**. The portal sits behind Cloudflare; a first hit may return **403 "Just a
moment…"** — wait ~10s and retry before assuming anything is wrong.

**A successful Save** (new or update) returns *"Thank you for the extension you have uploaded! It will
be manually approved…"* and the listing shows **Under review**. Refreshing an already-under-review
listing (e.g. to correct the package before the nop team looks) is fine — same version, in place.

#### Who does what — fleet vs operator

**Agents CAN drive the whole submission — this has been done in production.** On 2026-08-06 Craig M.
drove the PagBank submission end to end through the co-driven browser, and Mirna S. updated listing
7165 before that. The shared Chromium profile already holds a valid `cf_clearance` cookie and the
portal session, so *"Cloudflare blocks automation"* and *"an agent cannot clear device trust"* are
**false blockers** — do not treat them as reasons to stop and wait for the operator. An agent can
allocate a browser session itself, and a co-drive session can capture screenshots.

What is genuinely hard, measured on the same day, is narrower and more useful to know:

- **Updating an existing listing works.** PagBank (7165) went through cleanly.
- **Creating a NEW listing fails silently.** Repeated Jadlog/JSL attempts redirected back to
  `upload-product` with no inline error and no listing created. If a new submission "succeeds" but no
  listing id appears on **My extensions**, it did not land — re-check before reporting it done.
- **The CDP connection drops** after a series of operations (`socket hang up`). Re-allocate the
  session and resume rather than concluding the portal rejected you.
- **One live browser session per company.** If allocation fails with the browser at capacity, check
  whether the blocking session has already expired before treating it as a blocker — a stale
  "browser at capacity" note has held work for hours after the session died.

So the split below is a **default division of labour, not a permission boundary**. An agent that can
reach the portal should finish the job; hand off to the operator when a *new* listing silently
refuses to create, or when the operator has asked to review before Save:

- **Fleet agent (unattended):** everything in Stages/§1–2b — build + **hand-stage the verified ZIP**,
  prepare the source ZIP, write the compliant name/short/full descriptions and category into
  `marketplace/marketplace-listings.json`, and generate the two logos. Leave the ZIP verified
  (manifest + DLL + no host-DLL leak) and the metadata ready. Then hand off.
- **Operator / browser-driving session:** capture the live Configure (and storefront) screenshots,
  log in, find-or-reuse the listing (never duplicate), fill the form using the field names above,
  upload the package + images, and Save after go-ahead.

#### Browser-driving gotchas (from live update runs)

These bite an agent driving the Edit form with a Playwright/Chrome MCP tool:

- **File-upload sandbox.** `browser_file_upload` only accepts paths inside the tool's **allowed roots**
  (the working project dir + its `.playwright-mcp/`). A ZIP living elsewhere (e.g.
  `…/nopcommerce projects/marketplace/zips/Correios.zip`) fails with *"File access denied … outside
  allowed roots"*. **Copy the ZIP into an allowed root first** (e.g. `<project>/.playwright-mcp/`) and
  upload from there.
- **The two URL fields are Dropbox share links backed by LOCAL synced files.** `SourceCode` /
  `DeployPackage` typically point at `E:\Dropbox\Public\nopCommerce\<file>.zip` (`?dl=1`). To ship a new
  version **without changing the URL**, **overwrite the local file in place** (same path + filename) and
  let the Dropbox client sync — an **overwrite preserves the file id**, so the existing `scl/fi/{id}`
  link serves the new bytes. **Never delete + recreate** (that mints a new id and breaks the link).
  Keep a `.bak` of the old file; the sync just needs to finish before the (async) reviewer downloads.
- **Source code via GitHub instead of a huge source ZIP.** `SourceCode` accepts a URL or instructions —
  put the private repo URL + plugin path + branch (e.g.
  `github.com/splatdevtech/SplatDev.NopCommerce.Plugins → Plugins/SplatDev.Nop.Plugin.Shipping.Correios`)
  and **add reviewer `github.com/AndreiMaz` as a collaborator**. Far cleaner than maintaining a 300 MB+
  full-solution ZIP just to bump one plugin.
- **Custom-control checkboxes are click-intercepted by their `<label>`.** A direct click on
  `#IsCustomerAcceptTerms` (or a version checkbox) times out — *"label … intercepts pointer events"*.
  Click the **label**, or tick via JS:
  `el.checked = true; el.dispatchEvent(new Event('change', {bubbles:true}))`.
- **There is NO version/changelog field on the form.** The published version is read from the package's
  `plugin.json` `Version`. **Bump `plugin.json`** (e.g. `1.1.4 → 1.1.5`) inside the ZIP so the update
  registers as a new version — there is nowhere to type one.
- **The Edit form loses unsaved state on any navigation** (observed: the page dropping to `about:blank`,
  or a re-render after an image delete). The attached `uploadedFile` and un-saved field edits vanish.
  **Re-open `/en/upload-product/{id}` and redo** the upload + edits (and re-tick terms) in one pass right
  before **Save**.
- **Verify before Save via JS** (labels drift): read `input[name="uploadedFile"].files[0].name`, the
  `SourceCode`/`DeployPackage` values, `#IsCustomerAcceptTerms.checked`, and the ticked
  `Versions[i].Selected`; then Save and confirm **no** `.field-validation-error` element appears.

### 4. Submit, verify, and track

1. Click **Save**; resolve any inline validation errors (length limits, missing required fields).
2. Back on **My extensions**, confirm the listing shows **Status: Under review**.
3. Record the listing id/URL (`/en/upload-product/{id}`) with the issue for future **updates**.
4. Attach evidence to the Paperclip issue: screenshots of the filled form + the Under-review status.
5. Await the nop team's manual approval; if rejected, read their reason, fix, and **edit the same
   listing** (never open a new one).

## Output

- A marketplace listing in **Under review** (new) or an **updated** existing listing — never a duplicate.
- The listing id/URL recorded on the issue, plus the assembled deliverables (2 ZIPs, 2 logos,
  ≥ 2 screenshots, short + full descriptions) attached as evidence.

## Notes

- **No API / no automation of the final submit** — it is a manual, reviewed web form. The agent
  prepares everything and drives the browser; the operator supplies credentials and gives go-ahead.
- **`uploadedItems.json` is the #1 packaging gotcha** — a bare plugin folder won't install via the
  admin uploader and will be rejected. Always mirror an official example package.
- **Paid vs free hosting:** commercial extensions **cannot** be stored on nopCommerce servers — they
  must be self-hosted with a working buy flow; only free extensions may use nop's servers.
- **Rejection triggers to avoid:** cloned/stolen code, `<h1>`/`<script>` or gaudy fonts in the
  description, promoting other services from the listing, description < 700 chars, a theme without a
  live demo, or duplicate listings for the same plugin.
- **Never duplicate — check pending too:** before submitting, confirm the plugin has no existing listing
  in **any** status (Approved **or** Under review/pending). A not-yet-approved listing still blocks a
  new one. Exhaust the wrong-submission **placeholder pool** before ever creating a fresh listing.
- **Logos:** always **`nanobanana`**, **cartoonish**. Brand plugins embed the service's **real,
  unmodified brand mark**; non-brand plugins depict **what the plugin does** (Motoboy → fast motorbike
  courier; RequestGuard → shield; BlockedVariations → forbidden/no-entry icon; CPF/CNPJ → ID card).
  Derive the subject from the README/business logic; **ask the operator if still unclear.**
- **Secrets:** seller credentials and any tokens are referenced by secret key name via `secretService`
  and never committed.
