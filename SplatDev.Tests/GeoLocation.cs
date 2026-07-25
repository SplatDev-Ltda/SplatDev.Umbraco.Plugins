namespace SplatDev.Tests
{
    using System.Net;
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading;
    using System.Threading.Tasks;

    using Moq;
    using Moq.Protected;

    using SplatDev.GeoLocation;
    using SplatDev.GeoLocation.Models;

    using Xunit;

    public class GeoLocation
    {
        [Fact]
        public async Task GeoLocation_IpInfo()
        {
            var geoResult = new GeoLocationResult
            {
                City = "São Paulo",
                Country = "BR",
                Hostname = "example.com",
                Ip = "152.254.243.1",
                Loc = "-23.5475,-46.6361",
                Org = "AS27699 Telecomunicacoes de Sao Paulo S.A.",
                Postal = "01000-000",
                Region = "São Paulo",
                Timezone = "America/Sao_Paulo",
            };

            var json = JsonSerializer.Serialize(geoResult);

            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Returns(() => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(json),
                }));

            var response = await new GeoLocator().GetIpInfoGeoLocation("test-token", "152.254.243.1", handler.Object);

            Assert.NotNull(response);
            Assert.Equal("São Paulo", response.City);
            Assert.Equal("BR", response.Country);
            Assert.Equal("152.254.243.1", response.Ip);
        }
    }
}
