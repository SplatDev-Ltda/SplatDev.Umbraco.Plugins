import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

/**
 * fetch() with the backoffice bearer token attached.
 *
 * The plugin's API controllers are guarded by AuthorizationPolicies.BackOfficeAccess.
 * On Umbraco 17 that means an Authorization header, obtained from UMB_AUTH_CONTEXT —
 * the session cookie on its own does not authenticate a custom /umbraco/api/* route,
 * because nothing tells the server to look in it. A plain
 * fetch() therefore comes back 401 and the dashboard renders its empty state as if
 * there were simply no data, which is how this went unnoticed.
 *
 * On Umbraco 17.3 getLatestToken() returns the literal string "[redacted]" rather than
 * a JWT: the real token lives in an httpOnly cookie, and HideBackOfficeTokensHandler
 * swaps it in server-side when it sees that sentinel. The `Bearer ` prefix is required
 * for the swap to fire — sending the bare sentinel is still a 401.
 *
 * Umbraco 13 is unaffected — it authenticates the backoffice with a cookie, and uses
 * the AngularJS bundle rather than these elements.
 */
type NotificationContext = {
  peek: (colour: string, options: { data: { headline: string; message: string } }) => void;
};

export function createAuthFetch(host: UmbControllerHost): typeof fetch {
  let token: string | null = null;
  let notifications: NotificationContext | null = null;

  const consume = (host as unknown as {
    consumeContext: (token: unknown, cb: (ctx: unknown) => void) => void;
  }).consumeContext.bind(host);

  const ready = new Promise<void>((resolve) => {
    consume(UMB_AUTH_CONTEXT, async (ctx: unknown) => {
      try {
        token = (await (ctx as { getLatestToken?: () => Promise<string> })?.getLatestToken?.()) ?? null;
      } catch {
        token = null;
      }
      resolve();
    });

    // Never hang the UI if the context is unavailable — fall through
    // unauthenticated and let the request surface its own 401.
    setTimeout(resolve, 3000);
  });

  consume(UMB_NOTIFICATION_CONTEXT, (ctx: unknown) => {
    notifications = ctx as NotificationContext;
  });

  return async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    await ready;
    const headers = new Headers(init.headers);
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const response = await fetch(input, { ...init, credentials: "same-origin", headers });

    // Most of these dashboards gate on `response.ok` and render their empty state on
    // anything else, so a failed request is indistinguishable from "there is no data".
    // Raising it here covers every dashboard at once, whatever its own render path does.
    if (!response.ok) {
      const refused = response.status === 401 || response.status === 403;
      const headline = refused ? "Not authorised" : "Could not load data";
      const message = refused
        ? `The backoffice token was ${token ? "sent but rejected" : "not available"} (${response.status}). ` +
          "Anything shown below may be empty because the request was refused, not because there is nothing to show."
        : `The request failed with ${response.status}. Anything shown below may be incomplete.`;

      console.error(`[SplatDev] ${response.status} from ${String(input)} \u2014 ${message}`);
      notifications?.peek("danger", { data: { headline, message } });
    }

    return response;
  };
}
