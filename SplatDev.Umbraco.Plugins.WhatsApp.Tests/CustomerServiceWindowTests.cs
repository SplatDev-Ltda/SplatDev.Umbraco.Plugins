using SplatDev.Umbraco.Plugins.WhatsApp.Services;

using Xunit;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Tests;

/// <summary>
/// The 24-hour customer-service window governs whether a free-form reply is even
/// possible, so the arithmetic is worth pinning down precisely.
/// </summary>
public class CustomerServiceWindowTests
{
    private static readonly DateTime Now = new(2026, 8, 10, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Window_is_closed_when_the_user_has_never_messaged_in()
    {
        Assert.Equal(0, WhatsAppStore.WindowMinutesRemaining(null, Now, 24));
    }

    [Fact]
    public void Full_window_remains_immediately_after_an_inbound_message()
    {
        Assert.Equal(24 * 60, WhatsAppStore.WindowMinutesRemaining(Now, Now, 24));
    }

    [Fact]
    public void Remaining_time_counts_down_as_the_window_elapses()
    {
        var lastInbound = Now.AddHours(-6);

        Assert.Equal(18 * 60, WhatsAppStore.WindowMinutesRemaining(lastInbound, Now, 24));
    }

    [Fact]
    public void Window_is_closed_exactly_on_the_boundary()
    {
        var lastInbound = Now.AddHours(-24);

        Assert.Equal(0, WhatsAppStore.WindowMinutesRemaining(lastInbound, Now, 24));
    }

    [Fact]
    public void Window_stays_closed_well_past_expiry_and_never_goes_negative()
    {
        var lastInbound = Now.AddDays(-30);

        Assert.Equal(0, WhatsAppStore.WindowMinutesRemaining(lastInbound, Now, 24));
    }

    [Fact]
    public void One_minute_before_expiry_still_counts_as_open()
    {
        var lastInbound = Now.AddHours(-24).AddMinutes(1);

        var remaining = WhatsAppStore.WindowMinutesRemaining(lastInbound, Now, 24);

        Assert.Equal(1, remaining);
        Assert.True(remaining > 0);
    }

    [Fact]
    public void A_shorter_configured_window_is_honoured()
    {
        var lastInbound = Now.AddHours(-5);

        // A 4-hour safety margin should already have expired at 5 hours.
        Assert.Equal(0, WhatsAppStore.WindowMinutesRemaining(lastInbound, Now, 4));
    }

    [Fact]
    public void Partial_minutes_round_up_so_the_window_is_never_reported_as_closed_early()
    {
        var lastInbound = Now.AddHours(-24).AddSeconds(30);

        Assert.Equal(1, WhatsAppStore.WindowMinutesRemaining(lastInbound, Now, 24));
    }
}
