import { LitElement as m, nothing as u, html as l, css as _, state as d, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
import { UMB_NOTIFICATION_CONTEXT as p } from "@umbraco-cms/backoffice/notification";
import { UMB_AUTH_CONTEXT as f } from "@umbraco-cms/backoffice/auth";
var v = Object.defineProperty, x = Object.getOwnPropertyDescriptor, c = (a, e, t, o) => {
  for (var i = o > 1 ? void 0 : o ? x(e, t) : e, s = a.length - 1, n; s >= 0; s--)
    (n = a[s]) && (i = (o ? n(e, t, i) : n(i)) || i);
  return o && i && v(e, t, i), i;
};
const h = "/umbraco/api/enotassina";
let r = class extends g(m) {
  constructor() {
    super(), this._loading = !1, this._error = null, this._documents = [], this._search = "", this._statusFilter = "", this._confirmDialog = null, this.consumeContext(p, (a) => {
      this._notificationContext = a;
    }), this.consumeContext(f, (a) => {
      this._authContext = a;
    });
  }
  connectedCallback() {
    super.connectedCallback(), this._loadDocuments();
  }
  async _fetch(a, e = {}) {
    var i;
    const t = await ((i = this._authContext) == null ? void 0 : i.getLatestToken()), o = { "Content-Type": "application/json" };
    return e.headers && (Object.assign(o, e.headers), delete e.headers), t && (o.Authorization = `Bearer ${t}`), fetch(a, { credentials: "include", ...e, headers: o });
  }
  async _loadDocuments() {
    var a;
    this._loading = !0, this._error = null;
    try {
      const e = await this._fetch(`${h}/documents`);
      if (!e.ok) throw new Error(`HTTP ${e.status}`);
      const t = await e.json();
      this._documents = t.documents ?? [];
    } catch (e) {
      const t = e instanceof Error ? e.message : "Erro desconhecido";
      this._error = t, (a = this._notificationContext) == null || a.peek("danger", {
        data: { headline: "Erro ao carregar documentos", message: t }
      });
    } finally {
      this._loading = !1;
    }
  }
  async _checkStatus(a) {
    var e, t, o, i;
    (e = this._notificationContext) == null || e.peek("positive", {
      data: { headline: "Verificando status...", message: "Consultando e-Not Assina." }
    });
    try {
      const s = await this._fetch(`${h}/checkstatus`, {
        method: "POST",
        body: JSON.stringify({ docId: a })
      });
      if (!s.ok) throw new Error(`HTTP ${s.status}`);
      const n = await s.json();
      n.updated ? ((t = this._notificationContext) == null || t.peek("positive", {
        data: { headline: "Status atualizado", message: `Novo status: ${this._statusLabel(n.status)}` }
      }), await this._loadDocuments()) : (o = this._notificationContext) == null || o.peek("default", {
        data: { headline: "Status atual", message: this._statusLabel(n.status) }
      });
    } catch (s) {
      const n = s instanceof Error ? s.message : "Erro";
      (i = this._notificationContext) == null || i.peek("danger", {
        data: { headline: "Erro ao verificar status", message: n }
      });
    }
  }
  _confirmCancel(a, e) {
    this._confirmDialog = { type: "cancel", docId: a, razaoSocial: e };
  }
  async _executeCancel() {
    var e, t, o;
    if (!this._confirmDialog) return;
    const { docId: a } = this._confirmDialog;
    this._confirmDialog = null, (e = this._notificationContext) == null || e.peek("default", {
      data: { headline: "Cancelando...", message: "Aguarde." }
    });
    try {
      const i = await this._fetch(`${h}/cancel`, {
        method: "POST",
        body: JSON.stringify({ docId: a })
      });
      if (!i.ok) {
        const s = await i.json().catch(() => ({ message: `HTTP ${i.status}` }));
        throw new Error(s.message ?? `HTTP ${i.status}`);
      }
      (t = this._notificationContext) == null || t.peek("positive", {
        data: { headline: "Cancelado", message: "O fluxo de assinatura foi cancelado." }
      }), await this._loadDocuments();
    } catch (i) {
      const s = i instanceof Error ? i.message : "Erro";
      (o = this._notificationContext) == null || o.peek("danger", {
        data: { headline: "Erro ao cancelar", message: s }
      });
    }
  }
  _statusLabel(a) {
    return {
      aguardando_assinatura: "Aguardando Assinatura",
      assinado: "Assinado",
      cancelado: "Cancelado"
    }[a] ?? a;
  }
  get _filteredDocs() {
    const a = this._search.toLowerCase();
    return this._documents.filter((e) => {
      const t = !a || (e.cartorio_doc_id ?? "").toLowerCase().includes(a) || (e.razao_social ?? "").toLowerCase().includes(a) || (e.cnpj ?? "").toLowerCase().includes(a) || (e.nome_assinante ?? "").toLowerCase().includes(a) || (e.cpf_assinante ?? "").toLowerCase().includes(a) || (e.email_assinante ?? "").toLowerCase().includes(a), o = !this._statusFilter || e.status === this._statusFilter;
      return t && o;
    });
  }
  get _stats() {
    return {
      total: this._documents.length,
      aguardando: this._documents.filter((a) => a.status === "aguardando_assinatura").length,
      assinados: this._documents.filter((a) => a.status === "assinado").length,
      cancelados: this._documents.filter((a) => a.status === "cancelado").length
    };
  }
  _fmtDate(a) {
    return a ? new Date(a).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) : "—";
  }
  _renderConfirm() {
    return this._confirmDialog ? l`
      <div class="confirm-overlay">
        <div class="confirm-dialog">
          <h3>Cancelar Fluxo de Assinatura</h3>
          <p>
            Tem certeza que deseja cancelar o fluxo de assinatura de
            <strong>${this._confirmDialog.razaoSocial}</strong>?
          </p>
          <p class="confirm-warning">Esta ação não pode ser desfeita. O signatário não poderá mais assinar este documento.</p>
          <div class="confirm-actions">
            <uui-button look="secondary" @click=${() => this._confirmDialog = null}>Não</uui-button>
            <uui-button look="primary" color="danger" @click=${this._executeCancel}>Sim, cancelar</uui-button>
          </div>
        </div>
      </div>
    ` : u;
  }
  _renderStatusBadge(a) {
    const t = { aguardando_assinatura: "warning", assinado: "positive", cancelado: "danger" }[a.status] ?? "default";
    return l`
      <uui-badge color=${t}>${this._statusLabel(a.status)}</uui-badge>
      ${a.certificado_ativo === !0 ? l`<br /><small style="color:var(--uui-color-positive-standalone)">&#10003; Certificado Ativo</small>` : u}
      ${a.certificado_ativo === !1 ? l`<br /><small style="color:var(--uui-color-warning-standalone)">&#9888; Certificado Inativo</small>` : u}
    `;
  }
  render() {
    const a = this._stats, e = this._filteredDocs;
    return l`
      ${this._renderConfirm()}
      <uui-box headline="e-Not Assina &ndash; Gerenciador de Assinaturas Eletr&ocirc;nicas Notarizadas">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-label">Total</div>
            <div class="stat-value">${a.total}</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-label">Aguardando</div>
            <div class="stat-value">${a.aguardando}</div>
          </div>
          <div class="stat-card positive">
            <div class="stat-label">Assinados</div>
            <div class="stat-value">${a.assinados}</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-label">Cancelados</div>
            <div class="stat-value">${a.cancelados}</div>
          </div>
        </div>

        <div class="filters-row">
          <uui-input
            placeholder="Buscar por ID, raz&atilde;o social, CPF ou e-mail..."
            .value=${this._search}
            @input=${(t) => this._search = t.target.value}
            style="flex:1;"
          >
          </uui-input>
          <select class="umb-select" @change=${(t) => this._statusFilter = t.target.value}>
            <option value="">Todos os status</option>
            <option value="aguardando_assinatura">Aguardando Assinatura</option>
            <option value="assinado">Assinado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <uui-button look="secondary" @click=${this._loadDocuments} ?disabled=${this._loading}>
            <uui-icon name="icon-refresh"></uui-icon> Atualizar
          </uui-button>
        </div>

        ${this._loading ? l`<uui-loader-bar></uui-loader-bar>` : u}
        ${this._error ? l`<uui-tag color="danger">Erro: ${this._error}</uui-tag>` : u}

        <uui-table>
          <uui-table-head>
            <uui-table-head-cell>Loc. ID</uui-table-head-cell>
            <uui-table-head-cell>Doc ID</uui-table-head-cell>
            <uui-table-head-cell>Raz&atilde;o Social / CNPJ</uui-table-head-cell>
            <uui-table-head-cell>Signat&aacute;rio</uui-table-head-cell>
            <uui-table-head-cell>Status</uui-table-head-cell>
            <uui-table-head-cell>Cart&oacute;rio</uui-table-head-cell>
            <uui-table-head-cell>Criado Em</uui-table-head-cell>
            <uui-table-head-cell>Assinado Em</uui-table-head-cell>
            <uui-table-head-cell>A&ccedil;&otilde;es</uui-table-head-cell>
          </uui-table-head>
          ${e.length === 0 && !this._loading ? l`
                <uui-table-row>
                  <uui-table-cell colspan="9" style="text-align:center;padding:40px;color:var(--uui-color-text-alt)">
                    Nenhum documento e-Not Assina encontrado.
                  </uui-table-cell>
                </uui-table-row>
              ` : u}
          ${e.map(
      (t) => l`
              <uui-table-row>
                <uui-table-cell>${t.locacao_id}</uui-table-cell>
                <uui-table-cell
                  ><code style="font-size:11px">${(t.cartorio_doc_id ?? "").substring(0, 14)}&hellip;</code></uui-table-cell
                >
                <uui-table-cell>
                  <strong>${t.razao_social}</strong><br />
                  <small style="color:var(--uui-color-text-alt)">${t.cnpj}</small>
                </uui-table-cell>
                <uui-table-cell>
                  <div>${t.nome_assinante}</div>
                  <small style="color:var(--uui-color-text-alt)"
                    >CPF: ${t.cpf_assinante}<br />${t.email_assinante}</small
                  >
                </uui-table-cell>
                <uui-table-cell>${this._renderStatusBadge(t)}</uui-table-cell>
                <uui-table-cell><small>${t.cartorio_emissor || "—"}</small></uui-table-cell>
                <uui-table-cell>${this._fmtDate(t.criado_em)}</uui-table-cell>
                <uui-table-cell>${this._fmtDate(t.assinado_em)}</uui-table-cell>
                <uui-table-cell>
                  <div class="actions-cell">
                    ${t.cartorio_link ? l`
                          <uui-button
                            look="secondary"
                            href="${t.cartorio_link}"
                            target="_blank"
                            label="Abrir no e-Not Assina"
                            title="Abrir no e-Not Assina"
                          >
                            <uui-icon name="icon-link"></uui-icon>
                          </uui-button>
                        ` : u}
                    ${t.pdf_blob_url ? l`
                          <uui-button
                            look="secondary"
                            color="positive"
                            @click=${() => window.open(t.pdf_blob_url, "_blank")}
                            label="Baixar PDF"
                            title="Baixar PDF assinado"
                          >
                            <uui-icon name="icon-download"></uui-icon>
                          </uui-button>
                        ` : u}
                    ${t.status === "aguardando_assinatura" ? l`
                          <uui-button
                            look="secondary"
                            @click=${() => this._checkStatus(t.cartorio_doc_id)}
                            label="Verificar status"
                            title="Verificar status"
                          >
                            <uui-icon name="icon-refresh"></uui-icon>
                          </uui-button>
                          <uui-button
                            look="secondary"
                            color="danger"
                            @click=${() => this._confirmCancel(t.cartorio_doc_id, t.razao_social)}
                            label="Cancelar fluxo"
                            title="Cancelar fluxo de assinatura"
                          >
                            <uui-icon name="icon-delete"></uui-icon>
                          </uui-button>
                        ` : u}
                  </div>
                </uui-table-cell>
              </uui-table-row>
            `
    )}
        </uui-table>
        <div style="margin-top:8px;color:var(--uui-color-text-alt);font-size:12px">
          Mostrando ${e.length} de ${this._documents.length} documento(s)
        </div>
      </uui-box>
    `;
  }
};
r.styles = _`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    .stats-row {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .stat-card {
      flex: 1;
      min-width: 120px;
      padding: 16px;
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      text-align: center;
      background: var(--uui-color-surface);
    }

    .stat-label {
      font-size: 12px;
      color: var(--uui-color-text-alt);
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: var(--uui-color-text);
    }

    .stat-card.warning .stat-value {
      color: var(--uui-color-warning-standalone);
    }

    .stat-card.positive .stat-value {
      color: var(--uui-color-positive-standalone);
    }

    .stat-card.danger .stat-value {
      color: var(--uui-color-danger-standalone);
    }

    .filters-row {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .umb-select {
      padding: var(--uui-size-2) var(--uui-size-3);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      background: var(--uui-color-surface);
      color: var(--uui-color-text);
      font-size: 14px;
    }

    .actions-cell {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      align-items: center;
    }

    .confirm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .confirm-dialog {
      background: var(--uui-color-surface);
      padding: 32px;
      border-radius: var(--uui-border-radius);
      max-width: 480px;
      width: 90%;
      box-shadow: var(--uui-shadow-depth-3);
    }

    .confirm-dialog h3 {
      margin: 0 0 12px;
    }

    .confirm-warning {
      color: var(--uui-color-danger-standalone);
      font-size: 13px;
    }

    .confirm-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 20px;
    }
  `;
c([
  d()
], r.prototype, "_loading", 2);
c([
  d()
], r.prototype, "_error", 2);
c([
  d()
], r.prototype, "_documents", 2);
c([
  d()
], r.prototype, "_search", 2);
c([
  d()
], r.prototype, "_statusFilter", 2);
c([
  d()
], r.prototype, "_confirmDialog", 2);
r = c([
  b("enotassina-dashboard")
], r);
const k = r;
export {
  r as EnotAssinaDashboardElement,
  k as default
};
