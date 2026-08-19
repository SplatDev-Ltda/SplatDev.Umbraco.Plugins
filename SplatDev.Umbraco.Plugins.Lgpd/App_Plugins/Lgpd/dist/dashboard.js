import { LitElement as y, nothing as c, html as o, css as w, state as p, customElement as k } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as D } from "@umbraco-cms/backoffice/element-api";
var I = Object.defineProperty, E = Object.getOwnPropertyDescriptor, v = (e) => {
  throw TypeError(e);
}, u = (e, i, t, a) => {
  for (var n = a > 1 ? void 0 : a ? E(i, t) : i, b = e.length - 1, g; b >= 0; b--)
    (g = e[b]) && (n = (a ? g(i, t, n) : g(n)) || n);
  return a && n && I(i, t, n), n;
}, q = (e, i, t) => i.has(e) || v("Cannot " + t), O = (e, i, t) => i.has(e) ? v("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(e) : i.set(e, t), l = (e, i, t) => (q(e, i, "access private method"), t), s, m, h, d, f, _, $;
const C = {
  confirmacao: "Confirmação de tratamento (art. 18, I)",
  acesso: "Acesso aos dados (II)",
  correcao: "Correção (III)",
  anonimizacao_bloqueio_eliminacao: "Anonimização, bloqueio ou eliminação (IV)",
  portabilidade: "Portabilidade (V)",
  eliminacao_consentimento: "Eliminação de dados consentidos (VI)",
  informacao_compartilhamento: "Informação sobre compartilhamento (VII)",
  informacao_nao_consentir: "Informação sobre não consentir (VIII)",
  revogacao: "Revogação do consentimento (IX)"
}, x = {
  consentimento: "Consentimento (art. 7, I)",
  obrigacao_legal: "Obrigação legal (II)",
  politicas_publicas: "Políticas públicas (III)",
  estudo_pesquisa: "Estudo por órgão de pesquisa (IV)",
  execucao_contrato: "Execução de contrato (V)",
  exercicio_direitos: "Exercício de direitos em processo (VI)",
  protecao_vida: "Proteção da vida (VII)",
  tutela_saude: "Tutela da saúde (VIII)",
  legitimo_interesse: "Legítimo interesse (IX)",
  protecao_credito: "Proteção do crédito (X)"
}, L = {
  id: 0,
  nome: "",
  finalidade: "",
  baseLegal: "consentimento",
  categoriasDados: "",
  contemDadoSensivel: !1,
  compartilhamento: "",
  retencao: "",
  ativa: !0
};
let r = class extends D(y) {
  constructor() {
    super(...arguments), O(this, s), this._painel = null, this._vocab = null, this._requisicoes = [], this._operacoes = [], this._filtro = "pendente", this._opDraft = null, this._loading = !0, this._busy = !1, this._msg = null, this._api = "/umbraco/api/lgpd";
  }
  connectedCallback() {
    super.connectedCallback(), l(this, s, m).call(this);
  }
  render() {
    var i;
    const e = this._painel;
    return o`
      <h1>LGPD</h1>
      <p class="description">
        Consentimento, requisições de titulares e o registro das operações de tratamento,
        conforme a Lei nº 13.709/2018. O consentimento é acumulativo: cada mudança fica
        registrada, porque o art. 8º §1º atribui ao controlador o ônus de comprová-lo.
      </p>

      ${e != null && e.encarregadoAusente ? o`<div class="aviso">
                 <strong>Encarregado não configurado.</strong>
                 O art. 41 §1º exige que a identidade e o contato do encarregado sejam
                 divulgados publicamente. Defina <code>Lgpd:EncarregadoNome</code> e
                 <code>Lgpd:EncarregadoEmail</code> nas configurações do site.
               </div>` : c}

      ${this._loading ? o`<uui-loader></uui-loader>` : c}

      ${e ? o`
            <uui-box headline="Situação">
              <div class="stats">
                ${l(this, s, d).call(this, e.requisicoesVencidas, "requisições vencidas", e.requisicoesVencidas > 0 ? "alert" : "")}
                ${l(this, s, d).call(this, e.requisicoesVencendoEm3Dias, "vencem em 3 dias", e.requisicoesVencendoEm3Dias > 0 ? "warn" : "")}
                ${l(this, s, d).call(this, e.requisicoesPendentes, "em aberto")}
                ${l(this, s, d).call(this, e.sessoes, "sessões")}
                ${l(this, s, d).call(this, e.consentimentosConcedidos, "consentimentos")}
                ${l(this, s, d).call(this, e.consentimentosRecusados, "recusas")}
                ${l(this, s, d).call(this, e.operacoesAtivas, "operações ativas")}
                ${l(this, s, d).call(this, e.operacoesComDadoSensivel, "com dado sensível", e.operacoesComDadoSensivel > 0 ? "warn" : "")}
              </div>
              <p class="hint" style="margin-top:12px;">
                ${e.registrosMantidos} registro(s) de consentimento mantidos${e.registroMaisAntigo ? o`, mais antigo de ${new Date(e.registroMaisAntigo).toLocaleDateString()}` : c}.
                Prazo legal de resposta: ${((i = this._vocab) == null ? void 0 : i.prazoRespostaDias) ?? 15} dias (art. 19).
              </p>
            </uui-box>` : c}

      ${this._msg ? o`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.texto}</div>` : c}

      ${l(this, s, _).call(this)}

      <uui-box headline="Registro de operações de tratamento (art. 37)" style="margin-top:16px;">
        <div class="row">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${() => this._opDraft = { ...L }}>Nova operação</uui-button>
        </div>

        ${this._operacoes.length === 0 ? o`<p class="empty">
                   Nenhuma operação registrada. O art. 37 obriga o controlador a manter este
                   registro, e é a primeira coisa que a ANPD solicita.
                 </p>` : o`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Operação</uui-table-head-cell>
                  <uui-table-head-cell>Base legal</uui-table-head-cell>
                  <uui-table-head-cell>Dados</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._operacoes.map((t) => o`
                  <uui-table-row>
                    <uui-table-cell>
                      <strong>${t.nome}</strong>
                      ${t.ativa ? c : o`<uui-tag look="secondary">inativa</uui-tag>`}
                      <div class="hint">${t.finalidade}</div>
                    </uui-table-cell>
                    <uui-table-cell class="hint">${x[t.baseLegal] ?? t.baseLegal}</uui-table-cell>
                    <uui-table-cell class="hint">
                      ${t.categoriasDados ?? "—"}
                      ${t.contemDadoSensivel ? o`<div><uui-tag look="warning">dado sensível</uui-tag></div>` : c}
                    </uui-table-cell>
                    <uui-table-cell style="text-align:right;white-space:nowrap;">
                      <uui-button look="secondary" compact
                        @click=${() => this._opDraft = { ...t }}>Editar</uui-button>
                      <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                        @click=${() => confirm(`Remover "${t.nome}" do registro?`) && l(this, s, h).call(this, `RemoverOperacao?id=${t.id}`, void 0, "DELETE")}>Remover</uui-button>
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`}
      </uui-box>

      ${l(this, s, $).call(this)}
    `;
  }
};
s = /* @__PURE__ */ new WeakSet();
m = async function() {
  this._loading = !0;
  try {
    const [e, i, t, a] = await Promise.all([
      fetch(`${this._api}/Painel`, { credentials: "same-origin" }),
      fetch(`${this._api}/Vocabulario`, { credentials: "same-origin" }),
      fetch(`${this._api}/Requisicoes?status=${encodeURIComponent(this._filtro)}`, { credentials: "same-origin" }),
      fetch(`${this._api}/Operacoes`, { credentials: "same-origin" })
    ]);
    e.ok && (this._painel = await e.json()), i.ok && (this._vocab = await i.json()), t.ok && (this._requisicoes = await t.json()), a.ok && (this._operacoes = await a.json());
  } finally {
    this._loading = !1;
  }
};
h = async function(e, i, t = "POST") {
  this._busy = !0, this._msg = null;
  try {
    const a = await fetch(`${this._api}/${e}`, {
      method: t,
      credentials: "same-origin",
      headers: i ? { "Content-Type": "application/json" } : void 0,
      body: i ? JSON.stringify(i) : void 0
    }), n = await a.json();
    return this._msg = { ok: a.ok, texto: n.mensagem ?? (a.ok ? "Feito." : "Falhou.") }, a.ok && await l(this, s, m).call(this), a.ok;
  } catch (a) {
    return this._msg = { ok: !1, texto: `A requisição falhou: ${a.message}` }, !1;
  } finally {
    this._busy = !1;
  }
};
d = function(e, i, t = "") {
  return o`<div class="stat ${t}"><div class="n">${e}</div><div class="l">${i}</div></div>`;
};
f = function(e) {
  return Math.ceil((Date.parse(e) - Date.now()) / 864e5);
};
_ = function() {
  return o`
      <uui-box headline="Requisições de titulares (art. 18)" style="margin-top:16px;">
        <div class="row">
          ${["pendente", "em_andamento", "concluida", "recusada", ""].map((e) => o`
            <uui-button look=${this._filtro === e ? "primary" : "secondary"} compact
              @click=${async () => {
    this._filtro = e, await l(this, s, m).call(this);
  }}>
              ${e === "" ? "Todas" : e.replace("_", " ")}
            </uui-button>`)}
        </div>

        ${this._requisicoes.length === 0 ? o`<p class="empty">Nenhuma requisição.</p>` : o`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Titular</uui-table-head-cell>
                  <uui-table-head-cell>Direito</uui-table-head-cell>
                  <uui-table-head-cell>Prazo</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._requisicoes.map((e) => {
    const i = l(this, s, f).call(this, e.prazoEm), t = e.status === "pendente" || e.status === "em_andamento";
    return o`
                    <uui-table-row>
                      <uui-table-cell>
                        <span class="mono">${e.email}</span>
                        ${e.nome ? o`<div class="hint">${e.nome}</div>` : c}
                      </uui-table-cell>
                      <uui-table-cell class="hint">
                        ${C[e.direito] ?? e.direito}
                      </uui-table-cell>
                      <uui-table-cell class=${t && i < 0 ? "vencida" : ""}>
                        ${new Date(e.prazoEm).toLocaleDateString()}
                        ${t ? o`<div class="hint">
                                   ${i < 0 ? `${Math.abs(i)} dia(s) em atraso` : `${i} dia(s)`}
                                 </div>` : c}
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-tag look=${e.status === "concluida" ? "positive" : e.status === "recusada" || t && i < 0 ? "danger" : "warning"}>
                          ${e.status.replace("_", " ")}
                        </uui-tag>
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        ${t ? o`
                              <uui-button look="secondary" compact ?disabled=${this._busy}
                                @click=${() => l(this, s, h).call(this, "AtualizarRequisicao", { id: e.id, status: "concluida", justificativa: null })}>
                                Concluir</uui-button>
                              <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                                @click=${() => {
      const a = prompt("Justificativa da recusa (art. 18, §4º):");
      a && a.trim() && l(this, s, h).call(this, "AtualizarRequisicao", { id: e.id, status: "recusada", justificativa: a.trim() });
    }}>Recusar</uui-button>` : e.justificativa ? o`<span class="hint">${e.justificativa}</span>` : c}
                      </uui-table-cell>
                    </uui-table-row>`;
  })}
              </uui-table>`}
      </uui-box>`;
};
$ = function() {
  var t;
  const e = this._opDraft;
  if (!e) return c;
  const i = (a, n) => this._opDraft = { ...e, [a]: n };
  return o`
      <uui-box headline=${e.id > 0 ? `Editar: ${e.nome}` : "Nova operação"} style="margin-top:16px;">
        <div class="row">
          <div class="field grow">
            <label for="on">Nome</label>
            <input id="on" .value=${e.nome}
              @input=${(a) => i("nome", a.target.value)} />
          </div>
          <div class="field">
            <label for="ob">Base legal (art. 7º)</label>
            <select id="ob" .value=${e.baseLegal}
              @change=${(a) => i("baseLegal", a.target.value)}>
              ${(((t = this._vocab) == null ? void 0 : t.basesLegais) ?? []).map((a) => o`<option value=${a}>${x[a] ?? a}</option>`)}
            </select>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field grow">
            <label for="of">Finalidade</label>
            <textarea id="of" .value=${e.finalidade}
              @input=${(a) => i("finalidade", a.target.value)}></textarea>
          </div>
          <div class="field grow">
            <label for="oc">Compartilhamento <span class="hint">(art. 18, VII)</span></label>
            <textarea id="oc" .value=${e.compartilhamento ?? ""}
              @input=${(a) => i("compartilhamento", a.target.value)}></textarea>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field grow">
            <label for="od">Categorias de dados</label>
            <input id="od" .value=${e.categoriasDados ?? ""}
              @input=${(a) => i("categoriasDados", a.target.value)} />
          </div>
          <div class="field">
            <label for="or">Retenção</label>
            <input id="or" .value=${e.retencao ?? ""}
              @input=${(a) => i("retencao", a.target.value)} />
          </div>
          <div class="field">
            <label>Dado sensível (art. 5º, II)</label>
            <uui-toggle ?checked=${e.contemDadoSensivel}
              @change=${(a) => i("contemDadoSensivel", a.target.checked)}></uui-toggle>
          </div>
          <div class="field">
            <label>Ativa</label>
            <uui-toggle ?checked=${e.ativa}
              @change=${(a) => i("ativa", a.target.checked)}></uui-toggle>
          </div>
        </div>

        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${async () => {
    await l(this, s, h).call(this, "SalvarOperacao", this._opDraft) && (this._opDraft = null);
  }}>
            ${this._busy ? "Salvando…" : "Salvar"}
          </uui-button>
          <uui-button look="secondary" @click=${() => this._opDraft = null}>Cancelar</uui-button>
        </div>
      </uui-box>`;
};
r.styles = w`
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
  `;
u([
  p()
], r.prototype, "_painel", 2);
u([
  p()
], r.prototype, "_vocab", 2);
u([
  p()
], r.prototype, "_requisicoes", 2);
u([
  p()
], r.prototype, "_operacoes", 2);
u([
  p()
], r.prototype, "_filtro", 2);
u([
  p()
], r.prototype, "_opDraft", 2);
u([
  p()
], r.prototype, "_loading", 2);
u([
  p()
], r.prototype, "_busy", 2);
u([
  p()
], r.prototype, "_msg", 2);
r = u([
  k("lgpd-dashboard")
], r);
const z = r;
export {
  r as LgpdDashboardElement,
  z as default
};
