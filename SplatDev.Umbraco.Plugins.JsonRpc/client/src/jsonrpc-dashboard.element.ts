import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface ApiKey {
  id: number;
  name: string;
  permissions: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

interface ApiKeyCreated extends ApiKey {
  rawKey: string;
}

/**
 * Manage the API keys that authorise JSON-RPC calls.
 *
 * The previous dashboard made no requests, so the three operations behind it — list,
 * create and revoke — had no way in at all.
 */
@customElement("jsonrpc-dashboard")
export class JsonRpcDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 64ch; }

    uui-box { margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }
    uui-input { width: 100%; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    code { font-family: var(--uui-font-monospace, monospace); background: var(--uui-color-surface-alt, #f3f4f6); padding: 1px 5px; border-radius: 3px; }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .tag.good { background: #d1fae5; color: #065f46; }
    .tag.off { background: #fee2e2; color: #991b1b; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

    .reveal {
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
      padding: 14px 16px; margin: 0 0 16px; border-radius: 3px;
    }
    .reveal code { display: block; margin: 8px 0; word-break: break-all; font-size: 0.88rem; }

    .msg, .splatdev-load-error {
      display: block; margin: 0 0 14px; padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem; border-radius: 3px;
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
  `;

  @state() private _keys: ApiKey[] = [];
  @state() private _loading = true;
  @state() private _busy = "";
  @state() private _loadError: string | null = null;
  @state() private _message: { ok: boolean; text: string } | null = null;

  @state() private _newName = "";
  @state() private _newPermissions = "*";
  @state() private _created: ApiKeyCreated | null = null;

  readonly #fetch = createAuthFetch(this);
  private readonly _api = "/umbraco/api/jsonrpc/apikey";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }
    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to manage API keys. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#fetch(`${this._api}/GetAll`);
      if (this.#responseOk(response)) this._keys = await response.json();
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
    } finally {
      this._loading = false;
    }
  }

  async #create(): Promise<void> {
    const name = this._newName.trim();
    if (!name) {
      this._message = { ok: false, text: "Give the key a name so you can recognise it later." };
      return;
    }

    this._busy = "create";
    this._created = null;
    try {
      const response = await this.#fetch(`${this._api}/Create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, permissions: this._newPermissions.trim() || "*" }),
      });
      if (this.#responseOk(response)) {
        this._created = await response.json();
        this._message = null;
        this._newName = "";
        await this.#load();
      }
    } catch {
      this._message = { ok: false, text: "Could not create that key." };
    } finally {
      this._busy = "";
    }
  }

  async #revoke(key: ApiKey): Promise<void> {
    this._busy = `revoke:${key.id}`;
    try {
      const response = await this.#fetch(`${this._api}/Revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: key.id }),
      });
      if (this.#responseOk(response)) {
        this._message = { ok: true, text: `Revoked ${key.name}.` };
        await this.#load();
      }
    } catch {
      this._message = { ok: false, text: `Could not revoke ${key.name}.` };
    } finally {
      this._busy = "";
    }
  }

  async #copy(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this._message = { ok: true, text: "Key copied to the clipboard." };
    } catch {
      this._message = { ok: false, text: "Could not copy — select the key and copy it manually." };
    }
  }

  #when(iso: string | null): string {
    if (!iso) return "never";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  }

  override render() {
    return html`
      <h1>JSON-RPC</h1>
      <p class="description">
        API keys that authorise JSON-RPC calls against this site. A key is shown once when
        it is created — only its hash is stored, so it cannot be shown again.
      </p>

      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : nothing}
      ${this._message
        ? html`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>`
        : nothing}

      ${this._created
        ? html`
            <div class="reveal" role="alert">
              <strong>Copy ${this._created.name} now.</strong>
              <code>${this._created.rawKey}</code>
              This is the only time it will be shown. Only its hash is stored, so if you
              lose it you will need to create another key.
              <div class="actions">
                <uui-button
                  look="primary"
                  label="Copy key"
                  @click=${() => this.#copy(this._created!.rawKey)}
                  >Copy key</uui-button
                >
                <uui-button look="secondary" label="Dismiss" @click=${() => (this._created = null)}
                  >I have stored it</uui-button
                >
              </div>
            </div>
          `
        : nothing}

      <uui-box headline="Keys">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._keys.length === 0
            ? html`<p class="empty">No API keys yet. Create one below.</p>`
            : html`
                <table>
                  <thead>
                    <tr><th>Name</th><th>Permissions</th><th>Status</th><th>Created</th><th>Last used</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._keys.map(
                      (k) => html`
                        <tr>
                          <td>${k.name}</td>
                          <td><code>${k.permissions}</code></td>
                          <td>
                            <span class="tag ${k.isActive ? "good" : "off"}"
                              >${k.isActive ? "active" : "revoked"}</span
                            >
                          </td>
                          <td class="num">${this.#when(k.createdAt)}</td>
                          <td class="num">${this.#when(k.lastUsedAt)}</td>
                          <td>
                            ${k.isActive
                              ? html`<uui-button
                                  compact
                                  look="secondary"
                                  color="danger"
                                  label="Revoke ${k.name}"
                                  ?disabled=${this._busy === `revoke:${k.id}`}
                                  @click=${() => this.#revoke(k)}
                                  >Revoke</uui-button
                                >`
                              : nothing}
                          </td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>
              `}
      </uui-box>

      <uui-box headline="Create a key">
        <div class="grid">
          <div>
            <span class="field-label">Name</span>
            <uui-input
              placeholder="e.g. Mobile app"
              .value=${this._newName}
              @input=${(e: Event) => (this._newName = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Permissions</span>
            <uui-input
              placeholder="*"
              .value=${this._newPermissions}
              @input=${(e: Event) => (this._newPermissions = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
        </div>
        <p class="hint">
          Permissions are method prefixes, comma separated — <code>*</code> for everything,
          or something narrower like <code>content.get,content.search</code>.
        </p>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Create key"
            ?disabled=${this._busy === "create"}
            @click=${this.#create}
            >${this._busy === "create" ? "Creating…" : "Create key"}</uui-button
          >
        </div>
      </uui-box>
    `;
  }
}

export default JsonRpcDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "jsonrpc-dashboard": JsonRpcDashboardElement;
  }
}
