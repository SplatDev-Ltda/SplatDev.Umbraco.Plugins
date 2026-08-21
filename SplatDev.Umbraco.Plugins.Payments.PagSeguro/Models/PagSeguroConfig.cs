namespace SplatDev.Umbraco.Plugins.Payments.PagSeguro.Models;

public class PagSeguroConfig
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public bool Sandbox { get; set; }
}
