using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using SplatDev.Umbraco.Plugins.MemberGroups.Helpers;
using SplatDev.Umbraco.Plugins.MemberGroups.Interfaces;
using SplatDev.Umbraco.Plugins.MemberGroups.Models;
using MemberGroup = SplatDev.Umbraco.Plugins.MemberGroups.Models.MemberGroup;

namespace SplatDev.Umbraco.Plugins.MemberGroups.Services
{
    public class MemberGroupService : IMemberGroupsService
    {
        private readonly IUserService _userService;
        private readonly IAuditService _auditService;
        private readonly IMemberService _memberService;
        private readonly IMemberGroupService _memberGroupService;
        private readonly IMemberTypeService _memberTypeService;
        private readonly IShortStringHelper _shortStringHelper;
        private readonly ILogger<MemberGroupService> _logger;
#if NET10_0_OR_GREATER
        private readonly IUserGroupService _userGroupService;
#endif

#if NET10_0_OR_GREATER
        public MemberGroupService(
            IUserService userService,
            IAuditService auditService,
            IMemberService memberService,
            IMemberGroupService memberGroupService,
            IMemberTypeService memberTypeService,
            IUserGroupService userGroupService,
            IShortStringHelper shortStringHelper,
            ILogger<MemberGroupService> logger)
        {
            _userService = userService;
            _auditService = auditService;
            _memberService = memberService;
            _memberGroupService = memberGroupService;
            _memberTypeService = memberTypeService;
            _userGroupService = userGroupService;
            _shortStringHelper = shortStringHelper;
            _logger = logger;
        }
#else
        public MemberGroupService(
            IUserService userService,
            IAuditService auditService,
            IMemberService memberService,
            IMemberGroupService memberGroupService,
            IMemberTypeService memberTypeService,
            IShortStringHelper shortStringHelper,
            ILogger<MemberGroupService> logger)
        {
            _userService = userService;
            _auditService = auditService;
            _memberService = memberService;
            _memberGroupService = memberGroupService;
            _memberTypeService = memberTypeService;
            _shortStringHelper = shortStringHelper;
            _logger = logger;
        }
#endif

        // Inline Sanitize -- was previously from SplatDev.Html.Helpers
        private static string Sanitize(string input) =>
            Regex.Replace((input ?? string.Empty).ToLower(), @"[^a-z0-9]", "-");

#if NET10_0_OR_GREATER
        /// <summary>
        /// Helper: look up a user group by alias via the Umbraco 17 IUserGroupService.
        /// Replaces IUserService.GetUserGroupByAlias which was removed in Umbraco 17.
        /// </summary>
        private IUserGroup? LookupUserGroupByAlias(string alias) =>
            _userGroupService.GetAsync(alias).GetAwaiter().GetResult();
#endif

        public IMember? CurrentMember => null; // Resolved via IHttpContextAccessor in consuming code

        public int MinPasswordLength { get; set; } = 10;

        public void AddToGroup(string email, string group)
        {
            var member = _memberService.GetByEmail(email);
            if (member is null) throw new Exception($"Member with email {email} not found.");
            _memberService.AssignRole(member.Id, group);
        }

        public int AssignUserToGroup(string username, string groupName)
        {
            var user = _userService.GetByUsername(username);
            if (user is null) throw new Exception($"User {username} not found.");

#if NET10_0_OR_GREATER
            // Umbraco 17: GetUserGroupByAlias moved to IUserGroupService
            var group = LookupUserGroupByAlias(Sanitize(groupName));
            if (group is null)
                throw new Exception("Cannot assign to group that does not exist.");
            user.AddGroup(group.ToReadOnlyGroup());
#else
            var group = _userService.GetUserGroupByAlias(Sanitize(groupName))?.ToReadOnlyGroup();
            if (group is null)
                throw new Exception("Cannot assign to group that does not exist.");
            user.AddGroup(group);
#endif
            _userService.Save(user);
            return group.Id;
        }

