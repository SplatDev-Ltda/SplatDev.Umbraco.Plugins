import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface ExifData {
  camera?: string;
  lens?: string;
  dateTaken?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  width?: number;
  height?: number;
  gpsLatitude?: string;
  gpsLongitude?: string;
}

const EXIF_FIELDS: { key: keyof ExifData; label: string; suffix?: string }[] = [
  { key: "camera", label: "Camera" },
  { key: "lens", label: "Lens" },
  { key: "dateTaken", label: "Date Taken" },
  { key: "exposureTime", label: "Exposure Time" },
  { key: "fNumber", label: "F-Number" },
  { key: "iso", label: "ISO" },
  { key: "width", label: "Width", suffix: " px" },
  { key: "height", label: "Height", suffix: " px" },
  { key: "gpsLatitude", label: "GPS Latitude" },
  { key: "gpsLongitude", label: "GPS Longitude" },
];

@customElement("exif-dashboard")
export class ExifDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
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

  @state() private _mediaKey = "";
  @state() private _filePath = "";
  @state() private _data: ExifData | null = null;
  @state() private _error = "";
  @state() private _loading = false;

  private _baseUrl = "/umbraco/api/exif/";

  private async _lookupByKey() {
    this._data = null;
    this._error = "";
    this._loading = true;
    try {
      const r = await this.#fetch(
        `${this._baseUrl}GetByMediaKey?mediaKey=${encodeURIComponent(this._mediaKey)}`
      );
      if (!r.ok) throw new Error(await r.text());
      this._data = (await r.json()) as ExifData;
    } catch (e: unknown) {
      this._error = e instanceof Error ? e.message : "Not found.";
    } finally {
      this._loading = false;
    }
  }

  private async _lookupByPath() {
    this._data = null;
    this._error = "";
    this._loading = true;
    try {
      const r = await this.#fetch(
        `${this._baseUrl}GetByFilePath?filePath=${encodeURIComponent(this._filePath)}`
      );
      if (!r.ok) throw new Error(await r.text());
      this._data = (await r.json()) as ExifData;
    } catch (e: unknown) {
      this._error = e instanceof Error ? e.message : "Not found.";
    } finally {
      this._loading = false;
    }
  }

  private _handleMediaKeyInput(e: Event) {
    this._mediaKey = (e.target as HTMLInputElement).value;
  }

  private _handleFilePathInput(e: Event) {
    this._filePath = (e.target as HTMLInputElement).value;
  }

  private _renderRows() {
    if (!this._data) return html``;
    return EXIF_FIELDS.map(({ key, label, suffix }) => {
      const value = this._data![key];
      if (value === undefined || value === null || value === "") return html``;
      return html`
        <tr>
          <th>${label}</th>
          <td>${value}${suffix ?? ""}</td>
        </tr>
      `;
    });
  }

  private _hasAnyData(): boolean {
    if (!this._data) return false;
    return EXIF_FIELDS.some(({ key }) => {
      const v = this._data![key];
      return v !== undefined && v !== null && v !== "";
    });
  }

  override render() {
    return html`
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

        ${this._error
          ? html`<uui-alert look="danger" class="error-banner">${this._error}</uui-alert>`
          : ""}

        ${this._hasAnyData()
          ? html`
              <h4 style="margin-top:20px; font-weight:600;">EXIF Data</h4>
              <table class="exif-table">
                <tbody>
                  ${this._renderRows()}
                </tbody>
              </table>
            `
          : this._data
            ? html`<p style="margin-top:16px; color:var(--uui-color-text-alt,#6b7280);">No EXIF data found for this media item.</p>`
            : ""}
      </uui-box>
    `;
  }
}

export default ExifDashboardElement;
