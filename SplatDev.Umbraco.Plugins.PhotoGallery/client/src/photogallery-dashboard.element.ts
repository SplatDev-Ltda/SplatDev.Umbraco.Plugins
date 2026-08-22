import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";
import { mediaUrlForKey } from "./media-url";

interface Photo {
  id: number;
  albumId: number;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  sortOrder: number;
}

interface Album {
  id: number;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  createdAt: string;
  photos: Photo[];
}

/**
 * Albums and the photos in them.
 *
 * The dashboard listed albums and offered nothing else, while the API behind it had
 * supported creating, renaming and deleting albums and adding and removing photos the
 * whole time. Images are chosen from the media library rather than typed as a URL.
 */
@customElement("photogallery-dashboard")
export class PhotoGalleryDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 66ch; }

    uui-box { margin-bottom: 18px; }
    .field { margin-bottom: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
    uui-input { width: 100%; }
    .actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    td.right { text-align: right; white-space: nowrap; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    tr.selected { background: var(--uui-color-surface-alt, #f6f8fa); }

    .thumb {
      width: 56px; height: 40px; object-fit: cover; border-radius: 3px;
      border: 1px solid var(--uui-color-border, #e5e7eb); background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .muted { color: var(--uui-color-text-alt, #6b7280); }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

    .msg, .splatdev-load-error {
      display: block; margin: 0 0 14px; padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem; border-radius: 3px;
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
  `;

  @state() private _albums: Album[] = [];
  @state() private _photos: Photo[] = [];
  @state() private _selected: Album | null = null;
  @state() private _loading = false;
  @state() private _busy = "";
  @state() private _loadError: string | null = null;
  @state() private _message: { ok: boolean; text: string } | null = null;

  @state() private _newTitle = "";
  @state() private _newDescription = "";
  @state() private _newCoverKeys: string[] = [];

  @state() private _editingId: number | null = null;
  @state() private _editTitle = "";
  @state() private _editDescription = "";

  @state() private _photoTitle = "";
  @state() private _photoCaption = "";
  @state() private _photoKeys: string[] = [];

  private readonly _api = "/umbraco/api/photogallery";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#loadAlbums();
  }

  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }
    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }

  async #loadAlbums(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#fetch(`${this._api}/GetAlbums`);
      if (this.#responseOk(response)) {
        this._albums = await response.json();
        if (this._selected) {
          this._selected = this._albums.find((a) => a.id === this._selected!.id) ?? null;
        }
      }
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
      this._albums = [];
    } finally {
      this._loading = false;
    }
  }

  async #openAlbum(album: Album): Promise<void> {
    if (this._selected?.id === album.id) {
      this._selected = null;
      this._photos = [];
      return;
    }
    this._selected = album;
    this._photos = [];
    try {
      const response = await this.#fetch(`${this._api}/GetPhotos?albumId=${album.id}`);
      if (this.#responseOk(response)) this._photos = await response.json();
    } catch {
      this._loadError ??= "Could not load the photos in that album.";
    }
  }

  /** Turns the picked media key into the URL these records store. */
  async #urlFromSelection(keys: string[]): Promise<string | null> {
    const key = keys[0];
    if (!key) return null;
    return mediaUrlForKey(this.#fetch, key);
  }

  async #createAlbum(): Promise<void> {
    const title = this._newTitle.trim();
    if (!title) {
      this._message = { ok: false, text: "An album needs a title." };
      return;
    }

    this._busy = "album";
    try {
      const coverImageUrl = await this.#urlFromSelection(this._newCoverKeys);
      const response = await this.#fetch(`${this._api}/CreateAlbum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: this._newDescription.trim() || null,
          coverImageUrl,
        }),
      });
      if (response.ok) {
        this._message = { ok: true, text: `Created ${title}.` };
        this._newTitle = this._newDescription = "";
        this._newCoverKeys = [];
        await this.#loadAlbums();
      } else {
        this._message = { ok: false, text: "Could not create that album." };
      }
    } catch {
      this._message = { ok: false, text: "Could not create that album." };
    } finally {
      this._busy = "";
    }
  }

  #startEdit(album: Album): void {
    this._editingId = album.id;
    this._editTitle = album.title;
    this._editDescription = album.description ?? "";
    this._message = null;
  }

  async #saveEdit(album: Album): Promise<void> {
    const title = this._editTitle.trim();
    if (!title) {
      this._message = { ok: false, text: "An album needs a title." };
      return;
    }

    this._busy = `edit:${album.id}`;
    try {
      const response = await this.#fetch(`${this._api}/UpdateAlbum`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...album,
          title,
          description: this._editDescription.trim() || null,
          photos: [],
        }),
      });
      if (response.ok) {
        this._message = { ok: true, text: `Updated ${title}.` };
        this._editingId = null;
        await this.#loadAlbums();
      } else {
        this._message = { ok: false, text: "Could not update that album." };
      }
    } catch {
      this._message = { ok: false, text: "Could not update that album." };
    } finally {
      this._busy = "";
    }
  }

  async #deleteAlbum(album: Album): Promise<void> {
    const count = album.photos?.length ?? 0;
    const confirmed = window.confirm(
      `Delete the album "${album.title}"?\n\n${count > 0 ? `Its ${count} photo${count === 1 ? "" : "s"} go with it. ` : ""}The media library is untouched — only the gallery records are removed. This cannot be undone.`,
    );
    if (!confirmed) return;

    this._busy = `delete:${album.id}`;
    try {
      const response = await this.#fetch(`${this._api}/DeleteAlbum?id=${album.id}`, { method: "DELETE" });
      if (response.ok) {
        this._message = { ok: true, text: `Deleted ${album.title}.` };
        if (this._selected?.id === album.id) {
          this._selected = null;
          this._photos = [];
        }
        await this.#loadAlbums();
      } else {
        this._message = { ok: false, text: "Could not delete that album." };
      }
    } catch {
      this._message = { ok: false, text: "Could not delete that album." };
    } finally {
      this._busy = "";
    }
  }

  async #addPhoto(): Promise<void> {
    if (!this._selected) return;
    const imageUrl = await this.#urlFromSelection(this._photoKeys);
    if (!imageUrl) {
      this._message = { ok: false, text: "Choose an image from the media library first." };
      return;
    }

    this._busy = "photo";
    try {
      const response = await this.#fetch(`${this._api}/AddPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId: this._selected.id,
          title: this._photoTitle.trim() || "Untitled",
          imageUrl,
          caption: this._photoCaption.trim() || null,
          sortOrder: this._photos.length,
        }),
      });
      if (response.ok) {
        this._message = { ok: true, text: "Photo added." };
        this._photoTitle = this._photoCaption = "";
        this._photoKeys = [];
        await this.#openAlbumRefresh();
      } else {
        this._message = { ok: false, text: "Could not add that photo." };
      }
    } catch {
      this._message = { ok: false, text: "Could not add that photo." };
    } finally {
      this._busy = "";
    }
  }

  /** Reloads the open album's photos without toggling it shut. */
  async #openAlbumRefresh(): Promise<void> {
    if (!this._selected) return;
    try {
      const response = await this.#fetch(`${this._api}/GetPhotos?albumId=${this._selected.id}`);
      if (this.#responseOk(response)) this._photos = await response.json();
    } catch {
      this._loadError ??= "Could not reload the photos in that album.";
    }
    await this.#loadAlbums();
  }

  async #deletePhoto(photo: Photo): Promise<void> {
    if (!window.confirm(`Remove "${photo.title}" from this album?\n\nThe file stays in the media library.`)) return;

    this._busy = `photo:${photo.id}`;
    try {
      const response = await this.#fetch(`${this._api}/DeletePhoto?id=${photo.id}`, { method: "DELETE" });
      if (response.ok) {
        this._message = { ok: true, text: "Photo removed." };
        await this.#openAlbumRefresh();
      } else {
        this._message = { ok: false, text: "Could not remove that photo." };
      }
    } catch {
      this._message = { ok: false, text: "Could not remove that photo." };
    } finally {
      this._busy = "";
    }
  }

  #when(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
  }

  #renderPhotos() {
    if (!this._selected) return nothing;
    return html`
      <uui-box headline="Photos in ${this._selected.title} (${this._photos.length})">
        ${this._photos.length === 0
          ? html`<p class="empty">This album has no photos yet. Add one below.</p>`
          : html`
              <table>
                <thead>
                  <tr><th></th><th>Title</th><th>Caption</th><th>Order</th><th></th></tr>
                </thead>
                <tbody>
                  ${this._photos.map(
                    (p) => html`
                      <tr>
                        <td>
                          <img class="thumb" src=${p.thumbnailUrl || p.imageUrl} alt=${p.title} loading="lazy" />
                        </td>
                        <td><strong>${p.title}</strong></td>
                        <td class="muted">${p.caption || "—"}</td>
                        <td class="num">${p.sortOrder}</td>
                        <td class="right">
                          <uui-button
                            compact
                            look="secondary"
                            color="danger"
                            label="Remove ${p.title}"
                            ?disabled=${this._busy === `photo:${p.id}`}
                            @click=${() => this.#deletePhoto(p)}
                            >Remove</uui-button
                          >
                        </td>
                      </tr>
                    `,
                  )}
                </tbody>
              </table>
            `}

        <div class="field" style="margin-top:18px">
          <span class="field-label">Image</span>
          <umb-input-media
            .selection=${this._photoKeys}
            max="1"
            @change=${(e: Event) => {
              const el = e.target as unknown as { selection?: string[] };
              this._photoKeys = el.selection ?? [];
            }}
          ></umb-input-media>
          <p class="hint">Pick from the media library — nothing here asks you to type a URL.</p>
        </div>
        <div class="grid">
          <div>
            <span class="field-label">Title</span>
            <uui-input
              label="Photo title"
              placeholder="e.g. Opening night"
              .value=${this._photoTitle}
              @input=${(e: Event) => (this._photoTitle = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Caption</span>
            <uui-input
              label="Caption"
              placeholder="Optional"
              .value=${this._photoCaption}
              @input=${(e: Event) => (this._photoCaption = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
        </div>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Add photo"
            ?disabled=${this._busy === "photo" || this._photoKeys.length === 0}
            @click=${this.#addPhoto}
            >${this._busy === "photo" ? "Adding…" : "Add photo"}</uui-button
          >
        </div>
      </uui-box>
    `;
  }

  override render() {
    return html`
      <h1>Photo Gallery</h1>
      <p class="description">
        Albums and the photos in them. Select an album to see and edit its photos.
      </p>

      ${this._loadError ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : nothing}
      ${this._message
        ? html`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>`
        : nothing}

      <uui-box headline="Albums (${this._albums.length})">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._albums.length === 0
            ? html`<p class="empty">No albums yet. Create one below.</p>`
            : html`
                <table>
                  <thead>
                    <tr><th></th><th>Title</th><th>Description</th><th>Photos</th><th>Created</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._albums.map((a) => {
                      const editing = this._editingId === a.id;
                      return html`
                        <tr class=${this._selected?.id === a.id ? "selected" : ""}>
                          <td>
                            ${a.coverImageUrl
                              ? html`<img class="thumb" src=${a.coverImageUrl} alt="" loading="lazy" />`
                              : html`<div class="thumb"></div>`}
                          </td>
                          <td>
                            ${editing
                              ? html`<uui-input
                                  label="Title"
                                  .value=${this._editTitle}
                                  @input=${(e: Event) => (this._editTitle = (e.target as HTMLInputElement).value)}
                                ></uui-input>`
                              : html`<strong>${a.title}</strong>`}
                          </td>
                          <td>
                            ${editing
                              ? html`<uui-input
                                  label="Description"
                                  .value=${this._editDescription}
                                  @input=${(e: Event) => (this._editDescription = (e.target as HTMLInputElement).value)}
                                ></uui-input>`
                              : html`<span class="muted">${a.description || "—"}</span>`}
                          </td>
                          <td class="num">${a.photos?.length ?? 0}</td>
                          <td class="num muted">${this.#when(a.createdAt)}</td>
                          <td class="right">
                            ${editing
                              ? html`
                                  <uui-button compact look="primary" color="positive" label="Save ${a.title}"
                                    ?disabled=${this._busy === `edit:${a.id}`}
                                    @click=${() => this.#saveEdit(a)}>Save</uui-button>
                                  <uui-button compact look="secondary" label="Cancel"
                                    @click=${() => (this._editingId = null)}>Cancel</uui-button>
                                `
                              : html`
                                  <uui-button compact look="secondary" label="Open ${a.title}"
                                    @click=${() => this.#openAlbum(a)}
                                    >${this._selected?.id === a.id ? "Close" : "Photos"}</uui-button>
                                  <uui-button compact look="secondary" label="Rename ${a.title}"
                                    @click=${() => this.#startEdit(a)}>Rename</uui-button>
                                  <uui-button compact look="secondary" color="danger" label="Delete ${a.title}"
                                    ?disabled=${this._busy === `delete:${a.id}`}
                                    @click=${() => this.#deleteAlbum(a)}>Delete</uui-button>
                                `}
                          </td>
                        </tr>
                      `;
                    })}
                  </tbody>
                </table>
              `}
      </uui-box>

      ${this.#renderPhotos()}

      <uui-box headline="Create an album">
        <div class="grid">
          <div>
            <span class="field-label">Title</span>
            <uui-input
              label="Album title"
              placeholder="e.g. Summer 2026"
              .value=${this._newTitle}
              @input=${(e: Event) => (this._newTitle = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Description</span>
            <uui-input
              label="Album description"
              placeholder="Optional"
              .value=${this._newDescription}
              @input=${(e: Event) => (this._newDescription = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
        </div>
        <div class="field" style="margin-top:14px">
          <span class="field-label">Cover image</span>
          <umb-input-media
            .selection=${this._newCoverKeys}
            max="1"
            @change=${(e: Event) => {
              const el = e.target as unknown as { selection?: string[] };
              this._newCoverKeys = el.selection ?? [];
            }}
          ></umb-input-media>
          <p class="hint">Optional. Leave empty and the album shows no cover.</p>
        </div>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Create album"
            ?disabled=${this._busy === "album"}
            @click=${this.#createAlbum}
            >${this._busy === "album" ? "Creating…" : "Create album"}</uui-button
          >
        </div>
      </uui-box>
    `;
  }
}

export default PhotoGalleryDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "photogallery-dashboard": PhotoGalleryDashboardElement;
  }
}
