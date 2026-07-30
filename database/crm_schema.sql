-- ============================================================
--  SanCRM – Complete Database Schema
--  Database: MySQL 8.0+ / MariaDB 10.6+
--  Created : 2024-11-15
-- ============================================================

CREATE DATABASE IF NOT EXISTS sancrm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sancrm;

-- ============================================================
-- 1. USERS & ROLES
-- ============================================================

CREATE TABLE roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,          -- Admin, Manager, Sales Rep, etc.
  permissions JSON,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id       INT UNSIGNED NOT NULL,
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    VARCHAR(500),
  designation   VARCHAR(100),
  department    VARCHAR(100),
  is_active     TINYINT(1)   DEFAULT 1,
  last_login    TIMESTAMP    NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role_id);

-- ============================================================
-- 2. PARENT COMPANIES
-- ============================================================

CREATE TABLE parent_companies (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  industry    VARCHAR(100),
  country     VARCHAR(100) DEFAULT 'India',
  website     VARCHAR(300),
  revenue     DECIMAL(18,2),
  currency    VARCHAR(10)  DEFAULT 'INR',
  status      ENUM('Active','Inactive') DEFAULT 'Active',
  created_by  INT UNSIGNED,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================
-- 3. COMPANIES (Accounts)
-- ============================================================

CREATE TABLE companies (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_company_id  INT UNSIGNED NULL,
  name               VARCHAR(200) NOT NULL,
  type               ENUM('Customer','Prospect','Lead','Partner','Vendor') DEFAULT 'Prospect',
  industry           VARCHAR(100),
  website            VARCHAR(300),
  email              VARCHAR(150),
  phone              VARCHAR(20),
  employee_count     INT UNSIGNED,
  annual_revenue     DECIMAL(18,2),
  currency           VARCHAR(10) DEFAULT 'INR',
  gstin              VARCHAR(20),
  pan                VARCHAR(15),
  category_id        INT UNSIGNED NULL,
  assigned_to        INT UNSIGNED NULL,
  status             ENUM('Active','Inactive','Blocked') DEFAULT 'Active',
  description        TEXT,
  created_by         INT UNSIGNED,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_company_id) REFERENCES parent_companies(id),
  FOREIGN KEY (assigned_to)       REFERENCES users(id),
  FOREIGN KEY (created_by)        REFERENCES users(id)
);

CREATE INDEX idx_companies_parent   ON companies(parent_company_id);
CREATE INDEX idx_companies_assigned ON companies(assigned_to);
CREATE INDEX idx_companies_status   ON companies(status);

-- ============================================================
-- 4. BRANCHES
-- ============================================================

CREATE TABLE branches (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id   INT UNSIGNED NOT NULL,
  name         VARCHAR(200) NOT NULL,
  branch_type  ENUM('Headquarters','Regional Office','Branch','Warehouse') DEFAULT 'Branch',
  email        VARCHAR(150),
  phone        VARCHAR(20),
  gstin        VARCHAR(20),
  is_primary   TINYINT(1) DEFAULT 0,
  status       ENUM('Active','Inactive') DEFAULT 'Active',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_branches_company ON branches(company_id);

-- ============================================================
-- 5. CUSTOMER CATEGORIES
-- ============================================================

CREATE TABLE customer_categories (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100) NOT NULL UNIQUE,
  description     TEXT,
  color           VARCHAR(10)  DEFAULT '#1976d2',
  priority        ENUM('Platinum','Gold','Silver','Bronze') DEFAULT 'Silver',
  discount_pct    DECIMAL(5,2) DEFAULT 0,
  credit_limit    DECIMAL(18,2) DEFAULT 0,
  sla_hours       INT UNSIGNED DEFAULT 24,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. CREDIT LIMITS
-- ============================================================

CREATE TABLE credit_limits (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      INT UNSIGNED NOT NULL UNIQUE,
  credit_limit    DECIMAL(18,2) NOT NULL DEFAULT 0,
  used_amount     DECIMAL(18,2) NOT NULL DEFAULT 0,
  overdue_amount  DECIMAL(18,2) NOT NULL DEFAULT 0,
  status          ENUM('Good','Warning','Exceeded','Blocked') DEFAULT 'Good',
  last_review     DATE,
  next_review     DATE,
  reviewed_by     INT UNSIGNED,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id)  REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- ============================================================
-- 7. GST DETAILS
-- ============================================================

CREATE TABLE gst_details (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      INT UNSIGNED NOT NULL,
  branch_id       INT UNSIGNED NULL,
  gstin           VARCHAR(20) NOT NULL,
  legal_name      VARCHAR(200),
  trade_name      VARCHAR(200),
  gst_state_code  VARCHAR(5),
  state           VARCHAR(100),
  registration_type ENUM('Regular','Composition','Unregistered') DEFAULT 'Regular',
  is_verified     TINYINT(1) DEFAULT 0,
  verified_at     TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id)  REFERENCES branches(id)  ON DELETE SET NULL
);

