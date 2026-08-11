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
        border: 1px solid var(--wa-hairline);
        border-radius: var(--wa-radius);
        background: var(--uui-color-surface);
        box-shadow: var(--wa-shadow);
        max-height: 70vh;
        overflow-y: auto;
        /* Keeps the first/last row corners inside the rounded container. */
        overflow-x: hidden;
      }

      .thread {
        display: block;
        width: 100%;
        text-align: left;
        border: 0;
        border-bottom: 1px solid var(--wa-hairline);
        background: transparent;
        color: inherit;
        font: inherit;
        padding: var(--uui-size-space-4, 12px);
        cursor: pointer;
        /* Comfortably above the 44px touch target minimum. */
        min-height: 56px;
        transition: background 140ms var(--wa-ease);
      }

      .thread:last-child {
        border-bottom: 0;
      }

      .thread:hover {
        background: color-mix(in srgb, var(--uui-color-surface-alt) 70%, transparent);
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
        border: 1px solid var(--wa-hairline);
        border-radius: var(--wa-radius);
        background: var(--uui-color-surface);
        box-shadow: var(--wa-shadow);
        display: flex;
        flex-direction: column;
        min-height: 400px;
        max-height: 70vh;
        overflow: hidden;
      }

      .pane-head {
        padding: var(--uui-size-space-4, 12px);
        border-bottom: 1px solid var(--wa-hairline);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        /* Subtle lift so the header reads as fixed while the transcript scrolls. */
        background: color-mix(in srgb, var(--uui-color-surface-alt) 35%, var(--uui-color-surface));
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
        max-width: min(78%, 62ch);
        padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
        /* Asymmetric radius: the corner nearest the speaker is squared, which is the
           familiar chat idiom and makes direction readable without colour alone. */
        border-radius: 12px;
        font-size: 0.875rem;
        line-height: 1.5;
        overflow-wrap: anywhere;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.04);
        animation: bubble-in 200ms var(--wa-ease) both;
      }

      @keyframes bubble-in {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
      }

      .bubble.in {
        align-self: flex-start;
        border-bottom-left-radius: 4px;
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--wa-hairline);
      }

      /* WhatsApp brand green, with an explicit dark foreground so it stays
         readable in both light and dark backoffice themes. Fixed rather than tokenised
         on purpose: operators read direction by this colour, and it must not invert. */
      .bubble.out {
        align-self: flex-end;
        border-bottom-right-radius: 4px;
        background: #d9fdd3;
        color: #111b21;
        border: 1px solid #b9e7b0;
      }

      .bubble.failed {
        background: var(--uui-color-danger);
        color: var(--uui-color-selected-contrast, #fff);
        border-color: var(--uui-color-danger-emphasis);
      }

      .bubble .body {
        display: block;
        white-space: pre-wrap;
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

  /** Heartbeat + refresh timers, cleared on disconnect so a closed tab stops reporting presence. */
  #heartbeatTimer?: number;
  #refreshTimer?: number;

  override connectedCallback() {
    super.connectedCallback();
    void this.#loadConversations();

    // Tell the server the inbox is being watched, which suppresses the
    // unattended-message email. Fires immediately so a freshly-opened tab counts
    // straight away, then on an interval well inside the server's idle window.
    void this.#api.heartbeat();
    this.#heartbeatTimer = window.setInterval(() => void this.#api.heartbeat(), 60_000);

    // Poll for inbound messages. Cheap, and it means an operator watching the inbox
    // sees a reply arrive without reaching for Refresh.
    this.#refreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") void this.#loadConversations({ quiet: true });
    }, 20_000);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#heartbeatTimer) window.clearInterval(this.#heartbeatTimer);
    if (this.#refreshTimer) window.clearInterval(this.#refreshTimer);
  }

  /**
   * @param quiet Background poll — must not flash the loading state or clobber an error
   *              the user is still reading.
   */
  async #loadConversations(opts: { quiet?: boolean } = {}) {
    if (!opts.quiet) {
      this._loadingList = true;
      this._error = "";
    }
    try {
      this._conversations = await this.#api.getConversations();

      // Keep the open thread's window countdown fresh after a reload.
      if (this._selected) {
        const updated = this._conversations.find((c) => c.id === this._selected!.id);
        if (updated) this._selected = updated;
      }
    } catch (error) {
      // A failed background poll stays silent — the visible list is still valid.
      if (!opts.quiet) {
        this._error = error instanceof Error ? error.message : String(error);
      }
    } finally {
      if (!opts.quiet) this._loadingList = false;
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

    // The body sits in its own element because it is the only part that wants
    // pre-wrap. Putting pre-wrap on the bubble instead makes the template's own
    // indentation and newlines render as blank lines, which balloons every bubble.
    return html`
      <div class=${classes}>
        <span class="body">${message.body || html`<em>[${message.messageType}]</em>`}</span>
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
            <span>
              The 24-hour customer-service window has closed, so WhatsApp will not deliver a
              free-form reply. Use the <strong>Send</strong> view to send an approved template
              instead — that reopens the window once they reply.
            </span>
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
