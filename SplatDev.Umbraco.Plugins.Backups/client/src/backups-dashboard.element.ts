import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

/** Mirrors BackupScope in the C# model — a [Flags] enum. */
const SCOPE = {
  Content: 1,
  Media: 2,
  Database: 4,
} as const;

interface BackupInfo {
  name: string;
  createdAt: string;
  sizeBytes: number;
  extension: string;
  isCompressed: boolean;
  isEncrypted: boolean;
}

interface CloudProvider {
  id: string;
  providerType: string;
  enabled: boolean;
}

interface BackupResult {
  name: string;
  localPath: string;
  sizeBytes: number;
  contentCount: number;
  mediaCount: number;
  cloudUploads: { providerName: string; success: boolean; errorMessage: string }[];
}

/**
 * Take, restore and delete backups.
 *
 * The previous version of this dashboard was the shared placeholder template: a
 * hardcoded "Active" badge and a Save button whose handler set a flag for three seconds
 * and wrote nothing. It made no requests at all, so a backup plugin offered no way to
 * take a backup — while the API underneath supported scope selection, compression,
 * encryption, cloud upload and restore the whole time.
 */
@customElement("backups-dashboard")
export class BackupsBackupsDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 62ch; }

    uui-box { margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
    fieldset { border: none; margin: 0; padding: 0; }
    legend, .field-label {
      font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 8px; padding: 0;
    }
    .stack { display: flex; flex-direction: column; gap: 8px; }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    tr:last-child td { border-bottom: none; }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6); margin-right: 4px;
    }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

    .splatdev-load-error, .msg {
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
    .danger-zone { border-top: 1px solid var(--uui-color-border, #e5e7eb); margin-top: 16px; padding-top: 16px; }
  `;

  @state() private _backups: BackupInfo[] = [];
  @state() private _providers: CloudProvider[] = [];
  @state() private _loading = true;
  @state() private _busy = "";
  @state() private _loadError: string | null = null;
  @state() private _message: { ok: boolean; text: string } | null = null;

  // create options — the full BackupOptions surface
  @state() private _name = "";
  @state() private _scope = SCOPE.Content | SCOPE.Media;
  @state() private _compress = true;
  @state() private _encrypt = false;
  @state() private _encryptionKey = "";
  @state() private _keepLocal = true;
  @state() private _selectedProviders: string[] = [];

  // restore options
  @state() private _restoreTarget: BackupInfo | null = null;
  @state() private _restoreScope = SCOPE.Content | SCOPE.Media | SCOPE.Database;
  @state() private _overwrite = false;
  @state() private _decryptionKey = "";

  readonly #fetch = createAuthFetch(this);
  private readonly _api = "/umbraco/api/backups";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#loadAll();
  }

  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }
    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to manage backups. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }

  async #loadAll(): Promise<void> {
    this._loading = true;
    await Promise.all([this.#loadBackups(), this.#loadProviders()]);
    this._loading = false;
  }

  async #loadBackups(): Promise<void> {
    try {
      const response = await this.#fetch(`${this._api}/GetAll`);
      if (this.#responseOk(response)) this._backups = await response.json();
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
    }
  }

  async #loadProviders(): Promise<void> {
    try {
      const response = await this.#fetch(`${this._api}/GetCloudProviders`);
      if (this.#responseOk(response)) this._providers = await response.json();
    } catch {
      /* cloud providers are optional; absence is not an error */
    }
  }

  #toggleScope(bit: number, on: boolean, which: "_scope" | "_restoreScope") {
    const current = which === "_scope" ? this._scope : this._restoreScope;
    const next = on ? current | bit : current & ~bit;
    if (which === "_scope") this._scope = next;
    else this._restoreScope = next;
  }

  #toggleProvider(id: string, on: boolean) {
    this._selectedProviders = on
      ? [...this._selectedProviders, id]
      : this._selectedProviders.filter((p) => p !== id);
  }

  async #create(): Promise<void> {
    if (this._encrypt && !this._encryptionKey.trim()) {
      this._message = { ok: false, text: "Set an encryption key, or turn encryption off." };
      return;
    }
    if (this._scope === 0) {
      this._message = { ok: false, text: "Choose at least one thing to back up." };
      return;
    }

    this._busy = "create";
    this._message = null;
    try {
      const response = await this.#fetch(`${this._api}/CreateAdvanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: this._scope,
          compress: this._compress,
          encrypt: this._encrypt,
          encryptionKey: this._encryptionKey,
          cloudProviderIds: this._selectedProviders,
          keepLocal: this._keepLocal,
        }),
      });

      if (!this.#responseOk(response)) return;

      const result = (await response.json()) as BackupResult;
      const failed = (result.cloudUploads ?? []).filter((u) => !u.success);
      this._message = {
        ok: failed.length === 0,
        text:
          `Backed up ${result.contentCount} content item(s) and ${result.mediaCount} media item(s)` +
          ` to ${result.name} (${this.#size(result.sizeBytes)}).` +
          (failed.length
            ? ` Cloud upload failed for ${failed.map((f) => f.providerName).join(", ")}.`
            : ""),
      };
      this._encryptionKey = "";
      await this.#loadBackups();
    } catch {
      this._message = { ok: false, text: "The backup request failed." };
    } finally {
      this._busy = "";
    }
  }

  async #restore(): Promise<void> {
    if (!this._restoreTarget) return;

    this._busy = "restore";
    this._message = null;
    try {
      const response = await this.#fetch(
        `${this._api}/Restore?backupPath=${encodeURIComponent(this._restoreTarget.name)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scope: this._restoreScope,
            overwriteExisting: this._overwrite,
            decryptionKey: this._decryptionKey,
          }),
        },
      );

      if (!this.#responseOk(response)) return;

      const result = await response.json();
      this._message = {
        ok: result.success,
        text: result.success
          ? `Restored ${result.restoredContentCount} content item(s) and ${result.restoredMediaCount} media item(s).`
          : `Restore failed: ${(result.errors ?? []).join("; ") || "no reason given"}.`,
      };
      this._restoreTarget = null;
      this._decryptionKey = "";
    } catch {
      this._message = { ok: false, text: "The restore request failed." };
    } finally {
      this._busy = "";
    }
  }

  async #delete(name: string): Promise<void> {
    this._busy = `delete:${name}`;
    try {
      const response = await this.#fetch(`${this._api}/Delete?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (this.#responseOk(response)) {
        this._message = { ok: true, text: `Deleted ${name}.` };
        await this.#loadBackups();
      }
    } catch {
      this._message = { ok: false, text: `Could not delete ${name}.` };
    } finally {
      this._busy = "";
    }
  }

  async #testProvider(id: string): Promise<void> {
    this._busy = `test:${id}`;
    try {
      const response = await this.#fetch(
        `${this._api}/TestProvider?providerId=${encodeURIComponent(id)}`,
        { method: "POST" },
      );
      if (this.#responseOk(response)) {
        const ok = await response.json();
        this._message = {
          ok: !!ok,
          text: ok ? `${id} answered.` : `${id} did not answer. Check its credentials.`,
        };
      }
    } catch {
      this._message = { ok: false, text: `Could not reach ${id}.` };
    } finally {
      this._busy = "";
    }
  }

  #size(bytes: number): string {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  #when(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  }

  #scopeChecks(which: "_scope" | "_restoreScope") {
    const value = which === "_scope" ? this._scope : this._restoreScope;
    return html`
      <div class="stack">
        ${[
          ["Content", SCOPE.Content],
          ["Media", SCOPE.Media],
          ["Database", SCOPE.Database],
        ].map(
          ([label, bit]) => html`
            <uui-checkbox
              label=${label as string}
              ?checked=${(value & (bit as number)) !== 0}
              @change=${(e: Event) =>
                this.#toggleScope(bit as number, (e.target as HTMLInputElement).checked, which)}
              >${label}</uui-checkbox
            >
          `,
        )}
      </div>
    `;
  }

  override render() {
    return html`
      <h1>Backups</h1>
      <p class="description">
        Take a backup of content, media and the database, restore one, or send copies to a
        configured cloud provider.
      </p>

      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : nothing}
      ${this._message
        ? html`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">
            ${this._message.text}
          </div>`
        : nothing}

      <uui-box headline="Take a backup">
        <div class="grid">
          <fieldset>
            <legend>What to include</legend>
            ${this.#scopeChecks("_scope")}
          </fieldset>

          <fieldset>
            <legend>Storage</legend>
            <div class="stack">
              <uui-toggle
                label="Compress"
                ?checked=${this._compress}
                @change=${(e: Event) => (this._compress = (e.target as HTMLInputElement).checked)}
                >Compress the archive</uui-toggle
              >
              <uui-toggle
                label="Encrypt"
                ?checked=${this._encrypt}
                @change=${(e: Event) => (this._encrypt = (e.target as HTMLInputElement).checked)}
                >Encrypt the archive</uui-toggle
              >
              ${this._encrypt
                ? html`
                    <uui-input
                      type="password"
                      placeholder="Encryption key"
                      .value=${this._encryptionKey}
                      @input=${(e: Event) =>
                        (this._encryptionKey = (e.target as HTMLInputElement).value)}
                    ></uui-input>
                    <p class="hint">
                      Keep this key. Without it the archive cannot be restored — nothing
                      here can recover it for you.
                    </p>
                  `
                : nothing}
            </div>
          </fieldset>

          <fieldset>
            <legend>Cloud copies</legend>
            ${this._providers.length
              ? html`
                  <div class="stack">
                    ${this._providers.map(
                      (p) => html`
                        <div class="row">
                          <uui-checkbox
                            label=${p.id}
                            ?disabled=${!p.enabled}
                            ?checked=${this._selectedProviders.includes(p.id)}
                            @change=${(e: Event) =>
                              this.#toggleProvider(p.id, (e.target as HTMLInputElement).checked)}
                            >${p.id}
                            <span class="tag">${p.providerType}</span>
                            ${p.enabled ? nothing : html`<span class="tag">disabled</span>`}
                          </uui-checkbox>
                          <uui-button
                            compact
                            look="secondary"
                            label="Test ${p.id}"
                            ?disabled=${this._busy === `test:${p.id}`}
                            @click=${() => this.#testProvider(p.id)}
                            >${this._busy === `test:${p.id}` ? "Testing…" : "Test"}</uui-button
                          >
                        </div>
                      `,
                    )}
                    <uui-toggle
                      label="Keep local copy"
                      ?checked=${this._keepLocal}
                      @change=${(e: Event) =>
                        (this._keepLocal = (e.target as HTMLInputElement).checked)}
                      >Keep a local copy as well</uui-toggle
                    >
                  </div>
                `
              : html`<p class="hint">
                  No cloud providers are configured, so the backup stays on this server.
                </p>`}
          </fieldset>
        </div>

        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Take backup"
            ?disabled=${this._busy === "create"}
            @click=${this.#create}
            >${this._busy === "create" ? "Backing up…" : "Take backup"}</uui-button
          >
        </div>
      </uui-box>

      <uui-box headline="Existing backups">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._backups.length === 0
            ? html`<p class="empty">No backups yet. Take one above.</p>`
            : html`
                <table>
                  <thead>
                    <tr>
                      <th>Name</th><th>Taken</th><th>Size</th><th></th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this._backups.map(
                      (b) => html`
                        <tr>
                          <td>${b.name}</td>
                          <td class="num">${this.#when(b.createdAt)}</td>
                          <td class="num">${this.#size(b.sizeBytes)}</td>
                          <td>
                            ${b.isCompressed ? html`<span class="tag">zipped</span>` : nothing}
                            ${b.isEncrypted ? html`<span class="tag">encrypted</span>` : nothing}
                          </td>
                          <td>
                            <div class="row">
                              <uui-button
                                compact
                                look="secondary"
                                label="Restore ${b.name}"
                                @click=${() => {
                                  this._restoreTarget = b;
                                  this._message = null;
                                }}
                                >Restore…</uui-button
                              >
                              <uui-button
                                compact
                                look="secondary"
                                color="danger"
                                label="Delete ${b.name}"
                                ?disabled=${this._busy === `delete:${b.name}`}
                                @click=${() => this.#delete(b.name)}
                                >Delete</uui-button
                              >
                            </div>
                          </td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>
              `}
      </uui-box>

      ${this._restoreTarget
        ? html`
            <uui-box headline="Restore ${this._restoreTarget.name}">
              <div class="grid">
                <fieldset>
                  <legend>What to restore</legend>
                  ${this.#scopeChecks("_restoreScope")}
                </fieldset>
                <fieldset>
                  <legend>Options</legend>
                  <div class="stack">
                    <uui-toggle
                      label="Overwrite existing"
                      ?checked=${this._overwrite}
                      @change=${(e: Event) =>
                        (this._overwrite = (e.target as HTMLInputElement).checked)}
                      >Overwrite items that already exist</uui-toggle
                    >
                    ${this._restoreTarget.isEncrypted
                      ? html`<uui-input
                          type="password"
                          placeholder="Decryption key"
                          .value=${this._decryptionKey}
                          @input=${(e: Event) =>
                            (this._decryptionKey = (e.target as HTMLInputElement).value)}
                        ></uui-input>`
                      : nothing}
                  </div>
                </fieldset>
              </div>

              <div class="danger-zone">
                <p class="hint">
                  Restoring writes over this site's content.
                  ${this._overwrite
                    ? "Overwrite is on, so existing items with the same identity will be replaced."
                    : "Overwrite is off, so existing items are left alone."}
                </p>
                <div class="actions">
                  <uui-button
                    look="primary"
                    color="danger"
                    label="Restore now"
                    ?disabled=${this._busy === "restore"}
                    @click=${this.#restore}
                    >${this._busy === "restore" ? "Restoring…" : "Restore now"}</uui-button
                  >
                  <uui-button
                    look="secondary"
                    label="Cancel"
                    @click=${() => (this._restoreTarget = null)}
                    >Cancel</uui-button
                  >
                </div>
              </div>
            </uui-box>
          `
        : nothing}
    `;
  }
}

export default BackupsBackupsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "backups-dashboard": BackupsBackupsDashboardElement;
  }
}
