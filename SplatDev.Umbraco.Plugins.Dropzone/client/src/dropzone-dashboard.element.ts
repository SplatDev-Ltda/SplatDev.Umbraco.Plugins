import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

@customElement("dropzone-dashboard")
export class DropzoneDashboard extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

    static styles = css`
        :host { display: block; padding: 20px; }
        .drop-area {
            border: 2px dashed var(--uui-color-border);
            border-radius: 8px;
            padding: 48px;
            text-align: center;
            cursor: pointer;
            transition: border-color .2s, background .2s;
        }
        .drop-area.active { border-color: var(--uui-color-focus); background: var(--uui-color-surface-emphasis); }
        .upload-item { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid var(--uui-color-border); padding: 8px 12px; }
        th { background: var(--uui-color-surface-emphasis); }
    `;

    @state() _queue = [];
    @state() _mediaItems = [];
    @state() _parentMediaId = "";
    @state() _dragging = false;

    connectedCallback() {
        super.connectedCallback();
        this._loadMedia();
    }

    async _loadMedia() {
        const r = await this.#fetch("/umbraco/api/dropzone/GetMedia");
        this._mediaItems = await r.json();
    }

    _onDrop(e) {
        e.preventDefault();
        this._dragging = false;
        const files = Array.from(e.dataTransfer.files);
        this._addToQueue(files);
    }

    _onFileInput(e) {
        this._addToQueue(Array.from(e.target.files));
    }

    _addToQueue(files) {
        this._queue = [...this._queue, ...files.map(f => ({ file: f, uploading: false, done: false, error: null }))];
    }

    async _uploadAll() {
        for (const item of this._queue) {
            if (item.done) continue;
            item.uploading = true;
            this.requestUpdate();
            const fd = new FormData();
            fd.append("file", item.file);
            if (this._parentMediaId) fd.append("parentMediaId", this._parentMediaId);
            try {
                const r = await this.#fetch("/umbraco/api/dropzone/Upload", { method: "POST", body: fd });
                if (r.ok) { item.done = true; } else { const d = await r.json(); item.error = d.error || "Failed"; }
            } catch { item.error = "Upload error"; }
            item.uploading = false;
            this.requestUpdate();
        }
        await this._loadMedia();
    }

    async _delete(key) {
        await this.#fetch(`/umbraco/api/dropzone/Delete?mediaKey=${key}`, { method: "DELETE" });
        await this._loadMedia();
    }

    render() {
        return html`
            <uui-box headline="Dropzone — File Upload">
                <div
                    class="drop-area ${this._dragging ? "active" : ""}"
                    @dragover=${e => { e.preventDefault(); this._dragging = true; }}
                    @dragleave=${() => this._dragging = false}
                    @drop=${this._onDrop}
                    @click=${() => this.renderRoot.querySelector("#fileInput").click()}>
                    <uui-icon name="icon-upload"></uui-icon>
                    <p>Drag &amp; drop files here, or <strong>click to select</strong></p>
                    <input id="fileInput" type="file" multiple style="display:none" @change=${this._onFileInput} />
                </div>

                <uui-form-layout-item style="margin-top:12px;">
                    <uui-label slot="label">Parent Media ID (optional)</uui-label>
                    <uui-input .value=${this._parentMediaId} @input=${e => this._parentMediaId = e.target.value} placeholder="Leave blank for root"></uui-input>
                </uui-form-layout-item>

                ${this._queue.length ? html`
                    <h4>Upload Queue</h4>
                    ${this._queue.map(item => html`
                        <div class="upload-item">
                            <span>${item.file.name}</span>
                            ${item.uploading ? html`<uui-loader></uui-loader>` : ""}
                            ${item.done ? html`<uui-badge color="positive">Uploaded</uui-badge>` : ""}
                            ${item.error ? html`<uui-badge color="danger">${item.error}</uui-badge>` : ""}
                        </div>`)}
                    <uui-button look="primary" label="Upload All" @click=${this._uploadAll}>Upload All</uui-button>
                ` : ""}

                ${this._mediaItems.length ? html`
                    <h4 style="margin-top:24px;">Media Items</h4>
                    <table>
                        <thead><tr><th>Name</th><th>Type</th><th>Key</th><th></th></tr></thead>
                        <tbody>
                            ${this._mediaItems.map(m => html`
                                <tr>
                                    <td>${m.name}</td>
                                    <td>${m.contentType}</td>
                                    <td><small>${m.key}</small></td>
                                    <td><uui-button look="danger" label="Delete" @click=${() => this._delete(m.key)}>Delete</uui-button></td>
                                </tr>`)}
                        </tbody>
                    </table>` : ""}
            </uui-box>`;
    }
}

export default DropzoneDashboard;
