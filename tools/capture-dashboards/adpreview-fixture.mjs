/**
 * Builds the content AdPreview needs before it can be photographed, then screenshots it.
 *
 * A property editor has nothing to show until something uses it, so capture.mjs cannot reach
 * one the way it reaches a dashboard. This creates the three things Umbraco needs - a data
 * type bound to the editor, a document type with a property of that type, and a document -
 * through the Management API, fills the property with a sample ad, and photographs the
 * result.
 *
 * It doubles as the check that the editor is registered at all. Before AdPreviewDataEditor
 * existed the first call answered 404 PropertyEditorNotFound, because the alias was declared
 * only in umbraco-package.json and Umbraco resolves editors from the server-side IDataEditor
 * collection.
 *
 * Run against a disposable install - it writes content:
 *
 *   BASE_URL=http://127.0.0.1:5000 UMB_USER=... UMB_PASS=... OUT=shot.png \
 *     node tools/capture-dashboards/adpreview-fixture.mjs
 */
import { chromium } from "playwright";
const B = process.env.BASE_URL || "http://127.0.0.1:5000";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
await p.goto(`${B}/umbraco`, { waitUntil: "networkidle", timeout: 120000 });
const un = p.locator('input[name="username"], input[type="email"]').first();
await un.waitFor({ state: "visible", timeout: 60000 });
await un.fill(process.env.UMB_USER);
await p.locator('input[type="password"]').first().fill(process.env.UMB_PASS);
await p.locator('button[type="submit"], uui-button[type="submit"]').first().click();
await p.waitForURL(/\/umbraco\/section\//, { timeout: 90000 });
console.log("   login ok");

const out = await p.evaluate(async () => {
  const H = { "Content-Type": "application/json", Authorization: "Bearer [redacted]" };
  const api = async (path, body) => {
    const r = await fetch(`/umbraco/management/api/v1/${path}`, {
      method: "POST", credentials: "include", headers: H, body: JSON.stringify(body) });
    return { status: r.status, text: (await r.text()).slice(0, 220) };
  };
  const uuid = () => crypto.randomUUID();
  const log = [];
  const dtId = uuid();
  log.push(["data-type", await api("data-type", { id: dtId, name: "Ad Preview (showcase)",
    editorAlias: "AdPreview", editorUiAlias: "SplatDev.AdPreview.PropertyEditorUi", values: [] })]);
  const dtypeId = uuid(), groupId = uuid();
  log.push(["document-type", await api("document-type", { id: dtypeId, alias: "adPreviewShowcase",
    name: "Ad Preview Showcase", icon: "icon-image", allowedAsRoot: true, variesByCulture: false,
    variesBySegment: false, isElement: false, allowedTemplates: [],
    containers: [{ id: groupId, name: "Content", type: "Group", sortOrder: 0 }],
    properties: [{ id: uuid(), container: { id: groupId }, sortOrder: 0, alias: "banner",
      name: "Banner", dataType: { id: dtId }, variesByCulture: false, variesBySegment: false,
      validation: { mandatory: false, mandatoryMessage: null, regEx: null, regExMessage: null },
      appearance: { labelOnTop: false } }],
    cleanup: { preventCleanup: false, keepAllVersionsNewerThanDays: null, keepLatestVersionPerDayForDays: null },
    allowedDocumentTypes: [], compositions: [] })]);
  const docId = uuid();
  log.push(["document", await api("document", { id: docId, documentType: { id: dtypeId },
    template: null, values: [{ culture: null, segment: null, alias: "banner", value: { img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%238056D1'/><stop offset='1' stop-color='%233b1e6e'/></linearGradient></defs><rect width='600' height='200' fill='url(%23g)' rx='8'/><text x='40' y='95' fill='white' font-family='sans-serif' font-size='34' font-weight='700'>Summer Sale</text><text x='40' y='135' fill='%23d9ccf5' font-family='sans-serif' font-size='20'>30%25 off every plan</text></svg>", title: "Summer Sale", description: "30% off every plan until the end of August.", url: "https://example.com/summer", tooltip: "Summer campaign banner", referrer: "", css: "ad-bordered", overlay: false } }], variants: [{ culture: null, segment: null, name: "Ad Preview Showcase" }] })]);
  return { docId, log };
});
for (const [what, r] of out.log) console.log(`   ${what}: ${r.status} ${r.status >= 400 ? r.text : ""}`);
if (out.log.every(([, r]) => r.status < 400)) {
  await p.goto(`${B}/umbraco/section/content/workspace/document/edit/${out.docId}`,
               { waitUntil: "networkidle", timeout: 90000 });
  await p.waitForTimeout(9000);
  await p.screenshot({ path: process.env.OUT });
  console.log("   screenshot saved");
}
await b.close();
