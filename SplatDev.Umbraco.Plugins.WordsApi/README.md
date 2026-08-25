# WordsApi

<!-- screenshot:start -->
<!-- screenshot:end -->

Umbraco Words API plugin — validate English word classification (noun detection) using the WordsAPI service via RapidAPI. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.WordsApi.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.WordsApi)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.5           |
| 17.x    | 10.0 | 2.0.5           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.WordsApi
```

## Quick Start

No registration call is needed. The package ships Umbraco composers, so the `AddComposers()` already in the default `Program.cs` picks the plugin up as soon as the package is referenced.

## Configuration

Add your RapidAPI key to `appsettings.json`:

```json
{
  "WordsApi": {
    "ApiKey": "<your-rapidapi-key>"
  }
}
```

The underlying `IWordsApiService` accepts `apiKey` as a method parameter — wire it from configuration in your calling code:

```csharp
var isNoun = await wordsApiService.IsNoun("elephant", configuration["WordsApi:ApiKey"]);
```

## Usage

### Noun Detection

```csharp
using SplatDev.Umbraco.Plugins.WordsApi.Services;

public class WordValidator(IWordsApiService wordsApi, IConfiguration config)
{
    public async Task<bool> ValidateTagAsync(string word)
    {
        var key = config["WordsApi:ApiKey"] ?? "";
        return await wordsApi.IsNoun(word, key);
    }
}
```

The service calls the RapidAPI WordsAPI endpoint (`wordsapiv1.p.rapidapi.com`), fetches definitions, and returns `true` if any definition has `partOfSpeech == "noun"`. Network errors or non-noun words return `false`.

## Rate Limits & Caching

WordsAPI free tier on RapidAPI is rate-limited (~2500 requests/day). Wrap calls with a local cache:

```csharp
// Cache noun-check results for 24 hours to avoid hitting rate limits
var cacheKey = $"wordsapi_noun_{word}";
if (!memoryCache.TryGetValue(cacheKey, out bool isNoun))
{
    isNoun = await wordsApi.IsNoun(word, apiKey);
    memoryCache.Set(cacheKey, isNoun, TimeSpan.FromHours(24));
}
```

## Models

| Model | Properties |
|-------|-----------|
| `WordDefinitions` | `Word` (string), `Definitions` (array of `DefinitionDetails`) |
| `DefinitionDetails` | `Definition` (string), `PartOfSpeech` (string) — e.g. "noun", "verb" |

## Changelog

### 2.0.5 — 2026-08-25

Documentation only, no code change. The README's Quick Start told you to call a registration method that does not exist in this package — following it produced a compile error on the first build. There is nothing to register: the package ships Umbraco composers and the `AddComposers()` already in the default `Program.cs` finds it. The Compatibility table also now shows the version actually being shipped instead of the one it was written at.

### 2.0.4 — 2026-08-24

Removes a dashboard screenshot that showed an error toast. It was captured against a site where this plugin's API was unreachable, so it advertised a broken dashboard. No screenshot is better than a misleading one; a replacement will be taken against a working install.

### 2.0.3 — 2026-08-24

Package metadata only: the listing now carries an icon and search tags, and the project and repository links point at the organisation that actually hosts this code. No code changes.

### 2.0.2 — 2026-08-24

This package now keeps a changelog. Earlier releases predate it and are not reconstructed here — consult the repository history for those. From this version on, every release records what changed for someone using it.

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)

## Architecture

This is a **headless API plugin** — no backoffice dashboard, property editors, or UI components. It operates as an API-calling service (RapidAPI WordsAPI), registered via DI composition.