CREATE INDEX idx_gst_company ON gst_details(company_id);
CREATE INDEX idx_gst_gstin   ON gst_details(gstin);

-- ============================================================
-- 8. ADDRESSES
-- ============================================================

CREATE TABLE addresses (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type   ENUM('Company','Branch','Contact','Lead') NOT NULL,
  entity_id     INT UNSIGNED NOT NULL,
  address_type  ENUM('Billing','Shipping','Both') DEFAULT 'Billing',
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(15),
  country       VARCHAR(100) DEFAULT 'India',
  gstin         VARCHAR(20),
  is_default    TINYINT(1) DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_entity ON addresses(entity_type, entity_id);

-- ============================================================
-- 9. CONTACTS
-- ============================================================

CREATE TABLE contacts (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      INT UNSIGNED NULL,
  branch_id       INT UNSIGNED NULL,
  contact_type    ENUM('Individual','Business') DEFAULT 'Individual',
  salutation      ENUM('Mr.','Mrs.','Ms.','Dr.','Prof.') NULL,
  first_name      VARCHAR(80) NOT NULL,
  last_name       VARCHAR(80),
  email           VARCHAR(150),
  email_alt       VARCHAR(150),
  phone           VARCHAR(20),
  phone_alt       VARCHAR(20),
  mobile          VARCHAR(20),
  whatsapp        VARCHAR(20),
  designation     VARCHAR(100),
  department      VARCHAR(100),
  decision_maker  TINYINT(1) DEFAULT 0,
  linkedin        VARCHAR(300),
  facebook        VARCHAR(300),
  instagram       VARCHAR(300),
  twitter         VARCHAR(300),
  date_of_birth   DATE NULL,
  anniversary     DATE NULL,
  avatar_url      VARCHAR(500),
  group_id        INT UNSIGNED NULL,
  assigned_to     INT UNSIGNED NULL,
  source          VARCHAR(100),
  status          ENUM('Active','Inactive','Blocked') DEFAULT 'Active',
  do_not_contact  TINYINT(1) DEFAULT 0,
  notes           TEXT,
  created_by      INT UNSIGNED,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id)  REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (branch_id)   REFERENCES branches(id)  ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by)  REFERENCES users(id)
);

CREATE INDEX idx_contacts_company    ON contacts(company_id);
CREATE INDEX idx_contacts_email      ON contacts(email);
CREATE INDEX idx_contacts_phone      ON contacts(phone);
CREATE INDEX idx_contacts_assigned   ON contacts(assigned_to);

-- ============================================================
-- 10. CUSTOMER GROUPS
-- ============================================================

