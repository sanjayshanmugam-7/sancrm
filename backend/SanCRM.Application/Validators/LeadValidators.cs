using FluentValidation;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Validators;

public class CreateLeadValidator : AbstractValidator<CreateLeadDto>
{
    public CreateLeadValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(80).WithMessage("First name must not exceed 80 characters.");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Invalid email address.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Phone)
            .Matches(@"^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$")
            .WithMessage("Invalid phone number format.")
            .When(x => !string.IsNullOrWhiteSpace(x.Phone));

        RuleFor(x => x.Source)
            .NotEmpty().WithMessage("Lead source is required.")
            .Must(s => new[] { "Website","Facebook","Instagram","GoogleAds","WhatsApp","Email",
                                "LinkedIn","Referral","ColdCall","TradeShow","WalkIn","Other" }.Contains(s))
            .WithMessage("Invalid lead source.");

        RuleFor(x => x.Rating)
            .Must(r => new[] { "Hot", "Warm", "Cold" }.Contains(r))
            .WithMessage("Rating must be Hot, Warm, or Cold.")
            .When(x => !string.IsNullOrWhiteSpace(x.Rating));

        RuleFor(x => x.AnnualRevenue)
            .GreaterThanOrEqualTo(0).WithMessage("Annual revenue cannot be negative.")
            .When(x => x.AnnualRevenue.HasValue);

        RuleFor(x => x.EmployeeCount)
            .GreaterThanOrEqualTo(0).WithMessage("Employee count cannot be negative.")
            .When(x => x.EmployeeCount.HasValue);

        RuleFor(x => x.Website)
            .Must(w => Uri.TryCreate(w, UriKind.Absolute, out _))
            .WithMessage("Invalid website URL.")
            .When(x => !string.IsNullOrWhiteSpace(x.Website));
    }
}

public class UpdateLeadValidator : AbstractValidator<UpdateLeadDto>
{
    public UpdateLeadValidator()
    {
        Include(new CreateLeadValidator());

        RuleFor(x => x.Status)
            .Must(s => new[] { "New","Contacted","Qualified","Unqualified","Converted","Lost" }.Contains(s))
            .WithMessage("Invalid lead status.")
            .When(x => !string.IsNullOrWhiteSpace(x.Status));
    }
}
