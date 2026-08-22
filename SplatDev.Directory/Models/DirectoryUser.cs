namespace SplatDev.Directory.Models;

/// <summary>
/// A person as a directory describes them, reduced to what a remote-desktop profile and
/// a picker need.
/// </summary>
/// <remarks>
/// Deliberately not the provider's own object. An Active Directory result and a Graph
/// result have almost nothing in common structurally, and passing either one outward
/// would leak the provider into every caller — and, in Graph's case, a great deal more
/// personal data than anyone here asked for.
/// </remarks>
public class DirectoryUser
{
    /// <summary>The login used to sign in: sAMAccountName on AD, UPN on Entra.</summary>
    public string Login { get; set; } = string.Empty;

    /// <summary>The fully qualified name, where the directory has one.</summary>
    public string? UserPrincipalName { get; set; }

    /// <summary>NetBIOS or DNS domain, which an RDP profile needs separately from the login.</summary>
    public string? Domain { get; set; }

    public string? DisplayName { get; set; }
    public string? GivenName { get; set; }
    public string? Surname { get; set; }
    public string? Email { get; set; }
    public string? Department { get; set; }
    public string? JobTitle { get; set; }

    /// <summary>Whether the account is usable — not disabled, not locked out.</summary>
    public bool IsEnabled { get; set; } = true;

    /// <summary>Where the account lives, for display. Null on directories without a tree.</summary>
    public string? DistinguishedName { get; set; }

    /// <summary>The provider that supplied this, when several are registered.</summary>
    public string? Source { get; set; }
}