CREATE TABLE customer_groups (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  color       VARCHAR(10) DEFAULT '#1976d2',
  created_by  INT UNSIGNED,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE contact_group_members (
  contact_id INT UNSIGNED NOT NULL,
  group_id   INT UNSIGNED NOT NULL,
  added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (contact_id, group_id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id)   REFERENCES customer_groups(id) ON DELETE CASCADE
);

-- ============================================================
-- 11. LEADS
-- ============================================================

CREATE TABLE leads (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_no          VARCHAR(30) NOT NULL UNIQUE,           -- e.g. LEAD-2024-001
  salutation       ENUM('Mr.','Mrs.','Ms.','Dr.') NULL,
  first_name       VARCHAR(80) NOT NULL,
  last_name        VARCHAR(80),
  company_name     VARCHAR(200),
  email            VARCHAR(150),
  phone            VARCHAR(20),
  mobile           VARCHAR(20),
  whatsapp         VARCHAR(20),
  designation      VARCHAR(100),
  source           ENUM('Website','Facebook','Instagram','Google Ads','WhatsApp',
                        'Email','LinkedIn','Referral','Cold Call','Trade Show',
                        'Walk-in','Other') DEFAULT 'Website',
  source_campaign  INT UNSIGNED NULL,
  status           ENUM('New','Contacted','Qualified','Unqualified',
                        'Converted','Lost') DEFAULT 'New',
  rating           ENUM('Hot','Warm','Cold') DEFAULT 'Warm',
  ai_score         TINYINT UNSIGNED DEFAULT 0,            -- 0–100
  assigned_to      INT UNSIGNED NULL,
  industry         VARCHAR(100),
  annual_revenue   DECIMAL(18,2) NULL,
  employee_count   INT UNSIGNED NULL,
  website          VARCHAR(300),
  description      TEXT,
  lost_reason      VARCHAR(255) NULL,
  is_duplicate     TINYINT(1) DEFAULT 0,
  duplicate_of     INT UNSIGNED NULL,
  converted_at     TIMESTAMP NULL,
  converted_to_contact    INT UNSIGNED NULL,
  converted_to_company    INT UNSIGNED NULL,
  converted_to_opportunity INT UNSIGNED NULL,
  created_by       INT UNSIGNED,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to)  REFERENCES users(id),
  FOREIGN KEY (created_by)   REFERENCES users(id)
);

CREATE INDEX idx_leads_status      ON leads(status);
CREATE INDEX idx_leads_source      ON leads(source);
CREATE INDEX idx_leads_assigned    ON leads(assigned_to);
CREATE INDEX idx_leads_email       ON leads(email);
CREATE INDEX idx_leads_ai_score    ON leads(ai_score);
CREATE INDEX idx_leads_created_at  ON leads(created_at);

-- ============================================================
-- 12. LEAD ASSIGNMENT RULES
-- ============================================================

CREATE TABLE lead_assignment_rules (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rule_name     VARCHAR(150) NOT NULL,
  priority      INT UNSIGNED DEFAULT 1,
  conditions    JSON NOT NULL,             -- e.g. [{"field":"source","op":"=","value":"Website"}]
  assign_to     INT UNSIGNED NOT NULL,     -- user_id
  round_robin   TINYINT(1) DEFAULT 0,
  is_active     TINYINT(1) DEFAULT 1,
  created_by    INT UNSIGNED,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assign_to)  REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================
-- 13. OPPORTUNITIES
-- ============================================================

CREATE TABLE opportunities (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  opp_no           VARCHAR(30) NOT NULL UNIQUE,
  title            VARCHAR(255) NOT NULL,
  company_id       INT UNSIGNED NOT NULL,
  contact_id       INT UNSIGNED NULL,
  lead_id          INT UNSIGNED NULL,
  assigned_to      INT UNSIGNED NULL,
  stage            ENUM('Prospecting','Qualification','Needs Analysis',
                        'Proposal','Negotiation','Closed Won','Closed Lost') DEFAULT 'Prospecting',
  amount           DECIMAL(18,2) DEFAULT 0,
  currency         VARCHAR(10) DEFAULT 'INR',
  probability      TINYINT UNSIGNED DEFAULT 0,   -- 0–100 %
  expected_close   DATE,
  actual_close     DATE NULL,
  lost_reason      VARCHAR(255) NULL,
  lost_to          VARCHAR(200) NULL,             -- competitor
  source           VARCHAR(100),
  type             VARCHAR(100),
  description      TEXT,
  next_step        VARCHAR(500),
  ai_prediction    DECIMAL(5,2) NULL,
  created_by       INT UNSIGNED,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id)  REFERENCES companies(id),
  FOREIGN KEY (contact_id)  REFERENCES contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (lead_id)     REFERENCES leads(id)    ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by)  REFERENCES users(id)
);

