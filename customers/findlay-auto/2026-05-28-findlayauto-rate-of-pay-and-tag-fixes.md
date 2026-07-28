# FindlayAuto Onboarding — Rate of Pay & Tag-Input Fixes (2026-05-28)

Repo: `dev.azure.com/SplatDev/Findlay Auto` — merged to `main` (`46ba043`), docs (`61f7352`).
Deployed: static App_Plugins sync + Smidge cache clear + `Onboarding_v2` app-pool recycle on `10.240.1.89`.

---

## Fix 1 — Rate of Pay silently dropped (managers can't complete / advance)

**Reported:** Manager Jonathan Quinones could not complete his Position portion to send back to payroll. "Acts like it saves but then doesn't"; banner stays "form not complete."

**Root cause:** `OnboardingDashboard/dialogs/view.html` rate input was
`<input type="number" min="0" step="0.5" ng-model="vm.application.History.rateOfPay">`.
AngularJS 1.8 (Umbraco 13 backoffice) enforces HTML5 `step` validation; any value not a multiple of 0.5 (e.g. **2.75**) is invalid, so AngularJS sets the bound model to `undefined` while the DOM still shows the typed text. Save (`UpdateApplication`) and Approve (`NextStep`) then POST `rateOfPay: null`, return 200, and persist NULL → required pay rate missing → step can't complete.

**Diagnosis trail (server-side, no app-log entry for the failure):**
1. IIS logs `W3SVC2\u_ex*.log`: all of the manager's POSTs returned **200**; he re-saved the same application (Bretado, Estevan — app 330) repeatedly for ~1.5 h.
2. `hireologyApplicationHistory` for app 330: `startDate`/`manager`/`reportsTo`/`rateOfPayType` persisted, `rateOfPay` = **NULL** despite UI showing 2.75.
3. Whole-table proof: of 166 non-null rates, **every distinct value is a multiple of 0.5** — no quarter-dollar rate exists in production.

**Fix:** `step="0.5"` → `step="any"`.

**Data impact:** Previously-entered quarter rates are NULL and unrecoverable (never transmitted); affected active applications need the rate re-entered. Query in the Findlay repo runbook (`docs/known-issues-2026-05-27.md`, Issue 7).

**General lesson:** In AngularJS, `input[type=number]` with restrictive `step`/`min`/`max` silently nulls the model on non-conforming input. Use `step="any"` for currency; enforce real validation server-side.

---

## Fix 2 — Config Editor "Press Enter to add" tag inputs did nothing

**Root cause:** `ng-keydown` used the JS comma sequence operator `(a, b, c)`, which AngularJS's expression parser rejects → parse error every keypress → no-op. Affected all three tag-list inputs.

**Fix:** Logic moved to a controller method `vm.onTagKeydown($event, obj, key)` that reads the value from the input's `ngModel` and clears it; all three `ng-keydown` attributes call it.

**General lesson:** Never use the comma sequence operator in AngularJS template expressions; move multi-statement logic into the controller.

---

## Open follow-ups (not part of this change)

- **Data Protection / antiforgery key ring:** today's logs still show `AntiforgeryValidationException … key {…} not found in the key ring` from stale pre-fix XSRF cookies, plus a leftover ephemeral key (`26974dea`) still sitting in the in-publish-root `App_Data\DataProtection-Keys`. The persisted key folder (`F:\DataProtectionKeys\Onboarding_v2`) now holds a single stable key; residual errors are stale cookies. Recommend deleting the stray in-root key and a forced re-login sweep. Under investigation.
- **Rate-of-pay backfill:** list active applications with NULL `rateOfPay` for manual re-entry.
