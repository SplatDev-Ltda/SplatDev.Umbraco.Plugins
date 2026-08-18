---
name: nopcommerce-plugin-testing
description: Write or review nopCommerce plugin tests — xUnit unit/unhappy-path tests with mocked HTTP, and live sandbox integration tests that exercise a plugin's real code against a real sandbox API. Use whenever scaffolding a `Tests/SplatDev.Nop.Plugin.*.Tests` project, adding `[Trait("Category","Integration")]` tests, reviewing a plugin PR's test coverage, or deciding whether a "tests pass" claim is real proof. Trigger on "nopCommerce test project", "MockHttp", "live integration test", "sandbox credentials", "soft-skip", "Category=Integration", or any `SplatDev.Nop.Plugin.*.Tests` path.
---

# nopCommerce Plugin Testing

Companion to the **`nopcommerce`** skill (plugin architecture, build, and Gate-1) and
**`nopcommerce-marketplace-deploy`** (packaging and submission). This skill is specifically about
**writing and reviewing plugin tests** — the two-tier discipline ported from the SplatDev fleet
repo (`SplatDev.NopCommerce.Plugins`): mocked unit tests that run in CI on every PR, and live
sandbox integration tests that don't run in CI but have repeatedly caught real production bugs
that mocks cannot.

---

## Tier 1 — Unit tests (xUnit, mocked, CI-required)

**One test project per plugin**, at `Tests/<PluginProjectName>.Tests/`, sibling to the other
`Tests/*.Tests` directories — never a shared/aggregate test project spanning multiple plugins.
The project (and folder) name is the plugin project name with a `.Tests` suffix, e.g. plugin
`SplatDev.Nop.Plugin.Payments.PagBank` → `Tests/SplatDev.Nop.Plugin.Payments.PagBank.Tests/`. The
canonical, already-hardened reference implementation is
`Tests/SplatDev.Nop.Plugin.Payments.PagBank.Tests/` — when in doubt, diff against it.

### Pinned package versions (do not float — match exactly)

| Package | Version |
| --- | --- |
| Microsoft.NET.Test.Sdk | 17.12.0 |
| xunit | 2.9.2 |
| xunit.runner.visualstudio | 2.8.2 |
| Moq | 4.20.72 |
| RichardSzalay.MockHttp | 7.0.0 |

Canonical `*.Tests.csproj` (copy verbatim, only replace `<PluginProject>`):

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.12.0" />
    <PackageReference Include="xunit" Version="2.9.2" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.8.2" />
    <PackageReference Include="Moq" Version="4.20.72" />
    <PackageReference Include="RichardSzalay.MockHttp" Version="7.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\Plugins\<PluginProject>\<PluginProject>.csproj" />
  </ItemGroup>

</Project>
```

The `ProjectReference` points at exactly **one** plugin project — do not reference multiple
plugins from a single test project, and do not add one plugin's tests into another plugin's test
project.

### Mock all external HTTP with RichardSzalay.MockHttp

Never hit the network or a live DB in this tier. Stub the plugin's `HttpClient` and inject it the
same way the plugin's real code obtains it (constructor injection, `IHttpClientFactory`, etc.).
Cover at minimum three unhappy-path shapes per external endpoint the plugin calls:

```csharp
using System.Net;
using RichardSzalay.MockHttp;
using Xunit;

public class GatewayClientUnhappyPathTests
{
    // 1. Canned non-2xx response — cover at least one 4xx and one 5xx per endpoint.
    [Fact]
    public async Task Charge_NonSuccessStatusCode_ReturnsTypedFailure()
    {
        var mockHttp = new MockHttpMessageHandler();
        mockHttp.When(HttpMethod.Post, "https://api.gateway.example/v1/charges")
            .Respond(HttpStatusCode.BadRequest, "application/json", "{\"error\":\"invalid_request\"}");

        var client = new GatewayClient(mockHttp.ToHttpClient());
        var result = await client.ChargeAsync(new ChargeRequest());

        Assert.False(result.Success);
        Assert.NotNull(result.ErrorMessage);
    }

    // 2. Timeout — what HttpClient actually throws on cancellation/timeout.
    [Fact]
    public async Task Charge_Timeout_ReturnsTypedFailure()
    {
        var mockHttp = new MockHttpMessageHandler();
        mockHttp.When(HttpMethod.Post, "https://api.gateway.example/v1/charges")
            .Throw(new TaskCanceledException("The request timed out."));

        var client = new GatewayClient(mockHttp.ToHttpClient());
        var result = await client.ChargeAsync(new ChargeRequest());

        Assert.False(result.Success);
    }

