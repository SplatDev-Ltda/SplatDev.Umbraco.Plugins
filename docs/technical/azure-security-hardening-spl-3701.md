# Azure Security Hardening Report - SPL-3701

This document outlines the scope of applied Azure security hardening controls and identifies intentionally open categories that will be deferred for future considerations.

## Applied Controls

- **Storage Account**: Enforced TLS 1.2 and enabled secure transfer. Applied protection for public blob access.
- **Key Vault**: Implemented soft-delete and purge protection for recoverability.
- **App Service**: Enabled HTTPS-only traffic, TLS 1.2, and disabled FTPS.

## Deferred Controls

- **Network ACL and Public Access**: Controls related to network ACLs, public access, private endpoints, and VNet integration are deferred pending a complete network design.
- **Zone Redundancy and Capacity Adjustments**: Any controls that alter SKU, region, or instance count are deferred as they involve cost and availability decisions.
- **SQL Resources**: Audit, threat detection, and diagnostic settings for SQL are left open, as no SQL resource declarations exist.
- **Key/Secret Expiry**: The expiration of keys and secrets is deferred due to the absence of declarations.
- **Docker and Kubernetes controls**: Docker digest pinning and Kubernetes controls are deferred due to the absence of manifest files.

## Validation

- The implementation was validated locally using `git diff --check`.
- Checkov and Azure CLI were unavailable locally, making CI/Checkov authoritative for validation.

## Summary

This issue splits scope between immediate security hardening that doesn't disrupt running deployments and deferred decisions which require broader architectural considerations.
