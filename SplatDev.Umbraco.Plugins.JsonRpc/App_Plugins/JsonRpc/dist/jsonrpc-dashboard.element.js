import { LitElement as p, html as s, css as c, customElement as l } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as m } from "@umbraco-cms/backoffice/element-api";
var u = Object.getOwnPropertyDescriptor, f = (e, o, d, i) => {
  for (var t = i > 1 ? void 0 : i ? u(o, d) : o, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (t = n(t) || t);
  return t;
};
const b = [
  { method: "POST", path: "/umbraco/api/jsonrpc" },
  { method: "GET", path: "/umbraco/api/jsonrpc/schema" },
  { method: "POST", path: "/umbraco/api/jsonrpc/batch" }
];
let a = class extends m(p) {
  render() {
    return s`
      <h1>JSON-RPC</h1>
      <p class="description">
        JSON-RPC 2.0 endpoint management for Umbraco. Expose and manage remote
        procedure call APIs with authentication and rate limiting.
      </p>

      <div class="status-card">
        <div class="status-icon">🔌</div>
        <div class="status-text">
          <h2>JSON-RPC API <span class="badge">Active</span></h2>
          <p>JSON-RPC 2.0 service is running and accepting requests.</p>
        </div>
      </div>

      <div class="endpoints">
        <h3>API Endpoints</h3>
        ${b.map(
      (e) => s`
            <div class="endpoint-item">
              <span class="method-badge">${e.method}</span>
              ${e.path}
            </div>
          `
    )}
      </div>
    `;
  }
};
a.styles = c`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 8px;
      padding: 0;
    }

    .description {
      color: var(--uui-color-text-alt, #6b7280);
      margin: 0 0 var(--uui-size-layout-2, 24px);
      max-width: 600px;
      line-height: 1.6;
    }

    .status-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .status-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .status-text h2 {
      margin: 0 0 4px;
      font-size: 1rem;
      font-weight: 600;
    }

    .status-text p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--uui-color-text-alt, #6b7280);
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      background: #d1fae5;
      color: #065f46;
    }

    .endpoints {
      background: var(--uui-color-surface, #fff);
      border: 1px solid var(--uui-color-border, #e5e7eb);
      border-radius: 6px;
      padding: 20px;
    }

    .endpoints h3 {
      margin: 0 0 12px;
      font-size: 1rem;
      font-weight: 600;
    }

    .endpoint-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid var(--uui-color-border, #f3f4f6);
      font-size: 0.875rem;
      font-family: var(--uui-font-family-monospace, monospace);
    }

    .endpoint-item:last-child {
      border-bottom: none;
    }

    .method-badge {
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: 700;
      background: #dbeafe;
      color: #1d4ed8;
    }
  `;
a = f([
  l("jsonrpc-dashboard")
], a);
const x = a;
export {
  a as JsonrpcDashboardElement,
  x as default
};
