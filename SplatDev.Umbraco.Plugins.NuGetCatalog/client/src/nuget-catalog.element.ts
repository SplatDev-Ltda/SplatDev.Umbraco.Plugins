import {
  LitElement,
  html,
  css,
  nothing,
  customElement,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { CatalogApi, type CatalogResponse, type PackageView } from "./api";

type Tab = "packages" | "manage";

/** How long ago, in words. */
function ago(iso?: string | null): string {
  if (!iso) return "never";
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const nf = new Intl.NumberFormat();

/**
 * Lists the packages a publisher has on nuget.org, with downloads, latest version and a
 * short summary. Reads nuget.org only — nothing here publishes or unlists.
 */
@customElement("nuget-catalog")
export class NuGetCatalogElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
      --nc-hairline: color-mix(in srgb, var(--uui-color-border) 60%, transparent);
    }

    .head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--uui-size-space-4, 12px);
      flex-wrap: wrap;
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    h1 {
      margin: 0;
      font-size: 1.25rem;
      line-height: 1.2;
    }

    .sub {
      margin: 4px 0 0;
      color: var(--uui-color-text-alt);
      font-size: 0.875rem;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-3, 8px);
      flex-wrap: wrap;
    }

    .tabs {
      display: flex;
      gap: var(--uui-size-space-4, 12px);
      border-bottom: 1px solid var(--nc-hairline);
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .tab {
      appearance: none;
      background: none;
      border: 0;
      border-bottom: 2px solid transparent;
      color: var(--uui-color-text-alt);
      font: inherit;
      font-weight: 600;
      padding: 8px 2px;
      cursor: pointer;
    }

    .tab[aria-selected="true"] {
      color: var(--uui-color-text);
      border-bottom-color: var(--uui-color-selected, #3544b1);
    }

    .tab:focus-visible {
      outline: 2px solid var(--uui-color-focus);
      outline-offset: 2px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      min-width: 640px;
    }

    th,
    td {
      text-align: left;
      padding: var(--uui-size-space-3, 8px);
      border-bottom: 1px solid var(--nc-hairline);
      vertical-align: middle;
    }

    th {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: var(--uui-color-text-alt);
      font-weight: 600;
      white-space: nowrap;
    }

    td.num,
    th.num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .pkg {
      font-weight: 600;
      text-decoration: none;
      color: inherit;
      overflow-wrap: anywhere;
    }

    .pkg:hover {
      text-decoration: underline;
    }

    .summary {
      color: var(--uui-color-text-alt);
      overflow-wrap: anywhere;
    }

    .ver {
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .pill {
      display: inline-block;
      padding: 1px 7px;
      border-radius: 9999px;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      white-space: nowrap;
      margin-left: 6px;
    }

    .pill.added {
      background: var(--uui-color-surface-alt);
      color: var(--uui-color-text-alt);
    }

    .pill.warn {
      background: var(--uui-color-warning);
      color: var(--uui-color-warning-contrast, #000);
    }

    .pill.danger {
      background: var(--uui-color-danger);
      color: var(--uui-color-selected-contrast, #fff);
    }

    tr.hidden td {
      opacity: 0.55;
    }

    .empty,
    .warn-banner {
      padding: var(--uui-size-space-5, 16px);
      border-radius: var(--uui-border-radius, 3px);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .empty {
      text-align: center;
      color: var(--uui-color-text-alt);
    }

    .warn-banner {
      display: flex;
      gap: var(--uui-size-space-3, 8px);
      background: color-mix(in srgb, var(--uui-color-warning) 18%, var(--uui-color-surface));
      border-left: 3px solid var(--uui-color-warning);
      margin-bottom: var(--uui-size-space-4, 12px);
    }

    .scroll-x {
      overflow-x: auto;
    }

    .field {
      display: flex;
      gap: var(--uui-size-space-3, 8px);
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: var(--uui-size-space-4, 12px);
    }

    .field uui-input {
      flex: 1;
      min-width: 260px;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--uui-size-space-2, 6px);
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 6px 3px 10px;
      border: 1px solid var(--nc-hairline);
      border-radius: 9999px;
      font-size: 0.8rem;
    }

    uui-box {
      margin-bottom: var(--uui-size-space-5, 16px);
    }

    .error {
      color: var(--uui-color-danger);
      font-size: 0.875rem;
      margin-bottom: var(--uui-size-space-4, 12px);
    }
  `;

  #api = new CatalogApi(this);

  @state() private _data?: CatalogResponse;
  @state() private _tab: Tab = "packages";
  @state() private _loading = true;
  @state() private _busy = false;
  @state() private _error = "";
  @state() private _showHidden = false;
  @state() private _newPackage = "";
  @state() private _newOwner = "";

  override connectedCallback() {
    super.connectedCallback();
    void this.#load();
  }

  async #load(refresh = false) {
    if (refresh) this._busy = true;
    else this._loading = true;
    this._error = "";
    try {
      this._data = refresh ? await this.#api.refresh() : await this.#api.getPackages();
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
      this._busy = false;
    }
  }

  /** Runs a mutation then reloads, so the table always reflects what was stored. */
  async #mutate(action: () => Promise<unknown>) {
    this._busy = true;
    this._error = "";
    try {
      await action();
      this._data = await this.#api.getPackages();
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._busy = false;
    }
  }

  #renderRow(p: PackageView) {
    return html`
      <tr class=${p.isHidden ? "hidden" : ""}>
        <td>
          <a class="pkg" href=${p.nuGetUrl} target="_blank" rel="noopener noreferrer">${p.id}</a>
          ${p.isExplicit ? html`<span class="pill added">added</span>` : nothing}
          ${p.isDeprecated ? html`<span class="pill warn">deprecated</span>` : nothing}
          ${p.vulnerabilityCount > 0
            ? html`<span class="pill danger">${p.vulnerabilityCount} vuln</span>`
            : nothing}
        </td>
        <td class="ver">${p.version ?? "—"}</td>
        <td class="num">${nf.format(p.totalDownloads)}</td>
        <td class="summary" title=${p.fullSummary ?? ""}>${p.summary}</td>
        <td class="num">
          <uui-button
            look="secondary"
            compact
            label=${p.isHidden ? `Show ${p.id}` : `Hide ${p.id}`}
            ?disabled=${this._busy}
            @click=${() =>
              void this.#mutate(() =>
                p.isHidden ? this.#api.unhide(p.id) : this.#api.hide(p.id),
              )}
          >${p.isHidden ? "Show" : "Hide"}</uui-button>
        </td>
      </tr>
    `;
  }

  #renderTable(rows: PackageView[]) {
    return html`
      <div class="scroll-x">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Latest</th>
              <th class="num">Downloads</th>
              <th>Summary</th>
              <th class="num"></th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((p) => this.#renderRow(p))}
          </tbody>
        </table>
      </div>
    `;
  }

  #renderPackages() {
    const data = this._data;
    if (!data) return nothing;

    const hiddenCount = data.hidden.length;

    if (data.packages.length === 0 && hiddenCount === 0) {
      return html`
        <div class="empty">
          Nothing to show yet. Add a NuGet owner account or a specific package on the
          <strong>Manage</strong> tab.
        </div>
      `;
    }

    return html`
      ${this.#renderTable(data.packages)}
      ${hiddenCount > 0
        ? html`
            <div class="field" style="margin-top:16px">
              <uui-button
                look="secondary"
                label="Toggle hidden packages"
                @click=${() => { this._showHidden = !this._showHidden; }}
              >${this._showHidden ? "Hide" : "Show"} hidden (${hiddenCount})</uui-button>
            </div>
            ${this._showHidden ? this.#renderTable(data.hidden) : nothing}
          `
        : nothing}
    `;
  }

  #renderManage() {
    const data = this._data;
    if (!data) return nothing;

    return html`
      <uui-box headline="Owner accounts">
        <p class="sub" style="margin-top:0">
          Every package published under these nuget.org accounts is listed.
        </p>
        <div class="field">
          <uui-input
            label="Owner account"
            placeholder="splatdev"
            .value=${this._newOwner}
            @input=${(e: Event) => { this._newOwner = (e.target as HTMLInputElement).value; }}
          ></uui-input>
          <uui-button
            look="primary"
            label="Add owner"
            ?disabled=${this._busy || !this._newOwner.trim()}
            @click=${() =>
              void this.#mutate(async () => {
                await this.#api.addOwner(this._newOwner.trim());
                this._newOwner = "";
              })}
          >Add</uui-button>
        </div>
        <div class="chips">
          ${data.owners.length === 0
            ? html`<span class="sub">None yet.</span>`
            : data.owners.map(
                (o) => html`
                  <span class="chip">
                    ${o}
                    <uui-button
                      look="secondary"
                      compact
                      label="Remove ${o}"
                      ?disabled=${this._busy}
                      @click=${() => void this.#mutate(() => this.#api.removeOwner(o))}
                    >×</uui-button>
                  </span>
                `,
              )}
        </div>
      </uui-box>

      <uui-box headline="Specific packages">
        <p class="sub" style="margin-top:0">
          Paste a nuget.org URL or type a package id. Useful for packages outside your
          owner accounts.
        </p>
        <div class="field">
          <uui-input
            label="Package URL or id"
            placeholder="https://www.nuget.org/packages/Umbraco.Cms"
            .value=${this._newPackage}
            @input=${(e: Event) => { this._newPackage = (e.target as HTMLInputElement).value; }}
          ></uui-input>
          <uui-button
            look="primary"
            label="Add package"
            ?disabled=${this._busy || !this._newPackage.trim()}
            @click=${() =>
              void this.#mutate(async () => {
                await this.#api.addPackage(this._newPackage.trim());
                this._newPackage = "";
              })}
          >Add</uui-button>
        </div>
        <div class="chips">
          ${data.added.length === 0
            ? html`<span class="sub">None yet.</span>`
            : data.added.map(
                (id) => html`
                  <span class="chip">
                    ${id}
                    <uui-button
                      look="secondary"
                      compact
                      label="Remove ${id}"
                      ?disabled=${this._busy}
                      @click=${() => void this.#mutate(() => this.#api.removePackage(id))}
                    >×</uui-button>
                  </span>
                `,
              )}
        </div>
      </uui-box>

      <uui-box headline="Hidden packages">
        <p class="sub" style="margin-top:0">
          Hidden packages stay out of the list but keep refreshing, so restoring one never
          shows stale numbers.
        </p>
        ${data.hidden.length === 0
          ? html`<span class="sub">Nothing hidden.</span>`
          : html`<div class="chips">
              ${data.hidden.map(
                (p) => html`
                  <span class="chip">
                    ${p.id}
                    <uui-button
                      look="secondary"
                      compact
                      label="Restore ${p.id}"
                      ?disabled=${this._busy}
                      @click=${() => void this.#mutate(() => this.#api.unhide(p.id))}
                    >restore</uui-button>
                  </span>
                `,
              )}
            </div>`}
      </uui-box>
    `;
  }

  override render() {
    const data = this._data;

    return html`
      <div class="head">
        <div>
          <h1>NuGet Catalog</h1>
          <p class="sub">
            Packages published to nuget.org, with downloads and the latest version.
          </p>
        </div>
        <div class="actions">
          <span class="sub">refreshed ${ago(data?.refreshedUtc)}</span>
          <uui-button
            look="secondary"
            label="Refresh from nuget.org"
            ?disabled=${this._busy || this._loading}
            @click=${() => void this.#load(true)}
          >${this._busy ? "Refreshing…" : "Refresh"}</uui-button>
        </div>
      </div>

      <div class="tabs" role="tablist">
        <button
          class="tab"
          role="tab"
          aria-selected=${this._tab === "packages"}
          @click=${() => { this._tab = "packages"; }}
        >Packages${data ? ` (${data.packages.length})` : ""}</button>
        <button
          class="tab"
          role="tab"
          aria-selected=${this._tab === "manage"}
          @click=${() => { this._tab = "manage"; }}
        >Manage</button>
      </div>

      ${data?.warning ? html`<div class="warn-banner"><span>${data.warning}</span></div>` : nothing}
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}

      ${this._loading
        ? html`<uui-loader></uui-loader>`
        : this._tab === "packages"
          ? this.#renderPackages()
          : this.#renderManage()}
    `;
  }
}

export default NuGetCatalogElement;

declare global {
  interface HTMLElementTagNameMap {
    "nuget-catalog": NuGetCatalogElement;
  }
}
