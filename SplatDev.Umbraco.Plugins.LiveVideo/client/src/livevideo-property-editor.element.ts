import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";

import { createAuthFetch } from "./auth-fetch";

const PLATFORMS = ["youtube", "twitch"];

/**
 * Pick the live stream a page embeds, and see the embed resolve before publishing.
 *
 * The plugin's endpoint takes a platform and a channel id, and the only thing calling it
 * was a dashboard. A page's stream was therefore a plain text field somewhere, with the
 * platform implied and mistakes found on the front end.
 *
 * The value stored is "platform:channelId", which is unambiguous and survives the two
 * being edited separately.
 */
@customElement("livevideo-property-editor")
export class LiveVideoPropertyEditorElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; }
    .row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
    uui-select { min-width: 150px; }
    uui-input { flex: 1 1 240px; }
    .label {
      display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 5px;
    }
    .embed { margin-top: 10px; }
    .embed iframe, .embed ::slotted(iframe) { max-width: 100%; }
    .hint { margin: 7px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .warn {
      margin-top: 8px; padding: 8px 10px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
    }
  `;

  @property({ type: String })
  value = "";

  @property({ type: Boolean })
  readonly = false;

  @state() private _platform = "youtube";
  @state() private _channel = "";
  @state() private _resolved: string | null = null;
  @state() private _failed = false;

  override connectedCallback(): void {
    super.connectedCallback();
    const [platform, ...rest] = (this.value ?? "").split(":");
    if (rest.length) {
      this._platform = platform;
      this._channel = rest.join(":");
      void this.#check();
    }
  }

  #commit(): void {
    const next = this._channel.trim() ? `${this._platform}:${this._channel.trim()}` : "";
    if (next === this.value) return;
    this.value = next;
    this.dispatchEvent(new UmbChangeEvent());
  }

  async #check(): Promise<void> {
    const channel = this._channel.trim();
    if (!channel) {
      this._resolved = null;
      this._failed = false;
      return;
    }
    try {
      const response = await this.#fetch(
        `/umbraco/api/livevideo/GetEmbed?platform=${encodeURIComponent(this._platform)}` +
        `&channelId=${encodeURIComponent(channel)}`,
      );
      if (response.ok) {
        const data = await response.json();
        this._resolved = data?.embedUrl ?? data?.url ?? data?.embed ?? null;
        this._failed = this._resolved === null;
      } else {
        this._resolved = null;
        this._failed = true;
      }
    } catch {
      this._resolved = null;
      this._failed = true;
    }
  }

  override render() {
    return html`
      <div class="row">
        <div>
          <span class="label">Platform</span>
          <uui-select
            label="Platform"
            ?disabled=${this.readonly}
            .value=${this._platform}
            @change=${(e: Event) => {
              this._platform = (e.target as HTMLSelectElement).value;
              this.#commit();
              void this.#check();
            }}
            .options=${PLATFORMS.map((p) => ({ name: p, value: p, selected: p === this._platform }))}
          ></uui-select>
        </div>
        <div style="flex:1 1 240px">
          <span class="label">Channel</span>
          <uui-input
            label="Channel"
            placeholder="channel id or handle"
            ?readonly=${this.readonly}
            .value=${this._channel}
            @input=${(e: Event) => (this._channel = (e.target as HTMLInputElement).value)}
            @change=${() => { this.#commit(); void this.#check(); }}
            @blur=${() => { this.#commit(); void this.#check(); }}
          ></uui-input>
        </div>
      </div>

      ${this._resolved
        ? html`<div class="embed">
            <iframe
              src=${this._resolved}
              width="360"
              height="203"
              frameborder="0"
              allowfullscreen
              title="Live stream preview"
            ></iframe>
          </div>`
        : nothing}

      ${this._failed && this._channel
        ? html`<div class="warn">
            No embed came back for that channel on ${this._platform}. The page will show
            nothing until it resolves.
          </div>`
        : html`<p class="hint">Stored as <code>platform:channel</code>.</p>`}
    `;
  }
}

export default LiveVideoPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "livevideo-property-editor": LiveVideoPropertyEditorElement;
  }
}
