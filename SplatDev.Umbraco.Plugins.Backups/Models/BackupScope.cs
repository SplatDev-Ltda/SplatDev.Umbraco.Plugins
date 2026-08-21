namespace SplatDev.Umbraco.Plugins.Backups.Models;

public enum BackupScope
{
    Content = 1,
    Media = 2,
    Database = 4,
    ContentAndMedia = Content | Media,
    Full = Content | Media | Database
}
