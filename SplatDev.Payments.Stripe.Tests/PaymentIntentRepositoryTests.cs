using Microsoft.EntityFrameworkCore;
using SplatDev.Payments.Stripe.Data;
using SplatDev.Payments.Stripe.Interfaces;
using SplatDev.Payments.Stripe.Services;
using Xunit;

namespace SplatDev.Payments.Stripe.Tests;

public class PaymentIntentRepositoryTests : IDisposable
{
    private readonly StripePaymentDbContext _db;
    private readonly PaymentIntentRepository _repository;

    public PaymentIntentRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<StripePaymentDbContext>()
            .UseInMemoryDatabase($"Stripe_Test_{Guid.NewGuid()}")
            .Options;
        _db = new StripePaymentDbContext(options);
        _repository = new PaymentIntentRepository(_db);
    }

    [Fact]
    public async Task IsEventProcessedAsync_NewEvent_ReturnsFalse()
    {
        var result = await _repository.IsEventProcessedAsync("evt_test_123");
        Assert.False(result);
    }

    [Fact]
    public async Task MarkEventProcessed_ThenIsEventProcessed_ReturnsTrue()
    {
        var record = new PaymentRecord
        {
            PaymentIntentId = "pi_test_456",
            Currency = "usd",
            Amount = 5000,
            Status = "succeeded"
        };

        await _repository.MarkEventProcessedAsync("evt_test_123", record);

        var result = await _repository.IsEventProcessedAsync("evt_test_123");
        Assert.True(result);
    }

    [Fact]
    public async Task MarkEventProcessed_DuplicateEvent_StillPersistsIdempotencyKey()
    {
        var record = new PaymentRecord { Currency = "usd", Amount = 100, Status = "test" };
        await _repository.MarkEventProcessedAsync("evt_duplicate", record);

        var alreadyProcessed = await _repository.IsEventProcessedAsync("evt_duplicate");
        Assert.True(alreadyProcessed);

        var duplicate = new PaymentRecord { Currency = "usd", Amount = 200, Status = "test" };
        await _repository.MarkEventProcessedAsync("evt_duplicate", duplicate);

        var count = await _db.PaymentRecords.CountAsync(r => r.StripeEventId == "evt_duplicate");
        Assert.True(count >= 1);
    }

    [Fact]
    public async Task GetByPaymentIntentId_ReturnsCorrectRecord()
    {
        var record = new PaymentRecord
        {
            StripeEventId = "evt_1",
            PaymentIntentId = "pi_find_me",
            Currency = "brl",
            Amount = 9999,
            Status = "succeeded"
        };
        _db.PaymentRecords.Add(record);
        await _db.SaveChangesAsync();

        var found = await _repository.GetByPaymentIntentIdAsync("pi_find_me");

        Assert.NotNull(found);
        Assert.Equal("evt_1", found!.StripeEventId);
        Assert.Equal("brl", found.Currency);
    }

    public void Dispose() => _db.Dispose();
}
