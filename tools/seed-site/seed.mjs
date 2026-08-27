/**
 * Seeds a disposable Umbraco install with a small but real website, members and users.
 *
 * An empty baseline limits every check made against it: the SEO dashboard reports one page,
 * the analytics plugins have nothing to count, and the member-notification rules cannot fire
 * because there is nobody to sign in. This builds enough of a site that those become
 * testable - document types with templates, a published content tree, member groups with
 * members in them, and a couple of backoffice users.
 *
 * Everything is created through the Management API, so it exercises the same paths the
 * backoffice does rather than writing to the database behind Umbraco's back.
 *
 * It is idempotent by name: anything already present is left alone and reported as skipped,
 * so a second run after a partial failure finishes the job instead of duplicating it.
 *
 * WRITES CONTENT - run it against a disposable install only.
 *
 *   BASE_URL=http://127.0.0.1:5000 UMB_USER=... UMB_PASS=... node tools/seed-site/seed.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:5000";
const MEMBER_PASSWORD = process.env.SEED_MEMBER_PASSWORD || "SeedMember123!";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

await page.goto(`${BASE}/umbraco`, { waitUntil: "networkidle", timeout: 120_000 });
const user = page.locator('input[name="username"], input[type="email"]').first();
await user.waitFor({ state: "visible", timeout: 60_000 });
await user.fill(process.env.UMB_USER);
await page.locator('input[type="password"]').first().fill(process.env.UMB_PASS);
await page.locator('button[type="submit"], uui-button[type="submit"]').first().click();
await page.waitForURL(/\/umbraco\/section\//, { timeout: 90_000 });
console.log("login: ok");

const report = await page.evaluate(async ({ memberPassword }) => {
  const H = { "Content-Type": "application/json", Authorization: "Bearer [redacted]" };
  const log = [];
  const uuid = () => crypto.randomUUID();

  const call = async (method, path, body) => {
    const res = await fetch(`/umbraco/management/api/v1/${path}`, {
      method, credentials: "include", headers: H,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
    return { status: res.status, json, text: text.slice(0, 200) };
  };

  /**
   * Finds something already created by an earlier run.
   *
   * Re-running has to finish the job rather than duplicate it or stop at the first "already
   * exists", so every create falls back to a lookup by the name or alias it just tried.
   */
  const findByAlias = async (kind, alias) => {
    const r = await call("GET", `item/${kind}/search?query=${encodeURIComponent(alias)}&skip=0&take=20`);
    const items = r.json?.items ?? [];
    return items.find((i) => i.alias === alias || i.name === alias)?.id ?? null;
  };

  const findInTree = async (kind, name) => {
    const r = await call("GET", `tree/${kind}/root?skip=0&take=100`);
    const items = r.json?.items ?? [];
    return items.find((i) => i.name === name || i.alias === name)?.id ?? null;
  };

  const note = (what, r) => {
    log.push(`${r.status < 400 ? "ok   " : "FAIL "} ${what}${r.status >= 400 ? ` — ${r.status} ${r.text}` : ""}`);
    return r.status < 400;
  };

  // ---- templates -----------------------------------------------------------------------
  const templates = {};
  const templateSpecs = [
    ["Seed Home", "seedHome", '@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage\n@{ Layout = null; }\n<!doctype html>\n<html><head><title>@Model.Value("title")</title>\n<meta name="description" content="@Model.Value("metaDescription")" /></head>\n<body><h1>@Model.Value("title")</h1><div>@Model.Value("bodyText")</div></body></html>'],
    ["Seed Content Page", "seedContentPage", '@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage\n@{ Layout = null; }\n<!doctype html>\n<html><head><title>@Model.Value("title")</title>\n<meta name="description" content="@Model.Value("metaDescription")" /></head>\n<body><h1>@Model.Value("title")</h1><div>@Model.Value("bodyText")</div></body></html>'],
    ["Seed Blog Post", "seedBlogPost", '@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage\n@{ Layout = null; }\n<!doctype html>\n<html><head><title>@Model.Value("title")</title>\n<meta name="description" content="@Model.Value("metaDescription")" /></head>\n<body><article><h1>@Model.Value("title")</h1><div>@Model.Value("bodyText")</div></article></body></html>'],
  ];
  for (const [name, alias, content] of templateSpecs) {
    const id = uuid();
    const r = await call("POST", "template", { id, name, alias, content });
    if (r.status < 400) {
      templates[alias] = id;
      log.push(`ok    template ${alias}`);
    } else {
      const existing = await findInTree("template", name);
      if (existing) { templates[alias] = existing; log.push(`reuse template ${alias}`); }
      else note(`template ${alias}`, r);
    }
  }

  // ---- data type for the text properties ------------------------------------------------
  // Textarea rather than rich text: it needs no configuration, and what matters here is that
  // the pages carry real text for the SEO and analytics plugins to read.
  const textareaId = uuid();
  note("data type Seed Textarea", await call("POST", "data-type", {
    id: textareaId, name: "Seed Textarea",
    editorAlias: "Umbraco.TextArea", editorUiAlias: "Umb.PropertyEditorUi.TextArea", values: [],
  }));

  const textId = uuid();
  note("data type Seed Text", await call("POST", "data-type", {
    id: textId, name: "Seed Text",
    editorAlias: "Umbraco.TextBox", editorUiAlias: "Umb.PropertyEditorUi.TextBox", values: [],
  }));

  const props = (groupId) => [
    { id: uuid(), container: { id: groupId }, sortOrder: 0, alias: "title", name: "Title",
      dataType: { id: textId }, variesByCulture: false, variesBySegment: false,
      validation: { mandatory: false, mandatoryMessage: null, regEx: null, regExMessage: null },
      appearance: { labelOnTop: false } },
    { id: uuid(), container: { id: groupId }, sortOrder: 1, alias: "metaDescription", name: "Meta description",
      dataType: { id: textId }, variesByCulture: false, variesBySegment: false,
      validation: { mandatory: false, mandatoryMessage: null, regEx: null, regExMessage: null },
      appearance: { labelOnTop: false } },
    { id: uuid(), container: { id: groupId }, sortOrder: 2, alias: "bodyText", name: "Body text",
      dataType: { id: textareaId }, variesByCulture: false, variesBySegment: false,
      validation: { mandatory: false, mandatoryMessage: null, regEx: null, regExMessage: null },
      appearance: { labelOnTop: false } },
  ];

  // ---- document types -------------------------------------------------------------------
  const docTypes = {};
  const typeSpecs = [
    ["Seed Home", "seedHome", "icon-home", true, "seedHome"],
    ["Seed Content Page", "seedContentPage", "icon-document", false, "seedContentPage"],
    ["Seed Blog Post", "seedBlogPost", "icon-article", false, "seedBlogPost"],
  ];
  for (const [name, alias, icon, root, templateAlias] of typeSpecs) {
    const id = uuid(), groupId = uuid();
    const templateId = templates[templateAlias];
    const r = await call("POST", "document-type", {
      id, alias, name, icon, allowedAsRoot: root,
      variesByCulture: false, variesBySegment: false, isElement: false,
      allowedTemplates: templateId ? [{ id: templateId }] : [],
      defaultTemplate: templateId ? { id: templateId } : null,
      containers: [{ id: groupId, name: "Content", type: "Group", sortOrder: 0 }],
      properties: props(groupId),
      cleanup: { preventCleanup: false, keepAllVersionsNewerThanDays: null, keepLatestVersionPerDayForDays: null },
      allowedDocumentTypes: [], compositions: [],
    });
    if (r.status < 400) {
      docTypes[alias] = { id, templateId };
      log.push(`ok    document type ${alias}`);
    } else {
      const existing = await findInTree("document-type", name);
      if (existing) { docTypes[alias] = { id: existing, templateId }; log.push(`reuse document type ${alias}`); }
      else note(`document type ${alias}`, r);
    }
  }

  // Each parent must name what may sit beneath it. Blog is a content page, so content pages
  // have to allow blog posts too - otherwise every post is refused as "Operation not
  // permitted", which reads like an authorisation problem rather than a schema one.
  const allowChildren = async (parentAlias, childAliases) => {
    const parent = docTypes[parentAlias];
    if (!parent) return;
    const current = await call("GET", `document-type/${parent.id}`);
    if (!current.json) return;
    const body = current.json;
    body.allowedDocumentTypes = childAliases
      .map((a, i) => ({ documentType: { id: docTypes[a]?.id }, sortOrder: i }))
      .filter((a) => a.documentType.id);
    note(`${parentAlias} allows ${childAliases.join(", ")}`, await call("PUT", `document-type/${parent.id}`, body));
  };

  /**
   * Makes sure a reused document type actually points at our template.
   *
   * A type created by an earlier run whose template creation failed carries an empty
   * allowedTemplates, and content creation then fails with "Template not allowed" - which
   * reads as a permission problem rather than the missing association it is.
   */
  const ensureTemplate = async (alias) => {
    const t = docTypes[alias];
    if (!t?.templateId) return;
    const current = await call("GET", `document-type/${t.id}`);
    if (!current.json) return;
    const body = current.json;
    if ((body.allowedTemplates ?? []).some((x) => x.id === t.templateId)) return;
    body.allowedTemplates = [{ id: t.templateId }];
    body.defaultTemplate = { id: t.templateId };
    note(`${alias} uses its template`, await call("PUT", `document-type/${t.id}`, body));
  };

  for (const alias of ["seedHome", "seedContentPage", "seedBlogPost"]) {
    await ensureTemplate(alias);
  }

  await allowChildren("seedHome", ["seedContentPage", "seedBlogPost"]);
  await allowChildren("seedContentPage", ["seedBlogPost", "seedContentPage"]);

  // ---- content --------------------------------------------------------------------------
  const value = (alias, v) => ({ culture: null, segment: null, alias, value: v });
  const makeDoc = async (label, typeAlias, name, title, meta, body, parentId) => {
    const t = docTypes[typeAlias];
    if (!t) return null;
    const siblings = parentId
      ? await call("GET", `tree/document/children?parentId=${parentId}&skip=0&take=100`)
      : await call("GET", "tree/document/root?skip=0&take=100");
    const already = (siblings.json?.items ?? []).find((i) => i.variants?.[0]?.name === name || i.name === name);
    if (already) { log.push(`reuse content ${label}`); return already.id; }

    const id = uuid();
    const r = await call("POST", "document", {
      id, documentType: { id: t.id },
      template: t.templateId ? { id: t.templateId } : null,
      parent: parentId ? { id: parentId } : null,
      values: [value("title", title), value("metaDescription", meta), value("bodyText", body)],
      variants: [{ culture: null, segment: null, name }],
    });
    if (!note(`content ${label}`, r)) return null;
    note(`publish ${label}`, await call("PUT", `document/${id}/publish`, { publishSchedules: [{ culture: null }] }));
    return id;
  };

  const homeId = await makeDoc("Home", "seedHome", "Home",
    "Splat Coffee Roasters",
    "Small-batch coffee roasted in Curitiba and shipped across Brazil.",
    "We roast in small batches and ship within a day of roasting. Everything here is graded above 84 points.");

  if (homeId) {
    await makeDoc("About", "seedContentPage", "About", "About us",
      "Who we are, how we roast, and why we only buy from farms we have visited.",
      "Founded in 2019, we buy directly from twelve farms and roast to order.", homeId);

    await makeDoc("Contact", "seedContentPage", "Contact", "Contact",
      "",   // deliberately empty: gives the SEO dashboard a page to flag
      "Rua Example 123, Curitiba. Open weekdays 9-6.", homeId);

    const blogId = await makeDoc("Blog", "seedContentPage", "Blog", "Blog",
      "Notes on roasting, sourcing and brewing.", "Notes from the roastery.", homeId);

    if (blogId) {
      await makeDoc("Post: washed vs natural", "seedBlogPost", "Washed vs natural",
        "Washed versus natural processing",
        "What changes in the cup when a coffee is washed rather than dried in the fruit.",
        "Washed coffees taste cleaner and more acidic; naturals keep more fruit.", blogId);

      await makeDoc("Post: grind size", "seedBlogPost", "Grind size matters",
        "Grind size matters more than your grinder",
        "A short guide to dialling in grind size before you spend money on equipment.",
        "Most brewing problems are grind problems. Start there.", blogId);

      await makeDoc("Post: subscription", "seedBlogPost", "Our subscription",
        "How the subscription works",
        "",  // second page with no meta description
        "Choose a size and a frequency. Skip or cancel whenever you like.", blogId);
    }
  }

  // ---- member groups and members --------------------------------------------------------
  const groups = {};
  for (const name of ["Customers", "Security Team"]) {
    const id = uuid();
    const r = await call("POST", "member-group", { id, name });
    if (r.status < 400) { groups[name] = id; log.push(`ok    member group ${name}`); }
    else {
      const existing = await findInTree("member-group", name);
      if (existing) { groups[name] = existing; log.push(`reuse member group ${name}`); }
      else note(`member group ${name}`, r);
    }
  }

  const memberTypes = await call("GET", "tree/member-type/root?skip=0&take=10");
  const memberTypeId = memberTypes.json?.items?.[0]?.id ?? memberTypes.json?.[0]?.id;
  log.push(memberTypeId ? `ok    member type ${memberTypeId}` : "FAIL  no member type found");

  const memberSpecs = [
    ["ana.souza@example.com", "ana.souza", "Ana Souza", ["Customers"]],
    ["bruno.lima@example.com", "bruno.lima", "Bruno Lima", ["Customers"]],
    ["carla.reis@example.com", "carla.reis", "Carla Reis", ["Customers", "Security Team"]],
    ["diego.alves@example.com", "diego.alves", "Diego Alves", ["Security Team"]],
  ];
  const members = [];
  if (memberTypeId) {
    for (const [email, username, name, inGroups] of memberSpecs) {
      const id = uuid();
      const r = await call("POST", "member", {
        id, email, username, password: memberPassword,
        memberType: { id: memberTypeId },
        groups: inGroups.map((g) => groups[g]).filter(Boolean),   // ids, not names
        isApproved: true,
        values: [], variants: [{ culture: null, segment: null, name }],
      });
      if (r.status < 400) { members.push({ username, email, name }); log.push(`ok    member ${username}`); }
      else if (r.text.includes("Duplicate")) { members.push({ username, email, name }); log.push(`reuse member ${username}`); }
      else note(`member ${username}`, r);
    }
  }

  // ---- backoffice users -----------------------------------------------------------------
  const userGroups = await call("GET", "user-group?skip=0&take=50");
  const groupItems = userGroups.json?.items ?? [];
  const findGroup = (alias) => groupItems.find((g) => g.alias === alias)?.id;

  const userSpecs = [
    ["editor@example.com", "editor@example.com", "Edna Editor", "editor"],
    ["writer@example.com", "writer@example.com", "Walt Writer", "writer"],
  ];
  const users = [];
  for (const [email, userName, name, groupAlias] of userSpecs) {
    const gid = findGroup(groupAlias);
    if (!gid) { log.push(`skip  user ${userName} — no '${groupAlias}' group`); continue; }
    const id = uuid();
    const r = await call("POST", "user", {
      id, email, userName, name, kind: "Default", userGroupIds: [{ id: gid }],
    });
    if (r.status < 400) { users.push({ userName, name }); log.push(`ok    user ${userName}`); }
    else if (r.text.includes("Duplicate")) { users.push({ userName, name }); log.push(`reuse user ${userName}`); }
    else note(`user ${userName}`, r);
  }

  return { log, members, users, groups: Object.keys(groups) };
}, { memberPassword: MEMBER_PASSWORD });

for (const line of report.log) console.log("  " + line);
console.log(`\nmembers: ${report.members.length}, users: ${report.users.length}, groups: ${report.groups.join(", ")}`);
console.log(`member password: ${MEMBER_PASSWORD}`);

await browser.close();
