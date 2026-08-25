using Microsoft.Extensions.Options;
using SplatDev.Payments.Stripe.Interfaces;
using SplatDev.Payments.Stripe.Services;
using Xunit;

namespace SplatDev.Payments.Stripe.Tests;

[Collection("StripeIntegration")]
public class StripeCheckoutServiceTests
{
    [Fact]
    public async Task DevMock_ReturnsMockSessionUrl()
    {
        var settings = Options.Create(new StripeSettings { DevMock = true });
        var service = new StripeCheckoutService(settings);

        var result = await service.CreateSessionAsync(new CheckoutRequest
        {
            Description = "Test Product",
            UnitAmount = 29.99m
        });

        Assert.True(result.Success);
        Assert.Contains("mock", result.SessionUrl!);
        Assert.NotNull(result.SessionId);
    }

    [Fact]
    public async Task InvalidCheckout_NoApiKey_ThrowsGracefully()
    {
        var settings = Options.Create(new StripeSettings());
        var service = new StripeCheckoutService(settings);

        var result = await service.CreateSessionAsync(new CheckoutRequest
        {
            Description = "Test",
            UnitAmount = 10m
        });

        Assert.False(result.Success);
        Assert.NotNull(result.ErrorMessage);
    }
}
