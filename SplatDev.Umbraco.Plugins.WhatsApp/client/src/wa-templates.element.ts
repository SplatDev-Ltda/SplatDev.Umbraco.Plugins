import {
  LitElement,
  html,
  css,
  nothing,
  customElement,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { WhatsAppApi } from "./api";
import { sharedStyles } from "./shared-styles";
import type { MessageTemplate } from "./types";

/** Read-only browser for the WABA's message templates. */
@customElement("wa-templates")
export class WaTemplatesElement extends UmbElementMixin(LitElement) {
  static override styles = [
    sharedStyles,
    css`
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
        /* Keeps the body column from collapsing the layout on narrow screens. */
        min-width: 720px;
      }

      th,
      td {
        text-align: left;
        padding: var(--uui-size-space-3, 8px);
        border-bottom: 1px solid var(--uui-color-border);
        vertical-align: top;
      }

      th {
        font-weight: 600;
        color: var(--uui-color-text-alt);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .body-cell {
        color: var(--uui-color-text-alt);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        max-width: 420px;
      }

      .pill {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .pill.approved {
        background: var(--uui-color-positive);
        color: var(--uui-color-selected-contrast, #fff);
      }

      .pill.other {
        background: var(--uui-color-warning);
        color: var(--uui-color-warning-contrast, #000);
      }
    `,
  ];

  #api = new WhatsAppApi(this);

  @state() private _templates: MessageTemplate[] = [];
  @state() private _error = "";
  @state() private _loading = true;

  override connectedCallback() {
    super.connectedCallback();
    void this.#load();
  }

  async #load() {
    this._loading = true;
    this._error = "";
    try {
      this._templates = await this.#api.getTemplates();
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
    }
  }

  #renderRow(template: MessageTemplate) {
    return html`
      <tr>
        <td><strong>${template.name}</strong></td>
        <td>${template.language}</td>
        <td>
          <span class="pill ${template.isUsable ? "approved" : "other"}">
            ${template.status}
          </span>
        </td>
        <td>${template.category}</td>
        <td>${template.variableCount || "—"}</td>
        <td class="body-cell">${template.bodyText || "—"}</td>
      </tr>
    `;
  }

  override render() {
    return html`
      <div class="head">
        <h1>Message templates</h1>
        <p>
          Templates defined on your WhatsApp Business Account. Only approved templates can
          be sent; create and edit them in Meta Business Manager.
        </p>
      </div>

      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}

      <div class="row" style="margin-bottom:12px">
        <uui-button
          look="secondary"
          label="Refresh templates"
          ?disabled=${this._loading}
          @click=${() => void this.#load()}
        >Refresh</uui-button>
      </div>

      <uui-box>
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._templates.length === 0
            ? html`<div class="empty">
                No templates found. Check that the business account ID and access token are
                configured on the Status view.
              </div>`
            : html`
                <div class="scroll-x">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Language</th>
                        <th>Status</th>
                        <th>Category</th>
                        <th>Vars</th>
                        <th>Body</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this._templates.map((t) => this.#renderRow(t))}
                    </tbody>
                  </table>
                </div>
              `}
      </uui-box>
    `;
  }
}

export default WaTemplatesElement;

declare global {
  interface HTMLElementTagNameMap {
    "wa-templates": WaTemplatesElement;
  }
}
