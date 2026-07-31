import type {
  BookListResponse,
  BookDetail,
  SimilarBook,
  ReadingProgress,
  Category,
  SortOption,
  FavoriteEntry,
} from "../types";

const BASE = "/umbraco/pdfcurator/api/v1/member";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchBooks(params: {
  query?: string;
  category?: string;
  sort?: SortOption;
  page?: number;
}): Promise<BookListResponse> {
  const qs = new URLSearchParams();
  if (params.query) qs.set("query", params.query);
  if (params.category) qs.set("category", params.category);
  if (params.sort) qs.set("sort", params.sort);
  if (params.page) qs.set("page", String(params.page));
  return request<BookListResponse>(`${BASE}/books?${qs.toString()}`);
}

export async function fetchBookDetail(id: number): Promise<BookDetail> {
  return request<BookDetail>(`${BASE}/books/${id}`);
}

export async function fetchSimilarBooks(id: number): Promise<SimilarBook[]> {
  return request<SimilarBook[]>(`${BASE}/books/${id}/similar`);
}

export async function fetchFavorites(): Promise<FavoriteEntry[]> {
  return request<FavoriteEntry[]>(`${BASE}/favorites`);
}

export async function addFavorite(bookId: number): Promise<void> {
  await request<void>(`${BASE}/favorites/${bookId}`, { method: "PUT" });
}

export async function removeFavorite(bookId: number): Promise<void> {
  await request<void>(`${BASE}/favorites/${bookId}`, { method: "DELETE" });
}

export async function fetchProgress(): Promise<ReadingProgress[]> {
  return request<ReadingProgress[]>(`${BASE}/progress`);
}

export async function updateProgress(
  bookId: number,
  page: number
): Promise<void> {
  await request<void>(`${BASE}/progress/${bookId}`, {
    method: "PUT",
    body: JSON.stringify({ page }),
  });
}

export function bookThumbnailUrl(bookId: number): string {
  return `${BASE}/books/${bookId}/thumbnail`;
}

export function bookFileUrl(bookId: number): string {
  return `${BASE}/books/${bookId}/file`;
}
