import { LitElement as D, nothing as w, html as m, css as I, state as d, customElement as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as j } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as L } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as U } from "@umbraco-cms/backoffice/notification";
function J(e) {
  let t = null, s = null;
  const a = e.consumeContext.bind(e), r = new Promise((i) => {
    a(L, async (l) => {
      var p;
      try {
        t = await ((p = l == null ? void 0 : l.getLatestToken) == null ? void 0 : p.call(l)) ?? null;
      } catch {
        t = null;
      }
      i();
    }), setTimeout(i, 3e3);
  });
  return a(U, (i) => {
    s = i;
  }), async (i, l = {}) => {
    await r;
    const p = new Headers(l.headers);
    t && !p.has("Authorization") && p.set("Authorization", `Bearer ${t}`);
    const u = await fetch(i, { ...l, credentials: "same-origin", headers: p });
    if (!u.ok) {
      const g = u.status === 401 || u.status === 403, N = g ? "Not authorised" : "Could not load data", v = g ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${u.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${u.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${u.status} from ${String(i)} — ${v}`), s == null || s.peek("danger", { data: { headline: N, message: v } });
    }
    return u;
  };
}
var K = Object.defineProperty, z = Object.getOwnPropertyDescriptor, x = (e) => {
  throw TypeError(e);
}, c = (e, t, s, a) => {
  for (var r = a > 1 ? void 0 : a ? z(t, s) : t, i = e.length - 1, l; i >= 0; i--)
    (l = e[i]) && (r = (a ? l(t, s, r) : l(r)) || r);
  return a && r && K(t, s, r), r;
}, k = (e, t, s) => t.has(e) || x("Cannot " + s), f = (e, t, s) => (k(e, t, "read from private field"), s ? s.call(e) : t.get(e)), $ = (e, t, s) => t.has(e) ? x("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), n = (e, t, s) => (k(e, t, "access private method"), s), y, o, _, b, T, O, E, C, S, A;
let h = class extends j(D) {
  constructor() {
    super(...arguments), $(this, o), this._items = [], this._languages = [], this._loading = !0, this._busy = "", this._filter = "", this._loadError = null, this._message = null, this._newKey = "", this._newParent = "", this._newTranslations = {}, this._overrideOnImport = !1, $(this, y, J(this)), this._api = "/umbraco/api/dictionarymanager";
  }
  connectedCallback() {
    super.connectedCallback(), n(this, o, b).call(this);
  }
  render() {
    const e = n(this, o, A).call(this);
    return m`
      <h1>Dictionary</h1>
      <p class="description">
        Every dictionary item on the site and its translations. Edit a value and it saves
        when you leave the field. You can also move the whole set in and out as JSON.
      </p>

      ${this._loadError ? m`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : w}
      ${this._message ? m`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>` : w}

      <uui-box headline="Items">
        <div class="toolbar">
          <uui-input
            class="grow"
            placeholder="Filter by key or translation"
            .value=${this._filter}
            @input=${(t) => this._filter = t.target.value}
          ></uui-input>
          <uui-button
            look="secondary"
            label="Export JSON"
            ?disabled=${this._busy === "export"}
            @click=${n(this, o, C)}
            >${this._busy === "export" ? "Exporting…" : "Export JSON"}</uui-button
          >
          <input id="importFile" type="file" accept="application/json,.json" style="display:none"
            @change=${n(this, o, S)} />
          <uui-button
            look="secondary"
            label="Import JSON"
            ?disabled=${this._busy === "import"}
            @click=${() => {
      var t, s;
      return (s = (t = this.shadowRoot) == null ? void 0 : t.querySelector("#importFile")) == null ? void 0 : s.click();
    }}
            >${this._busy === "import" ? "Importing…" : "Import JSON"}</uui-button
          >
          <uui-toggle
            label="Overwrite on import"
            ?checked=${this._overrideOnImport}
            @change=${(t) => this._overrideOnImport = t.target.checked}
            >Overwrite existing on import</uui-toggle
          >
        </div>

        ${this._loading ? m`<uui-loader></uui-loader>` : e.length === 0 ? m`<p class="empty">
                ${this._items.length === 0 ? "No dictionary items yet. Add one below." : "Nothing matches that filter."}
              </p>` : m`
                <div class="scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Key</th>
                        ${this._languages.map((t) => m`<th>${t}</th>`)}
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      ${e.map(
      (t) => m`
                          <tr>
                            <td class="keycell">
                              <span class=${t.parentKey ? "child" : ""}>${t.key}</span>
                            </td>
                            ${this._languages.map(
        (s) => {
          var a;
          return m`
                                <td>
                                  <uui-input
                                    .value=${((a = t.translations) == null ? void 0 : a[s]) ?? ""}
                                    ?disabled=${this._busy === `save:${t.key}:${s}`}
                                    @blur=${(r) => n(this, o, T).call(this, t, s, r.target.value)}
                                  ></uui-input>
                                </td>
                              `;
        }
      )}
                            <td>
                              <uui-button
                                compact
                                look="secondary"
                                color="danger"
                                label="Delete ${t.key}"
                                ?disabled=${this._busy === `delete:${t.key}`}
                                @click=${() => n(this, o, E).call(this, t.key)}
                                >Delete</uui-button
                              >
                            </td>
                          </tr>
                        `
    )}
                    </tbody>
                  </table>
                </div>
              `}
      </uui-box>

      <uui-box headline="Add an item">
        <div class="new-grid">
          <div>
            <span class="field-label">Key</span>
            <uui-input
              placeholder="e.g. general.close"
              .value=${this._newKey}
              @input=${(t) => this._newKey = t.target.value}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Parent key (optional)</span>
            <uui-input
              placeholder="Leave empty for a root item"
              .value=${this._newParent}
              @input=${(t) => this._newParent = t.target.value}
            ></uui-input>
          </div>
          ${this._languages.map(
      (t) => m`
              <div>
                <span class="field-label">${t}</span>
                <uui-input
                  .value=${this._newTranslations[t] ?? ""}
                  @input=${(s) => this._newTranslations = {
        ...this._newTranslations,
        [t]: s.target.value
      }}
                ></uui-input>
              </div>
            `
    )}
        </div>
        <p class="hint">
          A parent key nests this item beneath an existing one, the same as the dictionary
          tree in the Translation section.
        </p>
        <div class="toolbar" style="margin-top:14px;">
          <uui-button
            look="primary"
            color="positive"
            label="Add item"
            ?disabled=${this._busy === "create"}
            @click=${n(this, o, O)}
            >${this._busy === "create" ? "Adding…" : "Add item"}</uui-button
          >
        </div>
      </uui-box>
    `;
  }
};
y = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
_ = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to manage dictionary items. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
b = async function() {
  this._loading = !0;
  try {
    const e = await f(this, y).call(this, `${this._api}/GetAll`);
    if (n(this, o, _).call(this, e)) {
      this._items = await e.json();
      const t = /* @__PURE__ */ new Set();
      for (const s of this._items)
        for (const a of Object.keys(s.translations ?? {})) t.add(a);
      this._languages = [...t].sort();
    }
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details.");
  } finally {
    this._loading = !1;
  }
};
T = async function(e, t, s) {
  var a;
  if ((((a = e.translations) == null ? void 0 : a[t]) ?? "") !== s) {
    this._busy = `save:${e.key}:${t}`;
    try {
      const r = {
        ...e,
        translations: { ...e.translations, [t]: s }
      }, i = await f(this, y).call(this, `${this._api}/Update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r)
      });
      n(this, o, _).call(this, i) && (e.translations = r.translations, this._message = { ok: !0, text: `Saved ${e.key} (${t}).` });
    } catch {
      this._message = { ok: !1, text: `Could not save ${e.key}.` };
    } finally {
      this._busy = "";
    }
  }
};
O = async function() {
  const e = this._newKey.trim();
  if (!e) {
    this._message = { ok: !1, text: "Give the item a key." };
    return;
  }
  this._busy = "create";
  try {
    const t = await f(this, y).call(this, `${this._api}/Create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: e,
        parentKey: this._newParent.trim() || null,
        value: "",
        languageCode: this._languages[0] ?? "",
        translations: this._newTranslations
      })
    });
    n(this, o, _).call(this, t) && (this._message = { ok: !0, text: `Created ${e}.` }, this._newKey = "", this._newParent = "", this._newTranslations = {}, await n(this, o, b).call(this));
  } catch {
    this._message = { ok: !1, text: "Could not create that item." };
  } finally {
    this._busy = "";
  }
};
E = async function(e) {
  this._busy = `delete:${e}`;
  try {
    const t = await f(this, y).call(this, `${this._api}/Delete?key=${encodeURIComponent(e)}`, {
      method: "DELETE"
    });
    n(this, o, _).call(this, t) && (this._message = { ok: !0, text: `Deleted ${e}.` }, await n(this, o, b).call(this));
  } catch {
    this._message = { ok: !1, text: `Could not delete ${e}.` };
  } finally {
    this._busy = "";
  }
};
C = async function() {
  this._busy = "export";
  try {
    const e = await f(this, y).call(this, `${this._api}/Export`);
    if (!n(this, o, _).call(this, e)) return;
    const t = await e.blob(), s = URL.createObjectURL(t), a = document.createElement("a");
    a.href = s, a.download = "dictionary-export.json", a.click(), URL.revokeObjectURL(s), this._message = { ok: !0, text: `Exported ${this._items.length} item(s).` };
  } catch {
    this._message = { ok: !1, text: "Could not export." };
  } finally {
    this._busy = "";
  }
};
S = async function(e) {
  var a;
  const t = e.target, s = (a = t.files) == null ? void 0 : a[0];
  if (t.value = "", !!s) {
    this._busy = "import";
    try {
      const r = await s.text();
      let i;
      try {
        i = JSON.parse(r);
      } catch {
        this._message = { ok: !1, text: `${s.name} is not valid JSON.` };
        return;
      }
      if (!Array.isArray(i) || i.length === 0) {
        this._message = { ok: !1, text: `${s.name} contains no dictionary items.` };
        return;
      }
      const l = await f(this, y).call(this, `${this._api}/Import?overrideExisting=${this._overrideOnImport}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(i)
      });
      if (!n(this, o, _).call(this, l)) return;
      const p = await l.json(), u = p.filter((g) => !g.success);
      this._message = {
        ok: u.length === 0,
        text: `Imported ${p.length - u.length} of ${p.length} item(s).` + (u.length ? ` Skipped: ${u.map((g) => g.key).join(", ")}.` : "")
      }, await n(this, o, b).call(this);
    } catch {
      this._message = { ok: !1, text: "Could not import that file." };
    } finally {
      this._busy = "";
    }
  }
};
A = function() {
  const e = this._filter.trim().toLowerCase();
  return e ? this._items.filter(
    (t) => t.key.toLowerCase().includes(e) || Object.values(t.translations ?? {}).some((s) => s.toLowerCase().includes(e))
  ) : this._items;
};
h.styles = I`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 64ch; }

    uui-box { margin-bottom: 18px; }
    .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
    .grow { flex: 1 1 220px; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }

    .scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 560px; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 7px 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    td.keycell { font-family: var(--uui-font-monospace, monospace); white-space: nowrap; }
    .child::before { content: "↳"; opacity: 0.45; margin-right: 6px; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }
    uui-input { width: 100%; }

    .msg, .splatdev-load-error {
      display: block; margin: 0 0 14px; padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem; border-radius: 3px;
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
    .new-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
  `;
c([
  d()
], h.prototype, "_items", 2);
c([
  d()
], h.prototype, "_languages", 2);
c([
  d()
], h.prototype, "_loading", 2);
c([
  d()
], h.prototype, "_busy", 2);
c([
  d()
], h.prototype, "_filter", 2);
c([
  d()
], h.prototype, "_loadError", 2);
c([
  d()
], h.prototype, "_message", 2);
c([
  d()
], h.prototype, "_newKey", 2);
c([
  d()
], h.prototype, "_newParent", 2);
c([
  d()
], h.prototype, "_newTranslations", 2);
c([
  d()
], h.prototype, "_overrideOnImport", 2);
h = c([
  P("dictionarymanager-dashboard")
], h);
const B = h;
export {
  h as DictionaryManagerDashboardElement,
  B as default
};
