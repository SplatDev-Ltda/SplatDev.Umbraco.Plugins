import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";

import { createAuthFetch } from "./auth-fetch";

interface VideoInfo {
  provider?: string | null;
  videoId?: string | null;
  thumbnailUrl?: string | null;
  embedUrl?: string | null;
  title?: string | null;
}

/**
 * A video URL with the thumbnail the site will actually use.
 *
 * The plugin turns a YouTube, Vimeo or Dailymotion URL into a thumbnail, and shipped
 * that as a dashboard where you paste a URL to look at it. Nothing put it on a property,
 * so a page's video URL was an ordinary text field and whether it resolved to anything
 * was found out later, on the front end.
 */
@customElement("videopreview-property-editor")
export class VideoPreviewPropertyEditorElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; }
    uui-input { width: 100%; }
    .preview { margin-top: 10px; display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
    img {
      width: 200px; max-width: 100%; border-radius: 4px;
      border: 1px solid var(--uui-color-border, #e5e7eb);
    }
    .meta { font-size: 0.86rem; }
    .meta div { margin-bottom: 3px; }
    .hint { margin: 6px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .warn {
      margin-top: 8px; padding: 8px 10px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-warning, #d8a012);
      background: var(--uui-color-warning-emphasis, #fdf6e3);
    }
    code {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-alt, #f3f4f6); padding: 1px 5px; border-radius: 3px;
    }
  `;

  @property({ type: String })
  value = "";

  @property({ type: Boolean })
  readonly = false;

  @state() private _info: VideoInfo | null = null;
  @state() private _checking = false;
  @state() private _unresolved = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.value) void this.#resolve(this.value);
  }

  async #resolve(url: string): Promise<void> {
    const trimmed = url.trim();
    if (!trimmed) {
      this._info = null;
      this._unresolved = false;
      return;
    }

    this._checking = true;
    this._unresolved = false;
    try {
      const response = await this.#fetch(
        `/umbraco/api/videopreview/GetVideoInfo?url=${encodeURIComponent(trimmed)}`,
      );
      if (response.ok) {
        this._info = await response.json();
      } else {
        // A 404 here means the URL is not one of the providers this plugin understands,
        // which is worth saying now rather than leaving to the front end to discover.
        this._info = null;
        this._unresolved = true;
      }
    } catch {
      this._info = null;
      this._unresolved = true;
    } finally {
      this._checking = false;
    }
  }

  #onInput(e: Event): void {
    this.value = (e.target as HTMLInputElement).value;
    this.dispatchEvent(new UmbChangeEvent());
  }

  override render() {
    return html`
      <uui-input
        label="Video URL"
        placeholder="https://www.youtube.com/watch?v=…"
        .value=${this.value ?? ""}
        ?readonly=${this.readonly}
        @input=${this.#onInput}
        @change=${() => this.#resolve(this.value)}
        @blur=${() => this.#resolve(this.value)}
      ></uui-input>

      ${this._checking ? html`<p class="hint">Checking…</p>` : nothing}

      ${this._info?.thumbnailUrl
        ? html`
            <div class="preview">
              <img src=${this._info.thumbnailUrl} alt=${this._info.title || "Video thumbnail"} loading="lazy" />
              <div class="meta">
                ${this._info.title ? html`<div><strong>${this._info.title}</strong></div>` : nothing}
                ${this._info.provider ? html`<div>Provider: ${this._info.provider}</div>` : nothing}
                ${this._info.videoId ? html`<div>Id: <code>${this._info.videoId}</code></div>` : nothing}
              </div>
            </div>
          `
        : nothing}

      ${this._unresolved && this.value
        ? html`<div class="warn">
            That URL did not resolve to a video. This plugin understands YouTube, Vimeo
            and Dailymotion links — the page will show no thumbnail for anything else.
          </div>`
        : nothing}
    `;
  }
}

export default VideoPreviewPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "videopreview-property-editor": VideoPreviewPropertyEditorElement;
  }
}
