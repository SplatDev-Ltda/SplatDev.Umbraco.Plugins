import { LitElement, css, html } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

/** The JSON contract used by the v7/v8 editor. Keep property names stable for upgrades. */
type Channel = { Id: string; Name: string; Image: string; Url: string };
type Theme = {
  Id: string;
  Description: string;
  CreateDate: string;
  CreatedBy: string;
  Reference: string;
  Channels: Channel[];
  ShowLabels: boolean;
};
type PackageValue = { Name: string; Theme: Theme; Thumbnail: string; Folder: string; Bg: string };

const channels = ["facebook", "twitter", "youtube", "rss", "instagram", "linkedin"];
const packages: PackageValue[] = [
  { Name: "Circle", Folder: "circle", Bg: "#fff", Thumbnail: "/App_Plugins/SocialMediaChannels/themes/circle-social.jpg", Theme: { Id: "Circle", Description: "Circle Icons Set by IC Design", CreateDate: "2012-01-02", CreatedBy: "IC Design", Reference: "", ShowLabels: true, Channels: channels.map((id) => ({ Id: id, Name: id[0].toUpperCase() + id.slice(1), Image: `${id}.png`, Url: "" })) } },
  { Name: "Flat", Folder: "flat", Bg: "#fff", Thumbnail: "/App_Plugins/SocialMediaChannels/themes/flat.jpg", Theme: { Id: "Flat", Description: "A simple flat social icon set", CreateDate: "2012-01-02", CreatedBy: "SplatDev", Reference: "", ShowLabels: true, Channels: channels.map((id) => ({ Id: id, Name: id[0].toUpperCase() + id.slice(1), Image: `${id}.png`, Url: "" })) } },
];

export class SocialMediaChannelsPropertyEditor extends UmbElementMixin(LitElement) {
  value: PackageValue | null = null;
  readonly = false;

  static styles = css`
    :host { display: block; }
    .editor { display: grid; gap: var(--uui-size-space-4); }
    .channels { display: grid; gap: var(--uui-size-space-2); }
    .channel { display: flex; align-items: center; gap: var(--uui-size-space-2); }
    .channel uui-input { flex: 1; }
    .details { color: var(--uui-color-text-alt); font-size: var(--uui-type-small-size); }
    .swatches { display: flex; gap: var(--uui-size-space-2); }
    .swatch { width: 2rem; height: 2rem; border: 1px solid var(--uui-color-border); border-radius: 50%; cursor: pointer; }
  `;

  private emit(value: PackageValue | null): void {
    this.value = value;
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true }));
  }

  private select(name: string): void {
    const selected = packages.find((item) => item.Name === name);
    this.emit(selected ? structuredClone(selected) : null);
  }

  private updateTheme(update: (theme: Theme) => Theme): void {
    if (!this.value) return;
    const value = structuredClone(this.value);
    value.Theme = update(value.Theme);
    this.emit(value);
  }

  render() {
    const value = this.value;
    return html`<div class="editor">
      <uui-select label="Choose theme" .value=${value?.Name ?? ""} ?disabled=${this.readonly}
        @change=${(event: Event) => this.select((event.target as HTMLSelectElement).value)}>
        <uui-option value="">Default</uui-option>
        ${packages.map((item) => html`<uui-option value=${item.Name}>${item.Name}</uui-option>`)}
      </uui-select>
      ${value ? html`
        <uui-checkbox label="Show labels" .checked=${value.Theme.ShowLabels} ?disabled=${this.readonly}
          @change=${(event: Event) => this.updateTheme((theme) => ({ ...theme, ShowLabels: (event.target as HTMLInputElement).checked }))}>Show labels</uui-checkbox>
        <div class="details"><strong>${value.Theme.Id}</strong> — ${value.Theme.Description}</div>
        <div class="swatches" aria-label="Background colour">
          ${["#fff", "#f2f2f2", "#000"].map((colour) => html`<button class="swatch" title=${colour} style="background:${colour}" ?disabled=${this.readonly}
            @click=${() => this.emit({ ...value, Bg: colour })}></button>`)}
        </div>
        <div class="channels">
          ${value.Theme.Channels.map((channel, index) => html`<div class="channel">
            <span>${channel.Name}</span>
            <uui-input label=${`${channel.Name} profile URL`} .value=${channel.Url} ?disabled=${this.readonly}
              @input=${(event: Event) => this.updateTheme((theme) => ({ ...theme, Channels: theme.Channels.map((item, i) => i === index ? { ...item, Url: (event.target as HTMLInputElement).value } : item) }))}></uui-input>
          </div>`)}
        </div>` : html`<p class="details">Select a theme to configure social profile links.</p>`}
    </div>`;
  }
}

customElements.define("splatdev-social-media-channels-property-editor", SocialMediaChannelsPropertyEditor);
declare global { interface HTMLElementTagNameMap { "splatdev-social-media-channels-property-editor": SocialMediaChannelsPropertyEditor; } }
