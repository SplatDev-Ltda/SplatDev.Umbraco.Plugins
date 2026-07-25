namespace SplatDev.Payments.MercadoPago.Requests
{
    using global::MercadoPago.Client;
    using global::MercadoPago.Client.PaymentMethod;
    using global::MercadoPago.Config;
    using global::MercadoPago.Http;
    using global::MercadoPago.Resource;
    using global::MercadoPago.Resource.PaymentMethod;

    using Newtonsoft.Json;

    using RestSharp;
    using RestSharp.Serializers.NewtonsoftJson;

    using System.Net.Http;
    using System.Threading.Tasks;

    using SplatDev.Payments.MercadoPago.Models;

    public class PaymentRequests
    {
        private readonly string ACCESS_TOKEN;
#pragma warning disable IDE0052 // Remove unread private members
        private readonly string PUBLIC_KEY;
        private readonly RequestOptions requestOptions;
#pragma warning restore IDE0052 // Remove unread private members
        private readonly RestClient client;
        private readonly HttpMessageHandler _handler;

        public PaymentRequests(string publicKey, string accessToken, HttpMessageHandler? handler = null)
        {
            ACCESS_TOKEN = accessToken;
            PUBLIC_KEY = publicKey;
            _handler = handler;
            requestOptions = new RequestOptions
            {
                AccessToken = ACCESS_TOKEN,
                RetryStrategy = new DefaultRetryStrategy(5)
            };
            MercadoPagoConfig.AccessToken = ACCESS_TOKEN;
            var options = new RestClientOptions(Constants.APIv1);
            if (handler != null)
                client = new RestClient(new HttpClient(handler), options, configureSerialization: s => s.UseNewtonsoftJson(Constants.API_JSON_SETTINGS));
            else
                client = new RestClient(options, configureSerialization: s => s.UseNewtonsoftJson(Constants.API_JSON_SETTINGS));
            client.AddDefaultHeader("Authorization", $"Bearer {ACCESS_TOKEN}");
        }

        public async Task<Identification[]> GetIdentificationTypesAsync()
        {
            var request = new RestRequest("identification_types");
            var response = await client.GetAsync<Identification[]>(request);
            return response;
        }

        public async Task<ResourcesList<PaymentMethod>> GetAvailablePaymentMethodsAsync()
        {
            PaymentMethodClient client;
            if (_handler != null)
                client = new PaymentMethodClient(new DefaultHttpClient(new HttpClient(_handler)));
            else
                client = new PaymentMethodClient();
            ResourcesList<PaymentMethod> paymentMethods = await client.ListAsync();
            return paymentMethods;
        }

        /// <summary>
        /// Get payments as an asynchronous operation.
        /// </summary>
        /// <param name="sort">The field to sort.</param>
        /// <param name="criteria">The criteria.</param>
        /// <param name="externalReference">The external reference.</param>
        /// <returns>A Task&lt;FindPaymentsResults[]&gt; representing the asynchronous operation.</returns>
        public async Task<FindPaymentsResults> GetPaymentsAsync(string sort = "", string criteria = "", string externalReference = "")
        {
            RestRequest request;
            var url = "payments";
            if (string.IsNullOrEmpty(sort) && string.IsNullOrEmpty(criteria))
                request = new RestRequest(url);
            else
            {
                url += $"/search?sort={sort}&criteria={criteria}";
                if (!string.IsNullOrEmpty(externalReference)) url += $"&external_reference={externalReference}";
                request = new RestRequest(url);
            }

            var response = await client.GetAsync<FindPaymentsResults>(request);
            return response;
        }

        public async Task<Result> GetPaymentAsync(long paymentId)
        {
            RestRequest request;
            var url = $"payments/{paymentId}";
            request = new RestRequest(url);

            var response = await client.GetAsync<Result>(request);
            return response;
        }

        public async Task<Payment> UpdatePaymentAsync(long paymentId, Payment payment)
        {
            var request = new RestRequest($"payments/{paymentId}");
            request.AddStringBody(
                JsonConvert.SerializeObject(payment, Constants.API_JSON_SETTINGS),
                ContentType.Json);

            var response = client.Put(request);
            var json = JsonConvert.DeserializeObject<Payment>(response.Content, Constants.API_JSON_SETTINGS);
            await Task.FromResult(0);
            return json;
        }

        public async Task<dynamic> GetChargeBackAsync(long chargebackId)
        {
            var request = new RestRequest($"payments/{chargebackId}");
            var response = await client.PutAsync<dynamic>(request);
            return response;
        }

        public async Task<FindPaymentsResults> SearchPaymentMethodAsync(string bins, string processingMode = "aggregator", string marketplace = "NONE", string status = "active")
        {
            var request = new RestRequest("/payment_methods/search");
            request.AddQueryParameter("marketplace", marketplace);
            request.AddQueryParameter("status", status);
            request.AddQueryParameter("processing_mode", processingMode);
            request.AddQueryParameter("bins", bins);
            var pTypes = await client.GetAsync<FindPaymentsResults>(request);
            return pTypes;
        }
    }
}
