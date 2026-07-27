import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";

const API_BASE = "/umbraco/api/enotassina";

interface ENotDocument {
  cartorio_doc_id: string;
  locacao_id: string;
  razao_social: string;
  cnpj: string;
  nome_assinante: string;
  cpf_assinante: string;
  email_assinante: string;
  status: string;
  certificado_ativo: boolean | null;
  cartorio_emissor: string;
  cartorio_link: string | null;
  pdf_blob_url: string | null;
  criado_em: string | null;
  assinado_em: string | null;
}

interface ENotStats {
  total: number;
  aguardando: number;
  assinados: number;
  cancelados: number;
}

@customElement("enotassina-dashboard")
export class ENotAssinaDashboardElement extends UmbElementMixin(LitElement) {
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _documents: ENotDocument[] = [];
  @state() private _search = "";
  @state() private _statusFilter = "";
  @state() private _confirmDialog: { type: string; docId: string; razaoSocial: string } | null = null;

  private _notificationContext: unknown;
  private _authContext: unknown;

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1); }
    .stats-row { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .stat-card { flex: 1; min-width: 120px; padding: 16px; border: 1px solid var(--uui-color-border); border-radius: var(--uui-border-radius); text-align: center; background: var(--uui-color-surface); }
    .stat-label { font-size: 12px; color: var(--uui-color-text-alt); margin-bottom: 4px; }
    .stat-value { font-size: 28px; font-weight: bold; color: var(--uui-color-text); }
    .stat-card.warning .stat-value { color: var(--uui-color-warning-standalone); }
    .stat-card.positive .stat-value { color: var(--uui-color-positive-standalone); }
    .stat-card.danger .stat-value { color: var(--uui-color-danger-standalone); }
    .filters-row { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
    select { padding: var(--uui-size-2) var(--uui-size-3); border: 1px solid var(--uui-color-border); border-radius: var(--uui-border-radius); background: var(--uui-color-surface); color: var(--uui-color-text); font-size: 14px; }
    .actions-cell { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
    .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .confirm-dialog { background: var(--uui-color-surface); padding: 32px; border-radius: var(--uui-border-radius); max-width: 480px; width: 90%; box-shadow: var(--uui-shadow-depth-3); }
    .confirm-dialog h3 { margin: 0 0 12px; }
    .confirm-warning { color: var(--uui-color-danger-standalone); font-size: 13px; }
    .confirm-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
  `;

  constructor() {
    super();
    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (ctx: unknown) => { this._notificationContext = ctx; });
    this.consumeContext(UMB_AUTH_CONTEXT, (ctx: unknown) => { this._authContext = ctx; });
  }

  private async _fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await (this._authContext as { getLatestToken?: () => Promise<string> } | null)?.getLatestToken();
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string> ?? {}) };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { credentials: "include", ...options, headers });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadDocuments();
  }

  private async _loadDocuments(): Promise<void> {
    this._loading = true; this._error = null;
    try {
      const res = await this._fetch(`${API_BASE}/documents`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._documents = (data.documents ?? []) as ENotDocument[];
    } catch (e: unknown) {
      this._error = (e as Error).message ?? "Erro desconhecido";
      (this._notificationContext as { peek?: (c: string, d: object) => void })?.peek("danger", { data: { headline: "Erro ao carregar documentos", message: this._error } });
    } finally { this._loading = false; }
  }

  private async _checkStatus(docId: string): Promise<void> {
    (this._notificationContext as { peek?: (c: string, d: object) => void })?.peek("positive", { data: { headline: "Verificando status...", message: "Consultando e-Not Assina." } });
    try {
      const res = await this._fetch(`${API_BASE}/checkstatus`, { method: "POST", body: JSON.stringify({ docId }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { updated?: boolean; status: string };
      if (data.updated) {
        (this._notificationContext as { peek?: (c: string, d: object) => void })?.peek("positive", { data: { headline: "Status atualizado", message: `Novo status: ${this._statusLabel(data.status)}` } });
        await this._loadDocuments();
      } else {
        (this._notificationContext as { peek?: (c: string, d: object) => void })?.peek("default", { data: { headline: "Status atual", message: this._statusLabel(data.status) } });
      }
    } catch (e: unknown) {
      (this._notificationContext as { peek?: (c: string, d: object) => void })?.peek("danger", { data: { headline: "Erro ao verificar status", message: (e as Error).message } });
    }
  }

  private _confirmCancel(docId: string, razaoSocial: string): void { this._confirmDialog = { type: "cancel", docId, razaoSocial }; }

  private async _executeCancel(): Promise<void> {
    if (!this._confirmDialog) return;
    const { docId } = this._confirmDialog; this._confirmDialog = null;
    (this._notificationContext as { peek?: (c: string, d: object) => void })?.peek("default", { data: { headline: "Cancelando...", message: "Aguarde." } });
    try {
      const res = await this._fetch(`${API_BASE}/cancel`, { method: "POST", body: JSON.stringify({ docId }) });
      if (!res.ok) { const err = await res.json().catch(() => ({})) as { message?: string }; throw new Error(err.message ?? `HTTP ${res.status}`); }
      (this._notificationContext as { peek?: (c: string, d: object) => void })?.peek("positive", { data: { headline: "Cancelado", message: "O fluxo de assinatura foi cancelado." } });
      await this._loadDocuments();
    } catch (e: unknown) {
      (this._notificationContext as { peek?: (c: string, d: object) => void })?.peek("danger", { data: { headline: "Erro ao cancelar", message: (e as Error).message } });
    }
  }

  private _statusLabel(status: string): string {
    const map: Record<string, string> = { aguardando_assinatura: "Aguardando Assinatura", assinado: "Assinado", cancelado: "Cancelado" };
    return map[status] ?? status;
  }

  private get _filteredDocs(): ENotDocument[] {
    const q = this._search.toLowerCase();
    return this._documents.filter((d) => {
      const matchSearch = !q || (d.cartorio_doc_id ?? "").toLowerCase().includes(q) || (d.razao_social ?? "").toLowerCase().includes(q) || (d.cnpj ?? "").toLowerCase().includes(q) || (d.nome_assinante ?? "").toLowerCase().includes(q) || (d.cpf_assinante ?? "").toLowerCase().includes(q) || (d.email_assinante ?? "").toLowerCase().includes(q);
      const matchStatus = !this._statusFilter || d.status === this._statusFilter;
      return matchSearch && matchStatus;
    });
  }

  private get _stats(): ENotStats {
    return {
      total: this._documents.length,
      aguardando: this._documents.filter((d) => d.status === "aguardando_assinatura").length,
      assinados: this._documents.filter((d) => d.status === "assinado").length,
      cancelados: this._documents.filter((d) => d.status === "cancelado").length,
    };
  }

  private _fmtDate(val: string | null): string {
    if (!val) return "\u2014";
    return new Date(val).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  private _renderConfirm() {
    if (!this._confirmDialog) return html``;
    return html`<div class="confirm-overlay"><div class="confirm-dialog"><h3>Cancelar Fluxo de Assinatura</h3><p>Tem certeza que deseja cancelar o fluxo de assinatura de <strong>${this._confirmDialog.razaoSocial}</strong>?</p><p class="confirm-warning">Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita. O signat\u00e1rio n\u00e3o poder\u00e1 mais assinar este documento.</p><div class="confirm-actions"><uui-button look="secondary" @click=${() => (this._confirmDialog = null)}>N\u00e3o</uui-button><uui-button look="primary" color="danger" @click=${this._executeCancel}>Sim, cancelar</uui-button></div></div></div>`;
  }

  private _renderStatusBadge(doc: ENotDocument) {
    const colorMap: Record<string, string> = { aguardando_assinatura: "warning", assinado: "positive", cancelado: "danger" };
    return html`<uui-badge color=${colorMap[doc.status] ?? "default"}>${this._statusLabel(doc.status)}</uui-badge>${doc.certificado_ativo === true ? html`<br /><small style="color:var(--uui-color-positive-standalone)">\u2713 Certificado Ativo</small>` : ""}${doc.certificado_ativo === false ? html`<br /><small style="color:var(--uui-color-warning-standalone)">\u26a0 Certificado Inativo</small>` : ""}`;
  }

  override render() {
    const stats = this._stats;
    const docs = this._filteredDocs;
    return html`${this._renderConfirm()}<uui-box headline="e-Not Assina \u2013 Gerenciador de Assinaturas Eletr\u00f4nicas Notarizadas">
      <div class="stats-row"><div class="stat-card"><div class="stat-label">Total</div><div class="stat-value">${stats.total}</div></div><div class="stat-card warning"><div class="stat-label">Aguardando</div><div class="stat-value">${stats.aguardando}</div></div><div class="stat-card positive"><div class="stat-label">Assinados</div><div class="stat-value">${stats.assinados}</div></div><div class="stat-card danger"><div class="stat-label">Cancelados</div><div class="stat-value">${stats.cancelados}</div></div></div>
      <div class="filters-row"><uui-input placeholder="Buscar por ID, raz\u00e3o social, CPF ou e-mail..." .value=${this._search} @input=${(e: InputEvent) => (this._search = (e.target as HTMLInputElement).value)} style="flex:1;"></uui-input><select @change=${(e: Event) => (this._statusFilter = (e.target as HTMLSelectElement).value)}><option value="">Todos os status</option><option value="aguardando_assinatura">Aguardando Assinatura</option><option value="assinado">Assinado</option><option value="cancelado">Cancelado</option></select><uui-button look="secondary" @click=${this._loadDocuments} ?disabled=${this._loading}><uui-icon name="icon-refresh"></uui-icon> Atualizar</uui-button></div>
      ${this._loading ? html`<uui-loader-bar></uui-loader-bar>` : ""}${this._error ? html`<uui-tag color="danger">Erro: ${this._error}</uui-tag>` : ""}
      <uui-table><uui-table-head><uui-table-head-cell>Loc. ID</uui-table-head-cell><uui-table-head-cell>Doc ID</uui-table-head-cell><uui-table-head-cell>Raz\u00e3o Social / CNPJ</uui-table-head-cell><uui-table-head-cell>Signat\u00e1rio</uui-table-head-cell><uui-table-head-cell>Status</uui-table-head-cell><uui-table-head-cell>Cart\u00f3rio</uui-table-head-cell><uui-table-head-cell>Criado Em</uui-table-head-cell><uui-table-head-cell>Assinado Em</uui-table-head-cell><uui-table-head-cell>A\u00e7\u00f5es</uui-table-head-cell></uui-table-head>
        ${docs.length === 0 && !this._loading ? html`<uui-table-row><uui-table-cell colspan="9" style="text-align:center;padding:40px;color:var(--uui-color-text-alt)">Nenhum documento e-Not Assina encontrado.</uui-table-cell></uui-table-row>` : ""}
        ${docs.map((doc) => html`<uui-table-row><uui-table-cell>${doc.locacao_id}</uui-table-cell><uui-table-cell><code style="font-size:11px">${(doc.cartorio_doc_id ?? "").substring(0, 14)}\u2026</code></uui-table-cell><uui-table-cell><strong>${doc.razao_social}</strong><br /><small style="color:var(--uui-color-text-alt)">${doc.cnpj}</small></uui-table-cell><uui-table-cell><div>${doc.nome_assinante}</div><small style="color:var(--uui-color-text-alt)">CPF: ${doc.cpf_assinante}<br />${doc.email_assinante}</small></uui-table-cell><uui-table-cell>${this._renderStatusBadge(doc)}</uui-table-cell><uui-table-cell><small>${doc.cartorio_emissor || "\u2014"}</small></uui-table-cell><uui-table-cell>${this._fmtDate(doc.criado_em)}</uui-table-cell><uui-table-cell>${this._fmtDate(doc.assinado_em)}</uui-table-cell><uui-table-cell><div class="actions-cell">${doc.cartorio_link ? html`<uui-button look="secondary" href="${doc.cartorio_link}" target="_blank" label="Abrir no e-Not Assina" title="Abrir no e-Not Assina"><uui-icon name="icon-link"></uui-icon></uui-button>` : ""}${doc.pdf_blob_url ? html`<uui-button look="secondary" color="positive" @click=${() => window.open(doc.pdf_blob_url!, "_blank")} label="Baixar PDF" title="Baixar PDF assinado"><uui-icon name="icon-download"></uui-icon></uui-button>` : ""}${doc.status === "aguardando_assinatura" ? html`<uui-button look="secondary" @click=${() => this._checkStatus(doc.cartorio_doc_id)} label="Verificar status" title="Verificar status"><uui-icon name="icon-refresh"></uui-icon></uui-button><uui-button look="secondary" color="danger" @click=${() => this._confirmCancel(doc.cartorio_doc_id, doc.razao_social)} label="Cancelar fluxo" title="Cancelar fluxo de assinatura"><uui-icon name="icon-delete"></uui-icon></uui-button>` : ""}</div></uui-table-cell></uui-table-row>`)}
      </uui-table><div style="margin-top:8px;color:var(--uui-color-text-alt);font-size:12px">Mostrando ${docs.length} de ${this._documents.length} documento(s)</div>
    </uui-box>`;
  }
}

export default ENotAssinaDashboardElement;

declare global { interface HTMLElementTagNameMap { "enotassina-dashboard": ENotAssinaDashboardElement; } }
