using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using SplatDev.Payments.Stripe.Interfaces;
using SplatDev.Payments.Stripe.Services;
using Xunit;

namespace SplatDev.Payments.Stripe.Tests;

[Collection("StripeIntegration")]
public class StripeWebhookHandlerTests
{
    [Fact]
    public async Task DevMock_SkipsProcessing_ReturnsSuccess()
    {
        var settings = Options.Create(new StripeSettings { DevMock = true });
        var repoMock = new Mock<IPaymentIntentRepository>();
        var loggerMock = new Mock<ILogger<StripeWebhookHandler>>();
        var handler = new StripeWebhookHandler(settings, repoMock.Object, loggerMock.Object);

        var result = await handler.HandleEventAsync("{}", "sig_header");

        Assert.True(result.Success);
        Assert.Equal(WebhookEventType.CheckoutSessionCompleted, result.EventType);
        repoMock.Verify(r => r.IsEventProcessedAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task MissingSignature_ReturnsError()
    {
        var settings = Options.Create(new StripeSettings());
        var repoMock = new Mock<IPaymentIntentRepository>();
        var loggerMock = new Mock<ILogger<StripeWebhookHandler>>();
        var handler = new StripeWebhookHandler(settings, repoMock.Object, loggerMock.Object);

        var result = await handler.HandleEventAsync("{}", "");

        Assert.False(result.Success);
        Assert.Contains("Missing", result.ErrorMessage);
    }

    [Fact]
    public async Task EmptyJson_ReturnsError()
    {
        var settings = Options.Create(new StripeSettings
        {
            WebhookSigningSecret = "whsec_test"
        });
        var repoMock = new Mock<IPaymentIntentRepository>();
        var loggerMock = new Mock<ILogger<StripeWebhookHandler>>();
        var handler = new StripeWebhookHandler(settings, repoMock.Object, loggerMock.Object);

        var result = await handler.HandleEventAsync("", "t=123,v1=sig");

        Assert.False(result.Success);
    }

    [Fact]
    public async Task InvalidSignature_ReturnsError()
    {
        var settings = Options.Create(new StripeSettings
        {
            WebhookSigningSecret = "whsec_invalid"
        });
        var repoMock = new Mock<IPaymentIntentRepository>();
        repoMock.Setup(r => r.IsEventProcessedAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
        var loggerMock = new Mock<ILogger<StripeWebhookHandler>>();
        var handler = new StripeWebhookHandler(settings, repoMock.Object, loggerMock.Object);

        var result = await handler.HandleEventAsync("{}", "t=123,v1=invalid_sig");

        Assert.False(result.Success);
    }
}