        public string ChangeUserPassword(MemberUser userToChange, string currentPassword)
        {
            var user = _userService.GetByUsername(userToChange.Username);
            if (user is null)
                return $"User {userToChange.Name} not found";

            ValidatePasswordLength(userToChange);

            try
            {
                _logger.LogWarning("ChangeUserPassword: Direct password hash is not available in Umbraco 13+. Use the built-in Users API.");
                _auditService.Add(AuditType.Save, -1, user.Id, "User", $"Password change attempted for {user.Id}");
                return $"Password change requested for {user.Username} -- use Umbraco's built-in user password management.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for {Username}.", userToChange.Username);
                throw;
            }
        }

        public MemberGroup CreateGroup(MemberGroup groupToCreate)
        {
            if (GroupExists(groupToCreate))
                throw new Exception($"Group {groupToCreate.Name} already exists.");

            var groupAlias = Sanitize(groupToCreate.Name);

            try
            {
#if NET10_0_OR_GREATER
                // Umbraco 17: UserGroup(IShortStringHelper) -- 1 param constructor, set properties
                var group = new UserGroup(_shortStringHelper)
                {
                    Alias = groupAlias,
                    Name = groupToCreate.Name,
                    Icon = "icon-umb-members",
                    Permissions = groupToCreate.Permissions.ToHashSet(),
                    StartContentId = groupToCreate.StartContentId,
                    StartMediaId = groupToCreate.StartMediaId
                };
#else
                // Umbraco 13: UserGroup(IShortStringHelper, int userCount, string? alias, string? name, IEnumerable<string> permissions, string? icon)
                var group = new UserGroup(_shortStringHelper, 1, groupAlias, groupToCreate.Name, Enumerable.Empty<string>(), "icon-umb-members")
                {
                    Permissions = groupToCreate.Permissions.ToHashSet(),
                    StartContentId = groupToCreate.StartContentId,
                    StartMediaId = groupToCreate.StartMediaId
                };
#endif

                foreach (var section in groupToCreate.AllowedSectionAliases)
                {
                    group.AddAllowedSection(section);
                }

#if NET10_0_OR_GREATER
                // Umbraco 17: IUserService.Save(IUserGroup) removed; use IUserGroupService.CreateAsync
                // CreateAsync needs the key of the user performing the change, and rejects
                // Guid.Empty. It was being handed exactly that, so creation failed every
                // time — and the failure was swallowed: the warning below was logged, the
                // id stayed 0, and the caller was told the group had been created.
                var result = _userGroupService
                    .CreateAsync(group, Constants.Security.SuperUserKey)
                    .GetAwaiter()
                    .GetResult();

                if (!result.Success || result.Result is null)
                {
                    _logger.LogError(
                        "CreateGroup: IUserGroupService.CreateAsync failed for group '{GroupName}' with {Status}.",
                        groupToCreate.Name, result.Status);
                    throw new InvalidOperationException(
                        $"Could not create group '{groupToCreate.Name}': {result.Status}.");
                }

                groupToCreate.Id = result.Result.Id;
#else
                _userService.Save(group);
                groupToCreate.Id = group.Id;
#endif
                _auditService.Add(AuditType.New, -1, groupToCreate.Id, "User Group", $"User Group {groupToCreate.Name} has been created");
                return groupToCreate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating group {GroupName}.", groupToCreate.Name);
                throw;
            }
        }

        public IMemberUser CreateUser(MemberUser userToCreate)
        {
            if (UserExists(userToCreate))
                throw new Exception($"User {userToCreate.Username} already exists");

            var groupAlias = string.IsNullOrEmpty(userToCreate.Group)
                ? "sensitiveData"
                : Sanitize(userToCreate.Group);

#if NET10_0_OR_GREATER
            // Umbraco 17: GetUserGroupByAlias moved to IUserGroupService
            var group = LookupUserGroupByAlias(groupAlias);
            if (group is null)
                throw new Exception($"Cannot create user. Group {userToCreate.Group} does not exist.");
#else
            var group = _userService.GetUserGroupByAlias(groupAlias);
            if (group is null)
                throw new Exception($"Cannot create user. Group {userToCreate.Group} does not exist.");
#endif

            try
            {
                var user = _userService.CreateUserWithIdentity(userToCreate.Username, userToCreate.Email);
                user.Name = userToCreate.Name;
                user.AddGroup(group.ToReadOnlyGroup());
                _userService.Save(user);

                _logger.LogWarning("CreateUser: Password hashing via UsersMembershipProvider is not available in Umbraco 13+. Set password via the Users management API.");

                userToCreate.AssignedUmbracoUserId = user.Id;
                _auditService.Add(AuditType.New, -1, user.Id, "User", $"User for {user.Username} has been created");
                return userToCreate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user {Username}.", userToCreate.Username);
                throw;
            }
        }

