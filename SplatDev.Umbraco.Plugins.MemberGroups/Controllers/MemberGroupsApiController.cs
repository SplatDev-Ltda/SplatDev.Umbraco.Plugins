using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.MemberGroups.Models;
using SplatDev.Umbraco.Plugins.MemberGroups.Services;

namespace SplatDev.Umbraco.Plugins.MemberGroups.Controllers
{
    /// <summary>
    /// Member group administration.
    /// </summary>
    /// <remarks>
    /// Previously anonymous. GetMemberByEmail let anyone test whether an address was
    /// registered — member enumeration, and personal data disclosure under the LGPD —
    /// while DisableUser let anyone lock any member out of their account.
    /// </remarks>
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    [Route("umbraco/api/membergroups/[action]")]
    public class MemberGroupsApiController : ControllerBase
    {
        private readonly IMemberGroupsService _service;

        public MemberGroupsApiController(IMemberGroupsService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetMemberGroups()
        {
            var groups = _service.GetMemberGroups()
                .Select(g => new { g.Id, g.Name });
            return Ok(groups);
        }

        [HttpGet]
        public IActionResult GetMemberTypes()
        {
            var types = _service.GetMemberTypes()
                .Select(t => new { t.Id, t.Name, t.Alias });
            return Ok(types);
        }

        [HttpPost]
        public IActionResult AddToGroup([FromBody] AddToGroupRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Group))
                return BadRequest(new { message = "Email and group are required." });

            _service.AddToGroup(request.Email, request.Group);
            return Ok(new { message = $"Member {request.Email} added to group {request.Group}." });
        }

        [HttpPost]
        public IActionResult CreateGroup([FromBody] MemberGroup groupToCreate)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = _service.CreateGroup(groupToCreate);
                return Ok(new { id = created.Id, message = $"Group '{created.Name}' created." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult EditGroup([FromQuery] string oldName, [FromBody] MemberGroup newGroup)
        {
            if (string.IsNullOrWhiteSpace(oldName))
                return BadRequest(new { message = "Old group name is required." });

            try
            {
                _service.EditGroup(oldName, newGroup);
                return Ok(new { message = $"Group '{oldName}' updated." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult EnableUser([FromQuery] string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest(new { message = "Username is required." });

            try
            {
                _service.EnableUser(username);
                return Ok(new { message = $"User {username} enabled." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public IActionResult DisableUser([FromQuery] string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest(new { message = "Username is required." });

            try
            {
                _service.DisableUser(username);
                return Ok(new { message = $"User {username} disabled." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public IActionResult GetMemberByEmail([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { message = "Email is required." });

            var member = _service.GetByEmail(email);
            if (member is null) return NotFound(new { message = "Member not found." });

            return Ok(new { member.Id, member.Name, member.Email, member.Username, member.IsApproved, member.IsLockedOut });
        }

        [HttpPost]
        public IActionResult SaveMemberGroup([FromQuery] string groupName)
        {
            if (string.IsNullOrWhiteSpace(groupName))
                return BadRequest(new { message = "Group name is required." });

            _service.SaveMemberGroup(groupName);
            return Ok(new { message = $"Member group '{groupName}' saved." });
        }
    }

    public record AddToGroupRequest(string Email, string Group);
}
