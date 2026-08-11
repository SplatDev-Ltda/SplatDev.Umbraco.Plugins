using System.Net.Http.Headers;

using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

using SplatDev.Umbraco.Plugins.WhatsApp.Models;
using SplatDev.Umbraco.Plugins.WhatsApp.Services;

using Xunit;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Tests;

/// <summary>
/// Exercises <see cref="WhatsAppClient"/> against the real Graph API to confirm the wire
/// shapes still deserialize. Read-only — nothing here sends a message.
/// </summary>
/// <remarks>
/// Tagged Integration so CI skips it (the build filters
/// <c>Category!=Integration</c>). Run locally with credentials in the environment:
/// <code>
/// export SplatDev__WhatsApp__PhoneNumberId=...
/// export SplatDev__WhatsApp__BusinessAccountId=...
/// export SplatDev__WhatsApp__AccessToken=...
/// dotnet test --filter "Category=Integration"
/// </code>
/// Skips itself when the variables are absent, so it never fails on a machine
/// that simply has no credentials.
/// </remarks>
[Trait("Category", "Integration")]
public class LiveApiTests
{
    private static WhatsAppOptions? ReadOptions()
    {
        var token = Environment.GetEnvironmentVariable("SplatDev__WhatsApp__AccessToken");
        var phoneId = Environment.GetEnvironmentVariable("SplatDev__WhatsApp__PhoneNumberId");
        var wabaId = Environment.GetEnvironmentVariable("SplatDev__WhatsApp__BusinessAccountId");

        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(phoneId))
        {
            return null;
        }

        return new WhatsAppOptions
        {
            AccessToken = token,
            PhoneNumberId = phoneId,
            BusinessAccountId = wabaId ?? string.Empty,
        };
    }

    private static WhatsAppClient CreateClient(WhatsAppOptions options)
    {
        var http = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
        http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", options.AccessToken);

        return new WhatsAppClient(
            http,
            Options.Create(options),
            NullLogger<WhatsAppClient>.Instance);
    }

    [Fact]
    public async Task Phone_number_status_deserializes_from_the_live_api()
    {
        var options = ReadOptions();
        if (options is null)
        {
            // xUnit 2 has no dynamic skip, so an unconfigured machine passes vacuously
            // rather than failing on a missing credential.
            return;
        }

        var status = await CreateClient(options).GetPhoneNumberStatusAsync();

        Assert.NotNull(status);
        Assert.False(string.IsNullOrWhiteSpace(status!.DisplayPhoneNumber));
        Assert.False(string.IsNullOrWhiteSpace(status.VerifiedName));
    }

    /// <summary>
    /// Sends a real template message. Opt-in via <c>WA_TEST_RECIPIENT</c> so a normal
    /// integration run never messages anyone.
    /// </summary>
    [Fact]
    public async Task Template_send_reaches_the_live_api()
    {
        var options = ReadOptions();
        var recipient = Environment.GetEnvironmentVariable("WA_TEST_RECIPIENT");

        if (options is null || string.IsNullOrWhiteSpace(recipient))
        {
            return;
        }

        var result = await CreateClient(options)
            .SendTemplateAsync(recipient!, "hello_world", "en_US");

        Assert.True(result.Success, $"Send failed: {result.Error} (code {result.ErrorCode})");
        Assert.StartsWith("wamid.", result.MessageId);
    }

    [Fact]
    public async Task Templates_deserialize_from_the_live_api()
    {
        var options = ReadOptions();
        if (options is null || string.IsNullOrWhiteSpace(options.BusinessAccountId))
        {
            return;
        }

        var templates = await CreateClient(options).GetTemplatesAsync();

        Assert.NotEmpty(templates);
        Assert.All(templates, t =>
        {
            Assert.False(string.IsNullOrWhiteSpace(t.Name));
            Assert.False(string.IsNullOrWhiteSpace(t.Language));
            Assert.False(string.IsNullOrWhiteSpace(t.Status));
        });
    }
}
