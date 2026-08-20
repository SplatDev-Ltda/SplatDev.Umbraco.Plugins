import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import "@umbraco-cms/backoffice/document";

import { createAuthFetch } from "./auth-fetch";

interface ContentRef {
  id: number;
  key: string;
  name: string;
  path: string;
  isHidden: boolean;
}

interface HiddenResult {
  success: boolean;
  message: string;
  affected: ContentRef[];
}

/**
 * Hide pages from navigation, by picking them.
 *
 * The previous dashboard had a "Node ID" number box for the single case and a second box
 * wanting "Node IDs (comma-separated)" for the bulk case — two ways to type an identifier
 * that is not shown anywhere an editor normally looks and that differs between
 * environments. One picker covers both: a selection of one is the single case.
 */
@customElement("hiddencontent-dashboard")
export class HiddenContentDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 62ch; }
    .field { margin-bottom: 16px; }
    .field > label { display: block; font-weight: 600; font-size: 0.875rem; margin-bottom: 4px; }
    .field > .help { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; margin: 0 0 6px; }
    .actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 16px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .crumb { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 16px 0; }
    uui-table { width: 100%; }
  `;

  @state() private _hidden: ContentRef[] = [];
  @state() private _loading = true;
  @state() private _busy = false;
  @state() private _selection: string[] = [];
  @state() private _result: HiddenResult | null = null;

  private readonly _api = "/umbraco/api/hiddencontent";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const r = await this.#fetch(`${this._api}/GetHiddenNodes`, { credentials: "same-origin" });
      if (r.ok) this._hidden = await r.json();
    } finally {
      this._loading = false;
    }
  }

  #selectionFrom(e: Event): string[] {
    const t = e.target as { selection?: string[]; value?: string };
    return (t.selection ?? String(t.value ?? "").split(",")).filter(Boolean);
  }

  async #post(action: "Hide" | "Show", nodes: string[]): Promise<void> {
    this._busy = true;
    this._result = null;
    try {
      const r = await this.#fetch(`${this._api}/${action}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes }),
      });
      this._result = await r.json();
      if (r.ok) {
        this._selection = [];
        await this.#load();
      }
    } catch (e) {
      this._result = { success: false, message: `The request failed: ${(e as Error).message}`, affected: [] };
    } finally {
      this._busy = false;
    }
  }

  override render() {
    return html`
      <h1>Hidden content</h1>
      <p class="description">
        Hide pages from navigation without unpublishing them. This sets the standard
        <code>umbracoNaviHide</code> property, so menus built the usual way will skip them
        while the page stays reachable by URL.
      </p>

      <uui-box headline="Hide or restore pages">
        <div class="field">
          <label for="pages">Pages</label>
          <p class="help">Pick one or several. Restoring works on the same selection.</p>
          <umb-input-document
            id="pages"
            .selection=${this._selection}
            @change=${(e: Event) => (this._selection = this.#selectionFrom(e))}>
          </umb-input-document>
        </div>

        <div class="actions">
          <uui-button look="primary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => this.#post("Hide", this._selection)}>
            ${this._busy ? "Working…" : "Hide from navigation"}
          </uui-button>
          <uui-button look="secondary" ?disabled=${this._busy || this._selection.length === 0}
            @click=${() => this.#post("Show", this._selection)}>
            Restore to navigation
          </uui-button>
        </div>

        ${this._result
          ? html`<div class="msg ${this._result.success ? "success" : "error"}">
                   ${this._result.message}
                 </div>`
          : nothing}
      </uui-box>

      <uui-box headline="Currently hidden" style="margin-top:16px;">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._hidden.length === 0
            ? html`<p class="empty">Nothing is hidden from navigation.</p>`
            : html`
                <uui-table>
                  <uui-table-head>
                    <uui-table-head-cell>Page</uui-table-head-cell>
                    <uui-table-head-cell></uui-table-head-cell>
                  </uui-table-head>
                  ${this._hidden.map(n => html`
                    <uui-table-row>
                      <uui-table-cell>
                        <strong>${n.name}</strong>
                        ${n.path ? html`<div class="crumb">${n.path}</div>` : nothing}
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        <uui-button look="secondary" compact label="Restore"
                          ?disabled=${this._busy}
                          @click=${() => this.#post("Show", [n.key])}>
                          Restore
                        </uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `)}
                </uui-table>
              `}
      </uui-box>
    `;
  }
}

export default HiddenContentDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "hiddencontent-dashboard": HiddenContentDashboardElement;
  }
}
