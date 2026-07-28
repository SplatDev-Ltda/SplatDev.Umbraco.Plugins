namespace SplatDev.Messaging.Interfaces;

public interface ISmsService
{
    Task<SmsSendResult> SendAsync(string to, string body, CancellationToken cancellationToken = default);
    Task<SmsSendResult> SendAsync(string to, string body, string? from, CancellationToken cancellationToken = default);
}

public sealed record SmsSendResult
{
    public bool Success { get; init; }
    public string? MessageId { get; init; }
    public string? Error { get; init; }
    public int? StatusCode { get; init; }
    public string? RawResponse { get; init; }
}
