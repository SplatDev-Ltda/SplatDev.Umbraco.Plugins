import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface Painel {
  sessoes: number;
  consentimentosConcedidos: number;
  consentimentosRecusados: number;
  registrosMantidos: number;
  registroMaisAntigo: string | null;
  requisicoesPendentes: number;
  requisicoesVencidas: number;
  requisicoesVencendoEm3Dias: number;
  operacoesAtivas: number;
  operacoesComDadoSensivel: number;
  encarregadoAusente: boolean;
}

interface Requisicao {
  id: number; email: string; nome: string | null; direito: string;
  detalhe: string | null; status: string;
  recebidaEm: string; prazoEm: string; respondidaEm: string | null;
  justificativa: string | null;
}

interface Operacao {
  id: number; nome: string; finalidade: string; baseLegal: string;
  categoriasDados: string | null; contemDadoSensivel: boolean;
  compartilhamento: string | null; retencao: string | null; ativa: boolean;
}

interface Vocabulario {
  basesLegais: string[]; direitos: string[]; status: string[]; prazoRespostaDias: number;
}

const ROTULO_DIREITO: Record<string, string> = {
  confirmacao: "Confirmação de tratamento (art. 18, I)",
  acesso: "Acesso aos dados (II)",
  correcao: "Correção (III)",
  anonimizacao_bloqueio_eliminacao: "Anonimização, bloqueio ou eliminação (IV)",
  portabilidade: "Portabilidade (V)",
  eliminacao_consentimento: "Eliminação de dados consentidos (VI)",
  informacao_compartilhamento: "Informação sobre compartilhamento (VII)",
  informacao_nao_consentir: "Informação sobre não consentir (VIII)",
  revogacao: "Revogação do consentimento (IX)",
};

const ROTULO_BASE: Record<string, string> = {
  consentimento: "Consentimento (art. 7, I)",
  obrigacao_legal: "Obrigação legal (II)",
  politicas_publicas: "Políticas públicas (III)",
  estudo_pesquisa: "Estudo por órgão de pesquisa (IV)",
  execucao_contrato: "Execução de contrato (V)",
  exercicio_direitos: "Exercício de direitos em processo (VI)",
  protecao_vida: "Proteção da vida (VII)",
  tutela_saude: "Tutela da saúde (VIII)",
  legitimo_interesse: "Legítimo interesse (IX)",
  protecao_credito: "Proteção do crédito (X)",
};

const OPERACAO_NOVA: Operacao = {
  id: 0, nome: "", finalidade: "", baseLegal: "consentimento",
  categoriasDados: "", contemDadoSensivel: false,
  compartilhamento: "", retencao: "", ativa: true,
};

