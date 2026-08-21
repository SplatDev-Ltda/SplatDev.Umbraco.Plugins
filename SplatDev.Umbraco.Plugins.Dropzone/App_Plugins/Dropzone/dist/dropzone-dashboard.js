import { LitElement as T, html as d, css as k, state as c, customElement as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as D } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as I } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as M } from "@umbraco-cms/backoffice/notification";
function E(e) {
  let t = null, a = null;
  const i = e.consumeContext.bind(e), s = new Promise((o) => {
    i(I, async (r) => {
      var u;
      try {
        t = await ((u = r == null ? void 0 : r.getLatestToken) == null ? void 0 : u.call(r)) ?? null;
      } catch {
        t = null;
      }
      o();
    }), setTimeout(o, 3e3);
  });
  return i(M, (o) => {
    a = o;
  }), async (o, r = {}) => {
    await s;
    const u = new Headers(r.headers);
    t && !u.has("Authorization") && u.set("Authorization", `Bearer ${t}`);
    const n = await fetch(o, { ...r, credentials: "same-origin", headers: u });
    if (!n.ok) {
      const g = n.status === 401 || n.status === 403, w = g ? "Not authorised" : "Could not load data", m = g ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(o)} — ${m}`), a == null || a.peek("danger", { data: { headline: w, message: m } });
    }
    return n;
  };
}
var q = Object.defineProperty, A = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, p = (e, t, a, i) => {
  for (var s = i > 1 ? void 0 : i ? A(t, a) : t, o = e.length - 1, r; o >= 0; o--)
    (r = e[o]) && (s = (i ? r(t, a, s) : r(s)) || s);
  return i && s && q(t, a, s), s;
}, y = (e, t, a) => t.has(e) || v("Cannot " + a), f = (e, t, a) => (y(e, t, "read from private field"), a ? a.call(e) : t.get(e)), b = (e, t, a) => t.has(e) ? v("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), U = (e, t, a) => (y(e, t, "access private method"), a), h, _, $;
let l = class extends D(T) {
  constructor() {
    super(...arguments), b(this, _), b(this, h, E(this)), this._queue = [], this._mediaItems = [], this._parentMediaId = "", this._dragging = !1, this._loadError = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._loadMedia();
  }
  async _loadMedia() {
    const e = await f(this, h).call(this, "/umbraco/api/dropzone/GetMedia");
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
        const a = await f(this, h).call(this, "/umbraco/api/dropzone/Upload", { method: "POST", body: t });
        if (U(this, _, $).call(this, a))
          e.done = !0;
        else {
          const i = await a.json();
          e.error = i.error || "Failed";
        }
      } catch {
        this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), e.error = "Upload error";
      }
      e.uploading = !1, this.requestUpdate();
    }
    await this._loadMedia();
  }
  async _delete(e) {
    await f(this, h).call(this, `/umbraco/api/dropzone/Delete?mediaKey=${e}`, { method: "DELETE" }), await this._loadMedia();
  }
  render() {
    return d`
      ${this._loadError ? d`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
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
h = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakSet();
$ = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
l.styles = k`
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
    
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;
p([
  c()
], l.prototype, "_queue", 2);
p([
  c()
], l.prototype, "_mediaItems", 2);
p([
  c()
], l.prototype, "_parentMediaId", 2);
p([
  c()
], l.prototype, "_dragging", 2);
p([
  c()
], l.prototype, "_loadError", 2);
l = p([
  x("dropzone-dashboard")
], l);
const P = l;
export {
  l as DropzoneDashboard,
  P as default
};
//# sourceMappingURL=dropzone-dashboard.js.map
