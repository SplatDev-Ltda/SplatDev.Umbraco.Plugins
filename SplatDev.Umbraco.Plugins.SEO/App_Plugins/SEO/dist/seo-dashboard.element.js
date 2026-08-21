import { LitElement as c, html as t, css as p, state as r, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
var h = Object.defineProperty, b = Object.getOwnPropertyDescriptor, s = (e, a, n, l) => {
  for (var o = l > 1 ? void 0 : l ? b(a, n) : a, u = e.length - 1, d; u >= 0; u--)
    (d = e[u]) && (o = (l ? d(a, n, o) : d(o)) || o);
  return l && o && h(a, n, o), o;
};
let i = class extends m(c) {
  constructor() {
    super(...arguments), this._activeTab = "analysis", this._analysisPages = [
      { title: "Home", url: "/", score: "good", metaDescriptionStatus: "present" },
      { title: "About Us", url: "/about", score: "warning", metaDescriptionStatus: "too-long" },
      { title: "Blog", url: "/blog", score: "poor", metaDescriptionStatus: "missing" },
      { title: "Contact", url: "/contact", score: "good", metaDescriptionStatus: "present" },
      { title: "Services", url: "/services", score: "warning", metaDescriptionStatus: "too-long" }
    ], this._runningAnalysis = !1, this._metaTags = {
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
  async _runAnalysis() {
    this._runningAnalysis = !0, await new Promise((e) => setTimeout(e, 1500)), this._runningAnalysis = !1;
  }
  _saveMeta() {
    this._metaSaved = !0, setTimeout(() => this._metaSaved = !1, 3e3);
  }
  _saveOg() {
    this._ogSaved = !0, setTimeout(() => this._ogSaved = !1, 3e3);
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
    return t`
      <div class="notice">
        Phase 3 BE APIs are pending. Analysis data shown below is placeholder.
      </div>
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
      (e) => t`
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
    return t`
      <div class="notice">
        Phase 3 BE APIs are pending. Meta tag configuration is not yet persisted.
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
    return t`
      <div class="notice">
        Phase 3 BE APIs are pending. Open Graph configuration is not yet persisted.
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
              ${e ? t`<img src=${this._og.ogImageUrl} alt="OG Preview" />` : t`<span>No image set — 1200 × 630 px recommended</span>`}
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
    return t`
      <h1>SEO Dashboard</h1>
      <p class="description">
        Analyse your site's SEO health, manage meta tags, and configure Open
        Graph settings for optimal social media sharing.
      </p>

      <uui-tab-group>
        ${["analysis", "meta", "og"].map(
      (e) => t`
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
i.styles = p`
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
s([
  r()
], i.prototype, "_activeTab", 2);
s([
  r()
], i.prototype, "_analysisPages", 2);
s([
  r()
], i.prototype, "_runningAnalysis", 2);
s([
  r()
], i.prototype, "_metaTags", 2);
s([
  r()
], i.prototype, "_og", 2);
s([
  r()
], i.prototype, "_metaSaved", 2);
s([
  r()
], i.prototype, "_ogSaved", 2);
i = s([
  g("seo-dashboard")
], i);
const x = i;
export {
  i as SeoDashboardElement,
  x as default
};
