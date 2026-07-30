using FluentValidation;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Validators;

public class CreateOpportunityValidator : AbstractValidator<CreateOpportunityDto>
{
    private static readonly string[] ValidStages =
        { "Prospecting","Qualification","NeedsAnalysis","Needs Analysis","Proposal","Negotiation","ClosedWon","Closed Won","ClosedLost","Closed Lost" };

    public CreateOpportunityValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Opportunity title is required.")
            .MaximumLength(255).WithMessage("Title must not exceed 255 characters.");

        RuleFor(x => x.CompanyId)
            .GreaterThan(0).WithMessage("A valid company must be selected.");

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(0).WithMessage("Amount cannot be negative.");

        RuleFor(x => x.Probability)
            .InclusiveBetween((byte)0, (byte)100).WithMessage("Probability must be between 0 and 100.");

        RuleFor(x => x.Stage)
            .Must(s => ValidStages.Contains(s))
            .WithMessage("Invalid pipeline stage.")
            .When(x => !string.IsNullOrWhiteSpace(x.Stage));

        RuleFor(x => x.ExpectedClose)
            .Must(d => DateOnly.TryParse(d, out _))
            .WithMessage("Invalid expected close date format (yyyy-MM-dd).")
            .When(x => !string.IsNullOrWhiteSpace(x.ExpectedClose));
    }
}