    // 3. Malformed body — 2xx status, unparseable/garbage payload.
    [Fact]
    public async Task Charge_MalformedResponseBody_ReturnsTypedFailure()
    {
        var mockHttp = new MockHttpMessageHandler();
        mockHttp.When(HttpMethod.Post, "https://api.gateway.example/v1/charges")
            .Respond("application/json", "{ this is not valid json ");

        var client = new GatewayClient(mockHttp.ToHttpClient());
        var result = await client.ChargeAsync(new ChargeRequest());

        Assert.False(result.Success);
    }
}
```

Every unhappy-path test asserts a **typed failure result** — never assert on an unhandled
exception escaping the method under test. Also cover pure logic (parsers, signature/HMAC
validation, rate/tax tables, mapping code), missing/invalid config, declined payment, empty rate
quote, malformed webhook, and duplicate/replayed callback where applicable.

### Stale-duplicate cleanup

A prior namespace rename (`Pagamentos` → `Payments`) left orphaned test projects behind
(`Tests/SplatDev.Nop.Plugin.Pagamentos.*.Tests/`) and a mixed aggregate project
(`Tests/SplatDev.Plugin.Tests/`) spanning multiple categories. Neither is additional coverage —
when touching a plugin that still has one of these, delete the stale project (from `Tests/` and
the solution file), migrate any coverage worth keeping into the canonical
`Tests/<PluginProjectName>.Tests/` project, and remove the plugin's section from the aggregate
project. Do not extend either stale form further.

### Running (CI-required tier)

```sh
dotnet test NopCommerce.slnx --filter "Category!=Integration"
```

---

## Tier 2 — Live sandbox integration tests (the discipline that caught real prod bugs)

A single mocked-HTTP unit tier proves the plugin handles the responses you told it to expect. It
cannot catch a wrong API host, a stray path segment, a webhook nobody bothered to sign, or a
provider that silently requires a field the plugin never sends. The SplatDev fleet's rollout of
mandatory live sandbox integration tests found real, previously-shipped defects in plugin after
plugin — this is why the tier exists and why it is not optional for any plugin that calls an
external API.

### Shape of the test

- `[Trait("Category", "Integration")]` on the test class.
- One test class per plugin, at `Tests/<PluginProjectName>.Tests/<Plugin>LiveApiIntegrationTests.cs`.
- Constructs the **real** plugin service (e.g. `CorreiosShippingService`) with **no mocked HTTP** —
  it calls the actual sandbox/production API, exercising the exact code path checkout uses.
- Reads all credentials/settings from **environment variables only** — never hardcoded, never
  committed. Sandbox creds are loaded into the project's scoped env vars (see the `paperclip`
  skill's project-sandbox-env-vars mechanism) or an operator-supplied local credentials file; the
  test itself only ever calls `Environment.GetEnvironmentVariable(...)`.
- **Soft-skips green when a credential is absent** — never fails a credential-less run. The
  reference implementation (`CorreiosLiveApiIntegrationTests`) does this with a plain guard-and-
  return, because `Xunit.SkippableFact` was not available in that environment:

  ```csharp
  private static bool CredentialsPresent =>
      !string.IsNullOrWhiteSpace(UserName) &&
      !string.IsNullOrWhiteSpace(ApiKey) &&
      !string.IsNullOrWhiteSpace(OriginZip);

  [Fact]
  public async Task LiveApi_GetShippingOptionsAsync_ReturnsAtLeastOnePricedShippingOption()
  {
      if (!CredentialsPresent)
      {
          _output.WriteLine(
              "SKIPPED (soft): CORREIOS_USERNAME / CORREIOS_APIKEY / CORREIOS_CEP_ORIGEM are not all " +
              "set. This live-integration test is opt-in — see INTEGRATION-README.md for the full " +
              "env-var contract and the exact command to run it against the real Correios API.");
          return;
      }
      // ... construct the real service and call it for real ...
  }
  ```

  This reports as **Passed**, not Failed or Skipped, which keeps CI and a contributor's
  credential-less machine green without ever gating on secrets. If `Xunit.SkippableFact` is
  available in your environment, `[SkippableFact]` + `Skip.IfNot(CredentialsPresent, "...")` is a
  drop-in improvement over the manual guard — same soft-skip semantics, real "Skipped" status.
- **Excluded from CI** via the same filter as everywhere else:
  ```sh
  dotnet test Tests/<Plugin>.Tests --filter Category=Integration
  ```
  is never run by CI; CI only runs `--filter "Category!=Integration"`. This tier is opt-in,
  operator-or-runner-run — an operator (or a Paperclip agent with the right sandbox env vars)
  invokes it deliberately, on demand, e.g. after a dependency bump or a provider-side change.
- Log everything relevant to the xUnit test output (`ITestOutputHelper`) — effective base URL,
  auth scope, HTTP status, captured plugin log lines — so a failure or a "why did this skip" is
  self-explanatory from the test run output alone.
- **N/A only** for plugins with no external API to hit (flat-rate/manual shipping, purely
  client-side widgets) — mark those `n/a` in the status tracker rather than writing a vacuous test.

### Why it matters — real bug-classes this tier caught

Treat this as a **review checklist** for any nopCommerce plugin that calls an external API. Every
line below is a real defect the live sandbox tier found in already-"hardened", mock-tested,
Gate-1-passing plugins — mocks could not have caught any of them because the mock was written to
return what the developer already believed the API would return:

- **Unauthenticated / forgeable webhook.** BancoInter's Pix webhook accepted callbacks with no
  signature check at all (fixed to constant-time key compare); PayPalPix's webhook verifier
  accepted a forged signature (the real PayPal OAuth verify call was not actually being made).
  Review: does the webhook handler cryptographically verify the sender before trusting the
  payload, and is that check exercised by a live call to the real verify endpoint, not just a
  mocked "always true"?
- **Fail-open webhook / declined transaction marked Paid.** PagBank's webhook handler failed open
  on an unexpected shape and a **declined card was marked Paid** — the single most severe finding
  across the whole payments hardening pass. Review: does every webhook/status-mapping branch have
  an explicit, tested mapping for "declined"/"failed", and does the unhandled-shape branch reject
  (fail closed), never default to success?
- **Wrong API host / stray path segment → prod 404.** GetNet's OAuth token URL had a spurious
  `/v1` segment (`{BaseUrl}/v1/auth/oauth/v2/token`); the correct URL (no `/v1`) returned 200. The
  bug meant GetNet auth was broken in **both sandbox and production** — the plugin was
  non-functional at checkout despite passing every mocked unit test. Review: has the exact base
  URL + path actually been hit live, not just asserted against a `MockHttp.When(...)` string the
  developer chose?
- **Missing required provider fields.** Pagar.me's `CreatePixOrderAsync` omitted the customer
  phone, so Pix charges came back `status:failed`; PayPalPix's Pix order was missing `phone`,
  `country_code`, `currency_code`, and a nested `tax_info` object (the plugin sent a flat
  `tax_id`), returning `400 MISSING_REQUIRED_PARAMETER`. Review: for every payment method a
  plugin claims to support (especially Pix/CPF-CNPJ-based methods), has a live sandbox charge of
  *that specific method* actually been attempted and returned success, not just "the endpoint
  responded"?
- **The IP-allowlist gotcha.** Some sandbox/homologação APIs (Correios' CWS being the concrete
  example) allow-list the calling server's IP. A live test run from an unlisted IP gets a
  `401`/`403` that looks identical to a real credential or plugin defect but is neither — it is an
  environment mismatch. When a live test fails this way: **soft-skip it and note the IP-allowlist
  possibility explicitly in the test output / failure message** rather than treating the failure
  as proof the plugin is broken; definitive proof requires running from the store's allow-listed
  server. Do not let this gotcha become an excuse to skip real failures, though — from an
  allow-listed run, a failure *is* a real bug, full stop. Correios itself is the positive
  counter-example: its actual, definitive live run (from an allow-listed host) came back **GREEN**
  — the plugin's host/auth flow worked as written and returned a real HTTP 200 price — so the
  allowlist gotcha did not mask a code defect there. The one non-obvious finding was a
  **credential-mapping** gotcha, not a plugin bug: `CORREIOS_USERNAME` must be the account's CNPJ
  (the numeric document id), not the Meu Correios e-mail — the token endpoint returns 401 for the
  e-mail and 201 for the CNPJ.

### INTEGRATION-README.md companion

Each live-tested plugin's test project also carries an `INTEGRATION-README.md` documenting: what
the test proves and what it does not (a regression-confirmation test, not a bug hunt), the full
env-var contract with what each maps to in the plugin's settings, the verified-working run
command, where the underlying sandbox credentials live (never inline the credential itself), and
a troubleshooting section for the auth failures the plugin is known to be sensitive to. Copy this
structure for every new live-tested plugin — see
`Tests/SplatDev.Nop.Plugin.Shipping.Correios.Tests/INTEGRATION-README.md` as the reference.

---

## Anti-fabrication — what counts as proof

Real proof of "tests pass" is the **actual test-run output** (a `dotnet test` console log, a CI
check-run link, or — for a live sandbox run — the captured request/response and the resulting
transaction/listing) — never a claim with no attached output, and never a screenshot of a form
that was never actually submitted. A "passed" claim with no log is rejected in review, the same
rule the `gate2-marketplace-submission` runbook applies to marketplace-listing proof (a blank-form
screenshot is not evidence a listing was created; a test-run summary with 0 assertions run is not
evidence the tests exist). When reporting a live integration test result, always include: the env
vars that were present (names only, never values), whether the test executed for real or
soft-skipped, and — on execution — the actual HTTP status / response summary from the captured
log output, exactly as the Correios test does above.

---

## Cross-references

- **`nopcommerce`** — plugin architecture, `BasePlugin`, settings, controllers, DI, and this
  repo's build/Gate-1 flow (`scripts/verify-plugin-gate1.sh`, the two `dotnet test` filter
  invocations, PII masking, Definition of Done). Read that skill first for anything outside
  testing.
- **`nopcommerce-marketplace-deploy`** — packaging the built plugin (ZIPs, logos, screenshots) and
  submitting/updating a listing on the nopCommerce.com marketplace. Test-run output from this
  skill is part of that runbook's evidence trail but this skill does not cover packaging or
  submission mechanics.
