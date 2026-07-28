namespace SplatDev.Payments.Stripe.Models
{
    public class StripeOptions
    {
        public const string DefaultSection = "SplatDev:Payments:Stripe";

        public string ApiKey { get; set; } = string.Empty;
        public string WebhookSecret { get; set; } = string.Empty;
        public string PublishableKey { get; set; } = string.Empty;
        public string ApiVersion { get; set; } = "2024-12-18.acacia";
    }
}
