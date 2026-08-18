---
name: mobile-device-testing
description: Use when testing a mobile app build on real devices, validating an APK / iOS build, or running smoke/regression tests on the companion mobile app. Covers the paperclip-device-farm MCP (AWS Device Farm) — upload a build, run it on a device pool, and read pass/fail results. Triggers: device farm, real-device testing, test the APK, mobile QA, run on devices, device pool, crash on device.
metadata:
  type: reference
---

# Mobile device testing (AWS Device Farm)

When the company has AWS Device Farm connected, the `paperclip-device-farm` MCP
is injected into your run. Use it to run the mobile app (e.g. the published
Android APK) on **real cloud devices** and read results — the complement to local
unit/E2E tests.

If the tools aren't present, the company hasn't connected Device Farm yet — say
so; an operator wires AWS credentials in **Settings → Device Lab**.

## Tools

- `device_farm_status` — region + selected project. **Call first.**
- `device_farm_list_projects` — find a project ARN (operator usually pre-selects one).
- `device_farm_list_device_pools` — the device sets a run can target.
- `device_farm_upload_app` — upload a build by **download URL**. For the companion
  app, that's the hosted APK: `https://demo.splatdev.tech/paperclip-android.apk`.
  Returns the **app upload ARN**.
- `device_farm_schedule_run` — run the uploaded app on a device pool. Defaults to a
  `BUILTIN_FUZZ` smoke test (no test package needed). Returns the **run ARN**.
- `device_farm_get_run` — poll a run's status + pass/fail counters.
- `device_farm_list_runs` — recent runs.

## Standard flow

1. `device_farm_status` → confirm a project is set (else `device_farm_list_projects`
   and ask the operator to select one in Device Lab).
2. `device_farm_list_device_pools` → pick a `device_pool_arn` (a built-in
   "Top Devices" pool is a good default).
3. `device_farm_upload_app` with the build URL → get the `app_arn`.
4. `device_farm_schedule_run` with `app_arn` + `device_pool_arn` → get the `run_arn`.
5. Poll `device_farm_get_run` until `status` is `COMPLETED`; report the `result`
   (PASSED/FAILED/ERRORED) and the counters (passed/failed/errored/total). On
   failure, summarize which devices/tests failed and any crash artifacts.

## Notes & discipline

- Device Farm's control plane is **us-west-2 only**; a project lives there.
- Runs consume **device minutes** (real cost) — don't spam runs; one run per build
  change, on a sensible pool. Reuse an existing app upload across runs when the
  build hasn't changed.
- A `BUILTIN_FUZZ` run is a quick crash/smoke check; for real coverage, an operator
  provides an Appium/Espresso test package ARN.
- If a tool returns an error, report it — don't retry blindly.
