# Screenshot Capture Scripts

These scripts capture backoffice and front-end screenshots for all Umbraco plugins.

## Usage

Run inside the U13 or U17 Docker container after Umbraco is fully booted:

```bash
node /app/e2e/scripts/capture-screenshots.mjs <umbraco-url> <output-dir>
```

Example:
```bash
node /app/e2e/scripts/capture-screenshots.mjs http://localhost:5001 /output/screenshots
```

## Output

Screenshots are saved as:
- `docs/screenshots/<plugin-name>-backoffice.png`
- `docs/screenshots/<plugin-name>-frontend.png`

## Credentials

Hardcoded per the Docker test environment defaults:
- Admin username: `admin@splatdev.local`
- Admin password: `SplatDev2024!`
