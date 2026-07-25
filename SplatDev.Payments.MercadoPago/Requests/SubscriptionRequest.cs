namespace SplatDev.Payments.MercadoPago.Requests
{

    using Newtonsoft.Json;

    using RestSharp;
    using RestSharp.Serializers.NewtonsoftJson;

    using SplatDev.Payments.Interfaces;
    using SplatDev.Payments.MercadoPago.Enum;
    using SplatDev.Payments.MercadoPago.Models;

    using System.Net.Http;
    using System.Threading.Tasks;

    public class SubscriptionRequest
    {
#pragma warning disable IDE0052 // Remove unread private members
        private readonly string PUBLIC_KEY;
#pragma warning restore IDE0052 // Remove unread private members
        private readonly string ACCESS_TOKEN;
        private readonly RestClient client;

        public SubscriptionRequest(string publicKey, string accessToken, HttpMessageHandler? handler = null)
        {
            ACCESS_TOKEN = accessToken;
            PUBLIC_KEY = publicKey;
            var options = new RestClientOptions(Constants.API);
            if (handler != null)
                client = new RestClient(new HttpClient(handler), options, configureSerialization: s => s.UseNewtonsoftJson(Constants.API_JSON_SETTINGS));
            else
                client = new RestClient(options, configureSerialization: s => s.UseNewtonsoftJson(Constants.API_JSON_SETTINGS));
            client.AddDefaultHeader("Authorization", $"Bearer {ACCESS_TOKEN}");
        }

        public async Task<Subscription> CreateSubscriptionAsync(ISubscription subscription)
        {
            var request = new RestRequest($"preapproval");
            request.AddStringBody(
                JsonConvert.SerializeObject(subscription, Constants.API_JSON_SETTINGS),
                ContentType.Json);

            var response = client.Post(request);
            await Task.FromResult(0);
            return JsonConvert.DeserializeObject<Subscription>(response.Content);
        }

        public async Task<PreApprovalPlan> CreateSubscriptionPlanAsync(PreApprovalPlan plan)
        {
            var request = new RestRequest($"preapproval_plan");
            request.AddJsonBody(plan);
            var response = await client.PostAsync<PreApprovalPlan>(request);
            return response;
        }

        public async Task<Subscription> SearchSubscriptionAsync(StatusTypes status, string payer_email)
        {
            var request = new RestRequest($"preapproval/search");
            request.AddQueryParameter("status", status.ToString().ToLower());
            request.AddQueryParameter("payer_email", payer_email);
            var response = await client.PostAsync<Subscription>(request);
            return response;
        }

        public async Task<Subscription> ChangeSubscriptionStatusAsync(Subscription subscription)
        {
            var request = new RestRequest($"preapproval/{subscription.PrepprovalId}");
            var response = await client.PostAsync<Subscription>(request);
            return response;
        }
    }
}
