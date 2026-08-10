import { css } from "@umbraco-cms/backoffice/external/lit";

/**
 * Styles shared across the WhatsApp views.
 *
 * Everything is expressed in --uui-* design tokens so the dashboard follows the
 * backoffice theme (including dark mode) instead of hardcoding a palette. The one
 * deliberate exception is WhatsApp brand green on outbound bubbles, which is the
 * visual cue operators expect; it carries an explicit readable foreground rather
 * than inheriting one.
 */
export const sharedStyles = css`
  :host {
    display: block;
    padding: var(--uui-size-layout-1, 24px);
    color: var(--uui-color-text);
    font-family: var(--uui-font-family, inherit);
  }

  .head {
    margin-bottom: var(--uui-size-space-5, 16px);
  }

  .head h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 4px;
  }

  .head p {
    margin: 0;
    color: var(--uui-color-text-alt);
    font-size: 0.875rem;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-3, 8px);
    flex-wrap: wrap;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-2, 4px);
    margin-bottom: var(--uui-size-space-4, 12px);
  }

  .field label {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .hint {
    color: var(--uui-color-text-alt);
    font-size: 0.8rem;
    margin: 0;
  }

  .empty {
    padding: var(--uui-size-space-6, 24px);
    text-align: center;
    color: var(--uui-color-text-alt);
    font-size: 0.875rem;
  }

  .error {
    background: var(--uui-color-danger);
    color: var(--uui-color-selected-contrast, #fff);
    border-radius: var(--uui-border-radius, 3px);
    padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
    font-size: 0.85rem;
    margin-bottom: var(--uui-size-space-4, 12px);
    overflow-wrap: anywhere;
  }

  .ok {
    background: var(--uui-color-positive);
    color: var(--uui-color-selected-contrast, #fff);
    border-radius: var(--uui-border-radius, 3px);
    padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
    font-size: 0.85rem;
    margin-bottom: var(--uui-size-space-4, 12px);
    overflow-wrap: anywhere;
  }

  .warn {
    background: var(--uui-color-warning);
    color: var(--uui-color-warning-contrast, #000);
    border-radius: var(--uui-border-radius, 3px);
    padding: var(--uui-size-space-3, 8px) var(--uui-size-space-4, 12px);
    font-size: 0.85rem;
    margin-bottom: var(--uui-size-space-4, 12px);
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8rem;
    background: var(--uui-color-surface-alt);
    padding: 1px 5px;
    border-radius: 3px;
    overflow-wrap: anywhere;
  }

  /* Wide content must scroll inside its own box, never the page. */
  .scroll-x {
    overflow-x: auto;
  }
`;
