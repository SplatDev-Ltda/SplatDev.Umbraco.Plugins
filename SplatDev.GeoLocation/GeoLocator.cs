namespace SplatDev.GeoLocation
{
    using System.Net.Http;
    using System.Threading.Tasks;

    using RestSharp;

    using SplatDev.GeoLocation.Models;

    public class GeoLocator
    {
        public async Task<GeoLocationResult> GetIpInfoGeoLocation(string token, string ipAddress, HttpMessageHandler? handler = null)
        {
            var options = new RestClientOptions(Constants.APINFO);
            if (handler != null)
            {
                options.ConfigureMessageHandler = _ => handler;
            }

            var client = new RestClient(options);
            var request = new RestRequest(ipAddress);
            request.AddQueryParameter("token", token);
            var result = await client.GetAsync<GeoLocationResult>(request);
            return result;
        }
    }
}
