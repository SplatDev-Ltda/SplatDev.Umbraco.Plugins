namespace SplatDev.Payments.PagSeguro.Models
{
    using System;
    using System.Collections.Generic;
    using System.Text.Json.Serialization;

    public class PagSeguroOrderRequest
    {
        [JsonPropertyName("reference_id")]
        public string ReferenceId { get; set; } = string.Empty;

        [JsonPropertyName("customer")]
        public PagSeguroCustomer Customer { get; set; } = new();

        [JsonPropertyName("items")]
        public List<PagSeguroItem> Items { get; set; } = new();

        [JsonPropertyName("shipping")]
        public PagSeguroShipping? Shipping { get; set; }

        [JsonPropertyName("charges")]
        public List<PagSeguroCharge> Charges { get; set; } = new();

        [JsonPropertyName("notification_urls")]
        public List<string>? NotificationUrls { get; set; }
    }

    public class PagSeguroCustomer
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("tax_id")]
        public string TaxId { get; set; } = string.Empty;

        [JsonPropertyName("phones")]
        public List<PagSeguroPhone>? Phones { get; set; }
    }

    public class PagSeguroPhone
    {
        [JsonPropertyName("country")]
        public string Country { get; set; } = "55";

        [JsonPropertyName("area")]
        public string Area { get; set; } = string.Empty;

        [JsonPropertyName("number")]
        public string Number { get; set; } = string.Empty;

        [JsonPropertyName("type")]
        public string Type { get; set; } = "MOBILE";
    }

    public class PagSeguroItem
    {
        [JsonPropertyName("reference_id")]
        public string ReferenceId { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("quantity")]
        public int Quantity { get; set; } = 1;

        [JsonPropertyName("unit_amount")]
        public int UnitAmount { get; set; }
    }

    public class PagSeguroShipping
    {
        [JsonPropertyName("address")]
        public PagSeguroAddress Address { get; set; } = new();
    }

    public class PagSeguroAddress
    {
        [JsonPropertyName("street")]
        public string Street { get; set; } = string.Empty;

        [JsonPropertyName("number")]
        public string Number { get; set; } = string.Empty;

        [JsonPropertyName("complement")]
        public string? Complement { get; set; }

        [JsonPropertyName("locality")]
        public string Locality { get; set; } = string.Empty;

        [JsonPropertyName("city")]
        public string City { get; set; } = string.Empty;

        [JsonPropertyName("region_code")]
        public string RegionCode { get; set; } = string.Empty;

        [JsonPropertyName("country")]
        public string Country { get; set; } = "BRA";

        [JsonPropertyName("postal_code")]
        public string PostalCode { get; set; } = string.Empty;
    }

    public class PagSeguroCharge
    {
        [JsonPropertyName("reference_id")]
        public string ReferenceId { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("amount")]
        public PagSeguroAmount Amount { get; set; } = new();

        [JsonPropertyName("payment_method")]
        public PagSeguroPaymentMethod PaymentMethod { get; set; } = new();
    }

    public class PagSeguroAmount
    {
        [JsonPropertyName("value")]
        public int Value { get; set; }

        [JsonPropertyName("currency")]
        public string Currency { get; set; } = "BRL";
    }

    public class PagSeguroPaymentMethod
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("installments")]
        public int? Installments { get; set; }

        [JsonPropertyName("capture")]
        public bool? Capture { get; set; }

        [JsonPropertyName("card")]
        public PagSeguroCard? Card { get; set; }

        [JsonPropertyName("boleto")]
        public PagSeguroBoleto? Boleto { get; set; }
    }

    public class PagSeguroCard
    {
        [JsonPropertyName("number")]
        public string Number { get; set; } = string.Empty;

        [JsonPropertyName("exp_month")]
        public string ExpMonth { get; set; } = string.Empty;

        [JsonPropertyName("exp_year")]
        public string ExpYear { get; set; } = string.Empty;

        [JsonPropertyName("security_code")]
        public string SecurityCode { get; set; } = string.Empty;

        [JsonPropertyName("holder")]
        public PagSeguroCardHolder Holder { get; set; } = new();

        [JsonPropertyName("store")]
        public bool Store { get; set; }
    }

    public class PagSeguroCardHolder
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("tax_id")]
        public string TaxId { get; set; } = string.Empty;
    }

    public class PagSeguroBoleto
    {
        [JsonPropertyName("due_date")]
        public string DueDate { get; set; } = string.Empty;

        [JsonPropertyName("instruction_lines")]
        public PagSeguroBoletoInstructions InstructionLines { get; set; } = new();

        [JsonPropertyName("holder")]
        public PagSeguroBoletoHolder Holder { get; set; } = new();
    }

    public class PagSeguroBoletoInstructions
    {
        [JsonPropertyName("line_1")]
        public string Line1 { get; set; } = string.Empty;

        [JsonPropertyName("line_2")]
        public string Line2 { get; set; } = string.Empty;
    }

    public class PagSeguroBoletoHolder
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("tax_id")]
        public string TaxId { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("address")]
        public PagSeguroAddress Address { get; set; } = new();
    }

    public class PagSeguroOrderResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("reference_id")]
        public string ReferenceId { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("charges")]
        public List<PagSeguroChargeResponse> Charges { get; set; } = new();

        [JsonPropertyName("links")]
        public List<PagSeguroLink> Links { get; set; } = new();
    }

    public class PagSeguroChargeResponse
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("amount")]
        public PagSeguroAmount Amount { get; set; } = new();

        [JsonPropertyName("payment_response")]
        public PagSeguroPaymentResponse? PaymentResponse { get; set; }

        [JsonPropertyName("links")]
        public List<PagSeguroLink> Links { get; set; } = new();
    }

    public class PagSeguroPaymentResponse
    {
        [JsonPropertyName("code")]
        public string? Code { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("reference")]
        public string? Reference { get; set; }

        [JsonPropertyName("raw_data")]
        public PagSeguroRawData? RawData { get; set; }
    }

    public class PagSeguroRawData
    {
        [JsonPropertyName("barecode")]
        public string? Barcode { get; set; }

        [JsonPropertyName("qr_code")]
        public string? QrCode { get; set; }

        [JsonPropertyName("pdf")]
        public string? Pdf { get; set; }

        [JsonPropertyName("due_date")]
        public string? DueDate { get; set; }
    }

    public class PagSeguroLink
    {
        [JsonPropertyName("rel")]
        public string Rel { get; set; } = string.Empty;

        [JsonPropertyName("href")]
        public string Href { get; set; } = string.Empty;

        [JsonPropertyName("media")]
        public string Media { get; set; } = string.Empty;

        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;
    }

    public class PagSeguroWebhookPayload
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("data")]
        public PagSeguroWebhookData Data { get; set; } = new();
    }

    public class PagSeguroWebhookData
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("code")]
        public string? Code { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }
    }
}
