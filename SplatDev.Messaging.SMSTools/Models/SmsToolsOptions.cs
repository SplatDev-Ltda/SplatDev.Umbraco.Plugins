namespace SplatDev.Messaging.SMSTools.Models
{
    public class SmsToolsOptions
    {
        public const string DefaultSection = "SplatDev:Messaging:SMSTools";

        public string ApiKey { get; set; } = string.Empty;
        public string BaseUrl { get; set; } = "https://api.smstools24.com";
        public string? DefaultFrom { get; set; }
    }
}