CREATE INDEX idx_opp_company    ON opportunities(company_id);
CREATE INDEX idx_opp_stage      ON opportunities(stage);
CREATE INDEX idx_opp_assigned   ON opportunities(assigned_to);
CREATE INDEX idx_opp_close_date ON opportunities(expected_close);

-- ============================================================
-- 14. OPPORTUNITY STAGE HISTORY (Tracking)
-- ============================================================

CREATE TABLE opportunity_stage_history (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  opportunity_id  INT UNSIGNED NOT NULL,
  from_stage      VARCHAR(50),
  to_stage        VARCHAR(50) NOT NULL,
  changed_by      INT UNSIGNED,
  notes           TEXT,
  changed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by)     REFERENCES users(id)
);

CREATE INDEX idx_opp_stage_history ON opportunity_stage_history(opportunity_id);

-- ============================================================
-- 15. ACTIVITIES – CALLS
-- ============================================================

CREATE TABLE calls (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject         VARCHAR(255) NOT NULL,
  direction       ENUM('Inbound','Outbound') DEFAULT 'Outbound',
  status          ENUM('Scheduled','Completed','No Answer','Voicemail','Cancelled') DEFAULT 'Scheduled',
  entity_type     ENUM('Lead','Contact','Company','Opportunity') NOT NULL,
  entity_id       INT UNSIGNED NOT NULL,
  assigned_to     INT UNSIGNED NOT NULL,
  call_datetime   DATETIME NOT NULL,
  duration_sec    INT UNSIGNED DEFAULT 0,
  recording_url   VARCHAR(500) NULL,
  description     TEXT,
  outcome         VARCHAR(255),
  created_by      INT UNSIGNED,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by)  REFERENCES users(id)
);

CREATE INDEX idx_calls_entity   ON calls(entity_type, entity_id);
CREATE INDEX idx_calls_datetime ON calls(call_datetime);
CREATE INDEX idx_calls_assigned ON calls(assigned_to);

-- ============================================================
-- 16. ACTIVITIES – MEETINGS
-- ============================================================

