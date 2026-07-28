namespace SplatDev.Payments.Getnet;

public sealed class GetnetApiOptions
{
    public string BaseUrl { get; set; } = "https://api-sandbox.getnet.com.br";
    public string TokenPath { get; set; } = "/auth/oauth/v2/token";
    public string SellerId { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public bool EnableDevelopmentMockWithoutCredentials { get; set; }

    public string PixPaymentPath { get; set; } = "/v1/payment/qrcode/pix";
    public string BoletoPaymentPath { get; set; } = "/v1/payment/boleto";
    public string PaymentLinkPath { get; set; } = "/v1/payment-link";
    public string PaymentStatusPath { get; set; } = "/v1/payment/credit/";
    public string PaymentsListPath { get; set; } = "/v1/payment/credit";
    public string PaymentsFromDateQueryParam { get; set; } = "start_date";
    public string PaymentsToDateQueryParam { get; set; } = "end_date";
}
