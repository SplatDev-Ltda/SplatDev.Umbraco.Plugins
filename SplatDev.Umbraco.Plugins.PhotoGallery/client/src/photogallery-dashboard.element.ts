import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface Photo {
  id?: string;
  title: string;
  caption?: string;
  imageUrl: string;
  thumbnailUrl?: string;
}

interface PhotoAlbum {
  id?: string;
  title: string;
  description?: string;
  photos: Photo[];
}

@customElement("photogallery-dashboard")
export class PhotogalleryDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: var(--uui-size-layout-3, 48px);
    }

    .empty-state {
      text-align: center;
      padding: var(--uui-size-layout-3, 48px);
      color: var(--uui-color-text-alt, #6b7280);
    }

    .album-card {
      margin-bottom: var(--uui-size-layout-2, 24px);
    }

    .album-description {
      margin: 0 0 12px;
      color: var(--uui-color-text-alt, #6b7280);
      line-height: 1.6;
    }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--uui-size-layout-1, 12px);
    }

    .photo-thumb {
      border-radius: 6px;
      overflow: hidden;
      background: var(--uui-color-surface-emphasis, #f3f4f6);
    }

    .photo-thumb img {
      width: 100%;
      height: 100px;
      object-fit: cover;
      display: block;
    }

    .photo-caption {
      padding: 6px 8px;
      font-size: 0.8rem;
      color: var(--uui-color-text-alt, #6b7280);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .error-banner {
      margin-bottom: var(--uui-size-layout-2, 24px);
    }
  `;

  @state() private _albums: PhotoAlbum[] = [];
  @state() private _loading = true;
  @state() private _error = "";

  override connectedCallback() {
    super.connectedCallback();
    void this._loadAlbums();
  }

  private async _loadAlbums() {
    this._error = "";
    this._loading = true;
    try {
      const response = await this.#fetch("/umbraco/api/photogallery/GetAlbums");
      if (!response.ok) throw new Error(await response.text());
      this._albums = (await response.json()) as PhotoAlbum[];
    } catch (e: unknown) {
      this._error = e instanceof Error ? e.message : "Failed to load albums.";
    } finally {
      this._loading = false;
    }
  }

  override render() {
    if (this._loading) {
      return html`
        <uui-box headline="Photo Gallery">
          <div class="loading-container">
            <uui-loader></uui-loader>
          </div>
        </uui-box>
      `;
    }

    if (this._error) {
      return html`
        <uui-box headline="Photo Gallery">
          <uui-alert look="danger" class="error-banner">${this._error}</uui-alert>
        </uui-box>
      `;
    }

    if (this._albums.length === 0) {
      return html`
        <uui-box headline="Photo Gallery">
          <div class="empty-state">
            <p>No albums found. Create your first gallery album.</p>
          </div>
        </uui-box>
      `;
    }

    return html`
      <uui-box headline="Photo Gallery">
        ${this._albums.map(
          (album) => html`
            <uui-box .headline=${album.title} class="album-card">
              ${album.description
                ? html`<p class="album-description">${album.description}</p>`
                : ""}
              ${(album.photos ?? []).length > 0
                ? html`
                    <div class="photo-grid">
                      ${album.photos.map(
                        (photo) => html`
                          <div class="photo-thumb">
                            <img
                              src=${photo.thumbnailUrl ?? photo.imageUrl}
                              alt=${photo.title}
                              loading="lazy"
                            />
                            ${photo.caption
                              ? html`<div class="photo-caption">${photo.caption}</div>`
                              : ""}
                          </div>
                        `
                      )}
                    </div>
                  `
                : html`<p class="album-description">No photos in this album.</p>`}
            </uui-box>
          `
        )}
      </uui-box>
    `;
  }
}

export default PhotogalleryDashboardElement;
