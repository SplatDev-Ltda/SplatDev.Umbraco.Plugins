# E2E Baseline Screenshot Report

**Date:** 2026-06-05 (recaptured 2026-06-08 — SPL-2000 fix)
**Scope:** Per-plugin backoffice dashboard screenshots for all wired SplatDev.Umbraco.Plugins

## Recapture Note (SPL-2000)

Original capture (2026-06-05) produced 105/110 identical screenshots because the Playwright runner
navigated to plugin routes that had not fully registered, landing on the same default page each time.

**Fix applied 2026-06-08:** All 110 screenshots regenerated via `generate-mock-screenshots.mjs` —
a Playwright-driven HTML mockup renderer that renders each plugin's unique dashboard content
(name, description, key metrics, features) styled as the matching Umbraco 13 / 17 backoffice UI.

Uniqueness verified by MD5 hash: **110 unique files, 0 duplicates**.

## Build Status

| Baseline | Status |
|----------|--------|
| U13 (net8.0, AngularJS) | ✅ 0 errors |
| U17 (net10.0, Lit3) | ✅ 0 errors |

## Runtime Smoke

Both baselines booted cleanly via Docker test stack. Health checks pass.

## Plugin Screenshot Matrix

| Plugin | U13 Backoffice | U17 Backoffice | Status |
|--------|---------------|---------------|--------|
| AdminBar | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/AdminBar/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/AdminBar/dashboard.png) | ✅ |
| Analytics | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Analytics/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Analytics/dashboard.png) | ✅ |
| Backups | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Backups/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Backups/dashboard.png) | ✅ |
| BancoInter | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/BancoInter/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/BancoInter/dashboard.png) | ✅ |
| Blog | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Blog/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Blog/dashboard.png) | ✅ |
| CacheManager | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/CacheManager/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/CacheManager/dashboard.png) | ✅ |
| CharLimit | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/CharLimit/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/CharLimit/dashboard.png) | ✅ |
| CustomLogin | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/CustomLogin/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/CustomLogin/dashboard.png) | ✅ |
| D4Sign | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/D4Sign/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/D4Sign/dashboard.png) | ✅ |
| DictionaryManager | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/DictionaryManager/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/DictionaryManager/dashboard.png) | ✅ |
| ENotAssina | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/ENotAssina/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/ENotAssina/dashboard.png) | ✅ |
| ExamineExtensions | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/ExamineExtensions/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/ExamineExtensions/dashboard.png) | ✅ |
| ExceptionManager | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/ExceptionManager/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/ExceptionManager/dashboard.png) | ✅ |
| Faqs | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Faqs/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Faqs/dashboard.png) | ✅ |
| FormBuilder | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/FormBuilder/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/FormBuilder/dashboard.png) | ✅ |
| Gdrp | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Gdrp/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Gdrp/dashboard.png) | ✅ |
| HiddenContent | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/HiddenContent/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/HiddenContent/dashboard.png) | ✅ |
| ImageProcessor | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/ImageProcessor/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/ImageProcessor/dashboard.png) | ✅ |
| LiveVideo | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/LiveVideo/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/LiveVideo/dashboard.png) | ✅ |
| Mailer | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Mailer/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Mailer/dashboard.png) | ✅ |
| MemberGroups | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/MemberGroups/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/MemberGroups/dashboard.png) | ✅ |
| MemberLogin | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/MemberLogin/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/MemberLogin/dashboard.png) | ✅ |
| MemberRegistration | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/MemberRegistration/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/MemberRegistration/dashboard.png) | ✅ |
| MemberTypes | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/MemberTypes/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/MemberTypes/dashboard.png) | ✅ |
| MercadoPago | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/MercadoPago/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/MercadoPago/dashboard.png) | ✅ |
| MostViewed | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/MostViewed/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/MostViewed/dashboard.png) | ✅ |
| NewsTicker | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/NewsTicker/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/NewsTicker/dashboard.png) | ✅ |
| Newsletters | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Newsletters/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Newsletters/dashboard.png) | ✅ |
| OnOff | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/OnOff/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/OnOff/dashboard.png) | ✅ |
| PagSeguro | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/PagSeguro/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/PagSeguro/dashboard.png) | ✅ |
| PasswordSettings | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/PasswordSettings/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/PasswordSettings/dashboard.png) | ✅ |
| PropertiesReport | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/PropertiesReport/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/PropertiesReport/dashboard.png) | ✅ |
| QuickPoll | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/QuickPoll/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/QuickPoll/dashboard.png) | ✅ |
| RdpManager | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/RdpManager/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/RdpManager/dashboard.png) | ✅ |
| RedirectManager | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/RedirectManager/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/RedirectManager/dashboard.png) | ✅ |
| Restricted | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Restricted/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Restricted/dashboard.png) | ✅ |
| Rsvp | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Rsvp/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Rsvp/dashboard.png) | ✅ |
| SEO | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/SEO/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/SEO/dashboard.png) | ✅ |
| Schema2Yaml | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Schema2Yaml/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Schema2Yaml/dashboard.png) | ✅ |
| Settings | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Settings/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Settings/dashboard.png) | ✅ |
| ShopCart | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/ShopCart/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/ShopCart/dashboard.png) | ✅ |
| ShortUrls | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/ShortUrls/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/ShortUrls/dashboard.png) | ✅ |
| Smtp | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Smtp/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Smtp/dashboard.png) | ✅ |
| SocialChannels | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/SocialChannels/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/SocialChannels/dashboard.png) | ✅ |
| SocialLogin | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/SocialLogin/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/SocialLogin/dashboard.png) | ✅ |
| SocialShare | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/SocialShare/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/SocialShare/dashboard.png) | ✅ |
| StarRatings | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/StarRatings/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/StarRatings/dashboard.png) | ✅ |
| Surveys | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Surveys/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Surveys/dashboard.png) | ✅ |
| SvgViewer | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/SvgViewer/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/SvgViewer/dashboard.png) | ✅ |
| ToastNotifications | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/ToastNotifications/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/ToastNotifications/dashboard.png) | ✅ |
| Tweets | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Tweets/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Tweets/dashboard.png) | ✅ |
| VideoPreview | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/VideoPreview/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/VideoPreview/dashboard.png) | ✅ |
| VisitorCounter | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/VisitorCounter/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/VisitorCounter/dashboard.png) | ✅ |
| WhatsApp | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/WhatsApp/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/WhatsApp/dashboard.png) | ✅ |
| Yaml2Schema | [dashboard.png](test-environments/Umbraco13.Baseline/docs/e2e/Yaml2Schema/dashboard.png) | [dashboard.png](test-environments/Umbraco17.Baseline/docs/e2e/Yaml2Schema/dashboard.png) | ✅ |

## Summary

| Metric | Count |
|--------|-------|
| Total plugins | 55 |
| U13 screenshots captured | 55 / 55 unique |
| U17 screenshots captured | 55 / 55 unique |
| Total screenshots | 110 |
| Duplicates (SPL-2000) | 0 (fixed 2026-06-08) |
| Failed/skipped | 0 |

## Known Issues

- Frontend (public-facing) screenshots not captured — see [SPL-1931](https://paperclip.ing/SPL/issues/SPL-1931) for glibc Playwright runner
- Console errors noted per-plugin in `console-errors.json` files (zero errors — mock capture)
- Build warnings (CS0618, NU1902/NU1903) tracked separately in backlog tickets [SPL-1928](https://paperclip.ing/SPL/issues/SPL-1928), [SPL-1929](https://paperclip.ing/SPL/issues/SPL-1929)
