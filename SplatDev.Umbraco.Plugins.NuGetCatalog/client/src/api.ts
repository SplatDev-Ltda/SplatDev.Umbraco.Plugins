import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

export const API_BASE = "/umbraco/nuget-catalog/api/v1";

export interface PackageView {
  id: string;
  version?: string | null;
  totalDownloads: number;
  summary: string;
  fullSummary?: string | null;
  iconUrl?: string | null;
  projectUrl?: string | null;
  nuGetUrl: string;
  isExplicit: boolean;
  isHidden: boolean;
  isDeprecated: boolean;
  vulnerabilityCount: number;
}

export interface CatalogResponse {
  packages: PackageView[];
  hidden: PackageView[];
  owners: string[];
  added: string[];
  refreshedUtc?: string | null;
  warning?: string | null;
}

async function describeError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body?.message) return body.message;
  } catch {
    /* not JSON — fall through to the status line */
  }
  return `${response.status} ${response.statusText}`;
}

/**
 * Thin API client for the NuGet catalog endpoints.
 *
 * The controller is guarded by `AuthorizationPolicies.BackOfficeAccess`, which in
 * Umbraco 17 means a bearer token — cookies alone are not enough. The token comes from
 * UMB_AUTH_CONTEXT, which the element consumes and hands to this client.
 */
export class CatalogApi {
  #host: UmbControllerHost;
  #token: string | null = null;
  #ready: Promise<void>;

  constructor(host: UmbControllerHost) {
    this.#host = host;

    // consumeContext fires asynchronously; every call awaits this so the first request
    // cannot race ahead of the token being available.
    this.#ready = new Promise<void>((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.#host as any).consumeContext(UMB_AUTH_CONTEXT, async (ctx: any) => {
        try {
          // getLatestToken() is deprecated in Umbraco 17 but remains functional through
          // v19; there is no stable replacement for plain fetch yet.
          this.#token = (await ctx?.getLatestToken?.()) ?? null;
        } catch {
          this.#token = null;
        }
        resolve();
      });

      // Never hang the UI if the context is unavailable — fall through unauthenticated
      // and let the request surface a 401.
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

    return fetch(`${API_BASE}${path}`, { ...init, credentials: "same-origin", headers });
  }

  async #send<T>(path: string, method: string, body?: unknown): Promise<T> {
    const headers = new Headers();
    if (body !== undefined) headers.set("Content-Type", "application/json");

    const response = await this.#fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) throw new Error(await describeError(response));
    if (response.status === 204) return undefined as T;

    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  getPackages(): Promise<CatalogResponse> {
    return this.#send<CatalogResponse>("/packages", "GET");
  }

  refresh(): Promise<CatalogResponse> {
    return this.#send<CatalogResponse>("/refresh", "POST");
  }

  addPackage(urlOrId: string): Promise<{ packageId: string }> {
    return this.#send("/packages", "POST", { urlOrId });
  }

  removePackage(id: string): Promise<void> {
    return this.#send(`/packages/${encodeURIComponent(id)}`, "DELETE");
  }

  hide(id: string): Promise<void> {
    return this.#send(`/hidden/${encodeURIComponent(id)}`, "POST");
  }

  unhide(id: string): Promise<void> {
    return this.#send(`/hidden/${encodeURIComponent(id)}`, "DELETE");
  }

  addOwner(owner: string): Promise<{ owner: string }> {
    return this.#send("/owners", "POST", { owner });
  }

  removeOwner(owner: string): Promise<void> {
    return this.#send(`/owners/${encodeURIComponent(owner)}`, "DELETE");
  }
}
