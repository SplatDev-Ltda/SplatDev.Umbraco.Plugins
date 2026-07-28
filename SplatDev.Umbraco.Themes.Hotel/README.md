# UmbracoCms.Themes.Hotel

Hotel/hospitality theme for Umbraco – rooms, booking, gallery, amenities, reviews, location map.

## Features

- Hotel root with global settings (star rating, check-in/out times, booking URL, social links)
- Full-screen hero with optional video background and booking widget overlay
- Rooms listing with sidebar filter by bed type, occupancy, and price range
- Room detail page with image hero, specs grid, features, pricing box, and Book Now CTA
- Amenities page with icon-based category grid
- Dining page with restaurant details and gallery
- Gallery page with category tabs, CSS lightbox, and masonry-style grid
- Reviews page with average score, star breakdown bars, and review cards
- Contact page with address, map embed, and directions
- Elegant serif typography system with antique gold accent palette
- Mobile-responsive layout throughout

## Compatibility

| NuGet target    | Umbraco version |
|-----------------|-----------------|
| `net8.0`        | 13.12.0         |
| `net10.0`       | 17.3.4          |

## Installation

Install via NuGet:

```
dotnet add package UmbracoCms.Themes.Hotel
```

On first startup the theme auto-installs its Umbraco schema (data types, document types, templates) via `SplatDev.Umbraco.Plugins.Yaml2Schema`. A `.done` file is written to `{ContentRoot}/config/themes/hotel/` to prevent re-installation.

## Document Types

| Alias            | Description                                              |
|------------------|----------------------------------------------------------|
| `basePage`       | Shared base page with common properties                  |
| `hotelRoot`      | Site root – global settings, social links                |
| `hotelHome`      | Home page with hero, booking widget, rooms, reviews      |
| `roomsListing`   | Rooms catalog with filter sidebar                        |
| `room`           | Individual room/suite detail                             |
| `amenitiesPage`  | Amenities overview                                       |
| `diningPage`     | Restaurant/dining detail                                 |
| `galleryPage`    | Photo gallery with lightbox                              |
| `reviewsPage`    | Guest reviews with rating summary                        |
| `contactPage`    | Contact info, map embed, directions                      |

### Element Types

| Alias          | Description                       |
|----------------|-----------------------------------|
| `amenityItem`  | Individual amenity with icon      |
| `reviewItem`   | Guest review with rating          |
| `roomFeature`  | Room feature/specification        |
| `galleryItem`  | Gallery image with caption        |

## Templates

| Template       | View File                     |
|----------------|-------------------------------|
| HotelHome      | Views/HotelHome.cshtml        |
| RoomsListing   | Views/RoomsListing.cshtml     |
| Room           | Views/Room.cshtml             |
| AmenitiesPage  | Views/AmenitiesPage.cshtml    |
| DiningPage     | Views/DiningPage.cshtml       |
| GalleryPage    | Views/GalleryPage.cshtml      |
| ReviewsPage    | Views/ReviewsPage.cshtml      |
| ContactPage    | Views/ContactPage.cshtml      |

## Stylesheet

Include `/css/hotel-theme.css` in your layout or reference it directly. Customise via CSS custom properties defined in `:root`. The theme uses `Playfair Display` (serif) for headings and `Inter` for body text – load these from Google Fonts for best results.
