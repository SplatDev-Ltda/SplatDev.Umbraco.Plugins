namespace SplatDev.Payments.Stripe.Services
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Extensions.Options;
    using SplatDev.Payments.Stripe.Models;
    using PIntent = global::Stripe.PaymentIntent;
    using PIntentService = global::Stripe.PaymentIntentService;
    using PIntentCreateOptions = global::Stripe.PaymentIntentCreateOptions;
    using PIntentConfirmOptions = global::Stripe.PaymentIntentConfirmOptions;
    using PIntentCancelOptions = global::Stripe.PaymentIntentCancelOptions;
    using PIntentCaptureOptions = global::Stripe.PaymentIntentCaptureOptions;
    using PIntentAutomaticPMOptions = global::Stripe.PaymentIntentAutomaticPaymentMethodsOptions;
    using CustomerService = global::Stripe.CustomerService;
    using CustomerCreateOptions = global::Stripe.CustomerCreateOptions;
    using SessionService = global::Stripe.Checkout.SessionService;
    using SessionCreateOptions = global::Stripe.Checkout.SessionCreateOptions;
    using SessionLineItemOptions = global::Stripe.Checkout.SessionLineItemOptions;
    using SessionLineItemPriceDataOptions = global::Stripe.Checkout.SessionLineItemPriceDataOptions;
    using SessionLineItemPriceDataProductDataOptions = global::Stripe.Checkout.SessionLineItemPriceDataProductDataOptions;
    using RefundService = global::Stripe.RefundService;
    using RefundCreateOptions = global::Stripe.RefundCreateOptions;
    using SubscriptionService = global::Stripe.SubscriptionService;
    using SubscriptionCreateOptions = global::Stripe.SubscriptionCreateOptions;
    using SubscriptionCancelOptions = global::Stripe.SubscriptionCancelOptions;
    using SubscriptionItemOptions = global::Stripe.SubscriptionItemOptions;
    using EventUtility = global::Stripe.EventUtility;
    using StripeConfiguration = global::Stripe.StripeConfiguration;
    using StripeException = global::Stripe.StripeException;

    public class StripeService
    {
        public StripeService(IOptions<StripeOptions> options)
        {
            StripeConfiguration.ApiKey = options.Value.ApiKey;
        }

        public async Task<PIntent> CreatePaymentIntentAsync(
            long amount,
            string currency,
            string? customerId = null,
            string? paymentMethodId = null,
            string? description = null,
            Dictionary<string, string>? metadata = null,
            bool captureMethod = true,
            CancellationToken ct = default)
        {
            var options = new PIntentCreateOptions
            {
                Amount = amount,
                Currency = currency,
                CaptureMethod = captureMethod ? "automatic" : "manual",
                Customer = customerId,
                PaymentMethod = paymentMethodId,
                Description = description,
                Metadata = metadata,
                AutomaticPaymentMethods = paymentMethodId is null
                    ? new PIntentAutomaticPMOptions { Enabled = true }
                    : null
            };

            var service = new PIntentService();
            return await service.CreateAsync(options, cancellationToken: ct);
        }

        public async Task<PIntent> ConfirmPaymentIntentAsync(
            string paymentIntentId,
            string? paymentMethodId = null,
            CancellationToken ct = default)
        {
            var options = new PIntentConfirmOptions();
            if (paymentMethodId is not null)
                options.PaymentMethod = paymentMethodId;

            var service = new PIntentService();
            return await service.ConfirmAsync(paymentIntentId, options, cancellationToken: ct);
        }

        public async Task<PIntent> GetPaymentIntentAsync(
            string paymentIntentId,
            CancellationToken ct = default)
        {
            var service = new PIntentService();
            return await service.GetAsync(paymentIntentId, cancellationToken: ct);
        }

        public async Task<PIntent> CancelPaymentIntentAsync(
            string paymentIntentId,
            CancellationToken ct = default)
        {
            var options = new PIntentCancelOptions();
            var service = new PIntentService();
            return await service.CancelAsync(paymentIntentId, options, cancellationToken: ct);
        }

        public async Task<PIntent> CapturePaymentIntentAsync(
            string paymentIntentId,
            long? amountToCapture = null,
            CancellationToken ct = default)
        {
            var options = new PIntentCaptureOptions();
            if (amountToCapture.HasValue)
                options.AmountToCapture = amountToCapture.Value;

            var service = new PIntentService();
            return await service.CaptureAsync(paymentIntentId, options, cancellationToken: ct);
        }

        public async Task<global::Stripe.Refund> RefundPaymentIntentAsync(
            string paymentIntentId,
            long? amount = null,
            string? reason = null,
            CancellationToken ct = default)
        {
            var options = new RefundCreateOptions
            {
                PaymentIntent = paymentIntentId,
                Amount = amount,
                Reason = reason
            };

            var service = new RefundService();
            return await service.CreateAsync(options, cancellationToken: ct);
        }

        public async Task<global::Stripe.Customer> CreateCustomerAsync(
            string email,
            string? name = null,
            string? paymentMethodId = null,
            Dictionary<string, string>? metadata = null,
            CancellationToken ct = default)
        {
            var options = new CustomerCreateOptions
            {
                Email = email,
                Name = name,
                PaymentMethod = paymentMethodId,
                Metadata = metadata
            };

            var service = new CustomerService();
            return await service.CreateAsync(options, cancellationToken: ct);
        }

        public async Task<global::Stripe.Customer> GetCustomerAsync(
            string customerId,
            CancellationToken ct = default)
        {
            var service = new CustomerService();
            return await service.GetAsync(customerId, cancellationToken: ct);
        }

        public async Task<global::Stripe.Checkout.Session> CreateCheckoutSessionAsync(
            string successUrl,
            string cancelUrl,
            string? customerId = null,
            List<SessionLineItemOptions>? lineItems = null,
            string mode = "payment",
            CancellationToken ct = default)
        {
            var options = new SessionCreateOptions
            {
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                Customer = customerId,
                Mode = mode,
                LineItems = lineItems ?? new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "usd",
                            ProductData = new SessionLineItemPriceDataProductDataOptions { Name = "Checkout" },
                            UnitAmount = 0
                        },
                        Quantity = 1
                    }
                }
            };

            var service = new SessionService();
            return await service.CreateAsync(options, cancellationToken: ct);
        }

        public global::Stripe.Event ConstructWebhookEvent(string json, string signatureHeader, string webhookSecret)
        {
            return EventUtility.ConstructEvent(
                json, signatureHeader, webhookSecret, throwOnApiVersionMismatch: false);
        }

        public async Task<global::Stripe.Subscription> CreateSubscriptionAsync(
            string customerId,
            string priceId,
            CancellationToken ct = default)
        {
            var options = new SubscriptionCreateOptions
            {
                Customer = customerId,
                Items = new List<SubscriptionItemOptions>
                {
                    new SubscriptionItemOptions { Price = priceId }
                }
            };

            var service = new SubscriptionService();
            return await service.CreateAsync(options, cancellationToken: ct);
        }

        public async Task<global::Stripe.Subscription> CancelSubscriptionAsync(
            string subscriptionId,
            CancellationToken ct = default)
        {
            var options = new SubscriptionCancelOptions();
            var service = new SubscriptionService();
            return await service.CancelAsync(subscriptionId, options, cancellationToken: ct);
        }
    }
}
