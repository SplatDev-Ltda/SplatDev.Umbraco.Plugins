import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

interface OAuthProviderConfig {
  id: string;
  name: string;
  initials: string;
  color: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}

@customElement("oauth-dashboard")
export class OAuthDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
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

  @state() private _providers: OAuthProviderConfig[] = [
    {
      id: "google",
      name: "Google",
      initials: "G",
      color: "#4285f4",
      clientId: "",
      clientSecret: "",
      enabled: false,
    },
    {
      id: "facebook",
      name: "Facebook",
      initials: "f",
      color: "#1877f2",
      clientId: "",
      clientSecret: "",
      enabled: false,
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      initials: "X",
      color: "#000000",
      clientId: "",
      clientSecret: "",
      enabled: false,
    },
  ];

  @state() private _savedProviders: Set<string> = new Set();

  private _updateProvider(id: string, field: keyof OAuthProviderConfig, value: string | boolean): void {
    this._providers = this._providers.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
  }

  private _saveProvider(id: string): void {
    this._savedProviders = new Set([...this._savedProviders, id]);
    setTimeout(() => {
      this._savedProviders = new Set([...this._savedProviders].filter((s) => s !== id));
    }, 3000);
  }

  override render() {
    return html`
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
        ${this._providers.map((provider) => this._renderProviderCard(provider))}
      </div>
    `;
  }

  private _renderProviderCard(provider: OAuthProviderConfig) {
    const isSaved = this._savedProviders.has(provider.id);
    return html`
      <div class="provider-card">
        <div class="card-header">
          <div class="provider-icon" style="background: ${provider.color};">
            ${provider.initials}
          </div>
          <div>
            <p class="provider-title">${provider.name}</p>
            <p class="provider-subtitle">OAuth 2.0 Provider</p>
          </div>
          <span class="enabled-badge ${provider.enabled ? "on" : "off"}" style="margin-left: auto;">
            ${provider.enabled ? "Active" : "Inactive"}
          </span>
        </div>

        <div class="form-field">
          <label for="${provider.id}-client-id">Client ID</label>
          <uui-input
            id="${provider.id}-client-id"
            .value=${provider.clientId}
            placeholder="Enter Client ID"
            @input=${(e: InputEvent) =>
              this._updateProvider(provider.id, "clientId", (e.target as HTMLInputElement).value)}
          ></uui-input>
        </div>

        <div class="form-field">
          <label for="${provider.id}-client-secret">Client Secret</label>
          <uui-input
            id="${provider.id}-client-secret"
            type="password"
            .value=${provider.clientSecret}
            placeholder="Enter Client Secret"
            @input=${(e: InputEvent) =>
              this._updateProvider(provider.id, "clientSecret", (e.target as HTMLInputElement).value)}
          ></uui-input>
        </div>

        <div class="card-footer">
          <div class="toggle-row">
            <uui-toggle
              label="Enable ${provider.name}"
              ?checked=${provider.enabled}
              @change=${(e: Event) =>
                this._updateProvider(provider.id, "enabled", (e.target as HTMLInputElement).checked)}
            ></uui-toggle>
            <span>${provider.enabled ? "Enabled" : "Disabled"}</span>
          </div>
          <uui-button
            look="primary"
            label="Save ${provider.name}"
            @click=${() => this._saveProvider(provider.id)}
          >
            ${isSaved ? "Saved!" : "Save"}
          </uui-button>
        </div>
      </div>
    `;
  }
}

export default OAuthDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "oauth-dashboard": OAuthDashboardElement;
  }
}
