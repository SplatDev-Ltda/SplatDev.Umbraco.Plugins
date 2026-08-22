import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface DictionaryItem {
  key: string;
  parentKey: string | null;
  value: string;
  languageCode: string;
  translations: Record<string, string>;
}

interface ImportOutcome {
  key: string;
  success: boolean;
}

/**
 * Read and edit Umbraco dictionary items, and move them in and out as JSON.
 *
 * The previous dashboard was the shared placeholder template — a "Save Settings" button
 * that set a flag for three seconds and a "Documentation" button that did nothing. It
 * made no requests at all, while the API behind it had list, create, update, delete,
 * import and export all working.
 */
@customElement("dictionarymanager-dashboard")
export class DictionaryManagerDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 64ch; }

    uui-box { margin-bottom: 18px; }
    .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
    .grow { flex: 1 1 220px; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }

    .scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 560px; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 7px 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    td.keycell { font-family: var(--uui-font-monospace, monospace); white-space: nowrap; }
    .child::before { content: "↳"; opacity: 0.45; margin-right: 6px; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }
    uui-input { width: 100%; }

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
    .new-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
  `;

  @state() private _items: DictionaryItem[] = [];
  @state() private _languages: string[] = [];
  @state() private _loading = true;
  @state() private _busy = "";
  @state() private _filter = "";
  @state() private _loadError: string | null = null;
  @state() private _message: { ok: boolean; text: string } | null = null;

  @state() private _newKey = "";
  @state() private _newParent = "";
  @state() private _newTranslations: Record<string, string> = {};
  @state() private _overrideOnImport = false;

  readonly #fetch = createAuthFetch(this);
  private readonly _api = "/umbraco/api/dictionarymanager";

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
        ? "You are not authorised to manage dictionary items. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#fetch(`${this._api}/GetAll`);
      if (this.#responseOk(response)) {
        this._items = await response.json();
        // The language columns come from the data, so a site with one language does not
        // get a wall of empty columns and a site with six gets all of them.
        const codes = new Set<string>();
        for (const item of this._items) {
          for (const code of Object.keys(item.translations ?? {})) codes.add(code);
        }
        this._languages = [...codes].sort();
      }
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
    } finally {
      this._loading = false;
    }
  }

  async #saveTranslation(item: DictionaryItem, code: string, value: string): Promise<void> {
    if ((item.translations?.[code] ?? "") === value) return;

    this._busy = `save:${item.key}:${code}`;
    try {
      const body: DictionaryItem = {
        ...item,
        translations: { ...item.translations, [code]: value },
      };
      const response = await this.#fetch(`${this._api}/Update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (this.#responseOk(response)) {
        item.translations = body.translations;
        this._message = { ok: true, text: `Saved ${item.key} (${code}).` };
      }
    } catch {
      this._message = { ok: false, text: `Could not save ${item.key}.` };
    } finally {
      this._busy = "";
    }
  }

  async #create(): Promise<void> {
    const key = this._newKey.trim();
    if (!key) {
      this._message = { ok: false, text: "Give the item a key." };
      return;
    }

    this._busy = "create";
    try {
      const response = await this.#fetch(`${this._api}/Create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          parentKey: this._newParent.trim() || null,
          value: "",
          languageCode: this._languages[0] ?? "",
          translations: this._newTranslations,
        }),
      });
      if (this.#responseOk(response)) {
        this._message = { ok: true, text: `Created ${key}.` };
        this._newKey = "";
        this._newParent = "";
        this._newTranslations = {};
        await this.#load();
      }
    } catch {
      this._message = { ok: false, text: "Could not create that item." };
    } finally {
      this._busy = "";
    }
  }

  async #delete(key: string): Promise<void> {
    this._busy = `delete:${key}`;
    try {
      const response = await this.#fetch(`${this._api}/Delete?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      if (this.#responseOk(response)) {
        this._message = { ok: true, text: `Deleted ${key}.` };
        await this.#load();
      }
    } catch {
      this._message = { ok: false, text: `Could not delete ${key}.` };
    } finally {
      this._busy = "";
    }
  }

  async #export(): Promise<void> {
    this._busy = "export";
    try {
      // Fetched rather than linked: the export endpoint needs the backoffice token, and
      // a plain <a href> would arrive unauthenticated and download the 401 page.
      const response = await this.#fetch(`${this._api}/Export`);
      if (!this.#responseOk(response)) return;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dictionary-export.json";
      a.click();
      URL.revokeObjectURL(url);
      this._message = { ok: true, text: `Exported ${this._items.length} item(s).` };
    } catch {
      this._message = { ok: false, text: "Could not export." };
    } finally {
      this._busy = "";
    }
  }

  async #import(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    this._busy = "import";
    try {
      const text = await file.text();
      let items: DictionaryItem[];
      try {
        items = JSON.parse(text);
      } catch {
        this._message = { ok: false, text: `${file.name} is not valid JSON.` };
        return;
      }
      if (!Array.isArray(items) || items.length === 0) {
        this._message = { ok: false, text: `${file.name} contains no dictionary items.` };
        return;
      }

      const response = await this.#fetch(
        `${this._api}/Import?overrideExisting=${this._overrideOnImport}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(items),
        },
      );
      if (!this.#responseOk(response)) return;

      const results = (await response.json()) as ImportOutcome[];
      const failed = results.filter((r) => !r.success);
      this._message = {
        ok: failed.length === 0,
        text:
          `Imported ${results.length - failed.length} of ${results.length} item(s).` +
          (failed.length ? ` Skipped: ${failed.map((f) => f.key).join(", ")}.` : ""),
      };
      await this.#load();
    } catch {
      this._message = { ok: false, text: "Could not import that file." };
    } finally {
      this._busy = "";
    }
  }

  #visible(): DictionaryItem[] {
    const needle = this._filter.trim().toLowerCase();
    if (!needle) return this._items;
    return this._items.filter(
      (i) =>
        i.key.toLowerCase().includes(needle) ||
        Object.values(i.translations ?? {}).some((v) => v.toLowerCase().includes(needle)),
    );
  }

  override render() {
    const rows = this.#visible();

    return html`
      <h1>Dictionary</h1>
      <p class="description">
        Every dictionary item on the site and its translations. Edit a value and it saves
        when you leave the field. You can also move the whole set in and out as JSON.
      </p>

      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : nothing}
      ${this._message
        ? html`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>`
        : nothing}

      <uui-box headline="Items">
        <div class="toolbar">
          <uui-input
            class="grow"
            placeholder="Filter by key or translation"
            .value=${this._filter}
            @input=${(e: Event) => (this._filter = (e.target as HTMLInputElement).value)}
          ></uui-input>
          <uui-button
            look="secondary"
            label="Export JSON"
            ?disabled=${this._busy === "export"}
            @click=${this.#export}
            >${this._busy === "export" ? "Exporting…" : "Export JSON"}</uui-button
          >
          <input id="importFile" type="file" accept="application/json,.json" style="display:none"
            @change=${this.#import} />
          <uui-button
            look="secondary"
            label="Import JSON"
            ?disabled=${this._busy === "import"}
            @click=${() => this.shadowRoot?.querySelector<HTMLInputElement>("#importFile")?.click()}
            >${this._busy === "import" ? "Importing…" : "Import JSON"}</uui-button
          >
          <uui-toggle
            label="Overwrite on import"
            ?checked=${this._overrideOnImport}
            @change=${(e: Event) => (this._overrideOnImport = (e.target as HTMLInputElement).checked)}
            >Overwrite existing on import</uui-toggle
          >
        </div>

        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : rows.length === 0
            ? html`<p class="empty">
                ${this._items.length === 0
                  ? "No dictionary items yet. Add one below."
                  : "Nothing matches that filter."}
              </p>`
            : html`
                <div class="scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Key</th>
                        ${this._languages.map((c) => html`<th>${c}</th>`)}
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows.map(
                        (item) => html`
                          <tr>
                            <td class="keycell">
                              <span class=${item.parentKey ? "child" : ""}>${item.key}</span>
                            </td>
                            ${this._languages.map(
                              (code) => html`
                                <td>
                                  <uui-input
                                    .value=${item.translations?.[code] ?? ""}
                                    ?disabled=${this._busy === `save:${item.key}:${code}`}
                                    @blur=${(e: Event) =>
                                      this.#saveTranslation(
                                        item,
                                        code,
                                        (e.target as HTMLInputElement).value,
                                      )}
                                  ></uui-input>
                                </td>
                              `,
                            )}
                            <td>
                              <uui-button
                                compact
                                look="secondary"
                                color="danger"
                                label="Delete ${item.key}"
                                ?disabled=${this._busy === `delete:${item.key}`}
                                @click=${() => this.#delete(item.key)}
                                >Delete</uui-button
                              >
                            </td>
                          </tr>
                        `,
                      )}
                    </tbody>
                  </table>
                </div>
              `}
      </uui-box>

      <uui-box headline="Add an item">
        <div class="new-grid">
          <div>
            <span class="field-label">Key</span>
            <uui-input
              placeholder="e.g. general.close"
              .value=${this._newKey}
              @input=${(e: Event) => (this._newKey = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Parent key (optional)</span>
            <uui-input
              placeholder="Leave empty for a root item"
              .value=${this._newParent}
              @input=${(e: Event) => (this._newParent = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          ${this._languages.map(
            (code) => html`
              <div>
                <span class="field-label">${code}</span>
                <uui-input
                  .value=${this._newTranslations[code] ?? ""}
                  @input=${(e: Event) =>
                    (this._newTranslations = {
                      ...this._newTranslations,
                      [code]: (e.target as HTMLInputElement).value,
                    })}
                ></uui-input>
              </div>
            `,
          )}
        </div>
        <p class="hint">
          A parent key nests this item beneath an existing one, the same as the dictionary
          tree in the Translation section.
        </p>
        <div class="toolbar" style="margin-top:14px;">
          <uui-button
            look="primary"
            color="positive"
            label="Add item"
            ?disabled=${this._busy === "create"}
            @click=${this.#create}
            >${this._busy === "create" ? "Adding…" : "Add item"}</uui-button
          >
        </div>
      </uui-box>
    `;
  }
}

export default DictionaryManagerDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "dictionarymanager-dashboard": DictionaryManagerDashboardElement;
  }
}
