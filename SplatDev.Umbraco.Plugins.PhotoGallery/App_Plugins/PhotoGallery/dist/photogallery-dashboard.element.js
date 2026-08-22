import { LitElement as z, nothing as w, html as n, css as R, state as u, customElement as j } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as G } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as L } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as q } from "@umbraco-cms/backoffice/notification";
function F(t) {
  let e = null, i = null;
  const d = t.consumeContext.bind(t), r = new Promise((l) => {
    d(L, async (c) => {
      var p;
      try {
        e = await ((p = c == null ? void 0 : c.getLatestToken) == null ? void 0 : p.call(c)) ?? null;
      } catch {
        e = null;
      }
      l();
    }), setTimeout(l, 3e3);
  });
  return d(q, (l) => {
    i = l;
  }), async (l, c = {}) => {
    await r;
    const p = new Headers(c.headers);
    e && !p.has("Authorization") && p.set("Authorization", `Bearer ${e}`);
    const m = await fetch(l, { ...c, credentials: "same-origin", headers: p });
    if (!m.ok) {
      const f = m.status === 401 || m.status === 403, y = f ? "Not authorised" : "Could not load data", v = f ? `The backoffice token was ${e ? "sent but rejected" : "not available"} (${m.status}). Anything shown below may be empty because the request was refused, not because there is nothing to show.` : `The request failed with ${m.status}. Anything shown below may be incomplete.`;
      console.error(`[SplatDev] ${m.status} from ${String(l)} — ${v}`), i == null || i.peek("danger", { data: { headline: y, message: v } });
    }
    return m;
  };
}
async function M(t, e) {
  var i, d, r, l, c;
  try {
    const p = await t(`/umbraco/management/api/v1/media/${encodeURIComponent(e)}`);
    if (p.ok) {
      const f = (d = (i = (await p.json()).values) == null ? void 0 : i.find((v) => v.alias === "umbracoFile")) == null ? void 0 : d.value, y = typeof f == "string" ? f : f == null ? void 0 : f.src;
      if (y) return y;
    }
  } catch {
  }
  try {
    const p = await t(
      `/umbraco/management/api/v1/media/urls?id=${encodeURIComponent(e)}`
    );
    if (!p.ok) return null;
    const m = await p.json();
    return ((c = (l = (r = m == null ? void 0 : m[0]) == null ? void 0 : r.urlInfos) == null ? void 0 : l[0]) == null ? void 0 : c.url) ?? null;
  } catch {
    return null;
  }
}
var B = Object.defineProperty, J = Object.getOwnPropertyDescriptor, T = (t) => {
  throw TypeError(t);
}, h = (t, e, i, d) => {
  for (var r = d > 1 ? void 0 : d ? J(e, i) : e, l = t.length - 1, c; l >= 0; l--)
    (c = t[l]) && (r = (d ? c(e, i, r) : c(r)) || r);
  return d && r && B(e, i, r), r;
}, D = (t, e, i) => e.has(t) || T("Cannot " + i), b = (t, e, i) => (D(t, e, "read from private field"), i ? i.call(t) : e.get(t)), C = (t, e, i) => e.has(t) ? T("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), o = (t, e, i) => (D(t, e, "access private method"), i), _, s, $, g, A, x, E, P, O, I, U, k, S, K, N;
let a = class extends G(z) {
  constructor() {
    super(...arguments), C(this, s), C(this, _, F(this)), this._albums = [], this._photos = [], this._selected = null, this._loading = !1, this._busy = "", this._loadError = null, this._message = null, this._newTitle = "", this._newDescription = "", this._newCoverKeys = [], this._editingId = null, this._editTitle = "", this._editDescription = "", this._photoTitle = "", this._photoCaption = "", this._photoKeys = [], this._api = "/umbraco/api/photogallery";
  }
  connectedCallback() {
    super.connectedCallback(), o(this, s, g).call(this);
  }
  render() {
    return n`
      <h1>Photo Gallery</h1>
      <p class="description">
        Albums and the photos in them. Select an album to see and edit its photos.
      </p>

      ${this._loadError ? n`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : w}
      ${this._message ? n`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>` : w}

      <uui-box headline="Albums (${this._albums.length})">
        ${this._loading ? n`<uui-loader></uui-loader>` : this._albums.length === 0 ? n`<p class="empty">No albums yet. Create one below.</p>` : n`
                <table>
                  <thead>
                    <tr><th></th><th>Title</th><th>Description</th><th>Photos</th><th>Created</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._albums.map((t) => {
      var i, d, r;
      const e = this._editingId === t.id;
      return n`
                        <tr class=${((i = this._selected) == null ? void 0 : i.id) === t.id ? "selected" : ""}>
                          <td>
                            ${t.coverImageUrl ? n`<img class="thumb" src=${t.coverImageUrl} alt="" loading="lazy" />` : n`<div class="thumb"></div>`}
                          </td>
                          <td>
                            ${e ? n`<uui-input
                                  label="Title"
                                  .value=${this._editTitle}
                                  @input=${(l) => this._editTitle = l.target.value}
                                ></uui-input>` : n`<strong>${t.title}</strong>`}
                          </td>
                          <td>
                            ${e ? n`<uui-input
                                  label="Description"
                                  .value=${this._editDescription}
                                  @input=${(l) => this._editDescription = l.target.value}
                                ></uui-input>` : n`<span class="muted">${t.description || "—"}</span>`}
                          </td>
                          <td class="num">${((d = t.photos) == null ? void 0 : d.length) ?? 0}</td>
                          <td class="num muted">${o(this, s, K).call(this, t.createdAt)}</td>
                          <td class="right">
                            ${e ? n`
                                  <uui-button compact look="primary" color="positive" label="Save ${t.title}"
                                    ?disabled=${this._busy === `edit:${t.id}`}
                                    @click=${() => o(this, s, O).call(this, t)}>Save</uui-button>
                                  <uui-button compact look="secondary" label="Cancel"
                                    @click=${() => this._editingId = null}>Cancel</uui-button>
                                ` : n`
                                  <uui-button compact look="secondary" label="Open ${t.title}"
                                    @click=${() => o(this, s, A).call(this, t)}
                                    >${((r = this._selected) == null ? void 0 : r.id) === t.id ? "Close" : "Photos"}</uui-button>
                                  <uui-button compact look="secondary" label="Rename ${t.title}"
                                    @click=${() => o(this, s, P).call(this, t)}>Rename</uui-button>
                                  <uui-button compact look="secondary" color="danger" label="Delete ${t.title}"
                                    ?disabled=${this._busy === `delete:${t.id}`}
                                    @click=${() => o(this, s, I).call(this, t)}>Delete</uui-button>
                                `}
                          </td>
                        </tr>
                      `;
    })}
                  </tbody>
                </table>
              `}
      </uui-box>

      ${o(this, s, N).call(this)}

      <uui-box headline="Create an album">
        <div class="grid">
          <div>
            <span class="field-label">Title</span>
            <uui-input
              label="Album title"
              placeholder="e.g. Summer 2026"
              .value=${this._newTitle}
              @input=${(t) => this._newTitle = t.target.value}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Description</span>
            <uui-input
              label="Album description"
              placeholder="Optional"
              .value=${this._newDescription}
              @input=${(t) => this._newDescription = t.target.value}
            ></uui-input>
          </div>
        </div>
        <div class="field" style="margin-top:14px">
          <span class="field-label">Cover image</span>
          <umb-input-media
            .selection=${this._newCoverKeys}
            max="1"
            @change=${(t) => {
      const e = t.target;
      this._newCoverKeys = e.selection ?? [];
    }}
          ></umb-input-media>
          <p class="hint">Optional. Leave empty and the album shows no cover.</p>
        </div>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Create album"
            ?disabled=${this._busy === "album"}
            @click=${o(this, s, E)}
            >${this._busy === "album" ? "Creating…" : "Create album"}</uui-button
          >
        </div>
      </uui-box>
    `;
  }
};
_ = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
$ = function(t) {
  return t.ok ? (this._loadError = null, !0) : (this._loadError = t.status === 401 || t.status === 403 ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete." : `The request did not succeed — the server returned ${t.status}${t.statusText ? ` ${t.statusText}` : ""}.`, !1);
};
g = async function() {
  this._loading = !0;
  try {
    const t = await b(this, _).call(this, `${this._api}/GetAlbums`);
    o(this, s, $).call(this, t) && (this._albums = await t.json(), this._selected && (this._selected = this._albums.find((e) => e.id === this._selected.id) ?? null));
  } catch {
    this._loadError ?? (this._loadError = "The request failed. See the browser console for details."), this._albums = [];
  } finally {
    this._loading = !1;
  }
};
A = async function(t) {
  var e;
  if (((e = this._selected) == null ? void 0 : e.id) === t.id) {
    this._selected = null, this._photos = [];
    return;
  }
  this._selected = t, this._photos = [];
  try {
    const i = await b(this, _).call(this, `${this._api}/GetPhotos?albumId=${t.id}`);
    o(this, s, $).call(this, i) && (this._photos = await i.json());
  } catch {
    this._loadError ?? (this._loadError = "Could not load the photos in that album.");
  }
};
x = async function(t) {
  const e = t[0];
  return e ? M(b(this, _), e) : null;
};
E = async function() {
  const t = this._newTitle.trim();
  if (!t) {
    this._message = { ok: !1, text: "An album needs a title." };
    return;
  }
  this._busy = "album";
  try {
    const e = await o(this, s, x).call(this, this._newCoverKeys);
    (await b(this, _).call(this, `${this._api}/CreateAlbum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: t,
        description: this._newDescription.trim() || null,
        coverImageUrl: e
      })
    })).ok ? (this._message = { ok: !0, text: `Created ${t}.` }, this._newTitle = this._newDescription = "", this._newCoverKeys = [], await o(this, s, g).call(this)) : this._message = { ok: !1, text: "Could not create that album." };
  } catch {
    this._message = { ok: !1, text: "Could not create that album." };
  } finally {
    this._busy = "";
  }
};
P = function(t) {
  this._editingId = t.id, this._editTitle = t.title, this._editDescription = t.description ?? "", this._message = null;
};
O = async function(t) {
  const e = this._editTitle.trim();
  if (!e) {
    this._message = { ok: !1, text: "An album needs a title." };
    return;
  }
  this._busy = `edit:${t.id}`;
  try {
    (await b(this, _).call(this, `${this._api}/UpdateAlbum`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...t,
        title: e,
        description: this._editDescription.trim() || null,
        photos: []
      })
    })).ok ? (this._message = { ok: !0, text: `Updated ${e}.` }, this._editingId = null, await o(this, s, g).call(this)) : this._message = { ok: !1, text: "Could not update that album." };
  } catch {
    this._message = { ok: !1, text: "Could not update that album." };
  } finally {
    this._busy = "";
  }
};
I = async function(t) {
  var d, r;
  const e = ((d = t.photos) == null ? void 0 : d.length) ?? 0;
  if (window.confirm(
    `Delete the album "${t.title}"?

${e > 0 ? `Its ${e} photo${e === 1 ? "" : "s"} go with it. ` : ""}The media library is untouched — only the gallery records are removed. This cannot be undone.`
  )) {
    this._busy = `delete:${t.id}`;
    try {
      (await b(this, _).call(this, `${this._api}/DeleteAlbum?id=${t.id}`, { method: "DELETE" })).ok ? (this._message = { ok: !0, text: `Deleted ${t.title}.` }, ((r = this._selected) == null ? void 0 : r.id) === t.id && (this._selected = null, this._photos = []), await o(this, s, g).call(this)) : this._message = { ok: !1, text: "Could not delete that album." };
    } catch {
      this._message = { ok: !1, text: "Could not delete that album." };
    } finally {
      this._busy = "";
    }
  }
};
U = async function() {
  if (!this._selected) return;
  const t = await o(this, s, x).call(this, this._photoKeys);
  if (!t) {
    this._message = { ok: !1, text: "Choose an image from the media library first." };
    return;
  }
  this._busy = "photo";
  try {
    (await b(this, _).call(this, `${this._api}/AddPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        albumId: this._selected.id,
        title: this._photoTitle.trim() || "Untitled",
        imageUrl: t,
        caption: this._photoCaption.trim() || null,
        sortOrder: this._photos.length
      })
    })).ok ? (this._message = { ok: !0, text: "Photo added." }, this._photoTitle = this._photoCaption = "", this._photoKeys = [], await o(this, s, k).call(this)) : this._message = { ok: !1, text: "Could not add that photo." };
  } catch {
    this._message = { ok: !1, text: "Could not add that photo." };
  } finally {
    this._busy = "";
  }
};
k = async function() {
  if (this._selected) {
    try {
      const t = await b(this, _).call(this, `${this._api}/GetPhotos?albumId=${this._selected.id}`);
      o(this, s, $).call(this, t) && (this._photos = await t.json());
    } catch {
      this._loadError ?? (this._loadError = "Could not reload the photos in that album.");
    }
    await o(this, s, g).call(this);
  }
};
S = async function(t) {
  if (window.confirm(`Remove "${t.title}" from this album?

The file stays in the media library.`)) {
    this._busy = `photo:${t.id}`;
    try {
      (await b(this, _).call(this, `${this._api}/DeletePhoto?id=${t.id}`, { method: "DELETE" })).ok ? (this._message = { ok: !0, text: "Photo removed." }, await o(this, s, k).call(this)) : this._message = { ok: !1, text: "Could not remove that photo." };
    } catch {
      this._message = { ok: !1, text: "Could not remove that photo." };
    } finally {
      this._busy = "";
    }
  }
};
K = function(t) {
  const e = new Date(t);
  return Number.isNaN(e.getTime()) ? t : e.toLocaleDateString();
};
N = function() {
  return this._selected ? n`
      <uui-box headline="Photos in ${this._selected.title} (${this._photos.length})">
        ${this._photos.length === 0 ? n`<p class="empty">This album has no photos yet. Add one below.</p>` : n`
              <table>
                <thead>
                  <tr><th></th><th>Title</th><th>Caption</th><th>Order</th><th></th></tr>
                </thead>
                <tbody>
                  ${this._photos.map(
    (t) => n`
                      <tr>
                        <td>
                          <img class="thumb" src=${t.thumbnailUrl || t.imageUrl} alt=${t.title} loading="lazy" />
                        </td>
                        <td><strong>${t.title}</strong></td>
                        <td class="muted">${t.caption || "—"}</td>
                        <td class="num">${t.sortOrder}</td>
                        <td class="right">
                          <uui-button
                            compact
                            look="secondary"
                            color="danger"
                            label="Remove ${t.title}"
                            ?disabled=${this._busy === `photo:${t.id}`}
                            @click=${() => o(this, s, S).call(this, t)}
                            >Remove</uui-button
                          >
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
            .selection=${this._photoKeys}
            max="1"
            @change=${(t) => {
    const e = t.target;
    this._photoKeys = e.selection ?? [];
  }}
          ></umb-input-media>
          <p class="hint">Pick from the media library — nothing here asks you to type a URL.</p>
        </div>
        <div class="grid">
          <div>
            <span class="field-label">Title</span>
            <uui-input
              label="Photo title"
              placeholder="e.g. Opening night"
              .value=${this._photoTitle}
              @input=${(t) => this._photoTitle = t.target.value}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Caption</span>
            <uui-input
              label="Caption"
              placeholder="Optional"
              .value=${this._photoCaption}
              @input=${(t) => this._photoCaption = t.target.value}
            ></uui-input>
          </div>
        </div>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Add photo"
            ?disabled=${this._busy === "photo" || this._photoKeys.length === 0}
            @click=${o(this, s, U)}
            >${this._busy === "photo" ? "Adding…" : "Add photo"}</uui-button
          >
        </div>
      </uui-box>
    ` : w;
};
a.styles = R`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 66ch; }

    uui-box { margin-bottom: 18px; }
    .field { margin-bottom: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
    uui-input { width: 100%; }
    .actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }

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
      width: 56px; height: 40px; object-fit: cover; border-radius: 3px;
      border: 1px solid var(--uui-color-border, #e5e7eb); background: var(--uui-color-surface-alt, #f3f4f6);
    }
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
  u()
], a.prototype, "_albums", 2);
h([
  u()
], a.prototype, "_photos", 2);
h([
  u()
], a.prototype, "_selected", 2);
h([
  u()
], a.prototype, "_loading", 2);
h([
  u()
], a.prototype, "_busy", 2);
h([
  u()
], a.prototype, "_loadError", 2);
h([
  u()
], a.prototype, "_message", 2);
h([
  u()
], a.prototype, "_newTitle", 2);
h([
  u()
], a.prototype, "_newDescription", 2);
h([
  u()
], a.prototype, "_newCoverKeys", 2);
h([
  u()
], a.prototype, "_editingId", 2);
h([
  u()
], a.prototype, "_editTitle", 2);
h([
  u()
], a.prototype, "_editDescription", 2);
h([
  u()
], a.prototype, "_photoTitle", 2);
h([
  u()
], a.prototype, "_photoCaption", 2);
h([
  u()
], a.prototype, "_photoKeys", 2);
a = h([
  j("photogallery-dashboard")
], a);
const Q = a;
export {
  a as PhotoGalleryDashboardElement,
  Q as default
};
