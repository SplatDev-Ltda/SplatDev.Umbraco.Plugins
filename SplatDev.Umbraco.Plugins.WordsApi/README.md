# WordsApi

Umbraco Words API plugin — validate English word classification (noun detection) using the WordsAPI service via RapidAPI. Supports Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.WordsApi.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.WordsApi)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.0           |
| 17.x    | 10.0 | 2.0.0           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.WordsApi
```

## Quick Start

Register in `Program.cs`:

```csharp
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddWordsApi()   // <-- add this
    .Build();
```

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

## License

MIT © [SplatDev](https://github.com/splatdevtech)

---

[Feedback](mailto:feedback@splatdev.com)
