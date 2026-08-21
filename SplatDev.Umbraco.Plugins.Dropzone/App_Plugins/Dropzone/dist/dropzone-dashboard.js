import { LitElement as y, html as d, css as v, state as c, customElement as $ } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as w } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as k } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as I } from "@umbraco-cms/backoffice/notification";
function T(e) {
  let t = null, a = null;
  const i = e.consumeContext.bind(e), s = new Promise((r) => {
    i(k, async (o) => {
      var u;
      try {
        t = await ((u = o == null ? void 0 : o.getLatestToken) == null ? void 0 : u.call(o)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return i(I, (r) => {
    a = r;
  }), async (r, o = {}) => {
    await s;
    const u = new Headers(o.headers);
    t && !u.has("Authorization") && u.set("Authorization", `Bearer ${t}`);
    const n = await fetch(r, { ...o, credentials: "same-origin", headers: u });
    if (!n.ok) {
      const g = n.status === 401 || n.status === 403, b = g ? "Not authorised" : "Could not load data", f = g ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(r)} — ${f}`), a == null || a.peek("danger", { data: { headline: b, message: f } });
    }
    return n;
  };
}
var D = Object.defineProperty, M = Object.getOwnPropertyDescriptor, _ = (e) => {
  throw TypeError(e);
}, h = (e, t, a, i) => {
  for (var s = i > 1 ? void 0 : i ? M(t, a) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (i ? o(t, a, s) : o(s)) || s);
  return i && s && D(t, a, s), s;
}, A = (e, t, a) => t.has(e) || _("Cannot " + a), m = (e, t, a) => (A(e, t, "read from private field"), a ? a.call(e) : t.get(e)), U = (e, t, a) => t.has(e) ? _("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), p;
let l = class extends w(y) {
  constructor() {
    super(...arguments), U(this, p, T(this)), this._queue = [], this._mediaItems = [], this._parentMediaId = "", this._dragging = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadMedia();
  }
  async _loadMedia() {
    const e = await m(this, p).call(this, "/umbraco/api/dropzone/GetMedia");
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
        const a = await m(this, p).call(this, "/umbraco/api/dropzone/Upload", { method: "POST", body: t });
        if (a.ok)
          e.done = !0;
        else {
          const i = await a.json();
          e.error = i.error || "Failed";
        }
      } catch {
        e.error = "Upload error";
      }
      e.uploading = !1, this.requestUpdate();
    }
    await this._loadMedia();
  }
  async _delete(e) {
    await m(this, p).call(this, `/umbraco/api/dropzone/Delete?mediaKey=${e}`, { method: "DELETE" }), await this._loadMedia();
  }
  render() {
    return d`
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

                ${this._queue.length ? d`
                    <h4>Upload Queue</h4>
                    ${this._queue.map((e) => d`
                        <div class="upload-item">
                            <span>${e.file.name}</span>
                            ${e.uploading ? d`<uui-loader></uui-loader>` : ""}
                            ${e.done ? d`<uui-badge color="positive">Uploaded</uui-badge>` : ""}
                            ${e.error ? d`<uui-badge color="danger">${e.error}</uui-badge>` : ""}
                        </div>`)}
                    <uui-button look="primary" label="Upload All" @click=${this._uploadAll}>Upload All</uui-button>
                ` : ""}

                ${this._mediaItems.length ? d`
                    <h4 style="margin-top:24px;">Media Items</h4>
                    <table>
                        <thead><tr><th>Name</th><th>Type</th><th>Key</th><th></th></tr></thead>
                        <tbody>
                            ${this._mediaItems.map((e) => d`
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
p = /* @__PURE__ */ new WeakMap();
l.styles = v`
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
h([
  c()
], l.prototype, "_queue", 2);
h([
  c()
], l.prototype, "_mediaItems", 2);
h([
  c()
], l.prototype, "_parentMediaId", 2);
h([
  c()
], l.prototype, "_dragging", 2);
l = h([
  $("dropzone-dashboard")
], l);
const z = l;
export {
  l as DropzoneDashboard,
  z as default
};
//# sourceMappingURL=dropzone-dashboard.js.map
