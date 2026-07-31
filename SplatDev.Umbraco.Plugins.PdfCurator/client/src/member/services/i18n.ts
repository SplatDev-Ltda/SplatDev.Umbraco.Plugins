import type { Language } from "../types";

const translations: Record<Language, Record<string, string>> = {
  en: {
    library_title: "PDF Library",
    library_search_placeholder: "Search by title or author...",
    library_all_categories: "All Categories",
    library_sort_recent: "Most Recent",
    library_sort_title: "Title A-Z",
    library_sort_author: "Author A-Z",
    library_no_results: "No books found.",
    library_error: "Failed to load library. Please try again.",
    library_empty: "The library is empty. Check back soon.",
    library_page: "Page",
    library_of: "of",

    book_download: "Download PDF",
    book_read: "Read Online",
    book_favorite_add: "Add to Favorites",
    book_favorite_remove: "Remove from Favorites",
    book_continue_reading: "Continue reading (page {page})",
    book_start_reading: "Start Reading",
    book_author: "Author",
    book_category: "Category",
    book_pages: "Pages",
    book_added: "Added",
    book_similar_title: "You May Also Like",
    book_error: "Failed to load book details.",

    favorites_title: "My Favorites",
    favorites_reading_now: "Reading Now",
    favorites_no_favorites: "No favorites yet. Browse the library to add some!",
    favorites_no_reading: "Start reading a book to track your progress here.",
    favorites_error: "Failed to load favorites.",

    reader_page: "Page",
    reader_of: "of",
    reader_zoom_in: "Zoom In",
    reader_zoom_out: "Zoom Out",
    reader_previous: "Previous Page",
    reader_next: "Next Page",
    reader_close: "Close Reader",
    reader_loading: "Loading PDF...",
    reader_error: "Failed to load PDF.",
    reader_progress_saved: "Progress saved",
  },
  es: {
    library_title: "Biblioteca PDF",
    library_search_placeholder: "Buscar por título o autor...",
    library_all_categories: "Todas las Categorías",
    library_sort_recent: "Más Recientes",
    library_sort_title: "Título A-Z",
    library_sort_author: "Autor A-Z",
    library_no_results: "No se encontraron libros.",
    library_error: "Error al cargar la biblioteca. Intente de nuevo.",
    library_empty: "La biblioteca está vacía. Vuelva pronto.",
    library_page: "Página",
    library_of: "de",

    book_download: "Descargar PDF",
    book_read: "Leer en Línea",
    book_favorite_add: "Agregar a Favoritos",
    book_favorite_remove: "Quitar de Favoritos",
    book_continue_reading: "Continuar lectura (página {page})",
    book_start_reading: "Comenzar a Leer",
    book_author: "Autor",
    book_category: "Categoría",
    book_pages: "Páginas",
    book_added: "Agregado",
    book_similar_title: "También te Puede Gustar",
    book_error: "Error al cargar detalles del libro.",

    favorites_title: "Mis Favoritos",
    favorites_reading_now: "Leyendo Ahora",
    favorites_no_favorites: "Aún no hay favoritos. ¡Explore la biblioteca!",
    favorites_no_reading: "Comience a leer un libro para ver su progreso aquí.",
    favorites_error: "Error al cargar favoritos.",

    reader_page: "Página",
    reader_of: "de",
    reader_zoom_in: "Acercar",
    reader_zoom_out: "Alejar",
    reader_previous: "Página Anterior",
    reader_next: "Página Siguiente",
    reader_close: "Cerrar Lector",
    reader_loading: "Cargando PDF...",
    reader_error: "Error al cargar el PDF.",
    reader_progress_saved: "Progreso guardado",
  },
};

let currentLang: Language = "en";

export function setLanguage(lang: Language): void {
  currentLang = lang;
}

export function getLanguage(): Language {
  return currentLang;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = translations[currentLang] ?? translations.en;
  let text = dict[key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