/** LGPD compliance: consent, art. 18 requests, and the art. 37 record of operations. */
@customElement("lgpd-dashboard")
export class LgpdDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 20px; max-width: 66ch; }
    .stats { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
    .stat { border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; padding: 12px 14px; }
    .stat.alert { border-color: #dc2626; background: #fef2f2; }
    .stat.warn { border-color: #d97706; background: #fffbeb; }
    .stat .n { font-size: 1.6rem; font-weight: 600; line-height: 1.1; }
    .stat .l { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-weight: 600; font-size: 0.8125rem; }
    .field input, .field select, .field textarea {
      padding: 8px; border: 1px solid var(--uui-color-border, #d1d5db);
      border-radius: 4px; font: inherit; min-width: 200px; box-sizing: border-box; }
    .field textarea { min-width: 320px; min-height: 64px; }
    .grow { flex: 1 1 260px; }
    .msg { padding: 10px 14px; border-radius: 4px; margin-top: 14px; }
    .msg.ok { background: #d1fae5; color: #065f46; }
    .msg.bad { background: #fee2e2; color: #991b1b; }
    .aviso { padding: 12px 14px; border-radius: 6px; background: #fef2f2; color: #991b1b;
             border: 1px solid #fecaca; margin-bottom: 16px; }
    .hint { color: var(--uui-color-text-alt, #6b7280); font-size: 0.8125rem; }
    .mono { font-family: var(--uui-font-monospace, monospace); font-size: 0.8125rem; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 12px 0; }
    .vencida { color: #991b1b; font-weight: 600; }
    uui-table { width: 100%; }
  
    .splatdev-load-error {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin: 0 0 16px;
      padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem;
      border-radius: 3px;
    }
  `;

  @state() private _painel: Painel | null = null;
  @state() private _vocab: Vocabulario | null = null;
  @state() private _requisicoes: Requisicao[] = [];
  @state() private _operacoes: Operacao[] = [];
  @state() private _filtro = "pendente";
  @state() private _opDraft: Operacao | null = null;
  @state() private _loading = true;
  @state() private _busy = false;
  @state() private _msg: { ok: boolean; texto: string } | null = null;

  @state() private _loadError: string | null = null;

  private readonly _api = "/umbraco/api/lgpd";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#load();
  }

  async #load(): Promise<void> {
    this._loading = true;
    try {
      const [p, v, r, o] = await Promise.all([
        this.#fetch(`${this._api}/Painel`, { credentials: "same-origin" }),
        this.#fetch(`${this._api}/Vocabulario`, { credentials: "same-origin" }),
        this.#fetch(`${this._api}/Requisicoes?status=${encodeURIComponent(this._filtro)}`, { credentials: "same-origin" }),
        this.#fetch(`${this._api}/Operacoes`, { credentials: "same-origin" }),
      ]);
      if (this.#responseOk(p)) this._painel = await p.json();
      if (this.#responseOk(v)) this._vocab = await v.json();
      if (this.#responseOk(r)) this._requisicoes = await r.json();
      if (this.#responseOk(o)) this._operacoes = await o.json();
    } finally {
      this._loading = false;
    }
  }

  async #post(path: string, body?: unknown, method = "POST"): Promise<boolean> {
    this._busy = true;
    this._msg = null;
    try {
      const res = await this.#fetch(`${this._api}/${path}`, {
        method,
        credentials: "same-origin",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      this._msg = { ok: res.ok, texto: data.mensagem ?? (res.ok ? "Feito." : "Falhou.") };
      if (this.#responseOk(res)) await this.#load();
      return res.ok;
    } catch (e) {
      this._msg = { ok: false, texto: `A requisição falhou: ${(e as Error).message}` };
      return false;
    } finally {
      this._busy = false;
    }
  }

  #stat(n: number, label: string, tone: "" | "alert" | "warn" = "") {
    return html`<div class="stat ${tone}"><div class="n">${n}</div><div class="l">${label}</div></div>`;
  }

  #diasRestantes(prazo: string): number {
    return Math.ceil((Date.parse(prazo) - Date.now()) / 86_400_000);
  }

  #renderRequisicoes() {
    return html`
      <uui-box headline="Requisições de titulares (art. 18)" style="margin-top:16px;">
        <div class="row">
          ${["pendente", "em_andamento", "concluida", "recusada", ""].map(f => html`
            <uui-button look=${this._filtro === f ? "primary" : "secondary"} compact
              @click=${async () => { this._filtro = f; await this.#load(); }}>
              ${f === "" ? "Todas" : f.replace("_", " ")}
            </uui-button>`)}
        </div>

        ${this._requisicoes.length === 0
          ? html`<p class="empty">Nenhuma requisição.</p>`
          : html`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Titular</uui-table-head-cell>
                  <uui-table-head-cell>Direito</uui-table-head-cell>
                  <uui-table-head-cell>Prazo</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._requisicoes.map(r => {
                  const dias = this.#diasRestantes(r.prazoEm);
                  const aberta = r.status === "pendente" || r.status === "em_andamento";
                  return html`
                    <uui-table-row>
                      <uui-table-cell>
                        <span class="mono">${r.email}</span>
                        ${r.nome ? html`<div class="hint">${r.nome}</div>` : nothing}
                      </uui-table-cell>
                      <uui-table-cell class="hint">
                        ${ROTULO_DIREITO[r.direito] ?? r.direito}
                      </uui-table-cell>
                      <uui-table-cell class=${aberta && dias < 0 ? "vencida" : ""}>
                        ${new Date(r.prazoEm).toLocaleDateString()}
                        ${aberta
                          ? html`<div class="hint">
                                   ${dias < 0 ? `${Math.abs(dias)} dia(s) em atraso` : `${dias} dia(s)`}
                                 </div>`
                          : nothing}
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-tag look=${r.status === "concluida" ? "positive"
                                       : r.status === "recusada" ? "danger"
                                       : aberta && dias < 0 ? "danger" : "warning"}>
                          ${r.status.replace("_", " ")}
                        </uui-tag>
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        ${aberta
                          ? html`
                              <uui-button look="secondary" compact ?disabled=${this._busy}
                                @click=${() => this.#post("AtualizarRequisicao",
                                  { id: r.id, status: "concluida", justificativa: null })}>
                                Concluir</uui-button>
                              <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                                @click=${() => {
                                  // Art. 18 §4 requires a reasoned refusal, so the API rejects
                                  // a blank one — ask here rather than let it round-trip and fail.
                                  const j = prompt("Justificativa da recusa (art. 18, §4º):");
                                  if (j && j.trim())
                                    this.#post("AtualizarRequisicao",
                                      { id: r.id, status: "recusada", justificativa: j.trim() });
                                }}>Recusar</uui-button>`
                          : r.justificativa
                            ? html`<span class="hint">${r.justificativa}</span>`
                            : nothing}
                      </uui-table-cell>
                    </uui-table-row>`;
                })}
              </uui-table>`}
      </uui-box>`;
  }

  #renderOperacaoForm() {
    const o = this._opDraft;
    if (!o) return nothing;
    const set = <K extends keyof Operacao>(k: K, v: Operacao[K]) => (this._opDraft = { ...o, [k]: v });

    return html`
      <uui-box headline=${o.id > 0 ? `Editar: ${o.nome}` : "Nova operação"} style="margin-top:16px;">
        <div class="row">
          <div class="field grow">
            <label for="on">Nome</label>
            <input id="on" .value=${o.nome}
              @input=${(e: InputEvent) => set("nome", (e.target as HTMLInputElement).value)} />
          </div>
          <div class="field">
            <label for="ob">Base legal (art. 7º)</label>
            <select id="ob" .value=${o.baseLegal}
              @change=${(e: Event) => set("baseLegal", (e.target as HTMLSelectElement).value)}>
              ${(this._vocab?.basesLegais ?? []).map(b =>
                html`<option value=${b}>${ROTULO_BASE[b] ?? b}</option>`)}
            </select>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field grow">
            <label for="of">Finalidade</label>
            <textarea id="of" .value=${o.finalidade}
              @input=${(e: InputEvent) => set("finalidade", (e.target as HTMLTextAreaElement).value)}></textarea>
          </div>
          <div class="field grow">
            <label for="oc">Compartilhamento <span class="hint">(art. 18, VII)</span></label>
            <textarea id="oc" .value=${o.compartilhamento ?? ""}
              @input=${(e: InputEvent) => set("compartilhamento", (e.target as HTMLTextAreaElement).value)}></textarea>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field grow">
            <label for="od">Categorias de dados</label>
            <input id="od" .value=${o.categoriasDados ?? ""}
              @input=${(e: InputEvent) => set("categoriasDados", (e.target as HTMLInputElement).value)} />
          </div>
          <div class="field">
            <label for="or">Retenção</label>
            <input id="or" .value=${o.retencao ?? ""}
              @input=${(e: InputEvent) => set("retencao", (e.target as HTMLInputElement).value)} />
          </div>
          <div class="field">
            <label>Dado sensível (art. 5º, II)</label>
            <uui-toggle ?checked=${o.contemDadoSensivel}
              @change=${(e: Event) => set("contemDadoSensivel", (e.target as HTMLInputElement).checked)}></uui-toggle>
          </div>
          <div class="field">
            <label>Ativa</label>
            <uui-toggle ?checked=${o.ativa}
              @change=${(e: Event) => set("ativa", (e.target as HTMLInputElement).checked)}></uui-toggle>
          </div>
        </div>

        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${async () => { if (await this.#post("SalvarOperacao", this._opDraft)) this._opDraft = null; }}>
            ${this._busy ? "Salvando…" : "Salvar"}
          </uui-button>
          <uui-button look="secondary" @click=${() => (this._opDraft = null)}>Cancelar</uui-button>
        </div>
      </uui-box>`;
  }

  /**
   * Guards a response and records why it failed.
   *
   * This used to be a bare `response.ok` check with no else branch, so a failed request
   * left the previous (usually empty) state on screen and read as "there is no data"
   * rather than "the request did not succeed".
   */
  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }

    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }


  override render() {
    const p = this._painel;
    return html`
      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : ""}
      <h1>LGPD</h1>
      <p class="description">
        Consentimento, requisições de titulares e o registro das operações de tratamento,
        conforme a Lei nº 13.709/2018. O consentimento é acumulativo: cada mudança fica
        registrada, porque o art. 8º §1º atribui ao controlador o ônus de comprová-lo.
      </p>

      ${p?.encarregadoAusente
        ? html`<div class="aviso">
                 <strong>Encarregado não configurado.</strong>
                 O art. 41 §1º exige que a identidade e o contato do encarregado sejam
                 divulgados publicamente. Defina <code>Lgpd:EncarregadoNome</code> e
                 <code>Lgpd:EncarregadoEmail</code> nas configurações do site.
               </div>`
        : nothing}

      ${this._loading ? html`<uui-loader></uui-loader>` : nothing}

      ${p
        ? html`
            <uui-box headline="Situação">
              <div class="stats">
                ${this.#stat(p.requisicoesVencidas, "requisições vencidas", p.requisicoesVencidas > 0 ? "alert" : "")}
                ${this.#stat(p.requisicoesVencendoEm3Dias, "vencem em 3 dias", p.requisicoesVencendoEm3Dias > 0 ? "warn" : "")}
                ${this.#stat(p.requisicoesPendentes, "em aberto")}
                ${this.#stat(p.sessoes, "sessões")}
                ${this.#stat(p.consentimentosConcedidos, "consentimentos")}
                ${this.#stat(p.consentimentosRecusados, "recusas")}
                ${this.#stat(p.operacoesAtivas, "operações ativas")}
                ${this.#stat(p.operacoesComDadoSensivel, "com dado sensível", p.operacoesComDadoSensivel > 0 ? "warn" : "")}
              </div>
              <p class="hint" style="margin-top:12px;">
                ${p.registrosMantidos} registro(s) de consentimento mantidos${p.registroMaisAntigo
                  ? html`, mais antigo de ${new Date(p.registroMaisAntigo).toLocaleDateString()}`
                  : nothing}.
                Prazo legal de resposta: ${this._vocab?.prazoRespostaDias ?? 15} dias (art. 19).
              </p>
            </uui-box>`
        : nothing}

      ${this._msg
        ? html`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.texto}</div>`
        : nothing}

      ${this.#renderRequisicoes()}

      <uui-box headline="Registro de operações de tratamento (art. 37)" style="margin-top:16px;">
        <div class="row">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${() => (this._opDraft = { ...OPERACAO_NOVA })}>Nova operação</uui-button>
        </div>

        ${this._operacoes.length === 0
          ? html`<p class="empty">
                   Nenhuma operação registrada. O art. 37 obriga o controlador a manter este
                   registro, e é a primeira coisa que a ANPD solicita.
                 </p>`
          : html`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Operação</uui-table-head-cell>
                  <uui-table-head-cell>Base legal</uui-table-head-cell>
                  <uui-table-head-cell>Dados</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._operacoes.map(o => html`
                  <uui-table-row>
                    <uui-table-cell>
                      <strong>${o.nome}</strong>
                      ${!o.ativa ? html`<uui-tag look="secondary">inativa</uui-tag>` : nothing}
                      <div class="hint">${o.finalidade}</div>
                    </uui-table-cell>
                    <uui-table-cell class="hint">${ROTULO_BASE[o.baseLegal] ?? o.baseLegal}</uui-table-cell>
                    <uui-table-cell class="hint">
                      ${o.categoriasDados ?? "—"}
                      ${o.contemDadoSensivel
                        ? html`<div><uui-tag look="warning">dado sensível</uui-tag></div>`
                        : nothing}
                    </uui-table-cell>
                    <uui-table-cell style="text-align:right;white-space:nowrap;">
                      <uui-button look="secondary" compact
                        @click=${() => (this._opDraft = { ...o })}>Editar</uui-button>
                      <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                        @click=${() => confirm(`Remover "${o.nome}" do registro?`)
                          && this.#post(`RemoverOperacao?id=${o.id}`, undefined, "DELETE")}>Remover</uui-button>
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`}
      </uui-box>

      ${this.#renderOperacaoForm()}
    `;
  }
}

export default LgpdDashboardElement;

declare global {
  interface HTMLElementTagNameMap { "lgpd-dashboard": LgpdDashboardElement; }
}
