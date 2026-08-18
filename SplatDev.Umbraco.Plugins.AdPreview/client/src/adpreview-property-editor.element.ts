import { LitElement, html, css, customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import type { UmbPropertyEditorUiElement } from "@umbraco-cms/backoffice/property-editor";

type AdValue = { img: string; title: string; description: string; url: string; tooltip: string; referrer: string; css: string; overlay: boolean };
const empty = (): AdValue => ({ img: "", title: "", description: "", url: "", tooltip: "", referrer: "", css: "", overlay: false });
const SAFE_CLASSES = new Set(["ad-theme-dark", "ad-theme-light", "ad-compact", "ad-bordered"]);

@customElement("splatdev-adpreview-property-editor")
export class AdPreviewPropertyEditorElement extends LitElement implements UmbPropertyEditorUiElement {
  @property({ attribute: false })
  get value(): AdValue { return this.#value; }
  set value(value: AdValue | string | null | undefined) {
    const old = this.#value;
    this.#value = typeof value === "string" ? this.#parse(value) : { ...empty(), ...(value ?? {}) };
    this.requestUpdate("value", old);
  }
  @property({ type: Boolean, reflect: true }) readonly = false;
  #value: AdValue = empty();
  @state() private editing = false;
  #draft: AdValue = empty();

  #parse(value: string): AdValue { try { return { ...empty(), ...JSON.parse(value) }; } catch { return empty(); } }
  #safeClass(value: string): string { return value.split(/\s+/).filter((name) => SAFE_CLASSES.has(name)).join(" "); }
  #edit() { if (!this.readonly) { this.#draft = { ...this.#value }; this.editing = true; } }
  #cancel() { this.editing = false; }
  #save() {
    if (this.readonly) return;
    this.#value = { ...this.#draft, css: this.#safeClass(this.#draft.css) };
    this.editing = false;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent("property-value-change", { bubbles: true, composed: true, detail: { value: this.#value } }));
  }
  #remove() {
    if (this.readonly) return;
    this.#value = empty(); this.editing = false; this.requestUpdate();
    this.dispatchEvent(new CustomEvent("property-value-change", { bubbles: true, composed: true, detail: { value: this.#value } }));
  }
  #set(field: keyof AdValue, event: Event) { const target = event.target as HTMLInputElement | HTMLTextAreaElement; this.#draft = { ...this.#draft, [field]: target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value }; }

  render() {
    if (this.editing) return html`<section class="editor" aria-label="Edit ad"><h3>Edit ad</h3><label>Image URL<input .value=${this.#draft.img} @input=${(e: Event) => this.#set("img", e)} placeholder="https://example.com/ad.jpg" /></label><label>Title<input .value=${this.#draft.title} @input=${(e: Event) => this.#set("title", e)} /></label><label>URL<input .value=${this.#draft.url} @input=${(e: Event) => this.#set("url", e)} /></label><label>Description<textarea @input=${(e: Event) => this.#set("description", e)}>${this.#draft.description}</textarea></label><label>Tooltip<input .value=${this.#draft.tooltip} @input=${(e: Event) => this.#set("tooltip", e)} /></label><label>Referrer<input .value=${this.#draft.referrer} @input=${(e: Event) => this.#set("referrer", e)} /></label><label>CSS class <small>Allowed: ad-theme-dark, ad-theme-light, ad-compact, ad-bordered</small><input .value=${this.#draft.css} @input=${(e: Event) => this.#set("css", e)} /></label><label class="check"><input type="checkbox" .checked=${this.#draft.overlay} @change=${(e: Event) => this.#set("overlay", e)} /> Overlay title and description</label><footer><uui-button look="secondary" @click=${this.#cancel}>Cancel</uui-button><uui-button look="primary" @click=${this.#save}>Save</uui-button></footer></section>`;
    const cssClass = this.#safeClass(this.#value.css);
    return html`<section class="preview" aria-label="Ad Preview"><a href=${this.#value.url || "#"} target="_blank" rel="noopener" title=${this.#value.tooltip} @click=${(e: Event) => !this.#value.url && e.preventDefault()}><div class="image ${cssClass}">${this.#value.img ? html`<img src=${this.#value.img} alt=${this.#value.title} />` : html`<span>Enter an image URL to preview the ad</span>`}${this.#value.overlay ? html`<div class="overlay"><strong>${this.#value.title}</strong><span>${this.#value.description}</span></div>` : ""}</div></a><footer><uui-button look="secondary" ?disabled=${this.readonly} @click=${this.#edit}>Edit ad</uui-button><uui-button look="secondary" ?disabled=${this.readonly} @click=${this.#remove}>Remove</uui-button></footer></section>`;
  }
  static styles = css`:host{display:block}.preview,.editor{padding:var(--uui-size-space-4);border:1px solid var(--uui-color-border);border-radius:var(--uui-border-radius)}.image{position:relative;min-height:120px;background:var(--uui-color-surface-alt);display:grid;place-items:center;overflow:hidden}.image img{display:block;max-width:100%;max-height:320px}.ad-compact{min-height:80px}.ad-bordered{border:2px solid var(--uui-color-border)}.ad-theme-dark{background:#20242a;color:#fff}.ad-theme-light{background:#f5f7fa}.overlay{position:absolute;inset:auto 0 0;padding:12px;color:#fff;background:#0009;display:flex;flex-direction:column}.editor{display:grid;gap:12px}.editor h3{margin:0}.editor label{display:grid;gap:4px;font-weight:600}.editor small{font-weight:400;color:var(--uui-color-text-alt)}.editor input,.editor textarea{font:inherit;padding:8px;border:1px solid var(--uui-color-border);border-radius:4px}.editor textarea{min-height:70px}.check{display:flex!important;grid-template-columns:auto 1fr;align-items:center}.editor footer,.preview footer{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}`;
}
declare global { interface HTMLElementTagNameMap { "splatdev-adpreview-property-editor": AdPreviewPropertyEditorElement; } }
