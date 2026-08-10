import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

import type {
  ConversationSummary,
  MessageTemplate,
  ThreadResponse,
  WhatsAppStatus,
} from "./types";

export const API_BASE = "/umbraco/whatsapp/api/v1";

/**
 * Thin API client for the WhatsApp backoffice endpoints.
 *
 * The controllers are guarded by `AuthorizationPolicies.BackOfficeAccess`, which in
 * Umbraco 17 means a bearer token — cookies alone are not enough. The token comes from
 * UMB_AUTH_CONTEXT, which each element consumes and hands to this client.
 */
export class WhatsAppApi {
  #host: UmbControllerHost;
  #token: string | null = null;
  #ready: Promise<void>;

  constructor(host: UmbControllerHost) {
    this.#host = host;

    // consumeContext fires asynchronously; every call awaits this so the first
    // request cannot race ahead of the token being available.
    this.#ready = new Promise<void>((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.#host as any).consumeContext(UMB_AUTH_CONTEXT, async (ctx: any) => {
        try {
          // getLatestToken() is deprecated in Umbraco 17 but remains functional
          // through v19; there is no stable replacement for plain fetch yet.
          this.#token = (await ctx?.getLatestToken?.()) ?? null;
        } catch {
          this.#token = null;
        }
        resolve();
      });

      // Never hang the UI if the context is unavailable — fall through
      // unauthenticated and let the request surface a 401.
      setTimeout(resolve, 3000);
    });
  }

  async #fetch(path: string, init: RequestInit = {}): Promise<Response> {
    await this.#ready;

    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (this.#token) {
      headers.set("Authorization", `Bearer ${this.#token}`);
    }

    return fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "same-origin",
      headers,
    });
  }

  async #get<T>(path: string): Promise<T> {
    const response = await this.#fetch(path);
    if (!response.ok) {
      throw new Error(await describeError(response));
    }
    return (await response.json()) as T;
  }

  async #post<T>(path: string, body?: unknown): Promise<T> {
    const headers = new Headers();
    if (body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    const response = await this.#fetch(path, {
      method: "POST",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(await describeError(response));
    }

    // 204 No Content has no body to parse.
    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  }

  getStatus(): Promise<WhatsAppStatus> {
    return this.#get<WhatsAppStatus>("/status");
  }

  getConversations(): Promise<ConversationSummary[]> {
    return this.#get<ConversationSummary[]>("/conversations");
  }

  getThread(id: number): Promise<ThreadResponse> {
    return this.#get<ThreadResponse>(`/conversations/${id}/messages`);
  }

  markRead(id: number): Promise<void> {
    return this.#post<void>(`/conversations/${id}/read`);
  }

  /**
   * Tells the server someone is watching the inbox, which suppresses the
   * unattended-message email. Failures are swallowed: a missed heartbeat should send an
   * extra email, never break the UI.
   */
  async heartbeat(): Promise<void> {
    try {
      await this.#post<void>("/heartbeat");
    } catch {
      // Intentionally ignored.
    }
  }

  getTemplates(): Promise<MessageTemplate[]> {
    return this.#get<MessageTemplate[]>("/templates");
  }

  sendText(to: string, body: string): Promise<{ messageId: string }> {
    return this.#post<{ messageId: string }>("/send/text", { to, body });
  }

  sendTemplate(
    to: string,
    templateName: string,
    language: string,
    variables?: string[],
  ): Promise<{ messageId: string }> {
    return this.#post<{ messageId: string }>("/send/template", {
      to,
      templateName,
      language,
      variables,
    });
  }
}

/** Unwraps the API's `{ error }` envelope so the UI shows Meta's reason, not "HTTP 400". */
async function describeError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    if (payload?.error) {
      return payload.code ? `${payload.error} (code ${payload.code})` : String(payload.error);
    }
  } catch {
    // Non-JSON body — fall back to the status line.
  }

  if (response.status === 401 || response.status === 403) {
    return "Not authorised. Sign in to the backoffice again.";
  }

  return `Request failed: HTTP ${response.status}`;
}
