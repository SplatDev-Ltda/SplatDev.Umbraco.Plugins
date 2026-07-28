using FluentValidation;
using SplatDev.Umbraco.Workflow.Api.Contracts;

namespace SplatDev.Umbraco.Workflow.Api.Validators;

public sealed class TransitionRequestValidator : AbstractValidator<TransitionRequest>
{
    public TransitionRequestValidator()
    {
        RuleFor(r => r.ActionKey).NotEmpty().MaximumLength(64);
    }
}

public sealed class CreateInstanceRequestValidator : AbstractValidator<CreateInstanceRequest>
{
    public CreateInstanceRequestValidator()
    {
        RuleFor(r => r.WorkflowKey).NotEmpty().MaximumLength(64);
    }
}
