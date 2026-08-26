import { LitElement as _, nothing as y, html as r, css as w, state as u, customElement as T } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as x } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as $ } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as k } from "@umbraco-cms/backoffice/notification";
function S(e) {
  let a = null, t = null;
  const d = e.consumeContext.bind(e), n = new Promise((o) => {
    d($, async (s) => {
      var p;
      try {
        a = await ((p = s == null ? void 0 : s.getLatestToken) == null ? void 0 : p.call(s)) ?? null;
      } catch {
        a = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return d(k, (o) => {
    t = o;
  }), async (o, s = {}) => {
    await n;
    const p = new Headers(s.headers);
    a && !p.has("Authorization") && p.set("Authorization", `Bearer ${a}`);
    const c = await fetch(o, { ...s, credentials: "same-origin", headers: p });
    if (!c.ok) {
      const m = c.status === 401 || c.status === 403, f = m ? "Not authorised" : "Could not load data", b = m ? `The backoffice token was ${a ? "sent but rejected" : "not available"} (${c.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${c.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${c.status} from ${String(o)} — ${b}`), t == null || t.peek("danger", { data: { headline: f, message: b } });
    }
    return c;
  };
}
var O = Object.defineProperty, z = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, l = (e, a, t, d) => {
  for (var n = d > 1 ? void 0 : d ? z(a, t) : a, o = e.length - 1, s; o >= 0; o--)
    (s = e[o]) && (n = (d ? s(a, t, n) : s(n)) || n);
  return d && n && O(a, t, n), n;
}, A = (e, a, t) => a.has(e) || v("Cannot " + t), g = (e, a, t) => (A(e, a, "read from private field"), t ? t.call(e) : a.get(e)), D = (e, a, t) => a.has(e) ? v("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, t), h;
let i = class extends x(_) {
  constructor() {
    super(...arguments), this._activeTab = "analysis", this._analysisPages = [], this._runningAnalysis = !1, this._analysisLoaded = !1, this._analysisError = null, D(this, h, S(this)), this._metaTags = {
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      keywords: "",
      noIndex: !1,
      noFollow: !1
    }, this._og = {
      ogTitle: "",
      ogDescription: "",
      ogImageUrl: "",
      ogType: "website"
    }, this._metaSaved = !1, this._ogSaved = !1;
  }
  firstUpdated() {
    this._runAnalysis(), this._loadDefaults();
  }
  async _loadDefaults() {
    try {
      const e = await g(this, h).call(this, "/umbraco/api/seo/defaults");
      if (!e.ok) return;
      const a = await e.json();
      this._metaTags = {
        metaTitle: a.metaTitle ?? "",
        metaDescription: a.metaDescription ?? "",
        canonicalUrl: a.canonicalUrl ?? "",
        keywords: a.keywords ?? "",
        noIndex: !!a.noIndex,
        noFollow: !!a.noFollow
      }, this._og = {
        ogTitle: a.ogTitle ?? "",
        ogDescription: a.ogDescription ?? "",
        ogImageUrl: a.ogImageUrl ?? "",
        ogType: a.ogType ?? "website"
      };
    } catch {
    }
  }
  /** Both tabs edit one site-wide record, so either save posts the whole thing. */
  async _saveDefaults() {
    return (await g(this, h).call(this, "/umbraco/api/seo/savedefaults", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...this._metaTags, ...this._og })
    })).ok;
  }
  async _runAnalysis() {
    this._runningAnalysis = !0, this._analysisError = null;
    try {
      const e = await g(this, h).call(this, "/umbraco/api/seo/analysis");
      e.ok ? this._analysisPages = await e.json() : (this._analysisError = e.status === 401 || e.status === 403 ? `The request was refused (${e.status}). This is an authorisation problem, not an empty site.` : `The analysis request failed with ${e.status}.`, this._analysisPages = []);
    } catch (e) {
      this._analysisError = `The analysis request could not be sent: ${String(e)}`, this._analysisPages = [];
    } finally {
      this._analysisLoaded = !0, this._runningAnalysis = !1;
    }
  }
  async _saveMeta() {
    this._metaSaved = await this._saveDefaults(), this._metaSaved && setTimeout(() => this._metaSaved = !1, 3e3);
  }
  async _saveOg() {
    this._ogSaved = await this._saveDefaults(), this._ogSaved && setTimeout(() => this._ogSaved = !1, 3e3);
  }
  _metaStatusLabel(e) {
    switch (e) {
      case "present":
        return "Present";
      case "missing":
        return "Missing";
      case "too-long":
        return "Too Long";
    }
  }
  _renderAnalysisTab() {
    return r`
      ${this._analysisError ? r`<div class="notice notice-error">${this._analysisError}</div>` : this._analysisLoaded && this._analysisPages.length === 0 ? r`<div class="notice">
              No published pages were returned. Either the site has no published
              content, or none of it carries the SEO properties this plugin reads.
            </div>` : y}
      <uui-box>
        <div class="analysis-header" slot="headline">
          <span>Page SEO Analysis</span>
          <uui-button
            look="primary"
            label="Run Analysis"
            ?disabled=${this._runningAnalysis}
            @click=${this._runAnalysis}
          >
            ${this._runningAnalysis ? "Analysing..." : "Run Analysis"}
          </uui-button>
        </div>
        <uui-table>
          <uui-table-head>
            <uui-table-head-cell>Page</uui-table-head-cell>
            <uui-table-head-cell>URL</uui-table-head-cell>
            <uui-table-head-cell>SEO Score</uui-table-head-cell>
            <uui-table-head-cell>Meta Description</uui-table-head-cell>
          </uui-table-head>
          ${this._analysisPages.map(
      (e) => r`
              <uui-table-row>
                <uui-table-cell>${e.title}</uui-table-cell>
                <uui-table-cell>
                  <code style="font-size:0.8rem;">${e.url}</code>
                </uui-table-cell>
                <uui-table-cell>
                  <span class="score-badge ${e.score}">
                    ${e.score.charAt(0).toUpperCase() + e.score.slice(1)}
                  </span>
                </uui-table-cell>
                <uui-table-cell>
                  <span class="meta-status ${e.metaDescriptionStatus}">
                    ${this._metaStatusLabel(e.metaDescriptionStatus)}
                  </span>
                </uui-table-cell>
              </uui-table-row>
            `
    )}
        </uui-table>
      </uui-box>
    `;
  }
  _renderMetaTagsTab() {
    return r`
      <div class="notice">
        These are site-wide fallbacks, saved for the whole site. A page that sets its own
        SEO properties overrides them.
      </div>
      <uui-box headline="Meta Tags">
        <div class="form-grid">
          <div class="form-field full-width">
            <label for="meta-title">Meta Title</label>
            <uui-input
              id="meta-title"
              .value=${this._metaTags.metaTitle}
              placeholder="Page title for search engines"
              @input=${(e) => {
      this._metaTags = { ...this._metaTags, metaTitle: e.target.value };
    }}
            ></uui-input>
          </div>

          <div class="form-field full-width">
            <label for="meta-description">Meta Description</label>
            <textarea
              id="meta-description"
              placeholder="Brief description for search engine result pages (150–160 characters recommended)"
              .value=${this._metaTags.metaDescription}
              @input=${(e) => {
      this._metaTags = { ...this._metaTags, metaDescription: e.target.value };
    }}
            ></textarea>
          </div>

          <div class="form-field full-width">
            <label for="canonical-url">Canonical URL</label>
            <uui-input
              id="canonical-url"
              .value=${this._metaTags.canonicalUrl}
              placeholder="https://example.com/page"
              @input=${(e) => {
      this._metaTags = { ...this._metaTags, canonicalUrl: e.target.value };
    }}
            ></uui-input>
          </div>

          <div class="form-field full-width">
            <label for="keywords">Keywords</label>
            <uui-input
              id="keywords"
              .value=${this._metaTags.keywords}
              placeholder="keyword1, keyword2, keyword3"
              @input=${(e) => {
      this._metaTags = { ...this._metaTags, keywords: e.target.value };
    }}
            ></uui-input>
          </div>

          <div class="form-field">
            <label>Robots</label>
            <div class="checkbox-row">
              <uui-checkbox
                label="noIndex"
                ?checked=${this._metaTags.noIndex}
                @change=${(e) => {
      this._metaTags = { ...this._metaTags, noIndex: e.target.checked };
    }}
              ></uui-checkbox>
              <span>noIndex — exclude from search engines</span>
            </div>
            <div class="checkbox-row" style="margin-top:6px;">
              <uui-checkbox
                label="noFollow"
                ?checked=${this._metaTags.noFollow}
                @change=${(e) => {
      this._metaTags = { ...this._metaTags, noFollow: e.target.checked };
    }}
              ></uui-checkbox>
              <span>noFollow — do not follow links</span>
            </div>
          </div>

          <div class="save-row">
            <uui-button look="primary" label="Save Meta Tags" @click=${this._saveMeta}>
              ${this._metaSaved ? "Saved!" : "Save Meta Tags"}
            </uui-button>
          </div>
        </div>
      </uui-box>
    `;
  }
  _renderOpenGraphTab() {
    const e = this._og.ogImageUrl.trim().length > 0;
    return r`
      <div class="notice">
        Site-wide Open Graph defaults, used where a page does not supply its own.
      </div>
      <uui-box headline="Open Graph">
        <div class="form-grid">
          <div class="form-field full-width">
            <label for="og-title">OG Title</label>
            <uui-input
              id="og-title"
              .value=${this._og.ogTitle}
              placeholder="Title as it appears when shared"
              @input=${(a) => {
      this._og = { ...this._og, ogTitle: a.target.value };
    }}
            ></uui-input>
          </div>

          <div class="form-field full-width">
            <label for="og-description">OG Description</label>
            <textarea
              id="og-description"
              placeholder="Description shown in social media previews"
              .value=${this._og.ogDescription}
              @input=${(a) => {
      this._og = { ...this._og, ogDescription: a.target.value };
    }}
            ></textarea>
          </div>

          <div class="form-field full-width">
            <label for="og-image">OG Image URL</label>
            <uui-input
              id="og-image"
              .value=${this._og.ogImageUrl}
              placeholder="https://example.com/og-image.jpg (1200×630px recommended)"
              @input=${(a) => {
      this._og = { ...this._og, ogImageUrl: a.target.value };
    }}
            ></uui-input>
          </div>

          <div class="form-field">
            <label for="og-type">OG Type</label>
            <select
              id="og-type"
              style="padding:8px;border:1px solid var(--uui-color-border,#d1d5db);border-radius:var(--uui-border-radius,4px);font-size:0.875rem;"
              .value=${this._og.ogType}
              @change=${(a) => {
      this._og = { ...this._og, ogType: a.target.value };
    }}
            >
              <option value="website">website</option>
              <option value="article">article</option>
              <option value="product">product</option>
            </select>
          </div>

          <div class="save-row">
            <uui-button look="primary" label="Save Open Graph" @click=${this._saveOg}>
              ${this._ogSaved ? "Saved!" : "Save Open Graph"}
            </uui-button>
          </div>
        </div>

        <div style="margin-top: var(--uui-size-space-5, 16px);">
          <p style="font-size:0.8rem;font-weight:600;margin:0 0 8px;color:var(--uui-color-text-alt);">
            SOCIAL PREVIEW
          </p>
          <div class="og-preview">
            <div class="og-preview-image">
              ${e ? r`<img src=${this._og.ogImageUrl} alt="OG Preview" />` : r`<span>No image set — 1200 × 630 px recommended</span>`}
            </div>
            <div class="og-preview-body">
              <p class="og-preview-url">example.com</p>
              <p class="og-preview-title">
                ${this._og.ogTitle || "OG Title will appear here"}
              </p>
              <p class="og-preview-desc">
                ${this._og.ogDescription || "OG description will appear here — keep it under 200 characters for best results."}
              </p>
            </div>
          </div>
        </div>
      </uui-box>
    `;
  }
  render() {
    return r`
      <h1>SEO Dashboard</h1>
      <p class="description">
        Analyse your site's SEO health, manage meta tags, and configure Open
        Graph settings for optimal social media sharing.
      </p>

      <uui-tab-group>
        ${["analysis", "meta", "og"].map(
      (e) => r`
            <uui-tab
              label=${{ analysis: "Analysis", meta: "Meta Tags", og: "Open Graph" }[e]}
              ?active=${this._activeTab === e}
              @click=${() => this._activeTab = e}
            >
              ${{ analysis: "Analysis", meta: "Meta Tags", og: "Open Graph" }[e]}
            </uui-tab>
          `
    )}
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "analysis" ? this._renderAnalysisTab() : this._activeTab === "meta" ? this._renderMetaTagsTab() : this._renderOpenGraphTab()}
      </div>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
i.styles = w`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 var(--uui-size-space-3, 8px);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 var(--uui-size-space-5, 16px);
    }

    uui-tab-group {
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .tab-content {
      margin-top: var(--uui-size-space-5, 16px);
    }

    .notice {
      background: #fef9c3;
      border: 1px solid #fde047;
      border-radius: var(--uui-border-radius, 4px);
      padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
      font-size: 0.875rem;
      color: #713f12;
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    /* Score badges */
    .score-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .score-badge.good { background: #d1fae5; color: #065f46; }
    .score-badge.warning { background: #fef9c3; color: #92400e; }
    .score-badge.poor { background: #fee2e2; color: #991b1b; }

    .meta-status {
      font-size: 0.75rem;
    }

    .meta-status.present { color: #065f46; }
    .meta-status.missing { color: #991b1b; }
    .meta-status.too-long { color: #92400e; }

    /* Forms */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-space-4, 12px);
      max-width: 720px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .form-field textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: var(--uui-border-radius, 4px);
      font-family: inherit;
      font-size: 0.875rem;
      resize: vertical;
      min-height: 80px;
      box-sizing: border-box;
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
    }

    .save-row {
      margin-top: var(--uui-size-space-4, 12px);
      grid-column: 1 / -1;
    }

    /* OG Preview Card */
    .og-preview {
      margin-top: var(--uui-size-space-5, 16px);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 8px;
      overflow: hidden;
      max-width: 480px;
    }

    .og-preview-image {
      width: 100%;
      height: 160px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .og-preview-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .og-preview-body {
      padding: 12px 14px;
      background: #f9fafb;
    }

    .og-preview-url {
      font-size: 0.7rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin: 0 0 4px;
    }

    .og-preview-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px;
    }

    .og-preview-desc {
      font-size: 0.8rem;
      color: #4b5563;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    uui-table { width: 100%; }

    .analysis-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--uui-size-space-4, 12px);
    }
  `;
l([
  u()
], i.prototype, "_activeTab", 2);
l([
  u()
], i.prototype, "_analysisPages", 2);
l([
  u()
], i.prototype, "_runningAnalysis", 2);
l([
  u()
], i.prototype, "_analysisLoaded", 2);
l([
  u()
], i.prototype, "_analysisError", 2);
l([
  u()
], i.prototype, "_metaTags", 2);
l([
  u()
], i.prototype, "_og", 2);
l([
  u()
], i.prototype, "_metaSaved", 2);
l([
  u()
], i.prototype, "_ogSaved", 2);
i = l([
  T("seo-dashboard")
], i);
const G = i;
export {
  i as SeoDashboardElement,
  G as default
};
