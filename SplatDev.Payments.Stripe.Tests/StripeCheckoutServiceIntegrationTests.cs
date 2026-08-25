using Microsoft.Extensions.Options;
using SplatDev.Payments.Stripe.Services;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using WireMock.Server;
using Xunit;

namespace SplatDev.Payments.Stripe.Tests;

[Collection("StripeIntegration")]
public sealed class StripeCheckoutServiceIntegrationTests : IDisposable
{
    private readonly WireMockServer _server;
    private readonly HttpClient _httpClient;
    private readonly StripeSettings _settings;

    public StripeCheckoutServiceIntegrationTests()
    {
        _server = WireMockServer.Start();
        var baseUrl = _server.Urls[0];

        var handler = new HttpClientHandler();
        _httpClient = new HttpClient(handler) { BaseAddress = new Uri(baseUrl) };

        var stripeClient = new global::Stripe.StripeClient(
            apiKey: "sk_test_valid",
            httpClient: new global::Stripe.SystemNetHttpClient(_httpClient),
            apiBase: baseUrl);
        global::Stripe.StripeConfiguration.StripeClient = stripeClient;

        _settings = new StripeSettings
        {
            SecretKey = "sk_test_valid",
            PublishableKey = "pk_test_valid",
            SuccessUrl = "https://example.com/success",
            CancelUrl = "https://example.com/cancel"
        };
    }

    [Fact]
    public async Task CreateSession_LiveSuccess_ReturnsSessionUrl()
    {
        _server.Reset();
        _server
            .Given(Request.Create()
                .WithPath("/v1/checkout/sessions")
                .UsingPost())
            .RespondWith(Response.Create()
                .WithStatusCode(200)
                .WithHeader("Content-Type", "application/json")
                .WithBody(@"{""id"":""cs_test_abc"",""object"":""checkout.session"",""url"":""https://checkout.stripe.com/pay/cs_test_abc""}"));

        var options = Options.Create(_settings);
        var service = new StripeCheckoutService(options);

        var result = await service.CreateSessionAsync(new CheckoutRequest
        {
            Description = "Test Product",
            UnitAmount = 49.99m,
            Quantity = 2,
            Currency = "brl",
            CustomerEmail = "test@example.com",
            ClientReferenceId = "order-001",
            Metadata = new Dictionary<string, string> { ["order_id"] = "001" }
        });

        Assert.True(result.Success);
        Assert.Equal("https://checkout.stripe.com/pay/cs_test_abc", result.SessionUrl);
        Assert.Equal("cs_test_abc", result.SessionId);
        Assert.Null(result.ErrorMessage);
    }

    [Fact]
    public async Task CreateSession_StripeApiError_ReturnsErrorResult()
    {
        _server.Reset();
        _server
            .Given(Request.Create()
                .WithPath("/v1/checkout/sessions")
                .UsingPost())
            .RespondWith(Response.Create()
                .WithStatusCode(400)
                .WithHeader("Content-Type", "application/json")
                .WithBody(@"{""error"":{""type"":""invalid_request_error"",""message"":""Invalid currency""}}"));

        var options = Options.Create(_settings);
        var service = new StripeCheckoutService(options);

        var result = await service.CreateSessionAsync(new CheckoutRequest
        {
            Description = "Bad Request",
            UnitAmount = -5m
        });

        Assert.False(result.Success);
        Assert.NotNull(result.ErrorMessage);
    }

    [Fact]
    public async Task CreateSession_UnitAmountConvertsToCents()
    {
        _server.Reset();
        _server
            .Given(Request.Create()
                .WithPath("/v1/checkout/sessions")
                .UsingPost())
            .RespondWith(Response.Create()
                .WithStatusCode(200)
                .WithHeader("Content-Type", "application/json")
                .WithBody(@"{""id"":""cs_test_xyz"",""object"":""checkout.session"",""url"":""https://checkout.stripe.com/pay/cs_test_xyz""}"));

        var options = Options.Create(_settings);
        var service = new StripeCheckoutService(options);

        var result = await service.CreateSessionAsync(new CheckoutRequest
        {
            Description = "Cent Conversion",
            UnitAmount = 49.99m,
            Quantity = 1
        });

        Assert.True(result.Success);
        Assert.Equal("cs_test_xyz", result.SessionId);
    }

    [Fact]
    public async Task CreateSession_ApiKeyConfiguredInSettings()
    {
        _server.Reset();
        _server
            .Given(Request.Create()
                .WithPath("/v1/checkout/sessions")
                .UsingPost()
                .WithHeader("Authorization", "Bearer sk_test_valid*"))
            .RespondWith(Response.Create()
                .WithStatusCode(200)
                .WithHeader("Content-Type", "application/json")
                .WithBody(@"{""id"":""cs_test_auth"",""object"":""checkout.session"",""url"":""https://checkout.stripe.com/pay/cs_test_auth""}"));

        var options = Options.Create(_settings);
        var service = new StripeCheckoutService(options);

        var result = await service.CreateSessionAsync(new CheckoutRequest
        {
            Description = "Auth Test",
            UnitAmount = 10m
        });

        Assert.True(result.Success);
    }

    public void Dispose()
    {
        global::Stripe.StripeConfiguration.StripeClient = null;
        _server.Stop();
        _server.Dispose();
        _httpClient.Dispose();
    }
}
