import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface RsvpEvent {
  id: number;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  maxCapacity: number | null;
  registrationDeadline: string | null;
  isPublished: boolean;
  attendees: Attendee[];
}

interface Attendee {
  id: number;
  eventId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: number; // 0=Confirmed, 1=Waitlisted, 2=Cancelled
  registeredAt: string;
}

const STATUS_LABELS = ["Confirmed", "Waitlisted", "Cancelled"] as const;
const STATUS_COLORS = ["#d1fae5", "#fef3c7", "#fee2e2"] as const;
const STATUS_TEXT_COLORS = ["#065f46", "#92400e", "#991b1b"] as const;

@customElement("rsvp-dashboard")
export class RsvpDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
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

  @state() private _events: RsvpEvent[] = [];
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _selectedEvent: RsvpEvent | null = null;

  private readonly _apiBase = "/umbraco/api/rsvp";

  override connectedCallback() {
    super.connectedCallback();
    this._loadEvents();
  }

  private async _loadEvents() {
    this._loading = true;
    this._error = null;
    try {
      const res = await this.#fetch(`${this._apiBase}/getevents`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this._events = await res.json();
    } catch (e) {
      this._error = `Failed to load events: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._loading = false;
    }
  }

  private async _selectEvent(event: RsvpEvent) {
    try {
      const res = await this.#fetch(`${this._apiBase}/getevent?id=${event.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this._selectedEvent = await res.json();
    } catch (e) {
      this._error = `Failed to load event details: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  private async _cancelRegistration(attendeeId: number) {
    if (!confirm("Cancel this registration?")) return;
    try {
      const res = await this.#fetch(`${this._apiBase}/cancelregistration?attendeeId=${attendeeId}`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Reload the selected event
      if (this._selectedEvent) await this._selectEvent(this._selectedEvent);
    } catch (e) {
      this._error = `Cancel failed: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  private async _deleteEvent(id: number) {
    if (!confirm("Delete this event and all registrations?")) return;
    try {
      await this.#fetch(`${this._apiBase}/deleteevent?id=${id}`, { method: "DELETE" });
      this._events = this._events.filter((e) => e.id !== id);
      if (this._selectedEvent?.id === id) this._selectedEvent = null;
    } catch (e) {
      this._error = `Delete failed: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  private _getConfirmedCount(event: RsvpEvent) {
    return event.attendees?.filter((a) => a.status === 0).length ?? 0;
  }

  private _getWaitlistCount(event: RsvpEvent) {
    return event.attendees?.filter((a) => a.status === 1).length ?? 0;
  }

  override render() {
    return html`
      <h1>RSVP</h1>
      <p class="description">
        Manage event registrations, track attendees, and handle capacity limits and waitlists.
      </p>

      ${this._error
        ? html`<uui-box style="margin-bottom:16px">
            <p style="color:var(--uui-color-danger)">${this._error}</p>
          </uui-box>`
        : ""}

      ${this._selectedEvent ? this._renderEventDetail() : this._renderEventList()}
    `;
  }

  private _renderEventList() {
    return html`
      <div class="toolbar">
        <uui-button
          look="secondary"
          label="Refresh"
          ?disabled=${this._loading}
          @click=${this._loadEvents}
        >${this._loading ? "Loading…" : "Refresh"}</uui-button>
      </div>

      <uui-box headline="Events">
        ${this._events.length > 0
          ? html`
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
                  (ev) => html`
                    <uui-table-row>
                      <uui-table-cell>${ev.title}</uui-table-cell>
                      <uui-table-cell>${new Date(ev.eventDate).toLocaleDateString()}</uui-table-cell>
                      <uui-table-cell>${ev.location ?? "—"}</uui-table-cell>
                      <uui-table-cell>
                        <div class="event-stats">
                          <span>${this._getConfirmedCount(ev)} confirmed</span>
                          ${this._getWaitlistCount(ev) > 0
                            ? html`<span>${this._getWaitlistCount(ev)} waitlisted</span>`
                            : ""}
                          ${ev.maxCapacity ? html`<span>/ ${ev.maxCapacity} max</span>` : ""}
                        </div>
                      </uui-table-cell>
                      <uui-table-cell>
                        <span class="badge" style="background:${ev.isPublished ? "#d1fae5" : "#fee2e2"};color:${ev.isPublished ? "#065f46" : "#991b1b"}">
                          ${ev.isPublished ? "Published" : "Draft"}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>
                        <uui-button look="secondary" compact label="View"
                          @click=${() => this._selectEvent(ev)}>View</uui-button>
                        <uui-button look="danger" compact label="Delete"
                          @click=${() => this._deleteEvent(ev.id)}>Delete</uui-button>
                      </uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `
          : html`<div class="empty-state"><p>No events found.</p></div>`}
      </uui-box>
    `;
  }

  private _renderEventDetail() {
    const ev = this._selectedEvent!;
    return html`
      <div class="back-btn">
        <uui-button look="secondary" @click=${() => (this._selectedEvent = null)}>
          &larr; Back to Events
        </uui-button>
      </div>

      <uui-box headline="${ev.title}">
        <div style="margin-bottom:16px">
          <p><strong>Date:</strong> ${new Date(ev.eventDate).toLocaleString()}</p>
          ${ev.location ? html`<p><strong>Location:</strong> ${ev.location}</p>` : ""}
          ${ev.maxCapacity ? html`<p><strong>Capacity:</strong> ${ev.maxCapacity}</p>` : ""}
          ${ev.description ? html`<p>${ev.description}</p>` : ""}
        </div>

        <h3>Attendees</h3>
        ${ev.attendees && ev.attendees.length > 0
          ? html`
              <uui-table>
                <uui-table-head>
                  <uui-table-head-cell>Name</uui-table-head-cell>
                  <uui-table-head-cell>Email</uui-table-head-cell>
                  <uui-table-head-cell>Phone</uui-table-head-cell>
                  <uui-table-head-cell>Status</uui-table-head-cell>
                  <uui-table-head-cell>Registered</uui-table-head-cell>
                  <uui-table-head-cell>Actions</uui-table-head-cell>
                </uui-table-head>
                ${ev.attendees.map(
                  (a) => html`
                    <uui-table-row>
                      <uui-table-cell>${a.firstName} ${a.lastName}</uui-table-cell>
                      <uui-table-cell>${a.email}</uui-table-cell>
                      <uui-table-cell>${a.phone ?? "—"}</uui-table-cell>
                      <uui-table-cell>
                        <span class="badge"
                          style="background:${STATUS_COLORS[a.status]};color:${STATUS_TEXT_COLORS[a.status]}">
                          ${STATUS_LABELS[a.status]}
                        </span>
                      </uui-table-cell>
                      <uui-table-cell>${new Date(a.registeredAt).toLocaleDateString()}</uui-table-cell>
                      <uui-table-cell>
                        ${a.status !== 2
                          ? html`<uui-button look="danger" compact label="Cancel"
                              @click=${() => this._cancelRegistration(a.id)}>Cancel</uui-button>`
                          : "—"}
                      </uui-table-cell>
                    </uui-table-row>
                  `
                )}
              </uui-table>
            `
          : html`<div class="empty-state"><p>No attendees yet.</p></div>`}
      </uui-box>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rsvp-dashboard": RsvpDashboardElement;
  }
}
