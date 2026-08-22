using System.DirectoryServices.Protocols;
using System.Net;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using SplatDev.Directory.Abstractions;
using SplatDev.Directory.Configuration;
using SplatDev.Directory.Models;

namespace SplatDev.Directory.Ldap;

/// <summary>
/// Reads and writes an LDAP directory, including Active Directory.
/// </summary>
/// <remarks>
/// Built on System.DirectoryServices.Protocols rather than
/// System.DirectoryServices.AccountManagement: the latter is Windows-only, and an
/// Umbraco site that needs to look a user up may well be running on Linux. Protocols
/// covers search and add, which is all this needs.
///
/// Active Directory is an LDAP server with its own attribute names, so one provider
/// serves both and <see cref="LdapDirectoryOptions.UseActiveDirectorySchema"/> chooses
/// the mapping.
/// </remarks>
public class LdapDirectoryProvider : IDirectoryProvider
{
    private readonly DirectoryOptions _options;
    private readonly ILogger<LdapDirectoryProvider> _logger;

    public LdapDirectoryProvider(IOptions<DirectoryOptions> options, ILogger<LdapDirectoryProvider> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    private LdapDirectoryOptions Ldap => _options.Ldap;

    public string Name => Ldap.UseActiveDirectorySchema ? "Active Directory" : "LDAP";

    public bool IsConfigured => _options.Enabled && Ldap.IsConfigured;

    public bool CanCreateUsers =>
        IsConfigured
        && _options.AllowUserCreation
        && !string.IsNullOrWhiteSpace(_options.CreateUsersInOrganizationalUnit)
        && !string.IsNullOrWhiteSpace(Ldap.BindDn);

    // Attribute names differ between Active Directory and everything else.
    private string LoginAttribute => Ldap.UseActiveDirectorySchema ? "sAMAccountName" : "uid";
    private string ObjectClass => Ldap.UseActiveDirectorySchema ? "user" : "inetOrgPerson";

    private string[] ReadAttributes => Ldap.UseActiveDirectorySchema
        ? new[] { "sAMAccountName", "userPrincipalName", "displayName", "givenName", "sn", "mail", "department", "title", "distinguishedName", "userAccountControl" }
        : new[] { "uid", "cn", "displayName", "givenName", "sn", "mail", "departmentNumber", "title", "distinguishedName" };

    private LdapConnection Connect()
    {
        var identifier = new LdapDirectoryIdentifier(Ldap.Host, Ldap.Port);
        var connection = new LdapConnection(identifier)
        {
            AuthType = AuthType.Basic,
        };
        connection.SessionOptions.ProtocolVersion = 3;

        if (Ldap.UseSsl)
        {
            connection.SessionOptions.SecureSocketLayer = true;
        }

        if (!string.IsNullOrWhiteSpace(Ldap.BindDn))
        {
            connection.Credential = new NetworkCredential(Ldap.BindDn, Ldap.BindPassword);
        }

        connection.Bind();
        return connection;
    }

    /// <summary>
    /// Escapes a value before it goes into a search filter.
    /// </summary>
    /// <remarks>
    /// RFC 4515. Without this a search term containing ( ) * or \ changes the shape of
    /// the filter rather than being matched by it — the LDAP equivalent of SQL injection,
    /// and a term of "*" alone would enumerate the directory.
    /// </remarks>
    private static string Escape(string value)
    {
        var builder = new System.Text.StringBuilder(value.Length);
        foreach (var c in value)
        {
            builder.Append(c switch
            {
                '\\' => "\\5c",
                '*' => "\\2a",
                '(' => "\\28",
                ')' => "\\29",
                '\0' => "\\00",
                '/' => "\\2f",
                _ => c.ToString(),
            });
        }

        return builder.ToString();
    }

    private static string? Value(SearchResultEntry entry, string attribute)
    {
        if (!entry.Attributes.Contains(attribute)) return null;
        var values = entry.Attributes[attribute];
        return values.Count > 0 ? values[0]?.ToString() : null;
    }

    private DirectoryUser ToUser(SearchResultEntry entry)
    {
        var ad = Ldap.UseActiveDirectorySchema;
        var enabled = true;

        if (ad && int.TryParse(Value(entry, "userAccountControl"), out var uac))
        {
            // 0x2 is ACCOUNTDISABLE.
            enabled = (uac & 0x2) == 0;
        }

        return new DirectoryUser
        {
            Login = Value(entry, LoginAttribute) ?? string.Empty,
            UserPrincipalName = ad ? Value(entry, "userPrincipalName") : null,
            Domain = Ldap.Domain,
            DisplayName = Value(entry, "displayName") ?? Value(entry, "cn"),
            GivenName = Value(entry, "givenName"),
            Surname = Value(entry, "sn"),
            Email = Value(entry, "mail"),
            Department = Value(entry, ad ? "department" : "departmentNumber"),
            JobTitle = Value(entry, "title"),
            IsEnabled = enabled,
            DistinguishedName = entry.DistinguishedName,
            Source = Name,
        };
    }

    public Task<IReadOnlyList<DirectoryUser>> SearchUsersAsync(
        string term, int take = 25, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || string.IsNullOrWhiteSpace(term))
        {
            return Task.FromResult<IReadOnlyList<DirectoryUser>>(Array.Empty<DirectoryUser>());
        }

        try
        {
            using var connection = Connect();
            var t = Escape(term.Trim());
            var filter = $"(&(objectClass={ObjectClass})(|({LoginAttribute}=*{t}*)(displayName=*{t}*)(mail=*{t}*)))";

            var request = new SearchRequest(Ldap.BaseDn, filter, SearchScope.Subtree, ReadAttributes);
            request.SizeLimit = take;

            var response = (SearchResponse)connection.SendRequest(request);
            var users = response.Entries.Cast<SearchResultEntry>().Select(ToUser).ToList();
            return Task.FromResult<IReadOnlyList<DirectoryUser>>(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LDAP search for {Term} failed.", term);
            return Task.FromResult<IReadOnlyList<DirectoryUser>>(Array.Empty<DirectoryUser>());
        }
    }

    public Task<DirectoryUser?> FindUserAsync(string login, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || string.IsNullOrWhiteSpace(login)) return Task.FromResult<DirectoryUser?>(null);

        try
        {
            using var connection = Connect();
            var filter = $"(&(objectClass={ObjectClass})({LoginAttribute}={Escape(login.Trim())}))";
            var request = new SearchRequest(Ldap.BaseDn, filter, SearchScope.Subtree, ReadAttributes);
            var response = (SearchResponse)connection.SendRequest(request);

            var entry = response.Entries.Cast<SearchResultEntry>().FirstOrDefault();
            return Task.FromResult(entry is null ? null : ToUser(entry));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LDAP lookup of {Login} failed.", login);
            return Task.FromResult<DirectoryUser?>(null);
        }
    }

