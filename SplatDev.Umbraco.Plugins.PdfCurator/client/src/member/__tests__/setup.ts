import { vi } from "vitest";

vi.stubGlobal("fetch", vi.fn());

vi.mock("../../styles/tokens.css?inline", () => ({
  default: `
    :host {
      --pdfc-space-xs: 0.25rem;
      --pdfc-space-sm: 0.5rem;
      --pdfc-space-md: 1rem;
      --pdfc-space-lg: 1.5rem;
      --pdfc-space-xl: 2rem;
      --pdfc-space-2xl: 3rem;
      --pdfc-radius-sm: 0.25rem;
      --pdfc-radius: 0.5rem;
      --pdfc-radius-lg: 0.75rem;
      --pdfc-bg: #ffffff;
      --pdfc-surface: #f3f4f6;
      --pdfc-surface-hover: #e5e7eb;
      --pdfc-text: #111827;
      --pdfc-text-secondary: #6b7280;
      --pdfc-text-muted: #9ca3af;
      --pdfc-border: #d1d5db;
      --pdfc-border-focus: #2563eb;
      --pdfc-focus-ring: 0 0 0 3px rgba(37, 99, 235, 0.3);
      --pdfc-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
      --pdfc-shadow-md: 0 4px 6px rgba(0,0,0,0.07);
      --pdfc-shadow: 0 1px 3px rgba(0,0,0,0.1);
      --pdfc-primary: #2563eb;
      --pdfc-primary-hover: #1d4ed8;
      --pdfc-primary-foreground: #ffffff;
    }
  `,
}));
