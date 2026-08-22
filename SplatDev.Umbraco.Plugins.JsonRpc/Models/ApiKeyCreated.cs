namespace SplatDev.Umbraco.Plugins.JsonRpc.Models;

/// <summary>
/// A newly created key, together with its raw value — the only time that value exists
/// outside the caller's hands.
/// </summary>
/// <remarks>
/// The raw key used to be smuggled back inside the entity's Name as "name||RAW:key",
/// with the controller telling the caller to parse it out. Only the hash is persisted,
/// so nothing leaked, but it was one accidental re-save away from writing a live key
/// into the database in plain text, and it made every consumer parse a sentinel.
/// </remarks>
public class ApiKeyCreated
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Permissions { get; set; } = "*";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

    /// <summary>Shown once. Only its hash is stored, so it cannot be recovered later.</summary>
    public string RawKey { get; set; } = string.Empty;
}
