# AdPreview Umbraco 17 port

## Goal
Give editors a native Bellissima property editor for image ads while retaining the v7/v8 `AdPreview` alias and JSON storage contract.

## Acceptance criteria
- The `AdPreview` schema appears as a selectable property editor.
- Editors can enter image URL, title, description, link, tooltip, referrer, CSS, and overlay.
- Preview, edit, cancel, save, and remove states work without losing saved data.
- Saved values retain `img`, `title`, `description`, `url`, `tooltip`, `referrer`, `css`, `overlay`.

## UI
See `docs/wireframes/2026-08-13-adpreview-v17.md`.

## Testing
TypeScript strict build plus a rendered backoffice smoke test that checks visible `Ad Preview`, `Edit ad`, and `Remove` controls and a persisted overlay value.
