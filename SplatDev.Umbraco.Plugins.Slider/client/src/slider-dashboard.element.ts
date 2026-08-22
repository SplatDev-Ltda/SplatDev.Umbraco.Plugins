import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { createAuthFetch } from "./auth-fetch";
import { mediaUrlForKey } from "./media-url";

interface Slide {
  id: number;
  sliderId: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  linkText?: string | null;
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

const EFFECTS = ["slide", "fade", "cube", "coverflow", "flip"];

/**
 * Sliders, their playback settings, and the slides they contain.
 *
 * The dashboard listed slider names and offered nothing else, while the API behind it
 * had supported creating and configuring sliders and adding, reordering and removing
 * slides the whole time. Slide images are picked from the media library.
 */
@customElement("slider-dashboard")
export class SliderDashboardElement extends UmbElementMixin(LitElement) {
  readonly #fetch = createAuthFetch(this);

  static override styles = css`
    :host { display: block; padding: var(--uui-size-layout-1, 24px); }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; }
    p.description { color: var(--uui-color-text-alt, #6b7280); margin: 0 0 22px; max-width: 66ch; }

    uui-box { margin-bottom: 18px; }
    .field { margin-bottom: 14px; }
    .field-label {
      display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; color: var(--uui-color-text-alt, #6b7280); margin-bottom: 6px;
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; }
    uui-input, uui-select { width: 100%; }
    .actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; align-items: center; }
    .hint { font-size: 0.82rem; color: var(--uui-color-text-alt, #6b7280); margin: 6px 0 0; }
    .toggle-row { display: flex; gap: 22px; flex-wrap: wrap; align-items: center; margin-top: 6px; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left; font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase;
      color: var(--uui-color-text-alt, #6b7280); padding: 8px 10px; white-space: nowrap;
      border-bottom: 1px solid var(--uui-color-border, #e5e7eb);
    }
    td { padding: 10px; border-bottom: 1px solid var(--uui-color-border, #e5e7eb); font-size: 0.9rem; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    td.right { text-align: right; white-space: nowrap; }
    td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
    tr.selected { background: var(--uui-color-surface-alt, #f6f8fa); }

    .thumb {
      width: 64px; height: 40px; object-fit: cover; border-radius: 3px;
      border: 1px solid var(--uui-color-border, #e5e7eb); background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .tag {
      display: inline-block; padding: 1px 7px; border-radius: 9999px;
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      background: var(--uui-color-surface-alt, #f3f4f6);
    }
    .tag.on { background: #d1fae5; color: #065f46; }
    .muted { color: var(--uui-color-text-alt, #6b7280); }
    .empty { color: var(--uui-color-text-alt, #6b7280); padding: 14px 10px; }

    .msg, .splatdev-load-error {
      display: block; margin: 0 0 14px; padding: 12px 14px;
      border-left: 3px solid var(--uui-color-danger, #d42054);
      background: var(--uui-color-danger-emphasis, #fdeaef);
      color: var(--uui-color-danger-contrast, #6d0f28);
      font-size: 0.9rem; border-radius: 3px;
    }
    .msg.ok {
      border-left-color: var(--uui-color-positive, #2f9e44);
      background: var(--uui-color-positive-emphasis, #e6f4ea);
      color: var(--uui-color-positive-contrast, #12492a);
    }
  `;

  @state() private _sliders: SliderConfig[] = [];
  @state() private _slides: Slide[] = [];
  @state() private _selected: SliderConfig | null = null;
  @state() private _loading = false;
  @state() private _busy = "";
  @state() private _loadError: string | null = null;
  @state() private _message: { ok: boolean; text: string } | null = null;

  @state() private _newName = "";

  @state() private _editingId: number | null = null;
  @state() private _edit: Partial<SliderConfig> = {};

  @state() private _slideTitle = "";
  @state() private _slideSubtitle = "";
  @state() private _slideLinkUrl = "";
  @state() private _slideLinkText = "";
  @state() private _slideKeys: string[] = [];

