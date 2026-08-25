using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using SplatDev.Payments.Stripe.Data;
using Xunit;

namespace SplatDev.Payments.Stripe.Tests;

public class StripeAuditInterceptorTests
{
    [Fact]
    public async Task Inserts_AuditLogGenerated()
    {
        var loggerMock = new Mock<ILogger<StripeAuditInterceptor>>();
        var interceptor = new StripeAuditInterceptor(loggerMock.Object);
        var db = CreateDbContext(interceptor);

        db.PaymentRecords.Add(new PaymentRecord
        {
            PaymentIntentId = "pi_audit_001",
            Currency = "brl",
            Amount = 10000,
            Status = "succeeded"
        });
        await db.SaveChangesAsync();

        loggerMock.Verify(
            x => x.Log(LogLevel.Information, It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, _) => o.ToString()!.Contains("[AUDIT] INSERT PaymentRecord")),
                It.IsAny<Exception>(), It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Updates_AuditLogGenerated()
    {
        var loggerMock = new Mock<ILogger<StripeAuditInterceptor>>();
        var interceptor = new StripeAuditInterceptor(loggerMock.Object);
        var db = CreateDbContext(interceptor);

        var record = new PaymentRecord
        {
            PaymentIntentId = "pi_audit_002",
            Currency = "brl",
            Amount = 5000,
            Status = "pending"
        };
        db.PaymentRecords.Add(record);
        await db.SaveChangesAsync();
        loggerMock.Invocations.Clear();

        record.Status = "succeeded";
        await db.SaveChangesAsync();

        loggerMock.Verify(
            x => x.Log(LogLevel.Information, It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, _) => o.ToString()!.Contains("[AUDIT] UPDATE PaymentRecord")),
                It.IsAny<Exception>(), It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Deletes_AuditLogGenerated()
    {
        var loggerMock = new Mock<ILogger<StripeAuditInterceptor>>();
        var interceptor = new StripeAuditInterceptor(loggerMock.Object);
        var db = CreateDbContext(interceptor);

        var record = new PaymentRecord
        {
            PaymentIntentId = "pi_audit_003",
            Currency = "brl",
            Amount = 1000,
            Status = "canceled"
        };
        db.PaymentRecords.Add(record);
        await db.SaveChangesAsync();
        loggerMock.Invocations.Clear();

        db.PaymentRecords.Remove(record);
        await db.SaveChangesAsync();

        loggerMock.Verify(
            x => x.Log(LogLevel.Information, It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, _) => o.ToString()!.Contains("[AUDIT] DELETE PaymentRecord")),
                It.IsAny<Exception>(), It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task NoChanges_NoAuditLogGenerated()
    {
        var loggerMock = new Mock<ILogger<StripeAuditInterceptor>>();
        var interceptor = new StripeAuditInterceptor(loggerMock.Object);
        var db = CreateDbContext(interceptor);

        var record = new PaymentRecord
        {
            PaymentIntentId = "pi_audit_004",
            Currency = "brl",
            Amount = 100,
            Status = "test"
        };
        db.PaymentRecords.Add(record);
        await db.SaveChangesAsync();
        loggerMock.Invocations.Clear();

        var sameRecord = await db.PaymentRecords.FirstAsync();
        await db.SaveChangesAsync();

        loggerMock.Verify(
            x => x.Log(LogLevel.Information, It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, _) => o.ToString()!.Contains("[AUDIT]")),
                It.IsAny<Exception>(), It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Never);
    }

    [Fact]
    public async Task InsertAuditLog_ContainsPropertyData()
    {
        var loggerMock = new Mock<ILogger<StripeAuditInterceptor>>();
        var interceptor = new StripeAuditInterceptor(loggerMock.Object);
        var db = CreateDbContext(interceptor);

        db.PaymentRecords.Add(new PaymentRecord
        {
            PaymentIntentId = "pi_json_005",
            Currency = "usd",
            Amount = 9999,
            Status = "completed",
            CustomerEmail = "verify@example.com"
        });
        await db.SaveChangesAsync();

        loggerMock.Verify(
            x => x.Log(LogLevel.Information, It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, _) =>
                    o.ToString()!.Contains("\"PaymentIntentId\"") &&
                    o.ToString()!.Contains("\"CustomerEmail\"") &&
                    o.ToString()!.Contains("\"Currency\"")),
                It.IsAny<Exception>(), It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    private static StripePaymentDbContext CreateDbContext(StripeAuditInterceptor interceptor)
    {
        var options = new DbContextOptionsBuilder<StripePaymentDbContext>()
            .AddInterceptors(interceptor)
            .UseInMemoryDatabase($"Stripe_Audit_{Guid.NewGuid()}")
            .Options;
        return new StripePaymentDbContext(options);
    }
}
