using System;
using SplatDev.Umbraco.Plugins.MemberGroups.Interfaces;
using SplatDev.Umbraco.Plugins.MemberGroups.Enums;

namespace SplatDev.Umbraco.Plugins.MemberGroups.Models
{
    public class MemberUser : IMemberUser
    {
        public int AssignedUmbracoUserId { get; set; }
        public Guid ClientGuid { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        UserTypes IMemberUser.Group => UserTypes.Editor;
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string StartContentNodeAlias { get; set; } = string.Empty;
        public string StartContentNodeName { get; set; } = string.Empty;
        public string StartMediaNodeAlias { get; set; } = string.Empty;
        public string StartMediaNodeName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
    }
}
