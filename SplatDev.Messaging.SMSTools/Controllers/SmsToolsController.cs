namespace SplatDev.Messaging.SMSTools.Controllers
{
    using RestSharp;

    using SplatDev.Messaging.Interfaces;
    using SplatDev.Messaging.Models;
    using SplatDev.Messaging.SMSTools.Models;

    using System;
    using System.Threading.Tasks;

    public class SmsToolsController : ISmsMessagingController<Sms, SmsToolsResult>
    {
        private readonly RestClient client;
        private readonly SmsToolsOptions options;

        public SmsToolsController(SmsToolsOptions options)
        {
            this.options = options;
            var restOptions = new RestClientOptions(options.BaseUrl);
            client = new RestClient(restOptions);
        }

        public SmsToolsResult SendMessage(Sms message)
            => SendMessageAsync(message).GetAwaiter().GetResult();

        public SmsToolsResult SendMessage(string from, string to, string body)
            => SendMessageAsync(from, to, body).GetAwaiter().GetResult();

        public async Task<SmsToolsResult> SendMessageAsync(Sms message)
        {
            try
            {
                var request = new RestRequest("/sms/send", Method.Post);
                request.AddHeader("Authorization", $"Bearer {options.ApiKey}");
                request.AddJsonBody(new
                {
                    to = message.To,
                    from = message.From,
                    body = message.Body,
                });

                var response = await client.ExecuteAsync(request).ConfigureAwait(false);

                return response.IsSuccessful
                    ? new SmsToolsResult { Success = true, Status = "sent", RawResponse = response.Content }
                    : new SmsToolsResult { Success = false, Message = response.ErrorMessage ?? response.StatusDescription, RawResponse = response.Content };
            }
            catch (Exception ex)
            {
                return new SmsToolsResult { Success = false, Message = ex.Message };
            }
        }

        public async Task<SmsToolsResult> SendMessageAsync(string from, string to, string body)
        {
            var effectiveFrom = string.IsNullOrEmpty(from) ? options.DefaultFrom ?? from : from;
            return await SendMessageAsync(new Sms
            {
                From = effectiveFrom,
                To = to,
                Body = body,
            }).ConfigureAwait(false);
        }

        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }
    }
}
