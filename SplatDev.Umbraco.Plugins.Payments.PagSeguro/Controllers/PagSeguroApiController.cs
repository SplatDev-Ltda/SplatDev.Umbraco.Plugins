using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Payments.PagSeguro.Services;

namespace SplatDev.Umbraco.Plugins.Payments.PagSeguro.Controllers;

[Route("umbraco/api/pagseguro/[action]")]
public class PagSeguroApiController : ControllerBase
{
    private readonly IPagSeguroService _service;

    public PagSeguroApiController(IPagSeguroService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetConfig()
    {
        var config = _service.GetConfig();
        return Ok(new { config.Email, config.Sandbox });
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.OrderRef))
            return BadRequest("OrderRef is required.");

        if (request.Amount <= 0)
            return BadRequest("Amount must be greater than zero.");

        var checkoutUrl = await _service.CreateTransaction(
            request.OrderRef, request.Amount, request.Description ?? request.OrderRef);

        return Ok(new { checkoutUrl });
    }

    [HttpGet]
    public async Task<IActionResult> GetTransactionStatus(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return BadRequest("code is required.");

        var status = await _service.GetTransactionStatus(code);
        return Ok(new { code, status });
    }
}

public record CreateTransactionRequest(string OrderRef, decimal Amount, string? Description);
