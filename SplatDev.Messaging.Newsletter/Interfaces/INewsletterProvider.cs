namespace SplatDev.Messaging.Newsletter.Interfaces;

using SplatDev.Messaging.Newsletter.Events;
using SplatDev.Messaging.Newsletter.Models;

public interface INewsletterProvider
{
    Task<NewsletterList> CreateListAsync(NewsletterList list, CancellationToken cancellationToken = default);

    Task<NewsletterList?> GetListAsync(string listId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NewsletterList>> GetListsAsync(CancellationToken cancellationToken = default);

    Task<NewsletterList> UpdateListAsync(NewsletterList list, CancellationToken cancellationToken = default);

    Task<bool> DeleteListAsync(string listId, CancellationToken cancellationToken = default);

    Task<NewsletterSubscriber> SubscribeAsync(
        string listId, string email, string? name = null,
        Dictionary<string, string>? customFields = null,
        CancellationToken cancellationToken = default);

    Task<bool> UnsubscribeAsync(
        string listId, string email,
        CancellationToken cancellationToken = default);

    Task<NewsletterSubscriber?> GetSubscriberAsync(
        string listId, string email,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<NewsletterSubscriber>> GetSubscribersAsync(
        string listId, SubscriberStatus? status = null,
        CancellationToken cancellationToken = default);

    Task<NewsletterCampaign> CreateCampaignAsync(
        NewsletterCampaign campaign, CancellationToken cancellationToken = default);

    Task<NewsletterCampaign?> GetCampaignAsync(
        string campaignId, CancellationToken cancellationToken = default);

    Task<NewsletterCampaign> SendCampaignAsync(
        string campaignId, CancellationToken cancellationToken = default);

    Task<CampaignStats> GetCampaignStatsAsync(
        string campaignId, CancellationToken cancellationToken = default);

    event EventHandler<SubscribedEventArgs>? OnSubscribed;

    event EventHandler<UnsubscribedEventArgs>? OnUnsubscribed;

    event EventHandler<BouncedEventArgs>? OnBounced;

    event EventHandler<OpenedEventArgs>? OnOpened;

    event EventHandler<ClickedEventArgs>? OnClicked;
}
