export const BUNDLE_URL = "/_content/PdfCurator.Web/pdfc.js";

export const SECTION_WRAPPER_STYLES = `
:host {
  display: block;
  padding: var(--uui-size-layout-1, 24px);
}
uui-box {
  margin-bottom: var(--uui-size-space-5, 16px);
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--uui-size-space-10, 48px);
  text-align: center;
  color: var(--uui-color-text-alt, #6b7280);
}
.loading-state uui-loader-circle {
  margin-bottom: var(--uui-size-space-4, 12px);
}
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--uui-size-space-10, 48px);
  text-align: center;
}
.error-state p {
  color: var(--uui-color-danger, #ef4444);
  margin: var(--uui-size-space-3, 8px) 0 0;
}
`;
