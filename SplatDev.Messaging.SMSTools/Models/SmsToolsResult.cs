namespace SplatDev.Messaging.SMSTools.Models
{
    public class SmsToolsResult
    {
        public bool Success { get; set; }

        public string? MessageId { get; set; }

        public string? Status { get; set; }

        public string? Message { get; set; }

        public string? RawResponse { get; set; }
    }
}
