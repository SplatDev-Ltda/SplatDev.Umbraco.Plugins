import { LitElement as _, html as s, css as f, state as p, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as b } from "@umbraco-cms/backoffice/auth";
function y(e) {
  let a = null;
  const r = new Promise((o) => {
    e.consumeContext(b, async (t) => {
      var i;
      try {
        a = await ((i = t == null ? void 0 : t.getLatestToken) == null ? void 0 : i.call(t)) ?? null;
      } catch {
        a = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return async (o, t = {}) => {
    await r;
    const i = new Headers(t.headers);
    a && !i.has("Authorization") && i.set("Authorization", `Bearer ${a}`);
    const d = await fetch(o, { ...t, credentials: "same-origin", headers: i });
    return (d.status === 401 || d.status === 403) && console.error(
      `[SplatDev] ${d.status} from ${String(o)} — the backoffice token was ${a ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), d;
  };
}
var v = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, c = (e) => {
  throw TypeError(e);
}, u = (e, a, r, o) => {
  for (var t = o > 1 ? void 0 : o ? $(a, r) : a, i = e.length - 1, d; i >= 0; i--)
    (d = e[i]) && (t = (o ? d(a, r, t) : d(t)) || t);
  return o && t && v(a, r, t), t;
}, k = (e, a, r) => a.has(e) || c("Cannot " + r), h = (e, a, r) => (k(e, a, "read from private field"), r ? r.call(e) : a.get(e)), w = (e, a, r) => a.has(e) ? c("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, r), n;
let l = class extends m(_) {
  constructor() {
    super(...arguments), w(this, n, y(this)), this._queue = [], this._mediaItems = [], this._parentMediaId = "", this._dragging = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadMedia();
  }
  async _loadMedia() {
    const e = await h(this, n).call(this, "/umbraco/api/dropzone/GetMedia");
    this._mediaItems = await e.json();
  }
  _onDrop(e) {
    e.preventDefault(), this._dragging = !1;
    const a = Array.from(e.dataTransfer.files);
    this._addToQueue(a);
  }
  _onFileInput(e) {
    this._addToQueue(Array.from(e.target.files));
  }
  _addToQueue(e) {
    this._queue = [...this._queue, ...e.map((a) => ({ file: a, uploading: !1, done: !1, error: null }))];
  }
  async _uploadAll() {
    for (const e of this._queue) {
      if (e.done) continue;
      e.uploading = !0, this.requestUpdate();
      const a = new FormData();
      a.append("file", e.file), this._parentMediaId && a.append("parentMediaId", this._parentMediaId);
      try {
        const r = await h(this, n).call(this, "/umbraco/api/dropzone/Upload", { method: "POST", body: a });
        if (r.ok)
          e.done = !0;
        else {
          const o = await r.json();
          e.error = o.error || "Failed";
        }
      } catch {
        e.error = "Upload error";
      }
      e.uploading = !1, this.requestUpdate();
    }
    await this._loadMedia();
  }
  async _delete(e) {
    await h(this, n).call(this, `/umbraco/api/dropzone/Delete?mediaKey=${e}`, { method: "DELETE" }), await this._loadMedia();
  }
  render() {
    return s`
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

                ${this._queue.length ? s`
                    <h4>Upload Queue</h4>
                    ${this._queue.map((e) => s`
                        <div class="upload-item">
                            <span>${e.file.name}</span>
                            ${e.uploading ? s`<uui-loader></uui-loader>` : ""}
                            ${e.done ? s`<uui-badge color="positive">Uploaded</uui-badge>` : ""}
                            ${e.error ? s`<uui-badge color="danger">${e.error}</uui-badge>` : ""}
                        </div>`)}
                    <uui-button look="primary" label="Upload All" @click=${this._uploadAll}>Upload All</uui-button>
                ` : ""}

                ${this._mediaItems.length ? s`
                    <h4 style="margin-top:24px;">Media Items</h4>
                    <table>
                        <thead><tr><th>Name</th><th>Type</th><th>Key</th><th></th></tr></thead>
                        <tbody>
                            ${this._mediaItems.map((e) => s`
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
n = /* @__PURE__ */ new WeakMap();
l.styles = f`
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
u([
  p()
], l.prototype, "_queue", 2);
u([
  p()
], l.prototype, "_mediaItems", 2);
u([
  p()
], l.prototype, "_parentMediaId", 2);
u([
  p()
], l.prototype, "_dragging", 2);
l = u([
  g("dropzone-dashboard")
], l);
const T = l;
export {
  l as DropzoneDashboard,
  T as default
};
//# sourceMappingURL=dropzone-dashboard.js.map
