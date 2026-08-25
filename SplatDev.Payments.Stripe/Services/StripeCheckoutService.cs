using Microsoft.Extensions.Options;
using SplatDev.Payments.Stripe.Interfaces;

namespace SplatDev.Payments.Stripe.Services;

public sealed class StripeCheckoutService(
    IOptions<StripeSettings> options) : IStripeCheckoutService
{
    private readonly StripeSettings _settings = options.Value;

    public async Task<CheckoutSessionResult> CreateSessionAsync(CheckoutRequest request, CancellationToken ct = default)
    {
        if (_settings.DevMock)
            return new CheckoutSessionResult(true, SessionUrl: "https://checkout.stripe.com/mock-pay/test_cs_12345", SessionId: "cs_mock_12345");

        try
        {
            global::Stripe.StripeConfiguration.ApiKey = _settings.SecretKey;

            var unitAmountCents = (long)(request.UnitAmount * 100);

            var options = new global::Stripe.Checkout.SessionCreateOptions
            {
                PaymentMethodTypes = ["card"],
                Mode = "payment",
                SuccessUrl = _settings.SuccessUrl,
                CancelUrl = _settings.CancelUrl,
                CustomerEmail = request.CustomerEmail,
                ClientReferenceId = request.ClientReferenceId,
                LineItems =
                [
                    new global::Stripe.Checkout.SessionLineItemOptions
                    {
                        PriceData = new global::Stripe.Checkout.SessionLineItemPriceDataOptions
                        {
                            Currency = request.Currency,
                            UnitAmount = unitAmountCents,
                            ProductData = new global::Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                            {
                                Name = request.Description
                            }
                        },
                        Quantity = request.Quantity
                    }
                ],
                Metadata = request.Metadata
            };

            var service = new global::Stripe.Checkout.SessionService();
            var session = await service.CreateAsync(options, cancellationToken: ct);

            return new CheckoutSessionResult(true, SessionUrl: session.Url, SessionId: session.Id);
        }
        catch (global::Stripe.StripeException ex)
        {
            return new CheckoutSessionResult(false, ErrorMessage: $"Stripe error: {ex.StripeError?.Message ?? ex.Message}");
        }
    }
}
