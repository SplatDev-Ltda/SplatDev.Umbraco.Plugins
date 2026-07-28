# UmbracoCms.Themes.Blog

Blog theme for Umbraco CMS. Provides a complete blogging experience: post listing with pagination, individual post pages with author bio, comment section, related posts, category/tag archive, and a configurable sidebar.

## Requirements

- Umbraco CMS 13.x (net8.0) or 17.x (net10.0)
- UmbracoCms.Themes.Base 1.0.0
- SplatDev.Umbraco.Plugins.Yaml2Schema 1.0.35

## Installation

Install via NuGet:

```
dotnet add package UmbracoCms.Themes.Blog
```

The `BlogThemeComposer` runs automatically on first application start. It:

1. Extracts the embedded `Config/umbraco.yml` to `{ContentRoot}/config/themes/blog/umbraco.yml`
2. Creates all required data types, document types, and templates
3. Writes a `.done` file so the install step is skipped on subsequent starts

## Document Types

| Alias          | Description                                      |
|----------------|--------------------------------------------------|
| `blogRoot`          | Root node (allowAsRoot). Blog-wide settings.     |
| `blogListing`       | Listing page with pagination and sidebar config. |
| `blogPost`          | Individual post with content, author, metadata.  |
| `blogCategory`      | Category archive page.                           |
| `blogTag`           | Tag archive page.                                |
| `blogAuthor`        | Author profile page.                             |
| `commentElement`    | Element type for post comments.                  |
| `relatedPostElement`| Element type for related posts block.            |

## Templates

| Template       | View File             |
|----------------|-----------------------|
| BlogListing    | Views/BlogListing.cshtml |
| BlogPost       | Views/BlogPost.cshtml    |
| BlogCategory   | Views/BlogCategory.cshtml|
| BlogTag        | Views/BlogTag.cshtml     |
| BlogAuthor     | Views/BlogAuthor.cshtml  |

## CSS

Include `wwwroot/css/blog-theme.css` in your layout. Custom properties are declared on `:root` and can be overridden to match your brand:

```css
:root {
  --blog-color-primary: #2563eb;
  --blog-font-serif: Georgia, serif;
  --blog-content-width: 720px;
}
```

## Content Tree Example

```
Blog Root (blogRoot)
└── All Posts (blogListing)
    ├── My First Post (blogPost)
    ├── Categories (blogCategory)
    │   ├── Technology
    │   └── Design
    ├── Tags (blogTag)
    │   ├── umbraco
    │   └── dotnet
    └── Authors (blogAuthor)
        └── Jane Doe
```
