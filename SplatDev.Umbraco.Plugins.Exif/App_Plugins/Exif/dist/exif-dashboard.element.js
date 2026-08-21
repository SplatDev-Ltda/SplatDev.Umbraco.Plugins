import { LitElement as g, html as u, css as k, state as p, customElement as w } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as v } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as $ } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as E } from "@umbraco-cms/backoffice/notification";
function P(e) {
  let t = null, a = null;
  const i = e.consumeContext.bind(e), l = new Promise((r) => {
    i($, async (o) => {
      var d;
      try {
        t = await ((d = o == null ? void 0 : o.getLatestToken) == null ? void 0 : d.call(o)) ?? null;
      } catch {
        t = null;
      }
      r();
    }), setTimeout(r, 3e3);
  });
  return i(E, (r) => {
    a = r;
  }), async (r, o = {}) => {
    await l;
    const d = new Headers(o.headers);
    t && !d.has("Authorization") && d.set("Authorization", `Bearer ${t}`);
    const n = await fetch(r, { ...o, credentials: "same-origin", headers: d });
    if (!n.ok) {
      const c = n.status === 401 || n.status === 403, b = c ? "Not authorised" : "Could not load data", _ = c ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${n.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${n.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${n.status} from ${String(r)} — ${_}`), a == null || a.peek("danger", { data: { headline: b, message: _ } });
    }
    return n;
  };
}
var I = Object.defineProperty, F = Object.getOwnPropertyDescriptor, x = (e) => {
  throw TypeError(e);
}, h = (e, t, a, i) => {
  for (var l = i > 1 ? void 0 : i ? F(t, a) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (l = (i ? o(t, a, l) : o(l)) || l);
  return i && l && I(t, a, l), l;
}, T = (e, t, a) => t.has(e) || x("Cannot " + a), m = (e, t, a) => (T(e, t, "read from private field"), a ? a.call(e) : t.get(e)), K = (e, t, a) => t.has(e) ? x("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), f;
const y = [
  { key: "camera", label: "Camera" },
  { key: "lens", label: "Lens" },
  { key: "dateTaken", label: "Date Taken" },
  { key: "exposureTime", label: "Exposure Time" },
  { key: "fNumber", label: "F-Number" },
  { key: "iso", label: "ISO" },
  { key: "width", label: "Width", suffix: " px" },
  { key: "height", label: "Height", suffix: " px" },
  { key: "gpsLatitude", label: "GPS Latitude" },
  { key: "gpsLongitude", label: "GPS Longitude" }
];
let s = class extends v(g) {
  constructor() {
    super(...arguments), K(this, f, P(this)), this._mediaKey = "", this._filePath = "", this._data = null, this._error = "", this._loading = !1, this._baseUrl = "/umbraco/api/exif/";
  }
  async _lookupByKey() {
    this._data = null, this._error = "", this._loading = !0;
    try {
      const e = await m(this, f).call(this, `${this._baseUrl}GetByMediaKey?mediaKey=${encodeURIComponent(this._mediaKey)}`);
      if (!e.ok) throw new Error(await e.text());
      this._data = await e.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Not found.";
    } finally {
      this._loading = !1;
    }
  }
  async _lookupByPath() {
    this._data = null, this._error = "", this._loading = !0;
    try {
      const e = await m(this, f).call(this, `${this._baseUrl}GetByFilePath?filePath=${encodeURIComponent(this._filePath)}`);
      if (!e.ok) throw new Error(await e.text());
      this._data = await e.json();
    } catch (e) {
      this._error = e instanceof Error ? e.message : "Not found.";
    } finally {
      this._loading = !1;
    }
  }
  _handleMediaKeyInput(e) {
    this._mediaKey = e.target.value;
  }
  _handleFilePathInput(e) {
    this._filePath = e.target.value;
  }
  _renderRows() {
    return this._data ? y.map(({ key: e, label: t, suffix: a }) => {
      const i = this._data[e];
      return i == null || i === "" ? u`` : u`
        <tr>
          <th>${t}</th>
          <td>${i}${a ?? ""}</td>
        </tr>
      `;
    }) : u``;
  }
  _hasAnyData() {
    return this._data ? y.some(({ key: e }) => {
      const t = this._data[e];
      return t != null && t !== "";
    }) : !1;
  }
  render() {
    return u`
      <uui-box headline="EXIF Metadata Viewer">
        <div class="lookup-grid">
          <div class="lookup-section">
            <h3>Look up by Media Key</h3>
            <div class="lookup-form">
              <uui-form-layout-item>
                <uui-label slot="label">Media Key (GUID)</uui-label>
                <uui-input
                  .value=${this._mediaKey}
                  @input=${this._handleMediaKeyInput}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                ></uui-input>
              </uui-form-layout-item>
              <uui-button
                look="primary"
                label="Get EXIF"
                @click=${this._lookupByKey}
                ?disabled=${this._loading}
              >
                ${this._loading ? "Loading..." : "Get EXIF"}
              </uui-button>
            </div>
          </div>

          <div class="lookup-section">
            <h3>Look up by File Path</h3>
            <div class="lookup-form">
              <uui-form-layout-item>
                <uui-label slot="label">Physical File Path</uui-label>
                <uui-input
                  .value=${this._filePath}
                  @input=${this._handleFilePathInput}
                  placeholder="/var/www/media/..."
                ></uui-input>
              </uui-form-layout-item>
              <uui-button
                look="primary"
                label="Get EXIF"
                @click=${this._lookupByPath}
                ?disabled=${this._loading}
              >
                ${this._loading ? "Loading..." : "Get EXIF"}
              </uui-button>
            </div>
          </div>
        </div>

        ${this._error ? u`<uui-alert look="danger" class="error-banner">${this._error}</uui-alert>` : ""}

        ${this._hasAnyData() ? u`
              <h4 style="margin-top:20px; font-weight:600;">EXIF Data</h4>
              <table class="exif-table">
                <tbody>
                  ${this._renderRows()}
                </tbody>
              </table>
            ` : this._data ? u`<p style="margin-top:16px; color:var(--uui-color-text-alt,#6b7280);">No EXIF data found for this media item.</p>` : ""}
      </uui-box>
    `;
  }
};
f = /* @__PURE__ */ new WeakMap();
s.styles = k`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    .lookup-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--uui-size-layout-2, 24px);
    }

    @media (max-width: 768px) {
      .lookup-grid {
        grid-template-columns: 1fr;
      }
    }

    .lookup-section h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 12px;
      padding: 0;
    }

    .lookup-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .error-banner {
      margin-top: 16px;
    }

    .exif-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }

    .exif-table th,
    .exif-table td {
      border: 1px solid var(--uui-color-border, #e5e7eb);
      padding: 8px 12px;
      text-align: left;
    }

    .exif-table th {
      background: var(--uui-color-surface-emphasis, #f3f4f6);
      width: 160px;
      font-weight: 600;
    }

    .exif-table td {
      word-break: break-word;
    }
  `;
h([
  p()
], s.prototype, "_mediaKey", 2);
h([
  p()
], s.prototype, "_filePath", 2);
h([
  p()
], s.prototype, "_data", 2);
h([
  p()
], s.prototype, "_error", 2);
h([
  p()
], s.prototype, "_loading", 2);
s = h([
  w("exif-dashboard")
], s);
const G = s;
export {
  s as ExifDashboardElement,
  G as default
};
