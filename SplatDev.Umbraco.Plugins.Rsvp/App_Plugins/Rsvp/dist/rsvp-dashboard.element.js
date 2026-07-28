import { LitElement as d, html as l, css as b, state as o, customElement as h } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as p } from "@umbraco-cms/backoffice/element-api";
var g = Object.defineProperty, _ = Object.getOwnPropertyDescriptor, n = (e, t, a, u) => {
  for (var i = u > 1 ? void 0 : u ? _(t, a) : t, r = e.length - 1, c; r >= 0; r--)
    (c = e[r]) && (i = (u ? c(t, a, i) : c(i)) || i);
  return u && i && g(t, a, i), i;
};
const m = ["Confirmed", "Waitlisted", "Cancelled"], v = ["#d1fae5", "#fef3c7", "#fee2e2"], f = ["#065f46", "#92400e", "#991b1b"];
let s = class extends p(d) {
  constructor() {
    super(...arguments), this._events = [], this._loading = !1, this._error = null, this._selectedEvent = null, this._apiBase = "/umbraco/api/rsvp";
  }
  connectedCallback() {
    super.connectedCallback(), this._loadEvents();
  }
  async _loadEvents() {
    this._loading = !0, this._error = null;
    try {
      const e = await fetch(`${this._apiBase}/getevents`);
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
      const t = await fetch(`${this._apiBase}/getevent?id=${e.id}`);
      if (!t.ok) throw new Error(`HTTP ${t.status}`);
      this._selectedEvent = await t.json();
    } catch (t) {
      this._error = `Failed to load event details: ${t instanceof Error ? t.message : String(t)}`;
    }
  }
  async _cancelRegistration(e) {
    if (confirm("Cancel this registration?"))
      try {
        const t = await fetch(`${this._apiBase}/cancelregistration?attendeeId=${e}`, { method: "POST" });
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
        await fetch(`${this._apiBase}/deleteevent?id=${e}`, { method: "DELETE" }), this._events = this._events.filter((a) => a.id !== e), ((t = this._selectedEvent) == null ? void 0 : t.id) === e && (this._selectedEvent = null);
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
    return l`
      <h1>RSVP</h1>
      <p class="description">
        Manage event registrations, track attendees, and handle capacity limits and waitlists.
      </p>

      ${this._error ? l`<uui-box style="margin-bottom:16px">
            <p style="color:var(--uui-color-danger)">${this._error}</p>
          </uui-box>` : ""}

      ${this._selectedEvent ? this._renderEventDetail() : this._renderEventList()}
    `;
  }
  _renderEventList() {
    return l`
      <div class="toolbar">
        <uui-button
          look="secondary"
          label="Refresh"
          ?disabled=${this._loading}
          @click=${this._loadEvents}
        >${this._loading ? "Loading…" : "Refresh"}</uui-button>
      </div>

      <uui-box headline="Events">
        ${this._events.length > 0 ? l`
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
      (e) => l`
                    <uui-table-row>
                      <uui-table-cell>${e.title}</uui-table-cell>
                      <uui-table-cell>${new Date(e.eventDate).toLocaleDateString()}</uui-table-cell>
                      <uui-table-cell>${e.location ?? "—"}</uui-table-cell>
                      <uui-table-cell>
                        <div class="event-stats">
                          <span>${this._getConfirmedCount(e)} confirmed</span>
                          ${this._getWaitlistCount(e) > 0 ? l`<span>${this._getWaitlistCount(e)} waitlisted</span>` : ""}
                          ${e.maxCapacity ? l`<span>/ ${e.maxCapacity} max</span>` : ""}
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
            ` : l`<div class="empty-state"><p>No events found.</p></div>`}
      </uui-box>
    `;
  }
  _renderEventDetail() {
    const e = this._selectedEvent;
    return l`
      <div class="back-btn">
        <uui-button look="secondary" @click=${() => this._selectedEvent = null}>
          &larr; Back to Events
        </uui-button>
      </div>

      <uui-box headline="${e.title}">
        <div style="margin-bottom:16px">
          <p><strong>Date:</strong> ${new Date(e.eventDate).toLocaleString()}</p>
          ${e.location ? l`<p><strong>Location:</strong> ${e.location}</p>` : ""}
          ${e.maxCapacity ? l`<p><strong>Capacity:</strong> ${e.maxCapacity}</p>` : ""}
          ${e.description ? l`<p>${e.description}</p>` : ""}
        </div>

        <h3>Attendees</h3>
        ${e.attendees && e.attendees.length > 0 ? l`
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
      (t) => l`
                    <uui-table-row>
                      <uui-table-cell>${t.firstName} ${t.lastName}</uui-table-cell>
                      <uui-table-cell>${t.email}</uui-table-cell>
                      <uui-table-cell>${t.phone ?? "—"}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge"
                          style="background:${v[t.status]};color:${f[t.status]}">
                          ${m[t.status]}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>${new Date(t.registeredAt).toLocaleDateString()}</uui-table-cell>
                      <uui-table-cell>
                        ${t.status !== 2 ? l`<uui-button look="danger" compact label="Cancel"
                              @click=${() => this._cancelRegistration(t.id)}>Cancel</uui-button>` : "—"}
                      </uui-table-cell>
                    </uui-table-row>
                  `
    )}
              </uui-table>
            ` : l`<div class="empty-state"><p>No attendees yet.</p></div>`}
      </uui-box>
    `;
  }
};
s.styles = b`
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
n([
  o()
], s.prototype, "_events", 2);
n([
  o()
], s.prototype, "_loading", 2);
n([
  o()
], s.prototype, "_error", 2);
n([
  o()
], s.prototype, "_selectedEvent", 2);
s = n([
  h("rsvp-dashboard")
], s);
export {
  s as RsvpDashboardElement
};
