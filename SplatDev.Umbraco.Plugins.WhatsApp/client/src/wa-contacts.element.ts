import {
  LitElement,
  html,
  css,
  nothing,
  customElement,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { WhatsAppApi } from "./api";
import { sharedStyles } from "./shared-styles";
import {
  contactHue,
  contactInitials,
  formatPhone,
  type Contact,
  type ContactUpsert,
} from "./types";

/**
 * Contacts: the names your team gives WhatsApp numbers.
 *
 * WhatsApp only ever supplies a profile name, which is absent for many senders and can
 * change without warning. A contact row is the name you chose, so the inbox has something
 * stable to show. Deleting a contact removes the name only — conversations and message
 * history are never touched.
 */
@customElement("wa-contacts")
export class WaContactsElement extends UmbElementMixin(LitElement) {
  static override styles = [
    sharedStyles,
    css`
      .toolbar {
        display: flex;
        gap: var(--uui-size-space-3, 8px);
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: var(--uui-size-space-4, 12px);
      }

      .toolbar uui-input {
        flex: 1;
        min-width: 220px;
      }

      .list {
        border: 1px solid var(--wa-hairline);
        border-radius: var(--wa-radius);
        background: var(--uui-color-surface);
        box-shadow: var(--wa-shadow);
        overflow: hidden;
      }

      .row {
        display: flex;
        gap: var(--uui-size-space-4, 12px);
        align-items: center;
        padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
        border-bottom: 1px solid var(--wa-hairline);
      }

      .row:last-child {
        border-bottom: none;
      }

      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 0.74rem;
        font-weight: 700;
        color: #fff;
        flex: 0 0 auto;
        user-select: none;
      }

      .who {
        flex: 1;
        min-width: 0;
      }

      .who .name {
        font-weight: 600;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .who .sub {
        font-size: 0.78rem;
        opacity: 0.72;
        font-variant-numeric: tabular-nums;
      }

      .actions {
        display: flex;
        gap: var(--uui-size-space-2, 6px);
        flex: 0 0 auto;
      }

      .form {
        display: grid;
        gap: var(--uui-size-space-3, 8px);
        padding: var(--uui-size-space-4, 12px);
        border: 1px solid var(--wa-hairline);
        border-radius: var(--wa-radius);
        background: var(--uui-color-surface);
        box-shadow: var(--wa-shadow);
        margin-bottom: var(--uui-size-space-4, 12px);
      }

      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--uui-size-space-3, 8px);
      }

      @media (max-width: 720px) {
        .grid2 {
          grid-template-columns: 1fr;
        }
      }

      label {
        display: block;
        font-size: 0.78rem;
        font-weight: 600;
        margin-bottom: 3px;
        opacity: 0.85;
      }

      .form-actions {
        display: flex;
        gap: var(--uui-size-space-3, 8px);
        justify-content: flex-end;
      }
    `,
  ];

  #api = new WhatsAppApi(this);

  @state() private _contacts: Contact[] = [];
  @state() private _loading = true;
  @state() private _saving = false;
  @state() private _search = "";
  @state() private _error: string | null = null;
  /** The contact being edited, or a blank draft when adding. Null means the form is closed. */
  @state() private _draft: ContactUpsert | null = null;
  @state() private _editingId: number | null = null;

  override connectedCallback() {
    super.connectedCallback();
    void this.#load();
  }

  async #load() {
    this._loading = true;
    this._error = null;
    try {
      this._contacts = await this.#api.getContacts(this._search);
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._loading = false;
    }
  }

  #startAdd() {
    this._editingId = null;
    this._draft = { waId: "", displayName: "", company: "", email: "", notes: "" };
  }

  #startEdit(contact: Contact) {
    this._editingId = contact.id;
    this._draft = {
      waId: contact.waId,
      displayName: contact.displayName ?? "",
      company: contact.company ?? "",
      email: contact.email ?? "",
      notes: contact.notes ?? "",
    };
  }

  async #save() {
    if (!this._draft?.waId?.trim()) {
      this._error = "A WhatsApp number is required.";
      return;
    }

    this._saving = true;
    this._error = null;
    try {
      await this.#api.saveContact(this._draft);
      this._draft = null;
      this._editingId = null;
      await this.#load();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._saving = false;
    }
  }

  async #remove(contact: Contact) {
    const name = contact.displayName || formatPhone(contact.waId);
    // Deliberately explicit that history survives — otherwise "delete" reads as
    // destroying the conversation.
    if (!confirm(`Remove the contact "${name}"?\n\nThe conversation and its messages are kept.`)) {
      return;
    }

    try {
      await this.#api.deleteContact(contact.id);
      await this.#load();
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    }
  }

  #field(label: string, key: keyof ContactUpsert, placeholder = "") {
    return html`
      <div>
        <label>${label}</label>
        <uui-input
          .value=${(this._draft?.[key] as string) ?? ""}
          placeholder=${placeholder}
          @input=${(e: Event) => {
            if (this._draft) {
              this._draft = {
                ...this._draft,
                [key]: (e.target as HTMLInputElement).value,
              };
            }
          }}
        ></uui-input>
      </div>
    `;
  }

  #renderForm() {
    if (!this._draft) return nothing;

    return html`
      <div class="form">
        <strong>${this._editingId ? "Edit contact" : "New contact"}</strong>

        <div class="grid2">
          ${this.#field("WhatsApp number", "waId", "+55 15 99142-4586")}
          ${this.#field("Name", "displayName", "Maria Silva")}
          ${this.#field("Company", "company")}
          ${this.#field("Email", "email", "maria@example.com")}
        </div>

        <div>
          <label>Notes</label>
          <uui-textarea
            .value=${this._draft.notes ?? ""}
            rows="3"
            @input=${(e: Event) => {
              if (this._draft) {
                this._draft = {
                  ...this._draft,
                  notes: (e.target as HTMLTextAreaElement).value,
                };
              }
            }}
          ></uui-textarea>
        </div>

        <div class="form-actions">
          <uui-button
            label="Cancel"
            @click=${() => {
              this._draft = null;
              this._editingId = null;
            }}
          ></uui-button>
          <uui-button
            look="primary"
            color="positive"
            label=${this._saving ? "Saving…" : "Save contact"}
            ?disabled=${this._saving}
            @click=${() => void this.#save()}
          ></uui-button>
        </div>
      </div>
    `;
  }

  #renderRow(contact: Contact) {
    const hue = contactHue(contact.waId);
    return html`
      <div class="row">
        <span class="avatar" style="background: hsl(${hue} 45% 45%)" aria-hidden="true">
          ${contactInitials(null, contact.waId, contact.displayName)}
        </span>
        <span class="who">
          <span class="name">${contact.displayName || formatPhone(contact.waId)}</span>
          <span class="sub">
            ${formatPhone(contact.waId)}${contact.company ? html` · ${contact.company}` : nothing}
            ${contact.email ? html` · ${contact.email}` : nothing}
          </span>
        </span>
        <span class="actions">
          <uui-button
            look="secondary"
            label="Edit"
            @click=${() => this.#startEdit(contact)}
          ></uui-button>
          <uui-button
            look="secondary"
            color="danger"
            label="Remove"
            @click=${() => void this.#remove(contact)}
          ></uui-button>
        </span>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="page">
        <h2>Contacts</h2>
        <p class="hint">
          Names your team gives WhatsApp numbers. These are used across the inbox in place of
          the WhatsApp profile name, which is often missing and can change without warning.
        </p>

        <div class="toolbar">
          <uui-input
            label="Search contacts"
            placeholder="Search name, company, email or number…"
            .value=${this._search}
            @input=${(e: Event) => {
              this._search = (e.target as HTMLInputElement).value;
            }}
            @change=${() => void this.#load()}
          ></uui-input>
          <uui-button look="secondary" label="Search" @click=${() => void this.#load()}></uui-button>
          <uui-button
            look="primary"
            color="positive"
            label="Add contact"
            @click=${() => this.#startAdd()}
          ></uui-button>
        </div>

        ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
        ${this.#renderForm()}

        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._contacts.length === 0
            ? html`
                <div class="empty">
                  ${this._search
                    ? "No contacts match that search."
                    : "No contacts yet. Add one, or name a conversation from the Inbox."}
                </div>
              `
            : html`<div class="list">${this._contacts.map((c) => this.#renderRow(c))}</div>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "wa-contacts": WaContactsElement;
  }
}
