namespace UmbracoCms.Plugins.Tests
{
    using System.Net;
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading;
    using System.Threading.Tasks;

    using Moq;
    using Moq.Protected;

    using SplatDev.Payments.Interfaces;
    using SplatDev.Payments.MercadoPago.Enum;
    using SplatDev.Payments.MercadoPago.Models;
    using SplatDev.Payments.MercadoPago.Requests;

    using Xunit;

    public class Plugins_Payments_MercadoPago
    {
        private static HttpMessageHandler CreateHandler(string responseJson, HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Returns(() => Task.FromResult(new HttpResponseMessage(statusCode)
                {
                    Content = new StringContent(responseJson, System.Text.Encoding.UTF8, "application/json"),
                }));
            return handler.Object;
        }

        private static HttpMessageHandler CreateMultiHandler(Dictionary<string, (string Json, HttpStatusCode Status)> responses)
        {
            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Returns((HttpRequestMessage req, CancellationToken _) =>
                {
                    foreach (var kvp in responses)
                    {
                        if (req.RequestUri!.AbsolutePath.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                        {
                            return Task.FromResult(new HttpResponseMessage(kvp.Value.Status)
                            {
                                Content = new StringContent(kvp.Value.Json, System.Text.Encoding.UTF8, "application/json"),
                            });
                        }
                    }
                    return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                    {
                        Content = new StringContent(responses.Values.First().Json, System.Text.Encoding.UTF8, "application/json"),
                    });
                });
            return handler.Object;
        }