CREATE TABLE meetings (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  status           ENUM('Scheduled','Completed','Cancelled','Rescheduled') DEFAULT 'Scheduled',
  entity_type      ENUM('Lead','Contact','Company','Opportunity') NOT NULL,
  entity_id        INT UNSIGNED NOT NULL,
  location         VARCHAR(300),
  meeting_url      VARCHAR(500),
  start_datetime   DATETIME NOT NULL,
  end_datetime     DATETIME NOT NULL,
  agenda           TEXT,
  minutes          TEXT NULL,
  outcome          VARCHAR(500) NULL,
  created_by       INT UNSIGNED,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE meeting_attendees (
  meeting_id INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NULL,
  contact_id INT UNSIGNED NULL,
  response   ENUM('Accepted','Declined','Tentative','No Response') DEFAULT 'No Response',
  PRIMARY KEY (meeting_id, COALESCE(user_id, 0), COALESCE(contact_id, 0)),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE INDEX idx_meetings_entity   ON meetings(entity_type, entity_id);
CREATE INDEX idx_meetings_datetime ON meetings(start_datetime);

-- ============================================================
-- 17. ACTIVITIES – EMAILS (logged)
-- ============================================================

CREATE TABLE email_logs (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type  ENUM('Lead','Contact','Company','Opportunity') NOT NULL,
  entity_id    INT UNSIGNED NOT NULL,
  direction    ENUM('Inbound','Outbound') DEFAULT 'Outbound',
  from_email   VARCHAR(150),
  to_email     VARCHAR(150),
  cc           TEXT,
  subject      VARCHAR(500),
  body         LONGTEXT,
  status       ENUM('Draft','Sent','Delivered','Opened','Replied','Bounced','Failed') DEFAULT 'Draft',
  opened_at    TIMESTAMP NULL,
  replied_at   TIMESTAMP NULL,
  sent_at      TIMESTAMP NULL,
  created_by   INT UNSIGNED,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_email_logs_entity ON email_logs(entity_type, entity_id);

-- ============================================================
-- 18. ACTIVITIES – FOLLOW-UPS
-- ============================================================

CREATE TABLE followups (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject         VARCHAR(255) NOT NULL,
  entity_type     ENUM('Lead','Contact','Company','Opportunity') NOT NULL,
  entity_id       INT UNSIGNED NOT NULL,
  type            ENUM('Call','Email','Meeting','WhatsApp','SMS','Other') DEFAULT 'Call',
  priority        ENUM('Low','Medium','High','Urgent') DEFAULT 'Medium',
  status          ENUM('Pending','Completed','Overdue','Cancelled') DEFAULT 'Pending',
  due_date        DATETIME NOT NULL,
  completed_at    TIMESTAMP NULL,
  reminder_at     DATETIME NULL,
  notes           TEXT,
  assigned_to     INT UNSIGNED NOT NULL,
  created_by      INT UNSIGNED,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by)  REFERENCES users(id)
);

CREATE INDEX idx_followups_entity   ON followups(entity_type, entity_id);
CREATE INDEX idx_followups_due      ON followups(due_date);
CREATE INDEX idx_followups_status   ON followups(status);
CREATE INDEX idx_followups_assigned ON followups(assigned_to);

-- ============================================================
-- 19. NOTES
-- ============================================================

CREATE TABLE notes (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type  ENUM('Lead','Contact','Company','Opportunity','Campaign') NOT NULL,
  entity_id    INT UNSIGNED NOT NULL,
  title        VARCHAR(255),
  content      LONGTEXT NOT NULL,
  tags         JSON,
  is_pinned    TINYINT(1) DEFAULT 0,
  created_by   INT UNSIGNED,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id);

-- ============================================================
-- 20. ATTACHMENTS
-- ============================================================

CREATE TABLE attachments (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type  ENUM('Lead','Contact','Company','Opportunity','Campaign',
                    'Document','Note') NOT NULL,
  entity_id    INT UNSIGNED NOT NULL,
  file_name    VARCHAR(300) NOT NULL,
  file_path    VARCHAR(800) NOT NULL,
  file_size    INT UNSIGNED,           -- bytes
  mime_type    VARCHAR(100),
  category     VARCHAR(100),
  uploaded_by  INT UNSIGNED,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);

-- ============================================================
-- 21. COMMUNICATION HISTORY
-- ============================================================

CREATE TABLE communication_history (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type  ENUM('Lead','Contact','Company','Opportunity') NOT NULL,
  entity_id    INT UNSIGNED NOT NULL,
  channel      ENUM('Call','Email','WhatsApp','SMS','Meeting',
                    'Facebook','Instagram','Chat','LinkedIn') NOT NULL,
  direction    ENUM('Inbound','Outbound') DEFAULT 'Outbound',
  subject      VARCHAR(500),
  content      LONGTEXT,
  status       VARCHAR(50),
  duration_sec INT UNSIGNED NULL,
  ref_id       INT UNSIGNED NULL,    -- FK to calls/email_logs/meetings etc.
  ref_type     VARCHAR(50) NULL,
  handled_by   INT UNSIGNED,
  occurred_at  DATETIME NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (handled_by) REFERENCES users(id)
);

CREATE INDEX idx_comms_entity  ON communication_history(entity_type, entity_id);
CREATE INDEX idx_comms_channel ON communication_history(channel);
CREATE INDEX idx_comms_date    ON communication_history(occurred_at);

-- ============================================================
-- 22. RELATIONSHIP MAPPING
-- ============================================================

CREATE TABLE relationships (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_type     ENUM('Lead','Contact','Company','User','Opportunity') NOT NULL,
  source_id       INT UNSIGNED NOT NULL,
  relation_type   VARCHAR(100) NOT NULL,  -- e.g. 'Parent Company of', 'Decision Maker at'
  target_type     ENUM('Lead','Contact','Company','User','Opportunity') NOT NULL,
  target_id       INT UNSIGNED NOT NULL,
  is_active       TINYINT(1) DEFAULT 1,
  created_by      INT UNSIGNED,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_relationships_source ON relationships(source_type, source_id);
CREATE INDEX idx_relationships_target ON relationships(target_type, target_id);

-- ============================================================
-- 23. CAMPAIGNS
-- ============================================================

CREATE TABLE campaigns (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  type            ENUM('Email','SMS','WhatsApp','Facebook','Google','Push') NOT NULL,
  status          ENUM('Draft','Active','Paused','Completed','Cancelled') DEFAULT 'Draft',
  objective       VARCHAR(100),
  audience_type   VARCHAR(100),
  total_recipients INT UNSIGNED DEFAULT 0,
  budget          DECIMAL(18,2) DEFAULT 0,
  spent           DECIMAL(18,2) DEFAULT 0,
  revenue         DECIMAL(18,2) DEFAULT 0,
  start_date      DATE,
  end_date        DATE,
  scheduled_at    DATETIME NULL,
  created_by      INT UNSIGNED,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_campaigns_type   ON campaigns(type);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ============================================================
-- 24. CAMPAIGN STATS
-- ============================================================

CREATE TABLE campaign_stats (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id   INT UNSIGNED NOT NULL UNIQUE,
  sent          INT UNSIGNED DEFAULT 0,
  delivered     INT UNSIGNED DEFAULT 0,
  opened        INT UNSIGNED DEFAULT 0,
  clicked       INT UNSIGNED DEFAULT 0,
  converted     INT UNSIGNED DEFAULT 0,
  bounced       INT UNSIGNED DEFAULT 0,
  unsubscribed  INT UNSIGNED DEFAULT 0,
  failed        INT UNSIGNED DEFAULT 0,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- ============================================================
-- 25. CAMPAIGN RECIPIENTS
-- ============================================================

CREATE TABLE campaign_recipients (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  campaign_id  INT UNSIGNED NOT NULL,
  entity_type  ENUM('Lead','Contact') NOT NULL,
  entity_id    INT UNSIGNED NOT NULL,
  email        VARCHAR(150),
  phone        VARCHAR(20),
  status       ENUM('Queued','Sent','Delivered','Opened','Clicked',
                    'Converted','Bounced','Unsubscribed','Failed') DEFAULT 'Queued',
  sent_at      TIMESTAMP NULL,
  opened_at    TIMESTAMP NULL,
  clicked_at   TIMESTAMP NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

CREATE INDEX idx_campaign_recipients       ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_entity ON campaign_recipients(entity_type, entity_id);

-- ============================================================
-- 26. DOCUMENTS
-- ============================================================

CREATE TABLE documents (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doc_no          VARCHAR(50) NOT NULL UNIQUE,
  doc_type        ENUM('Proposal','Agreement','Quotation','OCR','Other') NOT NULL,
  title           VARCHAR(300) NOT NULL,
  status          ENUM('Draft','Sent','Viewed','Opened','Accepted',
                       'Rejected','Signed','Expired','Cancelled') DEFAULT 'Draft',
  entity_type     ENUM('Lead','Contact','Company','Opportunity') NULL,
  entity_id       INT UNSIGNED NULL,
  opportunity_id  INT UNSIGNED NULL,
  value           DECIMAL(18,2) NULL,
  currency        VARCHAR(10) DEFAULT 'INR',
  valid_until     DATE NULL,
  file_path       VARCHAR(800),
  file_size       INT UNSIGNED,
  template_id     INT UNSIGNED NULL,
  sent_at         TIMESTAMP NULL,
  signed_at       TIMESTAMP NULL,
  expires_at      TIMESTAMP NULL,
  notes           TEXT,
  terms           TEXT,
  created_by      INT UNSIGNED,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by)     REFERENCES users(id)
);

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_type   ON documents(doc_type);
CREATE INDEX idx_documents_status ON documents(status);

-- ============================================================
-- 27. DOCUMENT LINE ITEMS (Quotation / Proposal pricing)
-- ============================================================

CREATE TABLE document_line_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  document_id   INT UNSIGNED NOT NULL,
  sort_order    SMALLINT UNSIGNED DEFAULT 0,
  item_code     VARCHAR(50),
  description   VARCHAR(500) NOT NULL,
  quantity      DECIMAL(10,3) DEFAULT 1,
  unit          VARCHAR(50)  DEFAULT 'Unit',
  unit_price    DECIMAL(18,2) DEFAULT 0,
  discount_pct  DECIMAL(5,2)  DEFAULT 0,
  tax_rate      DECIMAL(5,2)  DEFAULT 18,
  amount        DECIMAL(18,2) GENERATED ALWAYS AS
                  (quantity * unit_price * (1 - discount_pct/100)) STORED,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- ============================================================
-- 28. DOCUMENT SIGNATURES
-- ============================================================

CREATE TABLE document_signatures (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  document_id  INT UNSIGNED NOT NULL,
  signer_name  VARCHAR(200) NOT NULL,
  signer_email VARCHAR(150) NOT NULL,
  signer_role  VARCHAR(100),
  sign_order   TINYINT UNSIGNED DEFAULT 1,
  status       ENUM('Pending','Viewed','Signed','Declined') DEFAULT 'Pending',
  token        VARCHAR(255) UNIQUE,     -- secure link token
  viewed_at    TIMESTAMP NULL,
  signed_at    TIMESTAMP NULL,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_doc_signatures ON document_signatures(document_id);

-- ============================================================
-- 29. OCR DOCUMENTS
-- ============================================================

CREATE TABLE ocr_documents (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  original_file   VARCHAR(800) NOT NULL,
  file_name       VARCHAR(300),
  doc_type        VARCHAR(100),         -- Invoice, PO, Business Card, etc.
  status          ENUM('Queued','Processing','Processed','Failed') DEFAULT 'Queued',
  confidence      DECIMAL(5,2) DEFAULT 0,
  extracted_data  JSON,
  raw_text        LONGTEXT,
  uploaded_by     INT UNSIGNED,
  processed_at    TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- ============================================================
-- 30. BULK IMPORT LOGS
-- ============================================================

CREATE TABLE bulk_imports (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  import_type     ENUM('Lead','Contact','Company') NOT NULL,
  file_name       VARCHAR(300),
  file_path       VARCHAR(800),
  total_rows      INT UNSIGNED DEFAULT 0,
  imported        INT UNSIGNED DEFAULT 0,
  skipped         INT UNSIGNED DEFAULT 0,
  failed          INT UNSIGNED DEFAULT 0,
  duplicates      INT UNSIGNED DEFAULT 0,
  status          ENUM('Pending','Processing','Completed','Failed') DEFAULT 'Pending',
  error_log       JSON,
  imported_by     INT UNSIGNED,
  started_at      TIMESTAMP NULL,
  completed_at    TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imported_by) REFERENCES users(id)
);

-- ============================================================
-- 31. DUPLICATE DETECTION LOG
-- ============================================================

CREATE TABLE duplicate_records (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type      ENUM('Lead','Contact','Company') NOT NULL,
  record_id        INT UNSIGNED NOT NULL,
  duplicate_of_id  INT UNSIGNED NOT NULL,
  match_score      DECIMAL(5,2),
  match_fields     JSON,         -- which fields matched
  status           ENUM('Pending','Merged','Ignored') DEFAULT 'Pending',
  resolved_by      INT UNSIGNED NULL,
  resolved_at      TIMESTAMP NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resolved_by) REFERENCES users(id)
);

CREATE INDEX idx_duplicates_entity ON duplicate_records(entity_type, record_id);

-- ============================================================
-- 32. AI LEAD SCORES
-- ============================================================

CREATE TABLE ai_lead_scores (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id         INT UNSIGNED NOT NULL UNIQUE,
  score           TINYINT UNSIGNED NOT NULL,   -- 0–100
  grade           ENUM('A','B','C','D') NOT NULL,
  factors         JSON,         -- breakdown of scoring factors
  model_version   VARCHAR(20),
  predicted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- ============================================================
-- 33. AUDIT LOG
-- ============================================================

CREATE TABLE audit_logs (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NULL,
  action       ENUM('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT','IMPORT') NOT NULL,
  entity_type  VARCHAR(50),
  entity_id    INT UNSIGNED,
  old_values   JSON,
  new_values   JSON,
  ip_address   VARCHAR(45),
  user_agent   VARCHAR(500),
  occurred_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_date   ON audit_logs(occurred_at);
