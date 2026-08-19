import { LitElement as _, html as n, css as y, state as d, customElement as m } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as x } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as b } from "@umbraco-cms/backoffice/auth";
function g(e) {
  let t = null;
  const r = new Promise((i) => {
    e.consumeContext(b, async (a) => {
      var o;
      try {
        t = await ((o = a == null ? void 0 : a.getLatestToken) == null ? void 0 : o.call(a)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return async (i, a = {}) => {
    await r;
    const o = new Headers(a.headers);
    t && !o.has("Authorization") && o.set("Authorization", `Bearer ${t}`);
    const s = await fetch(i, { ...a, credentials: "same-origin", headers: o });
    return (s.status === 401 || s.status === 403) && console.error(
      `[SplatDev] ${s.status} from ${String(i)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), s;
  };
}
var k = Object.defineProperty, v = Object.getOwnPropertyDescriptor, c = (e) => {
  throw TypeError(e);
}, u = (e, t, r, i) => {
  for (var a = i > 1 ? void 0 : i ? v(t, r) : t, o = e.length - 1, s; o >= 0; o--)
    (s = e[o]) && (a = (i ? s(t, r, a) : s(a)) || a);
  return i && a && k(t, r, a), a;
}, w = (e, t, r) => t.has(e) || c("Cannot " + r), p = (e, t, r) => (w(e, t, "read from private field"), r ? r.call(e) : t.get(e)), $ = (e, t, r) => t.has(e) ? c("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), h;
const f = [
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
let l = class extends x(_) {
  constructor() {
    super(...arguments), $(this, h, g(this)), this._mediaKey = "", this._filePath = "", this._data = null, this._error = "", this._loading = !1, this._baseUrl = "/umbraco/api/exif/";
  }
  async _lookupByKey() {
    this._data = null, this._error = "", this._loading = !0;
    try {
      const e = await p(this, h).call(this, `${this._baseUrl}GetByMediaKey?mediaKey=${encodeURIComponent(this._mediaKey)}`);
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
      const e = await p(this, h).call(this, `${this._baseUrl}GetByFilePath?filePath=${encodeURIComponent(this._filePath)}`);
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
    return this._data ? f.map(({ key: e, label: t, suffix: r }) => {
      const i = this._data[e];
      return i == null || i === "" ? n`` : n`
        <tr>
          <th>${t}</th>
          <td>${i}${r ?? ""}</td>
        </tr>
      `;
    }) : n``;
  }
  _hasAnyData() {
    return this._data ? f.some(({ key: e }) => {
      const t = this._data[e];
      return t != null && t !== "";
    }) : !1;
  }
  render() {
    return n`
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

        ${this._error ? n`<uui-alert look="danger" class="error-banner">${this._error}</uui-alert>` : ""}

        ${this._hasAnyData() ? n`
              <h4 style="margin-top:20px; font-weight:600;">EXIF Data</h4>
              <table class="exif-table">
                <tbody>
                  ${this._renderRows()}
                </tbody>
              </table>
            ` : this._data ? n`<p style="margin-top:16px; color:var(--uui-color-text-alt,#6b7280);">No EXIF data found for this media item.</p>` : ""}
      </uui-box>
    `;
  }
};
h = /* @__PURE__ */ new WeakMap();
l.styles = y`
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
u([
  d()
], l.prototype, "_mediaKey", 2);
u([
  d()
], l.prototype, "_filePath", 2);
u([
  d()
], l.prototype, "_data", 2);
u([
  d()
], l.prototype, "_error", 2);
u([
  d()
], l.prototype, "_loading", 2);
l = u([
  m("exif-dashboard")
], l);
const F = l;
export {
  l as ExifDashboardElement,
  F as default
};
