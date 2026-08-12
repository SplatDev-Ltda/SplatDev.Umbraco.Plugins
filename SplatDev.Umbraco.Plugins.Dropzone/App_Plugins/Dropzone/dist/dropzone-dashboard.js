import { LitElement as p, html as a, css as c, state as u, customElement as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
var m = Object.defineProperty, f = Object.getOwnPropertyDescriptor, l = (e, t, i, d) => {
  for (var r = d > 1 ? void 0 : d ? f(t, i) : t, s = e.length - 1, n; s >= 0; s--)
    (n = e[s]) && (r = (d ? n(t, i, r) : n(r)) || r);
  return d && r && m(t, i, r), r;
};
let o = class extends g(p) {
  constructor() {
    super(...arguments), this._queue = [], this._mediaItems = [], this._parentMediaId = "", this._dragging = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadMedia();
  }
  async _loadMedia() {
    const e = await fetch("/umbraco/api/dropzone/GetMedia");
    this._mediaItems = await e.json();
  }
  _onDrop(e) {
    e.preventDefault(), this._dragging = !1;
    const t = Array.from(e.dataTransfer.files);
    this._addToQueue(t);
  }
  _onFileInput(e) {
    this._addToQueue(Array.from(e.target.files));
  }
  _addToQueue(e) {
    this._queue = [...this._queue, ...e.map((t) => ({ file: t, uploading: !1, done: !1, error: null }))];
  }
  async _uploadAll() {
    for (const e of this._queue) {
      if (e.done) continue;
      e.uploading = !0, this.requestUpdate();
      const t = new FormData();
      t.append("file", e.file), this._parentMediaId && t.append("parentMediaId", this._parentMediaId);
      try {
        const i = await fetch("/umbraco/api/dropzone/Upload", { method: "POST", body: t });
        if (i.ok)
          e.done = !0;
        else {
          const d = await i.json();
          e.error = d.error || "Failed";
        }
      } catch {
        e.error = "Upload error";
      }
      e.uploading = !1, this.requestUpdate();
    }
    await this._loadMedia();
  }
  async _delete(e) {
    await fetch(`/umbraco/api/dropzone/Delete?mediaKey=${e}`, { method: "DELETE" }), await this._loadMedia();
  }
  render() {
    return a`
            <uui-box headline="Dropzone — File Upload">
                <div
                    class="drop-area ${this._dragging ? "active" : ""}"
                    @dragover=${(e) => {
      e.preventDefault(), this._dragging = !0;
    }}
                    @dragleave=${() => this._dragging = !1}
                    @drop=${this._onDrop}
                    @click=${() => this.renderRoot.querySelector("#fileInput").click()}>
                    <uui-icon name="icon-upload"></uui-icon>
                    <p>Drag &amp; drop files here, or <strong>click to select</strong></p>
                    <input id="fileInput" type="file" multiple style="display:none" @change=${this._onFileInput} />
                </div>

                <uui-form-layout-item style="margin-top:12px;">
                    <uui-label slot="label">Parent Media ID (optional)</uui-label>
                    <uui-input .value=${this._parentMediaId} @input=${(e) => this._parentMediaId = e.target.value} placeholder="Leave blank for root"></uui-input>
                </uui-form-layout-item>

                ${this._queue.length ? a`
                    <h4>Upload Queue</h4>
                    ${this._queue.map((e) => a`
                        <div class="upload-item">
                            <span>${e.file.name}</span>
                            ${e.uploading ? a`<uui-loader></uui-loader>` : ""}
                            ${e.done ? a`<uui-badge color="positive">Uploaded</uui-badge>` : ""}
                            ${e.error ? a`<uui-badge color="danger">${e.error}</uui-badge>` : ""}
                        </div>`)}
                    <uui-button look="primary" label="Upload All" @click=${this._uploadAll}>Upload All</uui-button>
                ` : ""}

                ${this._mediaItems.length ? a`
                    <h4 style="margin-top:24px;">Media Items</h4>
                    <table>
                        <thead><tr><th>Name</th><th>Type</th><th>Key</th><th></th></tr></thead>
                        <tbody>
                            ${this._mediaItems.map((e) => a`
                                <tr>
                                    <td>${e.name}</td>
                                    <td>${e.contentType}</td>
                                    <td><small>${e.key}</small></td>
                                    <td><uui-button look="danger" label="Delete" @click=${() => this._delete(e.key)}>Delete</uui-button></td>
                                </tr>`)}
                        </tbody>
                    </table>` : ""}
            </uui-box>`;
  }
};
o.styles = c`
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
l([
  u()
], o.prototype, "_queue", 2);
l([
  u()
], o.prototype, "_mediaItems", 2);
l([
  u()
], o.prototype, "_parentMediaId", 2);
l([
  u()
], o.prototype, "_dragging", 2);
o = l([
  h("dropzone-dashboard")
], o);
const y = o;
export {
  o as DropzoneDashboard,
  y as default
};
//# sourceMappingURL=dropzone-dashboard.js.map
