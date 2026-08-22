import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";

interface ChannelSummary {
  id: number;
  name: string;
  platform: string;
  isActive: boolean;
  connectedAt: string;
  expiresAt: string | null;
  hasAccessToken: boolean;
  tokenExpired: boolean;
}

interface ScheduledPost {
  id: number;
  channelId: number;
  content: string;
  mediaUrl: string | null;
  scheduledAt: string;
  publishedAt: string | null;
  status: string;
  errorMessage: string | null;
}

const PLATFORMS = ["Facebook", "Instagram", "X", "LinkedIn", "YouTube", "TikTok", "Mastodon"];

/**
 * Connected social channels and the posts queued to them.
 *
 * The previous dashboard was the shared placeholder — a Save button that set a flag for
 * three seconds — and made no requests, so none of the six operations behind it
 * (list/add/remove a channel, list/schedule/delete a post) could be reached at all.
 */
@customElement("splatdev-social-channels-dashboard")
export class SplatdevSocialMediaChannelsDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    .description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 64ch; }

    uui-box { margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6); margin-right: 4px;
    }
    .tag.warn { background: #fef3c7; color: #92400e; }
    .tag.bad { background: #fee2e2; color: #991b1b; }
    .tag.good { background: #d1fae5; color: #065f46; }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }
    uui-input, uui-textarea, uui-select { width: 100%; }

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

  @state() private _channels: ChannelSummary[] = [];
  @state() private _posts: ScheduledPost[] = [];
  @state() private _loading = true;
  @state() private _busy = "";
  @state() private _loadError: string | null = null;
  @state() private _message: { ok: boolean; text: string } | null = null;

  @state() private _newName = "";
  @state() private _newPlatform = PLATFORMS[0];
  @state() private _newToken = "";

  @state() private _postChannelId: number | null = null;
  @state() private _postContent = "";
  @state() private _postMediaUrl = "";
  @state() private _postWhen = "";

  readonly #fetch = createAuthFetch(this);
  private readonly _api = "/umbraco/api/SocialChannelsApi";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#loadAll();
  }

  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }
    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to manage social channels. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }

  async #loadAll(): Promise<void> {
    this._loading = true;
    await Promise.all([this.#loadChannels(), this.#loadPosts()]);
    this._loading = false;
  }

  async #loadChannels(): Promise<void> {
    try {
      const response = await this.#fetch(`${this._api}/GetChannels`);
      if (this.#responseOk(response)) {
        this._channels = await response.json();
        if (this._postChannelId === null && this._channels.length) {
          this._postChannelId = this._channels[0].id;
        }
      }
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
    }
  }

  async #loadPosts(): Promise<void> {
    try {
      const response = await this.#fetch(`${this._api}/GetPosts`);
      if (this.#responseOk(response)) this._posts = await response.json();
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
    }
  }

  async #addChannel(): Promise<void> {
    const name = this._newName.trim();
    if (!name) {
      this._message = { ok: false, text: "Give the channel a name." };
      return;
    }
    if (!this._newToken.trim()) {
      this._message = { ok: false, text: "An access token is required to post to this channel." };
      return;
    }

    this._busy = "add";
    try {
      const response = await this.#fetch(`${this._api}/AddChannel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          platform: this._newPlatform,
          accessToken: this._newToken,
          isActive: true,
        }),
      });
      if (this.#responseOk(response)) {
        this._message = { ok: true, text: `Connected ${name}.` };
        this._newName = "";
        // Clear the token from the form immediately: it is never read back from the
        // server, so leaving it in a field only keeps a credential on screen.
        this._newToken = "";
        await this.#loadChannels();
      }
    } catch {
      this._message = { ok: false, text: "Could not connect that channel." };
    } finally {
      this._busy = "";
    }
  }

  async #removeChannel(channel: ChannelSummary): Promise<void> {
    this._busy = `remove:${channel.id}`;
    try {
      const response = await this.#fetch(`${this._api}/RemoveChannel?id=${channel.id}`, {
        method: "DELETE",
      });
      if (this.#responseOk(response) || response.status === 204) {
        this._message = { ok: true, text: `Disconnected ${channel.name}.` };
        await this.#loadAll();
      }
    } catch {
      this._message = { ok: false, text: `Could not disconnect ${channel.name}.` };
    } finally {
      this._busy = "";
    }
  }

  async #schedule(): Promise<void> {
    if (this._postChannelId === null) {
      this._message = { ok: false, text: "Connect a channel first." };
      return;
    }
    if (!this._postContent.trim()) {
      this._message = { ok: false, text: "Write something to post." };
      return;
    }
    if (!this._postWhen) {
      this._message = { ok: false, text: "Choose when it should go out." };
      return;
    }

    this._busy = "schedule";
    try {
      const response = await this.#fetch(`${this._api}/SchedulePost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: this._postChannelId,
          content: this._postContent,
          mediaUrl: this._postMediaUrl.trim() || null,
          scheduledAt: new Date(this._postWhen).toISOString(),
          status: "pending",
        }),
      });
      if (this.#responseOk(response)) {
        this._message = { ok: true, text: "Post scheduled." };
        this._postContent = "";
        this._postMediaUrl = "";
        this._postWhen = "";
        await this.#loadPosts();
      }
    } catch {
      this._message = { ok: false, text: "Could not schedule that post." };
    } finally {
      this._busy = "";
    }
  }

  async #deletePost(post: ScheduledPost): Promise<void> {
    this._busy = `post:${post.id}`;
    try {
      const response = await this.#fetch(`${this._api}/DeletePost?id=${post.id}`, {
        method: "DELETE",
      });
      if (this.#responseOk(response) || response.status === 204) {
        this._message = { ok: true, text: "Post removed." };
        await this.#loadPosts();
      }
    } catch {
      this._message = { ok: false, text: "Could not remove that post." };
    } finally {
      this._busy = "";
    }
  }

  #when(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  }

  #channelName(id: number): string {
    return this._channels.find((c) => c.id === id)?.name ?? `#${id}`;
  }

  #tokenState(c: ChannelSummary) {
    if (!c.hasAccessToken) return html`<span class="tag bad">no token</span>`;
    if (c.tokenExpired) return html`<span class="tag warn">token expired</span>`;
    return html`<span class="tag good">connected</span>`;
  }

  override render() {
    return html`
      <h1>Social channels</h1>
      <p class="description">
        The accounts this site can post to, and the posts queued to them. Access tokens are
        stored on the server and never sent back here.
      </p>

      ${this._loadError
        ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>`
        : nothing}
      ${this._message
        ? html`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>`
        : nothing}

      <uui-box headline="Connected channels">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._channels.length === 0
            ? html`<p class="empty">No channels connected yet. Add one below.</p>`
            : html`
                <table>
                  <thead>
                    <tr><th>Name</th><th>Platform</th><th>Status</th><th>Connected</th><th>Token expires</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._channels.map(
                      (c) => html`
                        <tr>
                          <td>${c.name}</td>
                          <td>${c.platform}</td>
                          <td>
                            ${this.#tokenState(c)}
                            ${c.isActive ? nothing : html`<span class="tag">inactive</span>`}
                          </td>
                          <td class="num">${this.#when(c.connectedAt)}</td>
                          <td class="num">${this.#when(c.expiresAt)}</td>
                          <td>
                            <uui-button
                              compact
                              look="secondary"
                              color="danger"
                              label="Disconnect ${c.name}"
                              ?disabled=${this._busy === `remove:${c.id}`}
                              @click=${() => this.#removeChannel(c)}
                              >Disconnect</uui-button
                            >
                          </td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>
              `}
      </uui-box>

      <uui-box headline="Connect a channel">
        <div class="grid">
          <div>
            <span class="field-label">Name</span>
            <uui-input
              placeholder="e.g. Company page"
              .value=${this._newName}
              @input=${(e: Event) => (this._newName = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Platform</span>
            <uui-select
              .value=${this._newPlatform}
              .options=${PLATFORMS.map((p) => ({ name: p, value: p, selected: p === this._newPlatform }))}
              @change=${(e: Event) =>
                (this._newPlatform = (e.target as unknown as { value: string }).value)}
            ></uui-select>
          </div>
          <div>
            <span class="field-label">Access token</span>
            <uui-input
              type="password"
              placeholder="Paste the token"
              .value=${this._newToken}
              @input=${(e: Event) => (this._newToken = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
        </div>
        <p class="hint">
          The token is stored server-side and is never returned to this page — the list
          above shows only whether one exists and whether it has expired.
        </p>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Connect channel"
            ?disabled=${this._busy === "add"}
            @click=${this.#addChannel}
            >${this._busy === "add" ? "Connecting…" : "Connect channel"}</uui-button
          >
        </div>
      </uui-box>

      <uui-box headline="Scheduled posts">
        ${this._posts.length === 0
          ? html`<p class="empty">Nothing scheduled.</p>`
          : html`
              <table>
                <thead>
                  <tr><th>Channel</th><th>Content</th><th>Goes out</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  ${this._posts.map(
                    (p) => html`
                      <tr>
                        <td>${this.#channelName(p.channelId)}</td>
                        <td>${p.content}${p.mediaUrl ? html`<div class="hint">${p.mediaUrl}</div>` : nothing}</td>
                        <td class="num">${this.#when(p.scheduledAt)}</td>
                        <td>
                          <span class="tag ${p.status === "failed" ? "bad" : p.status === "published" ? "good" : ""}"
                            >${p.status}</span
                          >
                          ${p.errorMessage ? html`<div class="hint">${p.errorMessage}</div>` : nothing}
                        </td>
                        <td>
                          <uui-button
                            compact
                            look="secondary"
                            color="danger"
                            label="Remove post"
                            ?disabled=${this._busy === `post:${p.id}`}
                            @click=${() => this.#deletePost(p)}
                            >Remove</uui-button
                          >
                        </td>
                      </tr>
                    `,
                  )}
                </tbody>
              </table>
            `}
      </uui-box>

      <uui-box headline="Schedule a post">
        <div class="grid">
          <div>
            <span class="field-label">Channel</span>
            <uui-select
              .options=${this._channels.map((c) => ({
                name: `${c.name} (${c.platform})`,
                value: String(c.id),
                selected: c.id === this._postChannelId,
              }))}
              @change=${(e: Event) =>
                (this._postChannelId = Number((e.target as unknown as { value: string }).value))}
            ></uui-select>
          </div>
          <div>
            <span class="field-label">When</span>
            <uui-input
              type="datetime-local"
              .value=${this._postWhen}
              @input=${(e: Event) => (this._postWhen = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
          <div>
            <span class="field-label">Media URL (optional)</span>
            <uui-input
              placeholder="https://…"
              .value=${this._postMediaUrl}
              @input=${(e: Event) => (this._postMediaUrl = (e.target as HTMLInputElement).value)}
            ></uui-input>
          </div>
        </div>
        <div style="margin-top:14px;">
          <span class="field-label">Content</span>
          <uui-textarea
            rows="3"
            .value=${this._postContent}
            @input=${(e: Event) => (this._postContent = (e.target as HTMLTextAreaElement).value)}
          ></uui-textarea>
        </div>
        <div class="actions">
          <uui-button
            look="primary"
            color="positive"
            label="Schedule post"
            ?disabled=${this._busy === "schedule" || this._channels.length === 0}
            @click=${this.#schedule}
            >${this._busy === "schedule" ? "Scheduling…" : "Schedule post"}</uui-button
          >
          ${this._channels.length === 0
            ? html`<span class="hint">Connect a channel before scheduling.</span>`
            : nothing}
        </div>
      </uui-box>
    `;
  }
}

export default SplatdevSocialMediaChannelsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "splatdev-social-channels-dashboard": SplatdevSocialMediaChannelsDashboardElement;
  }
}
