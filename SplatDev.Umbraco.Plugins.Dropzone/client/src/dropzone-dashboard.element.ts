import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

/**
 * The built-in Folder media type.
 *
 * Read from the database rather than assumed — Umbraco ships this key for the Folder
 * media type, and restricting the picker to it is what turns "type a media id" into
 * "choose a folder".
 */
const FOLDER_MEDIA_TYPE = "f38bd2d7-65d0-48e6-95dc-87ce06ec2d3d";

interface MediaItem {
  key: string;
  name: string;
  contentType: string;
}

interface DropzoneLimits {
  allowedExtensions: string[];
  maxFileSizeMb: number;
  maxFileSizeBytes: number;
  renameOnCollision: boolean;
}

interface QueueItem {
  file: File;
  status: "queued" | "uploading" | "done" | "rejected";
  detail?: string;
}

/**
 * Upload files into the media library.
 *
 * The destination used to be a free-text "Parent Media ID" box, which asked an editor to
 * know a numeric id that is not shown anywhere in the backoffice. It is now a media
 * picker restricted to folders, and the endpoint accepts the key it returns.
 */
@customElement("dropzone-dashboard")
export class DropzoneDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
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

  @state() private _media: MediaItem[] = [];
  @state() private _queue: QueueItem[] = [];
  @state() private _parentKeys: string[] = [];
  @state() private _limits: DropzoneLimits | null = null;
  @state() private _loading = true;
  @state() private _uploading = false;
  @state() private _dragOver = false;
  @state() private _loadError: string | null = null;

  readonly #fetch = createAuthFetch(this);
  private readonly _api = "/umbraco/api/dropzone";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#loadLimits();
    void this.#loadMedia();
  }

  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }
    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to manage media here. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }

  async #loadLimits(): Promise<void> {
    try {
      const response = await this.#fetch(`${this._api}/GetOptions`);
      if (this.#responseOk(response)) this._limits = await response.json();
    } catch {
      /* the server enforces the limits regardless; the UI just cannot preview them */
    }
  }

  async #loadMedia(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#fetch(`${this._api}/GetMedia`);
      if (this.#responseOk(response)) this._media = await response.json();
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
    } finally {
      this._loading = false;
    }
  }

  /** Rejects a file up front, so an obvious mistake costs nothing. */
  #reject(file: File): string | null {
    const limits = this._limits;
    if (!limits) return null;

    if (limits.allowedExtensions?.length) {
      const ext = (file.name.split(".").pop() ?? "").toLowerCase();
      const ok = limits.allowedExtensions.some((a) => a.replace(/^\./, "").toLowerCase() === ext);
      if (!ok) return `.${ext} is not allowed`;
    }

    if (limits.maxFileSizeBytes > 0 && file.size > limits.maxFileSizeBytes) {
      return `${this.#size(file.size)} is over the ${limits.maxFileSizeMb} MB limit`;
    }

    return null;
  }

  #enqueue(files: FileList | File[]): void {
    const added: QueueItem[] = [];
    for (const file of Array.from(files)) {
      const reason = this.#reject(file);
      added.push(
        reason
          ? { file, status: "rejected", detail: reason }
          : { file, status: "queued" },
      );
    }
    this._queue = [...this._queue, ...added];
  }

  #onDrop(e: DragEvent): void {
    e.preventDefault();
    this._dragOver = false;
    if (e.dataTransfer?.files?.length) this.#enqueue(e.dataTransfer.files);
  }

  #onFileInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) this.#enqueue(input.files);
    input.value = "";
  }

  async #uploadAll(): Promise<void> {
    const pending = this._queue.filter((q) => q.status === "queued");
    if (pending.length === 0) return;

    this._uploading = true;
    for (const item of pending) {
      item.status = "uploading";
      this._queue = [...this._queue];

      const body = new FormData();
      body.append("file", item.file);
      if (this._parentKeys.length) body.append("parentMediaKey", this._parentKeys[0]);

      try {
        const response = await this.#fetch(`${this._api}/Upload`, { method: "POST", body });
        if (response.ok) {
          const result = await response.json();
          item.status = "done";
          item.detail = `${result.name} · ${result.mediaTypeAlias}`;
        } else {
          const problem = await response.text();
          item.status = "rejected";
          item.detail = problem?.slice(0, 160) || `${response.status}`;
        }
      } catch {
        item.status = "rejected";
        item.detail = "The upload request failed.";
      }
      this._queue = [...this._queue];
    }
    this._uploading = false;
    await this.#loadMedia();
  }

  async #delete(key: string): Promise<void> {
    try {
      const response = await this.#fetch(`${this._api}/Delete?mediaKey=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      if (this.#responseOk(response)) await this.#loadMedia();
    } catch {
      this._loadError = "Could not delete that item.";
    }
  }

  #size(bytes: number): string {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  #limitsSentence(): string {
    const l = this._limits;
    if (!l) return "";
    const parts: string[] = [];
    if (l.allowedExtensions?.length) parts.push(`Allowed: ${l.allowedExtensions.join(", ")}.`);
    else parts.push("Any file type is accepted.");
    if (l.maxFileSizeMb > 0) parts.push(`Up to ${l.maxFileSizeMb} MB each.`);
    if (l.renameOnCollision) parts.push("A name already in use is given a suffix rather than duplicated.");
    return parts.join(" ");
  }

  override render() {
    const queued = this._queue.filter((q) => q.status === "queued").length;

    return html`
      <h1>Dropzone</h1>
      <p class="description">
        Drop files here to add them to the media library. Choose the folder they should go
        into, or leave it empty to put them at the root.
      </p>

      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : nothing}

      <uui-box headline="Upload">
        <div class="field">
          <span class="field-label">Destination folder</span>
          <umb-input-media
            .selection=${this._parentKeys}
            .allowedContentTypeIds=${[FOLDER_MEDIA_TYPE]}
            max="1"
            @change=${(e: Event) => {
              const el = e.target as unknown as { selection?: string[] };
              this._parentKeys = el.selection ?? [];
            }}
          ></umb-input-media>
          <p class="hint">
            ${this._parentKeys.length
              ? "Files go into the folder above."
              : "Nothing chosen, so files go to the media root."}
          </p>
        </div>

        <div
          class="drop ${this._dragOver ? "over" : ""}"
          @dragover=${(e: DragEvent) => {
            e.preventDefault();
            this._dragOver = true;
          }}
          @dragleave=${() => (this._dragOver = false)}
          @drop=${this.#onDrop}
        >
          <p>Drop files here</p>
          <input id="fileInput" type="file" multiple style="display:none" @change=${this.#onFileInput} />
          <uui-button
            look="secondary"
            label="Choose files"
            @click=${() => this.shadowRoot?.querySelector<HTMLInputElement>("#fileInput")?.click()}
            >Choose files</uui-button
          >
          ${this._limits ? html`<p class="hint">${this.#limitsSentence()}</p>` : nothing}
        </div>

        ${this._queue.length
          ? html`
              <table>
                <thead>
                  <tr><th>File</th><th>Size</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  ${this._queue.map(
                    (q) => html`
                      <tr>
                        <td>${q.file.name}</td>
                        <td class="num">${this.#size(q.file.size)}</td>
                        <td><span class="state ${q.status}">${q.status}</span></td>
                        <td>${q.detail ?? ""}</td>
                      </tr>
                    `,
                  )}
                </tbody>
              </table>
            `
          : nothing}

        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Upload"
            ?disabled=${this._uploading || queued === 0}
            @click=${this.#uploadAll}
            >${this._uploading ? "Uploading…" : `Upload ${queued || ""}`.trim()}</uui-button
          >
          ${this._queue.length
            ? html`<uui-button look="secondary" label="Clear list" @click=${() => (this._queue = [])}
                >Clear list</uui-button
              >`
            : nothing}
        </div>
      </uui-box>

      <uui-box headline="Media at the root">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._media.length === 0
            ? html`<p class="empty">Nothing here yet.</p>`
            : html`
                <table>
                  <thead>
                    <tr><th>Name</th><th>Type</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._media.map(
                      (m) => html`
                        <tr>
                          <td>${m.name}</td>
                          <td>${m.contentType}</td>
                          <td>
                            <uui-button
                              compact
                              look="secondary"
                              color="danger"
                              label="Delete ${m.name}"
                              @click=${() => this.#delete(m.key)}
                              >Delete</uui-button
                            >
                          </td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>
              `}
      </uui-box>
    `;
  }
}

export default DropzoneDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "dropzone-dashboard": DropzoneDashboardElement;
  }
}
