import { LitElement as F, nothing as _, html as u, css as B, state as c, customElement as U } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as K } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as j } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as I } from "@umbraco-cms/backoffice/notification";
function N(e) {
  let t = null, a = null;
  const i = e.consumeContext.bind(e), s = new Promise((n) => {
    i(j, async (l) => {
      var f;
      try {
        t = await ((f = l == null ? void 0 : l.getLatestToken) == null ? void 0 : f.call(l)) ?? null;
      } catch {
        t = null;
      }
      n();
    }), setTimeout(n, 3e3);
  });
  return i(I, (n) => {
    a = n;
  }), async (n, l = {}) => {
    await s;
    const f = new Headers(l.headers);
    t && !f.has("Authorization") && f.set("Authorization", `Bearer ${t}`);
    const p = await fetch(n, { ...l, credentials: "same-origin", headers: f });
    if (!p.ok) {
      const $ = p.status === 401 || p.status === 403, S = $ ? "Not authorised" : "Could not load data", w = $ ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${p.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${p.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${p.status} from ${String(n)} — ${w}`), a == null || a.peek("danger", { data: { headline: S, message: w } });
    }
    return p;
  };
}
var L = Object.defineProperty, P = Object.getOwnPropertyDescriptor, E = (e) => {
  throw TypeError(e);
}, h = (e, t, a, i) => {
  for (var s = i > 1 ? void 0 : i ? P(t, a) : t, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (s = (i ? l(t, a, s) : l(s)) || s);
  return i && s && L(t, a, s), s;
}, T = (e, t, a) => t.has(e) || E("Cannot " + a), b = (e, t, a) => (T(e, t, "read from private field"), a ? a.call(e) : t.get(e)), k = (e, t, a) => t.has(e) ? E("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), r = (e, t, a) => (T(e, t, "access private method"), a), m, o, g, z, y, q, v, D, C, M, O, x, A;
const G = "f38bd2d7-65d0-48e6-95dc-87ce06ec2d3d";
let d = class extends K(F) {
  constructor() {
    super(...arguments), k(this, o), this._media = [], this._queue = [], this._parentKeys = [], this._limits = null, this._loading = !0, this._uploading = !1, this._dragOver = !1, this._loadError = null, k(this, m, N(this)), this._api = "/umbraco/api/dropzone";
  }
  connectedCallback() {
    super.connectedCallback(), r(this, o, z).call(this), r(this, o, y).call(this);
  }
  render() {
    const e = this._queue.filter((t) => t.status === "queued").length;
    return u`
      <h1>Dropzone</h1>
      <p class="description">
        Drop files here to add them to the media library. Choose the folder they should go
        into, or leave it empty to put them at the root.
      </p>

      ${this._loadError ? u`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : _}

      <uui-box headline="Upload">
        <div class="field">
          <span class="field-label">Destination folder</span>
          <umb-input-media
            .selection=${this._parentKeys}
            .allowedContentTypeIds=${[G]}
            max="1"
            @change=${(t) => {
      const a = t.target;
      this._parentKeys = a.selection ?? [];
    }}
          ></umb-input-media>
          <p class="hint">
            ${this._parentKeys.length ? "Files go into the folder above." : "Nothing chosen, so files go to the media root."}
          </p>
        </div>

        <div
          class="drop ${this._dragOver ? "over" : ""}"
          @dragover=${(t) => {
      t.preventDefault(), this._dragOver = !0;
    }}
          @dragleave=${() => this._dragOver = !1}
          @drop=${r(this, o, D)}
        >
          <p>Drop files here</p>
          <input id="fileInput" type="file" multiple style="display:none" @change=${r(this, o, C)} />
          <uui-button
            look="secondary"
            label="Choose files"
            @click=${() => {
      var t, a;
      return (a = (t = this.shadowRoot) == null ? void 0 : t.querySelector("#fileInput")) == null ? void 0 : a.click();
    }}
            >Choose files</uui-button
          >
          ${this._limits ? u`<p class="hint">${r(this, o, A).call(this)}</p>` : _}
        </div>

        ${this._queue.length ? u`
              <table>
                <thead>
                  <tr><th>File</th><th>Size</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  ${this._queue.map(
      (t) => u`
                      <tr>
                        <td>${t.file.name}</td>
                        <td class="num">${r(this, o, x).call(this, t.file.size)}</td>
                        <td><span class="state ${t.status}">${t.status}</span></td>
                        <td>${t.detail ?? ""}</td>
                      </tr>
                    `
    )}
                </tbody>
              </table>
            ` : _}

        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Upload"
            ?disabled=${this._uploading || e === 0}
            @click=${r(this, o, M)}
            >${this._uploading ? "Uploading…" : `Upload ${e || ""}`.trim()}</uui-button
          >
          ${this._queue.length ? u`<uui-button look="secondary" label="Clear list" @click=${() => this._queue = []}
                >Clear list</uui-button
              >` : _}
        </div>
      </uui-box>

      <uui-box headline="Media at the root">
        ${this._loading ? u`<uui-loader></uui-loader>` : this._media.length === 0 ? u`<p class="empty">Nothing here yet.</p>` : u`
                <table>
                  <thead>
                    <tr><th>Name</th><th>Type</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._media.map(
      (t) => u`
                        <tr>
                          <td>${t.name}</td>
                          <td>${t.contentType}</td>
                          <td>
                            <uui-button
                              compact
                              look="secondary"
                              color="danger"
                              label="Delete ${t.name}"
                              @click=${() => r(this, o, O).call(this, t.key)}
                              >Delete</uui-button
                            >
                          </td>
                        </tr>
                      `
    )}
                  </tbody>
                </table>
              `}
      </uui-box>
    `;
  }
};
m = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
g = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to manage media here. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
z = async function() {
  try {
    const e = await b(this, m).call(this, `${this._api}/GetOptions`);
    r(this, o, g).call(this, e) && (this._limits = await e.json());
  } catch {
  }
};
y = async function() {
  this._loading = !0;
  try {
    const e = await b(this, m).call(this, `${this._api}/GetMedia`);
    r(this, o, g).call(this, e) && (this._media = await e.json());
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details.");
  } finally {
    this._loading = !1;
  }
};
q = function(e) {
  var a;
  const t = this._limits;
  if (!t) return null;
  if ((a = t.allowedExtensions) != null && a.length) {
    const i = (e.name.split(".").pop() ?? "").toLowerCase();
    if (!t.allowedExtensions.some((n) => n.replace(/^\./, "").toLowerCase() === i)) return `.${i} is not allowed`;
  }
  return t.maxFileSizeBytes > 0 && e.size > t.maxFileSizeBytes ? `${r(this, o, x).call(this, e.size)} is over the ${t.maxFileSizeMb} MB limit` : null;
};
v = function(e) {
  const t = [];
  for (const a of Array.from(e)) {
    const i = r(this, o, q).call(this, a);
    t.push(
      i ? { file: a, status: "rejected", detail: i } : { file: a, status: "queued" }
    );
  }
  this._queue = [...this._queue, ...t];
};
D = function(e) {
  var t, a;
  e.preventDefault(), this._dragOver = !1, (a = (t = e.dataTransfer) == null ? void 0 : t.files) != null && a.length && r(this, o, v).call(this, e.dataTransfer.files);
};
C = function(e) {
  var a;
  const t = e.target;
  (a = t.files) != null && a.length && r(this, o, v).call(this, t.files), t.value = "";
};
M = async function() {
  const e = this._queue.filter((t) => t.status === "queued");
  if (e.length !== 0) {
    this._uploading = !0;
    for (const t of e) {
      t.status = "uploading", this._queue = [...this._queue];
      const a = new FormData();
      a.append("file", t.file), this._parentKeys.length && a.append("parentMediaKey", this._parentKeys[0]);
      try {
        const i = await b(this, m).call(this, `${this._api}/Upload`, { method: "POST", body: a });
        if (i.ok) {
          const s = await i.json();
          t.status = "done", t.detail = `${s.name} · ${s.mediaTypeAlias}`;
        } else {
          const s = await i.text();
          t.status = "rejected", t.detail = (s == null ? void 0 : s.slice(0, 160)) || `${i.status}`;
        }
      } catch {
        t.status = "rejected", t.detail = "The upload request failed.";
      }
      this._queue = [...this._queue];
    }
    this._uploading = !1, await r(this, o, y).call(this);
  }
};
O = async function(e) {
  try {
    const t = await b(this, m).call(this, `${this._api}/Delete?mediaKey=${encodeURIComponent(e)}`, {
      method: "DELETE"
    });
    r(this, o, g).call(this, t) && await r(this, o, y).call(this);
  } catch {
    this._loadError = "Could not delete that item.";
  }
};
x = function(e) {
  if (!e) return "0 B";
  const t = ["B", "KB", "MB", "GB"], a = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1);
  return `${(e / 1024 ** a).toFixed(a === 0 ? 0 : 1)} ${t[a]}`;
};
A = function() {
  var a;
  const e = this._limits;
  if (!e) return "";
  const t = [];
  return (a = e.allowedExtensions) != null && a.length ? t.push(`Allowed: ${e.allowedExtensions.join(", ")}.`) : t.push("Any file type is accepted."), e.maxFileSizeMb > 0 && t.push(`Up to ${e.maxFileSizeMb} MB each.`), e.renameOnCollision && t.push("A name already in use is given a suffix rather than duplicated."), t.join(" ");
};
d.styles = B`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 62ch; }

    uui-box { margin-bottom: 18px; }
    .field { margin-bottom: 18px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 8px;
    }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }

    .drop {
      border: 2px dashed var(--uui-color-border, #d1d5db);
      border-radius: 6px; padding: 28px; text-align: center;
      transition: border-color 120ms, background 120ms;
    }
    .drop.over { border-color: var(--uui-color-focus, #3b82f6); background: var(--uui-color-surface-alt, #f3f4f6); }
    .drop p { margin: 0 0 10px; color: var(--uui-color-text-alt, #6b7280); }

    table { width: 100%; border-collapse: collapse; margin-top: 14px; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 9px 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; }
    tr:last-child td { border-bottom: none; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    .state { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; padding: 1px 7px; border-radius: 9999px; }
    .state.queued { background: var(--uui-color-surface-alt, #f3f4f6); }
    .state.uploading { background: #dbeafe; color: #1e40af; }
    .state.done { background: #d1fae5; color: #065f46; }
    .state.rejected { background: #fee2e2; color: #991b1b; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 12px 10px; }
    .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }

    .splatdev-load-error {
      display: block; margin: 0 0 14px; padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem; border-radius: 3px;
    }
  `;
h([
  c()
], d.prototype, "_media", 2);
h([
  c()
], d.prototype, "_queue", 2);
h([
  c()
], d.prototype, "_parentKeys", 2);
h([
  c()
], d.prototype, "_limits", 2);
h([
  c()
], d.prototype, "_loading", 2);
h([
  c()
], d.prototype, "_uploading", 2);
h([
  c()
], d.prototype, "_dragOver", 2);
h([
  c()
], d.prototype, "_loadError", 2);
d = h([
  U("dropzone-dashboard")
], d);
const Y = d;
export {
  d as DropzoneDashboardElement,
  Y as default
};
//# sourceMappingURL=dropzone-dashboard.js.map
