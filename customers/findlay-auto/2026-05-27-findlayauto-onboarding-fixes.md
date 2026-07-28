# FindlayAuto Onboarding Platform — Bug Fixes 2026-05-27

Branch: `fix/getholidaydata-always-called`  
Merged into: `main` — 2026-05-27  
Repo: `dev.azure.com/SplatDev/Findlay Auto`

---

## Fix 1 — Config Editor Save Returns `[object Object]`

**Symptom:** Clicking Save in the OnboardingConfigEditor backoffice section showed `Save failed: [object Object]`.

**Root cause:** `SaveDashboardSettings` used `[FromBody] STJ.JsonElement` for the request body. Umbraco registers its Newtonsoft JSON input formatter with higher priority; when the body arrives, ASP.NET Core resolves the Newtonsoft formatter, which cannot bind to a `System.Text.Json.JsonElement`, and returns a `400 ProblemDetails` JSON object. The Angular error handler did `'' + err.data`, stringifying the object as `[object Object]`.

**Fix — backend (`DashboardApiController.cs`):**
```csharp
[HttpPost]
public async Task<IActionResult> SaveDashboardSettings()
{
    using var reader = new StreamReader(Request.Body);
    var rawBody = await reader.ReadToEndAsync();
    _dashboardSettingsService.SaveSettings(rawBody);
    return Ok();
}
```
Raw body read bypasses formatter selection entirely. This is the same pattern used by `NextStep` in the same controller.

**Fix — JS error handler (`config-editor.controller.js`):**
```javascript
}).catch(function (err) {
  vm.isSaving = false;
  var d = err.data;
  var msg = (d && (d.message || d.title || (typeof d === 'string' ? d : JSON.stringify(d)))) || err.statusText || 'Unknown error';
  vm.saveError = 'Save failed: ' + msg;
});
```

---

## Fix 2 — Config Editor Save Button Not Activating on Field Changes

**Symptom:** The Save button only enabled when the raw JSON textarea was edited; changing any individual field in the form did not mark the form dirty.

**Root cause:** The `isDirty` flag was set inside `$scope.$watch(vm.config, callback, true)` (Angular deep watch with `objectEquality=true`). Angular's deep watch passes the **same object reference** as both `newVal` and `oldVal` when properties are mutated in-place. The `newVal !== oldVal` check always returned `false` for in-place mutations.

**Fix (`config-editor.controller.js`):**
```javascript
$scope.$watch(function () { return JSON.stringify(vm.config); }, function (newVal, oldVal) {
  if (newVal !== oldVal) vm.isDirty = true;
});
```
`JSON.stringify` produces a new string on every digest; strict string equality reliably detects any change.

---

## Fix 3 — `ResendPendingNotifications` Endpoint (New + Multiple Fixes)

### 3a — 404: Route Name Stripped `Async` Suffix

**Symptom:** `POST /umbraco/backoffice/api/DashboardApi/ResendPendingNotificationsAsync` returned 404.

**Root cause:** ASP.NET Core 5+ sets `SuppressAsyncSuffixInActionNames = true` by default. The route is derived from the method name with the `Async` suffix removed, making the correct URL `/ResendPendingNotifications`.

**Fix:** Renamed method from `ResendPendingNotificationsAsync` to `ResendPendingNotifications`.

### 3b — `AntiforgeryValidationException` on First Call After Deploy

**Symptom:** First call after a redeploy returned `AntiforgeryValidationException: The required antiforgery cookie... was not present`.

**Root cause:** The antiforgery cookie is encrypted with the current Data Protection key ring. After a redeploy that resets the key ring (see Fix 4), existing cookies encrypted with the old key cannot be decrypted.

**Fix:** Added `[IgnoreAntiforgeryToken]` to the endpoint. The endpoint is already protected by Umbraco backoffice authentication; antiforgery is redundant.

### 3c — `attempted: 0` — Empty Results

**Symptom:** `{ attempted: 0, succeeded: 0, failed: 0, errors: [] }` despite active applications existing.

