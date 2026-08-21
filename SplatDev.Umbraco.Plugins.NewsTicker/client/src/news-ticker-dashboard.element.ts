import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface NewsTickerItem {
  id: number;
  text: string;
  url: string | null;
  isActive: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
}

interface NewsTickerSettings {
  speed: number;
  direction: string;
  backgroundColor: string;
  textColor: string;
}

@customElement("news-ticker-dashboard")
export class NewsTickerDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 8px;
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 24px;
    }

    .section {
      margin-bottom: var(--uui-size-layout-2, 32px);
    }

    .toolbar {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .toolbar uui-input {
      flex: 1;
      min-width: 200px;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }

    .item-text {
      flex: 1;
      font-size: 0.9rem;
    }

    .item-url {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .badge-active {
      background: #16a34a;
      color: #fff;
      border-radius: 9999px;
      padding: 2px 8px;
      font-size: 0.7rem;
    }

    .badge-inactive {
      background: #d1d5db;
      color: #374151;
      border-radius: 9999px;
      padding: 2px 8px;
      font-size: 0.7rem;
    }

    .add-form {
      display: grid;
      gap: 12px;
      grid-template-columns: 1fr 1fr;
    }

    .add-form uui-input {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--uui-color-text-alt, #6b7280);
    }
  
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;

  @state() private _items: NewsTickerItem[] = [];
  @state() private _settings: NewsTickerSettings | null = null;
  @state() private _loading = false;
  @state() private _newText = "";
  @state() private _newUrl = "";
  @state() private _newSortOrder = 0;

  @state() private _loadError: string | null = null;

  private readonly _apiBase = "/umbraco/api/newsticker";

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadItems();
    this._loadSettings();
  }

  private async _loadItems(): Promise<void> {
    this._loading = true;
    try {
      const res = await this.#fetch(`${this._apiBase}/items`);
      if (this.#responseOk(res)) this._items = await res.json() as NewsTickerItem[];
    } finally {
      this._loading = false;
    }
  }

  private async _loadSettings(): Promise<void> {
    const res = await this.#fetch(`${this._apiBase}/settings`);
    if (this.#responseOk(res)) this._settings = await res.json() as NewsTickerSettings;
  }

  private async _addItem(): Promise<void> {
    if (!this._newText.trim()) return;
    const item = {
      text: this._newText,
      url: this._newUrl || null,
      isActive: true,
      sortOrder: this._newSortOrder,
    };
    const res = await this.#fetch(`${this._apiBase}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (this.#responseOk(res)) {
      this._newText = "";
      this._newUrl = "";
      this._newSortOrder = 0;
      await this._loadItems();
    }
  }

  private async _toggleItem(item: NewsTickerItem): Promise<void> {
    const updated = { ...item, isActive: !item.isActive };
    const res = await this.#fetch(`${this._apiBase}/items/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (this.#responseOk(res)) await this._loadItems();
  }

  private async _deleteItem(id: number): Promise<void> {
    const res = await this.#fetch(`${this._apiBase}/items/${id}`, { method: "DELETE" });
    if (this.#responseOk(res)) await this._loadItems();
  }

  /**
   * Guards a response and records why it failed.
   *
   * This used to be a bare `response.ok` check with no else branch, so a failed request
   * left the previous (usually empty) state on screen and read as "there is no data"
   * rather than "the request did not succeed".
   */
  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }

    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }


  override render() {
    return html`
      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : ""}
      <h1>News Ticker</h1>
      <p class="description">
        Manage scrolling news ticker items displayed across your Umbraco site.
      </p>

      ${this._settings
        ? html`
            <div class="section">
              <uui-box headline="Current Settings">
                <p>
                  Speed: <strong>${this._settings.speed}</strong> &nbsp;|&nbsp;
                  Direction: <strong>${this._settings.direction}</strong> &nbsp;|&nbsp;
                  Background: <strong>${this._settings.backgroundColor}</strong> &nbsp;|&nbsp;
                  Text: <strong>${this._settings.textColor}</strong>
                </p>
                <p style="color: var(--uui-color-text-alt);">
                  Settings are configured via <code>appsettings.json</code> under
                  <code>UmbracoCms:NewsTicker</code>.
                </p>
              </uui-box>
            </div>
          `
        : ""}

      <div class="section">
        <uui-box headline="Add Ticker Item">
          <div class="add-form">
            <uui-input
              label="Text"
              placeholder="Headline text..."
              .value=${this._newText}
              @input=${(e: Event) => (this._newText = (e.target as HTMLInputElement).value)}
            ></uui-input>
            <uui-input
              label="URL (optional)"
              placeholder="https://..."
              .value=${this._newUrl}
              @input=${(e: Event) => (this._newUrl = (e.target as HTMLInputElement).value)}
            ></uui-input>
            <uui-input
              label="Sort Order"
              type="number"
              .value=${String(this._newSortOrder)}
              @input=${(e: Event) => (this._newSortOrder = parseInt((e.target as HTMLInputElement).value, 10) || 0)}
            ></uui-input>
            <div style="display:flex; align-items:flex-end;">
              <uui-button look="primary" label="Add Item" @click=${this._addItem}>
                Add Item
              </uui-button>
            </div>
          </div>
        </uui-box>
      </div>

      <div class="section">
        <uui-box headline="Active Ticker Items">
          ${this._loading
            ? html`<uui-loader></uui-loader>`
            : this._items.length === 0
            ? html`<div class="empty-state">No ticker items found. Add one above.</div>`
            : this._items.map(
                (item) => html`
                  <div class="item-row">
                    <div>
                      <span class="${item.isActive ? "badge-active" : "badge-inactive"}">
                        ${item.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div class="item-text">
                      <div>${item.text}</div>
                      ${item.url
                        ? html`<div class="item-url">${item.url}</div>`
                        : ""}
                    </div>
                    <div style="font-size:0.75rem; color: var(--uui-color-text-alt);">
                      Order: ${item.sortOrder}
                    </div>
                    <uui-button
                      look="secondary"
                      compact
                      label="${item.isActive ? "Disable" : "Enable"}"
                      @click=${() => this._toggleItem(item)}
                    >
                      ${item.isActive ? "Disable" : "Enable"}
                    </uui-button>
                    <uui-button
                      look="danger"
                      compact
                      label="Delete"
                      @click=${() => this._deleteItem(item.id)}
                    >
                      Delete
                    </uui-button>
                  </div>
                `
              )}
        </uui-box>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "news-ticker-dashboard": NewsTickerDashboardElement;
  }
}
