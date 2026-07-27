import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

interface Slide {
  title: string;
  subtitle: string | null;
  sortOrder: number;
}

interface SliderConfig {
  name: string;
  effect: string;
  autoplay: boolean;
  autoplayDelay: number;
  slides: Slide[];
}

@customElement("slider-dashboard")
export class SliderDashboardElement extends UmbElementMixin(LitElement) {
  @state() private _sliders: SliderConfig[] = [];
  @state() private _loading = true;

  static override styles = css`
    :host { display: block; padding: 1rem; }
    .slide-list { list-style: none; padding: 0; margin: 0; }
    .slide-list li { padding: 0.25rem 0; border-bottom: 1px solid var(--uui-color-border); }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadSliders();
  }

  private async _loadSliders(): Promise<void> {
    try {
      const response = await fetch("/umbraco/api/slider/GetSliders");
      this._sliders = (await response.json()) as SliderConfig[];
    } finally {
      this._loading = false;
    }
  }

  override render() {
    if (this._loading) return html`<uui-loader></uui-loader>`;
    return html`
      <uui-box headline="Slider Manager">
        ${this._sliders.map((slider) => html`
          <uui-box headline=${slider.name}>
            <p>Effect: ${slider.effect} | Autoplay: ${slider.autoplay ? "Yes" : "No"} (${slider.autoplayDelay}ms)</p>
            <ul class="slide-list">
              ${(slider.slides ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map((slide) => html`<li><strong>${slide.title}</strong>${slide.subtitle ? ` - ${slide.subtitle}` : ""}</li>`)}
            </ul>
          </uui-box>
        `)}
      </uui-box>
    `;
  }
}

export default SliderDashboardElement;

declare global { interface HTMLElementTagNameMap { "slider-dashboard": SliderDashboardElement; } }
