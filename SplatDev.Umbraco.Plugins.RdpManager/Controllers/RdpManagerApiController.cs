using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;

using Umbraco.Cms.Web.Common.Controllers;

using SplatDev.Umbraco.Plugins.RdpManager.Models;
using SplatDev.Umbraco.Plugins.RdpManager.Services;

namespace SplatDev.Umbraco.Plugins.RdpManager.Controllers
{
    /// <summary>
    /// Stored RDP connection definitions.
    /// </summary>
    /// <remarks>
    /// Previously anonymous. GetAll and DownloadRdpFile handed out internal hostnames,
    /// ports, usernames and AD domains — no passwords, but precisely the reconnaissance
    /// needed to start credential-stuffing an RDP endpoint. Create and Delete let a caller
    /// edit the list as well as read it.
    /// </remarks>
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    [Route("umbraco/api/RdpManagerApi/[action]")]
    public class RdpManagerApiController(IRdpManagerService rdpManagerService) : ControllerBase
    {
        private readonly IRdpManagerService _rdpManagerService = rdpManagerService;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var connections = await _rdpManagerService.GetAllAsync();
            return Ok(connections);
        }

        [HttpGet]
        public async Task<IActionResult> GetById(int id)
        {
            var connection = await _rdpManagerService.GetByIdAsync(id);
            if (connection is null)
                return NotFound();
            return Ok(connection);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RdpConnection connection)
        {
            var created = await _rdpManagerService.CreateAsync(connection);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] RdpConnection connection)
        {
            var updated = await _rdpManagerService.UpdateAsync(connection);
            if (updated is null)
                return NotFound();
            return Ok(updated);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int id)
        {
            await _rdpManagerService.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> DownloadRdpFile(int id)
        {
            try
            {
                var rdpContent = await _rdpManagerService.GenerateRdpContentAsync(id);
                var connection = await _rdpManagerService.GetByIdAsync(id);
                var fileName = $"{connection?.Name ?? $"connection-{id}"}.rdp"
                    .Replace(" ", "_")
                    .Replace("/", "-")
                    .Replace("\\", "-");

                var bytes = System.Text.Encoding.UTF8.GetBytes(rdpContent);
                return new FileContentResult(bytes, "application/x-rdp")
                {
                    FileDownloadName = fileName
                };
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
