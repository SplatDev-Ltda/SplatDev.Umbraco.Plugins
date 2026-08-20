import { LitElement as w, nothing as u, html as n, css as y, state as p, customElement as b } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as P } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as $ } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as T } from "@umbraco-cms/backoffice/notification";
var C = Object.defineProperty, I = Object.getOwnPropertyDescriptor, h = (e, t, i, a) => {
  for (var s = a > 1 ? void 0 : a ? I(t, i) : t, r = e.length - 1, o; r >= 0; r--)
    (o = e[r]) && (s = (a ? o(t, i, s) : o(s)) || s);
  return a && s && C(t, i, s), s;
};
typeof window < "u" && window.navigation && window.navigation.addEventListener("navigate", (e) => {
  var t, i;
  (i = (t = e.destination) == null ? void 0 : t.url) != null && i.startsWith("blob:") && e.preventDefault();
}, { capture: !0 });
const v = "/umbraco/api/SchemaExport";
let l = class extends P(w) {
  constructor() {
    super(), this._loading = !1, this._downloadingZip = !1, this._stats = null, this._yaml = "", this._yamlPreview = "", this._previewTruncated = !1, this._hasExport = !1, this._profiles = [], this._activeProfile = null, this._showConfigDialog = !1, this._editingProfileId = null, this._editingProfileName = "", this._configuring = !1, this._loadingItems = !1, this._availableItems = null, this._contentTree = [], this._mediaTree = [], this._expandedCategories = {}, this._expandedTreeNodes = {}, this._loading = !1, this._downloadingZip = !1, this._stats = null, this._yaml = null, this._yamlPreview = null, this._previewTruncated = !1, this._hasExport = !1, this._authContext = null, this._notificationContext = null, this._authReady = new Promise((e) => {
      this._authResolve = e;
    }), this._profiles = [], this._activeProfile = null, this._showConfigDialog = !1, this._editingProfileId = null, this._editingProfileName = "", this._configuring = this._defaultSelection(), this._loadingItems = !1, this._availableItems = null, this._contentTree = null, this._mediaTree = null, this._expandedCategories = /* @__PURE__ */ new Set(), this._expandedTreeNodes = /* @__PURE__ */ new Set();
  }
  _defaultSelection() {
    const e = () => ({ includeAll: !0, aliases: [], nodeIds: [] });
    return {
      languages: e(),
      dataTypes: e(),
      documentTypes: e(),
      mediaTypes: e(),
      templates: e(),
      media: e(),
      content: e(),
      dictionaryItems: e(),
      members: e(),
      users: e()
    };
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext($, (e) => {
      this._authContext = e, this._authResolve(), this._loadStatistics(), this._loadActiveProfile();
    }), this.consumeContext(T, (e) => {
      this._notificationContext = e;
    });
  }
  // ─── Auth helpers ──────────────────────────────────────────────────────────
  async _getToken() {
    var e, t;
    return await this._authReady, this._authContext ? ((t = (e = this._authContext).getLatestToken) == null ? void 0 : t.call(e)) ?? null : null;
  }
  async _fetchAuthenticated(e, t = {}) {
    const i = { "Content-Type": "application/json", ...t.headers ?? {} }, a = await this._getToken();
    return a && (i.Authorization = `Bearer ${a}`), fetch(`${v}${e}`, { ...t, headers: i });
  }
  async _fetchWithAuth(e, t = {}) {
    const i = { "Content-Type": "application/json", ...t.headers ?? {} }, a = await this._getToken();
    return a && (i.Authorization = `Bearer ${a}`), fetch(e, { ...t, headers: i });
  }
  // ─── API calls ─────────────────────────────────────────────────────────────
  async _loadStatistics() {
    try {
      const e = await this._fetchAuthenticated("/Statistics");
      if (e.ok) {
        const t = await e.json();
        t && t.dataTypes !== void 0 && (this._stats = t);
      }
    } catch {
    }
  }
  async _loadActiveProfile() {
    try {
      const e = await this._fetchWithAuth("/umbraco/api/ExportProfile/Active");
      if (e.status === 204) {
        this._activeProfile = null;
        return;
      }
      e.ok && (this._activeProfile = await e.json());
    } catch {
    }
  }
  async _deactivateProfile(e) {
    e.stopPropagation();
    try {
      await this._fetchWithAuth("/umbraco/api/ExportProfile/Deactivate", { method: "POST" }), this._activeProfile = null, this._notify("positive", "Filter cleared", "Next export will include everything.");
    } catch (t) {
      this._notify("danger", "Failed to clear filter", t.message ?? "Unknown error");
    }
  }
  async _runExport() {
    if (!this._loading) {
      this._loading = !0, this._hasExport = !1, this._stats = null, this._yaml = null, this._yamlPreview = null;
      try {
        let e;
        if (this._activeProfile ? e = await this._fetchWithAuth("/umbraco/api/SchemaExport/ExportSelected", {
          method: "POST",
          body: JSON.stringify(this._activeProfile.selection)
        }) : e = await this._fetchAuthenticated("/Export"), !e.ok) {
          const i = await e.json().catch(() => ({ message: e.statusText }));
          throw new Error(i.message ?? e.statusText);
        }
        const t = await e.json();
        this._stats = t.statistics, this._applyYaml(t.yaml), this._notify("positive", "Export complete", "Schema exported successfully.");
      } catch (e) {
        this._notify("danger", "Export failed", e.message ?? "An unexpected error occurred.");
      } finally {
        this._loading = !1;
      }
    }
  }
  _applyYaml(e) {
    this._yaml = e, this._hasExport = !0, e && e.length > 1e4 ? (this._yamlPreview = e.substring(0, 1e4), this._previewTruncated = !0) : (this._yamlPreview = e, this._previewTruncated = !1);
  }
  async _downloadYaml() {
    this._activeProfile ? await this._triggerDownloadPost(
      "/umbraco/api/SchemaExport/DownloadYamlSelected",
      this._activeProfile.selection
    ) : await this._triggerDownload(`${v}/DownloadYaml`);
  }
  async _downloadZip() {
    if (!this._downloadingZip) {
      this._downloadingZip = !0;
      try {
        this._activeProfile ? await this._triggerDownloadPost(
          "/umbraco/api/SchemaExport/DownloadZipSelected",
          this._activeProfile.selection
        ) : await this._triggerDownload(`${v}/DownloadZip`);
      } finally {
        setTimeout(() => {
          this._downloadingZip = !1;
        }, 2e3);
      }
    }
  }
  async _triggerDownload(e) {
    try {
      const t = await this._fetchAuthenticated(e.replace(v, ""));
      if (!t.ok)
        throw new Error(`Server returned ${t.status}: ${t.statusText}`);
      const i = await t.blob(), s = (t.headers.get("Content-Disposition") ?? "").match(/filename[^;=\n]*=["']?([^"';\n]+)/i);
      let r = "umbraco-export";
      e.toLowerCase().includes("zip") ? r += ".zip" : e.toLowerCase().includes("yaml") && (r += ".yml");
      const o = s ? s[1].trim() : r;
      if (typeof window.showSaveFilePicker == "function") {
        const m = o.split(".").pop() === "zip" ? [{ description: "ZIP archive", accept: { "application/zip": [".zip"] } }] : [{ description: "YAML file", accept: { "application/x-yaml": [".yml", ".yaml"] } }];
        try {
          const _ = await (await window.showSaveFilePicker({ suggestedName: o, types: m })).createWritable();
          await _.write(i), await _.close();
          return;
        } catch (g) {
          if (g.name === "AbortError") return;
        }
      }
      const c = URL.createObjectURL(i), d = document.createElement("a");
      d.href = c, d.download = o, d.style.display = "none", document.body.appendChild(d), d.click(), document.body.removeChild(d), setTimeout(() => URL.revokeObjectURL(c), 100);
    } catch (t) {
      this._notify("danger", "Download failed", t.message ?? "Could not download file.");
    }
  }
  async _triggerDownloadPost(e, t) {
    try {
      const i = await this._fetchWithAuth(e, {
        method: "POST",
        body: JSON.stringify(t)
      });
      if (!i.ok) throw new Error(`Server returned ${i.status}: ${i.statusText}`);
      const a = await i.blob(), r = (i.headers.get("Content-Disposition") ?? "").match(/filename[^;=\n]*=["']?([^"';\n]+)/i);
      let o = r ? r[1].trim() : e.includes("zip") ? "umbraco-export.zip" : "umbraco-export.yml";
      if (typeof window.showSaveFilePicker == "function") {
        const m = o.split(".").pop() === "zip" ? [{ description: "ZIP archive", accept: { "application/zip": [".zip"] } }] : [{ description: "YAML file", accept: { "application/x-yaml": [".yml", ".yaml"] } }];
        try {
          const _ = await (await window.showSaveFilePicker({ suggestedName: o, types: m })).createWritable();
          await _.write(a), await _.close();
          return;
        } catch (g) {
          if (g.name === "AbortError") return;
        }
      }
      const c = URL.createObjectURL(a), d = Object.assign(document.createElement("a"), { href: c, download: o, style: "display:none" });
      document.body.appendChild(d), d.click(), document.body.removeChild(d), setTimeout(() => URL.revokeObjectURL(c), 100);
    } catch (i) {
      this._notify("danger", "Download failed", i.message ?? "Could not download file.");
    }
  }
  // ─── Notifications ─────────────────────────────────────────────────────────
  _notify(e, t, i) {
    this._notificationContext && this._notificationContext.peek(e, { data: { headline: t, message: i } });
  }
  // ─── Config dialog ─────────────────────────────────────────────────────────
  async _openConfigDialog() {
    this._showConfigDialog = !0, await this._loadProfiles(), this._activeProfile ? (this._editingProfileId = this._activeProfile.id, this._editingProfileName = this._activeProfile.name, this._configuring = JSON.parse(JSON.stringify(this._activeProfile.selection))) : this._profiles.length > 0 ? await this._selectProfile(this._profiles[0].id) : this._newProfile(), this._availableItems || await this._fetchAvailableItems();
  }
  async _loadProfiles() {
    try {
      const e = await this._fetchWithAuth("/umbraco/api/ExportProfile/List");
      e.ok && (this._profiles = await e.json());
    } catch {
    }
  }
  async _selectProfile(e) {
    try {
      const t = await this._fetchWithAuth(`/umbraco/api/ExportProfile/Get/${e}`);
      if (!t.ok) return;
      const i = await t.json();
      this._editingProfileId = i.id, this._editingProfileName = i.name, this._configuring = JSON.parse(JSON.stringify(i.selection));
    } catch {
    }
  }
  _newProfile() {
    this._editingProfileId = null, this._editingProfileName = "", this._configuring = this._defaultSelection();
  }
  _closeConfigDialog() {
    this._showConfigDialog = !1;
  }
  _renderConfigDialog() {
    return n`
            <div class="config-overlay"
                 role="dialog" aria-modal="true" aria-label="Configure Export"
                 @click=${(e) => {
      e.target === e.currentTarget && this._closeConfigDialog();
    }}>
                <div class="config-dialog">
                    <div class="config-header">
                        Configure Export
                        <uui-button look="secondary" compact label="Close dialog" aria-label="Close dialog" @click=${this._closeConfigDialog}>✕</uui-button>
                    </div>

                    <div class="config-body">
                        <div class="config-profiles">
                            <div class="section-label">Profiles</div>
                            <uui-button look="secondary" compact label="New profile" @click=${this._newProfile}>
                                + New profile
                            </uui-button>
                            <hr style="border:none;border-top:1px solid var(--uui-color-border,#e3e3e3);margin:4px 0">

                            ${this._profiles.map((e) => n`
                                <div class="profile-item ${this._editingProfileId === e.id ? "active-profile" : ""}"
                                     @click=${() => this._selectProfile(e.id)}>
                                    ${e.isActive ? n`<span class="profile-dot"></span>` : u}
                                    ${e.name}
                                </div>`)}

                            ${this._editingProfileId !== null ? n`
                                <hr style="border:none;border-top:1px solid var(--uui-color-border,#e3e3e3);margin:8px 0">
                                <uui-button look="secondary" color="danger" compact
                                            label="Delete profile"
                                            @click=${this._deleteProfile}>
                                    Delete
                                </uui-button>` : u}
                        </div>

                        <div class="config-selection">
                            ${this._renderSelectionPanel()}
                        </div>
                    </div>

                    <div class="config-footer">
                        <uui-button look="secondary" label="Cancel" @click=${this._closeConfigDialog}>Cancel</uui-button>
                        <uui-button look="primary" color="default" label="Save" @click=${this._saveProfile}>Save</uui-button>
                        <uui-button look="primary" color="positive" label="Save and Apply" @click=${this._saveAndApplyProfile}>
                            Save &amp; Apply
                        </uui-button>
                    </div>
                </div>
            </div>`;
  }
  _renderSelectionPanel() {
    var t, i, a, s, r, o, c, d;
    const e = [
      { key: "languages", label: "Languages", items: (t = this._availableItems) == null ? void 0 : t.languages },
      { key: "dataTypes", label: "Data Types", items: (i = this._availableItems) == null ? void 0 : i.dataTypes },
      { key: "documentTypes", label: "Document Types", items: (a = this._availableItems) == null ? void 0 : a.documentTypes },
      { key: "mediaTypes", label: "Media Types", items: (s = this._availableItems) == null ? void 0 : s.mediaTypes },
      { key: "templates", label: "Templates", items: (r = this._availableItems) == null ? void 0 : r.templates },
      { key: "dictionaryItems", label: "Dictionary Items", items: (o = this._availableItems) == null ? void 0 : o.dictionaryItems },
      { key: "members", label: "Members", items: (c = this._availableItems) == null ? void 0 : c.members },
      { key: "users", label: "Users", items: (d = this._availableItems) == null ? void 0 : d.users }
    ];
    return n`
            <div class="section-label">Profile name</div>
            <input class="profile-name-input" type="text"
                   .value=${this._editingProfileName}
                   @input=${(f) => {
      this._editingProfileName = f.target.value;
    }}
                   placeholder="Enter profile name...">
            <div class="section-label">Selection</div>
            ${this._loadingItems ? n`<uui-loader-circle></uui-loader-circle>` : e.map((f) => this._renderFlatCategoryRow(f))}
            ${this._renderTreeCategoryRow("content", "Content")}
            ${this._renderTreeCategoryRow("media", "Media")}`;
  }
  _renderFlatCategoryRow({ key: e, label: t, items: i }) {
    const a = this._configuring[e], s = a.includeAll || a.aliases.length > 0, r = this._expandedCategories.has(e);
    return n`
            <div class="cat-row">
                <input type="checkbox" .checked=${s}
                       @change=${(o) => this._toggleCategory(e, o.target.checked)}>
                <div style="flex:1">
                    <span class="cat-name">${t}</span>
                    ${s && a.includeAll ? n`<span class="cat-meta">(all)</span>` : u}
                    ${s && (i == null ? void 0 : i.length) > 0 ? n`
                        <div>
                            <span class="filter-toggle"
                                  @click=${() => this._toggleEntityExpand(e)}>
                                ${r ? "▲ hide" : "▼ filter..."}
                            </span>
                        </div>
                        ${r ? n`
                            <div class="entity-list">
                                ${i.map((o) => {
      const c = a.includeAll || a.aliases.includes(o.alias);
      return n`
                                        <span class="chip ${c ? "selected" : ""}"
                                              @click=${() => {
        i != null && i.length && (a.includeAll ? this._configuring = {
          ...this._configuring,
          [e]: {
            includeAll: !1,
            aliases: i.map((d) => d.alias).filter((d) => d !== o.alias),
            nodeIds: []
          }
        } : this._toggleAlias(e, o.alias, !a.aliases.includes(o.alias)));
      }}>
                                            ${o.name}
                                        </span>`;
    })}
                            </div>` : u}
                    ` : u}
                </div>
            </div>`;
  }
  _renderTreeCategoryRow(e, t) {
    var o;
    const i = this._configuring[e], a = i.includeAll || (((o = i.nodeIds) == null ? void 0 : o.length) ?? 0) > 0, s = this._expandedCategories.has(e), r = e === "content" ? this._contentTree : this._mediaTree;
    return n`
            <div class="cat-row">
                <input type="checkbox" .checked=${a}
                       @change=${async (c) => {
      this._toggleCategory(e, c.target.checked), c.target.checked && !r && (e === "content" ? await this._fetchContentTree() : await this._fetchMediaTree());
    }}>
                <div style="flex:1">
                    <span class="cat-name">${t}</span>
                    ${a && i.includeAll ? n`<span class="cat-meta">(all)</span>` : u}
                    ${a ? n`
                        <div>
                            <span class="filter-toggle"
                                  @click=${async () => {
      this._toggleEntityExpand(e), r || (e === "content" ? await this._fetchContentTree() : await this._fetchMediaTree());
    }}>
                                ${s ? "▲ hide" : "▼ tree..."}
                            </span>
                        </div>
                        ${s && r ? n`<div style="margin-top:8px">
                                ${r.map((c) => this._renderTreeNode(e, c, 0))}
                              </div>` : u}
                    ` : u}
                </div>
            </div>`;
  }
  _renderTreeNode(e, t, i) {
    const a = this._configuring[e], s = (a == null ? void 0 : a.nodeIds) ?? [], r = (a == null ? void 0 : a.includeAll) || s.includes(t.id), o = `${e}-${t.id}`, c = this._expandedTreeNodes.has(o), d = (t.children ?? []).length > 0;
    return n`
            <div style="padding-left:${i * 16}px;margin:2px 0">
                <div style="display:flex;align-items:center;gap:6px">
                    ${d ? n`<span style="width:14px;font-size:12px;cursor:pointer;color:var(--uui-color-text-alt,#595959)"
                                     @click=${() => this._toggleTreeExpand(e, t.id)}>
                                   ${c ? "▼" : "▶"}
                               </span>` : n`<span style="width:14px"></span>`}
                    <input type="checkbox" .checked=${r}
                           @change=${(f) => {
      if (a.includeAll) {
        const m = e === "content" ? this._contentTree : this._mediaTree, g = new Set(this._allDescendantIds(t)), _ = (m ?? []).flatMap((x) => this._allDescendantIds(x)).filter((x) => !g.has(x));
        this._configuring = {
          ...this._configuring,
          [e]: { includeAll: !1, aliases: [], nodeIds: _ }
        };
      } else
        this._toggleNodeIds(e, t, f.target.checked);
    }}>
                    <span style="font-size:13px">${t.name}</span>
                </div>
                ${c && d ? t.children.map((f) => this._renderTreeNode(e, f, i + 1)) : u}
            </div>`;
  }
  // ─── Config dialog helpers (Task 13) ──────────────────────────────────────
  async _fetchAvailableItems() {
    this._loadingItems = !0;
    try {
      const e = await this._fetchWithAuth("/umbraco/api/ExportItems/Available");
      e.ok && (this._availableItems = await e.json());
    } catch {
    } finally {
      this._loadingItems = !1;
    }
  }
  _toggleCategory(e, t) {
    this._configuring = {
      ...this._configuring,
      [e]: { ...this._configuring[e], includeAll: t, aliases: [], nodeIds: [] }
    };
  }
  _toggleEntityExpand(e) {
    const t = new Set(this._expandedCategories);
    t.has(e) ? t.delete(e) : t.add(e), this._expandedCategories = t;
  }
  _toggleAlias(e, t, i) {
    const a = this._configuring[e], s = i ? [...a.aliases, t] : a.aliases.filter((r) => r !== t);
    this._configuring = {
      ...this._configuring,
      [e]: { ...a, includeAll: !1, aliases: s }
    };
  }
  async _fetchContentTree() {
    try {
      const e = await this._fetchWithAuth("/umbraco/api/ExportItems/ContentTree");
      e.ok && (this._contentTree = await e.json());
    } catch {
    }
  }
  async _fetchMediaTree() {
    try {
      const e = await this._fetchWithAuth("/umbraco/api/ExportItems/MediaTree");
      e.ok && (this._mediaTree = await e.json());
    } catch {
    }
  }
  _toggleTreeExpand(e, t) {
    const i = `${e}-${t}`, a = new Set(this._expandedTreeNodes);
    a.has(i) ? a.delete(i) : a.add(i), this._expandedTreeNodes = a;
  }
  _allDescendantIds(e) {
    return [e.id, ...(e.children ?? []).flatMap((t) => this._allDescendantIds(t))];
  }
  _toggleNodeIds(e, t, i) {
    const a = this._allDescendantIds(t), s = this._configuring[e], r = s.nodeIds ?? [], o = i ? [.../* @__PURE__ */ new Set([...r, ...a])] : r.filter((c) => !a.includes(c));
    this._configuring = {
      ...this._configuring,
      [e]: { ...s, includeAll: !1, nodeIds: o }
    };
  }
  // ─── Config dialog stubs (Tasks 15) ────────────────────────────────────────
  async _saveProfile() {
    if (!this._editingProfileName.trim())
      return this._notify("warning", "Name required", "Enter a profile name before saving."), !1;
    try {
      let e, t;
      if (this._editingProfileId === null ? e = await this._fetchWithAuth("/umbraco/api/ExportProfile/Create", {
        method: "POST",
        body: JSON.stringify({ name: this._editingProfileName, selection: this._configuring })
      }) : e = await this._fetchWithAuth(
        `/umbraco/api/ExportProfile/Update/${this._editingProfileId}`,
        {
          method: "PUT",
          body: JSON.stringify({ name: this._editingProfileName, selection: this._configuring })
        }
      ), !e.ok) throw new Error((await e.json().catch(() => ({}))).message ?? e.statusText);
      return t = await e.json(), this._editingProfileId = t.id, await this._loadProfiles(), this._notify("positive", "Profile saved", `"${t.name}" saved.`), !0;
    } catch (e) {
      return this._notify("danger", "Save failed", e.message ?? "Unknown error"), !1;
    }
  }
  async _saveAndApplyProfile() {
    if (await this._saveProfile())
      try {
        const t = await this._fetchWithAuth(
          `/umbraco/api/ExportProfile/Activate/${this._editingProfileId}`,
          { method: "POST" }
        );
        if (!t.ok) throw new Error((await t.json().catch(() => ({}))).message ?? t.statusText);
        await this._loadActiveProfile(), this._closeConfigDialog(), this._notify("positive", "Profile applied", `Exporting with "${this._editingProfileName}".`);
      } catch (t) {
        this._notify("danger", "Apply failed", t.message ?? "Unknown error");
      }
  }
  async _deleteProfile() {
    var e;
    if (this._editingProfileId !== null)
      try {
        const t = await this._fetchWithAuth(
          `/umbraco/api/ExportProfile/Delete/${this._editingProfileId}`,
          { method: "DELETE" }
        );
        if (!t.ok) throw new Error((await t.json().catch(() => ({}))).message ?? t.statusText);
        ((e = this._activeProfile) == null ? void 0 : e.id) === this._editingProfileId && (this._activeProfile = null), this._editingProfileId = null, this._editingProfileName = "", this._configuring = this._defaultSelection(), await this._loadProfiles(), this._notify("positive", "Profile deleted", "Profile removed.");
      } catch (t) {
        this._notify("danger", "Delete failed", t.message ?? "Unknown error");
      }
  }
  // ─── Render ────────────────────────────────────────────────────────────────
  _renderStats() {
    if (!this._stats) return u;
    const e = this._stats;
    return n`
            <div class="stats-grid">
                ${this._statCard("Languages", e.languages)}
                ${this._statCard("Data Types", e.dataTypes)}
                ${this._statCard("Document Types", e.documentTypes)}
                ${this._statCard("Media Types", e.mediaTypes)}
                ${this._statCard("Templates", e.templates)}
                ${this._statCard("Content Nodes", e.content)}
                ${this._statCard("Media Items", e.media)}
                ${this._statCard("Dictionary Items", e.dictionaryItems)}
                ${this._statCard("Members", e.members)}
                ${this._statCard("Users", e.users)}
            </div>
            ${e.umbracoVersion ? n`
                <p class="stat-meta">
                    Exported ${e.exportDate ? new Date(e.exportDate).toLocaleString() : ""}
                    &mdash; Umbraco ${e.umbracoVersion}
                    ${e.durationSeconds != null ? n`&mdash; ${e.durationSeconds.toFixed(2)}s` : u}
                </p>` : u}
        `;
  }
  _statCard(e, t) {
    return n`
            <div class="stat-card">
                <div class="stat-label">${e}</div>
                <div class="stat-value">${t ?? 0}</div>
            </div>`;
  }
  _renderPreview() {
    return this._yamlPreview ? n`
            <div class="preview-box">
                <div class="preview-header">
                    <h3>YAML Preview</h3>
                    ${this._previewTruncated ? n`<span class="truncated-note">Showing first 10 000 chars — download for the full export</span>` : u}
                </div>
                <pre class="yaml">${this._yamlPreview}${this._previewTruncated ? `
… (truncated)` : ""}</pre>
            </div>` : u;
  }
  render() {
    const e = this._activeProfile ? `Export (${this._activeProfile.name})` : this._loading ? "Exporting…" : "Export to YAML";
    return n`
            <div class="header">
                <h1>Schema Export</h1>
                <p>Export your Umbraco site structure to YAML for version control and migration.</p>
            </div>

            <div class="actions">
                <uui-button
                    look="primary"
                    color="default"
                    label=${e}
                    ?disabled=${this._loading}
                    @click=${this._runExport}>
                    ${this._loading ? n`<uui-loader-circle></uui-loader-circle>` : u}
                    ${e}
                    ${this._activeProfile ? n`
                        <span style="margin-left:6px;opacity:.7;font-size:11px"
                              @click=${this._deactivateProfile}
                              title="Clear filter — export everything">✕</span>` : u}
                </uui-button>

                <uui-button
                    look="secondary"
                    color="default"
                    label="Download YAML"
                    ?disabled=${!this._hasExport || this._loading}
                    @click=${this._downloadYaml}>
                    Download YAML
                </uui-button>

                <uui-button
                    look="secondary"
                    color="default"
                    label=${this._downloadingZip ? "Preparing ZIP…" : "Download ZIP (with media)"}
                    ?disabled=${this._downloadingZip || !this._hasExport}
                    @click=${this._downloadZip}>
                    ${this._downloadingZip ? n`<uui-loader-circle></uui-loader-circle>` : u}
                    ${this._downloadingZip ? "Preparing ZIP…" : "Download ZIP (with media)"}
                </uui-button>

                <uui-button look="secondary" color="default"
                    label="Configure Export" @click=${this._openConfigDialog}>
                    Configure Export
                </uui-button>
            </div>

            ${this._renderStats()}
            ${this._renderPreview()}
            ${this._showConfigDialog ? this._renderConfigDialog() : u}
        `;
  }
};
l.styles = y`
        :host {
            display: block;
            padding: var(--uui-size-layout-1, 24px);
        }

        .header {
            margin-bottom: var(--uui-size-layout-2, 32px);
        }

        .header h1 {
            font-size: var(--uui-type-h3-size, 1.5rem);
            font-weight: 600;
            margin: 0 0 var(--uui-size-3, 8px) 0;
            color: var(--uui-color-text, #1b264f);
        }

        .header p {
            margin: 0;
            color: var(--uui-color-text-alt, #666);
        }

        .actions {
            display: flex;
            gap: var(--uui-size-3, 8px);
            flex-wrap: wrap;
            margin-bottom: var(--uui-size-layout-2, 32px);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: var(--uui-size-3, 8px);
            margin-bottom: var(--uui-size-layout-2, 32px);
        }

        .stat-card {
            background: var(--uui-color-surface, #fff);
            border: 1px solid var(--uui-color-border, #e3e3e3);
            border-radius: var(--uui-border-radius, 4px);
            padding: var(--uui-size-5, 16px);
            text-align: center;
        }

        .stat-label {
            font-size: 12px;
            color: var(--uui-color-text-alt, #595959);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: var(--uui-size-2, 6px);
        }

        .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: var(--uui-color-interactive, #1b264f);
            line-height: 1;
        }

        .stat-meta {
            font-size: 12px;
            color: var(--uui-color-text-alt, #595959);
            margin-top: var(--uui-size-2, 6px);
        }

        .preview-box {
            margin-top: var(--uui-size-layout-2, 32px);
        }

        .preview-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--uui-size-3, 8px);
        }

        .preview-header h3 {
            margin: 0;
            font-size: var(--uui-type-h5-size, 1rem);
            font-weight: 600;
        }

        .truncated-note {
            font-size: 12px;
            font-style: italic;
            color: var(--uui-color-warning-emphasis, #a0522d);
        }

        pre.yaml {
            background: var(--uui-color-surface-alt, #f5f5f5);
            border: 1px solid var(--uui-color-border, #e3e3e3);
            border-radius: var(--uui-border-radius, 4px);
            padding: var(--uui-size-5, 16px);
            font-family: 'Courier New', Consolas, monospace;
            font-size: 12px;
            line-height: 1.6;
            max-height: 520px;
            overflow: auto;
            white-space: pre;
            margin: 0;
        }

        .config-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,.5); z-index: 1000;
            display: flex; align-items: center; justify-content: center;
        }
        .config-dialog {
            background: var(--uui-color-surface,#fff);
            border-radius: var(--uui-border-radius,4px);
            box-shadow: 0 8px 32px rgba(0,0,0,.18);
            width: 900px; max-width: 96vw; max-height: 90vh;
            display: flex; flex-direction: column; overflow: hidden;
        }
        .config-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 16px 24px;
            border-bottom: 1px solid var(--uui-color-border,#e3e3e3);
            font-weight: 600; font-size: 16px;
        }
        .config-body { display: flex; flex: 1; overflow: hidden; }
        .config-profiles {
            width: 210px; min-width: 170px;
            border-right: 1px solid var(--uui-color-border,#e3e3e3);
            display: flex; flex-direction: column; overflow-y: auto; padding: 16px; gap: 6px;
        }
        .config-selection { flex: 1; overflow-y: auto; padding: 16px 24px; }
        .config-footer {
            display: flex; gap: 8px; justify-content: flex-end;
            padding: 12px 24px;
            border-top: 1px solid var(--uui-color-border,#e3e3e3);
        }
        .profile-item {
            padding: 7px 10px; border-radius: 4px; cursor: pointer;
            display: flex; align-items: center; gap: 6px; font-size: 13px;
        }
        .profile-item:hover { background: var(--uui-color-surface-alt,#f5f5f5); }
        .profile-item.active-profile { background: var(--uui-color-selected,#e3edff); font-weight: 500; }
        .profile-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: var(--uui-color-positive,#2e7d32); flex-shrink: 0;
        }
        .profile-name-input {
            width: 100%; padding: 8px; box-sizing: border-box;
            border: 1px solid var(--uui-color-border,#ddd);
            border-radius: 4px; font-size: 14px; margin-bottom: 16px;
        }
        .section-label {
            font-size: 12px; font-weight: 600; text-transform: uppercase;
            color: var(--uui-color-text-alt,#595959); letter-spacing: .05em; margin-bottom: 8px;
        }
        .cat-row {
            display: flex; align-items: flex-start; gap: 8px;
            padding: 8px 0; border-bottom: 1px solid var(--uui-color-border,#f0f0f0);
        }
        .cat-row:last-child { border-bottom: none; }
        .cat-name { font-weight: 500; font-size: 14px; }
        .cat-meta { font-size: 12px; color: var(--uui-color-text-alt,#595959); margin-left: 4px; }
        .filter-toggle {
            font-size: 12px; color: var(--uui-color-interactive,#1b264f);
            cursor: pointer; margin-top: 4px; display: inline-block;
        }
        .entity-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .chip {
            display: inline-flex; align-items: center; gap: 4px;
            padding: 4px 10px; border-radius: 16px; font-size: 12px;
            border: 1px solid var(--uui-color-border,#ddd);
            cursor: pointer; user-select: none;
            background: var(--uui-color-surface,#fff);
        }
        .chip.selected {
            background: var(--uui-color-interactive,#1b264f);
            border-color: var(--uui-color-interactive,#1b264f);
            color: #fff;
        }
    `;
h([
  p()
], l.prototype, "_loading", 2);
h([
  p()
], l.prototype, "_downloadingZip", 2);
h([
  p()
], l.prototype, "_stats", 2);
h([
  p()
], l.prototype, "_yaml", 2);
h([
  p()
], l.prototype, "_yamlPreview", 2);
h([
  p()
], l.prototype, "_previewTruncated", 2);
h([
  p()
], l.prototype, "_hasExport", 2);
h([
  p()
], l.prototype, "_profiles", 2);
h([
  p()
], l.prototype, "_activeProfile", 2);
h([
  p()
], l.prototype, "_showConfigDialog", 2);
h([
  p()
], l.prototype, "_editingProfileId", 2);
h([
  p()
], l.prototype, "_editingProfileName", 2);
h([
  p()
], l.prototype, "_configuring", 2);
h([
  p()
], l.prototype, "_loadingItems", 2);
h([
  p()
], l.prototype, "_availableItems", 2);
h([
  p()
], l.prototype, "_contentTree", 2);
h([
  p()
], l.prototype, "_mediaTree", 2);
h([
  p()
], l.prototype, "_expandedCategories", 2);
h([
  p()
], l.prototype, "_expandedTreeNodes", 2);
l = h([
  b("schema2yaml-dashboard")
], l);
export {
  l as Schema2YamlDashboard
};
//# sourceMappingURL=schema2yaml-dashboard.js.map
