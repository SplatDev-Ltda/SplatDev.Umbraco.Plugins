namespace SplatDev.Umbraco.Plugins.Payments.MercadoPago.Models;

public class MercadoPagoConfig
{
    public string AccessToken { get; set; } = string.Empty;
    public string PublicKey { get; set; } = string.Empty;
    public bool Sandbox { get; set; }
}
