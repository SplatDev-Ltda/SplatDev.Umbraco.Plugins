# SPL-3286 PdfCurator Phase B acceptance rerun

**Run:** 2026-08-18 UTC  
**Target:** `https://staging-umbraco.splatdev.tech` (Umbraco 17 staging)

## Executed evidence

| Check | Result | Evidence |
|---|---|---|
| PdfCurator package asset | PASS | `/App_Plugins/PdfCurator/umbraco-package.json` HTTP 200; contains `PdfCurator.Section` |
| Anonymous member books API | PASS | `GET /umbraco/pdfcurator/api/v1/member/books` HTTP 401, JSON `{"error":"Authentication required."}` |
| Anonymous favorites API | PASS | `GET /umbraco/pdfcurator/api/v1/member/favorites` HTTP 401, JSON `{"error":"Authentication required."}` |
| Backoffice route | PASS | `/umbraco` reaches Umbraco login; screenshot `spl-3286-backoffice-login.png` |
| member.js gzip budget | PASS | 6,812 bytes gzipped (<80 KB); source 35,653 bytes |

Raw HTTP headers/bodies are in `spl-3286-http-evidence.txt`.

## Not executable / not claimed as pass

The target still has no published content and no seeded PdfCurator catalog/member fixtures exposed to this run. No member test credentials were available in the environment. Therefore authenticated library, 400+ page reader/progress, favorites persistence, similar rail, MemberGroupScopes, runtime axe/WCAG, en/es browser verification, and Phase A authenticated regression were **not run** and are not marked passing. The Playwright script is `spl-3286-browser-check.mjs`; it verified anonymous API behavior and captured the backoffice login screenshot.

## Single prerequisite to resume

Provide a deployed/staged published fixture set and member credentials (catalog with one 400+ page PDF, Technology peers, scoped/unscoped members, and configured `MemberGroupScopes`). Then rerun the remaining authenticated and browser acceptance cases.

## Retry evidence — 2026-08-18 (current run)

- Anonymous API checks rerun with Playwright: member books and favorites both returned HTTP 401 JSON `{"error":"Authentication required."}`.
- PdfCurator package manifest rerun: HTTP 200 and `PdfCurator.Section` present.
- Backoffice login page is reachable. The allow-listed Umbraco admin credentials were attempted against `#username-input` / `#password-input`; the browser remained on `/umbraco/login` after the attempt, so no authenticated backoffice session was established.
- The target root still returns the Umbraco “No Published Content” page. No catalog, member, or `MemberGroupScopes` fixtures are available.
- The focused PdfCurator test project was invoked with `dotnet test ... --configuration Release --no-restore`; compilation fails for the net8.0 target because net10-only member namespaces/types are included in the multi-target test project. This is a pre-existing test-project configuration issue, not acceptance evidence.

Authenticated six-AC flow, runtime axe/WCAG, en/es browser verification, and authenticated Phase A regression remain not executable without published fixtures and a usable member credential.
