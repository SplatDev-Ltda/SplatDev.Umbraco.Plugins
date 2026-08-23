import { LitElement as P, nothing as v, html as a, css as K, state as u, customElement as R } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as j } from "@umbraco-cms/backoffice/element-api";
import { c as F } from "./chunks/auth-fetch-BzMCmNwW.js";
async function M(t, e) {
  var i, r, n, h, p;
  try {
    const f = await t(`/umbraco/management/api/v1/media/${encodeURIComponent(e)}`);
    if (f.ok) {
      const g = (r = (i = (await f.json()).values) == null ? void 0 : i.find((z) => z.alias === "umbracoFile")) == null ? void 0 : r.value, k = typeof g == "string" ? g : g == null ? void 0 : g.src;
      if (k) return k;
    }
  } catch {
  }
  try {
    const f = await t(
      `/umbraco/management/api/v1/media/urls?id=${encodeURIComponent(e)}`
    );
    if (!f.ok) return null;
    const b = await f.json();
    return ((p = (h = (n = b == null ? void 0 : b[0]) == null ? void 0 : n.urlInfos) == null ? void 0 : h[0]) == null ? void 0 : p.url) ?? null;
  } catch {
    return null;
  }
}
var J = Object.defineProperty, W = Object.getOwnPropertyDescriptor, S = (t) => {
  throw TypeError(t);
}, d = (t, e, i, r) => {
  for (var n = r > 1 ? void 0 : r ? W(e, i) : e, h = t.length - 1, p; h >= 0; h--)
    (p = t[h]) && (n = (r ? p(e, i, n) : p(n)) || n);
  return r && n && J(e, i, n), n;
}, C = (t, e, i) => e.has(t) || S("Cannot " + i), _ = (t, e, i) => (C(t, e, "read from private field"), i ? i.call(t) : e.get(t)), w = (t, e, i) => e.has(t) ? S("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), l = (t, e, i) => (C(t, e, "access private method"), i), c, s, x, m, T, y, E, L, O, U, D, $, N, A, I;
const q = ["slide", "fade", "cube", "coverflow", "flip"];
let o = class extends j(P) {
  constructor() {
    super(...arguments), w(this, s), w(this, c, F(this)), this._sliders = [], this._slides = [], this._selected = null, this._loading = !1, this._busy = "", this._loadError = null, this._message = null, this._newName = "", this._editingId = null, this._edit = {}, this._slideTitle = "", this._slideSubtitle = "", this._slideLinkUrl = "", this._slideLinkText = "", this._slideKeys = [], this._api = "/umbraco/api/slider";
  }
  connectedCallback() {
    super.connectedCallback(), l(this, s, m).call(this);
  }
  render() {
    return a`
      <h1>Sliders</h1>
      <p class="description">
        The sliders this site defines, how each one plays, and the slides it shows.
        Select a slider to work on its slides.
      </p>

      ${this._loadError ? a`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : v}
      ${this._message ? a`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>` : v}

      <uui-box headline="Sliders (${this._sliders.length})">
        ${this._loading ? a`<uui-loader></uui-loader>` : this._sliders.length === 0 ? a`<p class="empty">No sliders yet. Create one below.</p>` : a`
                <table>
                  <thead>
                    <tr><th>Name</th><th>Effect</th><th>Autoplay</th><th>Loop</th><th>Slides</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._sliders.map(
      (t) => {
        var e, i, r;
        return this._editingId === t.id ? a`<tr class="selected">${l(this, s, I).call(this, t)}</tr>` : a`
                            <tr class=${((e = this._selected) == null ? void 0 : e.id) === t.id ? "selected" : ""}>
                              <td><strong>${t.name}</strong></td>
                              <td><code>${t.effect}</code></td>
                              <td>
                                ${t.autoplay ? a`<span class="tag on">on · ${t.autoplayDelay}ms</span>` : a`<span class="tag">off</span>`}
                              </td>
                              <td>${t.loop ? a`<span class="tag on">on</span>` : a`<span class="tag">off</span>`}</td>
                              <td class="num">${((i = t.slides) == null ? void 0 : i.length) ?? 0}</td>
                              <td class="right">
                                <uui-button compact look="secondary" label="Open ${t.name}"
                                  @click=${() => l(this, s, T).call(this, t)}
                                  >${((r = this._selected) == null ? void 0 : r.id) === t.id ? "Close" : "Slides"}</uui-button>
                                <uui-button compact look="secondary" label="Settings for ${t.name}"
                                  @click=${() => l(this, s, L).call(this, t)}>Settings</uui-button>
                                <uui-button compact look="secondary" color="danger" label="Delete ${t.name}"
                                  ?disabled=${this._busy === `delete:${t.id}`}
                                  @click=${() => l(this, s, U).call(this, t)}>Delete</uui-button>
                              </td>
                            </tr>
                          `;
      }
    )}
                  </tbody>
                </table>
              `}
      </uui-box>

      ${l(this, s, A).call(this)}

      <uui-box headline="Create a slider">
        <div class="field">
          <span class="field-label">Name</span>
          <uui-input
            label="Slider name"
            placeholder="e.g. Homepage hero"
            .value=${this._newName}
            @input=${(t) => this._newName = t.target.value}
          ></uui-input>
          <p class="hint">Starts with autoplay on, a 5 second delay, looping, and the slide effect — all changeable under Settings.</p>
        </div>
        <div class="actions">
          <uui-button look="primary" color="positive" label="Create slider"
            ?disabled=${this._busy === "create"} @click=${l(this, s, E)}
            >${this._busy === "create" ? "Creating…" : "Create slider"}</uui-button>
        </div>
      </uui-box>
    `;
  }
};
c = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
x = function(t) {
  return t.ok ? (this._loadError = null, !0) : (this._loadError = t.status === 401 || t.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${t.status}${t.statusText ? ` ${t.statusText}` : ""}.`, !1);
};
m = async function() {
  this._loading = !0;
  try {
    const t = await _(this, c).call(this, `${this._api}/GetSliders`);
    l(this, s, x).call(this, t) && (this._sliders = await t.json(), this._selected && (this._selected = this._sliders.find((e) => e.id === this._selected.id) ?? null));
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._sliders = [];
  } finally {
    this._loading = !1;
  }
};
T = async function(t) {
  var e;
  if (((e = this._selected) == null ? void 0 : e.id) === t.id) {
    this._selected = null, this._slides = [];
    return;
  }
  this._selected = t, this._slides = [], await l(this, s, y).call(this);
};
y = async function() {
  if (this._selected)
    try {
      const t = await _(this, c).call(this, `${this._api}/GetSlides?sliderId=${this._selected.id}`);
      l(this, s, x).call(this, t) && (this._slides = await t.json());
    } catch {
      this._loadError ?? (this._loadError = "Could not load the slides in that slider.");
    }
};
E = async function() {
  const t = this._newName.trim();
  if (!t) {
    this._message = { ok: !1, text: "A slider needs a name." };
    return;
  }
  this._busy = "create";
  try {
    (await _(this, c).call(this, `${this._api}/CreateSlider`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: t, autoplay: !0, autoplayDelay: 5e3, loop: !0, effect: "slide" })
    })).ok ? (this._message = { ok: !0, text: `Created ${t}.` }, this._newName = "", await l(this, s, m).call(this)) : this._message = { ok: !1, text: "Could not create that slider." };
  } catch {
    this._message = { ok: !1, text: "Could not create that slider." };
  } finally {
    this._busy = "";
  }
};
L = function(t) {
  this._editingId = t.id, this._edit = { ...t, slides: [] }, this._message = null;
};
O = async function() {
  const t = this._edit;
  if (!t.id) return;
  const e = (t.name ?? "").trim();
  if (!e) {
    this._message = { ok: !1, text: "A slider needs a name." };
    return;
  }
  this._busy = `edit:${t.id}`;
  try {
    (await _(this, c).call(this, `${this._api}/UpdateSlider`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, name: e, slides: [] })
    })).ok ? (this._message = { ok: !0, text: `Updated ${e}.` }, this._editingId = null, await l(this, s, m).call(this)) : this._message = { ok: !1, text: "Could not update that slider." };
  } catch {
    this._message = { ok: !1, text: "Could not update that slider." };
  } finally {
    this._busy = "";
  }
};
U = async function(t) {
  var i, r;
  const e = ((i = t.slides) == null ? void 0 : i.length) ?? 0;
  if (window.confirm(
    `Delete the slider "${t.name}"?

${e > 0 ? `Its ${e} slide${e === 1 ? "" : "s"} go with it. ` : ""}The media library is untouched. This cannot be undone.`
  )) {
    this._busy = `delete:${t.id}`;
    try {
      (await _(this, c).call(this, `${this._api}/DeleteSlider?id=${t.id}`, { method: "DELETE" })).ok ? (this._message = { ok: !0, text: `Deleted ${t.name}.` }, ((r = this._selected) == null ? void 0 : r.id) === t.id && (this._selected = null, this._slides = []), await l(this, s, m).call(this)) : this._message = { ok: !1, text: "Could not delete that slider." };
    } catch {
      this._message = { ok: !1, text: "Could not delete that slider." };
    } finally {
      this._busy = "";
    }
  }
};
D = async function() {
  if (!this._selected) return;
  const t = this._slideKeys[0], e = t ? await M(_(this, c), t) : null;
  if (!e) {
    this._message = { ok: !1, text: "Choose an image from the media library first." };
    return;
  }
  this._busy = "slide";
  try {
    (await _(this, c).call(this, `${this._api}/AddSlide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sliderId: this._selected.id,
        title: this._slideTitle.trim() || "Untitled",
        subtitle: this._slideSubtitle.trim() || null,
        imageUrl: e,
        linkUrl: this._slideLinkUrl.trim() || null,
        linkText: this._slideLinkText.trim() || null,
        sortOrder: this._slides.length
      })
    })).ok ? (this._message = { ok: !0, text: "Slide added." }, this._slideTitle = this._slideSubtitle = this._slideLinkUrl = this._slideLinkText = "", this._slideKeys = [], await l(this, s, y).call(this), await l(this, s, m).call(this)) : this._message = { ok: !1, text: "Could not add that slide." };
  } catch {
    this._message = { ok: !1, text: "Could not add that slide." };
  } finally {
    this._busy = "";
  }
};
$ = async function(t, e) {
  const i = [...this._slides].sort((h, p) => h.sortOrder - p.sortOrder), r = i.findIndex((h) => h.id === t.id), n = i[r + e];
  if (n) {
    this._busy = `move:${t.id}`;
    try {
      const h = { ...t, sortOrder: n.sortOrder }, p = { ...n, sortOrder: t.sortOrder };
      for (const f of [h, p])
        if (!(await _(this, c).call(this, `${this._api}/UpdateSlide`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(f)
        })).ok) {
          this._message = { ok: !1, text: "Could not reorder the slides." };
          break;
        }
      await l(this, s, y).call(this);
    } catch {
      this._message = { ok: !1, text: "Could not reorder the slides." };
    } finally {
      this._busy = "";
    }
  }
};
N = async function(t) {
  if (window.confirm(`Remove the slide "${t.title}"?

The image stays in the media library.`)) {
    this._busy = `slide:${t.id}`;
    try {
      (await _(this, c).call(this, `${this._api}/DeleteSlide?id=${t.id}`, { method: "DELETE" })).ok ? (this._message = { ok: !0, text: "Slide removed." }, await l(this, s, y).call(this), await l(this, s, m).call(this)) : this._message = { ok: !1, text: "Could not remove that slide." };
    } catch {
      this._message = { ok: !1, text: "Could not remove that slide." };
    } finally {
      this._busy = "";
    }
  }
};
A = function() {
  if (!this._selected) return v;
  const t = [...this._slides].sort((e, i) => e.sortOrder - i.sortOrder);
  return a`
      <uui-box headline="Slides in ${this._selected.name} (${t.length})">
        ${t.length === 0 ? a`<p class="empty">This slider has no slides yet. Add one below.</p>` : a`
              <table>
                <thead>
                  <tr><th></th><th>Title</th><th>Link</th><th>Order</th><th></th></tr>
                </thead>
                <tbody>
                  ${t.map(
    (e, i) => a`
                      <tr>
                        <td><img class="thumb" src=${e.imageUrl} alt=${e.title} loading="lazy" /></td>
                        <td>
                          <strong>${e.title}</strong>
                          ${e.subtitle ? a`<div class="muted">${e.subtitle}</div>` : v}
                        </td>
                        <td class="muted">${e.linkUrl ? a`<code>${e.linkUrl}</code>` : "—"}</td>
                        <td class="num">
                          <uui-button compact look="secondary" label="Move ${e.title} up"
                            ?disabled=${i === 0 || this._busy === `move:${e.id}`}
                            @click=${() => l(this, s, $).call(this, e, -1)}>↑</uui-button>
                          <uui-button compact look="secondary" label="Move ${e.title} down"
                            ?disabled=${i === t.length - 1 || this._busy === `move:${e.id}`}
                            @click=${() => l(this, s, $).call(this, e, 1)}>↓</uui-button>
                        </td>
                        <td class="right">
                          <uui-button compact look="secondary" color="danger" label="Remove ${e.title}"
                            ?disabled=${this._busy === `slide:${e.id}`}
                            @click=${() => l(this, s, N).call(this, e)}>Remove</uui-button>
                        </td>
                      </tr>
                    `
  )}
                </tbody>
              </table>
            `}

        <div class="field" style="margin-top:18px">
          <span class="field-label">Image</span>
          <umb-input-media
            .selection=${this._slideKeys}
            max="1"
            @change=${(e) => {
    const i = e.target;
    this._slideKeys = i.selection ?? [];
  }}
          ></umb-input-media>
          <p class="hint">Pick from the media library — nothing here asks you to type a URL.</p>
        </div>
        <div class="grid">
          <div>
            <span class="field-label">Title</span>
            <uui-input label="Slide title" .value=${this._slideTitle}
              @input=${(e) => this._slideTitle = e.target.value}></uui-input>
          </div>
          <div>
            <span class="field-label">Subtitle</span>
            <uui-input label="Slide subtitle" placeholder="Optional" .value=${this._slideSubtitle}
              @input=${(e) => this._slideSubtitle = e.target.value}></uui-input>
          </div>
          <div>
            <span class="field-label">Link URL</span>
            <uui-input label="Link URL" placeholder="Optional, e.g. /offers" .value=${this._slideLinkUrl}
              @input=${(e) => this._slideLinkUrl = e.target.value}></uui-input>
          </div>
          <div>
            <span class="field-label">Link text</span>
            <uui-input label="Link text" placeholder="Optional, e.g. See offers" .value=${this._slideLinkText}
              @input=${(e) => this._slideLinkText = e.target.value}></uui-input>
          </div>
        </div>
        <div class="actions">
          <uui-button look="primary" color="positive" label="Add slide"
            ?disabled=${this._busy === "slide" || this._slideKeys.length === 0}
            @click=${l(this, s, D)}>${this._busy === "slide" ? "Adding…" : "Add slide"}</uui-button>
        </div>
      </uui-box>
    `;
};
I = function(t) {
  return a`
      <td colspan="6">
        <div class="grid">
          <div>
            <span class="field-label">Name</span>
            <uui-input label="Name" .value=${this._edit.name ?? ""}
              @input=${(e) => this._edit = { ...this._edit, name: e.target.value }}></uui-input>
          </div>
          <div>
            <span class="field-label">Effect</span>
            <uui-select
              label="Effect"
              .value=${this._edit.effect ?? "slide"}
              @change=${(e) => this._edit = { ...this._edit, effect: e.target.value }}
              .options=${q.map((e) => ({ name: e, value: e, selected: e === (this._edit.effect ?? "slide") }))}
            ></uui-select>
          </div>
          <div>
            <span class="field-label">Autoplay delay (ms)</span>
            <uui-input
              type="number"
              label="Autoplay delay in milliseconds"
              .value=${String(this._edit.autoplayDelay ?? 5e3)}
              @input=${(e) => this._edit = { ...this._edit, autoplayDelay: Number(e.target.value) || 0 }}
            ></uui-input>
          </div>
        </div>
        <div class="toggle-row">
          <uui-toggle
            label="Autoplay"
            ?checked=${this._edit.autoplay ?? !1}
            @change=${(e) => this._edit = { ...this._edit, autoplay: e.target.checked }}
            >Autoplay</uui-toggle
          >
          <uui-toggle
            label="Loop"
            ?checked=${this._edit.loop ?? !1}
            @change=${(e) => this._edit = { ...this._edit, loop: e.target.checked }}
            >Loop</uui-toggle
          >
        </div>
        <div class="actions">
          <uui-button look="primary" color="positive" label="Save ${t.name}"
            ?disabled=${this._busy === `edit:${t.id}`} @click=${l(this, s, O)}>Save</uui-button>
          <uui-button look="secondary" label="Cancel" @click=${() => this._editingId = null}>Cancel</uui-button>
        </div>
      </td>
    `;
};
o.styles = K`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 66ch; }

    uui-box { margin-bottom: 18px; }
    .field { margin-bottom: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
    uui-input, uui-select { width: 100%; }
    .actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }
    .toggle-row { display: flex; gap: 22px; flex-wrap: wrap; align-items: center; margin-top: 6px; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    td.right { text-align: right; white-space: nowrap; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    tr.selected { background: var(--uui-color-surface-alt, #f6f8fa); }

    .thumb {
      width: 64px; height: 40px; object-fit: cover; border-radius: 3px;
      border: 1px solid var(--uui-color-border, #e5e7eb); background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .tag.on { background: #d1fae5; color: #065f46; }
    .muted { color: var(--uui-color-text-alt, #6b7280); }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

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
  `;
d([
  u()
], o.prototype, "_sliders", 2);
d([
  u()
], o.prototype, "_slides", 2);
d([
  u()
], o.prototype, "_selected", 2);
d([
  u()
], o.prototype, "_loading", 2);
d([
  u()
], o.prototype, "_busy", 2);
d([
  u()
], o.prototype, "_loadError", 2);
d([
  u()
], o.prototype, "_message", 2);
d([
  u()
], o.prototype, "_newName", 2);
d([
  u()
], o.prototype, "_editingId", 2);
d([
  u()
], o.prototype, "_edit", 2);
d([
  u()
], o.prototype, "_slideTitle", 2);
d([
  u()
], o.prototype, "_slideSubtitle", 2);
d([
  u()
], o.prototype, "_slideLinkUrl", 2);
d([
  u()
], o.prototype, "_slideLinkText", 2);
d([
  u()
], o.prototype, "_slideKeys", 2);
o = d([
  R("slider-dashboard")
], o);
const B = o;
export {
  o as SliderDashboardElement,
  B as default
};
