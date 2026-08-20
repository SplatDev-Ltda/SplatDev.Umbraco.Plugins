import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface MemberTypeItem {
  id: number;
  alias: string;
  name: string;
  description: string;
  propertyCount: number;
}

@customElement("membertypes-dashboard")
export class MemberTypesDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 24px 0; }
    uui-table { width: 100%; }
  `;

  @state() private _memberTypes: MemberTypeItem[] = [];
  @state() private _loading = false;

  private readonly _apiBase = "/umbraco/api/membertypes";

  override connectedCallback(): void {
    super.connectedCallback();
    this._load();
  }

  private async _load(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#fetch(`${this._apiBase}/GetAll`);
      if (response.ok) this._memberTypes = await response.json();
    } catch {
      this._memberTypes = [];
    } finally {
      this._loading = false;
    }
  }

  override render() {
    return html`
      <h1>Member Types</h1>
      <p class="description">Manage custom member types and their properties.</p>

      <uui-box headline="Member Types (${this._memberTypes.length})">
        ${this._loading
          ? html`<p>Loading...</p>`
          : this._memberTypes.length === 0
          ? html`<p class="empty">No member types found.</p>`
          : html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Alias</uui-table-head-cell>
                  <uui-table-head-cell>Description</uui-table-head-cell>
                  <uui-table-head-cell>Properties</uui-table-head-cell>
                </uui-table-head>
                ${this._memberTypes.map(
                  (t) => html`
                    <uui-table-row>
                      <uui-table-cell><strong>${t.name}</strong></uui-table-cell>
                      <uui-table-cell><code>${t.alias}</code></uui-table-cell>
                      <uui-table-cell>${t.description}</uui-table-cell>
                      <uui-table-cell>${t.propertyCount}</uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `}
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
