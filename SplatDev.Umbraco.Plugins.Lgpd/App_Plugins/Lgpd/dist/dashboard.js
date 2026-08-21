import { LitElement as A, nothing as d, html as s, css as L, state as h, customElement as z } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as R } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as S } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as P } from "@umbraco-cms/backoffice/notification";
function V(e) {
  let a = null, i = null;
  const t = e.consumeContext.bind(e), n = new Promise((c) => {
    t(S, async (u) => {
      var f;
      try {
        a = await ((f = u == null ? void 0 : u.getLatestToken) == null ? void 0 : f.call(u)) ?? null;
      } catch {
        a = null;
      }
      c();
    }), setTimeout(c, 3e3);
  });
  return t(P, (c) => {
    i = c;
  }), async (c, u = {}) => {
    await n;
    const f = new Headers(u.headers);
    a && !f.has("Authorization") && f.set("Authorization", `Bearer ${a}`);
    const b = await fetch(c, { ...u, credentials: "same-origin", headers: f });
    if (!b.ok) {
      const y = b.status === 401 || b.status === 403, T = y ? "Not authorised" : "Could not load data", w = y ? `The backoffice token was ${a ? "sent but rejected" : "not available"} (${b.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${b.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${b.status} from ${String(c)} — ${w}`), i == null || i.peek("danger", { data: { headline: T, message: w } });
    }
    return b;
  };
}
var N = Object.defineProperty, j = Object.getOwnPropertyDescriptor, D = (e) => {
  throw TypeError(e);
}, p = (e, a, i, t) => {
  for (var n = t > 1 ? void 0 : t ? j(a, i) : a, c = e.length - 1, u; c >= 0; c--)
    (u = e[c]) && (n = (t ? u(a, i, n) : u(n)) || n);
  return t && n && N(a, i, n), n;
}, I = (e, a, i) => a.has(e) || D("Cannot " + i), _ = (e, a, i) => (I(e, a, "read from private field"), i ? i.call(e) : a.get(e)), k = (e, a, i) => a.has(e) ? D("Cannot add the same private member more than once") : a instanceof WeakSet ? a.add(e) : a.set(e, i), l = (e, a, i) => (I(e, a, "access private method"), i), g, o, x, $, m, E, q, O, v;
const M = {
  confirmacao: "Confirmação de tratamento (art. 18, I)",
  acesso: "Acesso aos dados (II)",
  correcao: "Correção (III)",
  anonimizacao_bloqueio_eliminacao: "Anonimização, bloqueio ou eliminação (IV)",
  portabilidade: "Portabilidade (V)",
  eliminacao_consentimento: "Eliminação de dados consentidos (VI)",
  informacao_compartilhamento: "Informação sobre compartilhamento (VII)",
  informacao_nao_consentir: "Informação sobre não consentir (VIII)",
  revogacao: "Revogação do consentimento (IX)"
}, C = {
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
}, U = {
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
let r = class extends R(A) {
  constructor() {
    super(...arguments), k(this, o), k(this, g, V(this)), this._painel = null, this._vocab = null, this._requisicoes = [], this._operacoes = [], this._filtro = "pendente", this._opDraft = null, this._loading = !0, this._busy = !1, this._msg = null, this._loadError = null, this._api = "/umbraco/api/lgpd";
  }
  connectedCallback() {
    super.connectedCallback(), l(this, o, x).call(this);
  }
  render() {
    var a;
    const e = this._painel;
    return s`
      ${this._loadError ? s`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : ""}
      <h1>LGPD</h1>
      <p class="description">
        Consentimento, requisições de titulares e o registro das operações de tratamento,
        conforme a Lei nº 13.709/2018. O consentimento é acumulativo: cada mudança fica
        registrada, porque o art. 8º §1º atribui ao controlador o ônus de comprová-lo.
      </p>

      ${e != null && e.encarregadoAusente ? s`<div class="aviso">
                 <strong>Encarregado não configurado.</strong>
                 O art. 41 §1º exige que a identidade e o contato do encarregado sejam
                 divulgados publicamente. Defina <code>Lgpd:EncarregadoNome</code> e
                 <code>Lgpd:EncarregadoEmail</code> nas configurações do site.
               </div>` : d}

      ${this._loading ? s`<uui-loader></uui-loader>` : d}

      ${e ? s`
            <uui-box headline="Situação">
              <div class="stats">
                ${l(this, o, m).call(this, e.requisicoesVencidas, "requisições vencidas", e.requisicoesVencidas > 0 ? "alert" : "")}
                ${l(this, o, m).call(this, e.requisicoesVencendoEm3Dias, "vencem em 3 dias", e.requisicoesVencendoEm3Dias > 0 ? "warn" : "")}
                ${l(this, o, m).call(this, e.requisicoesPendentes, "em aberto")}
                ${l(this, o, m).call(this, e.sessoes, "sessões")}
                ${l(this, o, m).call(this, e.consentimentosConcedidos, "consentimentos")}
                ${l(this, o, m).call(this, e.consentimentosRecusados, "recusas")}
                ${l(this, o, m).call(this, e.operacoesAtivas, "operações ativas")}
                ${l(this, o, m).call(this, e.operacoesComDadoSensivel, "com dado sensível", e.operacoesComDadoSensivel > 0 ? "warn" : "")}
              </div>
              <p class="hint" style="margin-top:12px;">
                ${e.registrosMantidos} registro(s) de consentimento mantidos${e.registroMaisAntigo ? s`, mais antigo de ${new Date(e.registroMaisAntigo).toLocaleDateString()}` : d}.
                Prazo legal de resposta: ${((a = this._vocab) == null ? void 0 : a.prazoRespostaDias) ?? 15} dias (art. 19).
              </p>
            </uui-box>` : d}

      ${this._msg ? s`<div class="msg ${this._msg.ok ? "ok" : "bad"}">${this._msg.texto}</div>` : d}

      ${l(this, o, q).call(this)}

      <uui-box headline="Registro de operações de tratamento (art. 37)" style="margin-top:16px;">
        <div class="row">
          <uui-button look="primary" ?disabled=${this._busy}
            @click=${() => this._opDraft = { ...U }}>Nova operação</uui-button>
        </div>

        ${this._operacoes.length === 0 ? s`<p class="empty">
                   Nenhuma operação registrada. O art. 37 obriga o controlador a manter este
                   registro, e é a primeira coisa que a ANPD solicita.
                 </p>` : s`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Operação</uui-table-head-cell>
                  <uui-table-head-cell>Base legal</uui-table-head-cell>
                  <uui-table-head-cell>Dados</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._operacoes.map((i) => s`
                  <uui-table-row>
                    <uui-table-cell>
                      <strong>${i.nome}</strong>
                      ${i.ativa ? d : s`<uui-tag look="secondary">inativa</uui-tag>`}
                      <div class="hint">${i.finalidade}</div>
                    </uui-table-cell>
                    <uui-table-cell class="hint">${C[i.baseLegal] ?? i.baseLegal}</uui-table-cell>
                    <uui-table-cell class="hint">
                      ${i.categoriasDados ?? "—"}
                      ${i.contemDadoSensivel ? s`<div><uui-tag look="warning">dado sensível</uui-tag></div>` : d}
                    </uui-table-cell>
                    <uui-table-cell style="text-align:right;white-space:nowrap;">
                      <uui-button look="secondary" compact
                        @click=${() => this._opDraft = { ...i }}>Editar</uui-button>
                      <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                        @click=${() => confirm(`Remover "${i.nome}" do registro?`) && l(this, o, $).call(this, `RemoverOperacao?id=${i.id}`, void 0, "DELETE")}>Remover</uui-button>
                    </uui-table-cell>
                  </uui-table-row>`)}
              </uui-table>`}
      </uui-box>

      ${l(this, o, O).call(this)}
    `;
  }
};
g = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
x = async function() {
  this._loading = !0;
  try {
    const [e, a, i, t] = await Promise.all([
      _(this, g).call(this, `${this._api}/Painel`, { credentials: "same-origin" }),
      _(this, g).call(this, `${this._api}/Vocabulario`, { credentials: "same-origin" }),
      _(this, g).call(this, `${this._api}/Requisicoes?status=${encodeURIComponent(this._filtro)}`, { credentials: "same-origin" }),
      _(this, g).call(this, `${this._api}/Operacoes`, { credentials: "same-origin" })
    ]);
    l(this, o, v).call(this, e) && (this._painel = await e.json()), l(this, o, v).call(this, a) && (this._vocab = await a.json()), l(this, o, v).call(this, i) && (this._requisicoes = await i.json()), l(this, o, v).call(this, t) && (this._operacoes = await t.json());
  } finally {
    this._loading = !1;
  }
};
$ = async function(e, a, i = "POST") {
  this._busy = !0, this._msg = null;
  try {
    const t = await _(this, g).call(this, `${this._api}/${e}`, {
      method: i,
      credentials: "same-origin",
      headers: a ? { "Content-Type": "application/json" } : void 0,
      body: a ? JSON.stringify(a) : void 0
    }), n = await t.json();
    return this._msg = { ok: t.ok, texto: n.mensagem ?? (t.ok ? "Feito." : "Falhou.") }, l(this, o, v).call(this, t) && await l(this, o, x).call(this), t.ok;
  } catch (t) {
    return this._msg = { ok: !1, texto: `A requisição falhou: ${t.message}` }, !1;
  } finally {
    this._busy = !1;
  }
};
m = function(e, a, i = "") {
  return s`<div class="stat ${i}"><div class="n">${e}</div><div class="l">${a}</div></div>`;
};
E = function(e) {
  return Math.ceil((Date.parse(e) - Date.now()) / 864e5);
};
q = function() {
  return s`
      <uui-box headline="Requisições de titulares (art. 18)" style="margin-top:16px;">
        <div class="row">
          ${["pendente", "em_andamento", "concluida", "recusada", ""].map((e) => s`
            <uui-button look=${this._filtro === e ? "primary" : "secondary"} compact
              @click=${async () => {
    this._filtro = e, await l(this, o, x).call(this);
  }}>
              ${e === "" ? "Todas" : e.replace("_", " ")}
            </uui-button>`)}
        </div>

        ${this._requisicoes.length === 0 ? s`<p class="empty">Nenhuma requisição.</p>` : s`
              <uui-table style="margin-top:12px;">
                <uui-table-head>
                  <uui-table-head-cell>Titular</uui-table-head-cell>
                  <uui-table-head-cell>Direito</uui-table-head-cell>
                  <uui-table-head-cell>Prazo</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell></uui-table-head-cell>
                </uui-table-head>
                ${this._requisicoes.map((e) => {
    const a = l(this, o, E).call(this, e.prazoEm), i = e.status === "pendente" || e.status === "em_andamento";
    return s`
                    <uui-table-row>
                      <uui-table-cell>
                        <span class="mono">${e.email}</span>
                        ${e.nome ? s`<div class="hint">${e.nome}</div>` : d}
                      </uui-table-cell>
                      <uui-table-cell class="hint">
                        ${M[e.direito] ?? e.direito}
                      </uui-table-cell>
                      <uui-table-cell class=${i && a < 0 ? "vencida" : ""}>
                        ${new Date(e.prazoEm).toLocaleDateString()}
                        ${i ? s`<div class="hint">
                                   ${a < 0 ? `${Math.abs(a)} dia(s) em atraso` : `${a} dia(s)`}
                                 </div>` : d}
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-tag look=${e.status === "concluida" ? "positive" : e.status === "recusada" || i && a < 0 ? "danger" : "warning"}>
                          ${e.status.replace("_", " ")}
                        </uui-tag>
                      </uui-table-cell>
                      <uui-table-cell style="text-align:right;white-space:nowrap;">
                        ${i ? s`
                              <uui-button look="secondary" compact ?disabled=${this._busy}
                                @click=${() => l(this, o, $).call(this, "AtualizarRequisicao", { id: e.id, status: "concluida", justificativa: null })}>
                                Concluir</uui-button>
                              <uui-button look="secondary" color="danger" compact ?disabled=${this._busy}
                                @click=${() => {
      const t = prompt("Justificativa da recusa (art. 18, §4º):");
      t && t.trim() && l(this, o, $).call(this, "AtualizarRequisicao", { id: e.id, status: "recusada", justificativa: t.trim() });
    }}>Recusar</uui-button>` : e.justificativa ? s`<span class="hint">${e.justificativa}</span>` : d}
                      </uui-table-cell>
                    </uui-table-row>`;
  })}
              </uui-table>`}
      </uui-box>`;
};
O = function() {
  var i;
  const e = this._opDraft;
  if (!e) return d;
  const a = (t, n) => this._opDraft = { ...e, [t]: n };
  return s`
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
              ${(((i = this._vocab) == null ? void 0 : i.basesLegais) ?? []).map((t) => s`<option value=${t}>${C[t] ?? t}</option>`)}
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
    await l(this, o, $).call(this, "SalvarOperacao", this._opDraft) && (this._opDraft = null);
  }}>
            ${this._busy ? "Salvando…" : "Salvar"}
          </uui-button>
          <uui-button look="secondary" @click=${() => this._opDraft = null}>Cancelar</uui-button>
        </div>
      </uui-box>`;
};
v = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
r.styles = L`
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
p([
  h()
], r.prototype, "_painel", 2);
p([
  h()
], r.prototype, "_vocab", 2);
p([
  h()
], r.prototype, "_requisicoes", 2);
p([
  h()
], r.prototype, "_operacoes", 2);
p([
  h()
], r.prototype, "_filtro", 2);
p([
  h()
], r.prototype, "_opDraft", 2);
p([
  h()
], r.prototype, "_loading", 2);
p([
  h()
], r.prototype, "_busy", 2);
p([
  h()
], r.prototype, "_msg", 2);
p([
  h()
], r.prototype, "_loadError", 2);
r = p([
  z("lgpd-dashboard")
], r);
const G = r;
export {
  r as LgpdDashboardElement,
  G as default
};
