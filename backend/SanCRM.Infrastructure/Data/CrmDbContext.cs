using Microsoft.EntityFrameworkCore;
using SanCRM.Domain.Entities;
using SanCRM.Domain.Enums;

namespace SanCRM.Infrastructure.Data;

public class CrmDbContext : DbContext
{
    public CrmDbContext(DbContextOptions<CrmDbContext> options) : base(options) { }

    // Users & Auth
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // Accounts
    public DbSet<ParentCompany> ParentCompanies => Set<ParentCompany>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<CustomerCategory> CustomerCategories => Set<CustomerCategory>();
    public DbSet<CreditLimit> CreditLimits => Set<CreditLimit>();
    public DbSet<GstDetail> GstDetails => Set<GstDetail>();
    public DbSet<Address> Addresses => Set<Address>();

    // Contacts
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<CustomerGroup> CustomerGroups => Set<CustomerGroup>();
    public DbSet<ContactGroupMember> ContactGroupMembers => Set<ContactGroupMember>();

    // Leads
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadAssignmentRule> LeadAssignmentRules => Set<LeadAssignmentRule>();
    public DbSet<AiLeadScore> AiLeadScores => Set<AiLeadScore>();
    public DbSet<BulkImport> BulkImports => Set<BulkImport>();
    public DbSet<DuplicateRecord> DuplicateRecords => Set<DuplicateRecord>();

    // Opportunities
    public DbSet<Opportunity> Opportunities => Set<Opportunity>();
    public DbSet<OpportunityStageHistory> OpportunityStageHistories => Set<OpportunityStageHistory>();

    // Activities
    public DbSet<Call> Calls => Set<Call>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<MeetingAttendee> MeetingAttendees => Set<MeetingAttendee>();
    public DbSet<EmailLog> EmailLogs => Set<EmailLog>();
    public DbSet<Followup> Followups => Set<Followup>();

    // Communication
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<CommunicationHistory> CommunicationHistories => Set<CommunicationHistory>();
    public DbSet<Relationship> Relationships => Set<Relationship>();

    // Campaigns
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<CampaignStats> CampaignStats => Set<CampaignStats>();
    public DbSet<CampaignRecipient> CampaignRecipients => Set<CampaignRecipient>();

    // Documents
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentLineItem> DocumentLineItems => Set<DocumentLineItem>();
    public DbSet<DocumentSignature> DocumentSignatures => Set<DocumentSignature>();
    public DbSet<OcrDocument> OcrDocuments => Set<OcrDocument>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Roles ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Role>(e =>
        {
            e.ToTable("roles");
            // Permissions stored as NVARCHAR(MAX) JSON string
        });