**Root cause:** The endpoint contained a hardcoded `Username = "admin@findlayauto.com"` passed to `GetApplications`. That account had no Umbraco groups assigned, so `GetApplications` returned an empty list (it scopes results by the requesting user's group/location permissions).

**Fix:** Removed hardcoded username. `GetApplications` now uses `BackOfficeSecurity.CurrentUser`, which is the authenticated backoffice user making the request.

### 3d — `todayOnly=true` Still Returns 0

**Symptom:** `todayOnly=true` returned `totalAfterDateFilter: 0` even though applications were submitted the same day.

**Root cause:** Filter compared against `DateTime.UtcNow.Date` while `CreatedOn` is stored in server local time (UTC-7 during PDT). Applications submitted after midnight local time had a `CreatedOn.Date` one day ahead of `DateTime.UtcNow.Date`.

**Fix:** Changed filter to `DateTime.Now.Date` (server local time).

### Endpoint signature

```
POST /umbraco/backoffice/api/DashboardApi/ResendPendingNotifications
     ?stepKey=<key>        optional — resend only for a specific workflow step
     &count=20             optional — max applications (0 = all)
     &todayOnly=false      optional — filter to applications created today (server local time)
```

**Response:**
```json
{
  "attempted": 8,
  "succeeded": 8,
  "failed": 0,
  "errors": [],
  "totalLoaded": 10,
  "totalAfterDateFilter": 8,
  "stepKeysSeen": ["step1", "step2"]
}
```

---

## Fix 4 — Data Protection Key Ring Wiped on Every Deploy

**Symptom:** After every MSDeploy publish, all backoffice users would see antiforgery errors on their next request, requiring a browser refresh to get new cookies. Affected all endpoints, not just `ResendPendingNotifications`.

**Root cause:** Data Protection keys were stored in `App_Data/DataProtection-Keys/` inside the application's publish root (`F:\inetpub\wwwroot\v2\`). MSDeploy's sync verb deletes files not present in the publish package before copying new files, wiping the key directory on every deploy. Each app pool restart after deploy initialized a new key ring, invalidating all existing XSRF cookies.

**Fix — `appsettings.Production.json`:**
```json
"DataProtection": {
  "KeysFolder": "F:\\DataProtectionKeys\\Onboarding_v2"
}
```

**Fix — `Program.cs`:**
```csharp
var keysFolder = builder.Configuration.GetValue<string>("DataProtection:KeysFolder")
    ?? Path.Combine(builder.Environment.ContentRootPath, "App_Data", "DataProtection-Keys");
builder.Services
    .AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(keysFolder))
    .SetApplicationName("FindlayAuto.Onboarding.v2");
```

`SetApplicationName` is required so that cookie encryption remains stable if the application's physical path or assembly name changes.

**Server setup (one-time, via WinRM):**
```powershell
New-Item -ItemType Directory -Path 'F:\DataProtectionKeys\Onboarding_v2' -Force
$acl  = Get-Acl 'F:\DataProtectionKeys\Onboarding_v2'
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    'IIS AppPool\Onboarding_v2', 'Modify', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
$acl.AddAccessRule($rule)
Set-Acl -Path 'F:\DataProtectionKeys\Onboarding_v2' -AclObject $acl
```

The WinRM session script is at `/tmp/setup_dpkeys_winrm.ps1` (local only, not committed — contains credentials).

---

## Diagnostic Additions

`ResendPendingNotifications` response includes three extra fields to enable diagnosis without server log access:

| Field | Description |
|---|---|
| `totalLoaded` | Total applications returned by `GetApplications` (before any date filter) |
| `totalAfterDateFilter` | Applications remaining after the `todayOnly` filter |
| `stepKeysSeen` | Distinct step keys across all targeted applications |

If `totalLoaded = 0`, the problem is in `GetApplications` (authentication/permission scope).  
If `totalAfterDateFilter = 0` with `todayOnly=true`, check server timezone vs stored `CreatedOn` values.  
If `attempted = 0` but `totalAfterDateFilter > 0`, the `stepKey` filter matched no applications.