    public async Task<DirectoryOperationResult> CreateUserAsync(
        DirectoryUserDraft draft, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            return DirectoryOperationResult.NotConfigured("No directory is configured for this site.");

        if (!_options.AllowUserCreation)
            return DirectoryOperationResult.NotPermitted(
                "Creating accounts is switched off. Set Directory:AllowUserCreation to enable it.");

        var container = _options.CreateUsersInOrganizationalUnit;
        if (string.IsNullOrWhiteSpace(container))
            return DirectoryOperationResult.NotConfigured(
                "Creating accounts needs Directory:CreateUsersInOrganizationalUnit to say where they go.");

        // A draft may ask for a different container, but only one is allowed. Refuse
        // rather than quietly redirecting: a request naming somewhere privileged should
        // be visible, not silently rewritten.
        if (!string.IsNullOrWhiteSpace(draft.OrganizationalUnit)
            && !string.Equals(draft.OrganizationalUnit.Trim(), container.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return DirectoryOperationResult.NotPermitted(
                $"This site may only create accounts in {container}.");
        }

        if (string.IsNullOrWhiteSpace(draft.Login))
            return DirectoryOperationResult.Invalid("A login is required.");

        var existing = await FindUserAsync(draft.Login, cancellationToken).ConfigureAwait(false);
        if (existing is not null) return DirectoryOperationResult.AlreadyExists(existing);

        try
        {
            using var connection = Connect();
            var login = draft.Login.Trim();
            var display = string.IsNullOrWhiteSpace(draft.DisplayName)
                ? $"{draft.GivenName} {draft.Surname}".Trim()
                : draft.DisplayName.Trim();

            var dn = $"CN={Escape(display)},{container}";
            var request = new AddRequest(dn);
            var attrs = request.Attributes;

            attrs.Add(new DirectoryAttribute("objectClass", Ldap.UseActiveDirectorySchema
                ? new object[] { "top", "person", "organizationalPerson", "user" }
                : new object[] { "top", "person", "organizationalPerson", "inetOrgPerson" }));

            attrs.Add(new DirectoryAttribute(LoginAttribute, login));
            attrs.Add(new DirectoryAttribute("cn", display));
            attrs.Add(new DirectoryAttribute("sn", draft.Surname));
            if (!string.IsNullOrWhiteSpace(draft.GivenName)) attrs.Add(new DirectoryAttribute("givenName", draft.GivenName));
            if (!string.IsNullOrWhiteSpace(display)) attrs.Add(new DirectoryAttribute("displayName", display));
            if (!string.IsNullOrWhiteSpace(draft.Email)) attrs.Add(new DirectoryAttribute("mail", draft.Email));
            if (!string.IsNullOrWhiteSpace(draft.JobTitle)) attrs.Add(new DirectoryAttribute("title", draft.JobTitle));
            if (!string.IsNullOrWhiteSpace(draft.Telephone)) attrs.Add(new DirectoryAttribute("telephoneNumber", draft.Telephone));

            if (Ldap.UseActiveDirectorySchema)
            {
                if (!string.IsNullOrWhiteSpace(draft.Department)) attrs.Add(new DirectoryAttribute("department", draft.Department));
                if (!string.IsNullOrWhiteSpace(Ldap.Domain))
                    attrs.Add(new DirectoryAttribute("userPrincipalName", $"{login}@{Ldap.Domain}"));

                // 0x202 is NORMAL_ACCOUNT | ACCOUNTDISABLE. The account is created
                // disabled on purpose: Active Directory will not enable an account that
                // has no password, and this deliberately never handles one — see
                // DirectoryUserDraft. An administrator sets the password and enables it.
                attrs.Add(new DirectoryAttribute("userAccountControl", "514"));

                if (draft.RequirePasswordChange) attrs.Add(new DirectoryAttribute("pwdLastSet", "0"));
            }
            else if (!string.IsNullOrWhiteSpace(draft.Department))
            {
                attrs.Add(new DirectoryAttribute("departmentNumber", draft.Department));
            }

            connection.SendRequest(request);

            var created = await FindUserAsync(login, cancellationToken).ConfigureAwait(false)
                ?? new DirectoryUser { Login = login, DisplayName = display, Domain = Ldap.Domain, Source = Name };

            return DirectoryOperationResult.Success(
                Ldap.UseActiveDirectorySchema
                    ? $"Created {login}. The account is disabled until an administrator sets its password."
                    : $"Created {login}.",
                created);
        }
        catch (DirectoryOperationException ex)
        {
            _logger.LogError(ex, "Creating {Login} in the directory failed.", draft.Login);
            return DirectoryOperationResult.Failure($"The directory refused the request: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Creating {Login} in the directory failed.", draft.Login);
            return DirectoryOperationResult.Unavailable("The directory could not be reached.");
        }
    }

    public Task<DirectoryOperationResult> TestConnectionAsync(CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            return Task.FromResult(DirectoryOperationResult.NotConfigured("No LDAP host or base DN is configured."));

        try
        {
            using var connection = Connect();
            var request = new SearchRequest(Ldap.BaseDn, "(objectClass=*)", SearchScope.Base, "dn");
            connection.SendRequest(request);
            return Task.FromResult(DirectoryOperationResult.Success($"Connected to {Ldap.Host}."));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "LDAP connection test failed.");
            return Task.FromResult(DirectoryOperationResult.Unavailable($"Could not reach {Ldap.Host}: {ex.Message}"));
        }
    }
}
