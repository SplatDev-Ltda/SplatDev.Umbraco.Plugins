import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface MemberGroup {
  id: number;
  name: string;
}

interface MemberType {
  id: number;
  name: string;
  alias: string;
}

interface MemberInfo {
  id: number;
  name: string;
  email: string;
  username: string;
  isApproved: boolean;
  isLockedOut: boolean;
}

@customElement("membergroups-dashboard")
export class MemberGroupsDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .tabs { display: flex; gap: 0; border-bottom: 2px solid var(--uui-color-border, #e5e7eb); margin-bottom: 24px; flex-wrap: wrap; }
    .tab { padding: 10px 16px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; font-weight: 500; font-size: 0.875rem; }
    .tab.active { border-bottom-color: var(--uui-color-focus, #1a56db); color: var(--uui-color-focus, #1a56db); }
    .form-row { margin-bottom: 16px; }
    .form-row label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 0.875rem; }
    .result { padding: 12px 16px; border-radius: 6px; margin-top: 12px; }
    .result.success { background: #d1fae5; color: #065f46; }
    .result.error { background: #fde8e8; color: #c81e1e; }
    .btn-row { display: flex; gap: 8px; }
    code { background: #f3f4f6; padding: 1px 6px; border-radius: 4px; font-size: 0.8rem; }
  
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

  @state() private _activeTab: string = "groups";
  @state() private _groups: MemberGroup[] = [];
  @state() private _types: MemberType[] = [];
  @state() private _foundMember: MemberInfo | null = null;
  @state() private _result: { success: boolean; message: string } | null = null;
  @state() private _loading: boolean = false;

  @state() private _loadError: string | null = null;

  @state() private _newGroupName = "";
  @state() private _assignEmail = "";
  @state() private _assignGroup = "";
  @state() private _busy = "";

  private _apiBase = "/umbraco/api/membergroups";

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadGroups();
    this._loadTypes();
  }

  private async _loadGroups(): Promise<void> {
    try {
      const resp = await this.#fetch(`${this._apiBase}/GetMemberGroups`);
      if (this.#responseOk(resp)) this._groups = await resp.json();
    } catch {
      this._loadError ??= "The request failed. See the browser console for details."; this._groups = []; }
  }

  private async _loadTypes(): Promise<void> {
    try {
      const resp = await this.#fetch(`${this._apiBase}/GetMemberTypes`);
      if (this.#responseOk(resp)) this._types = await resp.json();
    } catch {
      this._loadError ??= "The request failed. See the browser console for details."; this._types = []; }
  }

  /**
   * Calls one of the mutating endpoints.
   *
   * This helper was already here and nothing ever called it: six of the nine operations
   * the API exposes — create a group, add a member to one, and the rest — had no way in
   * from the dashboard at all.
   */
  private async _post(action: string, body?: object | string): Promise<void> {
    this._loading = true;
    this._result = null;
    try {
      const url = typeof body === "string"
        ? `${this._apiBase}/${action}?${body}`
        : `${this._apiBase}/${action}`;
      const resp = await this.#fetch(url, {
        method: "POST",
        headers: typeof body === "object" ? { "Content-Type": "application/json" } : {},
        body: typeof body === "object" ? JSON.stringify(body) : undefined,
      });
      const data = await resp.json();
      this._result = { success: resp.ok, message: data.message ?? (resp.ok ? "Success" : "Failed") };
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
      this._result = { success: false, message: "Network error." };
    } finally {
      this._loading = false;
    }
  }

  private async _lookupMember(email: string): Promise<void> {
    this._loading = true;
    this._foundMember = null;
    this._result = null;
    try {
      const resp = await this.#fetch(`${this._apiBase}/GetMemberByEmail?email=${encodeURIComponent(email)}`);
      if (this.#responseOk(resp)) {
        this._foundMember = await resp.json();
      } else {
        this._result = { success: false, message: "Member not found." };
      }
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
      this._result = { success: false, message: "Network error." };
    } finally {
      this._loading = false;
    }
  }

  /** Creates a member group. SaveMemberGroup is the endpoint that creates *member*
   * groups; CreateGroup creates a backoffice user group, which is a different thing. */
  private async _createGroup(): Promise<void> {
    const name = this._newGroupName.trim();
    if (!name) {
      this._result = { success: false, message: "Give the group a name." };
      return;
    }
    this._busy = "create";
    await this._post("SaveMemberGroup", `groupName=${encodeURIComponent(name)}`);
    this._busy = "";
    if (this._result?.success) {
      this._newGroupName = "";
      await this._loadGroups();
    }
  }

  /** Puts an existing member into a group, by the member's email address. */
  private async _addToGroup(email?: string, group?: string): Promise<void> {
    const targetEmail = (email ?? this._assignEmail).trim();
    const targetGroup = (group ?? this._assignGroup).trim();
    if (!targetEmail || !targetGroup) {
      this._result = { success: false, message: "Choose a member and a group." };
      return;
    }
    this._busy = "assign";
    await this._post("AddToGroup", { email: targetEmail, group: targetGroup });
    this._busy = "";
    if (this._result?.success) this._assignEmail = "";
  }

  private _renderGroups() {
    return html`
      <uui-box headline="Member groups (${this._groups.length})">
        ${this._groups.length === 0
          ? html`<p style="color:var(--uui-color-text-alt,#6b7280)">No member groups yet. Create one below.</p>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>ID</uui-table-head-cell>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                </uui-table-head>
                ${this._groups.map((g) => html`
                  <uui-table-row>
                    <uui-table-cell>${g.id}</uui-table-cell>
                    <uui-table-cell><strong>${g.name}</strong></uui-table-cell>
                  </uui-table-row>
                `)}
              </uui-table>
            `}
      </uui-box>

      <uui-box headline="Create a member group">
        <div class="form-row">
          <label for="newGroup">Group name</label>
          <uui-input
            id="newGroup"
            label="Group name"
            placeholder="e.g. Subscribers"
            .value=${this._newGroupName}
            @input=${(e: Event) => (this._newGroupName = (e.target as HTMLInputElement).value)}
          ></uui-input>
        </div>
        <div class="btn-row">
          <uui-button
            look="primary"
            color="positive"
            label="Create group"
            ?disabled=${this._busy === "create" || this._loading}
            @click=${() => this._createGroup()}
            >${this._busy === "create" ? "Creating…" : "Create group"}</uui-button
          >
        </div>
      </uui-box>

      <uui-box headline="Add a member to a group">
        <div class="form-row">
          <label for="assignEmail">Member email</label>
          <uui-input
            id="assignEmail"
            type="email"
            label="Member email"
            placeholder="member@example.com"
            .value=${this._assignEmail}
            @input=${(e: Event) => (this._assignEmail = (e.target as HTMLInputElement).value)}
          ></uui-input>
        </div>
        <div class="form-row">
          <label for="assignGroup">Group</label>
          <uui-select
            id="assignGroup"
            label="Group"
            .value=${this._assignGroup}
            @change=${(e: Event) => (this._assignGroup = (e.target as HTMLSelectElement).value)}
            .options=${this._groups.map((g) => ({
              name: g.name,
              value: g.name,
              selected: g.name === this._assignGroup,
            }))}
          ></uui-select>
        </div>
        <div class="btn-row">
          <uui-button
            look="primary"
            label="Add to group"
            ?disabled=${this._busy === "assign" || this._groups.length === 0}
            @click=${() => this._addToGroup()}
            >${this._busy === "assign" ? "Adding…" : "Add to group"}</uui-button
          >
        </div>
        ${this._groups.length === 0
          ? html`<p style="color:var(--uui-color-text-alt,#6b7280);font-size:0.85rem;margin:10px 0 0">
              Create a group first — there is nothing to add anyone to yet.
            </p>`
          : ""}
      </uui-box>
    `;
  }

  private _renderTypes() {
    return html`
      <uui-box headline="Member Types">
        <p style="color:var(--uui-color-text-alt,#6b7280);font-size:0.875rem;margin:0 0 14px">
          Shown for reference. Member types are created and edited on the Member Types
          dashboard.
        </p>
        ${this._types.length === 0
          ? html`<p style="color:var(--uui-color-text-alt,#6b7280)">No member types found.</p>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Alias</uui-table-head-cell>
                </uui-table-head>
                ${this._types.map((t) => html`
                  <uui-table-row>
                    <uui-table-cell><strong>${t.name}</strong></uui-table-cell>
                    <uui-table-cell><code>${t.alias}</code></uui-table-cell>
                  </uui-table-row>
                `)}
              </uui-table>
            `}
      </uui-box>
    `;
  }

  private _renderLookup() {
    return html`
      <uui-box headline="Lookup Member by Email">
        <div class="form-row">
          <label>Email Address</label>
          <uui-input id="lookupEmail" type="email" placeholder="member@example.com"></uui-input>
        </div>
        <uui-button
          look="primary"
          label="Lookup"
          ?disabled=${this._loading}
          @click=${() => {
            const el = this.shadowRoot?.getElementById("lookupEmail") as HTMLInputElement;
            this._lookupMember(el?.value ?? "");
          }}
        >Lookup</uui-button>

        ${this._foundMember ? html`
          <uui-box style="margin-top:16px">
            <uui-table>
              <uui-table-row><uui-table-cell><strong>ID</strong></uui-table-cell><uui-table-cell>${this._foundMember.id}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Name</strong></uui-table-cell><uui-table-cell>${this._foundMember.name}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Email</strong></uui-table-cell><uui-table-cell>${this._foundMember.email}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Username</strong></uui-table-cell><uui-table-cell>${this._foundMember.username}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Approved</strong></uui-table-cell><uui-table-cell>${this._foundMember.isApproved ? "Yes" : "No"}</uui-table-cell></uui-table-row>
              <uui-table-row><uui-table-cell><strong>Locked Out</strong></uui-table-cell><uui-table-cell>${this._foundMember.isLockedOut ? "Yes" : "No"}</uui-table-cell></uui-table-row>
            </uui-table>

            <div class="form-row" style="margin-top:16px">
              <label for="lookupAssignGroup">Add this member to a group</label>
              <uui-select
                id="lookupAssignGroup"
                label="Group"
                .value=${this._assignGroup}
                @change=${(e: Event) => (this._assignGroup = (e.target as HTMLSelectElement).value)}
                .options=${this._groups.map((g) => ({
                  name: g.name,
                  value: g.name,
                  selected: g.name === this._assignGroup,
                }))}
              ></uui-select>
            </div>
            <div class="btn-row">
              <uui-button
                look="primary"
                label="Add ${this._foundMember.email} to the selected group"
                ?disabled=${this._busy === "assign" || this._groups.length === 0}
                @click=${() => this._addToGroup(this._foundMember?.email, this._assignGroup)}
                >${this._busy === "assign" ? "Adding…" : "Add to group"}</uui-button
              >
            </div>
            ${this._groups.length === 0
              ? html`<p style="color:var(--uui-color-text-alt,#6b7280);font-size:0.85rem;margin:10px 0 0">
                  There are no member groups yet — create one on the Groups tab.
                </p>`
              : ""}
            ${this._result
              ? html`<div class="result ${this._result.success ? "success" : "error"}" style="margin-top:12px">${this._result.message}</div>`
              : ""}
          </uui-box>
        ` : ""}
        ${this._result && !this._foundMember
          ? html`<div class="result ${this._result.success ? "success" : "error"}">${this._result.message}</div>`
          : ""}
      </uui-box>
    `;
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
      <h1>Member Groups Manager</h1>
      <p class="description">Manage Umbraco member groups, member types, and user access.</p>

      <div class="tabs">
        <div class="tab ${this._activeTab === "groups" ? "active" : ""}" @click=${() => { this._activeTab = "groups"; }}>Groups</div>
        <div class="tab ${this._activeTab === "types" ? "active" : ""}" @click=${() => { this._activeTab = "types"; }}>Member Types</div>
        <div class="tab ${this._activeTab === "lookup" ? "active" : ""}" @click=${() => { this._activeTab = "lookup"; this._foundMember = null; this._result = null; }}>Lookup Member</div>
      </div>

      ${this._activeTab === "groups"
        ? this._renderGroups()
        : this._activeTab === "types"
        ? this._renderTypes()
        : this._renderLookup()}
    `;
  }
}

export default MemberGroupsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "membergroups-dashboard": MemberGroupsDashboardElement;
  }
}
