import { LitElement as d, css as m, html as t } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as g } from "@umbraco-cms/backoffice/element-api";
const c = ["facebook", "twitter", "youtube", "rss", "instagram", "linkedin"], o = [
  { Name: "Circle", Folder: "circle", Bg: "#fff", Thumbnail: "/App_Plugins/SocialMediaChannels/themes/circle-social.jpg", Theme: { Id: "Circle", Description: "Circle Icons Set by IC Design", CreateDate: "2012-01-02", CreatedBy: "IC Design", Reference: "", ShowLabels: !0, Channels: c.map((s) => ({ Id: s, Name: s[0].toUpperCase() + s.slice(1), Image: `${s}.png`, Url: "" })) } },
  { Name: "Flat", Folder: "flat", Bg: "#fff", Thumbnail: "/App_Plugins/SocialMediaChannels/themes/flat.jpg", Theme: { Id: "Flat", Description: "A simple flat social icon set", CreateDate: "2012-01-02", CreatedBy: "SplatDev", Reference: "", ShowLabels: !0, Channels: c.map((s) => ({ Id: s, Name: s[0].toUpperCase() + s.slice(1), Image: `${s}.png`, Url: "" })) } }
], n = class n extends g(d) {
  constructor() {
    super(...arguments), this.value = null, this.readonly = !1;
  }
  emit(a) {
    this.value = a, this.dispatchEvent(new CustomEvent("change", { bubbles: !0, composed: !0 }));
  }
  select(a) {
    const e = o.find((l) => l.Name === a);
    this.emit(e ? structuredClone(e) : null);
  }
  updateTheme(a) {
    if (!this.value) return;
    const e = structuredClone(this.value);
    e.Theme = a(e.Theme), this.emit(e);
  }
  render() {
    const a = this.value;
    return t`<div class="editor">
      <uui-select label="Choose theme" .value=${(a == null ? void 0 : a.Name) ?? ""} ?disabled=${this.readonly}
        @change=${(e) => this.select(e.target.value)}>
        <uui-option value="">Default</uui-option>
        ${o.map((e) => t`<uui-option value=${e.Name}>${e.Name}</uui-option>`)}
      </uui-select>
      ${a ? t`
        <uui-checkbox label="Show labels" .checked=${a.Theme.ShowLabels} ?disabled=${this.readonly}
          @change=${(e) => this.updateTheme((l) => ({ ...l, ShowLabels: e.target.checked }))}>Show labels</uui-checkbox>
        <div class="details"><strong>${a.Theme.Id}</strong> — ${a.Theme.Description}</div>
        <div class="swatches" aria-label="Background colour">
          ${["#fff", "#f2f2f2", "#000"].map((e) => t`<button class="swatch" title=${e} style="background:${e}" ?disabled=${this.readonly}
            @click=${() => this.emit({ ...a, Bg: e })}></button>`)}
        </div>
        <div class="channels">
          ${a.Theme.Channels.map((e, l) => t`<div class="channel">
            <span>${e.Name}</span>
            <uui-input label=${`${e.Name} profile URL`} .value=${e.Url} ?disabled=${this.readonly}
              @input=${(h) => this.updateTheme((r) => ({ ...r, Channels: r.Channels.map((u, p) => p === l ? { ...u, Url: h.target.value } : u) }))}></uui-input>
          </div>`)}
        </div>` : t`<p class="details">Select a theme to configure social profile links.</p>`}
    </div>`;
  }
};
n.styles = m`
    :host { display: block; }
    .editor { display: grid; gap: var(--uui-size-space-4); }
    .channels { display: grid; gap: var(--uui-size-space-2); }
    .channel { display: flex; align-items: center; gap: var(--uui-size-space-2); }
    .channel uui-input { flex: 1; }
    .details { color: var(--uui-color-text-alt); font-size: var(--uui-type-small-size); }
    .swatches { display: flex; gap: var(--uui-size-space-2); }
    .swatch { width: 2rem; height: 2rem; border: 1px solid var(--uui-color-border); border-radius: 50%; cursor: pointer; }
  `;
let i = n;
customElements.define("splatdev-social-media-channels-property-editor", i);
export {
  i as SocialMediaChannelsPropertyEditor
};
