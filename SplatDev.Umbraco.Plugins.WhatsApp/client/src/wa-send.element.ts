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

type Mode = "template" | "text";

/**
 * Compose view: send an approved template or a free-form message.
 *
 * Template is the default because it is the only mode that works for a first contact
 * or after the 24-hour window has closed — free-form sends fail in both cases.
 */
@customElement("wa-send")
export class WaSendElement extends UmbElementMixin(LitElement) {
  static override styles = [
    sharedStyles,
    css`
      uui-box {
        max-width: 640px;
      }

      .preview {
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--uui-color-border);
        border-radius: var(--uui-border-radius, 3px);
        padding: var(--uui-size-space-4, 12px);
        font-size: 0.875rem;
        line-height: 1.5;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .modes {
        display: flex;
        gap: var(--uui-size-space-3, 8px);
        margin-bottom: var(--uui-size-space-4, 12px);
      }

      .var-grid {
        display: grid;
        gap: var(--uui-size-space-3, 8px);
      }

      select {
        font: inherit;
        color: inherit;
        padding: 6px 8px;
        border: 1px solid var(--uui-color-border);
        border-radius: var(--uui-border-radius, 3px);
        background: var(--uui-color-surface);
        width: 100%;
      }
    `,
  ];

  #api = new WhatsAppApi(this);

  @state() private _mode: Mode = "template";
  @state() private _to = "";
  @state() private _body = "";
  @state() private _templates: MessageTemplate[] = [];
  @state() private _selectedIndex = 0;
  @state() private _variables: string[] = [];
  @state() private _error = "";
  @state() private _success = "";
  @state() private _sending = false;
  @state() private _loading = true;

  override connectedCallback() {
    super.connectedCallback();
    void this.#loadTemplates();
  }

  async #loadTemplates() {
    this._loading = true;
    try {
      const all = await this.#api.getTemplates();
      // Only approved templates can actually be sent.
      this._templates = all.filter((t) => t.isUsable);
      this.#syncVariables();
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
    }
  }

  get #selectedTemplate(): MessageTemplate | undefined {
    return this._templates[this._selectedIndex];
  }

  #syncVariables() {
    const count = this.#selectedTemplate?.variableCount ?? 0;
    // Preserve anything already typed when switching between templates.
    this._variables = Array.from({ length: count }, (_, i) => this._variables[i] ?? "");
  }

  #renderPreview() {
    const template = this.#selectedTemplate;
    if (!template?.bodyText) return nothing;

    // Substitute what the operator has typed so they see the real message.
    const filled = template.bodyText.replace(/\{\{(\d+)\}\}/g, (match, index) => {
      const value = this._variables[Number(index) - 1];
      return value?.trim() ? value : match;
    });

    return html`
      <div class="field">
        <label>Preview</label>
        <div class="preview">${filled}</div>
      </div>
    `;
  }

  async #send() {
    const to = this._to.trim();
    if (!to || this._sending) return;

    this._sending = true;
    this._error = "";
    this._success = "";

    try {
      if (this._mode === "template") {
        const template = this.#selectedTemplate;
        if (!template) {
          this._error = "Select a template first.";
          return;
        }

        const result = await this.#api.sendTemplate(
          to,
          template.name,
          template.language,
          this._variables.length ? this._variables : undefined,
        );
        this._success = `Template sent. Message id ${result.messageId}`;
      } else {
        const body = this._body.trim();
        if (!body) {
          this._error = "Enter a message.";
          return;
        }

        const result = await this.#api.sendText(to, body);
        this._success = `Message sent. Message id ${result.messageId}`;
        this._body = "";
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._sending = false;
    }
  }

  #renderTemplateMode() {
    if (this._loading) return html`<uui-loader></uui-loader>`;

    if (this._templates.length === 0) {
      return html`
        <div class="warn">
          <span>
            No approved templates found. Create and get one approved in Meta Business
            Manager, then refresh.
          </span>
        </div>
      `;
    }

    return html`
      <div class="field">
        <label for="tpl">Template</label>
        <select
          id="tpl"
          @change=${(e: Event) => {
            this._selectedIndex = (e.target as HTMLSelectElement).selectedIndex;
            this.#syncVariables();
          }}
        >
          ${this._templates.map(
            (t, i) => html`
              <option value=${i} ?selected=${i === this._selectedIndex}>
                ${t.name} (${t.language}) · ${t.category}
              </option>
            `,
          )}
        </select>
      </div>

      ${this._variables.length > 0
        ? html`
            <div class="field">
              <label>Variables</label>
              <div class="var-grid">
                ${this._variables.map(
                  (value, i) => html`
                    <uui-input
                      label=${`Variable ${i + 1}`}
                      placeholder=${`{{${i + 1}}}`}
                      .value=${value}
                      @input=${(e: Event) => {
                        const next = [...this._variables];
                        next[i] = (e.target as HTMLInputElement).value;
                        this._variables = next;
                      }}
                    ></uui-input>
                  `,
                )}
              </div>
            </div>
          `
        : nothing}
      ${this.#renderPreview()}
    `;
  }

  #renderTextMode() {
    return html`
      <div class="warn">
        <span>
          Free-form messages only reach people who messaged you in the last 24 hours.
          Outside that window WhatsApp rejects the send — use a template instead.
        </span>
      </div>
      <div class="field">
        <label>Message</label>
        <uui-textarea
          label="Message"
          placeholder="Write your message…"
          .value=${this._body}
          @input=${(e: Event) => {
            this._body = (e.target as HTMLTextAreaElement).value;
          }}
        ></uui-textarea>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="head">
        <h1>Send a message</h1>
        <p>Send an approved template, or a free-form message inside the 24-hour window.</p>
      </div>

      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      ${this._success ? html`<div class="ok">${this._success}</div>` : nothing}

      <uui-box headline="Compose">
        <div class="modes">
          <uui-button
            look=${this._mode === "template" ? "primary" : "secondary"}
            label="Template message"
            @click=${() => {
              this._mode = "template";
            }}
          >Template</uui-button>
          <uui-button
            look=${this._mode === "text" ? "primary" : "secondary"}
            label="Free-form message"
            @click=${() => {
              this._mode = "text";
            }}
          >Free-form</uui-button>
        </div>

        <div class="field">
          <label>Recipient</label>
          <uui-input
            label="Recipient phone number"
            placeholder="+1 702 555 0100"
            .value=${this._to}
            @input=${(e: Event) => {
              this._to = (e.target as HTMLInputElement).value;
            }}
          ></uui-input>
          <p class="hint">
            Include the country code. Spaces, dashes and a leading + are fine.
          </p>
        </div>

        ${this._mode === "template" ? this.#renderTemplateMode() : this.#renderTextMode()}

        <uui-button
          look="primary"
          color="positive"
          label="Send message"
          ?disabled=${this._sending || !this._to.trim()}
          @click=${() => void this.#send()}
        >${this._sending ? "Sending…" : "Send"}</uui-button>
      </uui-box>
    `;
  }
}

export default WaSendElement;

declare global {
  interface HTMLElementTagNameMap {
    "wa-send": WaSendElement;
  }
}
