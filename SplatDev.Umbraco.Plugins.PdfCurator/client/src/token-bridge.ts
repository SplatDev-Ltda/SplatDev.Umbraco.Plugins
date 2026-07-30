/**
 * Token bridge: maps --pdfc-* custom properties to --uui-* equivalents.
 * All PdfCurator web components consume --pdfc-* tokens; this bridge
 * maps them to Umbraco UI (UUI) design tokens so the pdfc components
 * blend seamlessly into the Umbraco backoffice.
 */

const tokenMap: Record<string, string> = {
  "--pdfc-color-primary": "var(--uui-color-selected)",
  "--pdfc-color-primary-emphasis": "var(--uui-color-selected-emphasis)",
  "--pdfc-color-text": "var(--uui-color-text)",
  "--pdfc-color-text-alt": "var(--uui-color-text-alt)",
  "--pdfc-color-surface": "var(--uui-color-surface)",
  "--pdfc-color-surface-alt": "var(--uui-color-surface-alt)",
  "--pdfc-color-border": "var(--uui-color-border)",
  "--pdfc-color-border-standalone": "var(--uui-color-border-standalone)",
  "--pdfc-color-danger": "var(--uui-color-danger)",
  "--pdfc-color-danger-emphasis": "var(--uui-color-danger-emphasis)",
  "--pdfc-color-warning": "var(--uui-color-warning)",
  "--pdfc-color-warning-emphasis": "var(--uui-color-warning-emphasis)",
  "--pdfc-color-positive": "var(--uui-color-positive)",
  "--pdfc-color-positive-emphasis": "var(--uui-color-positive-emphasis)",
  "--pdfc-color-disabled-text": "var(--uui-color-disabled-text)",
  "--pdfc-color-focus": "var(--uui-color-focus)",

  "--pdfc-size-layout-1": "var(--uui-size-layout-1, 24px)",
  "--pdfc-size-layout-2": "var(--uui-size-layout-2, 36px)",
  "--pdfc-size-layout-3": "var(--uui-size-layout-3, 48px)",

  "--pdfc-size-space-1": "var(--uui-size-space-1, 2px)",
  "--pdfc-size-space-2": "var(--uui-size-space-2, 4px)",
  "--pdfc-size-space-3": "var(--uui-size-space-3, 8px)",
  "--pdfc-size-space-4": "var(--uui-size-space-4, 12px)",
  "--pdfc-size-space-5": "var(--uui-size-space-5, 16px)",
  "--pdfc-size-space-6": "var(--uui-size-space-6, 24px)",

  "--pdfc-border-radius": "var(--uui-border-radius, 3px)",
  "--pdfc-font-family": "var(--uui-font-family, inherit)",
  "--pdfc-font-size-default": "var(--uui-font-size-default, 14px)",
  "--pdfc-font-weight-bold": "var(--uui-font-weight-bold, 600)",
};

export function applyTokenBridge(): void {
  const style = document.createElement("style");
  style.id = "pdfc-token-bridge";
  style.textContent = `:root {\n${Object.entries(tokenMap)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n")}\n}`;
  document.head.appendChild(style);
}

export function removeTokenBridge(): void {
  const style = document.getElementById("pdfc-token-bridge");
  if (style) {
    style.remove();
  }
}
