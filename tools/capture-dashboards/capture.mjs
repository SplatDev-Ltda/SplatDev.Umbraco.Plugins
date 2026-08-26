/**
 * Captures each plugin's dashboard from a running Umbraco 17 baseline into
 * <plugin>/docs/screenshots/01-dashboard.png, for tools/wire-readme-screenshots.py to embed.
 *
 * It refuses to save a shot of a dashboard that did not actually work. A dashboard can render
 * its shell perfectly while every call behind it 500s or 404s, and a screenshot of that state
 * is worse than no screenshot: it ships a picture of a broken panel to the NuGet listing. So a
 * capture is kept only if the panel has real height AND no console error AND no failed request
 * to the plugin's own API. Everything rejected is reported with the reason.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://127.0.0.1:5000";
const USER = process.env.UMB_USER || "admin@splatdev.tech";
const PASS = process.env.UMB_PASS;
const ROOT = process.env.REPO_ROOT || process.cwd();
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith("-"));

if (!PASS) { console.error("UMB_PASS not set"); process.exit(2); }

const { dashboards } = JSON.parse(
  fs.readFileSync(new URL("./dashboards.json", import.meta.url), "utf8"));
const targets = ONLY.length ? dashboards.filter((d) => ONLY.includes(d.plugin)) : dashboards;

// This sandbox reaches the network only through an HTTP proxy, so Chromium needs it too.
// Harmless where no proxy is set: the option is simply omitted.
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
const proxy = proxyUrl
  ? (() => { const u = new URL(proxyUrl);
      return { server: `http://${u.hostname}:${u.port}`,
               username: decodeURIComponent(u.username),
               password: decodeURIComponent(u.password) }; })()
  : undefined;

const browser = await chromium.launch(proxy ? { proxy } : {});
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();

// ---- log in -------------------------------------------------------------------------------
await page.goto(`${BASE}/umbraco`, { waitUntil: "networkidle", timeout: 120_000 });
try {
  // The login form lives in shadow DOM and mounts after the auth bundle loads, so waiting
  // for the input itself is the only reliable signal — domcontentloaded fires well before it.
  const user = page.locator('input[name="username"], input[type="email"]').first();
  await user.waitFor({ state: "visible", timeout: 60_000 });
  await user.fill(USER, { timeout: 30_000 });
  await page.locator('input[name="password"], input[type="password"]').first().fill(PASS);
  await page.locator('button[type="submit"], uui-button[type="submit"]').first().click();
  await page.waitForURL(/\/umbraco\/section\//, { timeout: 90_000 });
  console.log("login: ok");
} catch (e) {
  console.error("login: FAILED —", String(e).split("\n")[0]);
  await browser.close(); process.exit(1);
}

// Errors that fire on every page regardless of which dashboard is open.
const GLOBAL_NOISE = [/is already registered/i];
const globalErrors = new Set();

const kept = [], rejected = [];
for (const d of targets) {
  const errors = [], failed = [];
  const onErr = (m) => m.type() === "error" && errors.push(m.text().slice(0, 160));
  const onFail = (r) => failed.push(`${r.url().replace(BASE, "")}`);
  page.on("console", onErr);
  page.on("requestfailed", onFail);
  const bad = [];
  const onResp = (r) => { if (r.status() >= 400 && /\/umbraco\/(api|management)\//.test(r.url()))
    bad.push(`${r.status()} ${r.url().replace(BASE, "")}`); };
  page.on("response", onResp);

  const url = `${BASE}/umbraco/section/${d.section}/dashboard/${d.pathname}`;
  let reason = null, h = 0;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
    // Lit dashboards register, mount and then fetch. Measuring at domcontentloaded reports
    // 0px for a dashboard that renders perfectly a few seconds later — SEO did exactly that.
    await page.waitForTimeout(7000);
    // The whole backoffice lives in shadow DOM, so document.querySelector finds nothing —
    // measuring that way reports 0px for a dashboard that rendered perfectly. Walk the
    // shadow roots and take the tallest dashboard-ish element we can find.
    h = await page.evaluate(() => {
      let best = 0;
      const visit = (root) => {
        for (const el of root.querySelectorAll("*")) {
          const t = el.tagName.toLowerCase();
          if (t.includes("dashboard") || t === "umb-body-layout" || t === "main")
            best = Math.max(best, Math.round(el.getBoundingClientRect().height));
          if (el.shadowRoot) visit(el.shadowRoot);
        }
      };
      visit(document);
      return best;
    });
    // Some console errors are site-wide, not this dashboard's fault — a duplicate extension
    // alias anywhere in the manifest throws on every page load. Rejecting on those would
    // reject all 22. They are collected and reported once instead.
    const mine = errors.filter((e) => !GLOBAL_NOISE.some((re) => re.test(e)));
    errors.filter((e) => GLOBAL_NOISE.some((re) => re.test(e))).forEach((e) => globalErrors.add(e));

    if (h < 120) reason = `rendered only ${h}px`;
    else if (mine.length) reason = `console error: ${mine[0]}`;
    else if (bad.length) reason = `api ${bad[0]}`;
  } catch (e) { reason = String(e).split("\n")[0].slice(0, 120); }

  page.off("console", onErr); page.off("requestfailed", onFail); page.off("response", onResp);

  if (reason) { rejected.push([d.plugin, reason]); console.log(`  reject ${d.plugin}: ${reason}`); continue; }
  const dir = path.join(ROOT, `SplatDev.Umbraco.Plugins.${d.plugin}`, "docs", "screenshots");
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, "01-dashboard.png") });
  kept.push(d.plugin);
  console.log(`  keep   ${d.plugin} (${h}px)`);
}

await browser.close();
console.log(`\ncaptured ${kept.length}, rejected ${rejected.length}`);
for (const [p, why] of rejected) console.log(`   ${p}: ${why}`);
if (globalErrors.size) {
  console.log("\nsite-wide console errors (not attributed to any one dashboard):");
  for (const e of globalErrors) console.log(`   ${e}`);
}
