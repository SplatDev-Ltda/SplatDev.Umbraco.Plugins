import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface Toast {
  id: number;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

type Draft = Omit<Toast, "id" | "createdAt">;

const EMPTY: Draft = {
  title: "",
  body: "",
  type: "info",
  isActive: true,
  startDate: null,
  endDate: null,
};

/**
 * Manage the toasts shown to editors.
 *
 * The previous dashboard was the estate's shared placeholder: a hardcoded "Active" badge,
 * a decorative toggle, and a Save button whose handler set a flag for three seconds and
 * wrote nothing. It never called the API, though the controller and service behind it
 * were complete.
 */
@customElement("toastnotifications-dashboard")
export class ToastNotificationsDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 62ch; }
    .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .field label { display: block; font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .field input, .field select, .field textarea {
      width: 100%; padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 4px; font: inherit; box-sizing: border-box;
    }
    .field textarea { min-height: 72px; resize: vertical; }
    .actions { display: flex; gap: 10px; align-items: center; margin-top: 14px; flex-wrap: wrap; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 16px 0; }
    .body-cell { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    uui-table { width: 100%; }
  `;

  @state() private _toasts: Toast[] = [];
  @state() private _loading = true;
  @state() private _busy = false;
  @state() private _editingId: number | null = null;
  @state() private _draft: Draft = { ...EMPTY };
  @state() private _msg: { ok: boolean; text: string } | null = null;

  private readonly _api = "/umbraco/api/toastnotifications";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      // GetAll, not GetActive: a scheduled or expired toast must still be manageable.
      const r = await this.#fetch(`${this._api}/GetAll`, { credentials: "same-origin" });
      if (r.ok) this._toasts = await r.json();
    } finally {
      this._loading = false;
    }
  }

  /** Where a toast sits relative to now — the thing the old UI could not show at all. */
  #state(t: Toast): { label: string; look: string } {
    const now = Date.now();
    if (!t.isActive) return { label: "Disabled", look: "secondary" };
    if (t.startDate && Date.parse(t.startDate) > now) return { label: "Scheduled", look: "warning" };
    if (t.endDate && Date.parse(t.endDate) < now) return { label: "Expired", look: "danger" };
    return { label: "Showing", look: "positive" };
  }

  #set<K extends keyof Draft>(key: K, value: Draft[K]) {
    this._draft = { ...this._draft, [key]: value };
  }

  #edit(t: Toast) {
    this._editingId = t.id;
    this._draft = {
      title: t.title, body: t.body, type: t.type, isActive: t.isActive,
      startDate: t.startDate, endDate: t.endDate,
    };
    this._msg = null;
    this.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  #cancel() {
    this._editingId = null;
    this._draft = { ...EMPTY };
    this._msg = null;
  }

  async #save(): Promise<void> {
    if (!this._draft.title.trim()) {
      this._msg = { ok: false, text: "Give the toast a title." };
      return;
    }

    this._busy = true;
    this._msg = null;
    try {
      const editing = this._editingId !== null;
      const url = editing ? `${this._api}/Update?id=${this._editingId}` : `${this._api}/Create`;
      const r = await this.#fetch(url, {
        method: editing ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._draft),
      });
      if (!r.ok) throw new Error(`${r.status}`);

      this._msg = { ok: true, text: editing ? "Toast updated." : "Toast created." };
      this.#cancel();
      await this.#load();
    } catch (e) {
      this._msg = { ok: false, text: `Could not save the toast (${(e as Error).message}).` };
    } finally {
      this._busy = false;
    }
  }

  async #remove(t: Toast): Promise<void> {
    if (!confirm(`Delete "${t.title}"?`)) return;
    this._busy = true;
    this._msg = null;
    try {
      const r = await this.#fetch(`${this._api}/Delete?id=${t.id}`, {
        method: "DELETE", credentials: "same-origin",
      });
      if (!r.ok) throw new Error(`${r.status}`);
      this._msg = { ok: true, text: `"${t.title}" deleted.` };
      if (this._editingId === t.id) this.#cancel();
      await this.#load();
    } catch (e) {
      this._msg = { ok: false, text: `Could not delete (${(e as Error).message}).` };
    } finally {
      this._busy = false;
    }
  }

  /** datetime-local wants "YYYY-MM-DDTHH:mm"; the API round-trips ISO. */
  #forInput(v: string | null): string {
    return v ? v.slice(0, 16) : "";
  }

  #renderForm() {
    const editing = this._editingId !== null;
    return html`
      <uui-box headline=${editing ? "Edit toast" : "New toast"}>
        <div class="grid">
          <div class="field" style="grid-column: 1 / -1;">
            <label for="t-title">Title</label>
            <input id="t-title" .value=${this._draft.title}
              @input=${(e: InputEvent) => this.#set("title", (e.target as HTMLInputElement).value)} />
          </div>

          <div class="field" style="grid-column: 1 / -1;">
            <label for="t-body">Message</label>
            <textarea id="t-body" .value=${this._draft.body}
              @input=${(e: InputEvent) => this.#set("body", (e.target as HTMLTextAreaElement).value)}></textarea>
          </div>

          <div class="field">
            <label for="t-type">Type</label>
            <select id="t-type" .value=${this._draft.type}
              @change=${(e: Event) => this.#set("type", (e.target as HTMLSelectElement).value as Draft["type"])}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div class="field">
            <label for="t-start">Show from <span style="font-weight:400;">(optional)</span></label>
            <input id="t-start" type="datetime-local" .value=${this.#forInput(this._draft.startDate)}
              @input=${(e: InputEvent) =>
                this.#set("startDate", (e.target as HTMLInputElement).value || null)} />
          </div>

          <div class="field">
            <label for="t-end">Show until <span style="font-weight:400;">(optional)</span></label>
            <input id="t-end" type="datetime-local" .value=${this.#forInput(this._draft.endDate)}
              @input=${(e: InputEvent) =>
                this.#set("endDate", (e.target as HTMLInputElement).value || null)} />
          </div>

          <div class="field">
            <label>Enabled</label>
            <uui-toggle
              ?checked=${this._draft.isActive}
              @change=${(e: Event) =>
                this.#set("isActive", (e.target as HTMLInputElement).checked)}></uui-toggle>
          </div>
        </div>

        <div class="actions">
          <uui-button look="primary" ?disabled=${this._busy} @click=${this.#save}>
            ${this._busy ? "Saving…" : editing ? "Save changes" : "Create toast"}
          </uui-button>
          ${editing
            ? html`<uui-button look="secondary" @click=${this.#cancel}>Cancel</uui-button>`
            : nothing}
        </div>

        ${this._msg
          ? html`<div class="msg ${this._msg.ok ? "success" : "error"}">${this._msg.text}</div>`
          : nothing}
      </uui-box>
    `;
  }

  override render() {
    return html`
      <h1>Toast notifications</h1>
      <p class="description">
        Short messages shown to editors in the backoffice. A toast can be scheduled with a
        start and end time, or left open-ended to show until you disable it.
      </p>

      ${this.#renderForm()}

      <uui-box headline="All toasts" style="margin-top:16px;">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._toasts.length === 0
            ? html`<p class="empty">No toasts yet.</p>`
            : html`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Title</uui-table-head-cell>
                    <uui-table-head-cell>Type</uui-table-head-cell>
                    <uui-table-head-cell>State</uui-table-head-cell>
                    <uui-table-head-cell>Window</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._toasts.map(t => {
                    const s = this.#state(t);
                    return html`
                      <uui-table-row>
                        <uui-table-cell>
                          <strong>${t.title}</strong>
                          ${t.body ? html`<div class="body-cell">${t.body}</div>` : nothing}
                        </uui-table-cell>
                        <uui-table-cell>${t.type}</uui-table-cell>
                        <uui-table-cell>
                          <uui-tag look=${s.look}>${s.label}</uui-tag>
                        </uui-table-cell>
                        <uui-table-cell class="body-cell">
                          ${t.startDate || t.endDate
                            ? html`${t.startDate ? new Date(t.startDate).toLocaleString() : "any time"}
                                   &rarr;
                                   ${t.endDate ? new Date(t.endDate).toLocaleString() : "no end"}`
                            : "always"}
                        </uui-table-cell>
                        <uui-table-cell style="text-align:right;white-space:nowrap;">
                          <uui-button look="secondary" compact label="Edit"
                            @click=${() => this.#edit(t)}>Edit</uui-button>
                          <uui-button look="secondary" color="danger" compact label="Delete"
                            ?disabled=${this._busy}
                            @click=${() => this.#remove(t)}>Delete</uui-button>
                        </uui-table-cell>
                      </uui-table-row>
                    `;
                  })}
                </uui-table>
              `}
      </uui-box>
    `;
  }
}

export default ToastNotificationsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "toastnotifications-dashboard": ToastNotificationsDashboardElement;
  }
}