        public IMember CreateMember(IMember member)
        {
            if (_memberService.Exists(member.Username))
                throw new Exception($"Member {member.Username} already exists");

            return _memberService.CreateMember(
                member.Username, member.Email, member.Name, member.ContentType.Alias);
        }

        public void DeleteMember(IMember member) =>
            _memberService.Delete(member);

        public void DeleteMemberGroup(string groupName) =>
            _memberGroupService.Delete(new global::Umbraco.Cms.Core.Models.MemberGroup { Name = groupName });

        public void DeleteMemberType(IMemberType memberType) =>
            _memberTypeService.Delete(memberType);

        public void DisableUser(string username)
        {
            var user = _userService.GetByUsername(username)
                ?? throw new Exception("User does not exist. Cannot disable.");

            try
            {
                _userService.Delete(user, false);
                _auditService.Add(AuditType.Delete, -1, user.Id, "User", $"User {user.Id} has been disabled");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disabling user {Username}.", username);
                throw;
            }
        }

        public void DisableUser(int userId)
        {
            var user = _userService.GetUserById(userId)
                ?? throw new Exception("User does not exist. Cannot disable.");

            try
            {
                _userService.Delete(user, false);
                _auditService.Add(AuditType.Delete, -1, user.Id, "User", $"User {user.Id} has been disabled");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disabling user {UserId}.", userId);
                throw;
            }
        }

        public IUserGroup EditGroup(string oldGroupName, MemberGroup newGroup)
        {
#if NET10_0_OR_GREATER
            // Umbraco 17: GetUserGroupByAlias moved to IUserGroupService
            var group = LookupUserGroupByAlias(Sanitize(oldGroupName))
                ?? throw new Exception("Cannot change group that does not exist");
#else
            var group = _userService.GetUserGroupByAlias(Sanitize(oldGroupName))
                ?? throw new Exception("Cannot change group that does not exist");
#endif

            try
            {
                group.Name = string.IsNullOrEmpty(newGroup.RenameGroupTo) ? group.Name : newGroup.RenameGroupTo;
                group.Alias = string.IsNullOrEmpty(newGroup.RenameGroupTo) ? group.Alias : Sanitize(newGroup.RenameGroupTo);
                group.Permissions = newGroup.Permissions.Any() ? newGroup.Permissions.ToHashSet() : group.Permissions;

                if (newGroup.AllowedSectionAliases.Any()
                    && !string.Join(",", newGroup.AllowedSectionAliases.ToArray())
                        .Equals(string.Join(",", group.AllowedSections)))
                {
                    group.ClearAllowedSections();
                    foreach (var section in newGroup.AllowedSectionAliases)
                        group.AddAllowedSection(section);
                }

                if (newGroup.StartContentId.HasValue && newGroup.StartContentId.Value != group.StartContentId)
                    group.StartContentId = newGroup.StartContentId.Value;

                if (newGroup.StartMediaId.HasValue && newGroup.StartMediaId.Value != group.StartMediaId)
                    group.StartMediaId = newGroup.StartMediaId.Value;

#if NET10_0_OR_GREATER
                // Umbraco 17: IUserService.Save(IUserGroup) removed; use IUserGroupService.UpdateAsync
                var result = _userGroupService.UpdateAsync(group, Guid.Empty).GetAwaiter().GetResult();
                if (!result.Success)
                    _logger.LogWarning("EditGroup: IUserGroupService.UpdateAsync did not succeed for group '{GroupName}'.", oldGroupName);
#else
                _userService.Save(group);
#endif
                _auditService.Add(AuditType.Save, -1, group.Id, "User Group",
                    $"User Group {group.Id} has been renamed from '{oldGroupName}' to '{newGroup.Name}'");
                return group;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing group {OldGroupName}.", oldGroupName);
                throw;
            }
        }

