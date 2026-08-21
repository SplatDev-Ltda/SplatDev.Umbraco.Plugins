import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { unsafeHTML } from "@umbraco-cms/backoffice/external/lit";

@customElement("svg-viewer-dashboard")
export class SvgViewerDashboard extends UmbElementMixin(LitElement) {
    static styles = css`
        :host { display: block; padding: 20px; }
        .svg-grid { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; }
        .svg-card {
            border: 1px solid var(--uui-color-border);
            border-radius: 8px;
            padding: 12px;
            width: 180px;
            text-align: center;
            background: var(--uui-color-surface);
        }
        .svg-preview {
            width: 140px;
            height: 140px;
            margin: 0 auto 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .svg-preview svg { max-width: 100%; max-height: 100%; }
        .svg-meta { font-size: 11px; color: var(--uui-color-text-alt); word-break: break-all; }
    `;

    @state() _mediaKey = "";
    @state() _items = [];
    @state() _loading = false;
    @state() _error = "";

    async _loadSingle() {
        this._error = ""; this._items = [];
        try {
            const r = await fetch(`/umbraco/api/svgviewer/GetSvg?mediaKey=${encodeURIComponent(this._mediaKey)}`);
            if (!r.ok) throw new Error(await r.text());
            this._items = [await r.json()];
        } catch (e) { this._error = e.message; }
    }

    async _loadAll() {
        this._error = ""; this._items = []; this._loading = true;
        try {
            const r = await fetch("/umbraco/api/svgviewer/GetAllSvg");
            if (!r.ok) throw new Error(await r.text());
            this._items = await r.json();
        } catch (e) { this._error = e.message; }
        this._loading = false;
    }

    render() {
        return html`
            <uui-box headline="SVG Viewer">
                <div style="display:flex;gap:12px;align-items:flex-end;margin-bottom:16px;">
                    <uui-form-layout-item>
                        <uui-label slot="label">Media Key</uui-label>
                        <uui-input .value=${this._mediaKey} @input=${e => this._mediaKey = e.target.value} placeholder="xxxxxxxx-xxxx-..."></uui-input>
                    </uui-form-layout-item>
                    <uui-button look="primary" label="Load" @click=${this._loadSingle}>Load</uui-button>
                    <uui-button look="secondary" label="Load All SVGs" @click=${this._loadAll}>Load All SVGs</uui-button>
                </div>

                ${this._loading ? html`<uui-loader></uui-loader>` : ""}
                ${this._error ? html`<uui-badge color="danger">${this._error}</uui-badge>` : ""}

                ${this._items.length ? html`
                    <div class="svg-grid">
                        ${this._items.map(item => html`
                            <div class="svg-card">
                                <div class="svg-preview">${unsafeHTML(item.sanitizedContent)}</div>
                                <div class="svg-meta">
                                    <strong>${item.fileName}</strong>
                                    ${item.width && item.height ? html` — ${item.width}×${item.height}` : ""}
                                    <br /><small>${item.mediaKey}</small>
                                </div>
                            </div>`)}
                    </div>` : ""}
            </uui-box>`;
    }
}

export default SvgViewerDashboard;
