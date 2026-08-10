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
  formatTime,
  formatWaId,
  formatWindow,
  type ConversationSummary,
  type MessageView,
} from "./types";

/**
 * Conversation inbox: thread list on the left, transcript and reply box on the right.
 *
 * The reply box is only enabled while the 24-hour customer-service window is open.
 * Outside it Meta rejects free-form messages, so rather than let an operator type a
 * reply that will bounce, the box is disabled and points them at the Send view.
 */
@customElement("wa-inbox")
export class WaInboxElement extends UmbElementMixin(LitElement) {
  static override styles = [
    sharedStyles,
    css`
      .layout {
        display: grid;
        grid-template-columns: minmax(240px, 320px) 1fr;
        gap: var(--uui-size-space-5, 16px);
        align-items: start;
      }

      /* Single column once there is no room for a side-by-side reading pane. */
      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }

      .list {
        border: 1px solid var(--uui-color-border);
        border-radius: var(--uui-border-radius, 3px);
        background: var(--uui-color-surface);
        max-height: 70vh;
        overflow-y: auto;
      }

      .thread {
        display: block;
        width: 100%;
        text-align: left;
        border: 0;
        border-bottom: 1px solid var(--uui-color-border);
        background: transparent;
        color: inherit;
        font: inherit;
        padding: var(--uui-size-space-4, 12px);
        cursor: pointer;
      }

      .thread:hover {
        background: var(--uui-color-surface-alt);
      }

      .thread[aria-current="true"] {
        background: var(--uui-color-surface-alt);
        box-shadow: inset 3px 0 0 var(--uui-color-selected);
      }

      .thread:focus-visible {
        outline: 2px solid var(--uui-color-focus);
        outline-offset: -2px;
      }

      .thread .top {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: baseline;
      }

      .thread .name {
        font-weight: 600;
        font-size: 0.9rem;
      }

      .thread .when {
        font-size: 0.7rem;
        color: var(--uui-color-text-alt);
        white-space: nowrap;
      }

      .thread .preview {
        font-size: 0.8rem;
        color: var(--uui-color-text-alt);
        margin-top: 2px;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .unread {
        display: inline-block;
        min-width: 18px;
        padding: 0 5px;
        border-radius: 9999px;
        background: var(--uui-color-selected);
        color: var(--uui-color-selected-contrast, #fff);
        font-size: 0.7rem;
        font-weight: 700;
        text-align: center;
      }

      .pane {
        border: 1px solid var(--uui-color-border);
        border-radius: var(--uui-border-radius, 3px);
        background: var(--uui-color-surface);
        display: flex;
        flex-direction: column;
        min-height: 400px;
        max-height: 70vh;
      }

      .pane-head {
        padding: var(--uui-size-space-4, 12px);
        border-bottom: 1px solid var(--uui-color-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .transcript {
        flex: 1;
        overflow-y: auto;
        padding: var(--uui-size-space-4, 12px);
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-3, 8px);
      }

      .bubble {
        max-width: 78%;
        padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
        border-radius: 10px;
        font-size: 0.875rem;
        line-height: 1.45;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }

      .bubble.in {
        align-self: flex-start;
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--uui-color-border);
      }

      /* WhatsApp brand green, with an explicit dark foreground so it stays
         readable in both light and dark backoffice themes. */
      .bubble.out {
        align-self: flex-end;
        background: #d9fdd3;
        color: #111b21;
        border: 1px solid #b9e7b0;
      }

      .bubble.failed {
        background: var(--uui-color-danger);
        color: var(--uui-color-selected-contrast, #fff);
        border-color: var(--uui-color-danger-emphasis);
      }

      .meta {
        display: block;
        margin-top: 4px;
        font-size: 0.68rem;
        opacity: 0.75;
      }

      .reply {
        border-top: 1px solid var(--uui-color-border);
        padding: var(--uui-size-space-4, 12px);
      }

      .reply-row {
        display: flex;
        gap: var(--uui-size-space-3, 8px);
        align-items: flex-end;
      }

      .reply-row uui-textarea {
        flex: 1;
      }

      .window-pill {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        padding: 1px 8px;
        border-radius: 9999px;
        white-space: nowrap;
      }

      .window-pill.open {
        background: var(--uui-color-positive);
        color: var(--uui-color-selected-contrast, #fff);
      }

      .window-pill.closed {
        background: var(--uui-color-warning);
        color: var(--uui-color-warning-contrast, #000);
      }
    `,
  ];

  #api = new WhatsAppApi(this);

  @state() private _conversations: ConversationSummary[] = [];
  @state() private _selected?: ConversationSummary;
  @state() private _messages: MessageView[] = [];
  @state() private _draft = "";
  @state() private _error = "";
  @state() private _loadingList = true;
  @state() private _loadingThread = false;
  @state() private _sending = false;

  override connectedCallback() {
    super.connectedCallback();
    void this.#loadConversations();
  }

  async #loadConversations() {
    this._loadingList = true;
    this._error = "";
    try {
      this._conversations = await this.#api.getConversations();

      // Keep the open thread's window countdown fresh after a reload.
      if (this._selected) {
        const updated = this._conversations.find((c) => c.id === this._selected!.id);
        if (updated) this._selected = updated;
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._loadingList = false;
    }
  }

  async #open(conversation: ConversationSummary) {
    this._selected = conversation;
    this._loadingThread = true;
    this._error = "";
    this._messages = [];

