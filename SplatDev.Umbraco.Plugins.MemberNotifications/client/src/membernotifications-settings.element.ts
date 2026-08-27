import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { createAuthFetch } from "./auth-fetch";

const API = "/umbraco/api/membernotifications";

type EventDef = {
  key: string; label: string; category: string; description: string;
  supportsSelf: boolean; tokens: string[];
};
type Rule = { enabled: boolean; notifySelf: boolean; notifyMemberGroups: string[]; title: string; body: string };
type Settings = { enabled: boolean; retentionDays: number; rules: Record<string, Rule>; events: EventDef[] };

@customElement("membernotifications-settings")
export class MemberNotificationsSettingsElement extends UmbElementMixin(LitElement) {
  #fetch = createAuthFetch(this);

  @state() private _loading = true;
  @state() private _error: string | null = null;
  @state() private _saved = false;
  @state() private _settings?: Settings;
  @state() private _groups: string[] = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this.#load();
  }

  async #load(): Promise<void> {
    this._loading = true;
    this._error = null;
    try {
      const [settings, groups] = await Promise.all([
        this.#json<Settings>(`${API}/Settings`),
        this.#json<string[]>(`${API}/MemberGroups`),
      ]);
      this._settings = settings;
      this._groups = groups;
    } catch (err) {
      // Surfaced rather than swallowed: an empty form and a refused request look identical
      // otherwise, and the difference matters when the form is what governs security alerts.
      this._error = err instanceof Error ? err.message : String(err);
    } finally {
      this._loading = false;
    }
  }

  async #json<T>(url: string): Promise<T> {
    const res = await this.#fetch(url);
    if (!res.ok) throw new Error(`${url.replace(API, "")} answered ${res.status}`);
    return (await res.json()) as T;
  }

  async #save(): Promise<void> {
    if (!this._settings) return;
    this._saved = false;
    try {
      const { enabled, retentionDays, rules } = this._settings;
      const res = await this.#fetch(`${API}/Save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, retentionDays, rules }),
      });
      if (!res.ok) throw new Error(`Save answered ${res.status}`);
      this._saved = true;
      setTimeout(() => (this._saved = false), 4000);
    } catch (err) {
      this._error = err instanceof Error ? err.message : String(err);
    }
  }

  #rule(key: string): Rule {
    const s = this._settings!;
    s.rules[key] ??= { enabled: false, notifySelf: false, notifyMemberGroups: [], title: "", body: "" };
    return s.rules[key];
  }

  #patch(key: string, change: Partial<Rule>) {
    Object.assign(this.#rule(key), change);
    this.requestUpdate();
  }

  override render() {
    if (this._loading) return html`<uui-loader></uui-loader>`;
    const s = this._settings;

    return html`
      <umb-body-layout headline="Member notifications">
        ${this._error ? html`
          <div class="error">
            <strong>Could not load these settings.</strong>
            <div>${this._error}</div>
          </div>` : nothing}

        ${!s ? nothing : html`
          <uui-box headline="General">
            <div class="row">
              <uui-toggle
                label="Raise notifications"
                ?checked=${s.enabled}
                @change=${(e: Event) => { s.enabled = (e.target as HTMLInputElement).checked; this.requestUpdate(); }}></uui-toggle>
              <div class="hint">Off means no event writes anything, whatever the rules below say.</div>
            </div>
            <div class="row">
              <uui-label for="retention">Keep notifications for</uui-label>
              <uui-input
                id="retention" type="number" min="0" max="3650"
                .value=${String(s.retentionDays)}
                @change=${(e: Event) => { s.retentionDays = Number((e.target as HTMLInputElement).value); this.requestUpdate(); }}></uui-input>
              <div class="hint">days — 0 keeps them forever. Failed sign-ins accumulate quickly on a public site.</div>
            </div>
          </uui-box>

          ${this.#category(s, "Member")}
          ${this.#category(s, "Backoffice user")}

          <div class="actions">
            <uui-button look="primary" label="Save" @click=${() => this.#save()}></uui-button>
            ${this._saved ? html`<span class="ok">Saved.</span>` : nothing}
          </div>`}
      </umb-body-layout>`;
  }

  #category(s: Settings, category: string) {
    const events = s.events.filter((e) => e.category === category);
    if (!events.length) return nothing;

    return html`
      <uui-box headline="${category} events">
        ${category === "Backoffice user"
          ? html`<p class="hint boxed">
              These have no member behind them, so they can only be sent to a member group —
              a security team, typically. "Notify the person it happened to" is unavailable
              for this reason rather than merely switched off.
            </p>`
          : nothing}

        ${events.map((e) => this.#event(e))}
      </uui-box>`;
  }

  #event(e: EventDef) {
    const rule = this.#rule(e.key);
    return html`
      <div class="event ${rule.enabled ? "on" : ""}">
        <div class="head">
          <uui-toggle
            label="${e.label}"
            ?checked=${rule.enabled}
            @change=${(ev: Event) => this.#patch(e.key, { enabled: (ev.target as HTMLInputElement).checked })}></uui-toggle>
          <span class="hint">${e.description}</span>
        </div>

        ${!rule.enabled ? nothing : html`
          <div class="body">
            <label class="who">
              <input
                type="checkbox"
                .checked=${rule.notifySelf}
                ?disabled=${!e.supportsSelf}
                @change=${(ev: Event) => this.#patch(e.key, { notifySelf: (ev.target as HTMLInputElement).checked })} />
              Notify the person it happened to
              ${!e.supportsSelf ? html`<span class="hint">— not available for backoffice events</span>` : nothing}
            </label>

            <div class="groups">
              <div class="hint">Also notify members of:</div>
              ${this._groups.length === 0
                ? html`<span class="hint">This site has no member groups.</span>`
                : this._groups.map((g) => html`
                    <label class="chip">
                      <input
                        type="checkbox"
                        .checked=${rule.notifyMemberGroups.includes(g)}
                        @change=${(ev: Event) => {
                          const on = (ev.target as HTMLInputElement).checked;
                          const next = on
                            ? [...rule.notifyMemberGroups, g]
                            : rule.notifyMemberGroups.filter((x) => x !== g);
                          this.#patch(e.key, { notifyMemberGroups: next });
                        }} />
                      ${g}
                    </label>`)}
            </div>

            <uui-input
              label="Title"
              .value=${rule.title}
              @change=${(ev: Event) => this.#patch(e.key, { title: (ev.target as HTMLInputElement).value })}></uui-input>
            <uui-textarea
              label="Body"
              .value=${rule.body}
              @change=${(ev: Event) => this.#patch(e.key, { body: (ev.target as HTMLTextAreaElement).value })}></uui-textarea>
            <div class="hint">Tokens: ${e.tokens.map((t) => html`<code>${t}</code> `)}</div>
          </div>`}
      </div>`;
  }

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    uui-box { margin-bottom: 16px; }
    .row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
    .hint { color: var(--uui-color-text-alt); font-size: 12px; }
    .hint.boxed { border-left: 3px solid var(--uui-color-border); padding-left: 10px; margin: 0 0 12px; }
    .event { border-top: 1px solid var(--uui-color-border); padding: 12px 0; }
    .event:first-of-type { border-top: none; }
    .event .head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
    .event .body { margin: 10px 0 0 8px; display: grid; gap: 10px; max-width: 720px; }
    .who { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .groups { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .chip { display: inline-flex; align-items: center; gap: 5px; font-size: 13px;
            border: 1px solid var(--uui-color-border); border-radius: 12px; padding: 2px 10px; }
    .actions { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
    .ok { color: var(--uui-color-positive); font-size: 13px; }
    .error { border-left: 4px solid var(--uui-color-danger); background: var(--uui-color-surface-alt);
             padding: 12px 16px; margin-bottom: 16px; }
    code { font-size: 12px; }
  `;
}

export default MemberNotificationsSettingsElement;

declare global {
  interface HTMLElementTagNameMap { "membernotifications-settings": MemberNotificationsSettingsElement }
}
