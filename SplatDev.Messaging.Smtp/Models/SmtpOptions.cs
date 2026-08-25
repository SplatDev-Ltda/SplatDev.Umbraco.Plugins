namespace SplatDev.Messaging.Smtp.Models
{
    public class SmtpOptions
    {
        public const string DefaultSection = "SplatDev:Messaging:Smtp";

        public string Host { get; set; } = "";
        public int Port { get; set; } = 587;
        public bool EnableSsl { get; set; } = true;
        public string? User { get; set; }
        public string? Password { get; set; }
        public string? DefaultFromAddress { get; set; }
        public string? DefaultFromName { get; set; }
    }
}
