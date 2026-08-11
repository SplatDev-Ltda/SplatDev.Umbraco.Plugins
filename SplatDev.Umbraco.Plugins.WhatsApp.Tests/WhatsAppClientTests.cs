using SplatDev.Umbraco.Plugins.WhatsApp.Services;

using Xunit;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Tests;

public class WhatsAppClientTests
{
    [Theory]
    [InlineData("+1 702-661-8282", "17026618282")]
    [InlineData("17026618282", "17026618282")]
    [InlineData("+55 (11) 99999-8888", "5511999998888")]
    [InlineData("  +1 702 661 8282  ", "17026618282")]
    public void Recipient_numbers_are_reduced_to_digits(string input, string expected)
    {
        // The Cloud API rejects '+', spaces and dashes with an opaque error, so
        // normalisation has to happen before the request is built.
        Assert.Equal(expected, WhatsAppClient.NormalizeRecipient(input));
    }

    [Fact]
    public void Normalising_an_empty_number_yields_an_empty_string_rather_than_throwing()
    {
        Assert.Equal(string.Empty, WhatsAppClient.NormalizeRecipient(string.Empty));
    }

    [Theory]
    [InlineData(null, 0)]
    [InlineData("", 0)]
    [InlineData("Hello there, no variables here.", 0)]
    [InlineData("Hello {{1}}, your order {{2}} shipped.", 2)]
    [InlineData("Hi {{1}}! Thanks {{1}} for waiting.", 1)]
    public void Template_variable_count_is_derived_from_the_body(string? body, int expected)
    {
        Assert.Equal(expected, WhatsAppClient.CountVariables(body));
    }

    [Fact]
    public void Variable_count_uses_the_highest_index_not_the_number_of_placeholders()
    {
        // A body that skips {{2}} still needs three parameters positionally, otherwise
        // Meta rejects the send for a parameter-count mismatch.
        Assert.Equal(3, WhatsAppClient.CountVariables("Hi {{1}}, ref {{3}}."));
    }
}
