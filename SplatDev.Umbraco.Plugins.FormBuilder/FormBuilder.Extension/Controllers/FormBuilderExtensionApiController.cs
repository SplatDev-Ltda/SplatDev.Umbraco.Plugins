using Asp.Versioning;
using FormBuilder.Extension.Entities;
using FormBuilder.Extension.Interfaces;
using FormBuilder.Extension.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FormBuilder.Extension.Controllers
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "FormBuilder.Extension")]
    public class FormBuilderExtensionApiController : FormBuilderExtensionApiControllerBase
    {
        private readonly IFormRepository _formRepository;

        public FormBuilderExtensionApiController(IFormRepository formRepository)
        {
            _formRepository = formRepository;
        }

        [HttpGet("ping")]
        [ProducesResponseType<string>(StatusCodes.Status200OK)]
        public string Ping() => "Pong";

        // ── Forms CRUD ─────────────────────────────────────────────────────────

        [HttpGet("forms")]
        [ProducesResponseType<IEnumerable<Form>>(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetForms()
        {
            var forms = await _formRepository.GetAllAsync();
            return Ok(forms);
        }

        [HttpGet("forms/{id:int}")]
        [ProducesResponseType<Form>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetForm(int id)
        {
            var form = await _formRepository.GetByIdAsync(id);
            return form is null ? NotFound() : Ok(form);
        }

        [HttpPost("forms")]
        [ProducesResponseType<Form>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateForm([FromBody] Form form)
        {
            if (string.IsNullOrWhiteSpace(form.Name))
                return BadRequest("Form name is required.");

            var created = await _formRepository.CreateAsync(form);
            return CreatedAtAction(nameof(GetForm), new { id = created.Id }, created);
        }

        [HttpPut("forms/{id:int}")]
        [ProducesResponseType<Form>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateForm(int id, [FromBody] Form form)
        {
            if (string.IsNullOrWhiteSpace(form.Name))
                return BadRequest("Form name is required.");

            var existing = await _formRepository.GetByIdAsync(id);
            if (existing is null) return NotFound();

            existing.Name = form.Name;
            existing.Category = form.Category;
            existing.Fields = form.Fields;
            existing.Workflows = form.Workflows;
            existing.UpdatedDate = DateTime.UtcNow;

            var updated = await _formRepository.UpdateAsync(existing);
            return Ok(updated);
        }

        [HttpDelete("forms/{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteForm(int id)
        {
            var existing = await _formRepository.GetByIdAsync(id);
            if (existing is null) return NotFound();

            try
            {
                await _formRepository.DeleteAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ── Field ordering ─────────────────────────────────────────────────────

        [HttpPut("forms/{id:int}/fields/order")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateFieldOrder(int id, [FromBody] Dictionary<int, int> fieldOrder)
        {
            var existing = await _formRepository.GetByIdAsync(id);
            if (existing is null) return NotFound();

            await _formRepository.UpdateOrderAsync(id, fieldOrder);
            return Ok();
        }

        // ── Form stats ────────────────────────────────────────────────────────

        [HttpGet("forms/{id:int}/stats")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetFormStats(int id)
        {
            var form = await _formRepository.GetByIdAsync(id);
            if (form is null) return NotFound();

            var hasSubmissions = await _formRepository.HasSubmissionsAsync(id);

            return Ok(new
            {
                id = form.Id,
                name = form.Name,
                fieldCount = form.Fields?.Count ?? 0,
                workflowCount = form.Workflows?.Count ?? 0,
                hasSubmissions,
            });
        }
    }
}
