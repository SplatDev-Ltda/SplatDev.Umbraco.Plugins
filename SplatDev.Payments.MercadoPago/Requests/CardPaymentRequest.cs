namespace SplatDev.Payments.MercadoPago.Requests
{
    using global::MercadoPago.Client;
    using global::MercadoPago.Client.Common;
    using global::MercadoPago.Client.Payment;
    using global::MercadoPago.Config;
    using global::MercadoPago.Http;
    using global::MercadoPago.Resource.Payment;

    using RestSharp;
    using RestSharp.Serializers.NewtonsoftJson;

    using System.Net.Http;
    using System.Threading.Tasks;

    using SplatDev.Payments.Interfaces;

    public class CardPaymentRequest : IPayment<Payment>
    {
        private readonly string REFERRER;
        private readonly string PUBLIC_KEY;
        private readonly string ACCESS_TOKEN;
        private readonly RequestOptions requestOptions;
        private readonly HttpMessageHandler? _handler;

        public CardPaymentRequest(string publicKey, string accessToken, string referrer, HttpMessageHandler? handler = null)
        {
            ACCESS_TOKEN = accessToken;
            PUBLIC_KEY = publicKey;
            _handler = handler;
            requestOptions = new RequestOptions
            {
                AccessToken = ACCESS_TOKEN,
                RetryStrategy = new DefaultRetryStrategy(5)
            };
            REFERRER = Uri.EscapeDataString(referrer);
        }

        public async Task<Models.CreditCard> GenerateCardTokenAsync(Models.CreditCard model, string locale = "pt-BR")
        {
            var options = new RestClientOptions(Constants.APIv1);
            RestClient client;
            if (_handler != null)
                client = new RestClient(new HttpClient(_handler), options, configureSerialization: s => s.UseNewtonsoftJson(Constants.API_JSON_SETTINGS));
            else
                client = new RestClient(options, configureSerialization: s => s.UseNewtonsoftJson(Constants.API_JSON_SETTINGS));
            client.AddDefaultHeader("X-Product-Id", "BTR2N61O1F60OR8RLSGG");
            client.AddDefaultHeader("Authorization", $"Bearer {ACCESS_TOKEN}");
            var request = new RestRequest($"card_tokens?public_key={PUBLIC_KEY}&locale={locale}&js_version=2.0.0&referer={REFERRER}");
            request.AddJsonBody(model);
            var response = await client.PostAsync<Models.CreditCard>(request);
            return response;
        }

        public async Task<Payment> CreatePaymentRequestAsync(IPayment model)
        {
            var payModel = (Models.Payment)model;
            Models.CreditCard creditCard = (Models.CreditCard)payModel.Details;
            var identification = payModel.Cardholder.Identification;
            Models.CreditCard card_token = await GenerateCardTokenAsync(creditCard);

            var request = new PaymentCreateRequest
            {
                TransactionAmount = payModel.TransactionAmount,
                Token = card_token.Id,
                Description = payModel.TransactionDescription,
                Installments = payModel.Installments,
                PaymentMethodId = payModel.PaymentMethodId,
                Payer = new PaymentPayerRequest
                {
                    Email = payModel.Email,
                    Identification = new IdentificationRequest { Number = identification.Number, Type = identification.Type }
                },
                Capture = payModel.Capture
            };

            var client = CreatePaymentClient();
            Payment payment = await client.CreateAsync(request, requestOptions);

            return payment;
        }

        public async Task<Payment> CapturePaymentAsync(long paymentId, decimal amount = 0.0m)
        {
            MercadoPagoConfig.AccessToken = ACCESS_TOKEN;
            Payment payment;

            var client = CreatePaymentClient();

            if (amount == 0.0m)
                payment = await client.CaptureAsync(paymentId);
            else
                payment = await client.CaptureAsync(paymentId, amount);

            return payment;
        }

        public async Task<Payment> CancelCapturePaymentAsync(long paymentId)
        {
            MercadoPagoConfig.AccessToken = ACCESS_TOKEN;

            var client = CreatePaymentClient();
            Payment payment = await client.CancelAsync(paymentId);
            return payment;
        }

        private PaymentClient CreatePaymentClient()
        {
            if (_handler != null)
                return new PaymentClient(new DefaultHttpClient(new HttpClient(_handler)));
            return new PaymentClient();
        }

        #region Not Implemented
        public Task<Payment> GetPaymentCodeAsync(IPayment model, string contentType)
        {
            throw new System.NotImplementedException();
        }

        public Task<Payment> GetTransactionAsync(string notificationCode, string receiver, string token)
        {
            throw new System.NotImplementedException();
        }

        public Task<bool> ConfirmTransationAsync(string transaction, string referenceCode, string receiver, string token)
        {
            throw new System.NotImplementedException();
        }
        #endregion
    }
}
