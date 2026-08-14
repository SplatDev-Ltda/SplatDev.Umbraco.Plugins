using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using SplatDev.Umbraco.Plugins.Smtp.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.Smtp.Tests;

public class SmtpServiceTests
{
    private static SmtpService Build(params (string Key, string Value)[] settings)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(settings.Select(s =>
                new KeyValuePair<string, string?>($"SmtpSettings:{s.Key}", s.Value)))
            .Build();

        return new SmtpService(config);
    }

    [Fact]
    public void Settings_come_from_the_SmtpSettings_section()
    {
        var svc = Build(
            ("Host", "mail.example.com"),
            ("Port", "2525"),
            ("Username", "postmaster"),
            ("Password", "hunter2"),
            ("EnableSsl", "false"),
            ("FromEmail", "noreply@example.com"),
            ("FromName", "Example"));

        var s = svc.GetSettings();

        Assert.Equal("mail.example.com", s.Host);
        Assert.Equal(2525, s.Port);
        Assert.Equal("postmaster", s.Username);
        Assert.Equal("hunter2", s.Password);
        Assert.False(s.EnableSsl);
        Assert.Equal("noreply@example.com", s.FromEmail);
        Assert.Equal("Example", s.FromName);
    }

    [Fact]
    public void Missing_configuration_yields_the_documented_defaults()
    {
        var s = Build().GetSettings();

        Assert.Equal(string.Empty, s.Host);
        Assert.Equal(587, s.Port);
        Assert.True(s.EnableSsl);
    }

    [Fact]
    public void An_unparseable_port_falls_back_rather_than_throwing()
    {
        Assert.Equal(587, Build(("Port", "not-a-number")).GetSettings().Port);
    }

    /// <summary>
    /// The guard that matters: with nothing configured, the dashboard's Send test button
    /// must come back with an explanation rather than hanging on a connection attempt to
    /// an empty host — which is what a fresh install looks like.
    /// </summary>
    [Fact]
    public async Task Sending_a_test_with_no_host_configured_fails_fast_and_explains()
    {
        var result = await Build().SendTestAsync();

        Assert.False(result.Success);
        Assert.Contains("No SMTP host", result.Message);
        Assert.Contains("SmtpSettings:Host", result.Error);
    }

    [Fact]
    public async Task Sending_a_test_with_a_blank_host_is_also_refused()
    {
        var result = await Build(("Host", "   "), ("FromEmail", "a@b.com")).SendTestAsync();

        Assert.False(result.Success);
        Assert.Contains("No SMTP host", result.Message);
    }
}
