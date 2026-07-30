import { css as w, property as $, state as i, customElement as k, html as o, repeat as U, when as O } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as P } from "@umbraco-cms/backoffice/lit-element";
var oe = Object.defineProperty, ie = Object.getOwnPropertyDescriptor, W = (e) => {
  throw TypeError(e);
}, E = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? ie(t, r) : t, l = e.length - 1, n; l >= 0; l--)
    (n = e[l]) && (a = (s ? n(t, r, a) : n(a)) || a);
  return s && a && oe(t, r, a), a;
}, le = (e, t, r) => t.has(e) || W("Cannot " + r), ne = (e, t, r) => t.has(e) ? W("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), T = (e, t, r) => (le(e, t, "access private method"), r), F, R, B;
const ce = "splatdev-theme-picker-property-editor";
let y = class extends P {
  constructor() {
    super(...arguments), ne(this, F), this.value = "", this._state = "loading", this._errorMessage = "", this._options = [];
  }
  async connectedCallback() {
    super.connectedCallback(), await T(this, F, R).call(this);
  }
  render() {
    switch (this._state) {
      case "loading":
        return o`<uui-loader-bar></uui-loader-bar>`;
      case "error":
        return o`<uui-badge look="danger" color="danger">
          <uui-icon name="icon-alert"></uui-icon> ${this._errorMessage}
        </uui-badge>`;
      case "empty":
        return o`<p><em>No themes available.</em></p>`;
      case "ready":
        return o`
          <uui-select
            @change=${T(this, F, B)}
            .options=${this._options.map((e) => ({
          ...e,
          selected: e.value === this.value
        }))}
          ></uui-select>`;
    }
  }
};
F = /* @__PURE__ */ new WeakSet();
R = async function() {
  this._state = "loading", this._errorMessage = "";
  try {
    const e = await fetch("/umbraco/backoffice/umbracoforms/themes/getall");
    if (!e.ok) {
      this._state = "error", this._errorMessage = e.status >= 400 && e.status < 500 ? "Theme data is not available. Please check your configuration." : "Failed to load themes. Server error.";
      return;
    }
    const t = await e.json();
    this._options = t.map((r) => ({ name: r, value: r })), this._state = this._options.length > 0 ? "ready" : "empty";
  } catch {
    this._state = "error", this._errorMessage = "Unable to connect. Please check your network connection.";
  }
};
B = function(e) {
  const t = e.target;
  this.value = t.value, this.dispatchEvent(new CustomEvent("property-value-change"));
};
y.styles = [
  w`
      :host { display: block; width: 100%; }
      uui-select { width: 100%; }
    `
];
E([
  $()
], y.prototype, "value", 2);
E([
  i()
], y.prototype, "_state", 2);
E([
  i()
], y.prototype, "_errorMessage", 2);
E([
  i()
], y.prototype, "_options", 2);
y = E([
  k(ce)
], y);
var ue = Object.defineProperty, he = Object.getOwnPropertyDescriptor, V = (e) => {
  throw TypeError(e);
}, g = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? he(t, r) : t, l = e.length - 1, n; l >= 0; l--)
    (n = e[l]) && (a = (s ? n(t, r, a) : n(a)) || a);
  return s && a && ue(t, r, a), a;
}, de = (e, t, r) => t.has(e) || V("Cannot " + r), pe = (e, t, r) => t.has(e) ? V("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), N = (e, t, r) => (de(e, t, "access private method"), r), S, j, G;
const _e = "splatdev-folder-picker-property-editor";
let _ = class extends P {
  constructor() {
    super(...arguments), pe(this, S), this.value = [], this._state = "loading", this._errorMessage = "", this._folders = [], this._selected = [];
  }
  async connectedCallback() {
    super.connectedCallback(), await N(this, S, j).call(this);
  }
  render() {
    switch (this._state) {
      case "loading":
        return o`<uui-loader-bar></uui-loader-bar>`;
      case "error":
        return o`<uui-badge look="danger" color="danger">
          <uui-icon name="icon-alert"></uui-icon> ${this._errorMessage}
        </uui-badge>`;
      case "empty":
        return o`<p><em>No folders available.</em></p>`;
      case "ready":
        return o`
          <div class="folder-list">
            ${U(
          this._folders,
          (e) => e.unique,
          (e) => {
            const t = this._selected.some((r) => r.unique === e.unique);
            return o`
                  <uui-checkbox
                    .value=${e.unique}
                    .checked=${t}
                    @change=${() => N(this, S, G).call(this, e)}
                  >
                    <uui-icon name="icon-folder"></uui-icon> ${e.name}
                  </uui-checkbox>
                `;
          }
        )}
          </div>
        `;
    }
  }
};
S = /* @__PURE__ */ new WeakSet();
j = async function() {
  this._state = "loading", this._errorMessage = "";
  try {
    const e = await fetch("/umbraco/backoffice/umbracoforms/folders/getall");
    if (!e.ok) {
      this._state = "error", this._errorMessage = e.status >= 400 && e.status < 500 ? "Folder data is not available." : "Failed to load folders. Server error.";
      return;
    }
    const t = await e.json();
    this._folders = t, this._state = this._folders.length > 0 ? "ready" : "empty";
  } catch {
    this._state = "error", this._errorMessage = "Unable to connect.";
  }
};
G = function(e) {
  this._selected.findIndex((r) => r.unique === e.unique) >= 0 ? this._selected = this._selected.filter((r) => r.unique !== e.unique) : this._selected = [...this._selected, e], this.value = this._selected.map((r) => r.unique), this.dispatchEvent(new CustomEvent("property-value-change"));
};
_.styles = [
  w`
      :host { display: block; width: 100%; }
      .folder-list { display: flex; flex-direction: column; gap: 4px; }
    `
];
g([
  $({ type: Array })
], _.prototype, "value", 2);
g([
  i()
], _.prototype, "_state", 2);
g([
  i()
], _.prototype, "_errorMessage", 2);
g([
  i()
], _.prototype, "_folders", 2);
g([
  i()
], _.prototype, "_selected", 2);
_ = g([
  k(_e)
], _);
var me = Object.defineProperty, ve = Object.getOwnPropertyDescriptor, L = (e) => {
  throw TypeError(e);
}, b = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? ve(t, r) : t, l = e.length - 1, n; l >= 0; l--)
    (n = e[l]) && (a = (s ? n(t, r, a) : n(a)) || a);
  return s && a && me(t, r, a), a;
}, ye = (e, t, r) => t.has(e) || L("Cannot " + r), fe = (e, t, r) => t.has(e) ? L("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), A = (e, t, r) => (ye(e, t, "access private method"), r), M, z, H;
const ge = "splatdev-form-picker-single-property-editor";
let m = class extends P {
  constructor() {
    super(...arguments), fe(this, M), this.value = "", this._state = "loading", this._errorMessage = "", this._forms = [], this._selectedName = "", this._allowedFolders = [], this._allowedForms = [];
  }
  set config(e) {
    this._allowedFolders = (e == null ? void 0 : e.getValueByAlias("allowedFolders")) ?? [], this._allowedForms = (e == null ? void 0 : e.getValueByAlias("allowedForms")) ?? [];
  }
  async connectedCallback() {
    super.connectedCallback(), await A(this, M, z).call(this);
  }
  render() {
    switch (this._state) {
      case "loading":
        return o`<uui-loader-bar></uui-loader-bar>`;
      case "error":
        return o`<uui-badge look="danger" color="danger">
          <uui-icon name="icon-alert"></uui-icon> ${this._errorMessage}
        </uui-badge>`;
      case "empty":
        return o`<p><em>No forms available.</em></p>`;
      case "ready":
        return o`
          <uui-select
            @change=${A(this, M, H)}
            .options=${[
          { name: "— Select a form —", value: "", selected: !this.value },
          ...this._forms.map((e) => ({
            name: e.name,
            value: e.unique,
            selected: e.unique === this.value
          }))
        ]}
          ></uui-select>
        `;
    }
  }
};
M = /* @__PURE__ */ new WeakSet();
z = async function() {
  this._state = "loading", this._errorMessage = "";
  try {
    const e = await fetch("/umbraco/backoffice/umbracoforms/forms/getall");
    if (!e.ok) {
      this._state = "error", this._errorMessage = e.status >= 400 && e.status < 500 ? "Form data is not available. Please check your configuration." : "Failed to load forms. Server error.";
      return;
    }
    const r = (await e.json()).filter((s) => !s.isFolder);
    if (this._forms = r, this.value) {
      const s = r.find((a) => a.unique === this.value);
      this._selectedName = (s == null ? void 0 : s.name) ?? "";
    }
    this._state = this._forms.length > 0 ? "ready" : "empty";
  } catch {
    this._state = "error", this._errorMessage = "Unable to connect.";
  }
};
H = function(e) {
  var r;
  const t = e.target;
  this.value = t.value, this._selectedName = ((r = t.selectedOptions[0]) == null ? void 0 : r.text) ?? "", this.dispatchEvent(new CustomEvent("property-value-change"));
};
m.styles = [
  w`
      :host { display: block; width: 100%; }
      uui-select { width: 100%; }
    `
];
b([
  $({ type: String })
], m.prototype, "value", 2);
b([
  i()
], m.prototype, "_state", 2);
b([
  i()
], m.prototype, "_errorMessage", 2);
b([
  i()
], m.prototype, "_forms", 2);
b([
  i()
], m.prototype, "_selectedName", 2);
m = b([
  k(ge)
], m);
var be = Object.defineProperty, we = Object.getOwnPropertyDescriptor, J = (e) => {
  throw TypeError(e);
}, C = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? we(t, r) : t, l = e.length - 1, n; l >= 0; l--)
    (n = e[l]) && (a = (s ? n(t, r, a) : n(a)) || a);
  return s && a && be(t, r, a), a;
}, $e = (e, t, r) => t.has(e) || J("Cannot " + r), ke = (e, t, r) => t.has(e) ? J("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), D = (e, t, r) => ($e(e, t, "access private method"), r), q, K, Q;
const Pe = "splatdev-form-picker-multiple-property-editor";
let f = class extends P {
  constructor() {
    super(...arguments), ke(this, q), this.value = [], this._state = "loading", this._errorMessage = "", this._forms = [], this._allowedFolders = [], this._allowedForms = [];
  }
  set config(e) {
    this._allowedFolders = (e == null ? void 0 : e.getValueByAlias("allowedFolders")) ?? [], this._allowedForms = (e == null ? void 0 : e.getValueByAlias("allowedForms")) ?? [];
  }
  async connectedCallback() {
    super.connectedCallback(), await D(this, q, K).call(this);
  }
  render() {
    switch (this._state) {
      case "loading":
        return o`<uui-loader-bar></uui-loader-bar>`;
      case "error":
        return o`<uui-badge look="danger" color="danger">
          <uui-icon name="icon-alert"></uui-icon> ${this._errorMessage}
        </uui-badge>`;
      case "empty":
        return o`<p><em>No forms available.</em></p>`;
      case "ready":
        return o`
          <div class="form-list">
            ${U(
          this._forms,
          (e) => e.unique,
          (e) => {
            const t = this.value.includes(e.unique);
            return o`
                  <uui-checkbox
                    .value=${e.unique}
                    .checked=${t}
                    @change=${() => D(this, q, Q).call(this, e)}
                  >
                    <uui-icon name="icon-umb-contour"></uui-icon> ${e.name}
                  </uui-checkbox>
                `;
          }
        )}
          </div>
        `;
    }
  }
};
q = /* @__PURE__ */ new WeakSet();
K = async function() {
  this._state = "loading", this._errorMessage = "";
  try {
    const e = await fetch("/umbraco/backoffice/umbracoforms/forms/getall");
    if (!e.ok) {
      this._state = "error", this._errorMessage = e.status >= 400 && e.status < 500 ? "Form data is not available. Please check your configuration." : "Failed to load forms. Server error.";
      return;
    }
    const t = await e.json();
    this._forms = t.filter((r) => !r.isFolder), this._state = this._forms.length > 0 ? "ready" : "empty";
  } catch {
    this._state = "error", this._errorMessage = "Unable to connect.";
  }
};
Q = function(e) {
  this.value.indexOf(e.unique) >= 0 ? this.value = this.value.filter((r) => r !== e.unique) : this.value = [...this.value, e.unique], this.dispatchEvent(new CustomEvent("property-value-change")), this.requestUpdate();
};
f.styles = [
  w`
      :host { display: block; width: 100%; }
      .form-list { display: flex; flex-direction: column; gap: 4px; }
    `
];
C([
  $({ type: Array })
], f.prototype, "value", 2);
C([
  i()
], f.prototype, "_state", 2);
C([
  i()
], f.prototype, "_errorMessage", 2);
C([
  i()
], f.prototype, "_forms", 2);
f = C([
  k(Pe)
], f);
var Ee = Object.defineProperty, Ce = Object.getOwnPropertyDescriptor, X = (e) => {
  throw TypeError(e);
}, p = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? Ce(t, r) : t, l = e.length - 1, n; l >= 0; l--)
    (n = e[l]) && (a = (s ? n(t, r, a) : n(a)) || a);
  return s && a && Ee(t, r, a), a;
}, x = (e, t, r) => t.has(e) || X("Cannot " + r), d = (e, t, r) => (x(e, t, "read from private field"), r ? r.call(e) : t.get(e)), I = (e, t, r) => t.has(e) ? X("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Fe = (e, t, r, s) => (x(e, t, "write to private field"), t.set(e, r), r), v = (e, t, r) => (x(e, t, "access private method"), r), c, h, Y, Z, ee, te, re, ae, se;
const Se = "splatdev-form-details-picker-property-editor";
let u = class extends P {
  constructor() {
    super(...arguments), I(this, h), I(this, c, { formId: null, theme: null, redirectToPageId: null }), this._formsState = "loading", this._themesState = "loading", this._errorMessage = "", this._forms = [], this._themes = [], this._includeThemePicker = !1, this._includeRedirectPicker = !1;
  }
  get value() {
    return d(this, c);
  }
  set value(e) {
    Fe(this, c, e ? { ...e } : { formId: null, theme: null, redirectToPageId: null });
  }
  set config(e) {
    this._includeThemePicker = (e == null ? void 0 : e.getValueByAlias("includeThemePicker")) ?? !1, this._includeRedirectPicker = (e == null ? void 0 : e.getValueByAlias("includeRedirectPicker")) ?? !1;
  }
  async connectedCallback() {
    super.connectedCallback(), await Promise.all([v(this, h, Y).call(this), v(this, h, Z).call(this)]);
  }
  render() {
    return o`
      <umb-property-layout alias="form" label="Form">
        ${v(this, h, ae).call(this)}
      </umb-property-layout>

      ${O(this._includeThemePicker, () => o`
        <umb-property-layout alias="theme" label="Theme">
          ${v(this, h, se).call(this)}
        </umb-property-layout>
      `)}

      ${O(this._includeRedirectPicker, () => o`
        <umb-property-layout alias="redirect" label="Redirect to Page">
          <uui-input
            .value=${d(this, c).redirectToPageId ?? ""}
            @change=${v(this, h, re)}
            placeholder="Enter page GUID"
          ></uui-input>
        </umb-property-layout>
      `)}
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakSet();
Y = async function() {
  this._formsState = "loading";
  try {
    const e = await fetch("/umbraco/backoffice/umbracoforms/forms/getall");
    if (!e.ok) {
      this._formsState = "error", this._errorMessage = e.status >= 400 && e.status < 500 ? "Form data unavailable." : "Server error loading forms.";
      return;
    }
    const t = await e.json();
    this._forms = t.filter((r) => !r.isFolder), this._formsState = this._forms.length > 0 ? "ready" : "empty";
  } catch {
    this._formsState = "error", this._errorMessage = "Unable to load forms.";
  }
};
Z = async function() {
  this._themesState = "loading";
  try {
    const e = await fetch("/umbraco/backoffice/umbracoforms/themes/getall");
    if (!e.ok) {
      this._themesState = "error";
      return;
    }
    const t = await e.json();
    this._themes = t.map((r) => ({ name: r, value: r })), this._themesState = this._themes.length > 0 ? "ready" : "empty";
  } catch {
    this._themesState = "error";
  }
};
ee = function(e) {
  const t = e.target;
  d(this, c).formId = t.value || null, this.requestUpdate(), this.dispatchEvent(new CustomEvent("property-value-change"));
};
te = function(e) {
  const t = e.target;
  d(this, c).theme = t.value || null, this.requestUpdate(), this.dispatchEvent(new CustomEvent("property-value-change"));
};
re = function(e) {
  const t = e.target;
  d(this, c).redirectToPageId = t.value || null, this.requestUpdate(), this.dispatchEvent(new CustomEvent("property-value-change"));
};
ae = function() {
  switch (this._formsState) {
    case "loading":
      return o`<uui-loader-bar></uui-loader-bar>`;
    case "error":
      return o`<uui-badge look="danger">${this._errorMessage}</uui-badge>`;
    case "empty":
      return o`<p><em>No forms available.</em></p>`;
    case "ready":
      return o`
          <uui-select
            @change=${v(this, h, ee)}
            .options=${[
        { name: "— Select a form —", value: "", selected: !d(this, c).formId },
        ...this._forms.map((e) => ({ name: e.name, value: e.unique, selected: e.unique === d(this, c).formId }))
      ]}
          ></uui-select>`;
  }
};
se = function() {
  switch (this._themesState) {
    case "loading":
      return o`<uui-loader-bar></uui-loader-bar>`;
    case "error":
      return o`<uui-badge look="danger">Theme data unavailable.</uui-badge>`;
    case "empty":
      return o`<p><em>No themes available.</em></p>`;
    case "ready":
      return o`
          <uui-select
            @change=${v(this, h, te)}
            .options=${[
        { name: "— Select a theme —", value: "", selected: !d(this, c).theme },
        ...this._themes.map((e) => ({ ...e, selected: e.value === d(this, c).theme }))
      ]}
          ></uui-select>`;
  }
};
u.styles = [
  w`
      :host { display: block; width: 100%; }
      uui-select { width: 100%; }
      uui-input { width: 100%; }
    `
];
p([
  $({ type: Object })
], u.prototype, "value", 1);
p([
  i()
], u.prototype, "_formsState", 2);
p([
  i()
], u.prototype, "_themesState", 2);
p([
  i()
], u.prototype, "_errorMessage", 2);
p([
  i()
], u.prototype, "_forms", 2);
p([
  i()
], u.prototype, "_themes", 2);
p([
  i()
], u.prototype, "_includeThemePicker", 2);
p([
  i()
], u.prototype, "_includeRedirectPicker", 2);
u = p([
  k(Se)
], u);
export {
  _ as FolderPickerPropertyEditorElement,
  u as FormDetailsPickerPropertyEditorElement,
  f as FormPickerMultiplePropertyEditorElement,
  m as FormPickerSinglePropertyEditorElement,
  y as ThemePickerPropertyEditorElement
};
//# sourceMappingURL=formsclone-property-editors.js.map
