namespace SplatDev.Directory.Configuration;

/// <summary>
/// How a site talks to its directory, and what it is allowed to do there.
/// </summary>
/// <remarks>
/// Creating accounts is off unless a site turns it on, and even then it is confined to
/// one container. A CMS dashboard that can write anywhere in a directory is a much
/// larger thing than a CMS dashboard, and the person configuring the site — not the
/// person using it — is the one who should decide the blast radius.
/// </remarks>
public class DirectoryOptions
{
    public const string SectionName = "Directory";

    /// <summary>Whether directory lookups are available at all.</summary>
    public bool Enabled { get; set; }

    /// <summary>Which provider to prefer when more than one is registered.</summary>
    public string? DefaultProvider { get; set; }

    /// <summary>
    /// Whether accounts may be created from the backoffice. Off by default, and
    /// meaningless without <see cref="CreateUsersInOrganizationalUnit"/> on directories
    /// that have a tree.
    /// </summary>
    public bool AllowUserCreation { get; set; }

    /// <summary>
    /// The one container new accounts may be created in. A create request naming
    /// anywhere else is refused rather than redirected, so a misconfigured or hostile
    /// request cannot place an account somewhere privileged.
    /// </summary>
    public string? CreateUsersInOrganizationalUnit { get; set; }

    /// <summary>Groups every account created here is added to.</summary>
    public List<string> DefaultGroups { get; set; } = new();

    public LdapDirectoryOptions Ldap { get; set; } = new();
    public EntraDirectoryOptions Entra { get; set; } = new();
}

/// <summary>
/// Connection details for Active Directory or any other LDAP server.
/// </summary>
/// <remarks>
/// Active Directory is an LDAP server with particular attribute names, so one provider
/// serves both: <see cref="UseActiveDirectorySchema"/> switches the attribute mapping
/// between AD's (sAMAccountName, userPrincipalName, userAccountControl) and the
/// vendor-neutral ones (uid, mail, inetOrgPerson).
/// </remarks>
public class LdapDirectoryOptions
{
    public string? Host { get; set; }
    public int Port { get; set; } = 389;
    public bool UseSsl { get; set; }

    /// <summary>Where searches start, e.g. DC=example,DC=com.</summary>
    public string? BaseDn { get; set; }

    /// <summary>The account used to read the directory. Needs no special rights.</summary>
    public string? BindDn { get; set; }

    /// <summary>
    /// The bind account's password. Belongs in a secret store or an environment
    /// variable, never in a checked-in appsettings.json.
    /// </summary>
    public string? BindPassword { get; set; }

    /// <summary>The NetBIOS domain an RDP profile should use, when it differs from the host.</summary>
    public string? Domain { get; set; }

    /// <summary>Whether to use Active Directory's attribute names rather than generic LDAP ones.</summary>
    public bool UseActiveDirectorySchema { get; set; } = true;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Host) && !string.IsNullOrWhiteSpace(BaseDn);
}

/// <summary>Application-credentials details for Entra ID through Microsoft Graph.</summary>
public class EntraDirectoryOptions
{
    public string? TenantId { get; set; }
    public string? ClientId { get; set; }

    /// <summary>
    /// The application's secret. Belongs in a secret store or an environment variable.
    /// </summary>
    public string? ClientSecret { get; set; }

    /// <summary>
    /// The domain new accounts are created under, e.g. contoso.onmicrosoft.com. Required
    /// before Entra can create anyone, because a UPN has to belong to a verified domain.
    /// </summary>
    public string? UserPrincipalNameDomain { get; set; }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(TenantId)
        && !string.IsNullOrWhiteSpace(ClientId)
        && !string.IsNullOrWhiteSpace(ClientSecret);
}
