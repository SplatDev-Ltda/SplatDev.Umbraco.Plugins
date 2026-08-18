---
name: nopcommerce-plugin-logo
description: Add or fix a payment/shipping/misc plugin logo in nopCommerce. Use this skill whenever the user needs to add a logo to a nopCommerce plugin, asks to download and resize a brand logo for a plugin, says a plugin logo is missing in the admin, needs to configure logo.png in a .csproj, or is setting up a new SplatDev plugin and needs to wire up the logo. Triggers on phrases like "add logo to plugin", "plugin logo missing", "logo.png for nopCommerce", "download brand logo for plugin", "logo not showing in admin", or any mention of logo.png in the context of a nopCommerce plugin.
---

# nopCommerce Plugin Logo Workflow

Every nopCommerce plugin needs a `logo.png` that appears in the admin plugin list. The spec: **140×140 px, white background, brand logo centered and padded to 120×120 px (10 px padding on each side).**

---

## Step 1 — Download the Official Brand Logo

Get the logo from the brand's official press/media kit or CDN. Always prefer SVG or high-resolution PNG as the source — never rasterize a small image.

Common sources:
- Brand's official press kit / media page
- Brand's GitHub repo assets
- `cdn.brandfetch.io/<domain>` (Brandfetch CDN — good fallback)

Download to a temp location:
```bash
curl -L "https://official-brand-url/logo.svg" -o /tmp/brand-logo.svg
# or PNG:
curl -L "https://official-brand-url/logo.png" -o /tmp/brand-logo.png
```

---

## Step 2 — Convert to Plugin Logo Spec (140×140, white bg, 10px padding)

Use ImageMagick. The logo must fit within 120×120 (centered), on a 140×140 white canvas.

### From SVG source (best quality):
```bash
convert -background white \
  /tmp/brand-logo.svg \
  -resize 120x120 \
  -gravity center \
  -background white \
  -extent 140x140 \
  logo.png
```

### From PNG/JPG source:
```bash
convert /tmp/brand-logo.png \
  -background white \
  -alpha remove \
  -resize 120x120 \
  -gravity center \
  -background white \
  -extent 140x140 \
  logo.png
```

**Verify the output:**
```bash
identify logo.png
# Expected: logo.png PNG 140x140 ...
```

If the brand uses a dark logo (dark icon on transparent background), it will be invisible on white — use the brand's light-background variant, or add a colored brand background:
```bash
convert /tmp/brand-logo.png \
  -background "#0066CC" \
  -alpha remove \
  -resize 100x100 \
  -gravity center \
  -background white \
  -extent 140x140 \
  logo.png
```

---

## Step 3 — Deploy to the Live Plugin Output Folder

Copy `logo.png` to the plugin's output directory inside `Nop.Web/Plugins/`:

```bash
cp logo.png "Plugins/<Category>.<PluginName>/logo.png"
```

**Examples:**
```bash
cp logo.png "Plugins/Payments.PagBank/logo.png"
cp logo.png "Plugins/Payments.InfinityPay/logo.png"
cp logo.png "Plugins/Shipping.Correios/logo.png"
```

The `SystemName` from `plugin.json` determines the folder name — they must match exactly.

---

## Step 4 — Save to Plugin Source Directory

Copy to the plugin's source folder so it's version-controlled and rebuilt on next compile:

**SplatDev plugin path pattern:**
```
src/Plugins/SplatDev.Nop.Plugin.<Category>.<PluginName>/logo.png
```

```bash
cp logo.png "src/Plugins/SplatDev.Nop.Plugin.Payments.PagBank/logo.png"
```

**Also mirror to the shared nopCommerce projects repo** (per sync rule):
```bash
cp logo.png "/mnt/e/Source/Repos/nopcommerce projects/src/Plugins/SplatDev.Nop.Plugin.Payments.PagBank/logo.png"
```

---

## Step 5 — Fix the .csproj

Two things to check and fix in the plugin's `.csproj`:

### 5a — Verify OutputPath matches the plugin SystemName

```xml
<PropertyGroup>
  <OutputPath>..\..\Presentation\Nop.Web\Plugins\Payments.PagBank</OutputPath>
  <OutDir>$(OutputPath)</OutDir>
</PropertyGroup>
```

The folder name after `Plugins\` must match the `SystemName` in `plugin.json` exactly (case-sensitive).

### 5b — Add logo.png as a Content item

```xml
<ItemGroup>
  <Content Include="logo.png">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </Content>
</ItemGroup>
```

This ensures logo.png is copied to the output folder on every build. Without it, the logo only survives until the next `dotnet build` or `dotnet publish` clears the output.

### Full ItemGroup context (where to place it):

```xml
<ItemGroup>
  <Content Include="logo.png">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </Content>
  <None Update="Views\**\*.*">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
  <None Update="plugin.json">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>
```

---

## Checklist

- [ ] Logo source is official (not a fan-made or compressed version)
- [ ] Output is exactly 140×140 px (`identify logo.png` confirms)
- [ ] White background — no transparency in the final PNG
- [ ] Logo is centered with visible padding on all sides
- [ ] `logo.png` copied to live output: `Nop.Web/Plugins/<SystemName>/`
- [ ] `logo.png` saved in plugin source folder and committed
- [ ] `logo.png` mirrored to `/mnt/e/Source/Repos/nopcommerce projects/` and committed there
- [ ] `.csproj` has correct `OutputPath` (matches `plugin.json` SystemName)
- [ ] `.csproj` has `<Content Include="logo.png">` with `PreserveNewest`
- [ ] Logo appears in Admin → Configuration → Local plugins after IIS recycle / app restart

---

## Troubleshooting

**Logo doesn't appear in admin after following the steps:**
- Restart the nopCommerce application (IIS recycle or `dotnet run` restart) — the plugin list is cached
- Confirm the folder name in `Nop.Web/Plugins/` matches `SystemName` in `plugin.json` exactly

**Logo is a white square (invisible):**
- The brand logo has transparency and a dark/transparent icon — use the light-background variant or add a colored brand background in the convert command

**Logo looks blurry:**
- Source resolution was too low. Find the SVG version or a higher-res PNG (at least 200×200)

**Build overwrites the logo:**
- The `<Content Include="logo.png">` item is missing or misconfigured in the `.csproj`
