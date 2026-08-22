using System.ComponentModel.DataAnnotations;

namespace SplatDev.Directory.Models;

/// <summary>
/// The details needed to create an account, and the optional ones worth setting while
/// you are there.
/// </summary>
/// <remarks>
/// No password field. A password typed into a CMS form travels through the browser, the
/// request log and anything in between; providers here create the account and leave it
/// requiring a password reset at first sign-on, which is what an administrator would do
/// by hand anyway. <see cref="RequirePasswordChange"/> exists to make that explicit
/// rather than implicit.
/// </remarks>
public class DirectoryUserDraft
{
    /// <summary>The login to create. Required.</summary>
    [Required, MaxLength(64)]
    public string Login { get; set; } = string.Empty;

    [Required, MaxLength(128)]
    public string GivenName { get; set; } = string.Empty;

    [Required, MaxLength(128)]
    public string Surname { get; set; } = string.Empty;

    /// <summary>Shown in the directory. Built from the names when left empty.</summary>
    [MaxLength(256)]
    public string? DisplayName { get; set; }

    [EmailAddress, MaxLength(256)]
    public string? Email { get; set; }

    [MaxLength(128)]
    public string? Department { get; set; }

    [MaxLength(128)]
    public string? JobTitle { get; set; }

    [MaxLength(64)]
    public string? Telephone { get; set; }

    /// <summary>
    /// Where to put the account. Ignored by directories without a tree, and refused when
    /// it falls outside the container the site is configured to write to.
    /// </summary>
    [MaxLength(512)]
    public string? OrganizationalUnit { get; set; }

    /// <summary>Groups to add the account to, by name.</summary>
    public List<string> Groups { get; set; } = new();

    /// <summary>Whether the account must set a password at first sign-on. On by default.</summary>
    public bool RequirePasswordChange { get; set; } = true;

    /// <summary>Whether the account is usable immediately.</summary>
    public bool Enabled { get; set; } = true;
}
