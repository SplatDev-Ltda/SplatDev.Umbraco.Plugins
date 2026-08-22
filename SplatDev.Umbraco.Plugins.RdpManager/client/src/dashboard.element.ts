import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface RdpConnection {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string | null;
  domain: string | null;
  notes: string | null;
  colorDepth: number;
  fullScreen: boolean;
  width: number;
  height: number;
  createdAt?: string;
}

const NEW: RdpConnection = {
  id: 0, name: "", host: "", port: 3389, username: null, domain: null,
  notes: null, colorDepth: 32, fullScreen: true, width: 1920, height: 1080,
};

/**
 * Saved RDP connections, and the .rdp files generated from them.
 *
 * The previous dashboard was the estate's shared placeholder and called nothing, over a
 * service that already stored connections and generated valid .rdp files.
 */
interface DirectoryUser {
  login: string;
  userPrincipalName?: string | null;
  domain?: string | null;
  displayName?: string | null;
  email?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  isEnabled: boolean;
  source?: string | null;
}

interface DirectoryStatus {
  configured: boolean;
  provider?: string | null;
  canCreateUsers: boolean;
  reason?: string | null;
}

interface DirectoryUserDraft {
  login: string;
  givenName: string;
  surname: string;
  displayName: string;
  email: string;
  department: string;
  jobTitle: string;
  telephone: string;
  requirePasswordChange: boolean;
  enabled: boolean;
}

const EMPTY_USER: DirectoryUserDraft = {
  login: "", givenName: "", surname: "", displayName: "", email: "",
  department: "", jobTitle: "", telephone: "",
  requirePasswordChange: true, enabled: true,
};

