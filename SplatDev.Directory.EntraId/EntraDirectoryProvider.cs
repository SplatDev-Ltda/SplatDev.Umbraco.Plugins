using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;

using SplatDev.Directory.Abstractions;
using SplatDev.Directory.Configuration;
using SplatDev.Directory.Models;

namespace SplatDev.Directory.EntraId;

/// <summary>
/// Reads and writes Entra ID through Microsoft Graph.
/// </summary>
/// <remarks>
/// Talks to Graph over HTTP with a token from MSAL rather than taking the Graph SDK as a
/// dependency. Three endpoints are needed — list users, get a user, create a user — and
/// the SDK is a large thing to carry into every site for that.
///
/// Reading needs User.Read.All; creating needs User.ReadWrite.All, which a site should
/// only grant if it actually intends to create accounts here.
/// </remarks>
public class EntraDirectoryProvider : IDirectoryProvider
{
    private const string GraphBase = "https://graph.microsoft.com/v1.0";
    private static readonly string[] Scopes = { "https://graph.microsoft.com/.default" };

    private readonly DirectoryOptions _options;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<EntraDirectoryProvider> _logger;

    public EntraDirectoryProvider(
        IOptions<DirectoryOptions> options,
        IHttpClientFactory httpClientFactory,
        ILogger<EntraDirectoryProvider> logger)
    {
        _options = options.Value;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    private EntraDirectoryOptions Entra => _options.Entra;

    public string Name => "Entra ID";

    public bool IsConfigured => _options.Enabled && Entra.IsConfigured;

    public bool CanCreateUsers =>
        IsConfigured
        && _options.AllowUserCreation
        && !string.IsNullOrWhiteSpace(Entra.UserPrincipalNameDomain);

    private async Task<HttpClient?> GraphAsync(CancellationToken cancellationToken)
    {
        try
        {
            var app = ConfidentialClientApplicationBuilder
                .Create(Entra.ClientId)
                .WithClientSecret(Entra.ClientSecret)
                .WithAuthority($"https://login.microsoftonline.com/{Entra.TenantId}")
                .Build();

            var token = await app.AcquireTokenForClient(Scopes).ExecuteAsync(cancellationToken).ConfigureAwait(false);

            var client = _httpClientFactory.CreateClient("SplatDev.Directory.EntraId");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
            return client;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Could not acquire a Graph token for tenant {TenantId}.", Entra.TenantId);
            return null;
        }
    }

    private sealed class GraphUser
    {
        [JsonPropertyName("id")] public string? Id { get; set; }
        [JsonPropertyName("userPrincipalName")] public string? UserPrincipalName { get; set; }
        [JsonPropertyName("displayName")] public string? DisplayName { get; set; }
        [JsonPropertyName("givenName")] public string? GivenName { get; set; }
        [JsonPropertyName("surname")] public string? Surname { get; set; }
        [JsonPropertyName("mail")] public string? Mail { get; set; }
        [JsonPropertyName("department")] public string? Department { get; set; }
        [JsonPropertyName("jobTitle")] public string? JobTitle { get; set; }
        [JsonPropertyName("accountEnabled")] public bool? AccountEnabled { get; set; }
    }

    private sealed class GraphList
    {
        [JsonPropertyName("value")] public List<GraphUser> Value { get; set; } = new();
    }

    private DirectoryUser ToUser(GraphUser u) => new()
    {
        // Entra signs in by UPN; the part before the @ is what an RDP profile wants when
        // the host is domain-joined to a synced domain.
        Login = u.UserPrincipalName?.Split('@').FirstOrDefault() ?? u.UserPrincipalName ?? string.Empty,
        UserPrincipalName = u.UserPrincipalName,
        Domain = u.UserPrincipalName?.Split('@').Skip(1).FirstOrDefault() ?? Entra.UserPrincipalNameDomain,
        DisplayName = u.DisplayName,
        GivenName = u.GivenName,
        Surname = u.Surname,
        Email = u.Mail,
        Department = u.Department,
        JobTitle = u.JobTitle,
        IsEnabled = u.AccountEnabled ?? true,
        Source = Name,
    };

    private const string SelectFields =
        "id,userPrincipalName,displayName,givenName,surname,mail,department,jobTitle,accountEnabled";

    public async Task<IReadOnlyList<DirectoryUser>> SearchUsersAsync(
        string term, int take = 25, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || string.IsNullOrWhiteSpace(term)) return Array.Empty<DirectoryUser>();

        var client = await GraphAsync(cancellationToken).ConfigureAwait(false);
        if (client is null) return Array.Empty<DirectoryUser>();

        try
        {
            // $search needs ConsistencyLevel: eventual, and cannot be combined with the
            // filter forms people usually reach for first.
            var url = $"{GraphBase}/users?$search=\"displayName:{Uri.EscapeDataString(term)}\" OR \"userPrincipalName:{Uri.EscapeDataString(term)}\"&$select={SelectFields}&$top={take}";
            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("ConsistencyLevel", "eventual");

            using var response = await client.SendAsync(request, cancellationToken).ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Graph user search returned {Status}.", (int)response.StatusCode);
                return Array.Empty<DirectoryUser>();
            }

            var list = await response.Content.ReadFromJsonAsync<GraphList>(cancellationToken: cancellationToken)
                .ConfigureAwait(false);
            return list?.Value.Select(ToUser).ToList() ?? (IReadOnlyList<DirectoryUser>)Array.Empty<DirectoryUser>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Graph user search for {Term} failed.", term);
            return Array.Empty<DirectoryUser>();
        }
    }

    public async Task<DirectoryUser?> FindUserAsync(string login, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || string.IsNullOrWhiteSpace(login)) return null;

        var client = await GraphAsync(cancellationToken).ConfigureAwait(false);
        if (client is null) return null;

        var upn = login.Contains('@')
            ? login
            : $"{login}@{Entra.UserPrincipalNameDomain}";

        try
        {
            using var response = await client
                .GetAsync($"{GraphBase}/users/{Uri.EscapeDataString(upn)}?$select={SelectFields}", cancellationToken)
                .ConfigureAwait(false);

            if (!response.IsSuccessStatusCode) return null;

            var user = await response.Content.ReadFromJsonAsync<GraphUser>(cancellationToken: cancellationToken)
                .ConfigureAwait(false);
            return user is null ? null : ToUser(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Graph lookup of {Login} failed.", login);
            return null;
        }
    }

    /// <summary>
    /// Makes a password that satisfies Entra's complexity rules and is then thrown away.
    /// </summary>
    /// <remarks>
    /// Graph will not create a user without a passwordProfile, but nobody needs to see
    /// this value: the account is created requiring a change at first sign-on, and an
    /// administrator issues a reset through Entra. It is never returned, never logged.
    /// </remarks>
    private static string ThrowawayPassword()
    {
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghijkmnopqrstuvwxyz";
        const string digits = "23456789";
        const string symbols = "!@#$%^&*-_=+";
        var all = upper + lower + digits + symbols;

        var chars = new List<char>
        {
            upper[RandomNumberGenerator.GetInt32(upper.Length)],
            lower[RandomNumberGenerator.GetInt32(lower.Length)],
            digits[RandomNumberGenerator.GetInt32(digits.Length)],
            symbols[RandomNumberGenerator.GetInt32(symbols.Length)],
        };

        while (chars.Count < 24) chars.Add(all[RandomNumberGenerator.GetInt32(all.Length)]);

        // Shuffle so the guaranteed characters are not always in the first four places.
        for (var i = chars.Count - 1; i > 0; i--)
        {
            var j = RandomNumberGenerator.GetInt32(i + 1);
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }

        return new string(chars.ToArray());
    }

    public async Task<DirectoryOperationResult> CreateUserAsync(
        DirectoryUserDraft draft, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            return DirectoryOperationResult.NotConfigured("Entra ID is not configured for this site.");

        if (!_options.AllowUserCreation)
            return DirectoryOperationResult.NotPermitted(
                "Creating accounts is switched off. Set Directory:AllowUserCreation to enable it.");

        if (string.IsNullOrWhiteSpace(Entra.UserPrincipalNameDomain))
            return DirectoryOperationResult.NotConfigured(
                "Creating accounts needs Directory:Entra:UserPrincipalNameDomain — a UPN has to belong to a verified domain.");

        if (string.IsNullOrWhiteSpace(draft.Login))
            return DirectoryOperationResult.Invalid("A login is required.");

        var existing = await FindUserAsync(draft.Login, cancellationToken).ConfigureAwait(false);
        if (existing is not null) return DirectoryOperationResult.AlreadyExists(existing);

        var client = await GraphAsync(cancellationToken).ConfigureAwait(false);
        if (client is null)
            return DirectoryOperationResult.Unavailable("Could not authenticate against Entra ID.");

        var login = draft.Login.Trim();
        var upn = $"{login}@{Entra.UserPrincipalNameDomain}";
        var display = string.IsNullOrWhiteSpace(draft.DisplayName)
            ? $"{draft.GivenName} {draft.Surname}".Trim()
            : draft.DisplayName.Trim();

        var body = new Dictionary<string, object?>
        {
            ["accountEnabled"] = draft.Enabled,
            ["displayName"] = display,
            ["mailNickname"] = login,
            ["userPrincipalName"] = upn,
            ["givenName"] = draft.GivenName,
            ["surname"] = draft.Surname,
            ["passwordProfile"] = new Dictionary<string, object?>
            {
                ["forceChangePasswordNextSignIn"] = draft.RequirePasswordChange,
                ["password"] = ThrowawayPassword(),
            },
        };

        if (!string.IsNullOrWhiteSpace(draft.Department)) body["department"] = draft.Department;
        if (!string.IsNullOrWhiteSpace(draft.JobTitle)) body["jobTitle"] = draft.JobTitle;
        if (!string.IsNullOrWhiteSpace(draft.Telephone)) body["mobilePhone"] = draft.Telephone;

        try
        {
            using var response = await client
                .PostAsJsonAsync($"{GraphBase}/users", body, cancellationToken)
                .ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                var detail = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
                _logger.LogError("Graph refused to create {Upn}: {Status} {Detail}", upn, (int)response.StatusCode, detail);

                // Graph reports a duplicate as a 400 with this code rather than a 409.
                if (detail.Contains("ObjectConflict", StringComparison.OrdinalIgnoreCase)
                    || detail.Contains("userPrincipalName already exists", StringComparison.OrdinalIgnoreCase))
                {
                    var found = await FindUserAsync(login, cancellationToken).ConfigureAwait(false);
                    if (found is not null) return DirectoryOperationResult.AlreadyExists(found);
                }

                return DirectoryOperationResult.Failure(
                    $"Entra ID refused the request ({(int)response.StatusCode}).");
            }

            var created = await response.Content.ReadFromJsonAsync<GraphUser>(cancellationToken: cancellationToken)
                .ConfigureAwait(false);

            return DirectoryOperationResult.Success(
                $"Created {upn}. Set a password for it in Entra ID before first sign-on.",
                created is null
                    ? new DirectoryUser { Login = login, UserPrincipalName = upn, DisplayName = display, Source = Name }
                    : ToUser(created));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Creating {Upn} in Entra ID failed.", upn);
            return DirectoryOperationResult.Unavailable("Entra ID could not be reached.");
        }
    }

    public async Task<DirectoryOperationResult> TestConnectionAsync(CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            return DirectoryOperationResult.NotConfigured("Entra ID needs a tenant, client id and secret.");

        var client = await GraphAsync(cancellationToken).ConfigureAwait(false);
        if (client is null)
            return DirectoryOperationResult.Unavailable("Could not authenticate against Entra ID.");

        try
        {
            using var response = await client
                .GetAsync($"{GraphBase}/users?$top=1&$select=id", cancellationToken)
                .ConfigureAwait(false);

            return response.IsSuccessStatusCode
                ? DirectoryOperationResult.Success($"Connected to tenant {Entra.TenantId}.")
                : DirectoryOperationResult.Failure(
                    $"Graph answered {(int)response.StatusCode}. Check the application has User.Read.All.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Graph connection test failed.");
            return DirectoryOperationResult.Unavailable("Microsoft Graph could not be reached.");
        }
    }
}
