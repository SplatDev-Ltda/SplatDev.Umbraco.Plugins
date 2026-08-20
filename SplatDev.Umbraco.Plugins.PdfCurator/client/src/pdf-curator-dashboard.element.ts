import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface BookEntry {
  id: number;
  title: string;
  author: string;
}

@customElement("pdf-curator-dashboard")
export class PdfCuratorDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 var(--uui-size-space-3, 8px);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 var(--uui-size-space-6, 24px);
    }

    uui-tab-group {
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .tab-content {
      margin-top: var(--uui-size-space-5, 16px);
    }

    .empty-state {
      text-align: center;
      padding: var(--uui-size-space-10, 48px);
      color: var(--uui-color-text-alt, #6b7280);
    }

    .upload-area {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-4, 12px);
      max-width: 480px;
    }

    .upload-area label {
      font-weight: 500;
    }

    .message {
      padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
      border-radius: var(--uui-border-radius, 4px);
      font-size: 0.875rem;
    }

    .message.success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }

    .message.error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3, 8px);
      color: var(--uui-color-text-alt, #6b7280);
      padding: var(--uui-size-space-5, 16px) 0;
    }

    uui-table {
      width: 100%;
    }

    uui-table-head-cell,
    uui-table-cell {
      padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
    }
  `;

  @state() private _activeTab: string = "library";
  @state() private _books: BookEntry[] = [];
  @state() private _loadingBooks: boolean = false;
  @state() private _selectedFile: File | null = null;
  @state() private _uploading: boolean = false;
  @state() private _uploadMessage: string = "";
  @state() private _uploadSuccess: boolean = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this._fetchBooks();
  }

  private async _fetchBooks(): Promise<void> {
    this._loadingBooks = true;
    try {
      const response = await this.#fetch("/umbraco/api/ManagerApi/GetAllAsync");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this._books = (await response.json()) as BookEntry[];
    } catch {
      this._books = [];
    } finally {
      this._loadingBooks = false;
    }
  }

  private async _deleteBook(id: number): Promise<void> {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      const response = await this.#fetch(`/umbraco/api/ManagerApi/Delete/${id}`, { method: "DELETE" });
      if (response.ok) {
        this._books = this._books.filter((b) => b.id !== id);
      }
    } catch {
      // silently ignore
    }
  }

  private _onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._selectedFile = input.files?.[0] ?? null;
    this._uploadMessage = "";
  }

  private async _upload(): Promise<void> {
    if (!this._selectedFile) return;
    this._uploading = true;
    this._uploadMessage = "";
    try {
      const formData = new FormData();
      formData.append("file", this._selectedFile);
      const response = await this.#fetch("/umbraco/api/UploadApi/UploadFiles", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this._uploadSuccess = true;
      this._uploadMessage = "File uploaded successfully.";
      this._selectedFile = null;
      await this._fetchBooks();
    } catch (err: unknown) {
      this._uploadSuccess = false;
      this._uploadMessage = err instanceof Error ? err.message : "Upload failed.";
    } finally {
      this._uploading = false;
    }
  }

  private _renderLibraryTab() {
    if (this._loadingBooks) {
      return html`
        <div class="loading">
          <uui-loader-circle></uui-loader-circle>
          <span>Loading library...</span>
        </div>
      `;
    }

    if (this._books.length === 0) {
      return html`
        <div class="empty-state">
          <p>No PDFs in the library yet. Upload one to get started.</p>
        </div>
      `;
    }

    return html`
      <uui-table>
        <uui-table-head>
          <uui-table-head-cell>ID</uui-table-head-cell>
          <uui-table-head-cell>Title</uui-table-head-cell>
          <uui-table-head-cell>Author</uui-table-head-cell>
          <uui-table-head-cell>Actions</uui-table-head-cell>
        </uui-table-head>
        ${this._books.map(
          (book) => html`
            <uui-table-row>
              <uui-table-cell>${book.id}</uui-table-cell>
              <uui-table-cell>${book.title}</uui-table-cell>
              <uui-table-cell>${book.author}</uui-table-cell>
              <uui-table-cell>
                <uui-button
                  look="secondary"
                  color="danger"
                  label="Delete"
                  @click=${() => this._deleteBook(book.id)}
                >
                  Delete
                </uui-button>
              </uui-table-cell>
            </uui-table-row>
          `
        )}
      </uui-table>
    `;
  }

  private _renderUploadTab() {
    return html`
      <uui-box headline="Upload PDF">
        <div class="upload-area">
          <label for="pdf-file-input">Select a PDF file</label>
          <input
            id="pdf-file-input"
            type="file"
            accept=".pdf"
            @change=${this._onFileChange}
          />
          ${this._selectedFile
            ? html`<p>Selected: <strong>${this._selectedFile.name}</strong></p>`
            : nothing}
          <uui-button
            look="primary"
            label="Upload"
            ?disabled=${!this._selectedFile || this._uploading}
            @click=${this._upload}
          >
            ${this._uploading ? "Uploading..." : "Upload"}
          </uui-button>
          ${this._uploadMessage
            ? html`
                <div class="message ${this._uploadSuccess ? "success" : "error"}">
                  ${this._uploadMessage}
                </div>
              `
            : nothing}
        </div>
      </uui-box>
    `;
  }

  override render() {
    return html`
      <h1>PDF Curator</h1>
      <p class="description">
        Manage your digital book and PDF library. Upload, browse, and organise
        your PDF collection from the Umbraco backoffice.
      </p>

      <uui-tab-group>
        <uui-tab
          label="Library"
          ?active=${this._activeTab === "library"}
          @click=${() => (this._activeTab = "library")}
        >
          Library
        </uui-tab>
        <uui-tab
          label="Upload"
          ?active=${this._activeTab === "upload"}
          @click=${() => (this._activeTab = "upload")}
        >
          Upload
        </uui-tab>
      </uui-tab-group>

      <div class="tab-content">
        ${this._activeTab === "library"
          ? this._renderLibraryTab()
          : this._renderUploadTab()}
      </div>
    `;
  }
}

export default PdfCuratorDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "pdf-curator-dashboard": PdfCuratorDashboardElement;
  }
}
