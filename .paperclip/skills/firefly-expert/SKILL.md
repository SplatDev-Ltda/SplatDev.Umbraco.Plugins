---
name: firefly-expert
description: Adobe Firefly expert for generating commercially-safe images, vectors, icons, and design assets using AI. Use this skill whenever the user wants to generate images with Firefly, asks about prompt engineering for image generation, needs AI-generated assets that are safe for commercial use, wants to use generative fill or canvas expansion, is building a marketing or design asset workflow with AI, asks about the Firefly API or SDK, needs to batch-generate variations, or wants guidance on exporting and integrating AI assets into a project. Also triggers for questions about AI image licensing, Content Credentials, comparing Firefly to Midjourney/DALL-E, or generating SVG/vector content with AI.
---

# Adobe Firefly Expert

Adobe Firefly generates images, vectors, textures, and design elements trained on Adobe Stock and openly licensed content — making outputs safe for commercial production use without copyright risk.

## When Firefly Is the Right Tool

Use Firefly when you need:
- **Commercially safe** AI images (not Midjourney/DALL-E, which carry licensing uncertainty)
- **Style-consistent variations** of an existing concept (seed-based iteration)
- **Generative fill** — replacing or extending parts of an existing image
- **Background generation** — realistic or stylized backgrounds behind a subject
- **Batch variations** for A/B testing marketing assets
- **Vectors and icons** (via the vector generation feature)

When the user only needs an image for mockups/internal use and licensing doesn't matter, other tools may be faster. When the output ships in a product or campaign, Firefly is the right call.

---

## Prompt Strategy

Good prompts follow this structure:
```
[subject] [action/pose] [setting] [style adjectives] [lighting] [composition]
```

Examples:
```
minimalist app icon, flat vector style, soft pastel gradient, centered composition
professional woman working at standing desk, modern office, soft natural lighting, shallow depth of field
abstract geometric background, deep blue and gold tones, luxury feel, symmetrical
```

**Tips:**
- Be specific about style: *"flat vector"* vs *"3D render"* vs *"watercolor"* produces very different results
- Include lighting: *"studio lighting"*, *"golden hour"*, *"dramatic rim light"*
- Describe what you don't want in a negative prompt when the API supports it
- Save seeds from outputs you like — reseed to generate consistent variations

---

## API Usage

Credentials come from Adobe Developer Console. Store them as environment variables — never hard-code:

```bash
export ADOBE_CLIENT_ID="your-client-id"
export ADOBE_CLIENT_SECRET="your-client-secret"
```

### Get an Access Token

```bash
TOKEN=$(curl -s -X POST https://ims-na1.adobelogin.com/ims/token/v3 \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=$ADOBE_CLIENT_ID&client_secret=$ADOBE_CLIENT_SECRET&scope=openid,AdobeID,firefly_api" \
  | jq -r '.access_token')
```

### Text to Image

```bash
curl -X POST "https://firefly-api.adobe.io/v3/images/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-api-key: $ADOBE_CLIENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "minimalist mobile app icon, gradient blue to purple, rounded corners, flat style",
    "numVariations": 4,
    "size": { "width": 1024, "height": 1024 },
    "styles": { "presets": ["digital_art"] }
  }'
```

### Generative Fill (Inpainting)

```bash
curl -X POST "https://firefly-api.adobe.io/v3/images/fill" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-api-key: $ADOBE_CLIENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "image": { "source": { "url": "https://..." } },
    "mask": { "source": { "url": "https://..." } },
    "prompt": "modern glass desk with laptop and plant"
  }'
```

### Canvas Expansion (Outpainting)

```bash
curl -X POST "https://firefly-api.adobe.io/v3/images/expand" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-api-key: $ADOBE_CLIENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "image": { "source": { "url": "https://..." } },
    "prompt": "seamless continuation of the scene",
    "size": { "width": 1920, "height": 1080 }
  }'
```

---

## Common Workflows

### Marketing Asset Pipeline
1. Generate hero image with text-to-image (4 variations, pick best)
2. Expand canvas for different aspect ratios (16:9 for web, 9:16 for stories, 1:1 for social)
3. Use generative fill to swap out seasonal/campaign-specific elements
4. Export: PNG for web, high-res TIFF for print

### App Icon / UI Asset Generation
1. Generate icon concepts with flat/vector style preset
2. Use seeds from best results to produce consistent sibling icons
3. Export at 1024×1024, then resize down — never upscale small icons
4. For icon sets: fix the style in the prompt and vary only the subject

### Texture and Background Generation
1. Describe mood + color range + texture type (grain, fabric, marble, etc.)
2. Generate tiling patterns by requesting "seamless texture, repeatable"
3. Test tiling in browser: `background-image: url(); background-repeat: repeat;`

---

## Style Presets

| Preset | Use When |
|--------|---------|
| `digital_art` | Clean UI assets, icons, product shots |
| `photo` | Lifestyle, people, environments |
| `watercolor` | Editorial, blog illustrations, soft brand feel |
| `3d_render` | Product mockups, 3D-feel icons, hero imagery |
| `vector_look` | Flat icons, illustrations, infographics |

Mood modifiers to combine: `dramatic`, `soft`, `studio`, `vibrant`, `muted`, `monochrome`, `cinematic`, `editorial`.

---

## Export Formats

| Format | Use For |
|--------|---------|
| PNG | Web images, transparent backgrounds |
| JPEG | Photography-style outputs, smaller file size |
| SVG | Vector outputs only — not available for raster generation |
| PSD | Further editing in Photoshop |

---

## Commercial Safety and Content Credentials

Every Firefly output includes **Content Credentials** — digital provenance metadata showing the image was AI-generated. This is embedded in the file and visible via `contentcredentials.org`. Clients and legal teams can verify the AI origin if asked.

Firefly's training data is Adobe Stock + openly licensed content, making it the safest choice for commercial work. If a client or project requires documented IP safety, note this provenance when delivering assets.

---

## Limits and Gotchas

- API responses include output URLs that expire — download and store assets promptly
- Rate limits vary by tier; batch requests across multiple variations rather than sequential single calls
- Generative fill requires a mask image (white = fill area, black = preserve)
- The vector generation feature produces SVG-like output but quality varies — review before use in production
- Text rendering in generated images is often unreliable — add text in post using design tools
