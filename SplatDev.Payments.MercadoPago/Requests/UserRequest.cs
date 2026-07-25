namespace SplatDev.Payments.MercadoPago.Requests
{
    using global::MercadoPago.Config;

    using RestSharp;
    using RestSharp.Serializers.NewtonsoftJson;

    using SplatDev.Payments.MercadoPago.Models;

    using System.Net.Http;
    using System.Threading.Tasks;

    public class UserRequest
    {
        private readonly string ACCESS_TOKEN;
        private readonly RestClient client;

        public UserRequest(string accessToken, HttpMessageHandler? handler = null)
        {
            ACCESS_TOKEN = accessToken;
            MercadoPagoConfig.AccessToken = ACCESS_TOKEN;
            var options = new RestClientOptions(Constants.APIv1);
            if (handler != null)
                client = new RestClient(new HttpClient(handler), options, configureSerialization: s => s.UseNewtonsoftJson(Constants.API_JSON_SETTINGS));
            else
                client = new RestClient(options, configureSerialization: s => s.UseNewtonsoftJson(Constants.API_JSON_SETTINGS));
            client.AddDefaultHeader("Authorization", $"Bearer {ACCESS_TOKEN}");
        }

        public async Task<User> CreateTestUser(string siteId = "MLB")
        {
            var request = new RestRequest("/users/test_user");
            request.AddJsonBody(new { site_id = siteId });
            return await client.PostAsync<User>(request);
        }
    }
}