@customElement("rdpmanager-dashboard")
export class RdpManagerDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 62ch; }
    .row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-weight: 600; font-size: 0.8125rem; }
    .field input, .field select, .field textarea {
      padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 4px; font: inherit; min-width: 170px; box-sizing: border-box; }
    .field.narrow input, .field.narrow select { min-width: 110px; }
    .field textarea { min-width: 320px; min-height: 60px; }
    .grow { flex: 1 1 220px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.ok { background: #d1fae5; color: #065f46; }
    .msg.bad { background: #fee2e2; color: #991b1b; }
    .mono { font-family: var(--uui-font-monospace, monospace); font-size: 0.8125rem; }
    .hint { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 0; }
    uui-table { width: 100%; }
  `;

  @state() private _items: RdpConnection[] = [];
  @state() private _draft: RdpConnection | null = null;
  @state() private _loading = true;
  @state() private _busy = false;
  @state() private _msg: { ok: boolean; text: string } | null = null;

  // Directory integration. Everything here stays inert until a site configures one, and
  // the create form is only offered when the site has also switched creation on.
  @state() private _dir: DirectoryStatus | null = null;
  @state() private _dirTerm = "";
  @state() private _dirResults: DirectoryUser[] = [];
  @state() private _dirSearching = false;
  @state() private _showCreateUser = false;
  @state() private _newUser: DirectoryUserDraft = { ...EMPTY_USER };
  @state() private _createdUser: DirectoryUser | null = null;

  private readonly _api = "/umbraco/api/RdpManagerApi";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
    void this.#loadDirectory();
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const r = await this.#fetch(`${this._api}/GetAll`, { credentials: "same-origin" });
      if (r.ok) this._items = await r.json();
    } finally {
      this._loading = false;
    }
  }

  private readonly _dirApi = "/umbraco/api/RdpDirectory";

  /** Asks what the directory can do here, so the panel offers only what will work. */
  async #loadDirectory(): Promise<void> {
    try {
      const r = await this.#fetch(`${this._dirApi}/Status`, { credentials: "same-origin" });
      if (r.ok) this._dir = await r.json();
    } catch {
      // A directory that cannot be reached must not stop the connections list loading.
      this._dir = null;
    }
  }

  async #searchDirectory(): Promise<void> {
    const term = this._dirTerm.trim();
    if (!term) { this._dirResults = []; return; }

    this._dirSearching = true;
    try {
      const r = await this.#fetch(`${this._dirApi}/Search?term=${encodeURIComponent(term)}`, {
        credentials: "same-origin",
      });
      this._dirResults = r.ok ? await r.json() : [];
      if (r.ok && this._dirResults.length === 0) {
        this._msg = { ok: false, text: `No account matched "${term}".` };
      }
    } catch {
      this._msg = { ok: false, text: "The directory could not be searched." };
      this._dirResults = [];
    } finally {
      this._dirSearching = false;
    }
  }

  /** Fills the open connection from a directory account. */
  #useUser(u: DirectoryUser): void {
    if (!this._draft) this._draft = { ...NEW };
    this._draft = {
      ...this._draft,
      username: u.login,
      domain: u.domain ?? this._draft.domain,
      notes: this._draft.notes || [u.displayName, u.jobTitle, u.department].filter(Boolean).join(" · "),
    };
    this._dirResults = [];
    this._dirTerm = "";
    this._msg = { ok: true, text: `Filled in from ${u.source ?? "the directory"}: ${u.login}.` };
  }

  async #createUser(): Promise<void> {
    const d = this._newUser;
    if (!d.login.trim() || !d.givenName.trim() || !d.surname.trim()) {
      this._msg = { ok: false, text: "A login, first name and surname are required." };
      return;
    }

    this._busy = true;
    this._createdUser = null;
    try {
      const r = await this.#fetch(`${this._dirApi}/CreateUser`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: d.login.trim(),
          givenName: d.givenName.trim(),
          surname: d.surname.trim(),
          displayName: d.displayName.trim() || null,
          email: d.email.trim() || null,
          department: d.department.trim() || null,
          jobTitle: d.jobTitle.trim() || null,
          telephone: d.telephone.trim() || null,
          requirePasswordChange: d.requirePasswordChange,
          enabled: d.enabled,
        }),
      });
      const result = await r.json();

      // "Already exists" is an answer, not a failure: show which account was found and
      // offer it, rather than making someone search again for what was just reported.
      this._createdUser = result.user ?? null;
      this._msg = { ok: result.succeeded === true, text: result.message ?? "Nothing happened." };
      if (result.succeeded) {
        this._newUser = { ...EMPTY_USER };
        this._showCreateUser = false;
      }
    } catch {
      this._msg = { ok: false, text: "The account could not be created." };
    } finally {
      this._busy = false;
    }
  }

  #dirPanel() {
    const dir = this._dir;
    if (!dir) return nothing;

    if (!dir.configured) {
      return html`
        <uui-box headline="Directory" style="margin-top:16px;">
          <p class="empty">${dir.reason}</p>
        </uui-box>`;
    }

    return html`
      <uui-box headline="Directory — ${dir.provider}" style="margin-top:16px;">
        <p class="description" style="margin-top:0">
          Find someone in ${dir.provider} to fill a connection's username and domain from,
          rather than typing them and hoping they match.
        </p>

        <div class="row">
          <div class="field grow">
            <label for="dq">Search</label>
            <uui-input id="dq" placeholder="name, login or e-mail"
              .value=${this._dirTerm}
              @input=${(e: Event) => (this._dirTerm = (e.target as HTMLInputElement).value)}
              @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") void this.#searchDirectory(); }}
            ></uui-input>
          </div>
          <uui-button look="secondary" ?disabled=${this._dirSearching}
            @click=${() => this.#searchDirectory()}>
            ${this._dirSearching ? "Searching…" : "Search"}
          </uui-button>
          ${dir.canCreateUsers
            ? html`<uui-button look="primary" color="positive"
                @click=${() => { this._showCreateUser = !this._showCreateUser; this._createdUser = null; }}>
                ${this._showCreateUser ? "Cancel" : "Create user"}
              </uui-button>`
            : nothing}
        </div>

        ${!dir.canCreateUsers && dir.reason
          ? html`<p class="hint" style="margin-top:8px">${dir.reason}</p>`
          : nothing}

        ${this._dirResults.length > 0
          ? html`
              <uui-table style="margin-top:12px">
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Login</uui-table-head-cell>
                  <uui-table-head-cell>E-mail</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._dirResults.map(
                  (u) => html`
                    <uui-table-row>
                      <uui-table-cell><strong>${u.displayName || "—"}</strong></uui-table-cell>
                      <uui-table-cell><code>${u.login}</code></uui-table-cell>
                      <uui-table-cell>${u.email || "—"}</uui-table-cell>
                      <uui-table-cell>${u.isEnabled ? "enabled" : "disabled"}</uui-table-cell>
                      <uui-table-cell>
                        <uui-button compact look="secondary" label="Use ${u.login}"
                          @click=${() => this.#useUser(u)}>Use</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `,
                )}
              </uui-table>`
          : nothing}

        ${this._createdUser
          ? html`
              <div class="msg ok" style="margin-top:12px">
                <strong>${this._createdUser.login}</strong>
                ${this._createdUser.displayName ? html` — ${this._createdUser.displayName}` : nothing}
                <uui-button compact look="secondary" style="margin-left:8px"
                  @click=${() => this.#useUser(this._createdUser!)}>Use for a connection</uui-button>
              </div>`
          : nothing}

        ${this._showCreateUser && dir.canCreateUsers ? this.#createUserForm() : nothing}
      </uui-box>`;
  }

  #createUserForm() {
    const d = this._newUser;
    const set = (k: keyof DirectoryUserDraft) => (e: Event) =>
      (this._newUser = { ...this._newUser, [k]: (e.target as HTMLInputElement).value });

    return html`
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--uui-color-border,#e5e7eb)">
        <div class="row">
          <div class="field grow">
            <label for="cl">Login <span class="hint">(required)</span></label>
            <uui-input id="cl" .value=${d.login} @input=${set("login")}></uui-input>
          </div>
          <div class="field grow">
            <label for="cg">First name <span class="hint">(required)</span></label>
            <uui-input id="cg" .value=${d.givenName} @input=${set("givenName")}></uui-input>
          </div>
          <div class="field grow">
            <label for="cs">Surname <span class="hint">(required)</span></label>
            <uui-input id="cs" .value=${d.surname} @input=${set("surname")}></uui-input>
          </div>
        </div>
        <div class="row">
          <div class="field grow">
            <label for="cd">Display name <span class="hint">(optional)</span></label>
            <uui-input id="cd" placeholder="built from the names when empty"
              .value=${d.displayName} @input=${set("displayName")}></uui-input>
          </div>
          <div class="field grow">
            <label for="ce">E-mail <span class="hint">(optional)</span></label>
            <uui-input id="ce" type="email" .value=${d.email} @input=${set("email")}></uui-input>
          </div>
        </div>
        <div class="row">
          <div class="field grow">
            <label for="cdep">Department <span class="hint">(optional)</span></label>
            <uui-input id="cdep" .value=${d.department} @input=${set("department")}></uui-input>
          </div>
          <div class="field grow">
            <label for="cjt">Job title <span class="hint">(optional)</span></label>
            <uui-input id="cjt" .value=${d.jobTitle} @input=${set("jobTitle")}></uui-input>
          </div>
          <div class="field grow">
            <label for="ctel">Telephone <span class="hint">(optional)</span></label>
            <uui-input id="ctel" .value=${d.telephone} @input=${set("telephone")}></uui-input>
          </div>
        </div>
        <div class="row" style="align-items:center;gap:18px">
          <uui-toggle label="Must change password at first sign-in"
            ?checked=${d.requirePasswordChange}
            @change=${(e: Event) =>
              (this._newUser = { ...this._newUser, requirePasswordChange: (e.target as HTMLInputElement).checked })}
            >Must change password at first sign-in</uui-toggle>
        </div>
        <p class="hint">
          No password is set from here. The account is created needing one, and an
          administrator sets it in the directory — a password typed into this form would
          travel through the browser and the request log to get there.
        </p>
        <div class="row">
          <uui-button look="primary" color="positive" ?disabled=${this._busy}
            @click=${() => this.#createUser()}>
            ${this._busy ? "Creating…" : "Create"}
          </uui-button>
        </div>
      </div>`;
  }

  async #save(): Promise<void> {
    if (!this._draft) return;
    this._busy = true;
    this._msg = null;
    try {
      const editing = this._draft.id > 0;
      const r = await this.#fetch(`${this._api}/${editing ? "Update" : "Create"}`, {
        method: editing ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._draft),
      });
      const result = await r.json();
      this._msg = { ok: r.ok, text: result.message ?? (r.ok ? "Saved." : "Could not save.") };
      if (r.ok) { this._draft = null; await this.#load(); }
    } catch (e) {
      this._msg = { ok: false, text: `The request failed: ${(e as Error).message}` };
    } finally {
      this._busy = false;
    }
  }

  async #remove(c: RdpConnection): Promise<void> {
    if (!confirm(`Delete "${c.name}"?`)) return;
    this._busy = true;
    this._msg = null;
    try {
      const r = await this.#fetch(`${this._api}/Delete?id=${c.id}`, {
        method: "DELETE", credentials: "same-origin",
      });
      const result = await r.json();
      this._msg = { ok: r.ok, text: result.message ?? "Deleted." };
      if (this._draft?.id === c.id) this._draft = null;
      await this.#load();
    } catch (e) {
      this._msg = { ok: false, text: `The request failed: ${(e as Error).message}` };
    } finally {
      this._busy = false;
    }
  }

  /**
   * Downloads the generated .rdp.
   *
   * Fetched rather than linked so the request carries the backoffice session — the
   * endpoint is authorized, and a bare anchor would land on the login page instead of
   * the file.
   */
  async #download(c: RdpConnection): Promise<void> {
    this._msg = null;
    try {
      const r = await this.#fetch(`${this._api}/DownloadRdpFile?id=${c.id}`, { credentials: "same-origin" });
      if (!r.ok) throw new Error(String(r.status));

      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${c.name.replace(/[^\w.-]+/g, "_")}.rdp`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      this._msg = { ok: false, text: `Could not download the file (${(e as Error).message}).` };
    }
  }

  #set<K extends keyof RdpConnection>(k: K, v: RdpConnection[K]) {
    if (this._draft) this._draft = { ...this._draft, [k]: v };
  }

  #form() {
    const d = this._draft;
    if (!d) return nothing;

    return html`
      <uui-box headline=${d.id > 0 ? `Edit ${d.name}` : "New connection"} style="margin-top:16px;">
        <div class="row">
          <div class="field grow">
            <label for="n">Name</label>
            <input id="n" .value=${d.name}
              @input=${(e: InputEvent) => this.#set("name", (e.target as HTMLInputElement).value)} />
          </div>
          <div class="field grow">
            <label for="h">Host</label>
            <input id="h" .value=${d.host} placeholder="server.example.com"
              @input=${(e: InputEvent) => this.#set("host", (e.target as HTMLInputElement).value)} />
          </div>
          <div class="field narrow">
            <label for="p">Port</label>
            <input id="p" type="number" min="1" max="65535" .value=${String(d.port)}
              @input=${(e: InputEvent) => this.#set("port", Number((e.target as HTMLInputElement).value))} />
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field">
            <label for="u">Username <span class="hint">(optional)</span></label>
            <input id="u" .value=${d.username ?? ""}
              @input=${(e: InputEvent) => this.#set("username", (e.target as HTMLInputElement).value)} />
          </div>
          <div class="field">
            <label for="dm">Domain <span class="hint">(optional)</span></label>
            <input id="dm" .value=${d.domain ?? ""}
              @input=${(e: InputEvent) => this.#set("domain", (e.target as HTMLInputElement).value)} />
          </div>
          <div class="field narrow">
            <label for="w">Width</label>
            <input id="w" type="number" min="640" .value=${String(d.width)}
              @input=${(e: InputEvent) => this.#set("width", Number((e.target as HTMLInputElement).value))} />
          </div>
          <div class="field narrow">
            <label for="ht">Height</label>
            <input id="ht" type="number" min="480" .value=${String(d.height)}
              @input=${(e: InputEvent) => this.#set("height", Number((e.target as HTMLInputElement).value))} />
          </div>
          <div class="field narrow">
            <label for="cd">Colour depth</label>
            <select id="cd" .value=${String(d.colorDepth)}
              @change=${(e: Event) => this.#set("colorDepth", Number((e.target as HTMLSelectElement).value))}>
              <option value="15">15</option><option value="16">16</option>
              <option value="24">24</option><option value="32">32</option>
            </select>
          </div>
          <div class="field narrow">
            <label>Full screen</label>
            <uui-toggle ?checked=${d.fullScreen}
              @change=${(e: Event) => this.#set("fullScreen", (e.target as HTMLInputElement).checked)}></uui-toggle>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field grow">
            <label for="nt">Notes</label>
            <textarea id="nt" .value=${d.notes ?? ""}
              @input=${(e: InputEvent) => this.#set("notes", (e.target as HTMLTextAreaElement).value)}></textarea>
          </div>
        </div>

        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy} @click=${this.#save}>
            ${this._busy ? "Saving…" : d.id > 0 ? "Save changes" : "Create"}
          </uui-button>
          <uui-button look="secondary" @click=${() => (this._draft = null)}>Cancel</uui-button>
        </div>
      </uui-box>`;
  }

  override render() {
    return html`
      <h1>RDP connections</h1>
      <p class="description">
        Saved remote desktop connections. Download generates a standard <code>.rdp</code>
        file for the host, resolution and colour depth below — it never contains a password.
      </p>

      <div class="row">
        <uui-button look="primary" ?disabled=${this._busy}
          @click=${() => (this._draft = { ...NEW })}>New connection</uui-button>
      </div>

      ${this._msg ? html`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.text}</div>` : nothing}

      ${this.#form()}

      ${this.#dirPanel()}

      <uui-box headline="Connections" style="margin-top:16px;">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._items.length === 0
            ? html`<p class="empty">No connections yet.</p>`
            : html`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Name</uui-table-head-cell>
                    <uui-table-head-cell>Host</uui-table-head-cell>
                    <uui-table-head-cell>Sign in as</uui-table-head-cell>
                    <uui-table-head-cell>Display</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._items.map(c => html`
                    <uui-table-row>
                      <uui-table-cell>
                        <strong>${c.name}</strong>
                        ${c.notes ? html`<div class="hint">${c.notes}</div>` : nothing}
                      </uui-table-cell>
                      <uui-table-cell class="mono">${c.host}:${c.port}</uui-table-cell>
                      <uui-table-cell class="mono">
                        ${c.username
                          ? html`${c.domain ? `${c.domain}\\` : ""}${c.username}`
                          : html`<span class="hint">not set</span>`}
                      </uui-table-cell>
                      <uui-table-cell class="hint">
                        ${c.fullScreen ? "full screen" : `${c.width}×${c.height}`} · ${c.colorDepth}-bit
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        <uui-button look="secondary" compact label="Download"
                          @click=${() => this.#download(c)}>Download</uui-button>
                        <uui-button look="secondary" compact label="Edit"
                          @click=${() => (this._draft = { ...c })}>Edit</uui-button>
                        <uui-button look="secondary" color="danger" compact label="Delete"
                          ?disabled=${this._busy} @click=${() => this.#remove(c)}>Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>`)}
                </uui-table>`}
      </uui-box>`;
  }
}

export default RdpManagerDashboardElement;

declare global {
  interface HTMLElementTagNameMap { "rdpmanager-dashboard": RdpManagerDashboardElement; }
}
