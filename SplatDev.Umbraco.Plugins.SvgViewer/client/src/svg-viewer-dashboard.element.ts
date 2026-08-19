import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { unsafeHTML } from "@umbraco-cms/backoffice/external/lit";

import { createAuthFetch } from "./auth-fetch";

interface SvgInfo {
  mediaKey: string;
  fileName: string;
  sanitizedContent: string;
  width: number;
  height: number;
}

@customElement("svg-viewer-dashboard")
export class SvgViewerDashboard extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static styles = css`
    :host {
      display: block;
      padding: var(--uui-size-space-5, 20px);
    }
    .controls {
      display: flex;
      gap: var(--uui-size-space-3, 12px);
      align-items: flex-end;
      margin-bottom: var(--uui-size-space-4, 16px);
      flex-wrap: wrap;
    }
    .controls uui-input {
      min-width: 280px;
    }
    .svg-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--uui-size-space-4, 16px);
      margin-top: var(--uui-size-space-4, 16px);
    }
    .svg-card {
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 8px);
      padding: var(--uui-size-space-3, 12px);
      text-align: center;
      background: var(--uui-color-surface);
    }
    .svg-preview {
      width: 100%;
      height: 150px;
      margin: 0 auto var(--uui-size-space-2, 8px);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .svg-preview svg {
      max-width: 100%;
      max-height: 100%;
    }
    .svg-meta {
      font-size: 11px;
      color: var(--uui-color-text-alt);
      word-break: break-all;
    }
    .empty-state {
      text-align: center;
      padding: var(--uui-size-space-10, 40px);
      color: var(--uui-color-text-alt);
    }
    .empty-state uui-icon {
      font-size: 48px;
      margin-bottom: var(--uui-size-space-3, 12px);
      opacity: 0.4;
    }
  `;

  @state() private _mediaKey = "";
  @state() private _items: SvgInfo[] = [];
  @state() private _loading = false;
  @state() private _error = "";

  private async _loadSingle() {
    this._error = "";
    this._items = [];
    this._loading = true;
    try {
      const r = await this.#fetch(`/umbraco/api/svgviewer/GetSvg?mediaKey=${encodeURIComponent(this._mediaKey)}`);
      if (!r.ok) throw new Error(await r.text());
      this._items = [await r.json()];
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._loading = false;
    }
  }

  private async _loadAll() {
    this._error = "";
    this._items = [];
    this._loading = true;
    try {
      const r = await this.#fetch("/umbraco/api/svgviewer/GetAllSvg");
      if (!r.ok) throw new Error(await r.text());
      this._items = await r.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._loading = false;
    }
  }

  private _renderContent() {
    if (this._loading) {
      return html`<div style="display:flex;justify-content:center;padding:40px;"><uui-loader></uui-loader></div>`;
    }

    if (this._error) {
      return html`<uui-badge color="danger" style="margin-top:12px;">${this._error}</uui-badge>`;
    }

    if (!this._items.length) {
      return html`
        <div class="empty-state">
          <uui-icon name="icon-picture"></uui-icon>
          <p>No SVG files found. Load a single SVG by key or scan all media.</p>
        </div>
      `;
    }

    return html`
      <div class="svg-grid">
        ${this._items.map(
          (item) => html`
            <div class="svg-card">
              <div class="svg-preview">${unsafeHTML(item.sanitizedContent)}</div>
              <div class="svg-meta">
                <strong>${item.fileName}</strong>
                ${item.width && item.height ? html` &mdash; ${item.width}&times;${item.height}` : ""}
                <br /><small>${item.mediaKey}</small>
              </div>
            </div>
          `,
        )}
      </div>
    `;
  }

  render() {
    return html`
      <uui-box headline="SVG Viewer">
        <div class="controls">
          <uui-form-layout-item>
            <uui-label slot="label">Media Key</uui-label>
            <uui-input
              .value=${this._mediaKey}
              @input=${(e: InputEvent) => (this._mediaKey = (e.target as HTMLInputElement).value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            ></uui-input>
          </uui-form-layout-item>
          <uui-button look="primary" label="Load" @click=${this._loadSingle} ?disabled=${this._loading}
            >Load</uui-button
          >
          <uui-button look="secondary" label="Scan all media" @click=${this._loadAll} ?disabled=${this._loading}
            >Load All SVGs</uui-button
          >
        </div>
        ${this._renderContent()}
      </uui-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "svg-viewer-dashboard": SvgViewerDashboard;
  }
}

export default SvgViewerDashboard;
