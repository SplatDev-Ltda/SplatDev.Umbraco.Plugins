import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

type SettingType = "text" | "boolean" | "number" | "json";

interface SettingGroup {
  id: number;
  name: string;
  alias: string;
  description: string | null;
  sortOrder: number;
}

interface SiteSetting {
  id: number;
  groupId: number;
  key: string;
  value: string | null;
  type: SettingType;
  description: string | null;
}

interface SaveResult<T> {
  success: boolean;
  message: string;
  value: T | null;
}

const NEW_SETTING: SiteSetting = {
  id: 0, groupId: 0, key: "", value: "", type: "text", description: null,
};

/**
 * Site settings, grouped and typed.
 *
 * The previous dashboard was the estate's shared placeholder — a hardcoded "Active" badge,
 * a decorative toggle, and a Save button that set a flag for three seconds and wrote
 * nothing — over a controller that could already read and write settings.
 *
 * The value editor is chosen by the setting's declared type. That field existed on the
 * model from the start and nothing honoured it: the only write endpoint took a key and a
 * value, so every setting it created was "text" regardless, and a boolean was edited as a
 * free-text box that would happily accept "yes".
 */
@customElement("settings-dashboard")
export class SettingsDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 62ch; }
    .row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-weight: 600; font-size: 0.8125rem; }
    .field input, .field select, .field textarea {
      padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 4px; font: inherit; min-width: 180px; box-sizing: border-box;
    }
    .field textarea { min-width: 320px; min-height: 96px; font-family: var(--uui-font-monospace, monospace); }
    .grow { flex: 1 1 240px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .group-head { display: flex; align-items: baseline; gap: 10px; }
    .alias { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem;
             font-family: var(--uui-font-monospace, monospace); }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 10px 0; }
    .key { font-family: var(--uui-font-monospace, monospace); font-weight: 600; }
    .hint { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    uui-table { width: 100%; }
  `;

  @state() private _groups: SettingGroup[] = [];
  @state() private _settings: SiteSetting[] = [];
  @state() private _loading = true;
  @state() private _busy = false;
  @state() private _msg: { ok: boolean; text: string } | null = null;

  @state() private _draft: SiteSetting | null = null;
  @state() private _groupDraft: SettingGroup | null = null;

  private readonly _api = "/umbraco/api/SettingsApi";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const [g, s] = await Promise.all([
        fetch(`${this._api}/GetGroups`, { credentials: "same-origin" }),
        fetch(`${this._api}/GetAll`, { credentials: "same-origin" }),
      ]);
      if (g.ok) this._groups = await g.json();
      if (s.ok) this._settings = await s.json();
    } finally {
      this._loading = false;
    }
  }

  async #send<T>(path: string, method: string, body?: unknown): Promise<SaveResult<T> | null> {
    this._busy = true;
    this._msg = null;
    try {
      const r = await fetch(`${this._api}/${path}`, {
        method,
        credentials: "same-origin",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      // 204 from Delete carries no body.
      const result: SaveResult<T> = r.status === 204
        ? { success: true, message: "Deleted.", value: null }
        : await r.json();
      this._msg = { ok: result.success, text: result.message };
      if (result.success) await this.#load();
      return result;
    } catch (e) {
      this._msg = { ok: false, text: `The request failed: ${(e as Error).message}` };
      return null;
    } finally {
      this._busy = false;
    }
  }

  #groupName(id: number): string {
    return this._groups.find(g => g.id === id)?.name ?? "Ungrouped";
  }

  // ── value editor, chosen by the declared type ──────────────────────────────

  #valueEditor(draft: SiteSetting) {
    const set = (v: string) => (this._draft = { ...draft, value: v });

    switch (draft.type) {
      case "boolean":
        return html`
          <div class="field">
            <label>Value</label>
            <uui-toggle
              ?checked=${draft.value === "true" || draft.value === "1"}
              @change=${(e: Event) =>
                set((e.target as HTMLInputElement).checked ? "true" : "false")}></uui-toggle>
          </div>`;
      case "number":
        return html`
          <div class="field">
            <label for="v">Value</label>
            <input id="v" type="number" .value=${draft.value ?? ""}
              @input=${(e: InputEvent) => set((e.target as HTMLInputElement).value)} />
          </div>`;
      case "json":
        return html`
          <div class="field grow">
            <label for="v">Value</label>
            <textarea id="v" spellcheck="false" .value=${draft.value ?? ""}
              @input=${(e: InputEvent) => set((e.target as HTMLTextAreaElement).value)}></textarea>
            <span class="hint">Validated as JSON on save.</span>
          </div>`;
      default:
        return html`
          <div class="field grow">
            <label for="v">Value</label>
            <input id="v" .value=${draft.value ?? ""}
              @input=${(e: InputEvent) => set((e.target as HTMLInputElement).value)} />
          </div>`;
    }
  }

  #renderSettingForm() {
    const d = this._draft;
    if (!d) return nothing;

    return html`
      <uui-box headline=${d.id > 0 ? `Edit ${d.key}` : "New setting"} style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="k">Key</label>
            <input id="k" .value=${d.key}
              @input=${(e: InputEvent) =>
                (this._draft = { ...d, key: (e.target as HTMLInputElement).value })} />
          </div>

          <div class="field">
            <label for="ty">Type</label>
            <select id="ty" .value=${d.type}
              @change=${(e: Event) =>
                (this._draft = { ...d, type: (e.target as HTMLSelectElement).value as SettingType })}>
              <option value="text">Text</option>
              <option value="boolean">Boolean</option>
              <option value="number">Number</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div class="field">
            <label for="gr">Group</label>
            <select id="gr" .value=${String(d.groupId)}
              @change=${(e: Event) =>
                (this._draft = { ...d, groupId: Number((e.target as HTMLSelectElement).value) })}>
              <option value="0">Ungrouped</option>
              ${this._groups.map(g => html`<option value=${g.id}>${g.name}</option>`)}
            </select>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          ${this.#valueEditor(d)}
          <div class="field grow">
            <label for="ds">Description</label>
            <input id="ds" .value=${d.description ?? ""}
              @input=${(e: InputEvent) =>
                (this._draft = { ...d, description: (e.target as HTMLInputElement).value })} />
          </div>
        </div>

        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${async () => {
              const r = await this.#send<SiteSetting>("Save", "POST", this._draft);
              if (r?.success) this._draft = null;
            }}>
            ${this._busy ? "Saving…" : d.id > 0 ? "Save changes" : "Create setting"}
          </uui-button>
          <uui-button look="secondary" @click=${() => (this._draft = null)}>Cancel</uui-button>
        </div>
      </uui-box>
    `;
  }

  #renderGroupForm() {
    const g = this._groupDraft;
    if (!g) return nothing;

    return html`
      <uui-box headline=${g.id > 0 ? `Edit ${g.name}` : "New group"} style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="gn">Name</label>
            <input id="gn" .value=${g.name}
              @input=${(e: InputEvent) =>
                (this._groupDraft = { ...g, name: (e.target as HTMLInputElement).value })} />
          </div>
          <div class="field">
            <label for="ga">Alias <span class="hint">(optional)</span></label>
            <input id="ga" .value=${g.alias}
              @input=${(e: InputEvent) =>
                (this._groupDraft = { ...g, alias: (e.target as HTMLInputElement).value })} />
          </div>
          <div class="field">
            <label for="gs">Sort order</label>
            <input id="gs" type="number" style="min-width:100px;" .value=${String(g.sortOrder)}
              @input=${(e: InputEvent) =>
                (this._groupDraft = { ...g, sortOrder: Number((e.target as HTMLInputElement).value) })} />
          </div>
          <div class="field grow">
            <label for="gd">Description</label>
            <input id="gd" .value=${g.description ?? ""}
              @input=${(e: InputEvent) =>
                (this._groupDraft = { ...g, description: (e.target as HTMLInputElement).value })} />
          </div>
        </div>
        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${async () => {
              const r = await this.#send<SettingGroup>("SaveGroup", "POST", this._groupDraft);
              if (r?.success) this._groupDraft = null;
            }}>
            ${this._busy ? "Saving…" : g.id > 0 ? "Save changes" : "Create group"}
          </uui-button>
          <uui-button look="secondary" @click=${() => (this._groupDraft = null)}>Cancel</uui-button>
        </div>
      </uui-box>
    `;
  }

  #renderGroup(group: SettingGroup | null) {
    const id = group?.id ?? 0;
    const rows = this._settings.filter(s => s.groupId === id);

    // Only show the Ungrouped bucket when something is actually in it.
    if (!group && rows.length === 0) return nothing;

    return html`
      <uui-box style="margin-top:16px;">
        <div slot="headline" class="group-head">
          <span>${group?.name ?? "Ungrouped"}</span>
          ${group ? html`<span class="alias">${group.alias}</span>` : nothing}
        </div>

        ${group
          ? html`
              <div slot="header-actions">
                <uui-button look="secondary" compact label="Edit group"
                  @click=${() => (this._groupDraft = { ...group })}>Edit</uui-button>
                <uui-button look="secondary" color="danger" compact label="Delete group"
                  ?disabled=${this._busy}
                  @click=${() => this.#send("DeleteGroup?id=" + group.id, "DELETE")}>Delete</uui-button>
              </div>`
          : nothing}

        ${group?.description ? html`<p class="hint">${group.description}</p>` : nothing}

        ${rows.length === 0
          ? html`<p class="empty">No settings in this group.</p>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Key</uui-table-head-cell>
                  <uui-table-head-cell>Type</uui-table-head-cell>
                  <uui-table-head-cell>Value</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${rows.map(s => html`
                  <uui-table-row>
                    <uui-table-cell>
                      <span class="key">${s.key}</span>
                      ${s.description ? html`<div class="hint">${s.description}</div>` : nothing}
                    </uui-table-cell>
                    <uui-table-cell>${s.type}</uui-table-cell>
                    <uui-table-cell class="hint" style="max-width:280px;overflow-wrap:anywhere;">
                      ${s.value ?? html`<em>not set</em>`}
                    </uui-table-cell>
                    <uui-table-cell style="text-align:right;white-space:nowrap;">
                      <uui-button look="secondary" compact label="Edit"
                        @click=${() => (this._draft = { ...s })}>Edit</uui-button>
                      <uui-button look="secondary" color="danger" compact label="Delete"
                        ?disabled=${this._busy}
                        @click=${() => confirm(`Delete "${s.key}"?`)
                          && this.#send("Delete?id=" + s.id, "DELETE")}>Delete</uui-button>
                    </uui-table-cell>
                  </uui-table-row>
                `)}
              </uui-table>`}
      </uui-box>
    `;
  }

  override render() {
    return html`
      <h1>Site settings</h1>
      <p class="description">
        Key/value settings for the site, organised into groups. Each setting declares a type,
        and the editor and the save validation both follow it.
      </p>

      <div class="row">
        <uui-button look="primary" ?disabled=${this._busy}
          @click=${() => (this._draft = { ...NEW_SETTING })}>New setting</uui-button>
        <uui-button look="secondary" ?disabled=${this._busy}
          @click=${() => (this._groupDraft =
            { id: 0, name: "", alias: "", description: null, sortOrder: 0 })}>New group</uui-button>
      </div>

      ${this._msg
        ? html`<div class="msg ${this._msg.ok ? "success" : "error"}">${this._msg.text}</div>`
        : nothing}

      ${this.#renderSettingForm()}
      ${this.#renderGroupForm()}

      ${this._loading
        ? html`<uui-loader style="margin-top:16px;"></uui-loader>`
        : html`
            ${this._groups.map(g => this.#renderGroup(g))}
            ${this.#renderGroup(null)}
            ${this._groups.length === 0 && this._settings.length === 0
              ? html`<p class="empty" style="margin-top:16px;">
                       No settings yet. Create a group, then add settings to it.
                     </p>`
              : nothing}
          `}
    `;
  }
}

export default SettingsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "settings-dashboard": SettingsDashboardElement;
  }
}
