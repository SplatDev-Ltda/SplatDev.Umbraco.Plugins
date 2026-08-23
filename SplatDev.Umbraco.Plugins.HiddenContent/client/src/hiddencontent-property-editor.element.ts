import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";

import { createAuthFetch } from "./auth-fetch";

/**
 * Show or hide this page in navigation, from the page itself.
 *
 * The plugin shipped a dashboard listing hidden nodes, so hiding a page meant leaving
 * it, finding it in a list, and coming back. The retired HideContent package was
 * precisely "a visual representation (hidden/visible) for the umbracoNaviHide property",
 * which is what this restores.
 *
 * It calls the plugin's own endpoints rather than writing umbracoNaviHide directly, so
 * whatever the plugin does around hiding — descendants, caching — happens here too.
 */
@customElement("hiddencontent-property-editor")
export class HiddenContentPropertyEditorElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; }
    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .state {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 3px 10px; border-radius: 9999px;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .state.hidden { background: #fef3c7; color: #92400e; }
    .state.visible { background: #d1fae5; color: #065f46; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .hint { margin: 8px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .msg {
      margin: 9px 0 0; padding: 8px 11px; border-radius: 3px; font-size: 0.85rem;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
  `;

  @property({ type: String })
  value = "";

  @property({ type: Boolean })
  readonly = false;

  @state() private _node: string | null = null;
  @state() private _hidden: boolean | null = null;
  @state() private _busy = false;
  @state() private _msg: { ok: boolean; text: string } | null = null;

  private readonly _api = "/umbraco/api/hiddencontent";

  constructor() {
    super();
    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (context) => {
      const unique = (context as unknown as { getUnique?: () => string | undefined })?.getUnique?.();
      if (unique) this._node = unique;
      void this.#load();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  /** The workspace route carries the document key when the dataset does not offer one. */
  #nodeFromUrl(): string | null {
    const m = window.location.pathname.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
    return m ? m[0] : null;
  }

  async #load(): Promise<void> {
    this._node ??= this.#nodeFromUrl();
    if (!this._node) return;
    try {
      const response = await this.#fetch(`${this._api}/IsHidden?node=${encodeURIComponent(this._node)}`);
      if (response.ok) {
        const data = await response.json();
        this._hidden = typeof data === "boolean" ? data : data?.hidden ?? data?.isHidden ?? null;
      }
    } catch {
      this._msg = { ok: false, text: "Could not read this page's visibility." };
    }
  }

  #record(hidden: boolean): void {
    const next = hidden ? "hidden" : "";
    if (this.value === next) return;
    this.value = next;
    this.dispatchEvent(new UmbChangeEvent());
  }

  async #set(hide: boolean): Promise<void> {
    if (this.readonly || !this._node) return;
    this._busy = true;
    this._msg = null;
    try {
      const response = await this.#fetch(`${this._api}/${hide ? "Hide" : "Show"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: [this._node] }),
      });
      if (response.ok) {
        this._hidden = hide;
        this.#record(hide);
        this._msg = { ok: true, text: hide ? "Hidden from navigation." : "Showing in navigation again." };
      } else {
        this._msg = { ok: false, text: "That change did not take." };
      }
    } catch {
      this._msg = { ok: false, text: "That change did not take." };
    } finally {
      this._busy = false;
    }
  }

  override render() {
    if (!this._node) {
      return html`<p class="hint">This page has not been saved yet, so there is nothing to hide.</p>`;
    }

    const hidden = this._hidden === true;

    return html`
      <div class="row">
        <span class="state ${hidden ? "hidden" : "visible"}">
          <span class="dot"></span>${hidden ? "Hidden" : "Visible"}
        </span>
        <uui-button
          look="secondary"
          label=${hidden ? "Show this page in navigation" : "Hide this page from navigation"}
          ?disabled=${this.readonly || this._busy || this._hidden === null}
          @click=${() => this.#set(!hidden)}
          >${this._busy ? "Working…" : hidden ? "Show" : "Hide"}</uui-button
        >
      </div>

      <p class="hint">
        Hiding removes the page from navigation. It stays published and reachable by its
        URL — this is not access control.
      </p>

      ${this._msg
        ? html`<div class="msg ${this._msg.ok ? "ok" : ""}" role="status">${this._msg.text}</div>`
        : nothing}
    `;
  }
}

export default HiddenContentPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "hiddencontent-property-editor": HiddenContentPropertyEditorElement;
  }
}
