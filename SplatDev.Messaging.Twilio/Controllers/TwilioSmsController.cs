namespace SplatDev.Messaging.Twilio.Controllers
{
    using global::Twilio.Clients;
    using global::Twilio.Rest.Api.V2010.Account;
    using global::Twilio.Types;

    using SplatDev.Messaging.Interfaces;
    using SplatDev.Messaging.Models;
    using SplatDev.Messaging.Twilio.Models;

    using System;
    using System.Threading.Tasks;

    public class TwilioSmsController : ISmsMessagingController<Sms, MessageResource>
    {
        private readonly ITwilioRestClient client;
        private readonly TwilioOptions options;

        public TwilioSmsController(TwilioOptions options)
        {
            this.options = options;
            client = new TwilioRestClient(options.AccountSid, options.AuthToken);
        }

        public MessageResource SendMessage(Sms message)
            => SendMessageAsync(message).GetAwaiter().GetResult();

        public MessageResource SendMessage(string from, string to, string body)
            => SendMessageAsync(from, to, body).GetAwaiter().GetResult();

        public Task<MessageResource> SendMessageAsync(Sms message)
            => MessageResource.CreateAsync(
                to: new PhoneNumber(message.To),
                from: new PhoneNumber(message.From),
                body: message.Body,
                client: client);

        public Task<MessageResource> SendMessageAsync(string from, string to, string body)
        {
            var fromNumber = new PhoneNumber(string.IsNullOrEmpty(from) ? options.DefaultFrom ?? from : from);
            return MessageResource.CreateAsync(
                to: new PhoneNumber(to),
                from: fromNumber,
                body: body,
                client: client);
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }
    }
}
