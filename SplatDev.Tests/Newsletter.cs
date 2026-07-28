namespace SplatDev.Tests
{
    using SplatDev.Messaging.Newsletter.Events;
    using SplatDev.Messaging.Newsletter.Models;
    using Xunit;

    public class Newsletter
    {
        [Fact]
        public void OptInPolicy_EnumValues_AreCorrect()
        {
            Assert.Equal(0, (int)OptInPolicy.SingleOptIn);
            Assert.Equal(1, (int)OptInPolicy.DoubleOptIn);
        }

        [Fact]
        public void SubscriberStatus_EnumValues_AreCorrect()
        {
            Assert.Equal(0, (int)SubscriberStatus.Subscribed);
            Assert.Equal(1, (int)SubscriberStatus.Unsubscribed);
            Assert.Equal(2, (int)SubscriberStatus.Pending);
            Assert.Equal(3, (int)SubscriberStatus.Bounced);
            Assert.Equal(4, (int)SubscriberStatus.Complained);
        }

        [Fact]
        public void NewsletterList_Defaults_AreEmpty()
        {
            var list = new NewsletterList();

            Assert.Equal(string.Empty, list.Id);
            Assert.Equal(string.Empty, list.Name);
            Assert.Null(list.Description);
            Assert.Equal(OptInPolicy.SingleOptIn, list.OptInPolicy);
            Assert.Empty(list.CustomFields);
            Assert.Null(list.ProviderExternalId);
        }

        [Fact]
        public void NewsletterList_CanBeFullyPopulated()
        {
            var list = new NewsletterList
            {
                Id = "lst_001",
                Name = "Monthly Digest",
                Description = "Our monthly newsletter",
                OptInPolicy = OptInPolicy.DoubleOptIn,
                CustomFields = new Dictionary<string, string> { ["industry"] = "tech" },
                ProviderExternalId = "mailchimp-abc123",
            };

            Assert.Equal("lst_001", list.Id);
            Assert.Equal("Monthly Digest", list.Name);
            Assert.Equal("Our monthly newsletter", list.Description);
            Assert.Equal(OptInPolicy.DoubleOptIn, list.OptInPolicy);
            Assert.Single(list.CustomFields);
            Assert.Equal("tech", list.CustomFields["industry"]);
            Assert.Equal("mailchimp-abc123", list.ProviderExternalId);
        }

        [Fact]
        public void NewsletterSubscriber_Defaults_AreEmpty()
        {
            var sub = new NewsletterSubscriber();

            Assert.Equal(string.Empty, sub.Id);
            Assert.Equal(string.Empty, sub.Email);
            Assert.Null(sub.Name);
            Assert.Empty(sub.CustomFields);
            Assert.Equal(SubscriberStatus.Pending, sub.Status);
            Assert.Null(sub.SubscribedAt);
            Assert.Null(sub.UnsubscribedAt);
            Assert.Equal(string.Empty, sub.ListId);
        }

        [Fact]
        public void NewsletterSubscriber_CanBeFullyPopulated()
        {
            var now = DateTime.UtcNow;
            var sub = new NewsletterSubscriber
            {
                Id = "sub_001",
                Email = "test@example.com",
                Name = "Test User",
                CustomFields = new Dictionary<string, string> { ["company"] = "Acme" },
                Status = SubscriberStatus.Subscribed,
                SubscribedAt = now,
                ListId = "lst_001",
            };

            Assert.Equal("sub_001", sub.Id);
            Assert.Equal("test@example.com", sub.Email);
            Assert.Equal("Test User", sub.Name);
            Assert.Equal("Acme", sub.CustomFields["company"]);
            Assert.Equal(SubscriberStatus.Subscribed, sub.Status);
            Assert.Equal(now, sub.SubscribedAt);
            Assert.Equal("lst_001", sub.ListId);
            Assert.Null(sub.UnsubscribedAt);
        }

        [Fact]
        public void NewsletterCampaign_Defaults_AreEmpty()
        {
            var campaign = new NewsletterCampaign();

            Assert.Equal(string.Empty, campaign.Id);
            Assert.Equal(string.Empty, campaign.ListId);
            Assert.Equal(string.Empty, campaign.Subject);
            Assert.Equal(string.Empty, campaign.FromName);
            Assert.Equal(string.Empty, campaign.FromEmail);
            Assert.Equal(string.Empty, campaign.BodyHtml);
            Assert.Null(campaign.BodyPlain);
            Assert.Null(campaign.ScheduledAt);
            Assert.True(campaign.TrackOpens);
            Assert.True(campaign.TrackClicks);
            Assert.Null(campaign.TemplateId);
            Assert.Null(campaign.ProviderCampaignId);
        }

        [Fact]
        public void NewsletterCampaign_TrackingCanBeDisabled()
        {
            var campaign = new NewsletterCampaign
            {
                Subject = "Hello",
                BodyHtml = "<p>Hi</p>",
                TrackOpens = false,
                TrackClicks = false,
            };

            Assert.False(campaign.TrackOpens);
            Assert.False(campaign.TrackClicks);
        }

        [Fact]
        public void CampaignStats_OpenRate_CalculatesCorrectly()
        {
            var stats = new CampaignStats
            {
                SentCount = 100,
                OpenCount = 45,
                ClickCount = 20,
                BounceCount = 2,
            };

            Assert.Equal(0.45m, stats.OpenRate);
            Assert.Equal(0.20m, stats.ClickRate);
        }

        [Fact]
        public void CampaignStats_OpenRate_ZeroWhenNoSent()
        {
            var stats = new CampaignStats
            {
                SentCount = 0,
                OpenCount = 45,
            };

            Assert.Equal(0m, stats.OpenRate);
            Assert.Equal(0m, stats.ClickRate);
        }

        [Fact]
        public void NewsletterEventArgs_Defaults_ArePopulated()
        {
            var args = new NewsletterEventArgs();

            Assert.Equal(string.Empty, args.ListId);
            Assert.Equal(string.Empty, args.Email);
            Assert.Null(args.SubscriberId);
            Assert.Null(args.CampaignId);
            Assert.NotEqual(default, args.Timestamp);
            Assert.Empty(args.Metadata);
        }

        [Fact]
        public void SubscribedEventArgs_InheritsBaseClass()
        {
            var args = new SubscribedEventArgs
            {
                ListId = "lst_001",
                Email = "user@example.com",
                SubscriberId = "sub_001",
            };

            Assert.IsType<SubscribedEventArgs>(args);
            Assert.IsAssignableFrom<NewsletterEventArgs>(args);
            Assert.Equal("lst_001", args.ListId);
            Assert.Equal("user@example.com", args.Email);
        }

        [Fact]
        public void BouncedEventArgs_HasBounceReason()
        {
            var args = new BouncedEventArgs
            {
                Email = "bounce@example.com",
                BounceReason = "mailbox full",
            };

            Assert.Equal("mailbox full", args.BounceReason);
        }

        [Fact]
        public void ClickedEventArgs_HasClickedUrl()
        {
            var args = new ClickedEventArgs
            {
                Email = "clicker@example.com",
                ClickedUrl = "https://example.com/product",
            };

            Assert.Equal("https://example.com/product", args.ClickedUrl);
        }

        [Fact]
        public void EventArgs_Metadata_CanStoreExtraData()
        {
            var args = new OpenedEventArgs
            {
                Email = "reader@example.com",
                Metadata = new Dictionary<string, string>
                {
                    ["userAgent"] = "Mozilla/5.0",
                    ["ip"] = "192.168.1.1",
                },
            };

            Assert.Equal(2, args.Metadata.Count);
            Assert.Equal("Mozilla/5.0", args.Metadata["userAgent"]);
        }
    }
}
