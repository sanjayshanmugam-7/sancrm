using FluentValidation;
using SanCRM.Application.DTOs;

namespace SanCRM.Application.Validators;

public class CreateContactValidator : AbstractValidator<CreateContactDto>
{
    public CreateContactValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(80).WithMessage("First name must not exceed 80 characters.");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Invalid email address.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Phone)
            .Matches(@"^[\+]?[0-9\s\-\(\)]{7,20}$")
            .WithMessage("Invalid phone number.")
            .When(x => !string.IsNullOrWhiteSpace(x.Phone));

        RuleFor(x => x.ContactType)
            .Must(t => new[] { "Individual", "Business" }.Contains(t))
            .WithMessage("Contact type must be Individual or Business.")
            .When(x => !string.IsNullOrWhiteSpace(x.ContactType));

        RuleFor(x => x.DateOfBirth)
            .Must(d => DateOnly.TryParse(d, out _))
            .WithMessage("Invalid date of birth format (yyyy-MM-dd).")
            .When(x => !string.IsNullOrWhiteSpace(x.DateOfBirth));
    }
}

public class UpdateContactValidator : AbstractValidator<UpdateContactDto>
{
    public UpdateContactValidator()
    {
        Include(new CreateContactValidator());

        RuleFor(x => x.Status)
            .Must(s => new[] { "Active", "Inactive", "Blocked" }.Contains(s))
            .WithMessage("Invalid status.")
            .When(x => !string.IsNullOrWhiteSpace(x.Status));
    }
}
