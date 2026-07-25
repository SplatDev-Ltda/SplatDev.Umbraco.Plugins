import { LitElement, html, css, customElement, state, nothing } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

interface CharLimitConfig {
  maxChars: number;
  showCountdown: boolean;
}

@customElement("charlimit-dashboard")
export class CharLimitDashboard extends UmbElementMixin(LitElement) {
  @state() private _config: CharLimitConfig | null = null;
  @state() private _loading = true;
  @state() private _error = false;

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
      color: var(--uui-color-text, #1b264f);
      font-family: var(--uui-font-family);
    }
    h1 {
      font-size: 1.5rem; font-weight: 700; margin: 0 0 4px;
    }
    .subtitle {
      color: var(--uui-color-text-alt, #6b7280);
      font-size: .875rem; margin: 0 0 24px; max-width: 480px; line-height: 1.5;
    }
    .card {
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: var(--uui-border-radius, 8px);
      padding: 20px; margin-bottom: 16px;
    }
    .card h2 {
      font-size: 1rem; font-weight: 600; margin: 0 0 12px;
    }
    .info-row {
      display: flex; align-items: center; gap: 12px;
      padding: 8px 0; border-bottom: 1px solid var(--uui-color-border, #f0f0f0);
      font-size: 14px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: 600; min-width: 180px; }
    .info-value { color: var(--uui-color-text-alt, #555); }
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 10px; border-radius: 9999px;
      font-size: 12px; font-weight: 600;
    }
    .badge.on { background: #ecfdf5; color: #065f46; }
    .badge.off { background: #fef2f2; color: #991b1b; }
    .error-state {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
      padding: 16px; color: #991b1b; font-size: 14px;
    }
  `;

  constructor() {
    super();
  }

  override connectedCallback() {
    super.connectedCallback();
    this._loadConfig();
  }

  private async _loadConfig() {
    this._loading = true;
    this._error = false;
    try {
      const response = await fetch("/umbraco/api/charlimit/GetConfig");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this._config = await response.json();
    } catch {
      this._error = true;
    } finally {
      this._loading = false;
    }
  }

  override render() {
    if (this._loading) {
      return html`<uui-loader-circle></uui-loader-circle>`;
    }

    return html`
      <h1>Character Limit</h1>
      <p class="subtitle">Enforces a maximum character count on text input properties with an optional countdown display.</p>

      ${this._error ? html`
        <div class="error-state">
          Could not load configuration from the API. Ensure the CharLimit package is installed and the site is running.
        </div>
      ` : this._config ? html`
        <div class="card">
          <h2>Configuration</h2>
          <div class="info-row">
            <span class="info-label">Default Max Characters</span>
            <span class="info-value">${this._config.maxChars}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Show Countdown</span>
            <span class="badge ${this._config.showCountdown ? 'on' : 'off'}">
              ${this._config.showCountdown ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      ` : nothing}

      <div class="card">
        <h2>How to Use</h2>
        <div class="info-row">
          <span class="info-label">1. Create a Data Type</span>
          <span class="info-value">Select "Character Limit" as the property editor in the Settings section</span>
        </div>
        <div class="info-row">
          <span class="info-label">2. Configure Limits</span>
          <span class="info-value">Set max characters and toggle the countdown display per data type</span>
        </div>
        <div class="info-row">
          <span class="info-label">3. Add to Document Type</span>
          <span class="info-value">Add the property to any document type that needs character validation</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "charlimit-dashboard": CharLimitDashboard;
  }
}
