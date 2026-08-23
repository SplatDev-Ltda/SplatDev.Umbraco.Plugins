import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";

import { createAuthFetch } from "./auth-fetch";

type PropertyEditorConfig = {
  getValueByAlias: <T = unknown>(alias: string) => T | undefined;
};

interface MemberGroup {
  key?: string;
  id?: number;
  name: string;
}

interface Restriction {
  restricted: boolean;
  memberGroups?: string[];
  loginPage?: string | null;
  errorPage?: string | null;
}

/**
 * Restrict or unrestrict the page you are editing, from the page itself.
 *
 * The plugin shipped a dashboard listing restricted nodes and nothing on the node, so
 * protecting a page meant leaving it, finding it in a list somewhere else, and coming
 * back. This puts the switch where the decision is made.
 *
 * It writes real Umbraco public access through the plugin's existing endpoints — the
 * same IPublicAccessService entries the dashboard creates — rather than a flag of its
 * own that only this plugin understands. A page restricted here is restricted to
 * Umbraco, to the Delivery API, and to anything else that asks.
 */
@customElement("restricted-property-editor")
export class RestrictedPropertyEditorElement extends UmbElementMixin(LitElement) {
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
    .state.on { background: #fee2e2; color: #991b1b; }
    .state.off { background: #d1fae5; color: #065f46; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .hint { margin: 8px 0 0; font-size: 0.83rem; color: var(--uui-color-text-alt, #6b7280); }
    .detail { margin: 8px 0 0; font-size: 0.85rem; }
    code {
      font-family: var(--uui-font-monospace, monospace);
      background: var(--uui-color-surface-alt, #f3f4f6);
      padding: 1px 5px; border-radius: 3px;
    }
    .msg {
      margin: 10px 0 0; padding: 9px 12px; border-radius: 3px; font-size: 0.86rem;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
    uui-select { min-width: 220px; }
  `;

  @property({ type: String })
  value = "";

  @property({ type: Boolean })
  readonly = false;

  @state() private _node: string | null = null;
  @state() private _state: Restriction | null = null;
  @state() private _groups: MemberGroup[] = [];
  @state() private _chosenGroup = "";
  @state() private _busy = false;
  @state() private _msg: { ok: boolean; text: string } | null = null;

  @state() private _configGroups: string[] = [];
  @state() private _loginPage = "";
  @state() private _errorPage = "";

  private readonly _api = "/umbraco/api/restricted";

  @property({ attribute: false })
  set config(config: PropertyEditorConfig | undefined) {
    if (!config) return;
    const groups = config.getValueByAlias<string>("memberGroups") ?? "";
    this._configGroups = groups.split(",").map((g) => g.trim()).filter(Boolean);
    this._loginPage = config.getValueByAlias<string>("loginPage") ?? "";
    this._errorPage = config.getValueByAlias<string>("errorPage") ?? "";
  }

  constructor() {
    super();
    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (context) => {
      // Prefer whatever the dataset knows it is. Not every dataset exposes a unique, so
      // this is asked for rather than assumed.
      const unique = (context as unknown as { getUnique?: () => string | undefined })?.getUnique?.();
      if (unique) this._node = unique;
      void this.#load();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  /**
   * Falls back to the key in the workspace URL.
   *
   * A property editor is only ever rendered inside a document workspace, whose route
   * carries the document key. Reading it is less elegant than a context, but it is
   * stable and it is checked rather than trusted — anything that is not a GUID is
   * ignored.
   */
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
      const [restriction, groups] = await Promise.all([
        this.#fetch(`${this._api}/GetRestriction?node=${encodeURIComponent(this._node)}`),
        this.#fetch(`${this._api}/GetMemberGroups`),
      ]);
      if (restriction.ok) this._state = await restriction.json();
      if (groups.ok) this._groups = await groups.json();
      if (!this._chosenGroup) {
        this._chosenGroup =
          this._state?.memberGroups?.[0] ?? this._configGroups[0] ?? this._groups[0]?.name ?? "";
      }
    } catch {
      this._msg = { ok: false, text: "Could not read this page's access settings." };
    }
  }

  /** Records the state in the property too, so it is visible to templates and the API. */
  #record(restricted: boolean): void {
    const next = restricted ? "restricted" : "";
    if (this.value === next) return;
    this.value = next;
    this.dispatchEvent(new UmbChangeEvent());
  }

  async #restrict(): Promise<void> {
    if (this.readonly || !this._node) return;

    const groups = this._chosenGroup
      ? [this._chosenGroup]
      : this._configGroups.length
        ? this._configGroups
        : [];

    if (groups.length === 0) {
      this._msg = { ok: false, text: "Choose a member group first — restricting to nobody would lock everyone out." };
      return;
    }

    this._busy = true;
    this._msg = null;
    try {
      const response = await this.#fetch(`${this._api}/RestrictNode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node: this._node,
          memberGroups: groups,
          loginPage: this._loginPage || null,
          errorPage: this._errorPage || null,
        }),
      });
      if (response.ok) {
        this._msg = { ok: true, text: `Restricted to ${groups.join(", ")}.` };
        this.#record(true);
        await this.#load();
      } else {
        this._msg = { ok: false, text: "Could not restrict this page." };
      }
    } catch {
      this._msg = { ok: false, text: "Could not restrict this page." };
    } finally {
      this._busy = false;
    }
  }

  async #unrestrict(): Promise<void> {
    if (this.readonly || !this._node) return;

    // Removing protection is the direction that exposes something, so it asks.
    if (!window.confirm("Remove the restriction?\n\nThis page becomes visible to everyone, including anonymous visitors.")) {
      return;
    }

    this._busy = true;
    this._msg = null;
    try {
      const response = await this.#fetch(
        `${this._api}/UnrestrictNode?node=${encodeURIComponent(this._node)}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        this._msg = { ok: true, text: "Restriction removed — this page is public again." };
        this.#record(false);
        await this.#load();
      } else {
        this._msg = { ok: false, text: "Could not remove the restriction." };
      }
    } catch {
      this._msg = { ok: false, text: "Could not remove the restriction." };
    } finally {
      this._busy = false;
    }
  }

  override render() {
    if (!this._node) {
      return html`<p class="hint">
        This page has not been saved yet, so there is nothing to restrict. Save it first.
      </p>`;
    }

    const restricted = this._state?.restricted === true;

    return html`
      <div class="row">
        <span class="state ${restricted ? "on" : "off"}">
          <span class="dot"></span>${restricted ? "Restricted" : "Public"}
        </span>

        ${restricted
          ? html`<uui-button
              look="secondary"
              color="danger"
              label="Remove the restriction from this page"
              ?disabled=${this.readonly || this._busy}
              @click=${this.#unrestrict}
              >${this._busy ? "Working…" : "Unrestrict"}</uui-button
            >`
          : html`
              <uui-select
                label="Member group"
                .value=${this._chosenGroup}
                @change=${(e: Event) => (this._chosenGroup = (e.target as HTMLSelectElement).value)}
                .options=${this._groups.map((g) => ({
                  name: g.name,
                  value: g.name,
                  selected: g.name === this._chosenGroup,
                }))}
              ></uui-select>
              <uui-button
                look="primary"
                label="Restrict this page to a member group"
                ?disabled=${this.readonly || this._busy || this._groups.length === 0}
                @click=${this.#restrict}
                >${this._busy ? "Working…" : "Restrict"}</uui-button
              >
            `}
      </div>

      ${restricted && this._state?.memberGroups?.length
        ? html`<p class="detail">
            Visible to ${this._state.memberGroups.map((g, i) => html`${i ? ", " : ""}<code>${g}</code>`)}.
          </p>`
        : nothing}

      ${this._groups.length === 0
        ? html`<p class="hint">
            There are no member groups yet. Create one before restricting anything —
            restricting to nobody would lock everyone out.
          </p>`
        : nothing}

      <p class="hint">
        This writes Umbraco's own public access, the same as the Restricted dashboard, so
        the page is protected everywhere — not only where this plugin renders.
      </p>

      ${this._msg
        ? html`<div class="msg ${this._msg.ok ? "ok" : ""}" role="status">${this._msg.text}</div>`
        : nothing}
    `;
  }
}

export default RestrictedPropertyEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "restricted-property-editor": RestrictedPropertyEditorElement;
  }
}
