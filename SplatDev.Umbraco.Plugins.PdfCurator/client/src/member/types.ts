export interface BookEntry {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  pageCount: number;
  thumbnailUrl: string;
  fileUrl: string;
  createdAt: string;
}

export interface BookListResponse {
  items: BookEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BookDetail extends BookEntry {
  isFavorite: boolean;
  readingProgress: ReadingProgress | null;
}

export interface ReadingProgress {
  bookId: number;
  page: number;
  pageCount: number;
  updatedAt: string;
}

export interface SimilarBook {
  id: number;
  title: string;
  author: string;
  category: string;
  thumbnailUrl: string;
}

export interface FavoriteEntry {
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  thumbnailUrl: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
}

export type SortOption = "recent" | "title" | "author";

export type Language = "en" | "es";

export type ComponentState = "loading" | "loaded" | "error" | "empty";
