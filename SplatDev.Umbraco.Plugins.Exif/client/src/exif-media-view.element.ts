import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_MEDIA_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/media";

import { createAuthFetch } from "./auth-fetch";

/** Mirrors SplatDev.Umbraco.Plugins.Exif.Models.ExifData. */
interface ExifData {
  camera?: string | null;
  lens?: string | null;
  dateTaken?: string | null;
  exposureTime?: string | null;
  fNumber?: string | null;
  iso?: string | null;
  gpsLatitude?: string | null;
  gpsLongitude?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Field order as a photographer would read it, not as the class declares it. */
const FIELDS: ReadonlyArray<readonly [keyof ExifData, string]> = [
  ["camera", "Camera"],
  ["lens", "Lens"],
  ["dateTaken", "Date taken"],
  ["exposureTime", "Exposure"],
  ["fNumber", "Aperture"],
  ["iso", "ISO"],
];

/**
 * An EXIF tab on the media item itself.
 *
 * The dashboard requires you to have a media key or a server path to hand. This reads the
 * item you are already looking at and loads its EXIF as soon as the tab renders, which is
 * where anyone actually wants the data.
 */
@customElement("exif-media-view")
export class ExifMediaViewElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--uui-color-divider, #e9e9eb); }
    th { width: 32%; font-weight: 600; }
    h4 { margin: 20px 0 6px; font-size: 0.95rem; }
    .state { color: var(--uui-color-text-alt, #68676a); }
    .error { color: #991b1b; }
  `;

  @state() private _data: ExifData | null = null;
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _loaded = false;

  readonly #fetch = createAuthFetch(this);
  #unique: string | null = null;

  override connectedCallback(): void {
    super.connectedCallback();

    this.consumeContext(UMB_MEDIA_WORKSPACE_CONTEXT, (context) => {
      if (!context) return;

      // Observing `unique` rather than reading it once: the same element instance is
      // reused when moving between media items, so a one-off read would leave the first
      // item's EXIF on screen for every item after it.
      const ctx = context as unknown as {
        unique?: unknown;
        getUnique?: () => string | undefined;
      };

      if (ctx.unique) {
        this.observe(ctx.unique as never, (unique: unknown) => {
          const key = typeof unique === "string" ? unique : null;
          if (key && key !== this.#unique) {
            this.#unique = key;
            void this._load(key);
          }
        });
      } else {
        const key = ctx.getUnique?.() ?? null;
        if (key) {
          this.#unique = key;
          void this._load(key);
        }
      }
    });
  }

  private async _load(mediaKey: string): Promise<void> {
    this._loading = true;
    this._error = null;
    try {
      const res = await this.#fetch(
        `/umbraco/api/exif/GetByMediaKey?mediaKey=${encodeURIComponent(mediaKey)}`
      );
      if (!res.ok) {
        // 404 is the ordinary answer for a media item with no EXIF — a PDF, an SVG, a
        // re-encoded JPEG. Saying "no EXIF" there is correct; saying it for a 401 would
        // hide an authorisation problem behind an empty state.
        this._error =
          res.status === 404
            ? null
            : res.status === 401 || res.status === 403
              ? `The request was refused (${res.status}).`
              : `Reading EXIF failed with ${res.status}.`;
        this._data = null;
      } else {
        this._data = (await res.json()) as ExifData;
      }
    } catch (e) {
      this._error = `Could not read EXIF: ${String(e)}`;
      this._data = null;
    } finally {
      this._loading = false;
      this._loaded = true;
    }
  }

  private _rows(): Array<[string, string]> {
    const d = this._data;
    if (!d) return [];
    const rows: Array<[string, string]> = [];

    for (const [key, label] of FIELDS) {
      const v = d[key];
      if (v !== null && v !== undefined && String(v).trim() !== "") {
        rows.push([label, String(v)]);
      }
    }

    if (d.width && d.height) rows.push(["Dimensions", `${d.width} × ${d.height}`]);

    // Both halves of a coordinate or neither — half a position is worse than none.
    if (d.gpsLatitude && d.gpsLongitude) {
      rows.push(["Location", `${d.gpsLatitude}, ${d.gpsLongitude}`]);
    }

    return rows;
  }

  override render() {
    if (this._loading) return html`<p class="state">Reading EXIF…</p>`;
    if (this._error) return html`<p class="state error">${this._error}</p>`;

    const rows = this._rows();
    if (this._loaded && rows.length === 0) {
      return html`<p class="state">
        This item carries no EXIF metadata. That is normal for SVGs, PDFs, and images
        re-encoded by an editor that strips it.
      </p>`;
    }
    if (!this._loaded) return nothing;

    return html`
      <table>
        ${rows.map(([label, value]) => html`<tr><th>${label}</th><td>${value}</td></tr>`)}
      </table>
    `;
  }
}

export default ExifMediaViewElement;

declare global {
  interface HTMLElementTagNameMap {
    "exif-media-view": ExifMediaViewElement;
  }
}
