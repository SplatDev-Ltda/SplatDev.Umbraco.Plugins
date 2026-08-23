/**
 * Resolves a media item's key to the URL its file is served from.
 *
 * The picker hands back media keys, while these records store a URL. Reading
 * `umbracoFile.src` gives the site-relative path, which is what should be stored — an
 * absolute URL bakes in the host and breaks the moment the site moves domain.
 */
export async function mediaUrlForKey(
  fetcher: typeof fetch,
  key: string,
): Promise<string | null> {
  try {
    const response = await fetcher(`/umbraco/management/api/v1/media/${encodeURIComponent(key)}`);
    if (response.ok) {
      const item = (await response.json()) as {
        values?: Array<{ alias?: string; value?: unknown }>;
      };
      const file = item.values?.find((v) => v.alias === "umbracoFile")?.value;
      const src =
        typeof file === "string"
          ? file
          : (file as { src?: string } | undefined)?.src;
      if (src) return src;
    }
  } catch {
    /* fall through to the URL endpoint */
  }

  // Older items, and anything whose file lives behind a different property, still
  // resolve through the urls endpoint.
  try {
    const response = await fetcher(
      `/umbraco/management/api/v1/media/urls?id=${encodeURIComponent(key)}`,
    );
    if (!response.ok) return null;
    const list = (await response.json()) as Array<{
      urlInfos?: Array<{ url?: string }>;
    }>;
    return list?.[0]?.urlInfos?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolves a media key to an absolute URL.
 *
 * Some consumers cannot use a site-relative path: an e-mail logo is rendered by a mail
 * client on someone else's machine, and an Open Graph image is fetched by a crawler that
 * has only the tag to go on. Both need a scheme and a host.
 *
 * Prefers the urls endpoint, which returns absolute URLs, and falls back to resolving the
 * relative path against the current origin.
 */
export async function absoluteMediaUrlForKey(
  fetcher: typeof fetch,
  key: string,
): Promise<string | null> {
  try {
    const response = await fetcher(
      `/umbraco/management/api/v1/media/urls?id=${encodeURIComponent(key)}`,
    );
    if (response.ok) {
      const list = (await response.json()) as Array<{ urlInfos?: Array<{ url?: string }> }>;
      const url = list?.[0]?.urlInfos?.[0]?.url;
      if (url && /^https?:\/\//i.test(url)) return url;
      if (url) return new URL(url, window.location.origin).toString();
    }
  } catch {
    /* fall through */
  }

  const relative = await mediaUrlForKey(fetcher, key);
  if (!relative) return null;
  try {
    return new URL(relative, window.location.origin).toString();
  } catch {
    return relative;
  }
}
