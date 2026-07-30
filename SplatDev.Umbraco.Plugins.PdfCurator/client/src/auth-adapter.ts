/**
 * Auth adapter: fetch wrapper that sends backoffice credentials (cookie)
 * on every request. This is the contract the real pdfc.js bundle will consume
 * once the PdfCurator.Web package publishes it.
 *
 * Usage:
 *   import { pdfcFetch } from "./auth-adapter";
 *   const response = await pdfcFetch("/umbraco/pdfcurator/api/v1/ping");
 */

interface PdfcRequestOptions extends RequestInit {
  /** Skip sending Umbraco backoffice XSRF header */
  skipXsrf?: boolean;
}

const API_BASE = "/umbraco/pdfcurator/api/v1";

export async function pdfcFetch(
  path: string,
  options: PdfcRequestOptions = {},
): Promise<Response> {
  const url = path.startsWith("/") ? path : `${API_BASE}/${path}`;

  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (!options.skipXsrf) {
    headers.set("X-UMB-XSRF-TOKEN", "1");
  }

  const requestInit: RequestInit = {
    ...options,
    credentials: "same-origin",
    headers,
  };

  return fetch(url, requestInit);
}

export async function pdfcGet<T = unknown>(path: string): Promise<T> {
  const response = await pdfcFetch(path);
  if (!response.ok) {
    throw new Error(`pdfc GET ${path} failed: HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function pdfcPost<T = unknown>(
  path: string,
  body: unknown,
): Promise<T> {
  const response = await pdfcFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: new Headers({ "Content-Type": "application/json" }),
  });
  if (!response.ok) {
    throw new Error(`pdfc POST ${path} failed: HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export { API_BASE };
