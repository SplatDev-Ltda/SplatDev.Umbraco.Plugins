namespace SplatDev.Messaging.ClickSend.Models;

public sealed class ClickSendOptions
{
    public string Username { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string From { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://rest.clicksend.com";
}
