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
