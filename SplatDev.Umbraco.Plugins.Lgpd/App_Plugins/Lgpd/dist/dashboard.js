import { LitElement as A, nothing as d, html as o, css as L, state as m, customElement as T } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as R } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as S } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as z } from "@umbraco-cms/backoffice/notification";
function P(e) {
  let a = null, i = null;
  const t = e.consumeContext.bind(e), r = new Promise((u) => {
    t(S, async (c) => {
      var f;
      try {
        a = await ((f = c == null ? void 0 : c.getLatestToken) == null ? void 0 : f.call(c)) ?? null;
      } catch {
        a = null;
      }
      u();
    }), setTimeout(u, 3e3);
  });
  return t(z, (u) => {
    i = u;
  }), async (u, c = {}) => {
    await r;
    const f = new Headers(c.headers);
    a && !f.has("Authorization") && f.set("Authorization", `Bearer ${a}`);
    const b = await fetch(u, { ...c, credentials: "same-origin", headers: f });
    if (!b.ok) {
      const x = b.status === 401 || b.status === 403, C = x ? "Not authorised" : "Could not load data", y = x ? `The backoffice token was ${a ? "sent but rejected" : "not available"} (${b.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${b.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${b.status} from ${String(u)} — ${y}`), i == null || i.peek("danger", { data: { headline: C, message: y } });
    }
    return b;
  };
}
var V = Object.defineProperty, N = Object.getOwnPropertyDescriptor, k = (e) => {
  throw TypeError(e);
}, p = (e, a, i, t) => {
  for (var r = t > 1 ? void 0 : t ? N(a, i) : a, u = e.length - 1, c; u >= 0; u--)
    (c = e[u]) && (r = (t ? c(a, i, r) : c(r)) || r);
  return t && r && V(a, i, r), r;
}, D = (e, a, i) => a.has(e) || k("Cannot " + i), v = (e, a, i) => (D(e, a, "read from private field"), i ? i.call(e) : a.get(e)), w = (e, a, i) => a.has(e) ? k("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, i), l = (e, a, i) => (D(e, a, "access private method"), i), g, s, $, _, h, I, E, q;
const j = {
  confirmacao: "Confirmação de tratamento (art. 18, I)",
  acesso: "Acesso aos dados (II)",
  correcao: "Correção (III)",
  anonimizacao_bloqueio_eliminacao: "Anonimização, bloqueio ou eliminação (IV)",
  portabilidade: "Portabilidade (V)",
  eliminacao_consentimento: "Eliminação de dados consentidos (VI)",
  informacao_compartilhamento: "Informação sobre compartilhamento (VII)",
  informacao_nao_consentir: "Informação sobre não consentir (VIII)",
  revogacao: "Revogação do consentimento (IX)"
}, O = {
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
}, M = {
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
let n = class extends R(A) {
  constructor() {
    super(...arguments), w(this, s), w(this, g, P(this)), this._painel = null, this._vocab = null, this._requisicoes = [], this._operacoes = [], this._filtro = "pendente", this._opDraft = null, this._loading = !0, this._busy = !1, this._msg = null, this._api = "/umbraco/api/lgpd";
  }
  connectedCallback() {
    super.connectedCallback(), l(this, s, $).call(this);
  }
  render() {
    var a;
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
               </div>` : d}

      ${this._loading ? o`<uui-loader></uui-loader>` : d}

      ${e ? o`
            <uui-box headline="Situação">
              <div class="stats">
                ${l(this, s, h).call(this, e.requisicoesVencidas, "requisições vencidas", e.requisicoesVencidas > 0 ? "alert" : "")}
                ${l(this, s, h).call(this, e.requisicoesVencendoEm3Dias, "vencem em 3 dias", e.requisicoesVencendoEm3Dias > 0 ? "warn" : "")}
                ${l(this, s, h).call(this, e.requisicoesPendentes, "em aberto")}
                ${l(this, s, h).call(this, e.sessoes, "sessões")}
                ${l(this, s, h).call(this, e.consentimentosConcedidos, "consentimentos")}
                ${l(this, s, h).call(this, e.consentimentosRecusados, "recusas")}
                ${l(this, s, h).call(this, e.operacoesAtivas, "operações ativas")}
                ${l(this, s, h).call(this, e.operacoesComDadoSensivel, "com dado sensível", e.operacoesComDadoSensivel > 0 ? "warn" : "")}
              </div>
              <p class="hint" style="margin-top:12px;">
                ${e.registrosMantidos} registro(s) de consentimento mantidos${e.registroMaisAntigo ? o`, mais antigo de ${new Date(e.registroMaisAntigo).toLocaleDateString()}` : d}.
                Prazo legal de resposta: ${((a = this._vocab) == null ? void 0 : a.prazoRespostaDias) ?? 15} dias (art. 19).
              </p>
            </uui-box>` : d}

      ${this._msg ? o`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.texto}</div>` : d}

      ${l(this, s, E).call(this)}

      <uui-box headline="Registro de operações de tratamento (art. 37)" style="margin-top:16px;">
        <div class="row">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${() => this._opDraft = { ...M }}>Nova operação</uui-button>
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
                ${this._operacoes.map((i) => o`
                  <uui-table-row>
                    <uui-table-cell>
                      <strong>${i.nome}</strong>
                      ${i.ativa ? d : o`<uui-tag look="secondary">inativa</uui-tag>`}
                      <div class="hint">${i.finalidade}</div>
                    </uui-table-cell>
                    <uui-table-cell class="hint">${O[i.baseLegal] ?? i.baseLegal}</uui-table-cell>
                    <uui-table-cell class="hint">
                      ${i.categoriasDados ?? "—"}
                      ${i.contemDadoSensivel ? o`<div><uui-tag look="warning">dado sensível</uui-tag></div>` : d}
                    </uui-table-cell>
                    <uui-table-cell style="text-align:right;white-space:nowrap;">
                      <uui-button look="secondary" compact
                        @click=${() => this._opDraft = { ...i }}>Editar</uui-button>
                      <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                        @click=${() => confirm(`Remover "${i.nome}" do registro?`) && l(this, s, _).call(this, `RemoverOperacao?id=${i.id}`, void 0, "DELETE")}>Remover</uui-button>
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`}
      </uui-box>

      ${l(this, s, q).call(this)}
    `;
  }
};
g = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
$ = async function() {
  this._loading = !0;
  try {
    const [e, a, i, t] = await Promise.all([
      v(this, g).call(this, `${this._api}/Painel`, { credentials: "same-origin" }),
      v(this, g).call(this, `${this._api}/Vocabulario`, { credentials: "same-origin" }),
      v(this, g).call(this, `${this._api}/Requisicoes?status=${encodeURIComponent(this._filtro)}`, { credentials: "same-origin" }),
      v(this, g).call(this, `${this._api}/Operacoes`, { credentials: "same-origin" })
    ]);
    e.ok && (this._painel = await e.json()), a.ok && (this._vocab = await a.json()), i.ok && (this._requisicoes = await i.json()), t.ok && (this._operacoes = await t.json());
  } finally {
    this._loading = !1;
  }
};
_ = async function(e, a, i = "POST") {
  this._busy = !0, this._msg = null;
  try {
    const t = await v(this, g).call(this, `${this._api}/${e}`, {
      method: i,
      credentials: "same-origin",
      headers: a ? { "Content-Type": "application/json" } : void 0,
      body: a ? JSON.stringify(a) : void 0
    }), r = await t.json();
    return this._msg = { ok: t.ok, texto: r.mensagem ?? (t.ok ? "Feito." : "Falhou.") }, t.ok && await l(this, s, $).call(this), t.ok;
  } catch (t) {
    return this._msg = { ok: !1, texto: `A requisição falhou: ${t.message}` }, !1;
  } finally {
    this._busy = !1;
  }
};
h = function(e, a, i = "") {
  return o`<div class="stat ${i}"><div class="n">${e}</div><div class="l">${a}</div></div>`;
};
I = function(e) {
  return Math.ceil((Date.parse(e) - Date.now()) / 864e5);
};
E = function() {
  return o`
      <uui-box headline="Requisições de titulares (art. 18)" style="margin-top:16px;">
        <div class="row">
          ${["pendente", "em_andamento", "concluida", "recusada", ""].map((e) => o`
            <uui-button look=${this._filtro === e ? "primary" : "secondary"} compact
              @click=${async () => {
    this._filtro = e, await l(this, s, $).call(this);
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
    const a = l(this, s, I).call(this, e.prazoEm), i = e.status === "pendente" || e.status === "em_andamento";
    return o`
                    <uui-table-row>
                      <uui-table-cell>
                        <span class="mono">${e.email}</span>
                        ${e.nome ? o`<div class="hint">${e.nome}</div>` : d}
                      </uui-table-cell>
                      <uui-table-cell class="hint">
                        ${j[e.direito] ?? e.direito}
                      </uui-table-cell>
                      <uui-table-cell class=${i && a < 0 ? "vencida" : ""}>
                        ${new Date(e.prazoEm).toLocaleDateString()}
                        ${i ? o`<div class="hint">
                                   ${a < 0 ? `${Math.abs(a)} dia(s) em atraso` : `${a} dia(s)`}
                                 </div>` : d}
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-tag look=${e.status === "concluida" ? "positive" : e.status === "recusada" || i && a < 0 ? "danger" : "warning"}>
                          ${e.status.replace("_", " ")}
                        </uui-tag>
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        ${i ? o`
                              <uui-button look="secondary" compact ?disabled=${this._busy}
                                @click=${() => l(this, s, _).call(this, "AtualizarRequisicao", { id: e.id, status: "concluida", justificativa: null })}>
                                Concluir</uui-button>
                              <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                                @click=${() => {
      const t = prompt("Justificativa da recusa (art. 18, §4º):");
      t && t.trim() && l(this, s, _).call(this, "AtualizarRequisicao", { id: e.id, status: "recusada", justificativa: t.trim() });
    }}>Recusar</uui-button>` : e.justificativa ? o`<span class="hint">${e.justificativa}</span>` : d}
                      </uui-table-cell>
                    </uui-table-row>`;
  })}
              </uui-table>`}
      </uui-box>`;
};
q = function() {
  var i;
  const e = this._opDraft;
  if (!e) return d;
  const a = (t, r) => this._opDraft = { ...e, [t]: r };
  return o`
      <uui-box headline=${e.id > 0 ? `Editar: ${e.nome}` : "Nova operação"} style="margin-top:16px;">
        <div class="row">
          <div class="field grow">
            <label for="on">Nome</label>
            <input id="on" .value=${e.nome}
              @input=${(t) => a("nome", t.target.value)} />
          </div>
          <div class="field">
            <label for="ob">Base legal (art. 7º)</label>
            <select id="ob" .value=${e.baseLegal}
              @change=${(t) => a("baseLegal", t.target.value)}>
              ${(((i = this._vocab) == null ? void 0 : i.basesLegais) ?? []).map((t) => o`<option value=${t}>${O[t] ?? t}</option>`)}
            </select>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field grow">
            <label for="of">Finalidade</label>
            <textarea id="of" .value=${e.finalidade}
              @input=${(t) => a("finalidade", t.target.value)}></textarea>
          </div>
          <div class="field grow">
            <label for="oc">Compartilhamento <span class="hint">(art. 18, VII)</span></label>
            <textarea id="oc" .value=${e.compartilhamento ?? ""}
              @input=${(t) => a("compartilhamento", t.target.value)}></textarea>
          </div>
        </div>

        <div class="row" style="margin-top:12px;">
          <div class="field grow">
            <label for="od">Categorias de dados</label>
            <input id="od" .value=${e.categoriasDados ?? ""}
              @input=${(t) => a("categoriasDados", t.target.value)} />
          </div>
          <div class="field">
            <label for="or">Retenção</label>
            <input id="or" .value=${e.retencao ?? ""}
              @input=${(t) => a("retencao", t.target.value)} />
          </div>
          <div class="field">
            <label>Dado sensível (art. 5º, II)</label>
            <uui-toggle ?checked=${e.contemDadoSensivel}
              @change=${(t) => a("contemDadoSensivel", t.target.checked)}></uui-toggle>
          </div>
          <div class="field">
            <label>Ativa</label>
            <uui-toggle ?checked=${e.ativa}
              @change=${(t) => a("ativa", t.target.checked)}></uui-toggle>
          </div>
        </div>

        <div class="row" style="margin-top:14px;">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${async () => {
    await l(this, s, _).call(this, "SalvarOperacao", this._opDraft) && (this._opDraft = null);
  }}>
            ${this._busy ? "Salvando…" : "Salvar"}
          </uui-button>
          <uui-button look="secondary" @click=${() => this._opDraft = null}>Cancelar</uui-button>
        </div>
      </uui-box>`;
};
n.styles = L`
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
p([
  m()
], n.prototype, "_painel", 2);
p([
  m()
], n.prototype, "_vocab", 2);
p([
  m()
], n.prototype, "_requisicoes", 2);
p([
  m()
], n.prototype, "_operacoes", 2);
p([
  m()
], n.prototype, "_filtro", 2);
p([
  m()
], n.prototype, "_opDraft", 2);
p([
  m()
], n.prototype, "_loading", 2);
p([
  m()
], n.prototype, "_busy", 2);
p([
  m()
], n.prototype, "_msg", 2);
n = p([
  T("lgpd-dashboard")
], n);
const W = n;
export {
  n as LgpdDashboardElement,
  W as default
};
