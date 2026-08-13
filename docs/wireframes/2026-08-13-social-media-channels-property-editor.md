# Social Media Channels Property Editor

## Document editor — configured state

```text
Umbraco Content > Page > Properties
┌─────────────────────────────────────────────────────────────┐
│ Rich Content                                                 │
│  Choose theme [ Circle                                  v ]  │
│  ☑ Show labels                                               │
│  Circle — Circle Icons Set by IC Design                      │
│  Background  ○ white   ● light grey   ○ dark                │
│  Facebook       [ https://facebook.com/example            ]  │
│  Twitter        [ https://x.com/example                   ]  │
│  YouTube        [ https://youtube.com/@example             ]  │
│  RSS            [ https://example.com/feed                 ]  │
│  Instagram      [ https://instagram.com/example            ]  │
│  LinkedIn       [ https://linkedin.com/company/example     ]  │
└─────────────────────────────────────────────────────────────┘
```

## Empty state

Theme select shows `Default`; helper text says “Select a theme to configure social profile links.”

## Interactions

- Theme selection creates the legacy-compatible JSON value.
- Checkbox and URL inputs dispatch a bubbling `change` event so Umbraco persists edits.
- Read-only properties disable every input.
- Reopening uses the supplied `value` object rather than resetting it, preserving channel URLs.
