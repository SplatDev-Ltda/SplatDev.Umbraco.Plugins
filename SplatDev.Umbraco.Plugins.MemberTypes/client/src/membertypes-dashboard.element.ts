import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface MemberTypeItem {
  id: number;
  alias: string;
  name: string;
  description: string | null;
  createDate?: string;
  updateDate?: string;
  propertyCount: number;
}

interface MemberTypeProperty {
  alias: string;
  name: string;
  description: string | null;
  mandatory: boolean;
  sortOrder: number;
}

interface MemberTypeDetail extends MemberTypeItem {
  properties: MemberTypeProperty[];
}

/**
 * Create, rename and remove member types, and see the properties each one carries.
 *
 * The dashboard said "Manage custom member types and their properties" and then offered
 * no way to manage anything: it rendered one table and nothing else, while the API behind
 * it had supported create, update and delete the whole time. Creating one never worked
 * either — see MemberTypesService.
 */
@customElement("membertypes-dashboard")
export class MemberTypesDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 66ch; }

    uui-box { margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    uui-input { width: 100%; }
    .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 8px 0 0; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    td.right { text-align: right; white-space: nowrap; }
    code {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-alt, #f3f4f6); padding: 1px 5px; border-radius: 3px;
    }
    .muted { color: var(--uui-color-text-alt, #6b7280); }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

    .props { margin: 6px 0 0; padding: 10px 12px; background: var(--uui-color-surface-alt, #f9fafb); border-radius: 4px; }
    .props table { font-size: 0.85rem; }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .tag.req { background: #fee2e2; color: #991b1b; }

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

  @state() private _memberTypes: MemberTypeItem[] = [];
  @state() private _loading = false;
  @state() private _busy = "";
  @state() private _loadError: string | null = null;
  @state() private _message: { ok: boolean; text: string } | null = null;

  @state() private _newAlias = "";
  @state() private _newName = "";
  @state() private _newDescription = "";

  @state() private _editingAlias: string | null = null;
  @state() private _editName = "";
  @state() private _editDescription = "";

  @state() private _expanded: string | null = null;
  @state() private _detail: MemberTypeDetail | null = null;

  private readonly _apiBase = "/umbraco/api/membertypes";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
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

  /** Reads the server's message so a rejected change explains itself. */
  async #failureText(response: Response, fallback: string): Promise<string> {
    try {
      const text = await response.text();
      return text ? `${fallback} ${text.slice(0, 300)}` : fallback;
    } catch {
      return fallback;
    }
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#fetch(`${this._apiBase}/GetAll`);
      if (this.#responseOk(response)) this._memberTypes = await response.json();
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
      this._memberTypes = [];
    } finally {
      this._loading = false;
    }
  }

  async #create(): Promise<void> {
    const alias = this._newAlias.trim();
    const name = this._newName.trim();
    if (!alias || !name) {
      this._message = { ok: false, text: "A member type needs both an alias and a name." };
      return;
    }

    this._busy = "create";
    try {
      const response = await this.#fetch(`${this._apiBase}/Create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias, name, description: this._newDescription.trim() }),
      });
      if (response.ok) {
        this._message = { ok: true, text: `Created ${name}.` };
        this._newAlias = this._newName = this._newDescription = "";
        await this.#load();
      } else {
        this._message = { ok: false, text: await this.#failureText(response, "Could not create that member type.") };
      }
    } catch {
      this._message = { ok: false, text: "Could not create that member type." };
    } finally {
      this._busy = "";
    }
  }

  #startEdit(type: MemberTypeItem): void {
    this._editingAlias = type.alias;
    this._editName = type.name;
    this._editDescription = type.description ?? "";
    this._message = null;
  }

  async #saveEdit(): Promise<void> {
    const alias = this._editingAlias;
    if (!alias) return;
    const name = this._editName.trim();
    if (!name) {
      this._message = { ok: false, text: "A member type needs a name." };
      return;
    }

    this._busy = `edit:${alias}`;
    try {
      const response = await this.#fetch(`${this._apiBase}/Update?alias=${encodeURIComponent(alias)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: this._editDescription.trim() }),
      });
      if (response.ok) {
        this._message = { ok: true, text: `Updated ${name}.` };
        this._editingAlias = null;
        await this.#load();
      } else {
        this._message = { ok: false, text: await this.#failureText(response, "Could not update that member type.") };
      }
    } catch {
      this._message = { ok: false, text: "Could not update that member type." };
    } finally {
      this._busy = "";
    }
  }

  async #remove(type: MemberTypeItem): Promise<void> {
    // Deleting a member type takes its members' data with it, so make the consequence
    // explicit rather than relying on an undo that does not exist.
    const confirmed = window.confirm(
      `Delete the member type "${type.name}"?\n\nAny members of this type, and the values held in its ${type.propertyCount} propert${type.propertyCount === 1 ? "y" : "ies"}, go with it. This cannot be undone.`,
    );
    if (!confirmed) return;

    this._busy = `delete:${type.alias}`;
    try {
      const response = await this.#fetch(`${this._apiBase}/Delete?alias=${encodeURIComponent(type.alias)}`, {
        method: "DELETE",
      });
      if (response.ok) {
        this._message = { ok: true, text: `Deleted ${type.name}.` };
        if (this._expanded === type.alias) this._expanded = null;
        await this.#load();
      } else {
        this._message = { ok: false, text: await this.#failureText(response, "Could not delete that member type.") };
      }
    } catch {
      this._message = { ok: false, text: "Could not delete that member type." };
    } finally {
      this._busy = "";
    }
  }

  async #toggleProperties(type: MemberTypeItem): Promise<void> {
    if (this._expanded === type.alias) {
      this._expanded = null;
      return;
    }

    this._expanded = type.alias;
    this._detail = null;
    try {
      const response = await this.#fetch(`${this._apiBase}/GetByAlias?alias=${encodeURIComponent(type.alias)}`);
      if (this.#responseOk(response)) this._detail = await response.json();
    } catch {
      this._loadError ??= "Could not load the properties for that member type.";
    }
  }

  #when(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
  }

  #renderProperties() {
    if (!this._detail) return html`<div class="props muted">Loading properties…</div>`;
    if (this._detail.properties.length === 0)
      return html`<div class="props muted">This member type has no properties of its own.</div>`;

    return html`
      <div class="props">
        <table>
          <thead>
            <tr><th>Property</th><th>Alias</th><th>Required</th><th>Description</th></tr>
          </thead>
          <tbody>
            ${this._detail.properties.map(
              (p) => html`
                <tr>
                  <td>${p.name}</td>
                  <td><code>${p.alias}</code></td>
                  <td>${p.mandatory ? html`<span class="tag req">required</span>` : html`<span class="muted">optional</span>`}</td>
                  <td class="muted">${p.description || "—"}</td>
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  override render() {
    return html`
      <h1>Member Types</h1>
      <p class="description">
        The member types this site defines, the properties each one carries, and the
        controls to add, rename and remove them.
      </p>

      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : nothing}
      ${this._message
        ? html`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>`
        : nothing}

      <uui-box headline="Member types (${this._memberTypes.length})">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._memberTypes.length === 0
            ? html`<p class="empty">No member types are defined yet. Add one below.</p>`
            : html`
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Alias</th><th>Description</th>
                      <th>Properties</th><th>Updated</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this._memberTypes.map((t) => {
                      const editing = this._editingAlias === t.alias;
                      return html`
                        <tr>
                          <td>
                            ${editing
                              ? html`<uui-input
                                  label="Name"
                                  .value=${this._editName}
                                  @input=${(e: Event) => (this._editName = (e.target as HTMLInputElement).value)}
                                ></uui-input>`
                              : html`<strong>${t.name}</strong>`}
                          </td>
                          <td><code>${t.alias}</code></td>
                          <td>
                            ${editing
                              ? html`<uui-input
                                  label="Description"
                                  .value=${this._editDescription}
                                  @input=${(e: Event) => (this._editDescription = (e.target as HTMLInputElement).value)}
                                ></uui-input>`
                              : html`<span class="muted">${t.description || "—"}</span>`}
                          </td>
                          <td class="num">
                            <uui-button
                              compact
                              look="secondary"
                              label="Show the properties on ${t.name}"
                              @click=${() => this.#toggleProperties(t)}
                              >${t.propertyCount} ${this._expanded === t.alias ? "▾" : "▸"}</uui-button
                            >
                          </td>
                          <td class="num muted">${this.#when(t.updateDate)}</td>
                          <td class="right">
                            ${editing
                              ? html`
                                  <uui-button
                                    compact
                                    look="primary"
                                    color="positive"
                                    label="Save ${t.name}"
                                    ?disabled=${this._busy === `edit:${t.alias}`}
                                    @click=${this.#saveEdit}
                                    >Save</uui-button
                                  >
                                  <uui-button compact look="secondary" label="Cancel"
                                    @click=${() => (this._editingAlias = null)}>Cancel</uui-button>
                                `
                              : html`
                                  <uui-button compact look="secondary" label="Rename ${t.name}"
                                    @click=${() => this.#startEdit(t)}>Rename</uui-button>
                                  <uui-button
                                    compact
                                    look="secondary"
                                    color="danger"
                                    label="Delete ${t.name}"
                                    ?disabled=${this._busy === `delete:${t.alias}`}
                                    @click=${() => this.#remove(t)}
                                    >Delete</uui-button
                                  >
                                `}
                          </td>
                        </tr>
                        ${this._expanded === t.alias
                          ? html`<tr><td colspan="6">${this.#renderProperties()}</td></tr>`
                          : nothing}
                      `;
                    })}
                  </tbody>
                </table>
              `}
      </uui-box>

      <uui-box headline="Add a member type">
        <div class="grid">
          <div>
            <span class="field-label">Alias</span>
            <uui-input
              label="Alias"
              placeholder="e.g. premiumMember"
              .value=${this._newAlias}
              @input=${(e: Event) => (this._newAlias = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Name</span>
            <uui-input
              label="Name"
              placeholder="e.g. Premium Member"
              .value=${this._newName}
              @input=${(e: Event) => (this._newName = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Description</span>
            <uui-input
              label="Description"
              placeholder="Optional"
              .value=${this._newDescription}
              @input=${(e: Event) => (this._newDescription = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
        </div>
        <p class="hint">
          The alias is what templates and code refer to, and it cannot be changed later —
          the name and description can. Use letters and numbers, no spaces.
        </p>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Add member type"
            ?disabled=${this._busy === "create"}
            @click=${this.#create}
            >${this._busy === "create" ? "Adding…" : "Add member type"}</uui-button
          >
        </div>
      </uui-box>
    `;
  }
}

export default MemberTypesDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "membertypes-dashboard": MemberTypesDashboardElement;
  }
}
