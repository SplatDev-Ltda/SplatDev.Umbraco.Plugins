namespace SplatDev.Umbraco.Plugins.Dropzone.Models;

public class UploadRequest
{
    public string FolderName { get; set; } = "";

    /// <summary>Integer id, as the original dashboard posted it.</summary>
    public int? ParentMediaId { get; set; }

    /// <summary>
    /// Media key, as a media picker supplies it.
    /// </summary>
    /// <remarks>
    /// The backoffice pickers deal in keys, not integer ids, so the endpoint accepts both
    /// rather than asking a person to find and type a numeric id.
    /// </remarks>
    public Guid? ParentMediaKey { get; set; }
}
