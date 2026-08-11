using System.Text.Json;

using SplatDev.Umbraco.Plugins.WhatsApp.Models;

using Xunit;

namespace SplatDev.Umbraco.Plugins.WhatsApp.Tests;

/// <summary>
/// Payload shapes taken from Meta's webhook reference. Meta adds fields freely, so
/// deserialization must tolerate unknown members rather than throwing.
/// </summary>
public class WebhookPayloadTests
{
    [Fact]
    public void Parses_an_inbound_text_message()
    {
        const string json = """
        {
          "object": "whatsapp_business_account",
          "entry": [{
            "id": "1777491496760147",
            "changes": [{
              "field": "messages",
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "17026618282",
                  "phone_number_id": "1104024519459873"
                },
                "contacts": [{ "profile": { "name": "Ada" }, "wa_id": "16505551234" }],
                "messages": [{
                  "from": "16505551234",
                  "id": "wamid.HBgLMTY1MDU1NTEyMzQ",
                  "timestamp": "1750263773",
                  "type": "text",
                  "text": { "body": "Hello there" }
                }]
              }
            }]
          }]
        }
        """;

        var payload = JsonSerializer.Deserialize<WebhookPayload>(json);
        var value = payload!.Entry![0].Changes![0].Value!;
        var message = value.Messages![0];

        Assert.Equal("16505551234", message.From);
        Assert.Equal("wamid.HBgLMTY1MDU1NTEyMzQ", message.Id);
        Assert.Equal("Hello there", message.ToDisplayText());
        Assert.Equal("Ada", value.Contacts![0].Profile!.Name);
    }

    [Fact]
    public void Parses_a_delivery_status_update()
    {
        const string json = """
        {
          "object": "whatsapp_business_account",
          "entry": [{
            "id": "1777491496760147",
            "changes": [{
              "field": "messages",
              "value": {
                "messaging_product": "whatsapp",
                "statuses": [{
                  "id": "wamid.HBgLMTY1MDM4Nzk0Mzk",
                  "status": "delivered",
                  "timestamp": "1750263773",
                  "recipient_id": "16505551234"
                }]
              }
            }]
          }]
        }
        """;

        var payload = JsonSerializer.Deserialize<WebhookPayload>(json);
        var status = payload!.Entry![0].Changes![0].Value!.Statuses![0];

        Assert.Equal("delivered", status.Status);
        Assert.Equal("wamid.HBgLMTY1MDM4Nzk0Mzk", status.Id);
        Assert.Null(status.Errors);
    }

    [Fact]
    public void Parses_a_failed_status_with_its_error_detail()
    {
        const string json = """
        {
          "entry": [{
            "changes": [{
              "value": {
                "statuses": [{
                  "id": "wamid.X",
                  "status": "failed",
                  "errors": [{
                    "code": 131047,
                    "title": "Re-engagement message",
                    "message": "More than 24 hours have passed since the recipient last replied."
                  }]
                }]
              }
            }]
          }]
        }
        """;

        var status = JsonSerializer.Deserialize<WebhookPayload>(json)!
            .Entry![0].Changes![0].Value!.Statuses![0];

        Assert.Equal("failed", status.Status);
        Assert.Equal(131047, status.Errors![0].Code);
        Assert.Contains("24 hours", status.Errors![0].Message);
    }

    [Theory]
    [InlineData("image", "[image]")]
    [InlineData("audio", "[audio]")]
    [InlineData("document", "[document]")]
    [InlineData("location", "[location]")]
    public void Non_text_messages_render_as_a_type_label_rather_than_a_blank_row(
        string type, string expected)
    {
        var message = new WebhookMessage { Type = type };

        Assert.Equal(expected, message.ToDisplayText());
    }

    [Fact]
    public void Interactive_button_replies_render_their_title()
    {
        var message = new WebhookMessage
        {
            Type = "interactive",
            Interactive = new WebhookInteractive
            {
                Type = "button_reply",
                ButtonReply = new WebhookReply { Id = "yes", Title = "Yes, please" },
            },
        };

        Assert.Equal("Yes, please", message.ToDisplayText());
    }

    [Fact]
    public void Unknown_fields_do_not_break_deserialization()
    {
        // Meta ships new fields without warning; an exception here would mean dropped messages.
        const string json = """
        {
          "object": "whatsapp_business_account",
          "some_future_field": { "nested": true },
          "entry": [{ "id": "1", "changes": [], "another_new_thing": 42 }]
        }
        """;

        var payload = JsonSerializer.Deserialize<WebhookPayload>(json);

        Assert.NotNull(payload);
        Assert.Equal("whatsapp_business_account", payload!.Object);
    }

    [Fact]
    public void An_empty_payload_yields_no_entries_rather_than_throwing()
    {
        var payload = JsonSerializer.Deserialize<WebhookPayload>("{}");

        Assert.NotNull(payload);
        Assert.Null(payload!.Entry);
    }
}
