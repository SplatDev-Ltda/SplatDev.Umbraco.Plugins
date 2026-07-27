using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Graph.Models;
#if NET10_0_OR_GREATER
using Umbraco.Cms.Api.Management.Controllers;
#else
using Umbraco.Cms.Web.BackOffice.Controllers;
#endif
using SplatDev.Umbraco.Plugins.Mailer.Services;

namespace SplatDev.Umbraco.Plugins.Mailer.Controllers
{
#if NET10_0_OR_GREATER
    public class MailerApiController(MicrosoftGraphMailerService mailerService, ILogger<MailerApiController> logger) : ManagementApiControllerBase
#else
    public class MailerApiController(MicrosoftGraphMailerService mailerService, ILogger<MailerApiController> logger) : UmbracoAuthorizedApiController
#endif
    {
        private readonly MicrosoftGraphMailerService _mailerService = mailerService;
        private readonly ILogger<MailerApiController> _logger = logger;

        [HttpPost("send-test")]
        public async Task<IActionResult> SendTestAsync(string email)
        {
            try
            {
                var subject = "Testing Email Service";
                var html = "<h1>Looks like email works!</h1>";
                var message = _mailerService.GetMessage(subject: subject, html: html, appendBody: null, customValues: null, sources: null, recipients: [new EmailAddress { Name = email, Address = email }], cc: null, bcc: null);
                if (message is null)
                {
                    _logger.LogError("Failed to create email message");
                    return BadRequest("Failed to create email message");
                }
                await _mailerService.SendEmailAsync(message);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Could not send email");
                throw;
            }
        }
    }
}
