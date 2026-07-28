var Me = (e) => {
  throw TypeError(e);
};
var _e = (e, t, i) => t.has(e) || Me("Cannot " + i);
var se = (e, t, i) => (_e(e, t, "read from private field"), i ? i.call(e) : t.get(e)), V = (e, t, i) => t.has(e) ? Me("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), we = (e, t, i, a) => (_e(e, t, "write to private field"), a ? a.call(e, i) : t.set(e, i), i), v = (e, t, i) => (_e(e, t, "access private method"), i);
import { UmbContextBase as Je } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken as Qe } from "@umbraco-cms/backoffice/context-api";
import { css as u, property as c, customElement as h, LitElement as f, html as o, state as l, nothing as ke } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as G } from "@umbraco-cms/backoffice/element-api";
const R = new Qe("SplatDev.Workflow.Context");
var te, d, E, re;
class zt extends Je {
  constructor(i) {
    super(i, R);
    V(this, d);
    V(this, te, "/umbraco/backoffice/SplatDevWorkflow");
  }
  async getInstances(i) {
    const a = {};
    return i.workflowKey && (a.workflowKey = i.workflowKey), i.status !== void 0 && (a.status = String(i.status)), i.assignedToMe && (a.assignedToMe = "true"), i.group && (a.group = i.group), i.department && (a.department = i.department), i.freeText && (a.freeText = i.freeText), a.page = String(i.page ?? 1), a.pageSize = String(i.pageSize ?? 50), v(this, d, E).call(this, "/WorkflowInstances/List", a);
  }
  async getInstance(i) {
    return v(this, d, E).call(this, `/WorkflowInstances/Get/${i}`);
  }
  async createInstance(i, a) {
    return v(this, d, re).call(this, "/WorkflowInstances/Create", { workflowKey: i, metadataJson: a });
  }
  async transition(i, a) {
    return v(this, d, re).call(this, `/WorkflowInstances/Transition/${i}`, { actionKey: a });
  }
  async getDefinitions() {
    return v(this, d, E).call(this, "/WorkflowDefinitions/List");
  }
  async getDefinition(i) {
    return v(this, d, E).call(this, `/WorkflowDefinitions/Get/${i}`);
  }
  async saveDefinition(i) {
    await v(this, d, re).call(this, "/WorkflowDefinitions/Save", i);
  }
  async getThemes() {
    return v(this, d, E).call(this, "/WorkflowThemes/List");
  }
  async getTheme(i) {
    return v(this, d, E).call(this, `/WorkflowThemes/Get/${i}`);
  }
  parseDefinition(i) {
    try {
      return JSON.parse(i);
    } catch {
      return { steps: [] };
    }
  }
}
te = new WeakMap(), d = new WeakSet(), E = async function(i, a) {
  const s = new URL(`${se(this, te)}${i}`, window.location.origin);
  a && Object.entries(a).forEach(([n, Pt]) => s.searchParams.set(n, Pt));
  const r = await fetch(s.toString());
  if (!r.ok) throw new Error(`GET ${i} failed: ${r.status}`);
  return r.json();
}, re = async function(i, a) {
  const s = await fetch(`${se(this, te)}${i}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
  if (!s.ok) throw new Error(`POST ${i} failed: ${s.status}`);
  return s.json();
};
const Se = new Qe("SplatDev.Workflow.Theme.Context");
var I, ie, be;
class Dt extends Je {
  constructor(i) {
    super(i, Se);
    V(this, ie);
    V(this, I, "classic");
    const a = localStorage.getItem("swf-active-theme");
    a && (we(this, I, a), v(this, ie, be).call(this, a));
  }
  get activeTheme() {
    return se(this, I);
  }
  setTheme(i) {
    we(this, I, i), localStorage.setItem("swf-active-theme", i), v(this, ie, be).call(this, i);
  }
}
I = new WeakMap(), ie = new WeakSet(), be = function(i) {
  document.body.setAttribute("data-swf-theme", i);
};
var At = Object.defineProperty, It = Object.getOwnPropertyDescriptor, Ce = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? It(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && At(t, i, s), s;
};
let H = class extends f {
  constructor() {
    super(...arguments), this.steps = [], this.currentStep = "";
  }
  render() {
    const e = this.steps.findIndex((t) => t.key === this.currentStep);
    return o`
      <div class="stepper">
        ${this.steps.map((t, i) => {
      const a = i < e, r = a ? "step completed" : i === e ? "step active" : "step";
      return o`
            ${i > 0 ? o`<div class="connector ${i <= e ? "completed" : ""}"></div>` : ""}
            <div class="${r}">
              <div class="step-indicator">
                ${a ? o`&#10003;` : o`${i + 1}`}
              </div>
              <div class="step-label">${t.label}</div>
            </div>
          `;
    })}
      </div>
    `;
  }
};
H.styles = u`
    :host { display: block; }
    .stepper { display: flex; align-items: center; gap: 0; width: 100%; }
    .step {
      display: flex; flex-direction: column; align-items: center; flex: 1;
      position: relative;
    }
    .step-indicator {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700; color: #fff;
      background: var(--swf-chart-step-pending-bg, #d1d5db);
      z-index: 1;
    }
    .step.completed .step-indicator {
      background: var(--swf-chart-step-completed-bg, #22c55e);
    }
    .step.active .step-indicator {
      background: var(--swf-chart-step-active-bg, #2563eb);
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
    }
    .step-label {
      margin-top: 6px; font-size: 0.7rem; text-align: center;
      color: var(--uui-color-text-alt, #6b7280);
      max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .step.active .step-label { color: var(--uui-color-text, #111); font-weight: 600; }
    .connector {
      flex: 1; height: 3px; min-width: 16px;
      background: var(--swf-chart-step-pending-bg, #d1d5db);
      margin-top: -16px; align-self: flex-start; margin-top: 16px;
    }
    .connector.completed { background: var(--swf-chart-step-completed-bg, #22c55e); }
  `;
Ce([
  c({ type: Array })
], H.prototype, "steps", 2);
Ce([
  c({ type: String, attribute: "current-step" })
], H.prototype, "currentStep", 2);
H = Ce([
  h("workflow-horizontal-stepper")
], H);
var Kt = Object.defineProperty, Mt = Object.getOwnPropertyDescriptor, Ee = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? Mt(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && Kt(t, i, s), s;
};
let U = class extends f {
  constructor() {
    super(...arguments), this.steps = [], this.currentStep = "";
  }
  render() {
    const e = this.steps.findIndex((t) => t.key === this.currentStep);
    return o`
      <div class="timeline">
        ${this.steps.map((t, i) => {
      const r = i < e ? "step-row completed" : i === e ? "step-row active" : "step-row";
      return o`
            <div class="${r}">
              <div class="donut"></div>
              <div class="step-info">
                <div class="step-label">${t.label}</div>
                ${t.department ? o`<div class="step-detail">${t.department}</div>` : ""}
              </div>
            </div>
          `;
    })}
      </div>
    `;
  }
};
U.styles = u`
    :host { display: block; }
    .timeline { display: flex; flex-direction: column; gap: 0; padding-left: 16px; }
    .step-row { display: flex; align-items: flex-start; gap: 12px; position: relative; }
    .step-row:not(:last-child) { padding-bottom: 24px; }
    .step-row:not(:last-child)::before {
      content: ""; position: absolute; left: 11px; top: 28px; bottom: 0; width: 2px;
      background: var(--swf-chart-step-pending-bg, #d1d5db);
    }
    .step-row.completed:not(:last-child)::before {
      background: var(--swf-chart-step-completed-bg, #22c55e);
    }
    .donut {
      width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
      border: 3px solid var(--swf-chart-step-pending-bg, #d1d5db);
      background: #fff; z-index: 1;
    }
    .step-row.completed .donut {
      border-color: var(--swf-chart-step-completed-bg, #22c55e);
      background: var(--swf-chart-step-completed-bg, #22c55e);
    }
    .step-row.active .donut {
      border-color: var(--swf-chart-step-active-bg, #2563eb);
      background: var(--swf-chart-step-active-bg, #2563eb);
    }
    .step-info { padding-top: 2px; }
    .step-label { font-size: 0.85rem; font-weight: 500; }
    .step-row.active .step-label { font-weight: 700; color: var(--swf-chart-step-active-bg, #2563eb); }
    .step-detail { font-size: 0.7rem; color: var(--uui-color-text-alt, #6b7280); }
  `;
Ee([
  c({ type: Array })
], U.prototype, "steps", 2);
Ee([
  c({ type: String, attribute: "current-step" })
], U.prototype, "currentStep", 2);
U = Ee([
  h("workflow-vertical-donut")
], U);
var Nt = Object.defineProperty, Lt = Object.getOwnPropertyDescriptor, Oe = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? Lt(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && Nt(t, i, s), s;
};
let X = class extends f {
  constructor() {
    super(...arguments), this.steps = [], this.currentStep = "";
  }
  render() {
    const e = this.steps.findIndex((t) => t.key === this.currentStep);
    return o`
      <div class="strip">
        ${this.steps.map((t, i) => {
      const r = i < e ? "segment completed" : i === e ? "segment active" : "segment";
      return o`<div class="${r}" title="${t.label}">${t.label.substring(0, 3)}</div>`;
    })}
      </div>
    `;
  }
};
X.styles = u`
    :host { display: block; }
    .strip { display: flex; border-radius: 4px; overflow: hidden; height: 28px; }
    .segment {
      flex: 1; display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 600; color: #fff;
      background: var(--swf-chart-step-pending-bg, #d1d5db);
      transition: background 0.2s;
    }
    .segment.completed { background: var(--swf-chart-step-completed-bg, #22c55e); }
    .segment.active { background: var(--swf-chart-step-active-bg, #2563eb); }
    .segment + .segment { border-left: 1px solid rgba(255, 255, 255, 0.3); }
  `;
Oe([
  c({ type: Array })
], X.prototype, "steps", 2);
Oe([
  c({ type: String, attribute: "current-step" })
], X.prototype, "currentStep", 2);
X = Oe([
  h("workflow-compact-strip")
], X);
var qt = Object.defineProperty, Gt = Object.getOwnPropertyDescriptor, ue = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? Gt(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && qt(t, i, s), s;
};
let K = class extends f {
  constructor() {
    super(...arguments), this.steps = [], this.currentStep = "", this.variant = "horizontal-stepper";
  }
  render() {
    switch (this.variant) {
      case "vertical-donut":
        return o`<workflow-vertical-donut .steps=${this.steps} current-step=${this.currentStep}></workflow-vertical-donut>`;
      case "compact-strip":
        return o`<workflow-compact-strip .steps=${this.steps} current-step=${this.currentStep}></workflow-compact-strip>`;
      default:
        return o`<workflow-horizontal-stepper .steps=${this.steps} current-step=${this.currentStep}></workflow-horizontal-stepper>`;
    }
  }
};
K.styles = u`
    :host { display: block; }
  `;
ue([
  c({ type: Array })
], K.prototype, "steps", 2);
ue([
  c({ type: String, attribute: "current-step" })
], K.prototype, "currentStep", 2);
ue([
  c({ type: String })
], K.prototype, "variant", 2);
K = ue([
  h("workflow-pizza-chart")
], K);
var Rt = Object.defineProperty, jt = Object.getOwnPropertyDescriptor, Fe = (e) => {
  throw TypeError(e);
}, j = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? jt(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && Rt(t, i, s), s;
}, We = (e, t, i) => t.has(e) || Fe("Cannot " + i), Ne = (e, t, i) => (We(e, t, "read from private field"), t.get(e)), Le = (e, t, i) => t.has(e) ? Fe("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Vt = (e, t, i, a) => (We(e, t, "write to private field"), t.set(e, i), i), D = (e, t, i) => (We(e, t, "access private method"), i), Y, x, le, He, Ue, Xe;
let S = class extends G(f) {
  constructor() {
    super(...arguments), Le(this, x), this.filter = {}, this._rows = [], this._total = 0, this._page = 1, this._loading = !1, Le(this, Y);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(R, (e) => {
      Vt(this, Y, e), D(this, x, le).call(this);
    });
  }
  async refresh() {
    await D(this, x, le).call(this);
  }
  render() {
    if (this._loading) return o`<uui-loader-bar></uui-loader-bar>`;
    if (this._rows.length === 0)
      return o`<div class="empty">No workflow instances found.</div>`;
    const e = this._rows.length > 0 ? Object.keys(this._rows[0].values) : [], t = Math.ceil(this._total / 25);
    return o`
      <uui-table>
        <uui-table-head>
          <uui-table-head-cell>ID</uui-table-head-cell>
          ${e.map((i) => o`<uui-table-head-cell>${i}</uui-table-head-cell>`)}
        </uui-table-head>
        ${this._rows.map(
      (i) => o`
            <uui-table-row @click=${() => D(this, x, He).call(this, i)} style="cursor:pointer">
              <uui-table-cell>${i.instanceId}</uui-table-cell>
              ${e.map((a) => {
        const s = i.values[a];
        return a.toLowerCase() === "status" ? o`<uui-table-cell>
                    <span class="status-badge status-${s}">${D(this, x, Xe).call(this, s)}</span>
                  </uui-table-cell>` : o`<uui-table-cell>${s ?? ""}</uui-table-cell>`;
      })}
            </uui-table-row>
          `
    )}
      </uui-table>
      ${t > 1 ? o`<div class="pagination">
            <uui-pagination .total=${t} .current=${this._page} @change=${D(this, x, Ue)}></uui-pagination>
          </div>` : ""}
    `;
  }
};
Y = /* @__PURE__ */ new WeakMap();
x = /* @__PURE__ */ new WeakSet();
le = async function() {
  if (Ne(this, Y)) {
    this._loading = !0;
    try {
      const e = await Ne(this, Y).getInstances({
        ...this.filter,
        page: this._page,
        pageSize: 25
      });
      this._rows = e.items, this._total = e.totalCount;
    } catch {
      this._rows = [], this._total = 0;
    }
    this._loading = !1;
  }
};
He = function(e) {
  this.dispatchEvent(
    new CustomEvent("row-clicked", { detail: { instanceId: e.instanceId }, bubbles: !0, composed: !0 })
  );
};
Ue = function(e) {
  var t;
  this._page = ((t = e.detail) == null ? void 0 : t.page) ?? 1, D(this, x, le).call(this);
};
Xe = function(e) {
  switch (Number(e)) {
    case 0:
      return "Open";
    case 1:
      return "Completed";
    case 2:
      return "Cancelled";
    default:
      return String(e);
  }
};
S.styles = u`
    :host { display: block; }
    uui-table { width: 100%; }
    .empty { text-align: center; padding: 24px; color: var(--uui-color-text-alt, #6b7280); }
    .status-badge {
      display: inline-block; padding: 2px 8px; border-radius: 9999px;
      font-size: 0.7rem; font-weight: 600;
    }
    .status-0 { background: #dbeafe; color: #1e40af; }
    .status-1 { background: #d1fae5; color: #065f46; }
    .status-2 { background: #fee2e2; color: #991b1b; }
    .pagination { display: flex; justify-content: center; margin-top: 16px; }
  `;
j([
  c({ type: Object })
], S.prototype, "filter", 2);
j([
  l()
], S.prototype, "_rows", 2);
j([
  l()
], S.prototype, "_total", 2);
j([
  l()
], S.prototype, "_page", 2);
j([
  l()
], S.prototype, "_loading", 2);
S = j([
  h("workflow-queue-table")
], S);
var Bt = Object.defineProperty, Jt = Object.getOwnPropertyDescriptor, Ye = (e) => {
  throw TypeError(e);
}, P = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? Jt(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && Bt(t, i, s), s;
}, Te = (e, t, i) => t.has(e) || Ye("Cannot " + i), T = (e, t, i) => (Te(e, t, "read from private field"), i ? i.call(e) : t.get(e)), qe = (e, t, i) => t.has(e) ? Ye("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Qt = (e, t, i, a) => (Te(e, t, "write to private field"), t.set(e, i), i), A = (e, t, i) => (Te(e, t, "access private method"), i), g, $, ce, Ze, et, tt;
let b = class extends G(f) {
  constructor() {
    super(...arguments), qe(this, $), this.instanceId = 0, this._instance = null, this._steps = [], this._currentActions = [], this._loading = !1, this._transitioning = !1, qe(this, g);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(R, (e) => {
      Qt(this, g, e), this.instanceId && A(this, $, ce).call(this);
    });
  }
  updated(e) {
    e.has("instanceId") && this.instanceId && T(this, g) && A(this, $, ce).call(this);
  }
  render() {
    if (this._loading) return o`<uui-loader-bar></uui-loader-bar>`;
    if (!this._instance) return o`<p>No instance selected.</p>`;
    const e = this._instance;
    return o`
      <div class="header">
        <h3>Instance #${e.id}</h3>
        <uui-button look="secondary" compact label="Close" @click=${A(this, $, tt)}>
          <uui-icon name="icon-wrong"></uui-icon>
        </uui-button>
      </div>

      <div class="meta-grid">
        <div><span class="meta-label">Workflow</span><br>${e.workflowKey}</div>
        <div><span class="meta-label">Version</span><br>${e.workflowVersion}</div>
        <div><span class="meta-label">Current Step</span><br>${e.currentStepKey}</div>
        <div>
          <span class="meta-label">Status</span><br>
          <span class="status-badge status-${e.status}">${A(this, $, et).call(this, e.status)}</span>
        </div>
        <div><span class="meta-label">Created</span><br>${new Date(e.createdAt).toLocaleString()}</div>
        <div><span class="meta-label">Created By</span><br>${e.createdBy}</div>
      </div>

      <div class="chart-section">
        <workflow-pizza-chart
          .steps=${this._steps}
          current-step=${e.currentStepKey}
        ></workflow-pizza-chart>
      </div>

      ${e.status === 0 && this._currentActions.length > 0 ? o`
            <div class="actions-row">
              ${this._currentActions.map(
      (t) => o`
                  <uui-button
                    look="primary"
                    label=${t.label}
                    ?disabled=${this._transitioning}
                    @click=${() => A(this, $, Ze).call(this, t.key)}
                  >${t.label}</uui-button>
                `
    )}
            </div>
          ` : ke}
    `;
  }
};
g = /* @__PURE__ */ new WeakMap();
$ = /* @__PURE__ */ new WeakSet();
ce = async function() {
  var e;
  if (!(!T(this, g) || !this.instanceId)) {
    this._loading = !0;
    try {
      this._instance = await T(this, g).getInstance(this.instanceId);
      const t = await T(this, g).getDefinition(this._instance.workflowKey), i = T(this, g).parseDefinition(t.definitionJson);
      this._steps = i.steps;
      const a = this._steps.find((s) => s.key === this._instance.currentStepKey);
      this._currentActions = ((e = a == null ? void 0 : a.actions) == null ? void 0 : e.map((s) => ({ key: s.key, label: s.label }))) ?? [];
    } catch {
      this._instance = null, this._steps = [];
    }
    this._loading = !1;
  }
};
Ze = async function(e) {
  if (!(!T(this, g) || !this._instance)) {
    this._transitioning = !0;
    try {
      (await T(this, g).transition(this._instance.id, e)).success && (this.dispatchEvent(new CustomEvent("transition-complete", { bubbles: !0, composed: !0 })), await A(this, $, ce).call(this));
    } catch {
    }
    this._transitioning = !1;
  }
};
et = function(e) {
  switch (e) {
    case 0:
      return "Open";
    case 1:
      return "Completed";
    case 2:
      return "Cancelled";
    default:
      return `Status ${e}`;
  }
};
tt = function() {
  this.dispatchEvent(new CustomEvent("close-flyout", { bubbles: !0, composed: !0 }));
};
b.styles = u`
    :host { display: block; padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
    .meta-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      margin-bottom: 16px; font-size: 0.85rem;
    }
    .meta-label { color: var(--uui-color-text-alt, #6b7280); font-size: 0.75rem; text-transform: uppercase; }
    .chart-section { margin: 16px 0; }
    .actions-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
    .status-badge {
      display: inline-block; padding: 2px 8px; border-radius: 9999px;
      font-size: 0.7rem; font-weight: 600;
    }
    .status-0 { background: #dbeafe; color: #1e40af; }
    .status-1 { background: #d1fae5; color: #065f46; }
    .status-2 { background: #fee2e2; color: #991b1b; }
  `;
P([
  c({ type: Number, attribute: "instance-id" })
], b.prototype, "instanceId", 2);
P([
  l()
], b.prototype, "_instance", 2);
P([
  l()
], b.prototype, "_steps", 2);
P([
  l()
], b.prototype, "_currentActions", 2);
P([
  l()
], b.prototype, "_loading", 2);
P([
  l()
], b.prototype, "_transitioning", 2);
b = P([
  h("workflow-instance-flyout")
], b);
var Ft = Object.defineProperty, Ht = Object.getOwnPropertyDescriptor, it = (e) => {
  throw TypeError(e);
}, he = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? Ht(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && Ft(t, i, s), s;
}, Pe = (e, t, i) => t.has(e) || it("Cannot " + i), st = (e, t, i) => (Pe(e, t, "read from private field"), i ? i.call(e) : t.get(e)), Ge = (e, t, i) => t.has(e) ? it("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Ut = (e, t, i, a) => (Pe(e, t, "write to private field"), t.set(e, i), i), B = (e, t, i) => (Pe(e, t, "access private method"), i), F, O, at, rt, ye, nt;
let M = class extends G(f) {
  constructor() {
    super(...arguments), Ge(this, O), this._definitions = [], this._filter = {}, this._selectedInstanceId = null, Ge(this, F);
  }
  connectedCallback() {
    super.connectedCallback(), Ut(this, F, new zt(this)), this.provideContext(R, st(this, F)), B(this, O, at).call(this);
  }
  render() {
    const e = [
      { name: "All Workflows", value: "", selected: !this._filter.workflowKey },
      ...this._definitions.map((i) => ({
        name: i.label,
        value: i.key,
        selected: i.key === this._filter.workflowKey
      }))
    ], t = [
      { name: "All Statuses", value: "", selected: this._filter.status === void 0 },
      { name: "Open", value: "0", selected: this._filter.status === 0 },
      { name: "Completed", value: "1", selected: this._filter.status === 1 },
      { name: "Cancelled", value: "2", selected: this._filter.status === 2 }
    ];
    return o`
      <h2>Workflow Queue</h2>

      <div class="filter-bar">
        <uui-select
          .options=${e}
          @change=${(i) => {
      const a = i.target.value;
      this._filter = { ...this._filter, workflowKey: a || void 0 };
    }}
        ></uui-select>

        <uui-select
          .options=${t}
          @change=${(i) => {
      const a = i.target.value;
      this._filter = { ...this._filter, status: a ? Number(a) : void 0 };
    }}
        ></uui-select>

        <uui-toggle
          label="Assigned to me"
          ?checked=${this._filter.assignedToMe}
          @change=${(i) => {
      this._filter = { ...this._filter, assignedToMe: i.target.checked };
    }}
        ></uui-toggle>

        <uui-input
          placeholder="Search…"
          @input=${(i) => {
      this._filter = { ...this._filter, freeText: i.target.value || void 0 };
    }}
        ></uui-input>
      </div>

      <workflow-queue-table
        .filter=${this._filter}
        @row-clicked=${B(this, O, rt)}
      ></workflow-queue-table>

      ${this._selectedInstanceId !== null ? o`
            <div class="flyout-backdrop" @click=${B(this, O, ye)}></div>
            <div class="flyout-panel">
              <workflow-instance-flyout
                instance-id=${this._selectedInstanceId}
                @close-flyout=${B(this, O, ye)}
                @transition-complete=${B(this, O, nt)}
              ></workflow-instance-flyout>
            </div>
          ` : ke}
    `;
  }
};
F = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakSet();
at = async function() {
  try {
    this._definitions = await st(this, F).getDefinitions();
  } catch {
    this._definitions = [];
  }
};
rt = function(e) {
  this._selectedInstanceId = e.detail.instanceId;
};
ye = function() {
  this._selectedInstanceId = null;
};
nt = function() {
  var e;
  (e = this.renderRoot.querySelector("workflow-queue-table")) == null || e.refresh();
};
M.styles = u`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 16px; }
    .filter-bar {
      display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
      margin-bottom: 16px; padding: 12px; border-radius: 4px;
      background: var(--uui-color-surface-alt, #f9fafb);
      border: 1px solid var(--uui-color-border, #e5e7eb);
    }
    .filter-bar uui-select, .filter-bar uui-input { min-width: 160px; }
    .flyout-panel {
      position: fixed; right: 0; top: 0; bottom: 0; width: 480px; z-index: 1000;
      background: var(--uui-color-surface, #fff);
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
      overflow-y: auto;
    }
    .flyout-backdrop {
      position: fixed; inset: 0; z-index: 999;
      background: rgba(0, 0, 0, 0.3);
    }
  `;
he([
  l()
], M.prototype, "_definitions", 2);
he([
  l()
], M.prototype, "_filter", 2);
he([
  l()
], M.prototype, "_selectedInstanceId", 2);
M = he([
  h("workflow-queue-workspace")
], M);
var Xt = Object.defineProperty, Yt = Object.getOwnPropertyDescriptor, ot = (e) => {
  throw TypeError(e);
}, fe = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? Yt(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && Xt(t, i, s), s;
}, Zt = (e, t, i) => t.has(e) || ot("Cannot " + i), ei = (e, t, i) => t.has(e) ? ot("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), J = (e, t, i) => (Zt(e, t, "access private method"), i), W, Q, lt;
let N = class extends f {
  constructor() {
    super(...arguments), ei(this, W), this.action = { key: "", label: "", nextStepKey: "", assignment: 0 }, this.index = 0, this.stepKeys = [];
  }
  render() {
    const e = [
      { name: "Assign to Group", value: "0", selected: this.action.assignment === 0 },
      { name: "Assign to Submitter", value: "1", selected: this.action.assignment === 1 },
      { name: "Manual", value: "2", selected: this.action.assignment === 2 }
    ], t = [
      { name: "(none)", value: "", selected: !this.action.nextStepKey },
      ...this.stepKeys.map((i) => ({ name: i, value: i, selected: i === this.action.nextStepKey }))
    ];
    return o`
      <div class="row">
        <div class="field">
          <label>Key</label>
          <uui-input .value=${this.action.key} @input=${(i) => {
      this.action = { ...this.action, key: i.target.value }, J(this, W, Q).call(this);
    }}></uui-input>
        </div>
        <div class="field">
          <label>Label</label>
          <uui-input .value=${this.action.label} @input=${(i) => {
      this.action = { ...this.action, label: i.target.value }, J(this, W, Q).call(this);
    }}></uui-input>
        </div>
        <div class="field">
          <label>Next Step</label>
          <uui-select .options=${t} @change=${(i) => {
      this.action = { ...this.action, nextStepKey: i.target.value }, J(this, W, Q).call(this);
    }}></uui-select>
        </div>
        <div class="field">
          <label>Assignment</label>
          <uui-select .options=${e} @change=${(i) => {
      this.action = { ...this.action, assignment: Number(i.target.value) }, J(this, W, Q).call(this);
    }}></uui-select>
        </div>
        <uui-button class="remove" look="secondary" compact label="Remove" @click=${J(this, W, lt)}>
          <uui-icon name="icon-delete"></uui-icon>
        </uui-button>
      </div>
    `;
  }
};
W = /* @__PURE__ */ new WeakSet();
Q = function() {
  this.dispatchEvent(new CustomEvent("action-changed", {
    detail: { index: this.index, action: { ...this.action } },
    bubbles: !0,
    composed: !0
  }));
};
lt = function() {
  this.dispatchEvent(new CustomEvent("action-removed", {
    detail: { index: this.index },
    bubbles: !0,
    composed: !0
  }));
};
N.styles = u`
    :host { display: block; padding: 8px; border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 4px; margin-bottom: 8px; background: var(--uui-color-surface, #fff); }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 120px; }
    .field label { font-size: 0.7rem; font-weight: 500; color: var(--uui-color-text-alt, #6b7280); }
    .remove { align-self: flex-end; }
  `;
fe([
  c({ type: Object })
], N.prototype, "action", 2);
fe([
  c({ type: Number })
], N.prototype, "index", 2);
fe([
  c({ type: Array })
], N.prototype, "stepKeys", 2);
N = fe([
  h("workflow-action-editor")
], N);
var ti = Object.defineProperty, ii = Object.getOwnPropertyDescriptor, ct = (e) => {
  throw TypeError(e);
}, ve = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? ii(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && ti(t, i, s), s;
}, si = (e, t, i) => t.has(e) || ct("Cannot " + i), ai = (e, t, i) => t.has(e) ? ct("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), _ = (e, t, i) => (si(e, t, "access private method"), i), p, k, pt, dt, ut, ht;
let L = class extends f {
  constructor() {
    super(...arguments), ai(this, p), this.step = { key: "", label: "", actions: [] }, this.index = 0, this.allStepKeys = [];
  }
  render() {
    return o`
      <div class="step-header">
        <h4>Step: ${this.step.label || this.step.key || "(new)"}</h4>
        <uui-button look="secondary" compact label="Remove Step" @click=${_(this, p, pt)}>
          <uui-icon name="icon-delete"></uui-icon>
        </uui-button>
      </div>

      <div class="fields">
        <div class="field">
          <label>Key</label>
          <uui-input .value=${this.step.key} @input=${(e) => {
      this.step = { ...this.step, key: e.target.value }, _(this, p, k).call(this);
    }}></uui-input>
        </div>
        <div class="field">
          <label>Label</label>
          <uui-input .value=${this.step.label} @input=${(e) => {
      this.step = { ...this.step, label: e.target.value }, _(this, p, k).call(this);
    }}></uui-input>
        </div>
        <div class="field">
          <label>Department</label>
          <uui-input .value=${this.step.department ?? ""} @input=${(e) => {
      this.step = { ...this.step, department: e.target.value }, _(this, p, k).call(this);
    }}></uui-input>
        </div>
        <div class="field">
          <label>Group</label>
          <uui-input .value=${this.step.group ?? ""} @input=${(e) => {
      this.step = { ...this.step, group: e.target.value }, _(this, p, k).call(this);
    }}></uui-input>
        </div>
      </div>

      <div class="actions-header">
        <h5>Actions</h5>
        <uui-button look="outline" compact label="Add Action" @click=${_(this, p, dt)}>+ Action</uui-button>
      </div>

      ${this.step.actions.map(
      (e, t) => o`
          <workflow-action-editor
            .action=${e}
            .index=${t}
            .stepKeys=${this.allStepKeys}
            @action-changed=${_(this, p, ut)}
            @action-removed=${_(this, p, ht)}
          ></workflow-action-editor>
        `
    )}
    `;
  }
};
p = /* @__PURE__ */ new WeakSet();
k = function() {
  this.dispatchEvent(new CustomEvent("step-changed", {
    detail: { index: this.index, step: { ...this.step } },
    bubbles: !0,
    composed: !0
  }));
};
pt = function() {
  this.dispatchEvent(new CustomEvent("step-removed", {
    detail: { index: this.index },
    bubbles: !0,
    composed: !0
  }));
};
dt = function() {
  const e = { key: "", label: "", nextStepKey: "", assignment: 0 };
  this.step = { ...this.step, actions: [...this.step.actions, e] }, _(this, p, k).call(this);
};
ut = function(e) {
  const t = [...this.step.actions];
  t[e.detail.index] = e.detail.action, this.step = { ...this.step, actions: t }, _(this, p, k).call(this);
};
ht = function(e) {
  const t = this.step.actions.filter((i, a) => a !== e.detail.index);
  this.step = { ...this.step, actions: t }, _(this, p, k).call(this);
};
L.styles = u`
    :host { display: block; padding: 12px; border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; margin-bottom: 12px; background: var(--uui-color-surface-alt, #f9fafb); }
    .step-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .step-header h4 { margin: 0; font-size: 0.95rem; font-weight: 600; }
    .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .field { display: flex; flex-direction: column; gap: 2px; }
    .field label { font-size: 0.75rem; font-weight: 500; color: var(--uui-color-text-alt, #6b7280); }
    .actions-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .actions-header h5 { margin: 0; font-size: 0.85rem; font-weight: 500; }
  `;
ve([
  c({ type: Object })
], L.prototype, "step", 2);
ve([
  c({ type: Number })
], L.prototype, "index", 2);
ve([
  c({ type: Array })
], L.prototype, "allStepKeys", 2);
L = ve([
  h("workflow-step-editor")
], L);
var ri = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, ft = (e) => {
  throw TypeError(e);
}, z = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? ni(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && ri(t, i, s), s;
}, ze = (e, t, i) => t.has(e) || ft("Cannot " + i), Z = (e, t, i) => (ze(e, t, "read from private field"), t.get(e)), Re = (e, t, i) => t.has(e) ? ft("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), oi = (e, t, i, a) => (ze(e, t, "write to private field"), t.set(e, i), i), w = (e, t, i) => (ze(e, t, "access private method"), i), C, m, De, vt, mt, _t, wt, gt, bt, yt, xt;
let y = class extends G(f) {
  constructor() {
    super(...arguments), Re(this, m), this._definitions = [], this._editing = null, this._steps = [], this._saving = !1, this._saved = !1, this._loading = !1, Re(this, C);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(R, (e) => {
      oi(this, C, e), w(this, m, De).call(this);
    });
  }
  render() {
    return this._loading ? o`<uui-loader-bar></uui-loader-bar>` : this._editing ? w(this, m, xt).call(this) : w(this, m, yt).call(this);
  }
};
C = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakSet();
De = async function() {
  if (Z(this, C)) {
    this._loading = !0;
    try {
      this._definitions = await Z(this, C).getDefinitions();
    } catch {
      this._definitions = [];
    }
    this._loading = !1;
  }
};
vt = function(e) {
  var i;
  this._editing = { ...e };
  const t = (i = Z(this, C)) == null ? void 0 : i.parseDefinition(e.definitionJson);
  this._steps = (t == null ? void 0 : t.steps) ?? [], this._saved = !1;
};
mt = function() {
  this._editing = null, this._steps = [], this._saved = !1;
};
_t = function() {
  this._steps = [...this._steps, { key: "", label: "", actions: [] }];
};
wt = function(e) {
  const t = [...this._steps];
  t[e.detail.index] = e.detail.step, this._steps = t;
};
gt = function(e) {
  this._steps = this._steps.filter((t, i) => i !== e.detail.index);
};
bt = async function() {
  if (!(!Z(this, C) || !this._editing)) {
    this._saving = !0;
    try {
      const e = {
        ...this._editing,
        version: this._editing.version + 1,
        definitionJson: JSON.stringify({ steps: this._steps })
      };
      await Z(this, C).saveDefinition(e), this._saved = !0, await w(this, m, De).call(this);
    } catch {
    }
    this._saving = !1;
  }
};
yt = function() {
  return o`
      <h2>Workflow Definitions</h2>
      ${this._definitions.length === 0 ? o`<p>No workflow definitions found.</p>` : o`
            <div class="def-list">
              ${this._definitions.map(
    (e) => o`
                  <div class="def-card" @click=${() => w(this, m, vt).call(this, e)}>
                    <div>
                      <div class="name">${e.label}</div>
                      <div class="meta">Key: ${e.key} · Version ${e.version}</div>
                    </div>
                    <uui-badge color=${e.isActive ? "positive" : "default"}>
                      ${e.isActive ? "Active" : "Inactive"}
                    </uui-badge>
                  </div>
                `
  )}
            </div>
          `}
    `;
};
xt = function() {
  const e = this._editing, t = this._steps.map((i) => i.key).filter(Boolean);
  return o`
      <div class="editor-header">
        <h2>Edit: ${e.label}</h2>
        <uui-button look="secondary" label="Back" @click=${w(this, m, mt)}>← Back</uui-button>
      </div>

      <div class="editor-fields">
        <div class="field">
          <label>Key</label>
          <uui-input .value=${e.key} disabled></uui-input>
        </div>
        <div class="field">
          <label>Label</label>
          <uui-input .value=${e.label} @input=${(i) => {
    this._editing = { ...e, label: i.target.value };
  }}></uui-input>
        </div>
      </div>

      <div class="steps-header">
        <h3>Steps (${this._steps.length})</h3>
        <uui-button look="outline" label="Add Step" @click=${w(this, m, _t)}>+ Step</uui-button>
      </div>

      ${this._steps.map(
    (i, a) => o`
          <workflow-step-editor
            .step=${i}
            .index=${a}
            .allStepKeys=${t}
            @step-changed=${w(this, m, wt)}
            @step-removed=${w(this, m, gt)}
          ></workflow-step-editor>
        `
  )}

      <div class="button-row">
        <uui-button look="primary" label="Save as Version ${e.version + 1}" ?disabled=${this._saving} @click=${w(this, m, bt)}>
          ${this._saving ? "Saving…" : `Save as Version ${e.version + 1}`}
        </uui-button>
      </div>

      ${this._saved ? o`<div class="success-msg">Definition saved successfully.</div>` : ke}
    `;
};
y.styles = u`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 16px; }
    .def-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .def-card {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px; border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 4px; cursor: pointer;
    }
    .def-card:hover { background: var(--uui-color-surface-alt, #f9fafb); }
    .def-card .name { font-weight: 600; }
    .def-card .meta { font-size: 0.8rem; color: var(--uui-color-text-alt, #6b7280); }
    .editor-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .editor-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-size: 0.8rem; font-weight: 500; }
    .steps-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .steps-header h3 { margin: 0; font-size: 1rem; }
    .button-row { display: flex; gap: 8px; margin-top: 16px; }
    .success-msg { color: #065f46; background: #d1fae5; padding: 8px 12px; border-radius: 4px; margin-top: 12px; }
  `;
z([
  l()
], y.prototype, "_definitions", 2);
z([
  l()
], y.prototype, "_editing", 2);
z([
  l()
], y.prototype, "_steps", 2);
z([
  l()
], y.prototype, "_saving", 2);
z([
  l()
], y.prototype, "_saved", 2);
z([
  l()
], y.prototype, "_loading", 2);
y = z([
  h("workflow-config-editor")
], y);
var li = Object.defineProperty, ci = Object.getOwnPropertyDescriptor, $t = (e) => {
  throw TypeError(e);
}, Ae = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? ci(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && li(t, i, s), s;
}, pi = (e, t, i) => t.has(e) || $t("Cannot " + i), di = (e, t, i) => t.has(e) ? $t("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ui = (e, t, i) => (pi(e, t, "access private method"), i), xe, kt;
const ae = {
  classic: [
    { name: "--swf-chart-step-active-bg", label: "Active Step", value: "#2563eb", type: "color" },
    { name: "--swf-chart-step-completed-bg", label: "Completed Step", value: "#22c55e", type: "color" },
    { name: "--swf-chart-step-pending-bg", label: "Pending Step", value: "#d1d5db", type: "color" }
  ],
  modern: [
    { name: "--swf-chart-step-active-bg", label: "Active Step", value: "#8b5cf6", type: "color" },
    { name: "--swf-chart-step-completed-bg", label: "Completed Step", value: "#10b981", type: "color" },
    { name: "--swf-chart-step-pending-bg", label: "Pending Step", value: "#e5e7eb", type: "color" }
  ],
  compact: [
    { name: "--swf-chart-step-active-bg", label: "Active Step", value: "#0f172a", type: "color" },
    { name: "--swf-chart-step-completed-bg", label: "Completed Step", value: "#059669", type: "color" },
    { name: "--swf-chart-step-pending-bg", label: "Pending Step", value: "#cbd5e1", type: "color" }
  ]
};
let ee = class extends f {
  constructor() {
    super(...arguments), di(this, xe), this.theme = "classic", this._tokens = [];
  }
  connectedCallback() {
    super.connectedCallback(), this._tokens = [...ae[this.theme] ?? ae.classic];
  }
  updated(e) {
    e.has("theme") && (this._tokens = [...ae[this.theme] ?? ae.classic]);
  }
  render() {
    return o`
      <div class="token-list">
        ${this._tokens.map(
      (e, t) => o`
            <div class="token-row">
              <div>
                <div class="token-label">${e.label}</div>
                <div class="token-var">${e.name}</div>
              </div>
              <input
                type="color"
                class="color-input"
                .value=${e.value}
                @input=${(i) => ui(this, xe, kt).call(this, t, i.target.value)}
              />
              <span style="font-size: 0.8rem; font-family: monospace;">${e.value}</span>
            </div>
          `
    )}
      </div>
    `;
  }
};
xe = /* @__PURE__ */ new WeakSet();
kt = function(e, t) {
  this._tokens = this._tokens.map((i, a) => a === e ? { ...i, value: t } : i), document.documentElement.style.setProperty(this._tokens[e].name, t);
};
ee.styles = u`
    :host { display: block; }
    .token-list { display: flex; flex-direction: column; gap: 12px; }
    .token-row { display: flex; align-items: center; gap: 12px; }
    .token-label { min-width: 120px; font-size: 0.85rem; font-weight: 500; }
    .token-var { font-size: 0.7rem; color: var(--uui-color-text-alt, #6b7280); font-family: monospace; }
    .color-input { width: 48px; height: 32px; border: none; cursor: pointer; border-radius: 4px; }
    .preview-bar { margin-top: 16px; }
  `;
Ae([
  c({ type: String })
], ee.prototype, "theme", 2);
Ae([
  l()
], ee.prototype, "_tokens", 2);
ee = Ae([
  h("workflow-theme-token-editor")
], ee);
var hi = Object.defineProperty, fi = Object.getOwnPropertyDescriptor, St = (e) => {
  throw TypeError(e);
}, me = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? fi(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && hi(t, i, s), s;
}, Ie = (e, t, i) => t.has(e) || St("Cannot " + i), vi = (e, t, i) => (Ie(e, t, "read from private field"), t.get(e)), je = (e, t, i) => t.has(e) ? St("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), mi = (e, t, i, a) => (Ie(e, t, "write to private field"), t.set(e, i), i), Ve = (e, t, i) => (Ie(e, t, "access private method"), i), pe, ne, Ct, Et;
const ge = [
  { key: "submit", label: "Submit", actions: [] },
  { key: "review", label: "Review", actions: [] },
  { key: "approve", label: "Approve", actions: [] },
  { key: "publish", label: "Publish", actions: [] }
];
let q = class extends G(f) {
  constructor() {
    super(...arguments), je(this, ne), this._themes = [], this._activeTheme = "classic", this._loading = !1, je(this, pe);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(Se, (e) => {
      mi(this, pe, e), this._activeTheme = e.activeTheme;
    }), this.consumeContext(R, (e) => {
      Ve(this, ne, Ct).call(this, e);
    });
  }
  render() {
    return this._loading ? o`<uui-loader-bar></uui-loader-bar>` : o`
      <h2>Workflow Themes</h2>

      <div class="themes-grid">
        ${this._themes.map(
      (e) => o`
            <div class="theme-card ${e.name === this._activeTheme ? "active" : ""}" @click=${() => Ve(this, ne, Et).call(this, e.name)}>
              <div class="theme-name">${e.label}</div>
              ${e.name === this._activeTheme ? o`<uui-badge color="positive">Active</uui-badge>` : ""}
            </div>
          `
    )}
      </div>

      <workflow-theme-token-editor .theme=${this._activeTheme}></workflow-theme-token-editor>

      <div class="preview-section">
        <h3>Live Preview</h3>
        <div class="preview-charts">
          <div class="chart-preview">
            <div class="chart-preview-label">Horizontal Stepper</div>
            <workflow-pizza-chart .steps=${ge} current-step="review" variant="horizontal-stepper"></workflow-pizza-chart>
          </div>
          <div class="chart-preview">
            <div class="chart-preview-label">Vertical Donut</div>
            <workflow-pizza-chart .steps=${ge} current-step="review" variant="vertical-donut"></workflow-pizza-chart>
          </div>
          <div class="chart-preview">
            <div class="chart-preview-label">Compact Strip</div>
            <workflow-pizza-chart .steps=${ge} current-step="review" variant="compact-strip"></workflow-pizza-chart>
          </div>
        </div>
      </div>
    `;
  }
};
pe = /* @__PURE__ */ new WeakMap();
ne = /* @__PURE__ */ new WeakSet();
Ct = async function(e) {
  this._loading = !0;
  try {
    this._themes = await e.getThemes();
  } catch {
    this._themes = [
      { name: "classic", label: "Classic" },
      { name: "modern", label: "Modern" },
      { name: "compact", label: "Compact" }
    ];
  }
  this._loading = !1;
};
Et = function(e) {
  var t;
  this._activeTheme = e, (t = vi(this, pe)) == null || t.setTheme(e);
};
q.styles = u`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 16px; }
    .themes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .theme-card {
      padding: 16px; border: 2px solid var(--uui-color-border, #e5e7eb);
      border-radius: 8px; cursor: pointer; text-align: center;
    }
    .theme-card:hover { border-color: var(--uui-color-interactive, #3b82f6); }
    .theme-card.active { border-color: var(--uui-color-interactive, #3b82f6); background: rgba(59, 130, 246, 0.05); }
    .theme-name { font-weight: 600; font-size: 0.95rem; text-transform: capitalize; }
    .preview-section { margin-top: 24px; }
    .preview-section h3 { font-size: 1rem; margin: 0 0 12px; }
    .preview-charts { display: flex; flex-direction: column; gap: 24px; }
    .chart-preview { padding: 16px; border: 1px solid var(--uui-color-border, #e5e7eb); border-radius: 6px; }
    .chart-preview-label { font-size: 0.8rem; font-weight: 500; margin-bottom: 8px; color: var(--uui-color-text-alt, #6b7280); }
  `;
me([
  l()
], q.prototype, "_themes", 2);
me([
  l()
], q.prototype, "_activeTheme", 2);
me([
  l()
], q.prototype, "_loading", 2);
q = me([
  h("workflow-themes-workspace")
], q);
var _i = Object.defineProperty, wi = Object.getOwnPropertyDescriptor, Ot = (e) => {
  throw TypeError(e);
}, Wt = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? wi(t, i) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (s = (a ? n(t, i, s) : n(s)) || s);
  return a && s && _i(t, i, s), s;
}, Ke = (e, t, i) => t.has(e) || Ot("Cannot " + i), gi = (e, t, i) => (Ke(e, t, "read from private field"), i ? i.call(e) : t.get(e)), Be = (e, t, i) => t.has(e) ? Ot("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), bi = (e, t, i, a) => (Ke(e, t, "write to private field"), t.set(e, i), i), yi = (e, t, i) => (Ke(e, t, "access private method"), i), oe, $e, Tt;
let de = class extends G(f) {
  constructor() {
    super(...arguments), Be(this, $e), this._view = "queue", Be(this, oe);
  }
  connectedCallback() {
    super.connectedCallback(), bi(this, oe, new Dt(this)), this.provideContext(Se, gi(this, oe));
  }
  render() {
    return o`
      <nav>
        <button class="nav-item ${this._view === "queue" ? "active" : ""}" @click=${() => this._view = "queue"}>
          Queue
        </button>
        <button class="nav-item ${this._view === "definitions" ? "active" : ""}" @click=${() => this._view = "definitions"}>
          Definitions
        </button>
        <button class="nav-item ${this._view === "themes" ? "active" : ""}" @click=${() => this._view = "themes"}>
          Themes
        </button>
      </nav>
      <main>${yi(this, $e, Tt).call(this)}</main>
    `;
  }
};
oe = /* @__PURE__ */ new WeakMap();
$e = /* @__PURE__ */ new WeakSet();
Tt = function() {
  switch (this._view) {
    case "queue":
      return o`<workflow-queue-workspace></workflow-queue-workspace>`;
    case "definitions":
      return o`<workflow-config-editor></workflow-config-editor>`;
    case "themes":
      return o`<workflow-themes-workspace></workflow-themes-workspace>`;
  }
};
de.styles = u`
    :host {
      display: flex;
      height: 100%;
    }
    nav {
      width: 200px;
      flex-shrink: 0;
      border-right: 1px solid var(--uui-color-border, #e5e7eb);
      background: var(--uui-color-surface-alt, #f9fafb);
      padding: 16px 0;
    }
    .nav-item {
      display: block;
      width: 100%;
      padding: 10px 20px;
      border: none;
      background: none;
      text-align: left;
      font-size: 0.9rem;
      cursor: pointer;
      color: var(--uui-color-text, #1f2937);
    }
    .nav-item:hover {
      background: var(--uui-color-surface-emphasis, #e5e7eb);
    }
    .nav-item.active {
      font-weight: 600;
      background: var(--uui-color-surface-emphasis, #e5e7eb);
      border-left: 3px solid var(--uui-color-interactive, #3b82f6);
    }
    main {
      flex: 1;
      overflow-y: auto;
    }
  `;
Wt([
  l()
], de.prototype, "_view", 2);
de = Wt([
  h("workflow-section")
], de);
export {
  Se as THEME_CONTEXT_TOKEN,
  Dt as ThemeContext,
  R as WORKFLOW_CONTEXT_TOKEN,
  N as WorkflowActionEditorElement,
  X as WorkflowCompactStripElement,
  y as WorkflowConfigEditorElement,
  zt as WorkflowContext,
  H as WorkflowHorizontalStepperElement,
  b as WorkflowInstanceFlyoutElement,
  K as WorkflowPizzaChartElement,
  S as WorkflowQueueTableElement,
  M as WorkflowQueueWorkspaceElement,
  de as WorkflowSectionElement,
  L as WorkflowStepEditorElement,
  ee as WorkflowThemeTokenEditorElement,
  q as WorkflowThemesWorkspaceElement,
  U as WorkflowVerticalDonutElement
};