        // ── Users ────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasIndex(x => x.Email).IsUnique();
            e.HasOne(x => x.Role).WithMany(r => r.Users).HasForeignKey(x => x.RoleId);
        });

        // ── ParentCompanies ──────────────────────────────────────────────────
        modelBuilder.Entity<ParentCompany>(e => e.ToTable("parent_companies"));

        // ── Companies ────────────────────────────────────────────────────────
        modelBuilder.Entity<Company>(e =>
        {
            e.ToTable("companies");
            e.HasIndex(x => x.Status);
            e.Property(x => x.Type).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.ParentCompany).WithMany(p => p.Companies).HasForeignKey(x => x.ParentCompanyId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Category).WithMany(c => c.Companies).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.AssignedToUser).WithMany(u => u.AssignedCompanies).HasForeignKey(x => x.AssignedTo).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.CreditLimit).WithOne(cl => cl.Company).HasForeignKey<CreditLimit>(cl => cl.CompanyId);
        });

        // ── Branches ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Branch>(e =>
        {
            e.ToTable("branches");
            e.Property(x => x.BranchType).HasConversion<string>();
            e.HasOne(x => x.Company).WithMany(c => c.Branches).HasForeignKey(x => x.CompanyId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── CustomerCategories ───────────────────────────────────────────────
        modelBuilder.Entity<CustomerCategory>(e =>
        {
            e.ToTable("customer_categories");
            e.Property(x => x.Priority).HasConversion<string>();
        });

        // ── CreditLimits ─────────────────────────────────────────────────────
        modelBuilder.Entity<CreditLimit>(e =>
        {
            e.ToTable("credit_limits");
            e.Property(x => x.Limit).HasColumnName("credit_limit");
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.ReviewedByUser).WithMany().HasForeignKey(x => x.ReviewedBy).OnDelete(DeleteBehavior.SetNull);
        });

        // ── GstDetails ───────────────────────────────────────────────────────
        modelBuilder.Entity<GstDetail>(e =>
        {
            e.ToTable("gst_details");
            e.HasIndex(x => x.Gstin);
            e.Property(x => x.RegistrationType).HasConversion<string>();
            e.HasOne(x => x.Company).WithMany(c => c.GstDetails).HasForeignKey(x => x.CompanyId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Branch).WithMany(b => b.GstDetails).HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.SetNull);
        });

        // ── Addresses ────────────────────────────────────────────────────────
        modelBuilder.Entity<Address>(e =>
        {
            e.ToTable("addresses");
            e.HasIndex(x => new { x.EntityType, x.EntityId });
            e.Property(x => x.EntityType).HasConversion<string>();
            e.Property(x => x.AddressType).HasConversion<string>();
        });

        // ── Contacts ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Contact>(e =>
        {
            e.ToTable("contacts");
            e.HasIndex(x => x.Email);
            e.HasIndex(x => x.Phone);
            e.Property(x => x.ContactType).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.Company).WithMany(c => c.Contacts).HasForeignKey(x => x.CompanyId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Branch).WithMany().HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.AssignedToUser).WithMany(u => u.AssignedContacts).HasForeignKey(x => x.AssignedTo).OnDelete(DeleteBehavior.SetNull);
        });

        // ── CustomerGroups / Members ─────────────────────────────────────────
        modelBuilder.Entity<CustomerGroup>(e => e.ToTable("customer_groups"));
        modelBuilder.Entity<ContactGroupMember>(e =>
        {
            e.ToTable("contact_group_members");
            e.HasKey(x => new { x.ContactId, x.GroupId });
            e.HasOne(x => x.Contact).WithMany(c => c.GroupMemberships).HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Group).WithMany(g => g.Members).HasForeignKey(x => x.GroupId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Leads ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Lead>(e =>
        {
            e.ToTable("leads");
            e.HasIndex(x => x.LeadNo).IsUnique();
            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.Source);
            e.HasIndex(x => x.Email);
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.Source).HasConversion<string>();
            e.Property(x => x.Rating).HasConversion<string>();
            e.HasOne(x => x.AssignedToUser).WithMany(u => u.AssignedLeads).HasForeignKey(x => x.AssignedTo).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.AiLeadScore).WithOne(a => a.Lead).HasForeignKey<AiLeadScore>(a => a.LeadId);
        });

        // ── LeadAssignmentRules ───────────────────────────────────────────────
        modelBuilder.Entity<LeadAssignmentRule>(e =>
        {
            e.ToTable("lead_assignment_rules");
            e.Property(x => x.Conditions).HasColumnType("json");
        });

        // ── AiLeadScores ──────────────────────────────────────────────────────
        modelBuilder.Entity<AiLeadScore>(e =>
        {
            e.ToTable("ai_lead_scores");
            e.Property(x => x.Grade).HasConversion<string>();
            e.Property(x => x.Factors).HasColumnType("json");
        });

        // ── DuplicateRecords ──────────────────────────────────────────────────
        modelBuilder.Entity<DuplicateRecord>(e =>
        {
            e.ToTable("duplicate_records");
            e.Property(x => x.EntityType).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.MatchFields).HasColumnType("json");
        });

        // ── BulkImports ───────────────────────────────────────────────────────
        modelBuilder.Entity<BulkImport>(e =>
        {
            e.ToTable("bulk_imports");
            e.Property(x => x.ImportType).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.ErrorLog).HasColumnType("json");
        });

        // ── Opportunities ─────────────────────────────────────────────────────
        modelBuilder.Entity<Opportunity>(e =>
        {
            e.ToTable("opportunities");
            e.HasIndex(x => x.OppNo).IsUnique();
            e.HasIndex(x => x.Stage);
            e.Property(x => x.Stage).HasConversion<string>();
            e.HasOne(x => x.Company).WithMany(c => c.Opportunities).HasForeignKey(x => x.CompanyId);
            e.HasOne(x => x.Contact).WithMany().HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Lead).WithMany().HasForeignKey(x => x.LeadId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.AssignedToUser).WithMany(u => u.AssignedOpportunities).HasForeignKey(x => x.AssignedTo).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<OpportunityStageHistory>(e =>
        {
            e.ToTable("opportunity_stage_history");
            e.HasOne(x => x.Opportunity).WithMany(o => o.StageHistory).HasForeignKey(x => x.OpportunityId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Calls ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Call>(e =>
        {
            e.ToTable("calls");
            e.HasIndex(x => new { x.EntityType, x.EntityId });
            e.HasIndex(x => x.CallDatetime);
            e.Property(x => x.Direction).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.EntityType).HasConversion<string>();
        });

        // ── Meetings ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Meeting>(e =>
        {
            e.ToTable("meetings");
            e.HasIndex(x => new { x.EntityType, x.EntityId });
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.EntityType).HasConversion<string>();
        });

        modelBuilder.Entity<MeetingAttendee>(e =>
        {
            e.ToTable("meeting_attendees");
            e.HasKey(x => new { x.MeetingId, x.UserId, x.ContactId });
            e.Property(x => x.Response).HasConversion<string>();
            e.HasOne(x => x.Meeting).WithMany(m => m.Attendees).HasForeignKey(x => x.MeetingId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Contact).WithMany().HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── EmailLogs ─────────────────────────────────────────────────────────
        modelBuilder.Entity<EmailLog>(e =>
        {
            e.ToTable("email_logs");
            e.HasIndex(x => new { x.EntityType, x.EntityId });
            e.Property(x => x.EntityType).HasConversion<string>();
            e.Property(x => x.Direction).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
        });

        // ── Followups ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Followup>(e =>
        {
            e.ToTable("followups");
            e.HasIndex(x => new { x.EntityType, x.EntityId });
            e.HasIndex(x => x.Status);
            e.HasIndex(x => x.DueDate);
            e.Property(x => x.EntityType).HasConversion<string>();
            e.Property(x => x.Type).HasConversion<string>();
            e.Property(x => x.Priority).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
        });

        // ── Notes ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Note>(e =>
        {
            e.ToTable("notes");
            e.HasIndex(x => new { x.EntityType, x.EntityId });
            e.Property(x => x.EntityType).HasConversion<string>();
            e.Property(x => x.Tags).HasColumnType("json");
        });

        // ── Attachments ───────────────────────────────────────────────────────
        modelBuilder.Entity<Attachment>(e =>
        {
            e.ToTable("attachments");
            e.HasIndex(x => new { x.EntityType, x.EntityId });
            e.Property(x => x.EntityType).HasConversion<string>();
        });

        // ── CommunicationHistory ──────────────────────────────────────────────
        modelBuilder.Entity<CommunicationHistory>(e =>
        {
            e.ToTable("communication_history");
            e.HasIndex(x => new { x.EntityType, x.EntityId });
            e.Property(x => x.EntityType).HasConversion<string>();
            e.Property(x => x.Channel).HasConversion<string>();
            e.Property(x => x.Direction).HasConversion<string>();
        });

        // ── Relationships ─────────────────────────────────────────────────────
        modelBuilder.Entity<Relationship>(e =>
        {
            e.ToTable("relationships");
            e.HasIndex(x => new { x.SourceType, x.SourceId });
            e.Property(x => x.SourceType).HasConversion<string>();
            e.Property(x => x.TargetType).HasConversion<string>();
        });

        // ── Campaigns ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Campaign>(e =>
        {
            e.ToTable("campaigns");
            e.HasIndex(x => x.Type);
            e.HasIndex(x => x.Status);
            e.Property(x => x.Type).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
        });

        modelBuilder.Entity<CampaignStats>(e =>
        {
            e.ToTable("campaign_stats");
            e.HasOne(x => x.Campaign).WithOne(c => c.Stats).HasForeignKey<CampaignStats>(x => x.CampaignId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CampaignRecipient>(e =>
        {
            e.ToTable("campaign_recipients");
            e.HasIndex(x => x.CampaignId);
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.EntityType).HasConversion<string>();
            e.HasOne(x => x.Campaign).WithMany(c => c.Recipients).HasForeignKey(x => x.CampaignId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Documents ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Document>(e =>
        {
            e.ToTable("documents");
            e.HasIndex(x => x.DocNo).IsUnique();
            e.Property(x => x.DocType).HasConversion<string>();
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.EntityType).HasConversion<string>();
            e.HasOne(x => x.Opportunity).WithMany(o => o.Documents).HasForeignKey(x => x.OpportunityId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<DocumentLineItem>(e =>
        {
            e.ToTable("document_line_items");
            e.HasOne(x => x.Document).WithMany(d => d.LineItems).HasForeignKey(x => x.DocumentId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DocumentSignature>(e =>
        {
            e.ToTable("document_signatures");
            e.HasIndex(x => x.Token).IsUnique();
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.Document).WithMany(d => d.Signatures).HasForeignKey(x => x.DocumentId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OcrDocument>(e =>
        {
            e.ToTable("ocr_documents");
            e.Property(x => x.Status).HasConversion<string>();
        });

        // ── AuditLogs ─────────────────────────────────────────────────────────
        modelBuilder.Entity<AuditLog>(e =>
        {
            e.ToTable("audit_logs");
            e.HasIndex(x => new { x.EntityType, x.EntityId });
            e.HasIndex(x => x.UserId);
            e.HasIndex(x => x.OccurredAt);
            e.Property(x => x.Action).HasConversion<string>();
            e.Property(x => x.OldValues).HasColumnType("json");
            e.Property(x => x.NewValues).HasColumnType("json");
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        // ── Seed Data ─────────────────────────────────────────────────────────
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin",     CreatedAt = new DateTime(2024, 1, 1) },
            new Role { Id = 2, Name = "Manager",   CreatedAt = new DateTime(2024, 1, 1) },
            new Role { Id = 3, Name = "Sales Rep", CreatedAt = new DateTime(2024, 1, 1) }
        );
    }
}