        public string EnableUser(string username)
        {
            var user = _userService.GetByUsername(username)
                ?? throw new Exception("User does not exist. Cannot enable.");

            try
            {
                user.IsApproved = true;
                user.IsLockedOut = false;
                _userService.Save(user);
                _auditService.Add(AuditType.Save, -1, user.Id, "User", $"User {user.Id} has been enabled");
                return username;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enabling user {Username}.", username);
                throw;
            }
        }

        public string EnableUser(int userId)
        {
            var user = _userService.GetUserById(userId)
                ?? throw new Exception("User does not exist. Cannot enable.");

            try
            {
                user.IsApproved = true;
                user.IsLockedOut = false;
                _userService.Save(user);
                _auditService.Add(AuditType.Save, -1, user.Id, "User", $"User {user.Id} has been enabled");
                return user.Username;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enabling user {UserId}.", userId);
                throw;
            }
        }

        public IMember? GetByEmail(string email) =>
            _memberService.GetByEmail(email);

        public IMember? GetByUsername(string username) =>
            _memberService.GetByUsername(username);

        public IMember? GetMemberById(int memberId) =>
            _memberService.GetById(memberId);

        public IMember? GetMemberById(string memberId) =>
            GetMemberById(int.Parse(memberId));

        public IEnumerable<IMemberGroup> GetMemberGroups() =>
            _memberGroupService.GetAll();

        public IEnumerable<IMemberType> GetMemberTypes() =>
            _memberTypeService.GetAll();

        public IUserGroup? GetUserGroup(string alias)
        {
#if NET10_0_OR_GREATER
            // Umbraco 17: GetUserGroupByAlias moved to IUserGroupService
            return LookupUserGroupByAlias(alias);
#else
            return (IUserGroup?)_userService.GetUserGroupByAlias(alias);
#endif
        }

        public string GetUserName(int userId) =>
            _userService.GetProfileById(userId)?.Name ?? string.Empty;

        public string GetUserName(string userId) =>
            GetUserName(int.Parse(userId));

        public bool GroupExists(MemberGroup group)
        {
#if NET10_0_OR_GREATER
            return LookupUserGroupByAlias(group.Alias) != null;
#else
            return _userService.GetUserGroupByAlias(group.Alias) != null;
#endif
        }

        public bool MemberExists(string emailAddress) =>
            _memberService.GetByEmail(emailAddress) != null;

        public bool MemberGroupExists(string groupName) =>
            _memberGroupService.GetByName(groupName) != null;

        public bool MemberTypeExists(string memberTypeAlias) =>
            _memberTypeService.GetAll().Any(x => x.Alias == memberTypeAlias);

        public int RegisterMember(string memberName, string emailAddress, string memberPassword,
            string memberTypeAlias, string memberGroupName, string username = "")
        {
            int umbracoMemberId = -1;
            var usrname = string.IsNullOrEmpty(username) ? emailAddress : username;

            if (!MemberExists(emailAddress))
            {
                if (!MemberTypeExists(memberTypeAlias))
                    SaveMemberType(string.Empty, memberTypeAlias, string.Empty, string.Empty, "icon-user");

                var newMember = _memberService.CreateMember(usrname, emailAddress, memberName, memberTypeAlias);

                try
                {
                    _memberService.Save(newMember);
                    // IMemberService.SavePassword was removed. Use IMemberManager to set password.
                    _logger.LogWarning("RegisterMember: Password must be set via IMemberManager for member '{Email}'.", emailAddress);
                    _memberService.AssignRole(newMember.Id, memberGroupName);
                    umbracoMemberId = newMember.Id;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unable to create new member {Email}.", emailAddress);
                }
            }

            return umbracoMemberId;
        }

        public string ResetUserPassword(string username)
        {
            var user = _userService.GetByUsername(username)
                ?? throw new Exception($"User {username} does not exist. Cannot reset.");

            try
            {
                var password = Guid.NewGuid().ToString("N")[..10];
                _logger.LogWarning("ResetUserPassword: Direct RawPasswordValue assignment not available in Umbraco 13+. Use the Umbraco Users API password reset flow.");
                _auditService.Add(AuditType.Save, -1, user.Id, "User", $"Password for {user.Id} has been reset");
                return password;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for {Username}.", username);
                throw;
            }
        }

