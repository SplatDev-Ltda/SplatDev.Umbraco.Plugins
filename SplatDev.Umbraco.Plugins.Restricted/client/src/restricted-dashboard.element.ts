import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/document";
import "@umbraco-cms/backoffice/member-group";

import { createAuthFetch } from "./auth-fetch";

interface MemberGroupRef {
  key: string;
  name: string;
}

interface ContentRef {
  id: number;
  key: string;
  name: string;
  path: string;
}

interface RestrictedNode {
  node: ContentRef;
  loginPage: ContentRef | null;
  errorPage: ContentRef | null;
  memberGroups: MemberGroupRef[];
}

interface RestrictResult {
  success: boolean;
  message: string;
}

/**
 * Public access, driven by the backoffice's own pickers.
 *
 * The previous dashboard asked the editor to type four things by hand: the node id of the
 * page to protect, the node id of the login page, the node id of the error page, and the
 * member groups as a comma-separated string. Node ids are not visible anywhere an editor
 * normally looks, they differ between environments, and a typo silently protected the
 * wrong branch — the API logged a warning and returned success either way. The list of
 * protected content then rendered as bare integers.
 *
 * Everything here is picked, not typed, and the list shows names with their breadcrumb.
 */
@customElement("restricted-dashboard")
export class RestrictedDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 60ch; }
    .field { margin-bottom: 18px; }
    .field > label { display: block; font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .field > .help { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; margin: 0 0 6px; }
    .actions { display: flex; gap: 12px; align-items: center; margin-top: 8px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 16px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .crumb { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .groups { display: flex; gap: 6px; flex-wrap: wrap; }
    .missing { color: #b45309; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 16px 0; }
    uui-table { width: 100%; }
  `;

  @state() private _restricted: RestrictedNode[] = [];
  @state() private _loading = true;
  @state() private _saving = false;

  @state() private _node: string[] = [];
  @state() private _loginPage: string[] = [];
  @state() private _errorPage: string[] = [];
  @state() private _groups: string[] = [];

  @state() private _result: RestrictResult | null = null;

  private readonly _api = "/umbraco/api/restricted";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const r = await this.#fetch(`${this._api}/GetRestrictedNodes`, { credentials: "same-origin" });
      if (r.ok) this._restricted = await r.json();
    } finally {
      this._loading = false;
    }
  }

  /** The pickers hand back a comma-separated string of GUID keys. */
  #selection(e: Event): string[] {
    const value = (e.target as { selection?: string[]; value?: string }).selection
      ?? String((e.target as { value?: string }).value ?? "").split(",");
    return value.filter(Boolean);
  }

  async #save(): Promise<void> {
    this._saving = true;
    this._result = null;
    try {
      const r = await this.#fetch(`${this._api}/RestrictNode`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node: this._node[0] ?? "",
          loginPage: this._loginPage[0] ?? "",
          errorPage: this._errorPage[0] ?? "",
          memberGroups: this._groups,
        }),
      });
      this._result = await r.json();
      if (r.ok) {
        this._node = [];
        this._groups = [];
        await this.#load();
      }
    } catch (e) {
      this._result = { success: false, message: `The request failed: ${(e as Error).message}` };
    } finally {
      this._saving = false;
    }
  }

  async #remove(entry: RestrictedNode): Promise<void> {
    if (!confirm(`Make "${entry.node.name}" public again? Everything beneath it becomes public too.`))
      return;

    this._result = null;
    try {
      const r = await this.#fetch(`${this._api}/UnrestrictNode?node=${encodeURIComponent(entry.node.key)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      this._result = await r.json();
      await this.#load();
    } catch (e) {
      this._result = { success: false, message: `The request failed: ${(e as Error).message}` };
    }
  }

  /** Loads an existing rule back into the form, so amending does not mean retyping. */
  #edit(entry: RestrictedNode): void {
    this._node = [entry.node.key];
    this._loginPage = entry.loginPage ? [entry.loginPage.key] : [];
    this._errorPage = entry.errorPage ? [entry.errorPage.key] : [];
    this._groups = entry.memberGroups.filter(g => g.key !== "00000000-0000-0000-0000-000000000000")
                                     .map(g => g.key);
    this._result = null;
    this.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  #renderForm() {
    return html`
      <uui-box headline="Protect a page">
        <div class="field">
          <label for="node">Page to protect</label>
          <p class="help">The page and everything beneath it will require membership.</p>
          <umb-input-document
            id="node"
            max="1"
            .selection=${this._node}
            @change=${(e: Event) => (this._node = this.#selection(e))}>
          </umb-input-document>
        </div>

        <div class="field">
          <label for="groups">Member groups allowed</label>
          <p class="help">A member in any one of these groups can see the page.</p>
          <umb-input-member-group
            id="groups"
            .selection=${this._groups}
            @change=${(e: Event) => (this._groups = this.#selection(e))}>
          </umb-input-member-group>
        </div>

        <div class="field">
          <label for="login">Login page</label>
          <p class="help">Where visitors who are not signed in are sent.</p>
          <umb-input-document
            id="login"
            max="1"
            .selection=${this._loginPage}
            @change=${(e: Event) => (this._loginPage = this.#selection(e))}>
          </umb-input-document>
        </div>

        <div class="field">
          <label for="error">Access denied page</label>
          <p class="help">Where signed-in members who are not in an allowed group are sent.</p>
          <umb-input-document
            id="error"
            max="1"
            .selection=${this._errorPage}
            @change=${(e: Event) => (this._errorPage = this.#selection(e))}>
          </umb-input-document>
        </div>

        <div class="actions">
          <uui-button
            look="primary"
            ?disabled=${this._saving || this._node.length === 0}
            @click=${this.#save}>
            ${this._saving ? "Saving…" : "Protect page"}
          </uui-button>
        </div>

        ${this._result
          ? html`<div class="msg ${this._result.success ? "success" : "error"}">
                   ${this._result.message}
                 </div>`
          : nothing}
      </uui-box>
    `;
  }

  #renderRow(entry: RestrictedNode) {
    return html`
      <uui-table-row>
        <uui-table-cell>
          <strong>${entry.node.name}</strong>
          ${entry.node.path ? html`<div class="crumb">${entry.node.path}</div>` : nothing}
        </uui-table-cell>
        <uui-table-cell>
          <div class="groups">
            ${entry.memberGroups.map(g =>
              g.key === "00000000-0000-0000-0000-000000000000"
                ? html`<uui-tag look="warning" title="This group no longer exists">
                         ${g.name}
                       </uui-tag>`
                : html`<uui-tag look="secondary">${g.name}</uui-tag>`)}
          </div>
        </uui-table-cell>
        <uui-table-cell>
          ${entry.loginPage?.name ?? html`<span class="missing">missing</span>`}
        </uui-table-cell>
        <uui-table-cell>
          ${entry.errorPage?.name ?? html`<span class="missing">missing</span>`}
        </uui-table-cell>
        <uui-table-cell style="text-align:right;white-space:nowrap;">
          <uui-button look="secondary" compact label="Edit" @click=${() => this.#edit(entry)}>
            Edit
          </uui-button>
          <uui-button look="secondary" color="danger" compact label="Remove"
            @click=${() => this.#remove(entry)}>
            Remove
          </uui-button>
        </uui-table-cell>
      </uui-table-row>
    `;
  }

  override render() {
    return html`
      <h1>Restricted content</h1>
      <p class="description">
        Require membership of a group to view a page. Protection applies to the page and
        everything beneath it, and is the same public-access rule Umbraco applies from the
        content tree.
      </p>

      ${this.#renderForm()}

      <uui-box headline="Protected pages" style="margin-top:16px;">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._restricted.length === 0
            ? html`<p class="empty">Nothing is protected yet.</p>`
            : html`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Page</uui-table-head-cell>
                    <uui-table-head-cell>Allowed groups</uui-table-head-cell>
                    <uui-table-head-cell>Login</uui-table-head-cell>
                    <uui-table-head-cell>Access denied</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._restricted.map(e => this.#renderRow(e))}
                </uui-table>
              `}
      </uui-box>
    `;
  }
}

export default RestrictedDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "restricted-dashboard": RestrictedDashboardElement;
  }
}
