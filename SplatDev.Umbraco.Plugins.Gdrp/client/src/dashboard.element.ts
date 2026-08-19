import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

interface ConsentSummary {
  sessions: number;
  all: number;
  essential: number;
  none: number;
  recordsHeld: number;
  oldestRecordUtc: string | null;
  pendingRequests: number;
}

interface ConsentRecord {
  id: number;
  sessionId: string;
  consentType: string;
  consentDate: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface DataRequest {
  id: number;
  email: string;
  requestType: string;
  status: string;
  requestedAt: string;
  completedAt: string | null;
}

/**
 * Consent and data-subject requests.
 *
 * The previous dashboard was the estate's shared placeholder and called nothing. What it
 * hid was a compliance problem rather than a cosmetic one: consent was stored one row per
 * session and overwritten on every change, so a visitor who accepted and later withdrew
 * left a single record saying "none". Demonstrating that consent had ever been given —
 * which is the obligation, not a nicety — was impossible.
 */
@customElement("gdrp-dashboard")
export class GdrpDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 24px; max-width: 64ch; }
    .stats { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
    .stat { border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 12px 14px; }
    .stat .n { font-size: 1.6rem; font-weight: 600; line-height: 1.1; }
    .stat .l { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-weight: 600; font-size: 0.8125rem; }
    .field input { padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
                   border-radius: 4px; font: inherit; min-width: 220px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.success { background: #d1fae5; color: #065f46; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .hint { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .mono { font-family: var(--uui-font-monospace, monospace); font-size: 0.8125rem; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 12px 0; }
    uui-table { width: 100%; }
  `;

  @state() private _summary: ConsentSummary | null = null;
  @state() private _requests: DataRequest[] = [];
  @state() private _statusFilter = "pending";
  @state() private _lookup = "";
  @state() private _history: ConsentRecord[] | null = null;
  @state() private _retentionDays = 365;
  @state() private _loading = true;
  @state() private _busy = false;
  @state() private _msg: { ok: boolean; text: string } | null = null;

  private readonly _api = "/umbraco/api/gdrp";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const [s, r] = await Promise.all([
        fetch(`${this._api}/GetSummary`, { credentials: "same-origin" }),
        fetch(`${this._api}/GetRequests?status=${encodeURIComponent(this._statusFilter)}`,
              { credentials: "same-origin" }),
      ]);
      if (s.ok) this._summary = await s.json();
      if (r.ok) this._requests = await r.json();
    } finally {
      this._loading = false;
    }
  }

  async #lookupSession(): Promise<void> {
    if (!this._lookup.trim()) return;
    this._busy = true;
    this._msg = null;
    try {
      const r = await fetch(
        `${this._api}/GetConsentHistory?sessionId=${encodeURIComponent(this._lookup.trim())}`,
        { credentials: "same-origin" });
      if (!r.ok) throw new Error(String(r.status));
      this._history = await r.json();
      if (this._history!.length === 0)
        this._msg = { ok: false, text: "No consent recorded for that session." };
    } catch (e) {
      this._msg = { ok: false, text: `Lookup failed (${(e as Error).message}).` };
    } finally {
      this._busy = false;
    }
  }

  async #complete(req: DataRequest): Promise<void> {
    if (!confirm(`Mark the ${req.requestType} request for ${req.email} as complete?`)) return;
    this._busy = true;
    this._msg = null;
    try {
      const r = await fetch(`${this._api}/CompleteRequest`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id }),
      });
      const result = await r.json();
      this._msg = { ok: result.success, text: result.message };
      await this.#load();
    } catch (e) {
      this._msg = { ok: false, text: `The request failed (${(e as Error).message}).` };
    } finally {
      this._busy = false;
    }
  }

  async #purge(): Promise<void> {
    if (!confirm(
      `Delete consent records older than ${this._retentionDays} days? ` +
      `This removes the evidence of those decisions permanently.`)) return;

    this._busy = true;
    this._msg = null;
    try {
      const r = await fetch(`${this._api}/PurgeConsent?olderThanDays=${this._retentionDays}`, {
        method: "POST", credentials: "same-origin",
      });
      const result = await r.json();
      this._msg = { ok: r.ok, text: result.message };
      await this.#load();
    } catch (e) {
      this._msg = { ok: false, text: `Purge failed (${(e as Error).message}).` };
    } finally {
      this._busy = false;
    }
  }

  #stat(n: number | string, label: string) {
    return html`<div class="stat"><div class="n">${n}</div><div class="l">${label}</div></div>`;
  }

  override render() {
    const s = this._summary;
    return html`
      <h1>Privacy &amp; consent</h1>
      <p class="description">
        Consent decisions and data-subject requests. Consent is append-only: every change is
        kept, so the record shows what was agreed and when it changed rather than only the
        latest state.
      </p>

      ${this._loading ? html`<uui-loader></uui-loader>` : nothing}

      ${s
        ? html`
            <uui-box headline="Consent now">
              <div class="stats">
                ${this.#stat(s.sessions, "sessions")}
                ${this.#stat(s.all, "accepted all")}
                ${this.#stat(s.essential, "essential only")}
                ${this.#stat(s.none, "declined")}
                ${this.#stat(s.pendingRequests, "requests pending")}
              </div>
              <p class="hint" style="margin-top:12px;">
                ${s.recordsHeld} record(s) held${s.oldestRecordUtc
                  ? html`, oldest ${new Date(s.oldestRecordUtc).toLocaleDateString()}`
                  : nothing}.
                Each session counts once, by its most recent decision.
              </p>
            </uui-box>`
        : nothing}

      ${this._msg
        ? html`<div class="msg ${this._msg.ok ? "success" : "error"}">${this._msg.text}</div>`
        : nothing}

      <uui-box headline="Look up a session" style="margin-top:16px;">
        <div class="row">
          <div class="field">
            <label for="sid">Session id</label>
            <input id="sid" .value=${this._lookup}
              @input=${(e: InputEvent) => (this._lookup = (e.target as HTMLInputElement).value)} />
          </div>
          <uui-button look="secondary" ?disabled=${this._busy || !this._lookup.trim()}
            @click=${this.#lookupSession}>Show history</uui-button>
        </div>

        ${this._history && this._history.length > 0
          ? html`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>When</uui-table-head-cell>
                  <uui-table-head-cell>Decision</uui-table-head-cell>
                  <uui-table-head-cell>IP</uui-table-head-cell>
                  <uui-table-head-cell>User agent</uui-table-head-cell>
                </uui-table-head>
                ${this._history.map(h => html`
                  <uui-table-row>
                    <uui-table-cell>${new Date(h.consentDate).toLocaleString()}</uui-table-cell>
                    <uui-table-cell><uui-tag look="secondary">${h.consentType}</uui-tag></uui-table-cell>
                    <uui-table-cell class="mono">${h.ipAddress ?? "—"}</uui-table-cell>
                    <uui-table-cell class="hint" style="max-width:260px;overflow-wrap:anywhere;">
                      ${h.userAgent ?? "—"}
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`
          : nothing}
      </uui-box>

      <uui-box headline="Data subject requests" style="margin-top:16px;">
        <div class="row">
          ${["pending", "completed", ""].map(f => html`
            <uui-button
              look=${this._statusFilter === f ? "primary" : "secondary"}
              compact
              @click=${async () => { this._statusFilter = f; await this.#load(); }}>
              ${f === "" ? "All" : f}
            </uui-button>`)}
        </div>

        ${this._requests.length === 0
          ? html`<p class="empty">No ${this._statusFilter || ""} requests.</p>`
          : html`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Type</uui-table-head-cell>
                  <uui-table-head-cell>Requested</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._requests.map(r => html`
                  <uui-table-row>
                    <uui-table-cell class="mono">${r.email}</uui-table-cell>
                    <uui-table-cell>${r.requestType}</uui-table-cell>
                    <uui-table-cell class="hint">
                      ${new Date(r.requestedAt).toLocaleDateString()}
                    </uui-table-cell>
                    <uui-table-cell>
                      <uui-tag look=${r.status === "pending" ? "warning" : "positive"}>
                        ${r.status}
                      </uui-tag>
                    </uui-table-cell>
                    <uui-table-cell style="text-align:right;">
                      ${r.status === "pending"
                        ? html`<uui-button look="secondary" compact ?disabled=${this._busy}
                                 @click=${() => this.#complete(r)}>Mark complete</uui-button>`
                        : html`<span class="hint">
                                 ${r.completedAt ? new Date(r.completedAt).toLocaleDateString() : ""}
                               </span>`}
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`}
      </uui-box>

      <uui-box headline="Retention" style="margin-top:16px;">
        <p class="hint">
          Consent records hold an IP address and a user agent, which are personal data.
          Deleting old ones also deletes the evidence of those decisions, so keep them at
          least as long as you may need to demonstrate consent.
        </p>
        <div class="row" style="margin-top:8px;">
          <div class="field">
            <label for="ret">Delete records older than (days)</label>
            <input id="ret" type="number" min="1" style="min-width:120px;"
              .value=${String(this._retentionDays)}
              @input=${(e: InputEvent) =>
                (this._retentionDays = Number((e.target as HTMLInputElement).value))} />
          </div>
          <uui-button look="secondary" color="danger" ?disabled=${this._busy || this._retentionDays < 1}
            @click=${this.#purge}>Purge</uui-button>
        </div>
      </uui-box>
    `;
  }
}

export default GdrpDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "gdrp-dashboard": GdrpDashboardElement;
  }
}
