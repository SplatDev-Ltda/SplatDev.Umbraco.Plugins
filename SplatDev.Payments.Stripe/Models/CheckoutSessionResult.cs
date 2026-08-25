namespace SplatDev.Payments.Stripe;

public record CheckoutSessionResult(
    bool Success,
    string? SessionUrl = null,
    string? SessionId = null,
    string? ErrorMessage = null);
