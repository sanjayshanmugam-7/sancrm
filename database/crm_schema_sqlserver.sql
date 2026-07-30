-- ============================================================
--  SanCRM - SQL Server Schema (T-SQL)
--  Compatible: SQL Server 2014+ / Azure SQL
--  Run this entire script in SSMS against your target database
-- ============================================================

USE master;
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'sancrm')
    CREATE DATABASE sancrm COLLATE SQL_Latin1_General_CP1_CI_AS;
GO
USE sancrm;
GO

-- ============================================================
-- CLEANUP: Drop all objects in dependency order
-- ============================================================

-- Drop triggers
IF OBJECT_ID('trg_credit_limits_updated','TR') IS NOT NULL DROP TRIGGER trg_credit_limits_updated;
IF OBJECT_ID('trg_documents_updated','TR')     IS NOT NULL DROP TRIGGER trg_documents_updated;
IF OBJECT_ID('trg_campaigns_updated','TR')     IS NOT NULL DROP TRIGGER trg_campaigns_updated;
IF OBJECT_ID('trg_followups_updated','TR')     IS NOT NULL DROP TRIGGER trg_followups_updated;
IF OBJECT_ID('trg_calls_updated','TR')         IS NOT NULL DROP TRIGGER trg_calls_updated;
IF OBJECT_ID('trg_opportunities_updated','TR') IS NOT NULL DROP TRIGGER trg_opportunities_updated;
IF OBJECT_ID('trg_leads_updated','TR')         IS NOT NULL DROP TRIGGER trg_leads_updated;
IF OBJECT_ID('trg_contacts_updated','TR')      IS NOT NULL DROP TRIGGER trg_contacts_updated;
IF OBJECT_ID('trg_companies_updated','TR')     IS NOT NULL DROP TRIGGER trg_companies_updated;
IF OBJECT_ID('trg_users_updated','TR')         IS NOT NULL DROP TRIGGER trg_users_updated;
GO

