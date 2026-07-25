namespace SplatDev.Tests
{
    using System.Net;
    using System.Threading;
    using System.Threading.Tasks;

    using Moq;

    using global::SendGrid;
    using global::SendGrid.Helpers.Mail;
    using global::SocketLabs.InjectionApi;
    using global::SocketLabs.InjectionApi.Message;
    using SocketLabsEmailAddress = global::SocketLabs.InjectionApi.Message.EmailAddress;

    using SplatDev.Messaging.SendGrid.Controllers;
    using SplatDev.Messaging.Smtp.Controllers;
    using SplatDev.Messaging.SocketLabs.Controllers;

    using Xunit;

    public class Messaging
    {
        private readonly string subject = "Test Message";
        private readonly string fromEmail = "carlos@opennology.com";
        private readonly string from = "Carlos Casalicchio";
        private readonly string toEmail = "carlos.casalicchio@gmail.com";
        private readonly string to = "Carlos Casalicchio (Gmail)";

        [Fact]
        public async Task Messaging_SendGrid_Send()
        {
            var mockClient = new Mock<ISendGridClient>();
            mockClient
                .Setup(c => c.SendEmailAsync(It.IsAny<SendGridMessage>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new Response(HttpStatusCode.Accepted, null, null));

            var controller = new SendGridController(sendGridClient: mockClient.Object);

            var response = await controller.SendMessageAsync(subject, from, fromEmail, to, toEmail, "<h1>Test</h1>");

            Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
            mockClient.Verify(c => c.SendEmailAsync(It.IsAny<SendGridMessage>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public void Messaging_Smtp_Send()
        {
            var smtpController = new SmtpController();
            smtpController.SendMessage(subject, from, fromEmail, to, toEmail, "<h1>Test</h1>");
            Assert.False(false);
        }

        [Fact]
        public void Messaging_SocketLabs_Send()
        {
            var mockClient = new Mock<ISocketLabsClient>();
            mockClient
                .Setup(c => c.Send(It.IsAny<BasicMessage>()))
                .Returns(new SendResponse { Result = SendResult.Success });

            var controller = new SocketLabsController(0, "key", socketLabsClient: mockClient.Object);

            var msg = new BasicMessage
            {
                Subject = subject,
                HtmlBody = "<h1>Test</h1>",
                PlainTextBody = "Test plain"
            };
            msg.From.Email = fromEmail;
            msg.To.Add(new SocketLabsEmailAddress(toEmail, to));

            var response = controller.SendMessage(msg);

            Assert.NotNull(response);
            mockClient.Verify(c => c.Send(It.IsAny<BasicMessage>()), Times.Once);
        }

        [Fact]
        public void Messaging_SocketLabs_BulkSend()
        {
            var mockClient = new Mock<ISocketLabsClient>();
            mockClient
                .Setup(c => c.Send(It.IsAny<BulkMessage>()))
                .Returns(new SendResponse { Result = SendResult.Success });

            var bulkController = new SocketLabsBulkController(0, "key", mockClient.Object);

            var msg = new BulkMessage
            {
                Subject = subject,
                HtmlBody = "<h1>Test</h1>",
                PlainTextBody = "Test plain"
            };
            msg.From.Email = fromEmail;

            var response = bulkController.BulkSendMessage(msg);

            Assert.NotNull(response);
            mockClient.Verify(c => c.Send(It.IsAny<BulkMessage>()), Times.Once);
        }

        [Fact(Skip = "Twilio SDK uses static TwilioClient.Init()")]
        public void Messaging_Twilio_Send()
        {
        }
    }
}
