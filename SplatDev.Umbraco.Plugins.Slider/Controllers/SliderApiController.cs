using Microsoft.AspNetCore.Authorization;
using Umbraco.Cms.Web.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.Common.Controllers;
using SplatDev.Umbraco.Plugins.Slider.Models;
using SplatDev.Umbraco.Plugins.Slider.Services;

namespace SplatDev.Umbraco.Plugins.Slider.Controllers;

/// <remarks>
/// Previously anonymous. The Create/Update/Delete actions on both sliders and slides let anyone rewrite what the homepage shows. Reads stay open.
/// </remarks>
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/api/slider/[action]")]
public class SliderApiController : ControllerBase
{
    private readonly ISliderService _service;

    public SliderApiController(ISliderService service)
    {
        _service = service;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetSliders()
        => Ok(await _service.GetSlidersAsync());

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetSlider(int id)
    {
        var slider = await _service.GetSliderAsync(id);
        return slider is null ? NotFound() : Ok(slider);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSlider([FromBody] SliderConfig slider)
        => Ok(await _service.CreateSliderAsync(slider));

    [HttpPut]
    public async Task<IActionResult> UpdateSlider([FromBody] SliderConfig slider)
        => Ok(await _service.UpdateSliderAsync(slider));

    [HttpDelete]
    public async Task<IActionResult> DeleteSlider(int id)
    {
        await _service.DeleteSliderAsync(id);
        return Ok();
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetSlides(int sliderId)
        => Ok(await _service.GetSlidesAsync(sliderId));

    [HttpPost]
    public async Task<IActionResult> AddSlide([FromBody] Slide slide)
        => Ok(await _service.AddSlideAsync(slide));

    [HttpPut]
    public async Task<IActionResult> UpdateSlide([FromBody] Slide slide)
        => Ok(await _service.UpdateSlideAsync(slide));

    [HttpDelete]
    public async Task<IActionResult> DeleteSlide(int id)
    {
        await _service.DeleteSlideAsync(id);
        return Ok();
    }
}
