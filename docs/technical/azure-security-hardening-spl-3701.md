# Azure security hardening (SPL-3701)

This change applies the operator-approved transport and recoverability controls that
do not require a network-topology, cost, or availability decision. The canonical
template is `infra/bicep/main.bicep`; `.worktrees/` copies are not deliverables.

## Applied controls

- Storage requires TLS 1.2 and secure transfer, and disables blob public access.
- Key Vault has soft-delete and purge protection enabled.
- App Service is HTTPS-only, requires TLS 1.2, and has FTP/FTPS deployments disabled.
- The web app has a system-assigned managed identity.
- The `environment` parameter is constrained to `dev`, `staging`, or `prod`.

These changes intentionally do not alter network reachability, SKU, region, or
instance count.

## Rule-by-rule disposition

The following disposition is explicit: an item marked **open** is not a waiver and
must remain visible in the authoritative Checkov/CI results.

| Rule | Disposition | Reason |
| --- | --- | --- |
| CKV_AZURE_14 | Applied | `httpsOnly: true` on the Web App. |
| CKV_AZURE_15 | Applied | App Service `minTlsVersion: '1.2'`. |
| CKV_AZURE_16 | Open | Azure AD authentication configuration was not added; identity/network design is separate. |
| CKV_AZURE_17 | Open | Client certificates can break existing callers and were not approved. |
| CKV_AZURE_18 | Open | HTTP/2 was not added without an explicit compatibility decision. |
| CKV_AZURE_35 | Open | Storage default-deny ACLs require an approved VNet/private-endpoint design. |
| CKV_AZURE_42 | Applied | Key Vault soft-delete is enabled. |
| CKV_AZURE_43 | Existing compliant configuration | The storage name is lowercase and within Azure's naming constraints; no change required. |
| CKV_AZURE_44 | Applied | Storage `minimumTlsVersion: 'TLS1_2'`. |
| CKV_AZURE_67 | Not applicable | No Function App exists in this template. |
| CKV_AZURE_70 | Not applicable | No Function App exists in this template. |
| CKV_AZURE_71 | Applied | Web App has a system-assigned managed identity. |
| CKV_AZURE_78 | Applied | App Service `ftpsState: 'Disabled'`. |
| CKV_AZURE_109 | Open | Key Vault firewall/network ACL configuration is deferred with network topology. |
| CKV_AZURE_110 | Applied | Key Vault purge protection is enabled. |
| CKV_AZURE_153 | Not applicable | No App Service deployment slot exists in this template. |
| CKV_AZURE_189 | Open | Disabling Key Vault public access requires an approved private-access design. |
| CKV_AZURE_206 | Open | Changing storage replication affects cost/availability and was explicitly deferred. |
| CKV_AZURE_212 | Open | Minimum App Service instance count affects cost/availability and was deferred. |
| CKV_AZURE_213 | Open | No approved health-check endpoint was supplied; inventing one could misreport health. |
| CKV_AZURE_222 | Open | Disabling Web App public access requires an approved network topology. |
| CKV_AZURE_225 | Open | Zone redundancy affects cost/availability and was explicitly deferred. |

The broader operator-approved controls for SQL auditing/threat detection/diagnostics,
key/secret expiry, Docker digest pinning, and Kubernetes limits/capabilities/root
filesystem remain open or not applicable because this repository template declares
no SQL resource, key/secret resources, deployable application Docker image, or
Kubernetes manifests for those controls. Existing test Dockerfiles are not treated
as production workload images; digest pinning is deferred to supply-chain work.

## Validation

- `git diff --check` passes for the implementation commit.
- Checkov and Azure CLI are not installed in this workspace. CI/Checkov remains the
authoritative scanner and must retain the open findings listed above.
