import { LitElement as P, nothing as k, html as d, css as j, state as c, customElement as K } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as R } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as M } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as F } from "@umbraco-cms/backoffice/notification";
function q(e) {
  let t = null, i = null;
  const n = e.consumeContext.bind(e), u = new Promise((l) => {
    n(M, async (o) => {
      var p;
      try {
        t = await ((p = o == null ? void 0 : o.getLatestToken) == null ? void 0 : p.call(o)) ?? null;
      } catch {
        t = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return n(F, (l) => {
    i = l;
  }), async (l, o = {}) => {
    await u;
    const p = new Headers(o.headers);
    t && !p.has("Authorization") && p.set("Authorization", `Bearer ${t}`);
    const m = await fetch(l, { ...o, credentials: "same-origin", headers: p });
    if (!m.ok) {
      const b = m.status === 401 || m.status === 403, v = b ? "Not authorised" : "Could not load data", $ = b ? `The backoffice token was ${t ? "sent but rejected" : "not available"} (${m.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${m.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${m.status} from ${String(l)} — ${$}`), i == null || i.peek("danger", { data: { headline: v, message: $ } });
    }
    return m;
  };
}
async function J(e, t) {
  var i, n, u, l, o;
  try {
    const p = await e(`/umbraco/management/api/v1/media/${encodeURIComponent(t)}`);
    if (p.ok) {
      const b = (n = (i = (await p.json()).values) == null ? void 0 : i.find(($) => $.alias === "umbracoFile")) == null ? void 0 : n.value, v = typeof b == "string" ? b : b == null ? void 0 : b.src;
      if (v) return v;
    }
  } catch {
  }
  try {
    const p = await e(
      `/umbraco/management/api/v1/media/urls?id=${encodeURIComponent(t)}`
    );
    if (!p.ok) return null;
    const m = await p.json();
    return ((o = (l = (u = m == null ? void 0 : m[0]) == null ? void 0 : u.urlInfos) == null ? void 0 : l[0]) == null ? void 0 : o.url) ?? null;
  } catch {
    return null;
  }
}
var W = Object.defineProperty, B = Object.getOwnPropertyDescriptor, T = (e) => {
  throw TypeError(e);
}, h = (e, t, i, n) => {
  for (var u = n > 1 ? void 0 : n ? B(t, i) : t, l = e.length - 1, o; l >= 0; l--)
    (o = e[l]) && (u = (n ? o(t, i, u) : o(u)) || u);
  return n && u && W(t, i, u), u;
}, C = (e, t, i) => t.has(e) || T("Cannot " + i), _ = (e, t, i) => (C(e, t, "read from private field"), i ? i.call(e) : t.get(e)), S = (e, t, i) => t.has(e) ? T("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), a = (e, t, i) => (C(e, t, "access private method"), i), f, s, w, g, E, y, O, L, U, N, A, x, D, I, z;
const G = ["slide", "fade", "cube", "coverflow", "flip"];
let r = class extends R(P) {
  constructor() {
    super(...arguments), S(this, s), S(this, f, q(this)), this._sliders = [], this._slides = [], this._selected = null, this._loading = !1, this._busy = "", this._loadError = null, this._message = null, this._newName = "", this._editingId = null, this._edit = {}, this._slideTitle = "", this._slideSubtitle = "", this._slideLinkUrl = "", this._slideLinkText = "", this._slideKeys = [], this._api = "/umbraco/api/slider";
  }
  connectedCallback() {
    super.connectedCallback(), a(this, s, g).call(this);
  }
  render() {
    return d`
      <h1>Sliders</h1>
      <p class="description">
        The sliders this site defines, how each one plays, and the slides it shows.
        Select a slider to work on its slides.
      </p>

      ${this._loadError ? d`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : k}
      ${this._message ? d`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>` : k}

      <uui-box headline="Sliders (${this._sliders.length})">
        ${this._loading ? d`<uui-loader></uui-loader>` : this._sliders.length === 0 ? d`<p class="empty">No sliders yet. Create one below.</p>` : d`
                <table>
                  <thead>
                    <tr><th>Name</th><th>Effect</th><th>Autoplay</th><th>Loop</th><th>Slides</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._sliders.map(
      (e) => {
        var t, i, n;
        return this._editingId === e.id ? d`<tr class="selected">${a(this, s, z).call(this, e)}</tr>` : d`
                            <tr class=${((t = this._selected) == null ? void 0 : t.id) === e.id ? "selected" : ""}>
                              <td><strong>${e.name}</strong></td>
                              <td><code>${e.effect}</code></td>
                              <td>
                                ${e.autoplay ? d`<span class="tag on">on · ${e.autoplayDelay}ms</span>` : d`<span class="tag">off</span>`}
                              </td>
                              <td>${e.loop ? d`<span class="tag on">on</span>` : d`<span class="tag">off</span>`}</td>
                              <td class="num">${((i = e.slides) == null ? void 0 : i.length) ?? 0}</td>
                              <td class="right">
                                <uui-button compact look="secondary" label="Open ${e.name}"
                                  @click=${() => a(this, s, E).call(this, e)}
                                  >${((n = this._selected) == null ? void 0 : n.id) === e.id ? "Close" : "Slides"}</uui-button>
                                <uui-button compact look="secondary" label="Settings for ${e.name}"
                                  @click=${() => a(this, s, L).call(this, e)}>Settings</uui-button>
                                <uui-button compact look="secondary" color="danger" label="Delete ${e.name}"
                                  ?disabled=${this._busy === `delete:${e.id}`}
                                  @click=${() => a(this, s, N).call(this, e)}>Delete</uui-button>
                              </td>
                            </tr>
                          `;
      }
    )}
                  </tbody>
                </table>
              `}
      </uui-box>

      ${a(this, s, I).call(this)}

      <uui-box headline="Create a slider">
        <div class="field">
          <span class="field-label">Name</span>
          <uui-input
            label="Slider name"
            placeholder="e.g. Homepage hero"
            .value=${this._newName}
            @input=${(e) => this._newName = e.target.value}
          ></uui-input>
          <p class="hint">Starts with autoplay on, a 5 second delay, looping, and the slide effect — all changeable under Settings.</p>
        </div>
        <div class="actions">
          <uui-button look="primary" color="positive" label="Create slider"
            ?disabled=${this._busy === "create"} @click=${a(this, s, O)}
            >${this._busy === "create" ? "Creating…" : "Create slider"}</uui-button>
        </div>
      </uui-box>
    `;
  }
};
f = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
w = function(e) {
  return e.ok ? (this._loadError = null, !0) : (this._loadError = e.status === 401 || e.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${e.status}${e.statusText ? ` ${e.statusText}` : ""}.`, !1);
};
g = async function() {
  this._loading = !0;
  try {
    const e = await _(this, f).call(this, `${this._api}/GetSliders`);
    a(this, s, w).call(this, e) && (this._sliders = await e.json(), this._selected && (this._selected = this._sliders.find((t) => t.id === this._selected.id) ?? null));
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._sliders = [];
  } finally {
    this._loading = !1;
  }
};
E = async function(e) {
  var t;
  if (((t = this._selected) == null ? void 0 : t.id) === e.id) {
    this._selected = null, this._slides = [];
    return;
  }
  this._selected = e, this._slides = [], await a(this, s, y).call(this);
};
y = async function() {
  if (this._selected)
    try {
      const e = await _(this, f).call(this, `${this._api}/GetSlides?sliderId=${this._selected.id}`);
      a(this, s, w).call(this, e) && (this._slides = await e.json());
    } catch {
      this._loadError ?? (this._loadError = "Could not load the slides in that slider.");
    }
};
O = async function() {
  const e = this._newName.trim();
  if (!e) {
    this._message = { ok: !1, text: "A slider needs a name." };
    return;
  }
  this._busy = "create";
  try {
    (await _(this, f).call(this, `${this._api}/CreateSlider`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: e, autoplay: !0, autoplayDelay: 5e3, loop: !0, effect: "slide" })
    })).ok ? (this._message = { ok: !0, text: `Created ${e}.` }, this._newName = "", await a(this, s, g).call(this)) : this._message = { ok: !1, text: "Could not create that slider." };
  } catch {
    this._message = { ok: !1, text: "Could not create that slider." };
  } finally {
    this._busy = "";
  }
};
L = function(e) {
  this._editingId = e.id, this._edit = { ...e, slides: [] }, this._message = null;
};
U = async function() {
  const e = this._edit;
  if (!e.id) return;
  const t = (e.name ?? "").trim();
  if (!t) {
    this._message = { ok: !1, text: "A slider needs a name." };
    return;
  }
  this._busy = `edit:${e.id}`;
  try {
    (await _(this, f).call(this, `${this._api}/UpdateSlider`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...e, name: t, slides: [] })
    })).ok ? (this._message = { ok: !0, text: `Updated ${t}.` }, this._editingId = null, await a(this, s, g).call(this)) : this._message = { ok: !1, text: "Could not update that slider." };
  } catch {
    this._message = { ok: !1, text: "Could not update that slider." };
  } finally {
    this._busy = "";
  }
};
N = async function(e) {
  var i, n;
  const t = ((i = e.slides) == null ? void 0 : i.length) ?? 0;
  if (window.confirm(
    `Delete the slider "${e.name}"?

${t > 0 ? `Its ${t} slide${t === 1 ? "" : "s"} go with it. ` : ""}The media library is untouched. This cannot be undone.`
  )) {
    this._busy = `delete:${e.id}`;
    try {
      (await _(this, f).call(this, `${this._api}/DeleteSlider?id=${e.id}`, { method: "DELETE" })).ok ? (this._message = { ok: !0, text: `Deleted ${e.name}.` }, ((n = this._selected) == null ? void 0 : n.id) === e.id && (this._selected = null, this._slides = []), await a(this, s, g).call(this)) : this._message = { ok: !1, text: "Could not delete that slider." };
    } catch {
      this._message = { ok: !1, text: "Could not delete that slider." };
    } finally {
      this._busy = "";
    }
  }
};
A = async function() {
  if (!this._selected) return;
  const e = this._slideKeys[0], t = e ? await J(_(this, f), e) : null;
  if (!t) {
    this._message = { ok: !1, text: "Choose an image from the media library first." };
    return;
  }
  this._busy = "slide";
  try {
    (await _(this, f).call(this, `${this._api}/AddSlide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sliderId: this._selected.id,
        title: this._slideTitle.trim() || "Untitled",
        subtitle: this._slideSubtitle.trim() || null,
        imageUrl: t,
        linkUrl: this._slideLinkUrl.trim() || null,
        linkText: this._slideLinkText.trim() || null,
        sortOrder: this._slides.length
      })
    })).ok ? (this._message = { ok: !0, text: "Slide added." }, this._slideTitle = this._slideSubtitle = this._slideLinkUrl = this._slideLinkText = "", this._slideKeys = [], await a(this, s, y).call(this), await a(this, s, g).call(this)) : this._message = { ok: !1, text: "Could not add that slide." };
  } catch {
    this._message = { ok: !1, text: "Could not add that slide." };
  } finally {
    this._busy = "";
  }
};
x = async function(e, t) {
  const i = [...this._slides].sort((l, o) => l.sortOrder - o.sortOrder), n = i.findIndex((l) => l.id === e.id), u = i[n + t];
  if (u) {
    this._busy = `move:${e.id}`;
    try {
      const l = { ...e, sortOrder: u.sortOrder }, o = { ...u, sortOrder: e.sortOrder };
      for (const p of [l, o])
        if (!(await _(this, f).call(this, `${this._api}/UpdateSlide`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p)
        })).ok) {
          this._message = { ok: !1, text: "Could not reorder the slides." };
          break;
        }
      await a(this, s, y).call(this);
    } catch {
      this._message = { ok: !1, text: "Could not reorder the slides." };
    } finally {
      this._busy = "";
    }
  }
};
D = async function(e) {
  if (window.confirm(`Remove the slide "${e.title}"?

The image stays in the media library.`)) {
    this._busy = `slide:${e.id}`;
    try {
      (await _(this, f).call(this, `${this._api}/DeleteSlide?id=${e.id}`, { method: "DELETE" })).ok ? (this._message = { ok: !0, text: "Slide removed." }, await a(this, s, y).call(this), await a(this, s, g).call(this)) : this._message = { ok: !1, text: "Could not remove that slide." };
    } catch {
      this._message = { ok: !1, text: "Could not remove that slide." };
    } finally {
      this._busy = "";
    }
  }
};
I = function() {
  if (!this._selected) return k;
  const e = [...this._slides].sort((t, i) => t.sortOrder - i.sortOrder);
  return d`
      <uui-box headline="Slides in ${this._selected.name} (${e.length})">
        ${e.length === 0 ? d`<p class="empty">This slider has no slides yet. Add one below.</p>` : d`
              <table>
                <thead>
                  <tr><th></th><th>Title</th><th>Link</th><th>Order</th><th></th></tr>
                </thead>
                <tbody>
                  ${e.map(
    (t, i) => d`
                      <tr>
                        <td><img class="thumb" src=${t.imageUrl} alt=${t.title} loading="lazy" /></td>
                        <td>
                          <strong>${t.title}</strong>
                          ${t.subtitle ? d`<div class="muted">${t.subtitle}</div>` : k}
                        </td>
                        <td class="muted">${t.linkUrl ? d`<code>${t.linkUrl}</code>` : "—"}</td>
                        <td class="num">
                          <uui-button compact look="secondary" label="Move ${t.title} up"
                            ?disabled=${i === 0 || this._busy === `move:${t.id}`}
                            @click=${() => a(this, s, x).call(this, t, -1)}>↑</uui-button>
                          <uui-button compact look="secondary" label="Move ${t.title} down"
                            ?disabled=${i === e.length - 1 || this._busy === `move:${t.id}`}
                            @click=${() => a(this, s, x).call(this, t, 1)}>↓</uui-button>
                        </td>
                        <td class="right">
                          <uui-button compact look="secondary" color="danger" label="Remove ${t.title}"
                            ?disabled=${this._busy === `slide:${t.id}`}
                            @click=${() => a(this, s, D).call(this, t)}>Remove</uui-button>
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
            @change=${(t) => {
    const i = t.target;
    this._slideKeys = i.selection ?? [];
  }}
          ></umb-input-media>
          <p class="hint">Pick from the media library — nothing here asks you to type a URL.</p>
        </div>
        <div class="grid">
          <div>
            <span class="field-label">Title</span>
            <uui-input label="Slide title" .value=${this._slideTitle}
              @input=${(t) => this._slideTitle = t.target.value}></uui-input>
          </div>
          <div>
            <span class="field-label">Subtitle</span>
            <uui-input label="Slide subtitle" placeholder="Optional" .value=${this._slideSubtitle}
              @input=${(t) => this._slideSubtitle = t.target.value}></uui-input>
          </div>
          <div>
            <span class="field-label">Link URL</span>
            <uui-input label="Link URL" placeholder="Optional, e.g. /offers" .value=${this._slideLinkUrl}
              @input=${(t) => this._slideLinkUrl = t.target.value}></uui-input>
          </div>
          <div>
            <span class="field-label">Link text</span>
            <uui-input label="Link text" placeholder="Optional, e.g. See offers" .value=${this._slideLinkText}
              @input=${(t) => this._slideLinkText = t.target.value}></uui-input>
          </div>
        </div>
        <div class="actions">
          <uui-button look="primary" color="positive" label="Add slide"
            ?disabled=${this._busy === "slide" || this._slideKeys.length === 0}
            @click=${a(this, s, A)}>${this._busy === "slide" ? "Adding…" : "Add slide"}</uui-button>
        </div>
      </uui-box>
    `;
};
z = function(e) {
  return d`
      <td colspan="6">
        <div class="grid">
          <div>
            <span class="field-label">Name</span>
            <uui-input label="Name" .value=${this._edit.name ?? ""}
              @input=${(t) => this._edit = { ...this._edit, name: t.target.value }}></uui-input>
          </div>
          <div>
            <span class="field-label">Effect</span>
            <uui-select
              label="Effect"
              .value=${this._edit.effect ?? "slide"}
              @change=${(t) => this._edit = { ...this._edit, effect: t.target.value }}
              .options=${G.map((t) => ({ name: t, value: t, selected: t === (this._edit.effect ?? "slide") }))}
            ></uui-select>
          </div>
          <div>
            <span class="field-label">Autoplay delay (ms)</span>
            <uui-input
              type="number"
              label="Autoplay delay in milliseconds"
              .value=${String(this._edit.autoplayDelay ?? 5e3)}
              @input=${(t) => this._edit = { ...this._edit, autoplayDelay: Number(t.target.value) || 0 }}
            ></uui-input>
          </div>
        </div>
        <div class="toggle-row">
          <uui-toggle
            label="Autoplay"
            ?checked=${this._edit.autoplay ?? !1}
            @change=${(t) => this._edit = { ...this._edit, autoplay: t.target.checked }}
            >Autoplay</uui-toggle
          >
          <uui-toggle
            label="Loop"
            ?checked=${this._edit.loop ?? !1}
            @change=${(t) => this._edit = { ...this._edit, loop: t.target.checked }}
            >Loop</uui-toggle
          >
        </div>
        <div class="actions">
          <uui-button look="primary" color="positive" label="Save ${e.name}"
            ?disabled=${this._busy === `edit:${e.id}`} @click=${a(this, s, U)}>Save</uui-button>
          <uui-button look="secondary" label="Cancel" @click=${() => this._editingId = null}>Cancel</uui-button>
        </div>
      </td>
    `;
};
r.styles = j`
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
h([
  c()
], r.prototype, "_sliders", 2);
h([
  c()
], r.prototype, "_slides", 2);
h([
  c()
], r.prototype, "_selected", 2);
h([
  c()
], r.prototype, "_loading", 2);
h([
  c()
], r.prototype, "_busy", 2);
h([
  c()
], r.prototype, "_loadError", 2);
h([
  c()
], r.prototype, "_message", 2);
h([
  c()
], r.prototype, "_newName", 2);
h([
  c()
], r.prototype, "_editingId", 2);
h([
  c()
], r.prototype, "_edit", 2);
h([
  c()
], r.prototype, "_slideTitle", 2);
h([
  c()
], r.prototype, "_slideSubtitle", 2);
h([
  c()
], r.prototype, "_slideLinkUrl", 2);
h([
  c()
], r.prototype, "_slideLinkText", 2);
h([
  c()
], r.prototype, "_slideKeys", 2);
r = h([
  K("slider-dashboard")
], r);
const V = r;
export {
  r as SliderDashboardElement,
  V as default
};
