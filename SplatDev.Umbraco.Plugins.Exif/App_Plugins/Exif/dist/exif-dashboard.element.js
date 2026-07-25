import { LitElement as p, html as l, css as x, state as u, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
var _ = Object.defineProperty, b = Object.getOwnPropertyDescriptor, r = (e, t, s, a) => {
  for (var o = a > 1 ? void 0 : a ? b(t, s) : t, n = e.length - 1, d; n >= 0; n--)
    (d = e[n]) && (o = (a ? d(t, s, o) : d(o)) || o);
  return a && o && _(t, s, o), o;
};
const h = [
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
let i = class extends m(p) {
  constructor() {
    super(...arguments), this._mediaKey = "", this._filePath = "", this._data = null, this._error = "", this._loading = !1, this._baseUrl = "/umbraco/api/exif/";
  }
  async _lookupByKey() {
    this._data = null, this._error = "", this._loading = !0;
    try {
      const e = await fetch(
        `${this._baseUrl}GetByMediaKey?mediaKey=${encodeURIComponent(this._mediaKey)}`
      );
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
      const e = await fetch(
        `${this._baseUrl}GetByFilePath?filePath=${encodeURIComponent(this._filePath)}`
      );
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
    return this._data ? h.map(({ key: e, label: t, suffix: s }) => {
      const a = this._data[e];
      return a == null || a === "" ? l`` : l`
        <tr>
          <th>${t}</th>
          <td>${a}${s ?? ""}</td>
        </tr>
      `;
    }) : l``;
  }
  _hasAnyData() {
    return this._data ? h.some(({ key: e }) => {
      const t = this._data[e];
      return t != null && t !== "";
    }) : !1;
  }
  render() {
    return l`
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

        ${this._error ? l`<uui-alert look="danger" class="error-banner">${this._error}</uui-alert>` : ""}

        ${this._hasAnyData() ? l`
              <h4 style="margin-top:20px; font-weight:600;">EXIF Data</h4>
              <table class="exif-table">
                <tbody>
                  ${this._renderRows()}
                </tbody>
              </table>
            ` : this._data ? l`<p style="margin-top:16px; color:var(--uui-color-text-alt,#6b7280);">No EXIF data found for this media item.</p>` : ""}
      </uui-box>
    `;
  }
};
i.styles = x`
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
r([
  u()
], i.prototype, "_mediaKey", 2);
r([
  u()
], i.prototype, "_filePath", 2);
r([
  u()
], i.prototype, "_data", 2);
r([
  u()
], i.prototype, "_error", 2);
r([
  u()
], i.prototype, "_loading", 2);
i = r([
  f("exif-dashboard")
], i);
const g = i;
export {
  i as ExifDashboardElement,
  g as default
};
