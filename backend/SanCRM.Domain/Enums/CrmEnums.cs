namespace SanCRM.Domain.Enums;

public enum LeadStatus { New, Contacted, Qualified, Unqualified, Converted, Lost }
public enum LeadSource { Website, Facebook, Instagram, GoogleAds, WhatsApp, Email, LinkedIn, Referral, ColdCall, TradeShow, WalkIn, Other }
public enum LeadRating { Hot, Warm, Cold }

public enum OpportunityStage { Prospecting, Qualification, NeedsAnalysis, Proposal, Negotiation, ClosedWon, ClosedLost }

public enum CompanyType { Customer, Prospect, Lead, Partner, Vendor }
public enum CompanyStatus { Active, Inactive, Blocked }
public enum BranchType { Headquarters, RegionalOffice, Branch, Warehouse }
public enum CategoryPriority { Platinum, Gold, Silver, Bronze }
public enum CreditStatus { Good, Warning, Exceeded, Blocked }
public enum GstRegistrationType { Regular, Composition, Unregistered }

public enum ContactType { Individual, Business }
public enum ContactStatus { Active, Inactive, Blocked }
public enum Salutation { Mr, Mrs, Ms, Dr, Prof }

public enum AddressType { Billing, Shipping, Both }
public enum EntityType { Lead, Contact, Company, Branch, Opportunity, Campaign, Document, Note }

public enum CallDirection { Inbound, Outbound }
public enum CallStatus { Scheduled, Completed, NoAnswer, Voicemail, Cancelled }

public enum MeetingStatus { Scheduled, Completed, Cancelled, Rescheduled }
public enum AttendeeResponse { Accepted, Declined, Tentative, NoResponse }

public enum EmailStatus { Draft, Sent, Delivered, Opened, Replied, Bounced, Failed }

public enum FollowUpType { Call, Email, Meeting, WhatsApp, SMS, Other }
public enum FollowUpPriority { Low, Medium, High, Urgent }
public enum FollowUpStatus { Pending, Completed, Overdue, Cancelled }

public enum CampaignType { Email, SMS, WhatsApp, Facebook, Google, Push }
public enum CampaignStatus { Draft, Active, Paused, Completed, Cancelled }
public enum RecipientStatus { Queued, Sent, Delivered, Opened, Clicked, Converted, Bounced, Unsubscribed, Failed }

public enum DocumentType { Proposal, Agreement, Quotation, OCR, Other }
public enum DocumentStatus { Draft, Sent, Viewed, Opened, Accepted, Rejected, Signed, Expired, Cancelled }
public enum SignatureStatus { Pending, Viewed, Signed, Declined }
public enum OcrStatus { Queued, Processing, Processed, Failed }

public enum CommunicationChannel { Call, Email, WhatsApp, SMS, Meeting, Facebook, Instagram, Chat, LinkedIn }
public enum Direction { Inbound, Outbound }

public enum RelationSourceType { Lead, Contact, Company, User, Opportunity }

public enum DuplicateStatus { Pending, Merged, Ignored }

public enum ImportType { Lead, Contact, Company }
public enum ImportStatus { Pending, Processing, Completed, Failed }

public enum AuditAction { Create, Update, Delete, Login, Logout, Export, Import }

public enum AiGrade { A, B, C, D }
