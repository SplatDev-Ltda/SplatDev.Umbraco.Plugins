using Asp.Versioning;
using FormBuilder.Extension.Entities;
using FormBuilder.Extension.Interfaces;
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

        [HttpGet("forms")]
        [ProducesResponseType<IEnumerable<FormListItem>>(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetForms()
        {
            var forms = await _formRepository.GetAllAsync();
            var items = forms.Select(f => new FormListItem
            {
                Id = f.Id,
                Name = f.Name,
                Category = f.Category,
                CreatedDate = f.CreatedDate,
                UpdatedDate = f.UpdatedDate,
                FieldCount = f.Fields?.Count ?? 0
            });
            return Ok(items);
        }

        [HttpGet("forms/{id:int}")]
        [ProducesResponseType<Form>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetForm(int id)
        {
            var form = await _formRepository.GetByIdAsync(id);
            if (form == null)
                return NotFound(new { message = $"Form with id {id} not found" });

            return Ok(form);
        }

        [HttpPost("forms")]
        [ProducesResponseType<Form>(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateForm([FromBody] CreateFormRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { message = "Form name is required" });

            var form = new Form
            {
                Name = request.Name,
                Category = request.Category ?? string.Empty,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow,
                Fields = request.Fields?.Select((f, i) => new FormField
                {
                    Alias = f.Alias ?? f.Label?.ToLower().Replace(" ", "-") ?? $"field-{i}",
                    Label = f.Label,
                    Placeholder = f.Placeholder,
                    Type = f.Type ?? "TextBox",
                    IsRequired = f.IsRequired,
                    SortOrder = i,
                    MinLength = f.MinLength,
                    Regex = f.Regex,
                    DropdownValues = f.DropdownValues?.Select(dv => new DropdownValue
                    {
                        Value = dv
                    }).ToList() ?? new List<DropdownValue>()
                }).ToList() ?? new List<FormField>()
            };

            var created = await _formRepository.CreateAsync(form);
            return CreatedAtAction(nameof(GetForm), new { id = created.Id }, created);
        }

        [HttpPut("forms/{id:int}")]
        [ProducesResponseType<Form>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateForm(int id, [FromBody] UpdateFormRequest request)
        {
            var existing = await _formRepository.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = $"Form with id {id} not found" });

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { message = "Form name is required" });

            existing.Name = request.Name;
            existing.Category = request.Category ?? existing.Category;
            existing.UpdatedDate = DateTime.UtcNow;

            if (request.Fields != null)
            {
                existing.Fields = request.Fields.Select((f, i) => new FormField
                {
                    Id = f.Id,
                    FormId = id,
                    Alias = f.Alias ?? f.Label?.ToLower().Replace(" ", "-") ?? $"field-{i}",
                    Label = f.Label,
                    Placeholder = f.Placeholder,
                    Type = f.Type ?? "TextBox",
                    IsRequired = f.IsRequired,
                    SortOrder = i,
                    MinLength = f.MinLength,
                    Regex = f.Regex,
                    DropdownValues = f.DropdownValues?.Select(dv => new DropdownValue
                    {
                        FieldId = f.Id,
                        Value = dv
                    }).ToList() ?? new List<DropdownValue>()
                }).ToList();
            }

            var updated = await _formRepository.UpdateAsync(existing);
            return Ok(updated);
        }

        [HttpDelete("forms/{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteForm(int id)
        {
            var existing = await _formRepository.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = $"Form with id {id} not found" });

            if (await _formRepository.HasSubmissionsAsync(id))
                return BadRequest(new { message = "Form has existing submissions and cannot be deleted" });

            await _formRepository.DeleteAsync(id);
            return Ok(new { message = $"Form '{existing.Name}' deleted successfully" });
        }

        [HttpPut("forms/{id:int}/fields/order")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ReorderFields(int id, [FromBody] Dictionary<int, int> fieldOrder)
        {
            var existing = await _formRepository.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = $"Form with id {id} not found" });

            await _formRepository.UpdateOrderAsync(id, fieldOrder);
            return Ok(new { message = "Field order updated successfully" });
        }
    }

    public class FormListItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int FieldCount { get; set; }
    }

    public class CreateFormRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public List<FieldRequest>? Fields { get; set; }
    }

    public class UpdateFormRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public List<FieldRequest>? Fields { get; set; }
    }

    public class FieldRequest
    {
        public int Id { get; set; }
        public string? Alias { get; set; }
        public string? Label { get; set; }
        public string? Placeholder { get; set; }
        public string? Type { get; set; }
        public bool IsRequired { get; set; }
        public int MinLength { get; set; }
        public string? Regex { get; set; }
        public List<string>? DropdownValues { get; set; }
    }
}
