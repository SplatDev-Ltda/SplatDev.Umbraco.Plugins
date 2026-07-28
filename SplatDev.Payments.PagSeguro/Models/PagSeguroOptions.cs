namespace SplatDev.Payments.PagSeguro.Models
{
    public enum PagSeguroEnvironment
    {
        Sandbox,
        Production
    }

    public class PagSeguroOptions
    {
        public const string DefaultSection = "SplatDev:Payments:PagSeguro";

        public string Token { get; set; } = string.Empty;
        public PagSeguroEnvironment Environment { get; set; } = PagSeguroEnvironment.Sandbox;
        public string WebhookSecret { get; set; } = string.Empty;
        public int TimeoutSeconds { get; set; } = 30;

        public string BaseUrl => Environment == PagSeguroEnvironment.Production
            ? "https://api.pagseguro.com"
            : "https://sandbox.api.pagseguro.com";
    }
}
