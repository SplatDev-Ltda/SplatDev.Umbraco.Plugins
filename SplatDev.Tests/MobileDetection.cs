namespace SplatDev.Tests
{
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Primitives;
    using Xunit;

    using Moq;

    using Newtonsoft.Json;

    using SplatDev.Mobile.Detection;
    using SplatDev.Mobile.Detection.Models;

    using System.Collections.Generic;
    using System.IO;
    using System.Text;

    //borrowed from https://mahmutcanga.com/2019/12/13/unit-testing-httprequest-in-c/
    [Trait("Category", "Integration")]
    public class MobileDetectionTests : IDisposable
    {
        private MemoryStream _memoryStream;
        private Mock<HttpRequest> _mockRequest;

        private class BodyData
        {
            public object Body { get; set; }
        }

        public MobileDetectionTests()
        {
            _mockRequest = CreateMockRequest(new BodyData());
            MockQueryParameters(new Dictionary<string, StringValues>
            {
                { "HTTP_USER_AGENT", "moto" }
            });
        }

        private Mock<HttpRequest> CreateMockRequest(object body)
        {
            var json = JsonConvert.SerializeObject(body);
            var byteArray = Encoding.ASCII.GetBytes(json);

            _memoryStream = new MemoryStream(byteArray);
            _memoryStream.Flush();
            _memoryStream.Position = 0;

            var mockRequest = new Mock<HttpRequest>();
            mockRequest.Setup(x => x.Body).Returns(_memoryStream);

            return mockRequest;
        }

        private void MockQueryParameters(Dictionary<string, StringValues> parameters)
        {
            _mockRequest.Setup(i => i.Query).Returns(new QueryCollection(parameters));
        }

        public void Dispose()
        {
            _memoryStream.Dispose();
        }

        [Fact]
        public void MobileDetectionTests_IsMobileDevice()
        {
            // Arrange
#pragma warning disable IDE0059 // Unnecessary assignment of a value
            var mobile = MobileDetection.MobileDevices;
#pragma warning restore IDE0059 // Unnecessary assignment of a value

            // Act
            var isMobile = MobileDetection.IsMobileBrowser(_mockRequest.Object);

            // Assert
            Assert.True(isMobile);
        }

        [Fact]
        public void MobileDetectionTests_GenerateListOfMobileDevices()
        {
            #region List of Devices

            var devices = new MobileDevice[]
            {
                new MobileDevice { Code = "midp" },
                new MobileDevice { Code = "j2me"},
                new MobileDevice { Code = "avant"},
                new MobileDevice { Code = "docomo"},
                new MobileDevice { Code = "novarra"},
                new MobileDevice { Code = "palmos"},
                new MobileDevice { Code = "palmsource"},
                new MobileDevice { Code = "240x320"},
                new MobileDevice { Code = "opwv"},
                new MobileDevice { Code = "chtml"},
                new MobileDevice { Code = "pda"},
                new MobileDevice { Code = "windows ce"},
                new MobileDevice { Code = "mmp/"},
                new MobileDevice { Code = "blackberry"},
                new MobileDevice { Code = "mib/"},
                new MobileDevice { Code = "symbian"},
                new MobileDevice { Code = "wireless"},
                new MobileDevice { Code = "nokia"},
                new MobileDevice { Code = "hand"},
                new MobileDevice { Code = "mobi"},
                new MobileDevice { Code = "phone"},
                new MobileDevice { Code = "cdm"},
                new MobileDevice { Code = "up.b"},
                new MobileDevice { Code = "audio"},
                new MobileDevice { Code = "SIE-"},
                new MobileDevice { Code = "SEC-"},
                new MobileDevice { Code = "samsung"},
                new MobileDevice { Code = "HTC"},
                new MobileDevice { Code = "mot-"},
                new MobileDevice { Code = "mitsu"},
                new MobileDevice { Code = "sagem"},
                new MobileDevice { Code = "sony"},
                new MobileDevice { Code = "alcatel"},
                new MobileDevice { Code = "lg"},
                new MobileDevice { Code = "eric"},
                new MobileDevice { Code = "vx"},
                new MobileDevice { Code = "NEC"},
                new MobileDevice { Code = "philips"},
                new MobileDevice { Code = "mmm"},
                new MobileDevice { Code = "xx"},
                new MobileDevice { Code = "panasonic"},
                new MobileDevice { Code = "sharp"},
                new MobileDevice { Code = "wap"},
                new MobileDevice { Code = "sch"},
                new MobileDevice { Code = "rover"},
                new MobileDevice { Code = "pocket"},
                new MobileDevice { Code = "benq"},
                new MobileDevice { Code = "java"},
                new MobileDevice { Code = "pt"},
                new MobileDevice { Code = "pg"},
                new MobileDevice { Code = "vox"},
                new MobileDevice { Code = "amoi"},
                new MobileDevice { Code = "bird"},
                new MobileDevice { Code = "compal"},
                new MobileDevice { Code = "kg"},
                new MobileDevice { Code = "voda"},
                new MobileDevice { Code = "sany"},
                new MobileDevice { Code = "kdd"},
                new MobileDevice { Code = "dbt"},
                new MobileDevice { Code = "sendo"},
                new MobileDevice { Code = "sgh"},
                new MobileDevice { Code = "gradi"},
                new MobileDevice { Code = "jb"},
                new MobileDevice { Code = "dddi"},
                new MobileDevice { Code = "moto"},
                new MobileDevice { Code = "iphone" }
            };
            #endregion

            var json = JsonConvert.SerializeObject(devices);
            Assert.NotNull(json);
        }
    }
}
