import { LitElement as p, html as i, css as _, state as h, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as v } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as m } from "@umbraco-cms/backoffice/auth";
function f(e) {
  let t = null;
  const a = new Promise((s) => {
    e.consumeContext(m, async (l) => {
      var n;
      try {
        t = await ((n = l == null ? void 0 : l.getLatestToken) == null ? void 0 : n.call(l)) ?? null;
      } catch {
        t = null;
      }
      s();
    }), setTimeout(s, 3e3);
  });
  return async (s, l = {}) => {
    await a;
    const n = new Headers(l.headers);
    t && !n.has("Authorization") && n.set("Authorization", `Bearer ${t}`);
    const r = await fetch(s, { ...l, credentials: "same-origin", headers: n });
    return (r.status === 401 || r.status === 403) && console.error(
      `[SplatDev] ${r.status} from ${String(s)} — the backoffice token was ${t ? "sent but rejected" : "not available"}. The dashboard may render as empty.`
    ), r;
  };
}
var $ = Object.defineProperty, y = Object.getOwnPropertyDescriptor, b = (e) => {
  throw TypeError(e);
}, c = (e, t, a, s) => {
  for (var l = s > 1 ? void 0 : s ? y(t, a) : t, n = e.length - 1, r; n >= 0; n--)
    (r = e[n]) && (l = (s ? r(t, a, l) : r(l)) || l);
  return s && l && $(t, a, l), l;
}, E = (e, t, a) => t.has(e) || b("Cannot " + a), d = (e, t, a) => (E(e, t, "read from private field"), a ? a.call(e) : t.get(e)), w = (e, t, a) => t.has(e) ? b("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, a), u;
const x = ["Confirmed", "Waitlisted", "Cancelled"], C = ["#d1fae5", "#fef3c7", "#fee2e2"], k = ["#065f46", "#92400e", "#991b1b"];
let o = class extends v(p) {
  constructor() {
    super(...arguments), w(this, u, f(this)), this._events = [], this._loading = !1, this._error = null, this._selectedEvent = null, this._apiBase = "/umbraco/api/rsvp";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadEvents();
  }
  async _loadEvents() {
    this._loading = !0, this._error = null;
    try {
      const e = await d(this, u).call(this, `${this._apiBase}/getevents`);
      if (!e.ok) throw new Error(`HTTP ${e.status}`);
      this._events = await e.json();
    } catch (e) {
      this._error = `Failed to load events: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._loading = !1;
    }
  }
  async _selectEvent(e) {
    try {
      const t = await d(this, u).call(this, `${this._apiBase}/getevent?id=${e.id}`);
      if (!t.ok) throw new Error(`HTTP ${t.status}`);
      this._selectedEvent = await t.json();
    } catch (t) {
      this._error = `Failed to load event details: ${t instanceof Error ? t.message : String(t)}`;
    }
  }
  async _cancelRegistration(e) {
    if (confirm("Cancel this registration?"))
      try {
        const t = await d(this, u).call(this, `${this._apiBase}/cancelregistration?attendeeId=${e}`, { method: "POST" });
        if (!t.ok) throw new Error(`HTTP ${t.status}`);
        this._selectedEvent && await this._selectEvent(this._selectedEvent);
      } catch (t) {
        this._error = `Cancel failed: ${t instanceof Error ? t.message : String(t)}`;
      }
  }
  async _deleteEvent(e) {
    var t;
    if (confirm("Delete this event and all registrations?"))
      try {
        await d(this, u).call(this, `${this._apiBase}/deleteevent?id=${e}`, { method: "DELETE" }), this._events = this._events.filter((a) => a.id !== e), ((t = this._selectedEvent) == null ? void 0 : t.id) === e && (this._selectedEvent = null);
      } catch (a) {
        this._error = `Delete failed: ${a instanceof Error ? a.message : String(a)}`;
      }
  }
  _getConfirmedCount(e) {
    var t;
    return ((t = e.attendees) == null ? void 0 : t.filter((a) => a.status === 0).length) ?? 0;
  }
  _getWaitlistCount(e) {
    var t;
    return ((t = e.attendees) == null ? void 0 : t.filter((a) => a.status === 1).length) ?? 0;
  }
  render() {
    return i`
      <h1>RSVP</h1>
      <p class="description">
        Manage event registrations, track attendees, and handle capacity limits and waitlists.
      </p>

      ${this._error ? i`<uui-box style="margin-bottom:16px">
            <p style="color:var(--uui-color-danger)">${this._error}</p>
          </uui-box>` : ""}

      ${this._selectedEvent ? this._renderEventDetail() : this._renderEventList()}
    `;
  }
  _renderEventList() {
    return i`
      <div class="toolbar">
        <uui-button
          look="secondary"
          label="Refresh"
          ?disabled=${this._loading}
          @click=${this._loadEvents}
        >${this._loading ? "Loading…" : "Refresh"}</uui-button>
      </div>

      <uui-box headline="Events">
        ${this._events.length > 0 ? i`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Title</uui-table-head-cell>
                  <uui-table-head-cell>Date</uui-table-head-cell>
                  <uui-table-head-cell>Location</uui-table-head-cell>
                  <uui-table-head-cell>Registrations</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${this._events.map(
      (e) => i`
                    <uui-table-row>
                      <uui-table-cell>${e.title}</uui-table-cell>
                      <uui-table-cell>${new Date(e.eventDate).toLocaleDateString()}</uui-table-cell>
                      <uui-table-cell>${e.location ?? "—"}</uui-table-cell>
                      <uui-table-cell>
                        <div class="event-stats">
                          <span>${this._getConfirmedCount(e)} confirmed</span>
                          ${this._getWaitlistCount(e) > 0 ? i`<span>${this._getWaitlistCount(e)} waitlisted</span>` : ""}
                          ${e.maxCapacity ? i`<span>/ ${e.maxCapacity} max</span>` : ""}
                        </div>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span class="badge" style="background:${e.isPublished ? "#d1fae5" : "#fee2e2"};color:${e.isPublished ? "#065f46" : "#991b1b"}">
                          ${e.isPublished ? "Published" : "Draft"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button look="secondary" compact label="View"
                          @click=${() => this._selectEvent(e)}>View</uui-button>
                        <uui-button look="danger" compact label="Delete"
                          @click=${() => this._deleteEvent(e.id)}>Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            ` : i`<div class="empty-state"><p>No events found.</p></div>`}
      </uui-box>
    `;
  }
  _renderEventDetail() {
    const e = this._selectedEvent;
    return i`
      <div class="back-btn">
        <uui-button look="secondary" @click=${() => this._selectedEvent = null}>
          &larr; Back to Events
        </uui-button>
      </div>

      <uui-box headline="${e.title}">
        <div style="margin-bottom:16px">
          <p><strong>Date:</strong> ${new Date(e.eventDate).toLocaleString()}</p>
          ${e.location ? i`<p><strong>Location:</strong> ${e.location}</p>` : ""}
          ${e.maxCapacity ? i`<p><strong>Capacity:</strong> ${e.maxCapacity}</p>` : ""}
          ${e.description ? i`<p>${e.description}</p>` : ""}
        </div>

        <h3>Attendees</h3>
        ${e.attendees && e.attendees.length > 0 ? i`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Phone</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Registered</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${e.attendees.map(
      (t) => i`
                    <uui-table-row>
                      <uui-table-cell>${t.firstName} ${t.lastName}</uui-table-cell>
                      <uui-table-cell>${t.email}</uui-table-cell>
                      <uui-table-cell>${t.phone ?? "—"}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge"
                          style="background:${C[t.status]};color:${k[t.status]}">
                          ${x[t.status]}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>${new Date(t.registeredAt).toLocaleDateString()}</uui-table-cell>
                      <uui-table-cell>
                        ${t.status !== 2 ? i`<uui-button look="danger" compact label="Cancel"
                              @click=${() => this._cancelRegistration(t.id)}>Cancel</uui-button>` : "—"}
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            ` : i`<div class="empty-state"><p>No attendees yet.</p></div>`}
      </uui-box>
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
o.styles = _`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 8px;
      color: var(--uui-color-text);
    }

    p.description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 24px;
    }

    .toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .section {
      margin-bottom: 24px;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .event-stats {
      display: flex;
      gap: 16px;
      font-size: 0.85rem;
      color: var(--uui-color-text-alt);
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--uui-color-text-alt);
    }

    .back-btn {
      margin-bottom: 16px;
    }
  `;
c([
  h()
], o.prototype, "_events", 2);
c([
  h()
], o.prototype, "_loading", 2);
c([
  h()
], o.prototype, "_error", 2);
c([
  h()
], o.prototype, "_selectedEvent", 2);
o = c([
  g("rsvp-dashboard")
], o);
export {
  o as RsvpDashboardElement
};
