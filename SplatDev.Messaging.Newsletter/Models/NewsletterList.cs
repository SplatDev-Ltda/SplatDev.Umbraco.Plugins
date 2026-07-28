namespace SplatDev.Messaging.Newsletter.Models;

public sealed class NewsletterList
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public OptInPolicy OptInPolicy { get; set; } = OptInPolicy.SingleOptIn;

    public Dictionary<string, string> CustomFields { get; set; } = [];

    public string? ProviderExternalId { get; set; }
}
