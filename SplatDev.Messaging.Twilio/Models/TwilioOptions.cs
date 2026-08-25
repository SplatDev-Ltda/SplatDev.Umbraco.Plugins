namespace SplatDev.Messaging.Twilio.Models
{
    public class TwilioOptions
    {
        public const string DefaultSection = "SplatDev:Messaging:Twilio";

        public string AccountSid { get; set; } = "";
        public string AuthToken { get; set; } = "";
        public string? DefaultFrom { get; set; }
    }
}
