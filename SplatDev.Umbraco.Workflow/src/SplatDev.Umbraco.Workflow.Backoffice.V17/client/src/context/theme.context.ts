import { UmbContextBase } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

export const THEME_CONTEXT_TOKEN =
  new UmbContextToken<ThemeContext>("SplatDev.Workflow.Theme.Context");

export class ThemeContext extends UmbContextBase<ThemeContext> {
  #activeTheme = "classic";

  constructor(host: UmbControllerHost) {
    super(host, THEME_CONTEXT_TOKEN);
    const saved = localStorage.getItem("swf-active-theme");
    if (saved) {
      this.#activeTheme = saved;
      this.#applyTheme(saved);
    }
  }

  get activeTheme(): string {
    return this.#activeTheme;
  }

  setTheme(name: string): void {
    this.#activeTheme = name;
    localStorage.setItem("swf-active-theme", name);
    this.#applyTheme(name);
  }

  #applyTheme(name: string): void {
    document.body.setAttribute("data-swf-theme", name);
  }
}
