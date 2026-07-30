using FluentValidation;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Validators;

public class CreateAccountValidator : AbstractValidator<CreateAccountDto>
{
    public CreateAccountValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Company name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");

        RuleFor(x => x.Type)
            .Must(t => new[] { "Customer","Prospect","Lead","Partner","Vendor" }.Contains(t))
            .WithMessage("Invalid company type.")
            .When(x => !string.IsNullOrWhiteSpace(x.Type));

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Invalid email address.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Gstin)
            .Matches(@"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
            .WithMessage("Invalid GSTIN format.")
            .When(x => !string.IsNullOrWhiteSpace(x.Gstin));

        RuleFor(x => x.AnnualRevenue)
            .GreaterThanOrEqualTo(0).WithMessage("Annual revenue cannot be negative.")
            .When(x => x.AnnualRevenue.HasValue);

        RuleFor(x => x.Website)
            .Must(w => Uri.TryCreate(w, UriKind.Absolute, out _))
            .WithMessage("Invalid website URL.")
            .When(x => !string.IsNullOrWhiteSpace(x.Website));
    }
}
