using System;
using System.Collections.Generic;

namespace SplatDev.Umbraco.Plugins.MemberGroups.Models
{
    public class MemberGroup
    {
        // Default Umbraco permission chars (previously from SplatDev.Html.Helpers.Default.Permission)
        public static class Permission
        {
            public const string CulturesAndHostnames = "I";
            public const string PublicAccess = "P";
            public const string Rollback = "K";
            public const string BrowseNode = "F";
            public const string CreateContentTemplate = "X";
            public const string Delete = "D";
            public const string Create = "C";
            public const string Publish = "U";
            public const string Update = "A";
            public const string Copy = "O";
            public const string Sort = "S";
        }

        public int Id { get; set; }

        public static List<string> DefaultPermissions = new List<string>
        {
            Permission.CulturesAndHostnames,
            Permission.PublicAccess,
            Permission.Rollback,
            Permission.BrowseNode,
            Permission.CreateContentTemplate,
            Permission.Delete,
            Permission.Create,
            Permission.Publish,
            Permission.Update,
            Permission.Copy,
            Permission.Sort
        };

        public string Alias => Sanitize(Name);

        public IEnumerable<string> AllowedSectionAliases { get; set; } = Array.Empty<string>();
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// The set of default permissions.
        /// </summary>
        /// <remarks>
        /// By default each permission is a single char but defined as IEnumerable{string}
        /// to support a more flexible permissions structure in the future.
        /// </remarks>
        public IEnumerable<string> Permissions { get; set; } = Array.Empty<string>();

        public string RenameGroupTo { get; set; } = string.Empty;
        public int? StartContentId { get; set; }
        public int? StartMediaId { get; set; }
        public Guid ClientGuid { get; set; }

        public static implicit operator MemberGroup(string groupName)
        {
            return new MemberGroup { Name = groupName };
        }

        private static string Sanitize(string input) =>
            System.Text.RegularExpressions.Regex.Replace(
                (input ?? string.Empty).ToLower(), @"[^a-z0-9]", "-");
    }
}