-- Drop tables in reverse dependency order
IF OBJECT_ID('audit_logs','U')               IS NOT NULL DROP TABLE audit_logs;
IF OBJECT_ID('ai_lead_scores','U')           IS NOT NULL DROP TABLE ai_lead_scores;
IF OBJECT_ID('duplicate_records','U')        IS NOT NULL DROP TABLE duplicate_records;
IF OBJECT_ID('bulk_imports','U')             IS NOT NULL DROP TABLE bulk_imports;
IF OBJECT_ID('ocr_documents','U')            IS NOT NULL DROP TABLE ocr_documents;
IF OBJECT_ID('document_signatures','U')      IS NOT NULL DROP TABLE document_signatures;
IF OBJECT_ID('document_line_items','U')      IS NOT NULL DROP TABLE document_line_items;
IF OBJECT_ID('documents','U')                IS NOT NULL DROP TABLE documents;
IF OBJECT_ID('campaign_recipients','U')      IS NOT NULL DROP TABLE campaign_recipients;
IF OBJECT_ID('campaign_stats','U')           IS NOT NULL DROP TABLE campaign_stats;
IF OBJECT_ID('campaigns','U')                IS NOT NULL DROP TABLE campaigns;
IF OBJECT_ID('relationships','U')            IS NOT NULL DROP TABLE relationships;
IF OBJECT_ID('communication_history','U')    IS NOT NULL DROP TABLE communication_history;
IF OBJECT_ID('attachments','U')              IS NOT NULL DROP TABLE attachments;
IF OBJECT_ID('notes','U')                    IS NOT NULL DROP TABLE notes;
IF OBJECT_ID('followups','U')                IS NOT NULL DROP TABLE followups;
IF OBJECT_ID('email_logs','U')               IS NOT NULL DROP TABLE email_logs;
IF OBJECT_ID('meeting_attendees','U')        IS NOT NULL DROP TABLE meeting_attendees;
IF OBJECT_ID('meetings','U')                 IS NOT NULL DROP TABLE meetings;
IF OBJECT_ID('calls','U')                    IS NOT NULL DROP TABLE calls;
IF OBJECT_ID('opportunity_stage_history','U')IS NOT NULL DROP TABLE opportunity_stage_history;
IF OBJECT_ID('opportunities','U')            IS NOT NULL DROP TABLE opportunities;
IF OBJECT_ID('lead_assignment_rules','U')    IS NOT NULL DROP TABLE lead_assignment_rules;
IF OBJECT_ID('leads','U')                    IS NOT NULL DROP TABLE leads;
IF OBJECT_ID('contact_group_members','U')    IS NOT NULL DROP TABLE contact_group_members;
IF OBJECT_ID('contacts','U')                 IS NOT NULL DROP TABLE contacts;
IF OBJECT_ID('customer_groups','U')          IS NOT NULL DROP TABLE customer_groups;
IF OBJECT_ID('addresses','U')                IS NOT NULL DROP TABLE addresses;
IF OBJECT_ID('gst_details','U')              IS NOT NULL DROP TABLE gst_details;
IF OBJECT_ID('credit_limits','U')            IS NOT NULL DROP TABLE credit_limits;
IF OBJECT_ID('branches','U')                 IS NOT NULL DROP TABLE branches;
IF OBJECT_ID('companies','U')                IS NOT NULL DROP TABLE companies;
IF OBJECT_ID('customer_categories','U')      IS NOT NULL DROP TABLE customer_categories;
IF OBJECT_ID('parent_companies','U')         IS NOT NULL DROP TABLE parent_companies;
IF OBJECT_ID('users','U')                    IS NOT NULL DROP TABLE users;
IF OBJECT_ID('roles','U')                    IS NOT NULL DROP TABLE roles;
GO

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE roles (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(50)  NOT NULL UNIQUE,
    permissions NVARCHAR(MAX) NULL,   -- stores JSON; ISJSON() check removed for SQL 2014 compat
    created_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE users (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    role_id       INT           NOT NULL,
    first_name    NVARCHAR(80)  NOT NULL,
    last_name     NVARCHAR(80)  NOT NULL,
    email         NVARCHAR(150) NOT NULL,
    phone         NVARCHAR(20)  NULL,
    password_hash NVARCHAR(255) NOT NULL,
    avatar_url    NVARCHAR(500) NULL,
    designation   NVARCHAR(100) NULL,
    department    NVARCHAR(100) NULL,
    is_active     BIT           NOT NULL DEFAULT 1,
    last_login    DATETIME2     NULL,
    created_at    DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at    DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT FK_users_role  FOREIGN KEY (role_id) REFERENCES roles(id)
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role_id);
GO

-- ============================================================
-- 3. PARENT COMPANIES
-- ============================================================
CREATE TABLE parent_companies (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    name       NVARCHAR(200) NOT NULL,
    industry   NVARCHAR(100) NULL,
    country    NVARCHAR(100) NOT NULL DEFAULT 'India',
    website    NVARCHAR(300) NULL,
    revenue    DECIMAL(18,2) NULL,
    currency   NVARCHAR(10)  NOT NULL DEFAULT 'INR',
    status     NVARCHAR(20)  NOT NULL DEFAULT 'Active'
               CHECK (status IN ('Active','Inactive')),
    created_by INT           NULL,
    created_at DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_parent_companies_user FOREIGN KEY (created_by) REFERENCES users(id)
);
GO

-- ============================================================
-- 4. CUSTOMER CATEGORIES
-- ============================================================
CREATE TABLE customer_categories (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    name         NVARCHAR(100) NOT NULL,
    description  NVARCHAR(MAX) NULL,
    color        NVARCHAR(10)  NOT NULL DEFAULT '#1976d2',
    priority     NVARCHAR(20)  NOT NULL DEFAULT 'Silver'
                 CHECK (priority IN ('Platinum','Gold','Silver','Bronze')),
    discount_pct DECIMAL(5,2)  NOT NULL DEFAULT 0,
    credit_limit DECIMAL(18,2) NOT NULL DEFAULT 0,
    sla_hours    INT           NOT NULL DEFAULT 24,
    created_at   DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_customer_categories_name UNIQUE (name)
);
GO

-- ============================================================
-- 5. COMPANIES (Accounts)
-- ============================================================
CREATE TABLE companies (
    id                INT IDENTITY(1,1) PRIMARY KEY,
    parent_company_id INT           NULL,
    name              NVARCHAR(200) NOT NULL,
    type              NVARCHAR(20)  NOT NULL DEFAULT 'Prospect'
                      CHECK (type IN ('Customer','Prospect','Lead','Partner','Vendor')),
    industry          NVARCHAR(100) NULL,
    website           NVARCHAR(300) NULL,
    email             NVARCHAR(150) NULL,
    phone             NVARCHAR(20)  NULL,
    employee_count    INT           NULL,
    annual_revenue    DECIMAL(18,2) NULL,
    currency          NVARCHAR(10)  NOT NULL DEFAULT 'INR',
    gstin             NVARCHAR(20)  NULL,
    pan               NVARCHAR(15)  NULL,
    category_id       INT           NULL,
    assigned_to       INT           NULL,
    status            NVARCHAR(20)  NOT NULL DEFAULT 'Active'
                      CHECK (status IN ('Active','Inactive','Blocked')),
    description       NVARCHAR(MAX) NULL,
    created_by        INT           NULL,
    created_at        DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at        DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_companies_parent   FOREIGN KEY (parent_company_id) REFERENCES parent_companies(id),
    CONSTRAINT FK_companies_category FOREIGN KEY (category_id)       REFERENCES customer_categories(id),
    CONSTRAINT FK_companies_assigned FOREIGN KEY (assigned_to)        REFERENCES users(id),
    CONSTRAINT FK_companies_created  FOREIGN KEY (created_by)         REFERENCES users(id)
);
CREATE INDEX idx_companies_parent   ON companies(parent_company_id);
CREATE INDEX idx_companies_assigned ON companies(assigned_to);
CREATE INDEX idx_companies_status   ON companies(status);
GO

-- ============================================================
-- 6. BRANCHES
-- ============================================================
CREATE TABLE branches (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    company_id  INT           NOT NULL,
    name        NVARCHAR(200) NOT NULL,
    branch_type NVARCHAR(30)  NOT NULL DEFAULT 'Branch'
                CHECK (branch_type IN ('Headquarters','Regional Office','Branch','Warehouse')),
    email       NVARCHAR(150) NULL,
    phone       NVARCHAR(20)  NULL,
    gstin       NVARCHAR(20)  NULL,
    is_primary  BIT           NOT NULL DEFAULT 0,
    status      NVARCHAR(20)  NOT NULL DEFAULT 'Active'
                CHECK (status IN ('Active','Inactive')),
    created_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_branches_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
CREATE INDEX idx_branches_company ON branches(company_id);
GO

-- ============================================================
-- 7. CREDIT LIMITS
-- ============================================================
CREATE TABLE credit_limits (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    company_id     INT           NOT NULL,
    credit_limit   DECIMAL(18,2) NOT NULL DEFAULT 0,
    used_amount    DECIMAL(18,2) NOT NULL DEFAULT 0,
    overdue_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    status         NVARCHAR(20)  NOT NULL DEFAULT 'Good'
                   CHECK (status IN ('Good','Warning','Exceeded','Blocked')),
    last_review    DATE          NULL,
    next_review    DATE          NULL,
    reviewed_by    INT           NULL,
    notes          NVARCHAR(MAX) NULL,
    created_at     DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at     DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_credit_limits_company  UNIQUE (company_id),
    CONSTRAINT FK_credit_limits_company  FOREIGN KEY (company_id)  REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT FK_credit_limits_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
GO

-- ============================================================
-- 8. GST DETAILS
-- ============================================================
CREATE TABLE gst_details (
    id                INT IDENTITY(1,1) PRIMARY KEY,
    company_id        INT           NOT NULL,
    branch_id         INT           NULL,
    gstin             NVARCHAR(20)  NOT NULL,
    legal_name        NVARCHAR(200) NULL,
    trade_name        NVARCHAR(200) NULL,
    gst_state_code    NVARCHAR(5)   NULL,
    state             NVARCHAR(100) NULL,
    registration_type NVARCHAR(20)  NOT NULL DEFAULT 'Regular'
                      CHECK (registration_type IN ('Regular','Composition','Unregistered')),
    is_verified       BIT           NOT NULL DEFAULT 0,
    verified_at       DATETIME2     NULL,
    created_at        DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_gst_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT FK_gst_branch  FOREIGN KEY (branch_id)  REFERENCES branches(id)
);
CREATE INDEX idx_gst_company ON gst_details(company_id);
CREATE INDEX idx_gst_gstin   ON gst_details(gstin);
GO

-- ============================================================
-- 9. ADDRESSES
-- ============================================================
CREATE TABLE addresses (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    entity_type   NVARCHAR(20)  NOT NULL
                  CHECK (entity_type IN ('Company','Branch','Contact','Lead')),
    entity_id     INT           NOT NULL,
    address_type  NVARCHAR(20)  NOT NULL DEFAULT 'Billing'
                  CHECK (address_type IN ('Billing','Shipping','Both')),
    address_line1 NVARCHAR(255) NULL,
    address_line2 NVARCHAR(255) NULL,
    city          NVARCHAR(100) NULL,
    state         NVARCHAR(100) NULL,
    pincode       NVARCHAR(15)  NULL,
    country       NVARCHAR(100) NOT NULL DEFAULT 'India',
    gstin         NVARCHAR(20)  NULL,
    is_default    BIT           NOT NULL DEFAULT 0,
    created_at    DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at    DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
CREATE INDEX idx_addresses_entity ON addresses(entity_type, entity_id);
GO

-- ============================================================
-- 10. CUSTOMER GROUPS
-- ============================================================
CREATE TABLE customer_groups (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX) NULL,
    color       NVARCHAR(10)  NOT NULL DEFAULT '#1976d2',
    created_by  INT           NULL,
    created_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_customer_groups_user FOREIGN KEY (created_by) REFERENCES users(id)
);
GO

-- ============================================================
-- 11. CONTACTS
-- ============================================================
CREATE TABLE contacts (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    company_id     INT           NULL,
    branch_id      INT           NULL,
    contact_type   NVARCHAR(20)  NOT NULL DEFAULT 'Individual'
                   CHECK (contact_type IN ('Individual','Business')),
    salutation     NVARCHAR(10)  NULL
                   CHECK (salutation IS NULL OR salutation IN ('Mr.','Mrs.','Ms.','Dr.','Prof.')),
    first_name     NVARCHAR(80)  NOT NULL,
    last_name      NVARCHAR(80)  NULL,
    email          NVARCHAR(150) NULL,
    email_alt      NVARCHAR(150) NULL,
    phone          NVARCHAR(20)  NULL,
    phone_alt      NVARCHAR(20)  NULL,
    mobile         NVARCHAR(20)  NULL,
    whatsapp       NVARCHAR(20)  NULL,
    designation    NVARCHAR(100) NULL,
    department     NVARCHAR(100) NULL,
    decision_maker BIT           NOT NULL DEFAULT 0,
    linkedin       NVARCHAR(300) NULL,
    facebook       NVARCHAR(300) NULL,
    instagram      NVARCHAR(300) NULL,
    twitter        NVARCHAR(300) NULL,
    date_of_birth  DATE          NULL,
    anniversary    DATE          NULL,
    avatar_url     NVARCHAR(500) NULL,
    group_id       INT           NULL,
    assigned_to    INT           NULL,
    source         NVARCHAR(100) NULL,
    status         NVARCHAR(20)  NOT NULL DEFAULT 'Active'
                   CHECK (status IN ('Active','Inactive','Blocked')),
    do_not_contact BIT           NOT NULL DEFAULT 0,
    notes          NVARCHAR(MAX) NULL,
    created_by     INT           NULL,
    created_at     DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at     DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_contacts_company  FOREIGN KEY (company_id)  REFERENCES companies(id),
    CONSTRAINT FK_contacts_branch   FOREIGN KEY (branch_id)   REFERENCES branches(id),
    CONSTRAINT FK_contacts_group    FOREIGN KEY (group_id)    REFERENCES customer_groups(id),
    CONSTRAINT FK_contacts_assigned FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT FK_contacts_created  FOREIGN KEY (created_by)  REFERENCES users(id)
);
CREATE INDEX idx_contacts_company  ON contacts(company_id);
CREATE INDEX idx_contacts_email    ON contacts(email);
CREATE INDEX idx_contacts_phone    ON contacts(phone);
CREATE INDEX idx_contacts_assigned ON contacts(assigned_to);
GO

-- ============================================================
-- 12. CONTACT GROUP MEMBERS
-- ============================================================
CREATE TABLE contact_group_members (
    contact_id INT       NOT NULL,
    group_id   INT       NOT NULL,
    added_at   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_contact_group_members PRIMARY KEY (contact_id, group_id),
    CONSTRAINT FK_cgm_contact FOREIGN KEY (contact_id) REFERENCES contacts(id)       ON DELETE CASCADE,
    CONSTRAINT FK_cgm_group   FOREIGN KEY (group_id)   REFERENCES customer_groups(id)
);
GO

-- ============================================================
-- 13. LEADS
-- ============================================================
CREATE TABLE leads (
    id                       INT IDENTITY(1,1) PRIMARY KEY,
    lead_no                  NVARCHAR(30)  NOT NULL,
    salutation               NVARCHAR(10)  NULL
                             CHECK (salutation IS NULL OR salutation IN ('Mr.','Mrs.','Ms.','Dr.')),
    first_name               NVARCHAR(80)  NOT NULL,
    last_name                NVARCHAR(80)  NULL,
    company_name             NVARCHAR(200) NULL,
    email                    NVARCHAR(150) NULL,
    phone                    NVARCHAR(20)  NULL,
    mobile                   NVARCHAR(20)  NULL,
    whatsapp                 NVARCHAR(20)  NULL,
    designation              NVARCHAR(100) NULL,
    source                   NVARCHAR(30)  NOT NULL DEFAULT 'Website'
                             CHECK (source IN ('Website','Facebook','Instagram','Google Ads',
                                               'WhatsApp','Email','LinkedIn','Referral',
                                               'Cold Call','Trade Show','Walk-in','Other')),
    source_campaign          INT           NULL,
    status                   NVARCHAR(20)  NOT NULL DEFAULT 'New'
                             CHECK (status IN ('New','Contacted','Qualified','Unqualified','Converted','Lost')),
    rating                   NVARCHAR(10)  NOT NULL DEFAULT 'Warm'
                             CHECK (rating IN ('Hot','Warm','Cold')),
    ai_score                 TINYINT       NOT NULL DEFAULT 0,
    assigned_to              INT           NULL,
    industry                 NVARCHAR(100) NULL,
    annual_revenue           DECIMAL(18,2) NULL,
    employee_count           INT           NULL,
    website                  NVARCHAR(300) NULL,
    description              NVARCHAR(MAX) NULL,
    lost_reason              NVARCHAR(255) NULL,
    is_duplicate             BIT           NOT NULL DEFAULT 0,
    duplicate_of             INT           NULL,
    converted_at             DATETIME2     NULL,
    converted_to_contact     INT           NULL,
    converted_to_company     INT           NULL,
    converted_to_opportunity INT           NULL,
    created_by               INT           NULL,
    created_at               DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at               DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_leads_lead_no  UNIQUE (lead_no),
    CONSTRAINT FK_leads_assigned FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT FK_leads_created  FOREIGN KEY (created_by)  REFERENCES users(id)
);
CREATE INDEX idx_leads_status     ON leads(status);
CREATE INDEX idx_leads_source     ON leads(source);
CREATE INDEX idx_leads_assigned   ON leads(assigned_to);
CREATE INDEX idx_leads_email      ON leads(email);
CREATE INDEX idx_leads_ai_score   ON leads(ai_score);
CREATE INDEX idx_leads_created_at ON leads(created_at);
GO

-- ============================================================
-- 14. LEAD ASSIGNMENT RULES
-- ============================================================
CREATE TABLE lead_assignment_rules (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    rule_name   NVARCHAR(150) NOT NULL,
    priority    INT           NOT NULL DEFAULT 1,
    conditions  NVARCHAR(MAX) NOT NULL,   -- stores JSON array
    assign_to   INT           NOT NULL,
    round_robin BIT           NOT NULL DEFAULT 0,
    is_active   BIT           NOT NULL DEFAULT 1,
    created_by  INT           NULL,
    created_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_lar_assign_to  FOREIGN KEY (assign_to)  REFERENCES users(id),
    CONSTRAINT FK_lar_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);
GO

-- ============================================================
-- 15. OPPORTUNITIES
-- ============================================================
CREATE TABLE opportunities (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    opp_no         NVARCHAR(30)   NOT NULL,
    title          NVARCHAR(255)  NOT NULL,
    company_id     INT            NOT NULL,
    contact_id     INT            NULL,
    lead_id        INT            NULL,
    assigned_to    INT            NULL,
    stage          NVARCHAR(30)   NOT NULL DEFAULT 'Prospecting'
                   CHECK (stage IN ('Prospecting','Qualification','Needs Analysis',
                                    'Proposal','Negotiation','Closed Won','Closed Lost')),
    amount         DECIMAL(18,2)  NOT NULL DEFAULT 0,
    currency       NVARCHAR(10)   NOT NULL DEFAULT 'INR',
    probability    TINYINT        NOT NULL DEFAULT 0,
    expected_close DATE           NULL,
    actual_close   DATE           NULL,
    lost_reason    NVARCHAR(255)  NULL,
    lost_to        NVARCHAR(200)  NULL,
    source         NVARCHAR(100)  NULL,
    type           NVARCHAR(100)  NULL,
    description    NVARCHAR(MAX)  NULL,
    next_step      NVARCHAR(500)  NULL,
    ai_prediction  DECIMAL(5,2)   NULL,
    created_by     INT            NULL,
    created_at     DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    updated_at     DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_opp_no       UNIQUE (opp_no),
    CONSTRAINT FK_opp_company  FOREIGN KEY (company_id)  REFERENCES companies(id),
    CONSTRAINT FK_opp_contact  FOREIGN KEY (contact_id)  REFERENCES contacts(id),
    CONSTRAINT FK_opp_lead     FOREIGN KEY (lead_id)     REFERENCES leads(id),
    CONSTRAINT FK_opp_assigned FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT FK_opp_created  FOREIGN KEY (created_by)  REFERENCES users(id)
);
CREATE INDEX idx_opp_company    ON opportunities(company_id);
CREATE INDEX idx_opp_stage      ON opportunities(stage);
CREATE INDEX idx_opp_assigned   ON opportunities(assigned_to);
CREATE INDEX idx_opp_close_date ON opportunities(expected_close);
GO

-- ============================================================
-- 16. OPPORTUNITY STAGE HISTORY
-- ============================================================
CREATE TABLE opportunity_stage_history (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    opportunity_id INT           NOT NULL,
    from_stage     NVARCHAR(50)  NULL,
    to_stage       NVARCHAR(50)  NOT NULL,
    changed_by     INT           NULL,
    notes          NVARCHAR(MAX) NULL,
    changed_at     DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_osh_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    CONSTRAINT FK_osh_changed_by  FOREIGN KEY (changed_by)     REFERENCES users(id)
);
CREATE INDEX idx_opp_stage_history ON opportunity_stage_history(opportunity_id);
GO

-- ============================================================
-- 17. CALLS
-- ============================================================
CREATE TABLE calls (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    subject       NVARCHAR(255) NOT NULL,
    direction     NVARCHAR(10)  NOT NULL DEFAULT 'Outbound'
                  CHECK (direction IN ('Inbound','Outbound')),
    status        NVARCHAR(20)  NOT NULL DEFAULT 'Scheduled'
                  CHECK (status IN ('Scheduled','Completed','No Answer','Voicemail','Cancelled')),
    entity_type   NVARCHAR(20)  NOT NULL
                  CHECK (entity_type IN ('Lead','Contact','Company','Opportunity')),
    entity_id     INT           NOT NULL,
    assigned_to   INT           NOT NULL,
    call_datetime DATETIME2     NOT NULL,
    duration_sec  INT           NOT NULL DEFAULT 0,
    recording_url NVARCHAR(500) NULL,
    description   NVARCHAR(MAX) NULL,
    outcome       NVARCHAR(255) NULL,
    created_by    INT           NULL,
    created_at    DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at    DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_calls_assigned FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT FK_calls_created  FOREIGN KEY (created_by)  REFERENCES users(id)
);
CREATE INDEX idx_calls_entity   ON calls(entity_type, entity_id);
CREATE INDEX idx_calls_datetime ON calls(call_datetime);
CREATE INDEX idx_calls_assigned ON calls(assigned_to);
GO

-- ============================================================
-- 18. MEETINGS
-- ============================================================
CREATE TABLE meetings (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    title          NVARCHAR(255) NOT NULL,
    status         NVARCHAR(20)  NOT NULL DEFAULT 'Scheduled'
                   CHECK (status IN ('Scheduled','Completed','Cancelled','Rescheduled')),
    entity_type    NVARCHAR(20)  NOT NULL
                   CHECK (entity_type IN ('Lead','Contact','Company','Opportunity')),
    entity_id      INT           NOT NULL,
    location       NVARCHAR(300) NULL,
    meeting_url    NVARCHAR(500) NULL,
    start_datetime DATETIME2     NOT NULL,
    end_datetime   DATETIME2     NOT NULL,
    agenda         NVARCHAR(MAX) NULL,
    minutes        NVARCHAR(MAX) NULL,
    outcome        NVARCHAR(500) NULL,
    created_by     INT           NULL,
    created_at     DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at     DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_meetings_created FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_meetings_entity   ON meetings(entity_type, entity_id);
CREATE INDEX idx_meetings_datetime ON meetings(start_datetime);
GO

-- ============================================================
-- 19. MEETING ATTENDEES
-- ============================================================
CREATE TABLE meeting_attendees (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    meeting_id INT          NOT NULL,
    user_id    INT          NULL,
    contact_id INT          NULL,
    response   NVARCHAR(20) NOT NULL DEFAULT 'No Response'
               CHECK (response IN ('Accepted','Declined','Tentative','No Response')),
    CONSTRAINT UQ_meeting_attendee UNIQUE (meeting_id, user_id, contact_id),
    CONSTRAINT FK_ma_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id)  ON DELETE CASCADE,
    CONSTRAINT FK_ma_user    FOREIGN KEY (user_id)    REFERENCES users(id),
    CONSTRAINT FK_ma_contact FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
GO

-- ============================================================
-- 20. EMAIL LOGS
-- ============================================================
CREATE TABLE email_logs (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    entity_type NVARCHAR(20)  NOT NULL
                CHECK (entity_type IN ('Lead','Contact','Company','Opportunity')),
    entity_id   INT           NOT NULL,
    direction   NVARCHAR(10)  NOT NULL DEFAULT 'Outbound'
                CHECK (direction IN ('Inbound','Outbound')),
    from_email  NVARCHAR(150) NULL,
    to_email    NVARCHAR(150) NULL,
    cc          NVARCHAR(MAX) NULL,
    subject     NVARCHAR(500) NULL,
    body        NVARCHAR(MAX) NULL,
    status      NVARCHAR(20)  NOT NULL DEFAULT 'Draft'
                CHECK (status IN ('Draft','Sent','Delivered','Opened','Replied','Bounced','Failed')),
    opened_at   DATETIME2     NULL,
    replied_at  DATETIME2     NULL,
    sent_at     DATETIME2     NULL,
    created_by  INT           NULL,
    created_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_email_logs_created FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_email_logs_entity ON email_logs(entity_type, entity_id);
GO

-- ============================================================
-- 21. FOLLOW-UPS
-- ============================================================
CREATE TABLE followups (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    subject      NVARCHAR(255) NOT NULL,
    entity_type  NVARCHAR(20)  NOT NULL
                 CHECK (entity_type IN ('Lead','Contact','Company','Opportunity')),
    entity_id    INT           NOT NULL,
    type         NVARCHAR(20)  NOT NULL DEFAULT 'Call'
                 CHECK (type IN ('Call','Email','Meeting','WhatsApp','SMS','Other')),
    priority     NVARCHAR(10)  NOT NULL DEFAULT 'Medium'
                 CHECK (priority IN ('Low','Medium','High','Urgent')),
    status       NVARCHAR(20)  NOT NULL DEFAULT 'Pending'
                 CHECK (status IN ('Pending','Completed','Overdue','Cancelled')),
    due_date     DATETIME2     NOT NULL,
    completed_at DATETIME2     NULL,
    reminder_at  DATETIME2     NULL,
    notes        NVARCHAR(MAX) NULL,
    assigned_to  INT           NOT NULL,
    created_by   INT           NULL,
    created_at   DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at   DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_followups_assigned FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT FK_followups_created  FOREIGN KEY (created_by)  REFERENCES users(id)
);
CREATE INDEX idx_followups_entity   ON followups(entity_type, entity_id);
CREATE INDEX idx_followups_due      ON followups(due_date);
CREATE INDEX idx_followups_status   ON followups(status);
CREATE INDEX idx_followups_assigned ON followups(assigned_to);
GO

-- ============================================================
-- 22. NOTES
-- ============================================================
CREATE TABLE notes (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    entity_type NVARCHAR(20)  NOT NULL
                CHECK (entity_type IN ('Lead','Contact','Company','Opportunity','Campaign')),
    entity_id   INT           NOT NULL,
    title       NVARCHAR(255) NULL,
    content     NVARCHAR(MAX) NOT NULL,
    tags        NVARCHAR(MAX) NULL,   -- stores JSON array
    is_pinned   BIT           NOT NULL DEFAULT 0,
    created_by  INT           NULL,
    created_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_notes_created FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id);
GO

-- ============================================================
-- 23. ATTACHMENTS
-- ============================================================
CREATE TABLE attachments (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    entity_type NVARCHAR(20)  NOT NULL
                CHECK (entity_type IN ('Lead','Contact','Company','Opportunity',
                                       'Campaign','Document','Note')),
    entity_id   INT           NOT NULL,
    file_name   NVARCHAR(300) NOT NULL,
    file_path   NVARCHAR(800) NOT NULL,
    file_size   BIGINT        NULL,
    mime_type   NVARCHAR(100) NULL,
    category    NVARCHAR(100) NULL,
    uploaded_by INT           NULL,
    created_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_attachments_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
GO

-- ============================================================
-- 24. COMMUNICATION HISTORY
-- ============================================================
CREATE TABLE communication_history (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    entity_type  NVARCHAR(20)  NOT NULL
                 CHECK (entity_type IN ('Lead','Contact','Company','Opportunity')),
    entity_id    INT           NOT NULL,
    channel      NVARCHAR(20)  NOT NULL
                 CHECK (channel IN ('Call','Email','WhatsApp','SMS','Meeting',
                                    'Facebook','Instagram','Chat','LinkedIn')),
    direction    NVARCHAR(10)  NOT NULL DEFAULT 'Outbound'
                 CHECK (direction IN ('Inbound','Outbound')),
    subject      NVARCHAR(500) NULL,
    content      NVARCHAR(MAX) NULL,
    status       NVARCHAR(50)  NULL,
    duration_sec INT           NULL,
    ref_id       INT           NULL,
    ref_type     NVARCHAR(50)  NULL,
    handled_by   INT           NULL,
    occurred_at  DATETIME2     NOT NULL,
    created_at   DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_comms_handled FOREIGN KEY (handled_by) REFERENCES users(id)
);
CREATE INDEX idx_comms_entity  ON communication_history(entity_type, entity_id);
CREATE INDEX idx_comms_channel ON communication_history(channel);
CREATE INDEX idx_comms_date    ON communication_history(occurred_at);
GO

-- ============================================================
-- 25. RELATIONSHIPS
-- ============================================================
CREATE TABLE relationships (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    source_type   NVARCHAR(20)  NOT NULL
                  CHECK (source_type IN ('Lead','Contact','Company','User','Opportunity')),
    source_id     INT           NOT NULL,
    relation_type NVARCHAR(100) NOT NULL,
    target_type   NVARCHAR(20)  NOT NULL
                  CHECK (target_type IN ('Lead','Contact','Company','User','Opportunity')),
    target_id     INT           NOT NULL,
    is_active     BIT           NOT NULL DEFAULT 1,
    created_by    INT           NULL,
    created_at    DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_relationships_created FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_relationships_source ON relationships(source_type, source_id);
CREATE INDEX idx_relationships_target ON relationships(target_type, target_id);
GO

-- ============================================================
-- 26. CAMPAIGNS
-- ============================================================
CREATE TABLE campaigns (
    id               INT IDENTITY(1,1) PRIMARY KEY,
    name             NVARCHAR(255)  NOT NULL,
    type             NVARCHAR(20)   NOT NULL
                     CHECK (type IN ('Email','SMS','WhatsApp','Facebook','Google','Push')),
    status           NVARCHAR(20)   NOT NULL DEFAULT 'Draft'
                     CHECK (status IN ('Draft','Active','Paused','Completed','Cancelled')),
    objective        NVARCHAR(100)  NULL,
    audience_type    NVARCHAR(100)  NULL,
    total_recipients INT            NOT NULL DEFAULT 0,
    budget           DECIMAL(18,2)  NOT NULL DEFAULT 0,
    spent            DECIMAL(18,2)  NOT NULL DEFAULT 0,
    revenue          DECIMAL(18,2)  NOT NULL DEFAULT 0,
    start_date       DATE           NULL,
    end_date         DATE           NULL,
    scheduled_at     DATETIME2      NULL,
    created_by       INT            NULL,
    created_at       DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    updated_at       DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_campaigns_created FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_campaigns_type   ON campaigns(type);
CREATE INDEX idx_campaigns_status ON campaigns(status);
GO

-- ============================================================
-- 27. CAMPAIGN STATS
-- ============================================================
CREATE TABLE campaign_stats (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    campaign_id  INT       NOT NULL,
    sent         INT       NOT NULL DEFAULT 0,
    delivered    INT       NOT NULL DEFAULT 0,
    opened       INT       NOT NULL DEFAULT 0,
    clicked      INT       NOT NULL DEFAULT 0,
    converted    INT       NOT NULL DEFAULT 0,
    bounced      INT       NOT NULL DEFAULT 0,
    unsubscribed INT       NOT NULL DEFAULT 0,
    failed       INT       NOT NULL DEFAULT 0,
    updated_at   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_campaign_stats_campaign UNIQUE (campaign_id),
    CONSTRAINT FK_campaign_stats_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- 28. CAMPAIGN RECIPIENTS
-- ============================================================
CREATE TABLE campaign_recipients (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    campaign_id INT           NOT NULL,
    entity_type NVARCHAR(20)  NOT NULL
                CHECK (entity_type IN ('Lead','Contact')),
    entity_id   INT           NOT NULL,
    email       NVARCHAR(150) NULL,
    phone       NVARCHAR(20)  NULL,
    status      NVARCHAR(20)  NOT NULL DEFAULT 'Queued'
                CHECK (status IN ('Queued','Sent','Delivered','Opened','Clicked',
                                  'Converted','Bounced','Unsubscribed','Failed')),
    sent_at     DATETIME2     NULL,
    opened_at   DATETIME2     NULL,
    clicked_at  DATETIME2     NULL,
    CONSTRAINT FK_cr_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);
CREATE INDEX idx_campaign_recipients        ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_entity ON campaign_recipients(entity_type, entity_id);
GO

-- ============================================================
-- 29. DOCUMENTS
-- ============================================================
CREATE TABLE documents (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    doc_no         NVARCHAR(50)   NOT NULL,
    doc_type       NVARCHAR(20)   NOT NULL
                   CHECK (doc_type IN ('Proposal','Agreement','Quotation','OCR','Other')),
    title          NVARCHAR(300)  NOT NULL,
    status         NVARCHAR(20)   NOT NULL DEFAULT 'Draft'
                   CHECK (status IN ('Draft','Sent','Viewed','Opened','Accepted',
                                     'Rejected','Signed','Expired','Cancelled')),
    entity_type    NVARCHAR(20)   NULL
                   CHECK (entity_type IS NULL OR
                          entity_type IN ('Lead','Contact','Company','Opportunity')),
    entity_id      INT            NULL,
    opportunity_id INT            NULL,
    value          DECIMAL(18,2)  NULL,
    currency       NVARCHAR(10)   NOT NULL DEFAULT 'INR',
    valid_until    DATE           NULL,
    file_path      NVARCHAR(800)  NULL,
    file_size      BIGINT         NULL,
    template_id    INT            NULL,
    sent_at        DATETIME2      NULL,
    signed_at      DATETIME2      NULL,
    expires_at     DATETIME2      NULL,
    notes          NVARCHAR(MAX)  NULL,
    terms          NVARCHAR(MAX)  NULL,
    created_by     INT            NULL,
    created_at     DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    updated_at     DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_documents_doc_no  UNIQUE (doc_no),
    CONSTRAINT FK_documents_opp     FOREIGN KEY (opportunity_id) REFERENCES opportunities(id),
    CONSTRAINT FK_documents_created FOREIGN KEY (created_by)     REFERENCES users(id)
);
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_type   ON documents(doc_type);
CREATE INDEX idx_documents_status ON documents(status);
GO

-- ============================================================
-- 30. DOCUMENT LINE ITEMS
-- ============================================================
CREATE TABLE document_line_items (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    document_id  INT            NOT NULL,
    sort_order   SMALLINT       NOT NULL DEFAULT 0,
    item_code    NVARCHAR(50)   NULL,
    description  NVARCHAR(500)  NOT NULL,
    quantity     DECIMAL(10,3)  NOT NULL DEFAULT 1,
    unit         NVARCHAR(50)   NOT NULL DEFAULT 'Unit',
    unit_price   DECIMAL(18,2)  NOT NULL DEFAULT 0,
    discount_pct DECIMAL(5,2)   NOT NULL DEFAULT 0,
    tax_rate     DECIMAL(5,2)   NOT NULL DEFAULT 18,
    -- Computed: quantity * unit_price * (1 - discount_pct/100)
    amount AS (CAST(quantity * unit_price * (1 - discount_pct / 100.0) AS DECIMAL(18,2))) PERSISTED,
    CONSTRAINT FK_dli_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- 31. DOCUMENT SIGNATURES
-- ============================================================
CREATE TABLE document_signatures (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    document_id  INT           NOT NULL,
    signer_name  NVARCHAR(200) NOT NULL,
    signer_email NVARCHAR(150) NOT NULL,
    signer_role  NVARCHAR(100) NULL,
    sign_order   TINYINT       NOT NULL DEFAULT 1,
    status       NVARCHAR(20)  NOT NULL DEFAULT 'Pending'
                 CHECK (status IN ('Pending','Viewed','Signed','Declined')),
    token        NVARCHAR(255) NULL,
    viewed_at    DATETIME2     NULL,
    signed_at    DATETIME2     NULL,
    ip_address   NVARCHAR(45)  NULL,
    created_at   DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_doc_sig_token    UNIQUE (token),
    CONSTRAINT FK_doc_sig_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
CREATE INDEX idx_doc_signatures ON document_signatures(document_id);
GO

-- ============================================================
-- 32. OCR DOCUMENTS
-- ============================================================
CREATE TABLE ocr_documents (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    original_file  NVARCHAR(800) NOT NULL,
    file_name      NVARCHAR(300) NULL,
    doc_type       NVARCHAR(100) NULL,
    status         NVARCHAR(20)  NOT NULL DEFAULT 'Queued'
                   CHECK (status IN ('Queued','Processing','Processed','Failed')),
    confidence     DECIMAL(5,2)  NOT NULL DEFAULT 0,
    extracted_data NVARCHAR(MAX) NULL,   -- stores JSON
    raw_text       NVARCHAR(MAX) NULL,
    uploaded_by    INT           NULL,
    processed_at   DATETIME2     NULL,
    created_at     DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_ocr_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
GO

-- ============================================================
-- 33. BULK IMPORTS
-- ============================================================
CREATE TABLE bulk_imports (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    import_type  NVARCHAR(20)  NOT NULL
                 CHECK (import_type IN ('Lead','Contact','Company')),
    file_name    NVARCHAR(300) NULL,
    file_path    NVARCHAR(800) NULL,
    total_rows   INT           NOT NULL DEFAULT 0,
    imported     INT           NOT NULL DEFAULT 0,
    skipped      INT           NOT NULL DEFAULT 0,
    failed       INT           NOT NULL DEFAULT 0,
    duplicates   INT           NOT NULL DEFAULT 0,
    status       NVARCHAR(20)  NOT NULL DEFAULT 'Pending'
                 CHECK (status IN ('Pending','Processing','Completed','Failed')),
    error_log    NVARCHAR(MAX) NULL,   -- stores JSON
    imported_by  INT           NULL,
    started_at   DATETIME2     NULL,
    completed_at DATETIME2     NULL,
    created_at   DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_bulk_imports_user FOREIGN KEY (imported_by) REFERENCES users(id)
);
GO

-- ============================================================
-- 34. DUPLICATE RECORDS
-- ============================================================
CREATE TABLE duplicate_records (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    entity_type     NVARCHAR(20)  NOT NULL
                    CHECK (entity_type IN ('Lead','Contact','Company')),
    record_id       INT           NOT NULL,
    duplicate_of_id INT           NOT NULL,
    match_score     DECIMAL(5,2)  NULL,
    match_fields    NVARCHAR(MAX) NULL,   -- stores JSON
    status          NVARCHAR(20)  NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','Merged','Ignored')),
    resolved_by     INT           NULL,
    resolved_at     DATETIME2     NULL,
    created_at      DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_dup_resolved FOREIGN KEY (resolved_by) REFERENCES users(id)
);
CREATE INDEX idx_duplicates_entity ON duplicate_records(entity_type, record_id);
GO

-- ============================================================
-- 35. AI LEAD SCORES
-- ============================================================
CREATE TABLE ai_lead_scores (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    lead_id       INT           NOT NULL,
    score         TINYINT       NOT NULL,
    grade         NVARCHAR(2)   NOT NULL CHECK (grade IN ('A','B','C','D')),
    factors       NVARCHAR(MAX) NULL,   -- stores JSON
    model_version NVARCHAR(20)  NULL,
    predicted_at  DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_ai_lead_scores_lead UNIQUE (lead_id),
    CONSTRAINT FK_ai_lead_scores_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- 36. AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT           NULL,
    action      NVARCHAR(20)  NOT NULL
                CHECK (action IN ('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT','IMPORT')),
    entity_type NVARCHAR(50)  NULL,
    entity_id   INT           NULL,
    old_values  NVARCHAR(MAX) NULL,   -- stores JSON
    new_values  NVARCHAR(MAX) NULL,   -- stores JSON
    ip_address  NVARCHAR(45)  NULL,
    user_agent  NVARCHAR(500) NULL,
    occurred_at DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_date   ON audit_logs(occurred_at);
GO

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO roles (name, created_at) VALUES ('Admin',     GETUTCDATE());
INSERT INTO roles (name, created_at) VALUES ('Manager',   GETUTCDATE());
INSERT INTO roles (name, created_at) VALUES ('Sales Rep', GETUTCDATE());
GO

-- Default admin user  (password: Admin@123 — change on first login)
INSERT INTO users (role_id, first_name, last_name, email, password_hash,
                   is_active, created_at, updated_at)
VALUES (1, 'Admin', 'User', 'admin@sancrm.com',
        '$2a$11$rJ8WtfZ2nKp4mQvX3Lh1/.eJ9YJFQ6FQQ7gN2rH8KzC5vD3uS4Km2',
        1, GETUTCDATE(), GETUTCDATE());
GO

-- ============================================================
-- TRIGGERS — maintain updated_at on key tables
-- Note: CREATE OR ALTER requires SQL 2016+.
--       Using DROP + CREATE for broader compatibility.
-- ============================================================

-- users
CREATE TRIGGER trg_users_updated
ON users AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE users SET updated_at = GETUTCDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- companies
CREATE TRIGGER trg_companies_updated
ON companies AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE companies SET updated_at = GETUTCDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- contacts
CREATE TRIGGER trg_contacts_updated
ON contacts AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE contacts SET updated_at = GETUTCDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- leads
CREATE TRIGGER trg_leads_updated
ON leads AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE leads SET updated_at = GETUTCDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- opportunities
CREATE TRIGGER trg_opportunities_updated
ON opportunities AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE opportunities SET updated_at = GETUTCDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- calls
CREATE TRIGGER trg_calls_updated
ON calls AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE calls SET updated_at = GETUTCDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- followups
CREATE TRIGGER trg_followups_updated
ON followups AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE followups SET updated_at = GETUTCDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- campaigns
CREATE TRIGGER trg_campaigns_updated
ON campaigns AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE campaigns SET updated_at = GETUTCDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- documents
CREATE TRIGGER trg_documents_updated
ON documents AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE documents SET updated_at = GETUTCDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- credit_limits
CREATE TRIGGER trg_credit_limits_updated
ON credit_limits AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE credit_limits SET updated_at = GETUTCDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

PRINT 'SanCRM SQL Server schema created successfully.';
GO
