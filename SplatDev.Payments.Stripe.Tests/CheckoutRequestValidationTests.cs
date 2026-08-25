using System.ComponentModel.DataAnnotations;
using Xunit;

namespace SplatDev.Payments.Stripe.Tests;

public class CheckoutRequestValidationTests
{
    [Fact]
    public void ValidRequest_PassesAllValidation()
    {
        var request = new CheckoutRequest
        {
            Description = "Consulta Dermatológica",
            Quantity = 1,
            UnitAmount = 299.90m,
            Currency = "brl",
            CustomerEmail = "paciente@exemplo.com",
            ClientReferenceId = "order-123"
        };

        var results = Validate(request);
        Assert.Empty(results);
    }

    [Fact]
    public void DescriptionMissing_FailsValidation()
    {
        var request = new CheckoutRequest { Description = "" };

        var results = Validate(request);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CheckoutRequest.Description)));
    }

    [Fact]
    public void DescriptionExceedsMaxLength_FailsValidation()
    {
        var request = new CheckoutRequest
        {
            Description = new string('X', 201)
        };

        var results = Validate(request);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CheckoutRequest.Description)));
    }

    [Fact]
    public void QuantityZero_FailsValidation()
    {
        var request = new CheckoutRequest
        {
            Description = "Test",
            Quantity = 0
        };

        var results = Validate(request);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CheckoutRequest.Quantity)));
    }

    [Fact]
    public void DefaultValues_AreCorrect()
    {
        var request = new CheckoutRequest();

        Assert.Equal(string.Empty, request.Description);
        Assert.Equal(1, request.Quantity);
        Assert.Equal(0m, request.UnitAmount);
        Assert.Equal("usd", request.Currency);
        Assert.Null(request.CustomerEmail);
        Assert.Null(request.ClientReferenceId);
        Assert.Null(request.Metadata);
    }

    [Fact]
    public void Metadata_CanBeSet()
    {
        var request = new CheckoutRequest
        {
            Description = "Meta Test",
            Quantity = 1,
            Metadata = new Dictionary<string, string>
            {
                ["order_id"] = "ORD-999",
                ["source"] = "derma-inova-web"
            }
        };

        var results = Validate(request);
        Assert.Empty(results);
    }

    [Fact]
    public void CustomerEmailExceedsMaxLength_FailsValidation()
    {
        var request = new CheckoutRequest
        {
            Description = "Test",
            Quantity = 1,
            CustomerEmail = new string('a', 501)
        };

        var results = Validate(request);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(CheckoutRequest.CustomerEmail)));
    }

    private static List<ValidationResult> Validate(CheckoutRequest request)
    {
        var results = new List<ValidationResult>();
        var context = new ValidationContext(request);
        Validator.TryValidateObject(request, context, results, validateAllProperties: true);
        return results;
    }
}
