# SplatDev.Payments.Santander

Santander **Open Banking** (developer-portal) SDK for .NET — OAuth2 `client_credentials` over **mTLS**
(ICP-Brasil e-CNPJ certificate) with typed services for the Santander product suite.

Targets `net8.0` (Umbraco 13) and `net10.0` (Umbraco 17). Transport-only: no Umbraco dependency (the
Umbraco composer, controller and backoffice dashboard live in `SplatDev.Umbraco.Plugins.Santander`).

## Contents

| Type | Role |
|------|------|
| `SantanderApiOptions` | Config: BaseUrl, token path, ClientId/Secret, mTLS cert (path/base64/password), `X-Application-Key`, per-product paths, account/covenant/workspace ids |
| `SantanderApiClient` | Authenticated HTTP client: OAuth2 `client_credentials` + cached bearer token, `X-Application-Key` header, `Get/Post/Put/Patch`, dev mock. mTLS certificate is attached to the named `HttpClient` by the host |
| `SantanderUrls` | Composes absolute product URLs (global host + per-product BaseUrl override + path) |
| `Santander*Service` | Typed services: `BalanceStatement`, `Boleto`, `Payments`, `PixQrCode`, `PixAutomatico`, `OpenFx`, `ExportCharge`, `Vouchers` |
| `SantanderApiException` | Non-success responses; carries status code + response body |

## mTLS

Transport security is mutual TLS with the ICP-Brasil e-CNPJ **A1** certificate (PKCS#12). Attach it to
the named `HttpClient` (`SantanderApiClient.HttpClientName` = `"Santander"`) via
`ConfigurePrimaryHttpMessageHandler` in the consuming app / the Umbraco plugin. Token endpoint requires
mTLS as well.

## Endpoints (per Santander support, prod)

- Boletos (cobrança): `POST /collection_bill_management/v2/workspaces/{ws}/bank_slips` — homologated.
- Saldo: `GET https://trust-open-h.api.santander.com.br/bank_account_information/v1/banks/{bankId}/balances/{ag}.{conta12}`
- Extrato: `GET /bank_account_information/v1/banks/{bankId}/statements/{ag}.{conta12}` (conta = 12 dígitos)
- Pagamento de boletos: workspace-based `POST/PATCH /management_payments_partners/v1/workspaces/{ws}/bank_slip_payments`
- Pix QR Code: host `trust-pix.santander.com.br`, `PUT /api/v1/cob/{txid}`

Each product is homologated individually with Santander.