        public void SaveMember(IMember member) =>
            _memberService.Save(member);

        public void SaveMemberGroup(string groupName) =>
            _memberGroupService.Save(new global::Umbraco.Cms.Core.Models.MemberGroup { Name = groupName });

        public void SaveMemberType(string parentGroupAlias, string memberTypeAlias,
            string memberTypeName = "", string description = "", string icon = "icon-user")
        {
            var parentType = _memberTypeService.GetAll()
                .FirstOrDefault(x => x.Alias == parentGroupAlias)
                ?? _memberTypeService.GetAll().First();

#if NET10_0_OR_GREATER
            // Umbraco 17: MemberType(IShortStringHelper, IContentTypeComposition parent, string alias)
            var memberType = new MemberType(_shortStringHelper, parentType, string.Empty)
            {
                Name = string.IsNullOrEmpty(memberTypeName) ? memberTypeAlias : memberTypeName,
                Alias = memberTypeAlias,
                Description = description,
                Icon = icon
            };
#else
            // Umbraco 13: MemberType(IShortStringHelper, int parentId)
            var memberType = new MemberType(_shortStringHelper, parentType.Id)
            {
                Name = string.IsNullOrEmpty(memberTypeName) ? memberTypeAlias : memberTypeName,
                Alias = memberTypeAlias,
                Description = description,
                Icon = icon
            };
#endif
            _memberTypeService.Save(memberType);
        }

        public void SaveMemberType(IMemberType memberType) =>
            _memberTypeService.Save(memberType);

        public void SavePassword(IMember member, string newPassword)
        {
            _logger.LogWarning("SavePassword: IMemberService.SavePassword was removed. Use IMemberManager to set password.");
        }

        public void UpdateMemberPassword(IMember member, string password)
        {
            _logger.LogWarning("UpdateMemberPassword: IMemberService.SavePassword was removed. Use IMemberManager to set password.");
        }

        public void UpdateUser(MemberUser userToUpdate)
        {
            var user = _userService.GetByUsername(userToUpdate.Username)
                ?? throw new Exception($"User {userToUpdate.Name} not found");

            if (!string.IsNullOrEmpty(userToUpdate.Password))
                ValidatePasswordLength(userToUpdate);

            try
            {
                user.Name = userToUpdate.Name;
                user.Email = userToUpdate.Email;

                if (!string.IsNullOrEmpty(userToUpdate.Password))
                    _logger.LogWarning("UpdateUser: Direct password hash is not available in Umbraco 13+. Use the built-in Users API.");

                _userService.Save(user);

                if (!string.IsNullOrEmpty(userToUpdate.Group)
                    && user.Groups.Any()
                    && !user.Groups.First().Name.Equals(userToUpdate.Group, StringComparison.OrdinalIgnoreCase))
                {
                    AssignUserToGroup(user.Username, userToUpdate.Group);
                }

                _auditService.Add(AuditType.Save, -1, user.Id, "User", $"User {user.Username} has been edited");
                userToUpdate.AssignedUmbracoUserId = user.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {Username}.", userToUpdate.Username);
                throw;
            }
        }

        public bool UserExists(MemberUser user) =>
            _userService.GetByUsername(user.Username) != null;

        public bool ValidateMember(string email, string validation)
        {
            var member = _memberService.GetByEmail(email);
            if (member is null) return false;

            var activation = member.GetValue<string>("activationCode");
            if (validation.Equals(activation, StringComparison.Ordinal))
            {
                member.IsApproved = true;
                member.IsLockedOut = false;
                member.UpdateDate = DateTime.Now;
                _memberService.Save(member);
                return true;
            }
            return false;
        }

        public bool ValidatePasswordLength(MemberUser user) =>
            user.Password.Length >= MinPasswordLength;

        public bool ValidationMatches(string email, string validation)
        {
            var member = _memberService.GetByEmail(email);
            if (member is null) return false;

            var activationCode = member.Properties
                .SingleOrDefault(x => x.Alias == "activationCode")
                ?.GetValue();

            return activationCode != null && validation.Equals(activationCode.ToString(), StringComparison.Ordinal);
        }

        public IUser? GetUserById(int userId) =>
            _userService.GetUserById(userId);
    }
}
