import { LitElement, html, css, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_MODAL_MANAGER_CONTEXT } from "@umbraco-cms/backoffice/modal";
import type { UmbModalManagerContext } from "@umbraco-cms/backoffice/modal";

interface DashboardStat {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  href?: string;
  action?: () => void;
}

@customElement("formbuilder-dashboard")
export class FormBuilderDashboardElement extends UmbElementMixin(LitElement) {
  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1, 24px);
      color: var(--uui-color-text);
      font-family: var(--uui-font-family);
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--uui-size-layout-2, 24px);
      gap: var(--uui-size-layout-1, 24px);
    }

    .header-content h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 4px;
      padding: 0;
      color: var(--uui-color-text);
    }

    .header-content p {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: 0.925rem;
      max-width: 520px;
      line-height: 1.6;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--uui-size-layout-1, 16px);
      margin-bottom: var(--uui-size-layout-2, 24px);
    }

    .stat-card {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 6px);
      padding: var(--uui-size-space-5, 20px);
      transition: box-shadow 0.15s ease;
    }

    .stat-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .stat-icon.primary { background: var(--uui-color-current, #f0f5ff); color: var(--uui-color-current-emphasis, #3b82f6); }
    .stat-icon.success { background: var(--uui-color-positive, #ecfdf5); color: var(--uui-color-positive-emphasis, #10b981); }
    .stat-icon.warning { background: var(--uui-color-warning, #fffbeb); color: var(--uui-color-warning-emphasis, #f59e0b); }

    .stat-trend {
      font-size: 0.75rem;
      font-weight: 600;
    }

    .stat-trend.up { color: var(--uui-color-positive-emphasis, #10b981); }
    .stat-trend.down { color: var(--uui-color-danger-emphasis, #ef4444); }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.8125rem;
      color: var(--uui-color-text-alt);
      margin-top: 2px;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--uui-size-layout-1, 16px);
      margin-bottom: var(--uui-size-layout-2, 24px);
    }

    .action-card {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 6px);
      padding: var(--uui-size-space-5, 20px);
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      display: flex;
      gap: var(--uui-size-space-4, 14px);
      align-items: flex-start;
    }

    .action-card:hover {
      border-color: var(--uui-color-current-emphasis, #3b82f6);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .action-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: var(--uui-color-current, #f0f5ff);
      color: var(--uui-color-current-emphasis, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .action-content h3 {
      margin: 0 0 2px;
      font-size: 0.9375rem;
      font-weight: 600;
    }

    .action-content p {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--uui-color-text-alt);
      line-height: 1.5;
    }

    .status-section {
      background: var(--uui-color-surface);
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius, 6px);
      padding: var(--uui-size-space-5, 20px);
    }

    .status-section h2 {
      margin: 0 0 12px;
      font-size: 1rem;
      font-weight: 600;
    }

    .status-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--uui-color-border);
    }

    .status-item:last-child { border-bottom: none; }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .status-dot.ok { background: var(--uui-color-positive-emphasis, #10b981); }
    .status-dot.warn { background: var(--uui-color-warning-emphasis, #f59e0b); }

    .status-text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
    }

    .status-value {
      font-size: 0.8125rem;
      color: var(--uui-color-text-alt);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--uui-size-layout-1, 16px);
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.0625rem;
      font-weight: 600;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .badge.ready { background: var(--uui-color-positive, #ecfdf5); color: var(--uui-color-positive-emphasis, #10b981); }
    .badge.setup { background: var(--uui-color-warning, #fffbeb); color: var(--uui-color-warning-emphasis, #f59e0b); }

    .getting-started {
      display: flex;
      gap: var(--uui-size-space-4, 14px);
      padding: var(--uui-size-space-5, 20px);
      background: var(--uui-color-current, #f0f5ff);
      border-radius: var(--uui-border-radius, 6px);
      margin-top: var(--uui-size-layout-1, 16px);
      align-items: flex-start;
    }

    .getting-started .icon {
      font-size: 1.25rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .getting-started h3 {
      margin: 0 0 4px;
      font-size: 0.9375rem;
      font-weight: 600;
    }

    .getting-started p {
      margin: 0;
      font-size: 0.8125rem;
      line-height: 1.5;
      color: var(--uui-color-text-alt);
    }

    .getting-started code {
      background: var(--uui-color-surface);
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 0.8125rem;
    }
  `;

  @state() private _pingStatus: "ok" | "loading" | "error" = "loading";
  @state() private _pingMessage = "";

  private _stats: DashboardStat[] = [
    { label: "Forms", value: "—", icon: "📋", trend: "Setup required" },
    { label: "Submissions (24h)", value: "—", icon: "📨" },
    { label: "Active Workflows", value: "—", icon: "⚡" },
  ];

  private _quickActions: QuickAction[] = [
    {
      label: "Create a Form",
      description: "Define fields, validations, and layout for a new form",
      icon: "➕",
      action: () => this._onQuickAction("create-form"),
    },
    {
      label: "View Submissions",
      description: "Browse and export form submission data",
      icon: "📊",
      action: () => this._onQuickAction("view-submissions"),
    },
    {
      label: "Manage Workflows",
      description: "Configure email notifications and post-submit actions",
      icon: "🔔",
      action: () => this._onQuickAction("manage-workflows"),
    },
    {
      label: "Documentation",
      description: "Read the FormBuilder setup and API guide",
      icon: "📖",
      action: () => this._onQuickAction("docs"),
    },
  ];

  private _modalContext?: UmbModalManagerContext;

  constructor() {
    super();
    this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (instance) => {
      this._modalContext = instance;
    });
  }

  override connectedCallback() {
    super.connectedCallback();
    this._checkStatus();
  }

  private async _checkStatus() {
    this._pingStatus = "loading";
    try {
      const res = await fetch("/umbraco/management/api/v1/formbuilder-extension/ping");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      this._pingMessage = text;
      this._pingStatus = "ok";
    } catch {
      this._pingStatus = "error";
      this._pingMessage = "API endpoint not reachable. Ensure the FormBuilder package is installed and the site is running.";
    }
  }

  private _onQuickAction(id: string) {
    if (id === "docs") {
      window.open("https://github.com/splatdevtech/SplatDev.Umbraco.Plugins/blob/master/SplatDev.Umbraco.Plugins.FormBuilder/README.md", "_blank");
      return;
    }
    if (this._modalContext) {
      this._modalContext.open(this, "/umbraco/modal/template", {
        data: {
          headline: `FormBuilder — ${id}`,
          content: `The ${id.replace(/-/g, " ")} feature is under active development. Check back soon.`,
        },
      });
    }
  }

  override render() {
    return html`
      <div class="page-header">
        <div class="header-content">
          <h1>Form Builder</h1>
          <p>
            Open-source form builder for Umbraco — create forms, collect submissions,
            and configure workflows without per-site licensing.
          </p>
        </div>
        <span class="badge ${this._pingStatus === 'ok' ? 'ready' : 'setup'}">
          ${this._pingStatus === 'ok' ? '● Connected' : '○ Setup'}
        </span>
      </div>

      <div class="section-header">
        <h2>Overview</h2>
      </div>
      <div class="stats-grid">
        ${this._stats.map(s => html`
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon ${s.icon === '📋' ? 'primary' : s.icon === '📨' ? 'success' : 'warning'}">${s.icon}</span>
              ${s.trend ? html`<span class="stat-trend">${s.trend}</span>` : ''}
            </div>
            <div class="stat-value">${s.value}</div>
            <div class="stat-label">${s.label}</div>
          </div>
        `)}
      </div>

      <div class="section-header">
        <h2>Quick Actions</h2>
      </div>
      <div class="quick-actions">
        ${this._quickActions.map(a => html`
          <div class="action-card" @click=${a.action}>
            <div class="action-icon">${a.icon}</div>
            <div class="action-content">
              <h3>${a.label}</h3>
              <p>${a.description}</p>
            </div>
          </div>
        `)}
      </div>

      <div class="status-section">
        <h2>Plugin Status</h2>
        <div class="status-item">
          <span class="status-text">
            <span class="status-dot ${this._pingStatus === 'ok' ? 'ok' : this._pingStatus === 'loading' ? 'warn' : 'warn'}"></span>
            API Connectivity
          </span>
          <span class="status-value">
            ${this._pingStatus === 'loading' ? 'Checking...' :
              this._pingStatus === 'ok' ? this._pingMessage :
              'Unreachable'}
          </span>
        </div>
        <div class="status-item">
          <span class="status-text">
            <span class="status-dot ok"></span>
            Package
          </span>
          <span class="status-value">FormBuilder.Extension v2.0.0</span>
        </div>
        <div class="status-item">
          <span class="status-text">
            <span class="status-dot ok"></span>
            Target
          </span>
          <span class="status-value">Umbraco 17 (net10.0)</span>
        </div>
      </div>

      <div class="getting-started">
        <span class="icon">💡</span>
        <div>
          <h3>Getting Started</h3>
          <p>
            Install via NuGet: <code>dotnet add package FormBuilder.Extension</code>.
            Forms, workflows, and submissions are configured through the backoffice.
            See the <a href="https://github.com/splatdevtech/SplatDev.Umbraco.Plugins/blob/master/SplatDev.Umbraco.Plugins.FormBuilder/README.md" target="_blank" rel="noopener">README</a> for full documentation.
          </p>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "formbuilder-dashboard": FormBuilderDashboardElement;
  }
}
