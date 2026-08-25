using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using SplatDev.Payments.Stripe.Interfaces;
using SplatDev.Payments.Stripe.Services;
using Xunit;

namespace SplatDev.Payments.Stripe.Tests;

[Collection("StripeIntegration")]
public class StripeWebhookHandlerEventDispatchTests
{
    private const string ValidSecret = "whsec_test_webhook_secret_key_32chars";

    [Fact]
    public async Task UnknownEventType_ReturnsSuccessWithUnknown()
    {
        var (handler, repoMock) = CreateHandler();
        var (json, sig) = GenerateAndSign(ValidSecret, EventJson("evt_unknown_999", "invoice.paid",
            @"{""object"":{}}"));

        repoMock.Setup(r => r.IsEventProcessedAsync("evt_unknown_999", It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

        var result = await handler.HandleEventAsync(json, sig);

        Assert.True(result.Success);
        Assert.Equal(WebhookEventType.Unknown, result.EventType);
    }

    [Fact]
    public async Task CheckoutSessionCompleted_PersistsRecord()
    {
        var (handler, repoMock) = CreateHandler();
        var (json, sig) = GenerateAndSign(ValidSecret, EventJson("evt_checkout_001",
            "checkout.session.completed",
            @"{""object"":{
                ""id"":""cs_abc123"",
                ""object"":""checkout.session"",
                ""payment_intent"":""pi_xyz789"",
                ""amount_total"":15000,
                ""currency"":""brl"",
                ""payment_status"":""paid"",
                ""customer_details"":{""email"":""cliente@dermainova.com.br""},
                ""client_reference_id"":""order-di-001""
            }}"));

        repoMock.Setup(r => r.IsEventProcessedAsync("evt_checkout_001", It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

        var result = await handler.HandleEventAsync(json, sig);

        Assert.True(result.Success);
        Assert.Equal(WebhookEventType.CheckoutSessionCompleted, result.EventType);
        repoMock.Verify(r => r.MarkEventProcessedAsync("evt_checkout_001",
            It.Is<PaymentRecord>(p =>
                p.CheckoutSessionId == "cs_abc123" &&
                p.PaymentIntentId == "pi_xyz789" &&
                p.Currency == "brl" &&
                p.Amount == 15000 &&
                p.Status == "paid" &&
                p.CustomerEmail == "cliente@dermainova.com.br" &&
                p.ClientReferenceId == "order-di-001"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task PaymentIntentSucceeded_PersistsRecord()
    {
        var (handler, repoMock) = CreateHandler();
        var (json, sig) = GenerateAndSign(ValidSecret, EventJson("evt_pi_002",
            "payment_intent.succeeded",
            @"{""object"":{
                ""id"":""pi_direct_456"",
                ""object"":""payment_intent"",
                ""amount"":29990,
                ""currency"":""usd"",
                ""status"":""succeeded"",
                ""receipt_email"":""pay@exemplo.com""
            }}"));

        repoMock.Setup(r => r.IsEventProcessedAsync("evt_pi_002", It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

        var result = await handler.HandleEventAsync(json, sig);

        Assert.True(result.Success);
        Assert.Equal(WebhookEventType.PaymentIntentSucceeded, result.EventType);
        repoMock.Verify(r => r.MarkEventProcessedAsync("evt_pi_002",
            It.Is<PaymentRecord>(p =>
                p.PaymentIntentId == "pi_direct_456" &&
                p.Currency == "usd" &&
                p.Amount == 29990 &&
                p.Status == "succeeded" &&
                p.CustomerEmail == "pay@exemplo.com"),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task PaymentIntentFailed_ReturnsSuccessWithFailedType()
    {
        var (handler, repoMock) = CreateHandler();
        var (json, sig) = GenerateAndSign(ValidSecret, EventJson("evt_pi_fail_003",
            "payment_intent.payment_failed",
            @"{""object"":{
                ""id"":""pi_failed_789"",
                ""object"":""payment_intent"",
                ""amount"":5000,
                ""currency"":""brl"",
                ""status"":""requires_payment_method""
            }}"));

        repoMock.Setup(r => r.IsEventProcessedAsync("evt_pi_fail_003", It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

        var result = await handler.HandleEventAsync(json, sig);

        Assert.True(result.Success);
        Assert.Equal(WebhookEventType.PaymentIntentFailed, result.EventType);
        repoMock.Verify(r => r.MarkEventProcessedAsync(It.IsAny<string>(), It.IsAny<PaymentRecord>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task AlreadyProcessedEvent_SkipsIdempotently()
    {
        var (handler, repoMock) = CreateHandler();
        var (json, sig) = GenerateAndSign(ValidSecret, EventJson("evt_duplicate_004",
            "checkout.session.completed",
            @"{""object"":{
                ""id"":""cs_dup"",
                ""object"":""checkout.session"",
                ""amount_total"":5000,
                ""currency"":""brl"",
                ""payment_status"":""paid""
            }}"));

        repoMock.Setup(r => r.IsEventProcessedAsync("evt_duplicate_004", It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

        var result = await handler.HandleEventAsync(json, sig);

        Assert.True(result.Success);
        repoMock.Verify(r => r.MarkEventProcessedAsync(It.IsAny<string>(), It.IsAny<PaymentRecord>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task EmptyJson_ReturnsError()
    {
        var (handler, _) = CreateHandler();

        var result = await handler.HandleEventAsync("", "t=123,v1=sig");

        Assert.False(result.Success);
    }

    [Fact]
    public async Task MissingSignature_ReturnsError()
    {
        var (handler, _) = CreateHandler();

        var result = await handler.HandleEventAsync("{}", "");

        Assert.False(result.Success);
    }

    private static (StripeWebhookHandler handler, Mock<IPaymentIntentRepository> repo) CreateHandler()
    {
        var settings = Options.Create(new StripeSettings
        {
            WebhookSigningSecret = ValidSecret,
            SecretKey = "sk_test_dummy"
        });
        var repoMock = new Mock<IPaymentIntentRepository>();
        var loggerMock = new Mock<ILogger<StripeWebhookHandler>>();
        return (new StripeWebhookHandler(settings, repoMock.Object, loggerMock.Object), repoMock);
    }

    private static string EventJson(string eventId, string eventType, string dataObjectJson)
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        return $$"""
        {
            "id": "{{eventId}}",
            "object": "event",
            "api_version": "2023-10-16",
            "created": {{now}},
            "data": {DATA_PLACEHOLDER},
            "livemode": false,
            "pending_webhooks": 1,
            "type": "{{eventType}}",
            "request": null
        }
        """.Replace("{DATA_PLACEHOLDER}", dataObjectJson);
    }

    private static (string json, string signature) GenerateAndSign(string secret, string eventJson)
    {
        var compactJson = System.Text.Json.JsonSerializer.Serialize(
            System.Text.Json.JsonSerializer.Deserialize<object>(eventJson));

        var unixTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();

        var payload = $"{unixTimestamp}.{compactJson}";

        using var hmac = new System.Security.Cryptography.HMACSHA256(
            System.Text.Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(payload));
        var sig = BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();

        return (compactJson, $"t={unixTimestamp},v1={sig}");
    }
}
