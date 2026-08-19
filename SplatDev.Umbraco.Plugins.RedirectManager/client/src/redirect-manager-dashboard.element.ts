import {
  LitElement,
  css,
  html,
  customElement,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface RedirectUrl {
  id: number;
  url: string;
  redirectToUrl: string;
  createdOn?: string;
}

const API_BASE = "/umbraco/backoffice/api/RedirectManager";

@customElement("redirect-manager-dashboard")
export class RedirectManagerDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  @state() private _redirects: RedirectUrl[] = [];
  @state() private _loading = false;
  @state() private _message = "";
  @state() private _showForm = false;
  @state() private _editItem: RedirectUrl | null = null;
  @state() private _formUrl = "";
  @state() private _formRedirectTo = "";
  @state() private _filter = "";

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    this._loading = true;
    try {
      const r = await this.#fetch(`${API_BASE}/GetAll`);
      if (r.ok) this._redirects = await r.json();
    } catch {
      this._redirects = [];
    }
    this._loading = false;
  }

  private _openCreate() {
    this._editItem = null;
    this._formUrl = "";
    this._formRedirectTo = "";
    this._showForm = true;
    this._message = "";
  }

  private _openEdit(item: RedirectUrl) {
    this._editItem = item;
    this._formUrl = item.url;
    this._formRedirectTo = item.redirectToUrl;
    this._showForm = true;
    this._message = "";
  }

  private _cancelForm() {
    this._showForm = false;
    this._editItem = null;
    this._formUrl = "";
    this._formRedirectTo = "";
  }

  private async _save() {
    if (!this._formUrl.trim() || !this._formRedirectTo.trim()) {
      this._message = "Both URL and Redirect To are required.";
      return;
    }
    const body: RedirectUrl = {
      id: this._editItem?.id ?? 0,
      url: this._formUrl.trim(),
      redirectToUrl: this._formRedirectTo.trim(),
    };
    try {
      if (this._editItem) {
        await this.#fetch(`${API_BASE}/Put`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        this._message = "Redirect updated.";
      } else {
        await this.#fetch(`${API_BASE}/Post`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        this._message = "Redirect created.";
      }
      this._showForm = false;
      this._editItem = null;
      await this._load();
    } catch {
      this._message = "Error saving redirect.";
    }
  }

  private async _delete(id: number) {
    if (!confirm("Delete this redirect?")) return;
    try {
      await this.#fetch(`${API_BASE}/Delete?id=${id}`, { method: "DELETE" });
      await this._load();
      this._message = "Redirect deleted.";
    } catch {
      this._message = "Error deleting redirect.";
    }
  }

  private get _filtered() {
    if (!this._filter) return this._redirects;
    const q = this._filter.toLowerCase();
    return this._redirects.filter(
      (r) =>
        r.url.toLowerCase().includes(q) ||
        r.redirectToUrl.toLowerCase().includes(q)
    );
  }

  private _renderForm() {
    return html`
      <uui-box headline=${this._editItem ? "Edit Redirect" : "New Redirect"}>
        <div class="form">
          <div class="field">
            <label>From URL</label>
            <uui-input
              .value=${this._formUrl}
              placeholder="/old-path"
              @input=${(e: InputEvent) => (this._formUrl = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div class="field">
            <label>Redirect To</label>
            <uui-input
              .value=${this._formRedirectTo}
              placeholder="/new-path"
              @input=${(e: InputEvent) => (this._formRedirectTo = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          ${this._message ? html`<div class="message error">${this._message}</div>` : ""}
          <div class="form-actions">
            <uui-button look="primary" label="Save" @click=${this._save}>Save</uui-button>
            <uui-button look="secondary" label="Cancel" @click=${this._cancelForm}>Cancel</uui-button>
          </div>
        </div>
      </uui-box>
    `;
  }

  override render() {
    return html`
      <div class="dashboard">
        <div class="header">
          <div>
            <h1>Redirect Manager</h1>
            <p>Manage URL redirects for your Umbraco site.</p>
          </div>
          <uui-button
            look="primary"
            label="Add Redirect"
            @click=${this._openCreate}
          >+ Add Redirect</uui-button>
        </div>

        ${this._message && !this._showForm
          ? html`<div class="message success">${this._message}</div>`
          : ""}

        ${this._showForm ? this._renderForm() : ""}

        <uui-box headline="Redirects (${this._filtered.length})">
          <div slot="header" class="search-wrap">
            <uui-input
              placeholder="Search..."
              .value=${this._filter}
              @input=${(e: InputEvent) => (this._filter = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>

          ${this._loading
            ? html`<div class="loading">Loading...</div>`
            : this._filtered.length === 0
            ? html`<p class="empty">No redirects found.</p>`
            : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>From URL</uui-table-head-cell>
                  <uui-table-head-cell>Redirect To</uui-table-head-cell>
                  <uui-table-head-cell>Created</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._filtered.map(
                  (item) => html`
                    <uui-table-row>
                      <uui-table-cell>${item.url}</uui-table-cell>
                      <uui-table-cell>${item.redirectToUrl}</uui-table-cell>
                      <uui-table-cell>
                        ${item.createdOn ? new Date(item.createdOn).toLocaleDateString() : "—"}
                      </uui-table-cell>
                      <uui-table-cell class="actions-cell">
                        <uui-button
                          compact
                          look="secondary"
                          label="Edit"
                          @click=${() => this._openEdit(item)}
                        >Edit</uui-button>
                        <uui-button
                          compact
                          look="danger"
                          label="Delete"
                          @click=${() => this._delete(item.id)}
                        >Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `}
        </uui-box>
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }
    .dashboard {
      max-width: 1200px;
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-5);
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--uui-size-space-3);
    }
    .header h1 {
      margin: 0 0 var(--uui-size-2) 0;
      font-size: 1.5rem;
    }
    .header p {
      margin: 0;
      color: var(--uui-color-text-alt);
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-3);
      max-width: 600px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-2);
    }
    .field label {
      font-weight: 600;
      font-size: 0.875rem;
    }
    .field uui-input {
      width: 100%;
    }
    .form-actions {
      display: flex;
      gap: var(--uui-size-space-3);
    }
    .message {
      padding: var(--uui-size-space-3);
      border-radius: var(--uui-border-radius);
    }
    .message.success {
      background: var(--uui-color-positive-standalone);
      color: white;
    }
    .message.error {
      background: var(--uui-color-danger-standalone);
      color: white;
    }
    .search-wrap {
      margin-bottom: var(--uui-size-space-3);
    }
    .loading,
    .empty {
      color: var(--uui-color-text-alt);
      font-style: italic;
    }
    .actions-cell {
      display: flex;
      gap: var(--uui-size-2);
    }
    uui-table {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "redirect-manager-dashboard": RedirectManagerDashboardElement;
  }
}
