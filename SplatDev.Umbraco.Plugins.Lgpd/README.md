# SplatDev.Umbraco.Plugins.Lgpd

Conformidade com a **LGPD** (Lei nº 13.709/2018) no Umbraco: consentimento comprovável,
requisições de titulares com o prazo do art. 19, registro de operações do art. 37 e
divulgação do encarregado do art. 41.


<!-- screenshot:start -->

![Lgpd dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Lgpd/docs/screenshots/01-dashboard.png)

<!-- screenshot:end -->

Umbraco 13 (net8.0) e Umbraco 17 (net10.0).

---

## Por que não é um plugin de GDPR renomeado

As duas leis divergem em pontos que mudam o **modelo de dados**, não apenas os rótulos:

| | GDPR | LGPD |
|---|---|---|
| Bases legais | 6 | **10** (art. 7º) — inclui proteção do crédito e políticas públicas, sem equivalente europeu |
| Direitos do titular | 8 | **9** (art. 18) — separa anonimização, bloqueio e eliminação, que a GDPR unifica em *erasure* |
| Prazo de resposta | 30 dias | **15 dias** (art. 19, II) |
| Dados sensíveis | consentimento explícito | consentimento **específico e destacado** (art. 11) |
| Menores | idade varia por Estado-membro | consentimento de ao menos um dos pais ou responsável (art. 14 §1) |
| Encarregado/DPO | obrigatório em certos casos | identidade e contato **divulgados publicamente** (art. 41 §1) |

O plugin implementa essas diferenças, não as aproxima.

## O que ele faz

**Consentimento acumulativo.** Cada decisão é um registro novo; nada é sobrescrito. O
art. 8º §1º atribui ao controlador o ônus de comprovar o consentimento, e sobrescrever
torna uma revogação indistinguível de alguém que nunca consentiu. O estado atual é o
registro mais recente **por finalidade** — quem aceitou analytics e recusou marketing tem
duas respostas correntes, não uma.

**Recusa de consentimento inválido.** Dado sensível sem o texto específico apresentado
(art. 11) e dado de menor sem responsável (art. 14) são recusados no momento do registro,
em vez de armazenados e usados depois como se fossem válidos.

**Requisições do art. 18** com o prazo de 15 dias gravado na requisição (não calculado),
para que alterar a configuração depois não mova o prazo de pedidos já em andamento. O
painel destaca vencidas e as que vencem em três dias. Recusar exige justificativa, como
manda o art. 18 §4º.

**Registro de operações (art. 37)** — o equivalente ao ROPA. É a primeira coisa que a ANPD
pede.

**Encarregado (art. 41)** publicado pelo componente de front-end; o painel avisa em
vermelho quando não está configurado, porque a omissão é uma infração e não um detalhe.

## Instalação

```bash
dotnet add package SplatDev.Umbraco.Plugins.Lgpd
```

`appsettings.json`:

```json
{
  "Lgpd": {
    "EncarregadoNome": "Ana Ribeiro",
    "EncarregadoEmail": "encarregado@suaempresa.com.br",
    "EncarregadoTelefone": "+55 11 5555-0100",
    "PrazoRespostaDias": 15,
    "RetencaoConsentimentoDias": 1825
  }
}
```

No layout do site:

```cshtml
@await Component.InvokeAsync("LgpdConsent")
```

O componente cria um cookie próprio (`splatdev_lgpd_sid`) porque o registro de
consentimento precisa sobreviver à sessão do navegador em que foi dado.

## Endpoints

Públicos — o titular não está autenticado quando exerce estes direitos:

| Método | Rota |
|---|---|
| POST | `/umbraco/api/lgpd/RegistrarConsentimento` |
| POST | `/umbraco/api/lgpd/RevogarConsentimento?sessionId=&finalidade=` |
| GET | `/umbraco/api/lgpd/MeuConsentimento?sessionId=` |
| POST | `/umbraco/api/lgpd/AbrirRequisicao` |
| GET | `/umbraco/api/lgpd/Encarregado` |
| GET | `/umbraco/api/lgpd/OperacoesPublicas` |

Backoffice (`BackOfficeAccess`): `Painel`, `Historico`, `Requisicoes`,
`AtualizarRequisicao`, `Operacoes`, `SalvarOperacao`, `RemoverOperacao`,
`PurgarConsentimentos`, `Vocabulario`.

## Limites — leia antes de confiar

- O plugin **registra e comprova** consentimento e requisições. Ele **não executa** a
  exportação nem a eliminação dos dados do titular nos seus sistemas: atender a uma
  requisição continua sendo trabalho seu, e o plugin acompanha o prazo.
- Não substitui assessoria jurídica. As referências a artigos indicam o que cada campo
  atende, não um parecer.
- A retenção é manual (`PurgarConsentimentos`). Purgar apaga também a prova daquelas
  decisões, então mantenha os registros pelo menos enquanto puder precisar comprová-los.

## Testes

21 testes cobrindo o consentimento acumulativo, as recusas dos arts. 11 e 14, o prazo de
15 dias do art. 19, a justificativa obrigatória do art. 18 §4º e as dez bases do art. 7º.

## Changelog

### 1.0.5 — 2026-08-22
- The dashboard loads instead of returning 500. The migration built its DDL with Umbraco's `Create.Table<T>()`, which names tables after the entity, while the DbContext names them from each entity's `[Table]` attribute. The two disagreed — the migration created `Consentimento` and the plugin queried `Consentimentos` — so the migration reported success and recorded itself as done while leaving nothing the plugin could read.
- Table creation is now generated from the EF model itself, so the names cannot drift from the queries again.
- The tables the old migration created under the wrong names are left in place rather than dropped, in case a site put data in them by hand. They are unused; an empty one is safe to drop.

### 1.0.4 — 2026-08-21
- A failed request now says so in the dashboard. Previously the dashboard kept its previous (usually empty) state, so a refused or failed call looked identical to having no data.

### 1.0.3 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
