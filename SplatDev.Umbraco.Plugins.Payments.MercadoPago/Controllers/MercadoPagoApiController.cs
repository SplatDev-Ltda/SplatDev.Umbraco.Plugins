using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Payments.MercadoPago.Services;

namespace SplatDev.Umbraco.Plugins.Payments.MercadoPago.Controllers;

[Route("umbraco/api/mercadopago/[action]")]
public class MercadoPagoApiController : ControllerBase
{
    private readonly IMercadoPagoService _service;

    public MercadoPagoApiController(IMercadoPagoService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetConfig()
    {
        var config = _service.GetConfig();
        // Never expose the access token to front-end clients
        return Ok(new { config.PublicKey, config.Sandbox });
    }

    [HttpPost]
    public async Task<IActionResult> CreatePreference([FromBody] CreatePreferenceRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.OrderRef))
            return BadRequest("OrderRef is required.");

        if (request.Amount <= 0)
            return BadRequest("Amount must be greater than zero.");

        var preferenceId = await _service.CreatePaymentPreference(
            request.OrderRef, request.Amount, request.Description ?? request.OrderRef);

        return Ok(new { preferenceId });
    }

    [HttpGet]
    public async Task<IActionResult> GetPaymentStatus(string paymentId)
    {
        if (string.IsNullOrWhiteSpace(paymentId))
            return BadRequest("paymentId is required.");

        var status = await _service.GetPaymentStatus(paymentId);
        return Ok(new { paymentId, status });
    }
}

public record CreatePreferenceRequest(string OrderRef, decimal Amount, string? Description);
