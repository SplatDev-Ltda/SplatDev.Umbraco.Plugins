import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import type { UmbAuthContext } from "@umbraco-cms/backoffice/auth";
import type { UmbNotificationContext } from "@umbraco-cms/backoffice/notification";

interface D4SignDocument {
  docUuid: string;
  locacaoId: number;
  razaoSocial: string;
  cnpj: string;
  regionalCodigo: string;
  uf: string;
  status: "aguardando_assinatura" | "assinado" | "cancelado";
  pdfBlobUrl: string | null;
  criadoEm: string;
  assinadoEm: string | null;
}

interface D4SignStats {
  total: number;
  aguardando: number;
  assinados: number;
  cancelados: number;
}

const API_BASE = "/umbraco/api/d4sign";

@customElement("d4sign-dashboard")
export class D4SignDashboardElement extends UmbElementMixin(LitElement) {
  @state()
  private _loading = false;

  @state()
  private _checkingUuid: string | null = null;

  @state()
  private _documents: D4SignDocument[] = [];

  @state()
  private _search = "";

  @state()
  private _statusFilter = "";

  @state()
  private _stats: D4SignStats = { total: 0, aguardando: 0, assinados: 0, cancelados: 0 };

  private _authContext: UmbAuthContext | null = null;
  private _notifContext: UmbNotificationContext | null = null;
  private _error: string | null = null;

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.consumeContext(UMB_AUTH_CONTEXT, (ctx: UmbAuthContext) => {
      this._authContext = ctx;
      this._loadDocuments();
    });
    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (ctx: UmbNotificationContext) => {
      this._notifContext = ctx;
    });
  }

  private async _fetch(path: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (options.headers) {
      Object.assign(headers, options.headers);
      delete options.headers;
    }
    if (this._authContext) {
      const token = await this._authContext.getLatestToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(`${API_BASE}${path}`, { ...options, headers });
  }

  private async _loadDocuments(): Promise<void> {
    this._loading = true;
    this._error = null;
    try {
      const res = await this._fetch("/Documents");
      if (!res.ok) {
        const err = (await res.json().catch(() => ({ message: res.statusText }))) as { message?: string };
        throw new Error(err.message ?? res.statusText);
      }
      const data = (await res.json()) as { documents?: D4SignDocument[] };
      this._documents = data.documents ?? [];
      this._recalcStats();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido ao carregar documentos.";
      this._error = msg;
      this._notify("danger", "Erro", msg);
    } finally {
      this._loading = false;
    }
  }

  private _recalcStats(): void {
    const docs = this._documents;
    this._stats = {
      total: docs.length,
      aguardando: docs.filter((d) => d.status === "aguardando_assinatura").length,
      assinados: docs.filter((d) => d.status === "assinado").length,
      cancelados: docs.filter((d) => d.status === "cancelado").length,
    };
  }

  private async _checkStatus(docUuid: string, locacaoId: number): Promise<void> {
    if (this._checkingUuid) return;
    this._checkingUuid = docUuid;
    this._notify("default", "Verificando", "Consultando status no D4Sign…");
    try {
      const res = await this._fetch("/CheckStatus", {
        method: "POST",
        body: JSON.stringify({ docUuid, locacaoId }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({ message: res.statusText }))) as { message?: string };
        throw new Error(err.message ?? res.statusText);
      }
      const data = (await res.json()) as { updated: boolean; status: string };
      if (data.updated) {
        this._notify("positive", "Atualizado", `Status atualizado para: ${this._statusLabel(data.status)}`);
        await this._loadDocuments();
      } else {
        this._notify("default", "Status", `Status atual: ${this._statusLabel(data.status)}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      this._notify("danger", "Erro", `N\u00e3o foi poss\u00edvel verificar o status: ${msg}`);
    } finally {
      this._checkingUuid = null;
    }
  }

  private _downloadPdf(blobUrl: string | null): void {
    if (!blobUrl) {
      this._notify("warning", "Indispon\u00edvel", "O PDF ainda n\u00e3o est\u00e1 dispon\u00edvel para download.");
      return;
    }
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    this._notify("positive", "Download", "Abrindo PDF assinado…");
  }

  private _setStatusFilter(filter: string): void {
    this._statusFilter = this._statusFilter === filter ? "" : filter;
  }

  private _statusLabel(status: string): string {
    const map: Record<string, string> = {
      aguardando_assinatura: "Aguardando Assinatura",
      assinado: "Assinado",
      cancelado: "Cancelado",
    };
    return map[status] ?? status;
  }

  private _statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      aguardando_assinatura: "badge badge-aguardando",
      assinado: "badge badge-assinado",
      cancelado: "badge badge-cancelado",
    };
    return map[status] ?? "badge badge-unknown";
  }

  private _notify(color: string, headline: string, message: string): void {
    this._notifContext?.peek(color, { data: { headline, message } });
  }

  private get _filteredDocuments(): D4SignDocument[] {
    const search = this._search.toLowerCase();
    return this._documents.filter((d) => {
      if (this._statusFilter && d.status !== this._statusFilter) return false;
      if (!search) return true;
      return (
        (d.razaoSocial ?? "").toLowerCase().includes(search) ||
        (d.cnpj ?? "").toLowerCase().includes(search) ||
        (d.docUuid ?? "").toLowerCase().includes(search)
      );
    });
  }

  private _renderStats() {
    const s = this._stats;
    return html`
      <div class="stats-grid">
        ${this._statCard("Total", s.total, "")}
        ${this._statCard("Aguardando", s.aguardando, "aguardando_assinatura")}
        ${this._statCard("Assinados", s.assinados, "assinado")}
        ${this._statCard("Cancelados", s.cancelados, "cancelado")}
      </div>
    `;
  }

  private _statCard(label: string, value: number, filterKey: string) {
    const active = this._statusFilter === filterKey && filterKey !== "";
    return html`
      <div
        class="stat-card ${active ? "active" : ""}"
        @click=${() => (filterKey ? this._setStatusFilter(filterKey) : undefined)}
      >
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
      </div>
    `;
  }

  private _renderTable() {
    const rows = this._filteredDocuments;
    if (!rows.length) {
      return html`
        <div class="empty-state">
          ${this._search || this._statusFilter
            ? "Nenhum documento encontrado com os filtros aplicados."
            : "Nenhum documento D4Sign encontrado."}
        </div>
      `;
    }
    return html`
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
          ${rows.map((d) => this._renderRow(d))}
        </tbody>
      </table>
    `;
  }

  private _renderRow(d: D4SignDocument) {
    const isChecking = this._checkingUuid === d.docUuid;
    return html`
      <tr>
        <td>${d.razaoSocial ?? "\u2014"}</td>
        <td>${d.cnpj ?? "\u2014"}</td>
        <td>${d.regionalCodigo ?? ""}${d.uf ? ` / ${d.uf}` : ""}</td>
        <td>
          <span class=${this._statusBadgeClass(d.status)}>
            ${this._statusLabel(d.status)}
          </span>
        </td>
        <td>${d.criadoEm ? new Date(d.criadoEm).toLocaleDateString("pt-BR") : "\u2014"}</td>
        <td>${d.assinadoEm ? new Date(d.assinadoEm).toLocaleDateString("pt-BR") : "\u2014"}</td>
        <td>
          <div class="row-actions">
            <uui-button
              look="secondary"
              compact
              label=${isChecking ? "Verificando\u2026" : "Verificar"}
              ?disabled=${!!this._checkingUuid}
              @click=${() => this._checkStatus(d.docUuid, d.locacaoId)}
            >
              ${isChecking ? html`<uui-loader-circle></uui-loader-circle>` : nothing}
              ${isChecking ? "Verificando\u2026" : "Verificar"}
            </uui-button>
            ${d.status === "assinado"
              ? html`
                  <uui-button look="secondary" compact label="Baixar PDF" @click=${() => this._downloadPdf(d.pdfBlobUrl)}>
                    Baixar PDF
                  </uui-button>
                `
              : nothing}
          </div>
        </td>
      </tr>
    `;
  }

  render() {
    return html`
      <div class="header">
        <h1>D4Sign &mdash; Assinaturas Digitais</h1>
        <p>Gerencie documentos enviados para assinatura digital via D4Sign.</p>
      </div>

      ${this._error ? html`<div class="error-box">${this._error}</div>` : nothing}

      ${this._renderStats()}

      <div class="toolbar">
        <uui-input
          placeholder="Buscar por empresa, CNPJ ou UUID\u2026"
          .value=${this._search}
          @input=${(e: InputEvent) => (this._search = (e.target as HTMLInputElement).value)}
        >
        </uui-input>
        <uui-button look="secondary" label="Atualizar" ?disabled=${this._loading} @click=${this._loadDocuments}>
          ${this._loading ? html`<uui-loader-circle></uui-loader-circle>` : nothing}
          Atualizar
        </uui-button>
      </div>

      ${this._loading && !this._documents.length
        ? html`<uui-loader-bar></uui-loader-bar>`
        : this._renderTable()}
    `;
  }

  static styles = css`
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
}

export default D4SignDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "d4sign-dashboard": D4SignDashboardElement;
  }
}
