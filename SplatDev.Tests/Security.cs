namespace SplatDev.Tests
{
    using System.Net;
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading;
    using System.Threading.Tasks;

    using Moq;
    using Moq.Protected;

    using SplatDev.Security;
    using SplatDev.UrlShortening.Models;

    using Xunit;

    [Trait("Category", "Integration")]
    public class Security
    {
        [Fact]
        public async Task UrlShortening_CheckPhish()
        {
            var json = JsonSerializer.Serialize(new CheckPhishResponse
            {
                jobID = "test-job-123",
                status = "DONE",
                disposition = "clean",
            });

            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Returns(() => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(json),
                }));

            var response = await Tools.CheckPhish("test-key", "http://example.com/", false, handler.Object);

            Assert.NotNull(response);
            Assert.Equal("test-job-123", response.jobID);
        }

        [Fact]
        public async Task UrlShortening_GoogleSafeBrowsing()
        {
            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Returns(() => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent("{}"),
                }));

            var response = await Tools.GoogleSafeBrowing("test-key", new[] { "http://example.com/" }, handler: handler.Object);

            Assert.NotNull(response);
        }

        [Fact]
        public async Task UrlShortening_IpQualityScore()
        {
            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Returns(() => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent("""{"message":"Success.","success":true,"risk_score":0}"""),
                }));

            var response = await Tools.IpQualityScore("test-key", "http://example.com/", handler.Object);

            Assert.NotNull(response);
            Assert.True(response.Success);
        }

        [Fact]
        public void Tools_EncodeBearerToken()
        {
            var response = Tools.EncodeAuthHeader("test-user", "test-password");
            Assert.NotNull(response);
        }
    }
}
