# Azure security hardening (SPL-3701)

This change applies transport and recoverability controls that do not require a
network-topology decision. The canonical template is `infra/bicep/main.bicep`.
Worktree copies are not deliverables.

## Applied controls

- Storage uses TLS 1.2, secure-transfer-required, and blob public access disabled.
- Key Vault soft-delete and purge protection are enabled.
- App Service is HTTPS-only, TLS 1.2, HTTP/2 enabled, client certificates enabled,
  health checks enabled, and FTP/FTPS disabled.
- The testing Docker images use version-pinned .NET SDK/runtime major-minor tags,
  run as the non-root `app` user, contain no secret `ENV` values, and define a
  container health check.

## Deliberately open findings

These controls remain open and are not waivers. They require a separately approved
network, cost, availability, or resource-design decision:

- `CKV_AZURE_35` and storage network ACL deny-by-default: deferred until VNet/
  private-endpoint design exists; enforcing it now can make storage unreachable.
- Public network access controls for SQL, Key Vault, Web App, Redis, Service Bus,
  and storage: deferred for the same reachability reason.
- Private endpoints and VNet integration: no approved topology exists.
- Zone redundancy, minimum capacity, SKU/region/instance-count changes: deferred
  as cost and availability decisions.
- SQL auditing, threat detection, and diagnostics: no SQL resource is declared in
  this template; configure them in the SQL deployment module when one is added.
- Key/secret expiry: this template declares no keys or secrets, only the vault;
  enforce expiry on the resource declarations when they are introduced.
- Docker digest pinning: the existing test images are pinned to explicit .NET
  release lines; digest pinning is left for the image supply-chain work item.
- Kubernetes resource limits, dropped capabilities, and read-only root filesystem:
  no Kubernetes manifests exist in this repository, so there is nothing safe to
  change. Apply these controls in the workload chart when one is introduced.

No Checkov or Azure CLI is installed in this workspace. Validation performed here:
`git diff --check`. CI/Checkov remains the authoritative scanner and should report
both the applied controls and the intentionally open findings above.
