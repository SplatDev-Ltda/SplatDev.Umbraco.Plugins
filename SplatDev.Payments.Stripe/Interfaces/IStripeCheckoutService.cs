namespace SplatDev.Payments.Stripe.Interfaces;

public interface IStripeCheckoutService
{
    Task<CheckoutSessionResult> CreateSessionAsync(CheckoutRequest request, CancellationToken ct = default);
}
