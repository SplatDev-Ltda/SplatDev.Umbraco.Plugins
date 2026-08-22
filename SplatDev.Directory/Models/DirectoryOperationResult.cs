namespace SplatDev.Directory.Models;

/// <summary>Why an operation did or did not happen.</summary>
public enum DirectoryOutcome
{
    Succeeded,
    AlreadyExists,
    NotConfigured,
    NotPermitted,
    ValidationFailed,
    DirectoryUnavailable,
    Failed,
}

/// <summary>
/// The result of an operation, saying plainly what happened.
/// </summary>
/// <remarks>
/// Returned rather than thrown. "That user already exists" is an ordinary answer to
/// "create this user" and the caller wants to show which account it found, not catch an
/// exception; the same goes for "creating users is switched off here".
/// </remarks>
public class DirectoryOperationResult
{
    public DirectoryOutcome Outcome { get; set; }

    public bool Succeeded => Outcome == DirectoryOutcome.Succeeded;

    /// <summary>A sentence fit to show someone, never a stack trace.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>The account involved, when there is one — created, or found to exist.</summary>
    public DirectoryUser? User { get; set; }

    public static DirectoryOperationResult Success(string message, DirectoryUser? user = null)
        => new() { Outcome = DirectoryOutcome.Succeeded, Message = message, User = user };

    public static DirectoryOperationResult AlreadyExists(DirectoryUser user)
        => new()
        {
            Outcome = DirectoryOutcome.AlreadyExists,
            Message = $"An account already exists for {user.Login}.",
            User = user,
        };

    public static DirectoryOperationResult NotConfigured(string message)
        => new() { Outcome = DirectoryOutcome.NotConfigured, Message = message };

    public static DirectoryOperationResult NotPermitted(string message)
        => new() { Outcome = DirectoryOutcome.NotPermitted, Message = message };

    public static DirectoryOperationResult Invalid(string message)
        => new() { Outcome = DirectoryOutcome.ValidationFailed, Message = message };

    public static DirectoryOperationResult Unavailable(string message)
        => new() { Outcome = DirectoryOutcome.DirectoryUnavailable, Message = message };

    public static DirectoryOperationResult Failure(string message)
        => new() { Outcome = DirectoryOutcome.Failed, Message = message };
}
