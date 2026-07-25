namespace SplatDev.Payments.MercadoPago.Requests
{
    using global::MercadoPago.Client;
    using global::MercadoPago.Client.Common;
    using global::MercadoPago.Client.Payment;
    using global::MercadoPago.Http;
    using global::MercadoPago.Resource.Payment;

    using SplatDev.Payments.Interfaces;
    using SplatDev.Payments.MercadoPago.Enum;

    using System;
    using System.Net.Http;
    using System.Threading.Tasks;

    public class TicketPaymentRequest : IPayment<Payment>
    {
#pragma warning disable IDE0052 // Remove unread private members
        private readonly string PUBLIC_KEY;
#pragma warning restore IDE0052 // Remove unread private members
        private readonly string ACCESS_TOKEN;
        private readonly RequestOptions requestOptions;
        private readonly HttpMessageHandler? _handler;

        public TicketPaymentRequest(string publicKey, string accessToken, HttpMessageHandler? handler = null)
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
            var ticket = (Models.Ticket)model;
            var request = new PaymentCreateRequest
            {
                TransactionAmount = ticket.TransactionAmount,
                Description = "Product Title",
                PaymentMethodId = PaymentMethodTypes.BolBradesco.StringName(),
                Payer = new PaymentPayerRequest
                {
                    Email = ((Models.Payer)ticket.Payer).Email,
                    FirstName = ((Models.Payer)ticket.Payer).FirstName,
                    LastName = ((Models.Payer)ticket.Payer).LastName,
                    Identification = new IdentificationRequest
                    {
                        Type = ((Models.Payer)ticket.Payer).Identification.Type,
                        Number = ((Models.Payer)ticket.Payer).Identification.Number,
                    },
                },
                //The default expiration date for boleto payments is 3 days. If you want, you can change this date by sending the date_of_expiration field in the payment creation request. The configured date must be between 1 and 30 days from the issue date.
                DateOfExpiration = ticket.ExpirationDate.AddDays(1).AddTicks(-1)
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
