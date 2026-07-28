namespace SplatDev.Messaging.Mailgun.Controllers;

using Microsoft.Win32.SafeHandles;

using SplatDev.Messaging.Interfaces;
using SplatDev.Messaging.Mailgun.Models;

using System.Net.Http.Headers;
using System.Runtime.InteropServices;
using System.Text;

public class MailgunController : IMessagingController<MailgunMessage, MailgunResult>, IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly string _domain;

    public MailgunController(string apiKey, string domain)
        : this(apiKey, domain, new HttpClient())
    {
    }

    internal MailgunController(string apiKey, string domain, HttpClient httpClient)
    {
        _domain = domain;
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://api.mailgun.net/v3/");
        var authBytes = Encoding.ASCII.GetBytes("api:" + apiKey);
        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));
    }

    public MailgunResult SendMessage(MailgunMessage message)
    {
        return SendMessageAsync(message).GetAwaiter().GetResult();
    }

    public MailgunResult SendMessage(
        string subject,
        string from,
        string fromAddress,
        string to,
        string toAddress,
        string message,
        string plainMessage = "",
        IEnumerable<IAddress>? bcc = null,
        IEnumerable<IAddress>? cc = null)
    {
        return SendMessageAsync(subject, from, fromAddress, to, toAddress, message, plainMessage, bcc, cc)
            .GetAwaiter().GetResult();
    }

    public async Task<MailgunResult> SendMessageAsync(MailgunMessage mailgunMessage)
    {
        try
        {
            var formData = new Dictionary<string, string>
            {
                { "from", mailgunMessage.From },
                { "to", mailgunMessage.To },
                { "subject", mailgunMessage.Subject },
            };

            if (!string.IsNullOrEmpty(mailgunMessage.Text))
                formData["text"] = mailgunMessage.Text;

            if (!string.IsNullOrEmpty(mailgunMessage.Html))
                formData["html"] = mailgunMessage.Html;

            if (!string.IsNullOrEmpty(mailgunMessage.Cc))
                formData["cc"] = mailgunMessage.Cc;

            if (!string.IsNullOrEmpty(mailgunMessage.Bcc))
                formData["bcc"] = mailgunMessage.Bcc;

            using var content = new FormUrlEncodedContent(formData);
            var response = await _httpClient.PostAsync(_domain + "/messages", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                return new MailgunResult
                {
                    Success = true,
                    Message = "Send successful",
                    StatusCode = (int)response.StatusCode,
                    MessageId = responseBody,
                };
            }

            return new MailgunResult
            {
                Success = false,
                Message = responseBody,
                StatusCode = (int)response.StatusCode,
            };
        }
        catch (Exception ex)
        {
            return new MailgunResult { Success = false, Message = ex.Message, StatusCode = 0 };
        }
    }

    public async Task<MailgunResult> SendMessageAsync(
        string subject,
        string from,
        string fromAddress,
        string to,
        string toAddress,
        string message,
        string plainMessage = "",
        IEnumerable<IAddress>? bcc = null,
        IEnumerable<IAddress>? cc = null)
    {
        var mailgunMessage = new MailgunMessage
        {
            From = from + " <" + fromAddress + ">",
            To = to + " <" + toAddress + ">",
            Subject = subject,
            Html = message,
            Text = plainMessage,
        };

        if (cc is not null)
        {
            var ccAddresses = string.Join(",", cc.Select(a => a.Name + " <" + a.Address + ">"));
            mailgunMessage.Cc = ccAddresses;
        }

        if (bcc is not null)
        {
            var bccAddresses = string.Join(",", bcc.Select(a => a.Name + " <" + a.Address + ">"));
            mailgunMessage.Bcc = bccAddresses;
        }

        return await SendMessageAsync(mailgunMessage);
    }

    private bool _disposed;
    private readonly SafeHandle _safeHandle = new SafeFileHandle(IntPtr.Zero, true);

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed)
            return;

        if (disposing)
        {
            _safeHandle?.Dispose();
            _httpClient?.Dispose();
        }

        _disposed = true;
    }

    ~MailgunController() => Dispose(false);
}
