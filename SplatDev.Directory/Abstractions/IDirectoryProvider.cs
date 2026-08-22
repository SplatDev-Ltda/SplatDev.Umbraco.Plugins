using SplatDev.Directory.Models;

namespace SplatDev.Directory.Abstractions;

/// <summary>
/// A directory that can be searched for people, and optionally written to.
/// </summary>
/// <remarks>
/// The contract is deliberately small and provider-neutral: on-premises Active
/// Directory, a generic LDAP server and Entra ID all answer the same three questions —
/// who matches this search, what do you know about this one person, and can I add
/// someone. Everything provider-specific (attribute names, base DN, Graph scopes) stays
/// behind the implementation.
///
/// Writing is separated from reading on purpose. Reading a directory needs a bind
/// account with no special rights; creating an account needs delegated write access to a
/// specific place in the tree, and a site should be able to have the first without ever
/// enabling the second. <see cref="CanCreateUsers"/> is what a UI should ask before
/// offering a create button, and <see cref="CreateUserAsync"/> refuses rather than throws
/// when creation is off.
/// </remarks>
public interface IDirectoryProvider
{
    /// <summary>Which provider this is, for display and for choosing between several.</summary>
    string Name { get; }

    /// <summary>Whether this provider has enough configuration to be used at all.</summary>
    bool IsConfigured { get; }

    /// <summary>
    /// Whether creating accounts is both supported and switched on for this site.
    /// </summary>
    bool CanCreateUsers { get; }

    /// <summary>Finds people matching a free-text term (name, login or e-mail).</summary>
    Task<IReadOnlyList<DirectoryUser>> SearchUsersAsync(
        string term,
        int take = 25,
        CancellationToken cancellationToken = default);

    /// <summary>Reads one person by their login, or null when there is no such account.</summary>
    Task<DirectoryUser?> FindUserAsync(
        string login,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates an account, or reports why it did not.
    /// </summary>
    /// <remarks>
    /// Returns <see cref="DirectoryOperationResult.AlreadyExists"/> with the existing
    /// login rather than failing, so a caller can say "that user already exists" and show
    /// which one it found.
    /// </remarks>
    Task<DirectoryOperationResult> CreateUserAsync(
        DirectoryUserDraft draft,
        CancellationToken cancellationToken = default);

    /// <summary>Checks the directory answers, without changing anything.</summary>
    Task<DirectoryOperationResult> TestConnectionAsync(CancellationToken cancellationToken = default);
}