    try {
      const thread = await this.#api.getThread(conversation.id);
      this._messages = thread.messages;
      this._selected = thread.conversation;

      if (conversation.unreadCount > 0) {
        await this.#api.markRead(conversation.id);
        // Clear the badge locally rather than refetching the whole list.
        this._conversations = this._conversations.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c,
        );
      }
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._loadingThread = false;
    }
  }

  async #send() {
    const conversation = this._selected;
    const body = this._draft.trim();
    if (!conversation || !body || this._sending) return;

    this._sending = true;
    this._error = "";

    try {
      await this.#api.sendText(conversation.waId, body);
      this._draft = "";
      // Refetch so the new message carries its real id and status from the server.
      await this.#open(conversation);
      await this.#loadConversations();
    } catch (error) {
      this._error = error instanceof Error ? error.message : String(error);
    } finally {
      this._sending = false;
    }
  }

  #renderThreadButton(conversation: ConversationSummary) {
    const selected = this._selected?.id === conversation.id;

    return html`
      <button
        class="thread"
        aria-current=${selected ? "true" : "false"}
        @click=${() => void this.#open(conversation)}
      >
        <span class="top">
          <span class="name">
            ${conversation.profileName || formatWaId(conversation.waId)}
          </span>
          <span class="when">${formatTime(conversation.lastMessageUtc)}</span>
        </span>
        <span class="preview">${conversation.lastMessagePreview || "—"}</span>
        ${conversation.unreadCount > 0
          ? html`<span class="unread">${conversation.unreadCount}</span>`
          : nothing}
      </button>
    `;
  }

  #renderMessage(message: MessageView) {
    const failed = message.status === "failed";
    const classes = `bubble ${message.inbound ? "in" : "out"}${failed ? " failed" : ""}`;

    return html`
      <div class=${classes}>
        ${message.body || html`<em>[${message.messageType}]</em>`}
        <span class="meta">
          ${formatTime(message.timestampUtc)}
          ${message.inbound ? nothing : html` · ${message.status}`}
          ${message.templateName ? html` · template: ${message.templateName}` : nothing}
          ${message.errorMessage ? html` · ${message.errorMessage}` : nothing}
        </span>
      </div>
    `;
  }

  #renderReply(conversation: ConversationSummary) {
    if (!conversation.windowOpen) {
      return html`
        <div class="reply">
          <div class="warn">
            The 24-hour customer-service window has closed, so WhatsApp will not deliver a
            free-form reply. Use the <strong>Send</strong> view to send an approved template
            instead — that reopens the window once they reply.
          </div>
        </div>
      `;
    }

    return html`
      <div class="reply">
        <div class="reply-row">
          <uui-textarea
            label="Reply"
            placeholder="Write a reply…"
            .value=${this._draft}
            ?disabled=${this._sending}
            @input=${(e: Event) => {
              this._draft = (e.target as HTMLTextAreaElement).value;
            }}
          ></uui-textarea>
          <uui-button
            look="primary"
            color="positive"
            label="Send reply"
            ?disabled=${this._sending || !this._draft.trim()}
            @click=${() => void this.#send()}
          >${this._sending ? "Sending…" : "Send"}</uui-button>
        </div>
        <p class="hint">${formatWindow(conversation.windowMinutesRemaining)} in this window.</p>
      </div>
    `;
  }

  #renderPane() {
    const conversation = this._selected;

    if (!conversation) {
      return html`
        <div class="pane">
          <div class="empty">Select a conversation to read it.</div>
        </div>
      `;
    }

    return html`
      <div class="pane">
        <div class="pane-head">
          <div>
            <strong>${conversation.profileName || formatWaId(conversation.waId)}</strong>
            <div class="hint">${formatWaId(conversation.waId)}</div>
          </div>
          <span class="window-pill ${conversation.windowOpen ? "open" : "closed"}">
            ${conversation.windowOpen
              ? formatWindow(conversation.windowMinutesRemaining)
              : "window closed"}
          </span>
        </div>

        <div class="transcript">
          ${this._loadingThread
            ? html`<uui-loader></uui-loader>`
            : this._messages.length === 0
              ? html`<div class="empty">No messages yet.</div>`
              : this._messages.map((m) => this.#renderMessage(m))}
        </div>

        ${this.#renderReply(conversation)}
      </div>
    `;
  }

  override render() {
    return html`
      <div class="head">
        <h1>Inbox</h1>
        <p>Conversations with your WhatsApp Business number.</p>
      </div>

      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}

      <div class="row" style="margin-bottom:12px">
        <uui-button
          look="secondary"
          label="Refresh conversations"
          ?disabled=${this._loadingList}
          @click=${() => void this.#loadConversations()}
        >Refresh</uui-button>
      </div>

      <div class="layout">
        <div class="list">
          ${this._loadingList
            ? html`<uui-loader></uui-loader>`
            : this._conversations.length === 0
              ? html`<div class="empty">
                  No conversations yet. They appear here once the webhook is registered
                  and someone messages your number.
                </div>`
              : this._conversations.map((c) => this.#renderThreadButton(c))}
        </div>
        ${this.#renderPane()}
      </div>
    `;
  }
}

export default WaInboxElement;

declare global {
  interface HTMLElementTagNameMap {
    "wa-inbox": WaInboxElement;
  }
}
