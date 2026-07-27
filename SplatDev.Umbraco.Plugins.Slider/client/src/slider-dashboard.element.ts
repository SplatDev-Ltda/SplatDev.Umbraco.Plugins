import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

interface Slide {
  id: number;
  sliderId: number;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkText: string | null;
  sortOrder: number;
}

interface SliderConfig {
  id: number;
  name: string;
  autoplay: boolean;
  autoplayDelay: number;
  loop: boolean;
  effect: string;
  slides: Slide[];
}

@customElement("slider-dashboard")
export class SliderDashboardElement extends UmbElementMixin(LitElement) {
  @state()
  private _sliders: SliderConfig[] = [];

  @state()
  private _loading = true;

  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }

    .slide-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .slide-list li {
      padding: 0.25rem 0;
      border-bottom: 1px solid var(--uui-color-border);
    }

    .stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      flex: 1;
      padding: 1rem;
      background: var(--uui-color-surface-alt);
      border-radius: var(--uui-border-radius);
      text-align: center;
    }

    .stat-card .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--uui-color-interactive);
    }

    .stat-card .label {
      font-size: 0.75rem;
      color: var(--uui-color-text-alt);
      margin-top: 0.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--uui-color-text-alt);
    }

    .slider-card {
      margin-bottom: 1rem;
    }

    .slider-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.85rem;
      color: var(--uui-color-text-alt);
      margin-bottom: 0.75rem;
    }

    .slider-meta span {
      background: var(--uui-color-surface-alt);
      padding: 0.125rem 0.5rem;
      border-radius: var(--uui-border-radius);
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._loadSliders();
  }

  private async _loadSliders(): Promise<void> {
    try {
      const response = await fetch("/umbraco/api/slider/GetSliders");
      if (!response.ok) {
        console.error("Failed to load sliders:", response.statusText);
        return;
      }
      this._sliders = (await response.json()) as SliderConfig[];
    } catch (err) {
      console.error("Failed to load sliders:", err);
    } finally {
      this._loading = false;
    }
  }

  private _getTotalSlides(): number {
    return this._sliders.reduce((count, s) => count + (s.slides?.length ?? 0), 0);
  }

  render() {
    if (this._loading) {
      return html`<uui-loader-bar></uui-loader-bar>`;
    }

    if (!this._sliders.length) {
      return html`
        <uui-box headline="Slider Manager">
          <div class="empty-state">
            <p>No sliders found. Create a slider from the Developer section.</p>
          </div>
        </uui-box>
      `;
    }

    const totalSlides = this._getTotalSlides();
    const autoplayCount = this._sliders.filter((s) => s.autoplay).length;

    return html`
      <div class="stats">
        <div class="stat-card">
          <div class="value">${this._sliders.length}</div>
          <div class="label">Sliders</div>
        </div>
        <div class="stat-card">
          <div class="value">${totalSlides}</div>
          <div class="label">Slides</div>
        </div>
        <div class="stat-card">
          <div class="value">${autoplayCount}</div>
          <div class="label">Autoplay</div>
        </div>
      </div>

      <uui-box headline="Slider Manager">
        ${this._sliders.map(
          (slider) => html`
            <uui-box class="slider-card" headline=${slider.name}>
              <div class="slider-meta">
                <span>Effect: ${slider.effect}</span>
                <span>Autoplay: ${slider.autoplay ? `Yes (${slider.autoplayDelay}ms)` : "No"}</span>
                <span>Loop: ${slider.loop ? "Yes" : "No"}</span>
                <span>Slides: ${(slider.slides ?? []).length}</span>
              </div>
              ${slider.slides?.length
                ? html`
                    <ul class="slide-list">
                      ${[...(slider.slides ?? [])]
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(
                          (slide) => html`
                            <li>
                              <strong>${slide.title}</strong>
                              ${slide.subtitle ? html` — ${slide.subtitle}` : nothing}
                            </li>
                          `,
                        )}
                    </ul>
                  `
                : html`<p style="color:var(--uui-color-text-alt);">No slides in this slider.</p>`}
            </uui-box>
          `,
        )}
      </uui-box>
    `;
  }
}

export default SliderDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "slider-dashboard": SliderDashboardElement;
  }
}
