import { LitElement as h, html as r, nothing as u, css as p, state as d, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as _ } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as b } from "@umbraco-cms/backoffice/notification";
var m = Object.defineProperty, v = Object.getOwnPropertyDescriptor, n = (t, a, e, s) => {
  for (var o = s > 1 ? void 0 : s ? v(a, e) : a, c = t.length - 1, l; c >= 0; c--)
    (l = t[c]) && (o = (s ? l(a, e, o) : l(o)) || o);
  return s && o && m(a, e, o), o;
};
const x = "/umbraco/api/d4sign";
let i = class extends _(h) {
  constructor() {
    super(), this._loading = !1, this._checkingUuid = null, this._documents = [], this._search = "", this._statusFilter = "", this._stats = { total: 0, aguardando: 0, assinados: 0, cancelados: 0 }, this._authContext = null, this._notifContext = null, this._error = null, this._authReady = new Promise((t) => {
      this._authResolve = t;
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(f, (t) => {
      this._authContext = t, this._authResolve(), this._loadDocuments();
    }), this.consumeContext(b, (t) => {
      this._notifContext = t;
    });
  }
  async _fetch(t, a = {}) {
    var o;
    const e = { "Content-Type": "application/json" };
    a.headers && (Object.assign(e, a.headers), delete a.headers), await this._authReady;
    const s = await ((o = this._authContext) == null ? void 0 : o.getLatestToken());
    return s && (e.Authorization = `Bearer ${s}`), fetch(`${x}${t}`, { credentials: "same-origin", ...a, headers: e });
  }
  async _loadDocuments() {
    this._loading = !0, this._error = null;
    try {
      const t = await this._fetch("/Documents");
      if (!t.ok) {
        const e = await t.json().catch(() => ({ message: t.statusText }));
        throw new Error(e.message ?? t.statusText);
      }
      const a = await t.json();
      this._documents = a.documents ?? [], this._recalcStats();
    } catch (t) {
      const a = t instanceof Error ? t.message : "Erro desconhecido ao carregar documentos.";
      this._error = a, this._notify("danger", "Erro", a);
    } finally {
      this._loading = !1;
    }
  }
  _recalcStats() {
    const t = this._documents;
    this._stats = {
      total: t.length,
      aguardando: t.filter((a) => a.status === "aguardando_assinatura").length,
      assinados: t.filter((a) => a.status === "assinado").length,
      cancelados: t.filter((a) => a.status === "cancelado").length
    };
  }
  async _checkStatus(t, a) {
    if (!this._checkingUuid) {
      this._checkingUuid = t, this._notify("default", "Verificando", "Consultando status no D4Sign…");
      try {
        const e = await this._fetch("/CheckStatus", {
          method: "POST",
          body: JSON.stringify({ docUuid: t, locacaoId: a })
        });
        if (!e.ok) {
          const o = await e.json().catch(() => ({ message: e.statusText }));
          throw new Error(o.message ?? e.statusText);
        }
        const s = await e.json();
        s.updated ? (this._notify("positive", "Atualizado", `Status atualizado para: ${this._statusLabel(s.status)}`), await this._loadDocuments()) : this._notify("default", "Status", `Status atual: ${this._statusLabel(s.status)}`);
      } catch (e) {
        const s = e instanceof Error ? e.message : "";
        this._notify("danger", "Erro", `Não foi possível verificar o status: ${s}`);
      } finally {
        this._checkingUuid = null;
      }
    }
  }
  _downloadPdf(t) {
    if (!t) {
      this._notify("warning", "Indisponível", "O PDF ainda não está disponível para download.");
      return;
    }
    window.open(t, "_blank", "noopener,noreferrer"), this._notify("positive", "Download", "Abrindo PDF assinado…");
  }
  _setStatusFilter(t) {
    this._statusFilter = this._statusFilter === t ? "" : t;
  }
  _statusLabel(t) {
    return {
      aguardando_assinatura: "Aguardando Assinatura",
      assinado: "Assinado",
      cancelado: "Cancelado"
    }[t] ?? t;
  }
  _statusBadgeClass(t) {
    return {
      aguardando_assinatura: "badge badge-aguardando",
      assinado: "badge badge-assinado",
      cancelado: "badge badge-cancelado"
    }[t] ?? "badge badge-unknown";
  }
  _notify(t, a, e) {
    var s;
    (s = this._notifContext) == null || s.peek(t, { data: { headline: a, message: e } });
  }
  get _filteredDocuments() {
    const t = this._search.toLowerCase();
    return this._documents.filter((a) => this._statusFilter && a.status !== this._statusFilter ? !1 : t ? (a.razaoSocial ?? "").toLowerCase().includes(t) || (a.cnpj ?? "").toLowerCase().includes(t) || (a.docUuid ?? "").toLowerCase().includes(t) : !0);
  }
  _renderStats() {
    const t = this._stats;
    return r`
      <div class="stats-grid">
        ${this._statCard("Total", t.total, "")}
        ${this._statCard("Aguardando", t.aguardando, "aguardando_assinatura")}
        ${this._statCard("Assinados", t.assinados, "assinado")}
        ${this._statCard("Cancelados", t.cancelados, "cancelado")}
      </div>
    `;
  }
  _statCard(t, a, e) {
    const s = this._statusFilter === e && e !== "";
    return r`
      <div
        class="stat-card ${s ? "active" : ""}"
        @click=${() => e ? this._setStatusFilter(e) : void 0}
      >
        <div class="stat-label">${t}</div>
        <div class="stat-value">${a}</div>
      </div>
    `;
  }
  _renderTable() {
    const t = this._filteredDocuments;
    return t.length ? r`
      <table>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>CNPJ</th>
            <th>Regional / UF</th>
            <th>Status</th>
            <th>Criado em</th>
            <th>Assinado em</th>
            <th>A&ccedil;&otilde;es</th>
          </tr>
        </thead>
        <tbody>
          ${t.map((a) => this._renderRow(a))}
        </tbody>
      </table>
    ` : r`
        <div class="empty-state">
          ${this._search || this._statusFilter ? "Nenhum documento encontrado com os filtros aplicados." : "Nenhum documento D4Sign encontrado."}
        </div>
      `;
  }
  _renderRow(t) {
    const a = this._checkingUuid === t.docUuid;
    return r`
      <tr>
        <td>${t.razaoSocial ?? "—"}</td>
        <td>${t.cnpj ?? "—"}</td>
        <td>${t.regionalCodigo ?? ""}${t.uf ? ` / ${t.uf}` : ""}</td>
        <td>
          <span class=${this._statusBadgeClass(t.status)}>
            ${this._statusLabel(t.status)}
          </span>
        </td>
        <td>${t.criadoEm ? new Date(t.criadoEm).toLocaleDateString("pt-BR") : "—"}</td>
        <td>${t.assinadoEm ? new Date(t.assinadoEm).toLocaleDateString("pt-BR") : "—"}</td>
        <td>
          <div class="row-actions">
            <uui-button
              look="secondary"
              compact
              label=${a ? "Verificando…" : "Verificar"}
              ?disabled=${!!this._checkingUuid}
              @click=${() => this._checkStatus(t.docUuid, t.locacaoId)}
            >
              ${a ? r`<uui-loader-circle></uui-loader-circle>` : u}
              ${a ? "Verificando…" : "Verificar"}
            </uui-button>
            ${t.status === "assinado" ? r`
                  <uui-button look="secondary" compact label="Baixar PDF" @click=${() => this._downloadPdf(t.pdfBlobUrl)}>
                    Baixar PDF
                  </uui-button>
                ` : u}
          </div>
        </td>
      </tr>
    `;
  }
  render() {
    return r`
      <div class="header">
        <h1>D4Sign &mdash; Assinaturas Digitais</h1>
        <p>Gerencie documentos enviados para assinatura digital via D4Sign.</p>
      </div>

      ${this._error ? r`<div class="error-box">${this._error}</div>` : u}

      ${this._renderStats()}

      <div class="toolbar">
        <uui-input
          placeholder="Buscar por empresa, CNPJ ou UUID\u2026"
          .value=${this._search}
          @input=${(t) => this._search = t.target.value}
        >
        </uui-input>
        <uui-button look="secondary" label="Atualizar" ?disabled=${this._loading} @click=${this._loadDocuments}>
          ${this._loading ? r`<uui-loader-circle></uui-loader-circle>` : u}
          Atualizar
        </uui-button>
      </div>

      ${this._loading && !this._documents.length ? r`<uui-loader-bar></uui-loader-bar>` : this._renderTable()}
    `;
  }
};
i.styles = p`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    .header {
      margin-bottom: var(--uui-size-layout-2, 32px);
    }

    .header h1 {
      font-size: var(--uui-type-h3-size, 1.5rem);
      font-weight: 600;
      margin: 0 0 var(--uui-size-3, 8px) 0;
      color: var(--uui-color-text, #1b264f);
    }

    .header p {
      margin: 0;
      color: var(--uui-color-text-alt, #666);
    }

    .toolbar {
      display: flex;
      gap: var(--uui-size-3, 8px);
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: var(--uui-size-layout-2, 32px);
    }

    .toolbar uui-input {
      min-width: 220px;
      flex: 1;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--uui-size-3, 8px);
      margin-bottom: var(--uui-size-layout-2, 32px);
    }

    .stat-card {
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e3e3e3);
      border-radius: var(--uui-border-radius, 4px);
      padding: var(--uui-size-5, 16px);
      text-align: center;
      cursor: pointer;
      transition: border-color 0.15s;
    }

    .stat-card:hover,
    .stat-card.active {
      border-color: var(--uui-color-interactive, #1b264f);
    }

    .stat-label {
      font-size: 11px;
      color: var(--uui-color-text-alt, #888);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--uui-size-2, 6px);
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: var(--uui-color-interactive, #1b264f);
      line-height: 1;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e3e3e3);
      border-radius: var(--uui-border-radius, 4px);
      overflow: hidden;
    }

    th {
      background: var(--uui-color-surface-alt, #f5f5f5);
      text-align: left;
      padding: var(--uui-size-3, 10px) var(--uui-size-5, 16px);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--uui-color-text-alt, #888);
      border-bottom: 1px solid var(--uui-color-border, #e3e3e3);
    }

    td {
      padding: var(--uui-size-3, 10px) var(--uui-size-5, 16px);
      font-size: 13px;
      color: var(--uui-color-text, #333);
      border-bottom: 1px solid var(--uui-color-border, #e3e3e3);
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: var(--uui-color-surface-alt, #f9f9f9);
    }

    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.03em;
    }

    .badge-aguardando {
      background: #fff3cd;
      color: #856404;
    }

    .badge-assinado {
      background: #d1e7dd;
      color: #0a5e35;
    }

    .badge-cancelado {
      background: #f8d7da;
      color: #721c24;
    }

    .badge-unknown {
      background: #e2e3e5;
      color: #383d41;
    }

    .row-actions {
      display: flex;
      gap: var(--uui-size-2, 6px);
      flex-wrap: wrap;
    }

    .empty-state {
      text-align: center;
      padding: var(--uui-size-layout-2, 48px);
      color: var(--uui-color-text-alt, #888);
    }

    .error-box {
      background: #f8d7da;
      border: 1px solid #f5c2c7;
      border-radius: var(--uui-border-radius, 4px);
      padding: var(--uui-size-5, 16px);
      color: #721c24;
      margin-bottom: var(--uui-size-layout-2, 32px);
    }
  `;
n([
  d()
], i.prototype, "_loading", 2);
n([
  d()
], i.prototype, "_checkingUuid", 2);
n([
  d()
], i.prototype, "_documents", 2);
n([
  d()
], i.prototype, "_search", 2);
n([
  d()
], i.prototype, "_statusFilter", 2);
n([
  d()
], i.prototype, "_stats", 2);
i = n([
  g("d4sign-dashboard")
], i);
const k = i;
export {
  i as D4SignDashboardElement,
  k as default
};