  private readonly _api = "/umbraco/api/slider";

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#loadSliders();
  }

  #responseOk(response: Response): boolean {
    if (response.ok) {
      this._loadError = null;
      return true;
    }
    this._loadError =
      response.status === 401 || response.status === 403
        ? "You are not authorised to do that. The request was refused, so anything shown below may be incomplete."
        : `The request did not succeed — the server returned ${response.status}${response.statusText ? ` ${response.statusText}` : ""}.`;
    return false;
  }

  async #loadSliders(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#fetch(`${this._api}/GetSliders`);
      if (this.#responseOk(response)) {
        this._sliders = await response.json();
        if (this._selected) {
          this._selected = this._sliders.find((s) => s.id === this._selected!.id) ?? null;
        }
      }
    } catch {
      this._loadError ??= "The request failed. See the browser console for details.";
      this._sliders = [];
    } finally {
      this._loading = false;
    }
  }

  async #openSlider(slider: SliderConfig): Promise<void> {
    if (this._selected?.id === slider.id) {
      this._selected = null;
      this._slides = [];
      return;
    }
    this._selected = slider;
    this._slides = [];
    await this.#refreshSlides();
  }

  async #refreshSlides(): Promise<void> {
    if (!this._selected) return;
    try {
      const response = await this.#fetch(`${this._api}/GetSlides?sliderId=${this._selected.id}`);
      if (this.#responseOk(response)) this._slides = await response.json();
    } catch {
      this._loadError ??= "Could not load the slides in that slider.";
    }
  }

  async #createSlider(): Promise<void> {
    const name = this._newName.trim();
    if (!name) {
      this._message = { ok: false, text: "A slider needs a name." };
      return;
    }

    this._busy = "create";
    try {
      const response = await this.#fetch(`${this._api}/CreateSlider`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, autoplay: true, autoplayDelay: 5000, loop: true, effect: "slide" }),
      });
      if (response.ok) {
        this._message = { ok: true, text: `Created ${name}.` };
        this._newName = "";
        await this.#loadSliders();
      } else {
        this._message = { ok: false, text: "Could not create that slider." };
      }
    } catch {
      this._message = { ok: false, text: "Could not create that slider." };
    } finally {
      this._busy = "";
    }
  }

  #startEdit(slider: SliderConfig): void {
    this._editingId = slider.id;
    this._edit = { ...slider, slides: [] };
    this._message = null;
  }

  async #saveEdit(): Promise<void> {
    const edit = this._edit;
    if (!edit.id) return;
    const name = (edit.name ?? "").trim();
    if (!name) {
      this._message = { ok: false, text: "A slider needs a name." };
      return;
    }

    this._busy = `edit:${edit.id}`;
    try {
      const response = await this.#fetch(`${this._api}/UpdateSlider`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...edit, name, slides: [] }),
      });
      if (response.ok) {
        this._message = { ok: true, text: `Updated ${name}.` };
        this._editingId = null;
        await this.#loadSliders();
      } else {
        this._message = { ok: false, text: "Could not update that slider." };
      }
    } catch {
      this._message = { ok: false, text: "Could not update that slider." };
    } finally {
      this._busy = "";
    }
  }

  async #deleteSlider(slider: SliderConfig): Promise<void> {
    const count = slider.slides?.length ?? 0;
    if (
      !window.confirm(
        `Delete the slider "${slider.name}"?\n\n${count > 0 ? `Its ${count} slide${count === 1 ? "" : "s"} go with it. ` : ""}The media library is untouched. This cannot be undone.`,
      )
    )
      return;

    this._busy = `delete:${slider.id}`;
    try {
      const response = await this.#fetch(`${this._api}/DeleteSlider?id=${slider.id}`, { method: "DELETE" });
      if (response.ok) {
        this._message = { ok: true, text: `Deleted ${slider.name}.` };
        if (this._selected?.id === slider.id) {
          this._selected = null;
          this._slides = [];
        }
        await this.#loadSliders();
      } else {
        this._message = { ok: false, text: "Could not delete that slider." };
      }
    } catch {
      this._message = { ok: false, text: "Could not delete that slider." };
    } finally {
      this._busy = "";
    }
  }

  async #addSlide(): Promise<void> {
    if (!this._selected) return;
    const key = this._slideKeys[0];
    const imageUrl = key ? await mediaUrlForKey(this.#fetch, key) : null;
    if (!imageUrl) {
      this._message = { ok: false, text: "Choose an image from the media library first." };
      return;
    }

    this._busy = "slide";
    try {
      const response = await this.#fetch(`${this._api}/AddSlide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sliderId: this._selected.id,
          title: this._slideTitle.trim() || "Untitled",
          subtitle: this._slideSubtitle.trim() || null,
          imageUrl,
          linkUrl: this._slideLinkUrl.trim() || null,
          linkText: this._slideLinkText.trim() || null,
          sortOrder: this._slides.length,
        }),
      });
      if (response.ok) {
        this._message = { ok: true, text: "Slide added." };
        this._slideTitle = this._slideSubtitle = this._slideLinkUrl = this._slideLinkText = "";
        this._slideKeys = [];
        await this.#refreshSlides();
        await this.#loadSliders();
      } else {
        this._message = { ok: false, text: "Could not add that slide." };
      }
    } catch {
      this._message = { ok: false, text: "Could not add that slide." };
    } finally {
      this._busy = "";
    }
  }

  /** Moves a slide up or down by swapping sort orders with its neighbour. */
  async #move(slide: Slide, direction: -1 | 1): Promise<void> {
    const ordered = [...this._slides].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = ordered.findIndex((s) => s.id === slide.id);
    const swapWith = ordered[index + direction];
    if (!swapWith) return;

    this._busy = `move:${slide.id}`;
    try {
      const a = { ...slide, sortOrder: swapWith.sortOrder };
      const b = { ...swapWith, sortOrder: slide.sortOrder };
      for (const payload of [a, b]) {
        const response = await this.#fetch(`${this._api}/UpdateSlide`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          this._message = { ok: false, text: "Could not reorder the slides." };
          break;
        }
      }
      await this.#refreshSlides();
    } catch {
      this._message = { ok: false, text: "Could not reorder the slides." };
    } finally {
      this._busy = "";
    }
  }

  async #deleteSlide(slide: Slide): Promise<void> {
    if (!window.confirm(`Remove the slide "${slide.title}"?\n\nThe image stays in the media library.`)) return;

    this._busy = `slide:${slide.id}`;
    try {
      const response = await this.#fetch(`${this._api}/DeleteSlide?id=${slide.id}`, { method: "DELETE" });
      if (response.ok) {
        this._message = { ok: true, text: "Slide removed." };
        await this.#refreshSlides();
        await this.#loadSliders();
      } else {
        this._message = { ok: false, text: "Could not remove that slide." };
      }
    } catch {
      this._message = { ok: false, text: "Could not remove that slide." };
    } finally {
      this._busy = "";
    }
  }

  #renderSlides() {
    if (!this._selected) return nothing;
    const ordered = [...this._slides].sort((a, b) => a.sortOrder - b.sortOrder);

    return html`
      <uui-box headline="Slides in ${this._selected.name} (${ordered.length})">
        ${ordered.length === 0
          ? html`<p class="empty">This slider has no slides yet. Add one below.</p>`
          : html`
              <table>
                <thead>
                  <tr><th></th><th>Title</th><th>Link</th><th>Order</th><th></th></tr>
                </thead>
                <tbody>
                  ${ordered.map(
                    (s, i) => html`
                      <tr>
                        <td><img class="thumb" src=${s.imageUrl} alt=${s.title} loading="lazy" /></td>
                        <td>
                          <strong>${s.title}</strong>
                          ${s.subtitle ? html`<div class="muted">${s.subtitle}</div>` : nothing}
                        </td>
                        <td class="muted">${s.linkUrl ? html`<code>${s.linkUrl}</code>` : "—"}</td>
                        <td class="num">
                          <uui-button compact look="secondary" label="Move ${s.title} up"
                            ?disabled=${i === 0 || this._busy === `move:${s.id}`}
                            @click=${() => this.#move(s, -1)}>↑</uui-button>
                          <uui-button compact look="secondary" label="Move ${s.title} down"
                            ?disabled=${i === ordered.length - 1 || this._busy === `move:${s.id}`}
                            @click=${() => this.#move(s, 1)}>↓</uui-button>
                        </td>
                        <td class="right">
                          <uui-button compact look="secondary" color="danger" label="Remove ${s.title}"
                            ?disabled=${this._busy === `slide:${s.id}`}
                            @click=${() => this.#deleteSlide(s)}>Remove</uui-button>
                        </td>
                      </tr>
                    `,
                  )}
                </tbody>
              </table>
            `}

        <div class="field" style="margin-top:18px">
          <span class="field-label">Image</span>
          <umb-input-media
            .selection=${this._slideKeys}
            max="1"
            @change=${(e: Event) => {
              const el = e.target as unknown as { selection?: string[] };
              this._slideKeys = el.selection ?? [];
            }}
          ></umb-input-media>
          <p class="hint">Pick from the media library — nothing here asks you to type a URL.</p>
        </div>
        <div class="grid">
          <div>
            <span class="field-label">Title</span>
            <uui-input label="Slide title" .value=${this._slideTitle}
              @input=${(e: Event) => (this._slideTitle = (e.target as HTMLInputElement).value)}></uui-input>
          </div>
          <div>
            <span class="field-label">Subtitle</span>
            <uui-input label="Slide subtitle" placeholder="Optional" .value=${this._slideSubtitle}
              @input=${(e: Event) => (this._slideSubtitle = (e.target as HTMLInputElement).value)}></uui-input>
          </div>
          <div>
            <span class="field-label">Link URL</span>
            <uui-input label="Link URL" placeholder="Optional, e.g. /offers" .value=${this._slideLinkUrl}
              @input=${(e: Event) => (this._slideLinkUrl = (e.target as HTMLInputElement).value)}></uui-input>
          </div>
          <div>
            <span class="field-label">Link text</span>
            <uui-input label="Link text" placeholder="Optional, e.g. See offers" .value=${this._slideLinkText}
              @input=${(e: Event) => (this._slideLinkText = (e.target as HTMLInputElement).value)}></uui-input>
          </div>
        </div>
        <div class="actions">
          <uui-button look="primary" color="positive" label="Add slide"
            ?disabled=${this._busy === "slide" || this._slideKeys.length === 0}
            @click=${this.#addSlide}>${this._busy === "slide" ? "Adding…" : "Add slide"}</uui-button>
        </div>
      </uui-box>
    `;
  }

  #renderEditor(s: SliderConfig) {
    return html`
      <td colspan="6">
        <div class="grid">
          <div>
            <span class="field-label">Name</span>
            <uui-input label="Name" .value=${this._edit.name ?? ""}
              @input=${(e: Event) => (this._edit = { ...this._edit, name: (e.target as HTMLInputElement).value })}></uui-input>
          </div>
          <div>
            <span class="field-label">Effect</span>
            <uui-select
              label="Effect"
              .value=${this._edit.effect ?? "slide"}
              @change=${(e: Event) => (this._edit = { ...this._edit, effect: (e.target as HTMLSelectElement).value })}
              .options=${EFFECTS.map((v) => ({ name: v, value: v, selected: v === (this._edit.effect ?? "slide") }))}
            ></uui-select>
          </div>
          <div>
            <span class="field-label">Autoplay delay (ms)</span>
            <uui-input
              type="number"
              label="Autoplay delay in milliseconds"
              .value=${String(this._edit.autoplayDelay ?? 5000)}
              @input=${(e: Event) =>
                (this._edit = { ...this._edit, autoplayDelay: Number((e.target as HTMLInputElement).value) || 0 })}
            ></uui-input>
          </div>
        </div>
        <div class="toggle-row">
          <uui-toggle
            label="Autoplay"
            ?checked=${this._edit.autoplay ?? false}
            @change=${(e: Event) => (this._edit = { ...this._edit, autoplay: (e.target as HTMLInputElement).checked })}
            >Autoplay</uui-toggle
          >
          <uui-toggle
            label="Loop"
            ?checked=${this._edit.loop ?? false}
            @change=${(e: Event) => (this._edit = { ...this._edit, loop: (e.target as HTMLInputElement).checked })}
            >Loop</uui-toggle
          >
        </div>
        <div class="actions">
          <uui-button look="primary" color="positive" label="Save ${s.name}"
            ?disabled=${this._busy === `edit:${s.id}`} @click=${this.#saveEdit}>Save</uui-button>
          <uui-button look="secondary" label="Cancel" @click=${() => (this._editingId = null)}>Cancel</uui-button>
        </div>
      </td>
    `;
  }

  override render() {
    return html`
      <h1>Sliders</h1>
      <p class="description">
        The sliders this site defines, how each one plays, and the slides it shows.
        Select a slider to work on its slides.
      </p>

      ${this._loadError ? html`<div class="splatdev-load-error" role="alert">${this._loadError}</div>` : nothing}
      ${this._message
        ? html`<div class="msg ${this._message.ok ? "ok" : ""}" role="status">${this._message.text}</div>`
        : nothing}

      <uui-box headline="Sliders (${this._sliders.length})">
        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._sliders.length === 0
            ? html`<p class="empty">No sliders yet. Create one below.</p>`
            : html`
                <table>
                  <thead>
                    <tr><th>Name</th><th>Effect</th><th>Autoplay</th><th>Loop</th><th>Slides</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${this._sliders.map((s) =>
                      this._editingId === s.id
                        ? html`<tr class="selected">${this.#renderEditor(s)}</tr>`
                        : html`
                            <tr class=${this._selected?.id === s.id ? "selected" : ""}>
                              <td><strong>${s.name}</strong></td>
                              <td><code>${s.effect}</code></td>
                              <td>
                                ${s.autoplay
                                  ? html`<span class="tag on">on · ${s.autoplayDelay}ms</span>`
                                  : html`<span class="tag">off</span>`}
                              </td>
                              <td>${s.loop ? html`<span class="tag on">on</span>` : html`<span class="tag">off</span>`}</td>
                              <td class="num">${s.slides?.length ?? 0}</td>
                              <td class="right">
                                <uui-button compact look="secondary" label="Open ${s.name}"
                                  @click=${() => this.#openSlider(s)}
                                  >${this._selected?.id === s.id ? "Close" : "Slides"}</uui-button>
                                <uui-button compact look="secondary" label="Settings for ${s.name}"
                                  @click=${() => this.#startEdit(s)}>Settings</uui-button>
                                <uui-button compact look="secondary" color="danger" label="Delete ${s.name}"
                                  ?disabled=${this._busy === `delete:${s.id}`}
                                  @click=${() => this.#deleteSlider(s)}>Delete</uui-button>
                              </td>
                            </tr>
                          `,
                    )}
                  </tbody>
                </table>
              `}
      </uui-box>

      ${this.#renderSlides()}

      <uui-box headline="Create a slider">
        <div class="field">
          <span class="field-label">Name</span>
          <uui-input
            label="Slider name"
            placeholder="e.g. Homepage hero"
            .value=${this._newName}
            @input=${(e: Event) => (this._newName = (e.target as HTMLInputElement).value)}
          ></uui-input>
          <p class="hint">Starts with autoplay on, a 5 second delay, looping, and the slide effect — all changeable under Settings.</p>
        </div>
        <div class="actions">
          <uui-button look="primary" color="positive" label="Create slider"
            ?disabled=${this._busy === "create"} @click=${this.#createSlider}
            >${this._busy === "create" ? "Creating…" : "Create slider"}</uui-button>
        </div>
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