        [Fact]
        public async Task MercadoPago_SearchPaymentMethods()
        {
            var handler = CreateHandler("""{"paging":{"total":0,"limit":0,"offset":0},"results":[]}""");
            var request = new PaymentRequests("pk", "at", handler);
            var result = await request.SearchPaymentMethodAsync("50314332");
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_GetAvailableIndentificationTypes()
        {
            var handler = CreateHandler("""[{"id":"CPF","name":"CPF","type":"number","min_length":11,"max_length":11}]""");
            var request = new PaymentRequests("pk", "at", handler);
            var result = await request.GetIdentificationTypesAsync();
            Assert.NotNull(result);
            Assert.NotEmpty(result);
        }

        [Fact(Skip = "SDK PaymentMethodClient.ListAsync uses internal parsing incompatible with HTTP mock")]
        public void MercadoPago_GetAvailablePaymentMethods()
        {
            var request = new PaymentRequests("pk", "at");
            var result = request.GetAvailablePaymentMethodsAsync().GetAwaiter().GetResult();
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_GetPayment()
        {
            var handler = CreateHandler("""{"id":1239693994,"status":"approved"}""");
            var request = new PaymentRequests("pk", "at", handler);
            var result = await request.GetPaymentAsync(1239693994);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_GetAllPayments()
        {
            var handler = CreateHandler("""{"paging":{"total":0,"limit":0,"offset":0},"results":[]}""");
            var request = new PaymentRequests("pk", "at", handler);
            var result = await request.GetPaymentsAsync("date_created", "desc");
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_UpdatePayment()
        {
            var handler = CreateHandler("""{"id":1239843994,"description":"Changed description test"}""");
            var request = new PaymentRequests("pk", "at", handler);
            var update = new Payment { Description = "Changed description test" };
            var result = await request.UpdatePaymentAsync(1239843994, update);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_CreateSubscriptionPlan()
        {
            var handler = CreateHandler("""{"id":"plan-123","reason":"Monthly Plan Gold","auto_recurring":{"frequency":1,"frequency_type":"months","transaction_amount":29.99}}""");
            var request = new SubscriptionRequest("pk", "at", handler);
            var plan = new PreApprovalPlan
            {
                BackUrl = "https://splatdev.com/subscribeto",
                Reason = "Monthly Plan Gold",
                AutoRecurring = new AutoRecurring
                {
                    CurrencyId = "BRL",
                    Frequency = 1,
                    FrequencyType = FrequencyTypes.Months.StringName(),
                    TransactionAmount = 29.99m
                },
            };
            var result = await request.CreateSubscriptionPlanAsync(plan);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_CreateTestUser()
        {
            var handler = CreateHandler("""{"id":12345,"nickname":"TESTUSER"}""");
            var request = new UserRequest("at", handler);
            var result = await request.CreateTestUser();
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_CreateSubscriptionFromPlan()
        {
            var handler = CreateHandler("""{"id":"sub-123","preapproval_plan_id":"2c9380847b5a473c017b5ee4269202a9","status":"authorized"}""");
            var request = new SubscriptionRequest("pk", "at", handler);
            var sub = new Subscription
            {
                PayerEmail = "test@testuser.com",
                PreapprovalPlanId = "2c9380847b5a473c017b5ee4269202a9",
                CardTokenId = "tok-123",
            };
            var result = await request.CreateSubscriptionAsync(sub);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_CreateSubscriptionWithoutPlan()
        {
            var handler = CreateHandler("""{"id":"sub-456","status":"authorized"}""");
            var request = new SubscriptionRequest("pk", "at", handler);
            var sub = new Subscription
            {
                AutoRecurring = new AutoRecurring
                {
                    CurrencyId = "BRL",
                    Frequency = 1,
                    FrequencyType = FrequencyTypes.Months.StringName(),
                    TransactionAmount = 29.99m
                },
                BackUrl = "https://splatdev.com/subscribeto",
                ExternalReference = "2354624623T6X4",
                PayerEmail = "john.doe@uol.com.br",
                Reason = "Subscribing to Gold Service",
                ApplicationId = 1140570228911716
            };
            var result = await request.CreateSubscriptionAsync(sub);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_GenerateCardToken()
        {
            var handler = CreateHandler("""{"id":"tok-abc123","status":"active"}""");
            var request = new CardPaymentRequest("pk", "at", "https://splatdev.com/", handler);
            var card = new CreditCard
            {
                Cardholder = new CardHolder { Name = "Test User" },
                CardNumber = "4235647728025682",
                ExpirationMonth = 11,
                ExpirationYear = 2025,
                PaymentMethodId = "visa",
                SecurityCode = "123"
            };
            var result = await request.GenerateCardTokenAsync(card);
            Assert.NotNull(result);
            Assert.Equal("tok-abc123", result.Id);
        }

        [Fact]
        public async Task MercadoPago_CreateCardPaymentRequest()
        {
            var handler = CreateMultiHandler(new Dictionary<string, (string, HttpStatusCode)>
            {
                ["card_tokens"] = ("""{"id":"tok-abc","status":"active"}""", HttpStatusCode.OK),
                ["payments"] = ("""{"id":12345,"status":"approved","status_detail":"accredited"}""", HttpStatusCode.OK),
            });
            var request = new CardPaymentRequest("pk", "at", "https://splatdev.com/", handler);
            var model = new Payment
            {
                Email = "john.doe@email.com",
                TransactionAmount = 100.00m,
                TransactionDescription = "Test",
                PaymentMethodId = "visa",
                Installments = 3,
                Details = new CreditCard
                {
                    Cardholder = new CardHolder { Name = "Test" },
                    CardNumber = "4235647728025682",
                    ExpirationMonth = 11,
                    ExpirationYear = 2025,
                    PaymentMethodId = "visa",
                    SecurityCode = "123"
                }
            };
            var result = await request.CreatePaymentRequestAsync(model);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_CreatePixPaymentRequest()
        {
            var handler = CreateHandler("""{"id":12345,"status":"pending"}""");
            var request = new PixPaymentRequest("pk", "at", handler);
            var pix = new Pix
            {
                Description = "Pix Product",
                ExpirationDate = System.DateTime.Now.AddDays(5),
                Payer = new Payer
                {
                    Email = "john.doe@email.com.br",
                    FirstName = "John",
                    LastName = "Doe",
                    Identification = new Identification { Type = "CPF", Number = "747.340.780-50" }
                },
                TransactionAmount = 99.99m
            };
            var result = await request.CreatePaymentRequestAsync(pix);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task MercadoPago_CreateTicketPaymentRequest()
        {
            var handler = CreateHandler("""{"id":67890,"status":"pending"}""");
            var request = new TicketPaymentRequest("pk", "at", handler);
            var boleto = new Ticket
            {
                Description = "Boleto Product",
                ExpirationDate = System.DateTime.Now.AddDays(5),
                Payer = new Payer
                {
                    Email = "john.doe@email.com.br",
                    FirstName = "John",
                    LastName = "Doe",
                    Identification = new Identification { Type = "CPF", Number = "747.340.780-50" }
                },
                TransactionAmount = 99.99m
            };
            var result = await request.CreatePaymentRequestAsync(boleto);
            Assert.NotNull(result);
        }
    }
}
