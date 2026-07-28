namespace SplatDev.Payments.MercadoPago.Requests
{
    using global::MercadoPago.Client;
    using global::MercadoPago.Client.Common;
    using global::MercadoPago.Client.Payment;
    using global::MercadoPago.Http;
    using global::MercadoPago.Resource.Payment;

    using System;
    using System.Net.Http;
    using System.Threading.Tasks;

    using SplatDev.Payments.Interfaces;
    using SplatDev.Payments.MercadoPago.Enum;

    public class PixPaymentRequest : IPayment<Payment>
    {
#pragma warning disable IDE0052 // Remove unread private members
        private readonly string PUBLIC_KEY;
#pragma warning restore IDE0052 // Remove unread private members
        private readonly string ACCESS_TOKEN;
        private readonly RequestOptions requestOptions;
        private readonly HttpMessageHandler? _handler;

        public PixPaymentRequest(string publicKey, string accessToken, HttpMessageHandler? handler = null)
        {
            ACCESS_TOKEN = accessToken;
            PUBLIC_KEY = publicKey;
            _handler = handler;
            requestOptions = new RequestOptions
            {
                AccessToken = ACCESS_TOKEN,
                RetryStrategy = new DefaultRetryStrategy(5)
            };
        }

        public async Task<Payment> CreatePaymentRequestAsync(IPayment model)
        {
            var pix = (Models.Pix)model;
            var request = new PaymentCreateRequest
            {
                TransactionAmount = pix.TransactionAmount,
                Description = pix.Description,
                PaymentMethodId = PaymentMethodTypes.Pix.StringName(),
                Payer = new PaymentPayerRequest
                {
                    Email = ((Models.Payer)pix.Payer).Email,
                    FirstName = ((Models.Payer)pix.Payer).FirstName,
                    LastName = ((Models.Payer)pix.Payer).LastName,
                    Identification = new IdentificationRequest
                    {
                        Type = ((Models.Payer)pix.Payer).Identification.Type,
                        Number = ((Models.Payer)pix.Payer).Identification.Number,
                    },
                },
                //By default, Pix payments expire in 24 hours. You can change this field date_of_expiration when creating the payment. The set date should be between 30 minutes and up to 30 days from issue date.
                DateOfExpiration = pix.ExpirationDate.AddDays(1).AddTicks(-1)
            };

            var client = CreatePaymentClient();
            Payment payment = await client.CreateAsync(request, requestOptions);
            return payment;
        }

        private PaymentClient CreatePaymentClient()
        {
            if (_handler != null)
                return new PaymentClient(new DefaultHttpClient(new HttpClient(_handler)));
            return new PaymentClient();
        }

        #region Not Implemented
        public Task<bool> ConfirmTransationAsync(string transaction, string referenceCode, string receiver, string token)
        {
            throw new NotImplementedException();
        }

        public Task<Payment> GetPaymentCodeAsync(IPayment model, string contentType)
        {
            throw new NotImplementedException();
        }

        public Task<Payment> GetTransactionAsync(string notificationCode, string receiver, string token)
        {
            throw new NotImplementedException();
        }
        #endregion
    }
}
