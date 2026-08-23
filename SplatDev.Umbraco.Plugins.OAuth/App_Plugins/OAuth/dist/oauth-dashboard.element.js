import { LitElement as u, html as l, css as p, state as c, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as v } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, b = Object.getOwnPropertyDescriptor, n = (e, t, i, r) => {
  for (var a = r > 1 ? void 0 : r ? b(t, i) : t, o = e.length - 1, d; o >= 0; o--)
    (d = e[o]) && (a = (r ? d(t, i, a) : d(a)) || a);
  return r && a && g(t, i, a), a;
};
let s = class extends v(u) {
  constructor() {
    super(...arguments), this._providers = [
      {
        id: "google",
        name: "Google",
        initials: "G",
        color: "#4285f4",
        clientId: "",
        clientSecret: "",
        enabled: !1
      },
      {
        id: "facebook",
        name: "Facebook",
        initials: "f",
        color: "#1877f2",
        clientId: "",
        clientSecret: "",
        enabled: !1
      },
      {
        id: "twitter",
        name: "X (Twitter)",
        initials: "X",
        color: "#000000",
        clientId: "",
        clientSecret: "",
        enabled: !1
      }
    ], this._savedProviders = /* @__PURE__ */ new Set();
  }
  _updateProvider(e, t, i) {
    this._providers = this._providers.map(
      (r) => r.id === e ? { ...r, [t]: i } : r
    );
  }
  _saveProvider(e) {
    this._savedProviders = /* @__PURE__ */ new Set([...this._savedProviders, e]), setTimeout(() => {
      this._savedProviders = new Set([...this._savedProviders].filter((t) => t !== e));
    }, 3e3);
  }
  render() {
    return l`
      <h1>OAuth Configuration</h1>
      <p class="description">
        Configure external login providers (Google, Facebook, X/Twitter) for
        your Umbraco site. Credentials are stored in
        <code>appsettings.json</code> and require an application restart to take
        effect.
      </p>

      <div class="notice">
        <strong>Note:</strong> Changes to OAuth provider settings require an
        application restart. Phase 3 BE APIs are pending — configuration is not
        yet persisted to <code>appsettings.json</code> via API.
      </div>

      <div class="providers-grid">
        ${this._providers.map((e) => this._renderProviderCard(e))}
      </div>
    `;
  }
  _renderProviderCard(e) {
    const t = this._savedProviders.has(e.id);
    return l`
      <div class="provider-card">
        <div class="card-header">
          <div class="provider-icon" style="background: ${e.color};">
            ${e.initials}
          </div>
          <div>
            <p class="provider-title">${e.name}</p>
            <p class="provider-subtitle">OAuth 2.0 Provider</p>
          </div>
          <span class="enabled-badge ${e.enabled ? "on" : "off"}" style="margin-left: auto;">
            ${e.enabled ? "Active" : "Inactive"}
          </span>
        </div>

        <div class="form-field">
          <label for="${e.id}-client-id">Client ID</label>
          <uui-input
            id="${e.id}-client-id"
            .value=${e.clientId}
            placeholder="Enter Client ID"
            @input=${(i) => this._updateProvider(e.id, "clientId", i.target.value)}
          ></uui-input>
        </div>

        <div class="form-field">
          <label for="${e.id}-client-secret">Client Secret</label>
          <uui-input
            id="${e.id}-client-secret"
            type="password"
            .value=${e.clientSecret}
            placeholder="Enter Client Secret"
            @input=${(i) => this._updateProvider(e.id, "clientSecret", i.target.value)}
          ></uui-input>
        </div>

        <div class="card-footer">
          <div class="toggle-row">
            <uui-toggle
              label="Enable ${e.name}"
              ?checked=${e.enabled}
              @change=${(i) => this._updateProvider(e.id, "enabled", i.target.checked)}
            ></uui-toggle>
            <span>${e.enabled ? "Enabled" : "Disabled"}</span>
          </div>
          <uui-button
            look="primary"
            label="Save ${e.name}"
            @click=${() => this._saveProvider(e.id)}
          >
            ${t ? "Saved!" : "Save"}
          </uui-button>
        </div>
      </div>
    `;
  }
};
s.styles = p`
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

    .notice {
      background: #fef9c3;
      border: 1px solid #fde047;
      border-radius: var(--uui-border-radius, 4px);
      padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
      font-size: 0.875rem;
      color: #713f12;
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .notice strong { font-weight: 700; }

    .providers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: var(--uui-size-space-5, 16px);
    }

    .provider-card {
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: var(--uui-border-radius, 4px);
      padding: var(--uui-size-space-5, 16px);
      background: var(--uui-color-surface, #fff);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-4, 12px);
      margin-bottom: var(--uui-size-space-4, 12px);
    }

    .provider-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1rem;
      color: #fff;
      flex-shrink: 0;
    }

    .provider-title {
      font-size: 1rem;
      font-weight: 700;
      margin: 0;
    }

    .provider-subtitle {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt, #6b7280);
      margin: 2px 0 0;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: var(--uui-size-space-3, 8px);
    }

    .form-field label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--uui-color-text, #111827);
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: var(--uui-size-space-4, 12px);
      padding-top: var(--uui-size-space-3, 8px);
      border-top: 1px solid var(--uui-color-border, #e5e7eb);
    }

    .toggle-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }

    .enabled-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .enabled-badge.on { background: #d1fae5; color: #065f46; }
    .enabled-badge.off { background: #f3f4f6; color: #6b7280; }
  `;
n([
  c()
], s.prototype, "_providers", 2);
n([
  c()
], s.prototype, "_savedProviders", 2);
s = n([
  f("oauth-dashboard")
], s);
const x = s;
export {
  s as OAuthDashboardElement,
  x as default
};
