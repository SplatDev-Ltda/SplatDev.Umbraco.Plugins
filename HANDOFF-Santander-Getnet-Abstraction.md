# Handoff — Abstração Santander + Getnet (SplatDev.Payments / Umbraco.Plugins)

Criado em 2026-07-14. Os 4 projetos abaixo foram gerados no repo **Umbraco Projects** a partir do código que
está em `RISIN` (`origin/master`). Os 2 SDKs **compilam (net8.0 + net10.0, 0 erros)** — verificados. Os 2
plugins Umbraco não puderam ser compilados no sandbox (cache NuGet offline sem `MailKit/MimeKit 4.17.0` do
`Directory.Build.props` do repo, e sem Umbraco 17.4.2); e o git desse mount trava. Finalize no ambiente real.

## Projetos criados

| Projeto | Conteúdo | Depende de |
|---|---|---|
| `SplatDev.Payments.Santander` | SDK Open Banking: `SantanderApiClient/Options/Urls`, 8 serviços de produto, `SantanderApiException`. Namespace `SplatDev.Payments.Santander`. | Microsoft.Extensions.Http/Hosting/Logging |
| `SplatDev.Umbraco.Plugins.Santander` | `SantanderComposer` + `SantanderBankingApiController` (rota `umbraco/backoffice/santander-banking`, guard `X-RISIN-Api-Key`). | ↑ SDK + Umbraco.Cms 17.4.2 + Http.Polly |
| `SplatDev.Payments.Getnet` | SDK Getnet: `GetnetApiClient/Options`. Namespace `SplatDev.Payments.Getnet`. | Microsoft.Extensions.* |
| `SplatDev.Umbraco.Plugins.Getnet` | `GetnetComposer` (registra o SDK + HttpClient "Getnet"). | ↑ SDK + Umbraco.Cms 17.4.2 + Http.Polly |

## Branch / build (ambiente real)
1. `git -C "Umbraco Projects" checkout u17` → `git checkout -b feature/SPL-XXXX-santander-getnet-payments`.
2. Adicionar os 4 projetos à solução (`SplatDev.Core.slnx`) e restaurar (feed NuGet com MailKit 4.17.0 + Umbraco 17.4.2).
3. `dotnet build` os 4. (SDKs já verificados; os plugins usam `X509CertificateLoader.LoadPkcs12FromFile` → net10 apenas, ok no u17.)
4. Gerar dashboards Lit 3 / ícones / marketplace json conforme `Instructions.md` (opcional nesta fase).

## Fiação da RISIN (repo RISIN, branch off master)
1. **ProjectReference** em `RISIN.Corporate.Web.csproj` para os 4 projetos (ou publicar como NuGet e referenciar por versão).
2. **Remover da RISIN** (agora vêm dos pacotes):
   - `Services/Santander/*` (11 arquivos) → `SplatDev.Payments.Santander`
   - `Composers/SantanderComposer.cs` → `SplatDev.Umbraco.Plugins.Santander`
   - `Controllers/Santander/SantanderBankingApiController.cs` → idem
   - `Services/Locacao/GetnetApiClient.cs`, `GetnetApiOptions.cs` → `SplatDev.Payments.Getnet`
   - O bloco de registro do Getnet em `LocacaoComposer.cs` (options + client + HttpClient "Getnet") → agora `GetnetComposer`
3. **Fica na RISIN** (específico do domínio; passa a consumir o SDK):
   - `Services/Locacao/GetnetPaymentService.cs`, `GetnetBackofficeService.cs` (leem tabelas `risin_*`)
   - `Controllers/Locacao/GetnetWebhookController.cs`, `GetnetBackofficeApiController.cs`
   - `Migrations/AddSantanderPagamentoTable.cs` (cria `risin_santander_pagamento`)
   - `wwwroot/App_Plugins/SantanderManager/*` (dashboard do Getnet, rota `santander`)
4. **Corrigir usings** onde a RISIN ainda referencia os tipos movidos:
   - `using SplatDev.Payments.Santander;` (era `RISIN.Corporate.Web.Services.Santander`)
   - `using SplatDev.Payments.Getnet;` (era `RISIN.Corporate.Web.Services.Locacao` para os tipos Getnet)
   - Testes: `SantanderOpenBankingTests.cs`, `SantanderBankingControllerTests.cs`, `SantanderPaymentTests.cs`
5. `dotnet build` + `dotnet test` da RISIN — verde. Deploy só depois de validar (prod está com o código inline atual).

## Notas
- `SantanderBankingApiController` mantém o header `X-RISIN-Api-Key` (compatibilidade). Renomeie o const `ApiKeyHeader`
  se quiser um alias neutro no pacote reutilizável.
- Getnet: o backoffice/webhook é específico da RISIN — por isso `SplatDev.Umbraco.Plugins.Getnet` traz só o composer.
