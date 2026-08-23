namespace SplatDev.Umbraco.Plugins.Restricted.Models;

/// <summary>A member group, as the pickers and the public-access rules each see it.</summary>
/// <remarks>
/// Both halves are needed. Umbraco stores a public-access member-role rule by group
/// <em>name</em>, while the backoffice pickers work in GUID keys, so a round trip through
/// the UI has to carry both or it cannot resolve one from the other.
/// </remarks>
public sealed class MemberGroupRef
{
    public Guid Key { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>A content node, resolved enough to show a human being.</summary>
public sealed class ContentRef
{
    public int Id { get; set; }
    public Guid Key { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>Breadcrumb of ancestor names, so two pages called "Login" are tellable apart.</summary>
    public string Path { get; set; } = string.Empty;
}

/// <summary>One protected branch and everything the editor needs to understand it.</summary>
public sealed class RestrictedNode
{
    public ContentRef Node { get; set; } = new();
    public ContentRef? LoginPage { get; set; }
    public ContentRef? ErrorPage { get; set; }
    public List<MemberGroupRef> MemberGroups { get; set; } = [];
}

/// <summary>
/// A request to protect a branch. Every reference is a free-form string on purpose.
/// </summary>
/// <remarks>
/// Umbraco 13's AngularJS pickers hand back integer ids or UDIs; Umbraco 17's
/// <c>umb-input-document</c> hands back GUID keys. Rather than fork the contract per
/// backoffice, each reference accepts an int, a GUID or a UDI and is resolved server-side.
/// </remarks>
public sealed class RestrictNodeRequest
{
    public string? Node { get; set; }
    public string? LoginPage { get; set; }
    public string? ErrorPage { get; set; }

    /// <summary>Group keys or names — resolved either way.</summary>
    public List<string> MemberGroups { get; set; } = [];
}

/// <summary>
/// What the node editor needs to show and amend the protection on a single page.
/// </summary>
/// <remarks>
/// Deliberately flatter than <see cref="RestrictedNode"/>: it names groups as the strings
/// <see cref="RestrictNodeRequest"/> accepts, and it carries an explicit
/// <see cref="Restricted"/> flag so an unprotected page is a value rather than an absence.
/// </remarks>
public sealed class RestrictionState
{
    public bool Restricted { get; set; }
    public List<string> MemberGroups { get; set; } = [];
    public string? LoginPage { get; set; }
    public string? ErrorPage { get; set; }
}
