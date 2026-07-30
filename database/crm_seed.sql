-- ============================================================
--  SanCRM – Seed / Sample Data  (SQL Server compatible)
--  Run AFTER crm_schema_sqlserver.sql
--  No explicit IDENTITY values – let SQL Server auto-assign IDs
-- ============================================================
USE sancrm;
GO

-- ============================================================
-- 0. CLEAR existing seed data (safe re-run)
-- ============================================================
DELETE FROM opportunity_stage_history;
DELETE FROM ai_lead_scores;
DELETE FROM relationships;
DELETE FROM communication_history;
DELETE FROM attachments;
DELETE FROM notes;
DELETE FROM document_signatures;
DELETE FROM document_line_items;
DELETE FROM documents;
DELETE FROM campaign_stats;
DELETE FROM campaign_recipients;
DELETE FROM campaigns;
DELETE FROM followups;
DELETE FROM meeting_attendees;
DELETE FROM meetings;
DELETE FROM calls;
DELETE FROM opportunities;
DELETE FROM leads;
DELETE FROM contact_group_members;
DELETE FROM contacts;
DELETE FROM addresses;
DELETE FROM gst_details;
DELETE FROM credit_limits;
DELETE FROM branches;
DELETE FROM companies;
DELETE FROM parent_companies;
DELETE FROM customer_categories;
DELETE FROM users WHERE email <> 'admin@sancrm.com';
DELETE FROM roles WHERE name NOT IN ('Admin','Manager','Sales Rep');
GO

-- Reset identity counters so IDs start from 1 each run
DBCC CHECKIDENT ('roles',              RESEED, 0);
DBCC CHECKIDENT ('users',              RESEED, 0);
DBCC CHECKIDENT ('customer_categories',RESEED, 0);
DBCC CHECKIDENT ('parent_companies',   RESEED, 0);
DBCC CHECKIDENT ('companies',          RESEED, 0);
DBCC CHECKIDENT ('branches',           RESEED, 0);
DBCC CHECKIDENT ('contacts',           RESEED, 0);
DBCC CHECKIDENT ('leads',              RESEED, 0);
DBCC CHECKIDENT ('opportunities',      RESEED, 0);
DBCC CHECKIDENT ('calls',              RESEED, 0);
DBCC CHECKIDENT ('meetings',           RESEED, 0);
DBCC CHECKIDENT ('followups',          RESEED, 0);
DBCC CHECKIDENT ('campaigns',          RESEED, 0);
DBCC CHECKIDENT ('campaign_stats',     RESEED, 0);
DBCC CHECKIDENT ('documents',          RESEED, 0);
DBCC CHECKIDENT ('document_line_items',RESEED, 0);
DBCC CHECKIDENT ('document_signatures',RESEED, 0);
GO

-- ============================================================
-- 1. ROLES  (id: 1=Admin, 2=Manager, 3=Sales Rep, 4=Support)
-- ============================================================
INSERT INTO roles (name, permissions) VALUES
('Admin',     '{"all":true}'),
('Manager',   '{"leads":"all","contacts":"all","accounts":"all","reports":"view"}'),
('Sales Rep', '{"leads":"own","contacts":"own","accounts":"view"}'),
('Support',   '{"contacts":"view","communication":"all"}');
GO

-- ============================================================
-- 2. USERS  (role_id refs: 1=Admin,2=Manager,3=Sales Rep,4=Support)
-- ============================================================
INSERT INTO users (role_id, first_name, last_name, email, phone, password_hash,
                   designation, department, is_active)
VALUES
(1, 'Ravi',   'Kumar',  'ravi@sancrm.com',   '+91-9876500001', '$2b$12$placeholder', 'Sales Manager',     'Sales',   1),
(2, 'Anjali', 'Sharma', 'anjali@sancrm.com', '+91-9876500002', '$2b$12$placeholder', 'Senior Sales Rep',  'Sales',   1),
(3, 'Priya',  'Mehta',  'priya@sancrm.com',  '+91-9876500003', '$2b$12$placeholder', 'Sales Executive',   'Sales',   1),
(3, 'Suresh', 'Nair',   'suresh@sancrm.com', '+91-9876500004', '$2b$12$placeholder', 'Sales Executive',   'Sales',   1),
(4, 'Kavita', 'Rao',    'kavita@sancrm.com', '+91-9876500005', '$2b$12$placeholder', 'Support Executive', 'Support', 1);
GO

-- ============================================================
-- 3. CUSTOMER CATEGORIES
-- ============================================================
INSERT INTO customer_categories (name, description, priority, discount_pct, credit_limit, sla_hours) VALUES
('Enterprise', 'Large enterprises 500+ employees', 'Platinum', 20.00,  5000000,  4),
('SMB',        'Small and medium businesses',      'Gold',     10.00,  1000000,  8),
('Startup',    'Early-stage startups',             'Silver',    5.00,   200000, 24),
('Government', 'Govt organizations and PSUs',      'Platinum',  0.00, 10000000,  4),
('Partner',    'Resellers and channel partners',   'Gold',     30.00,  2000000,  8);
GO

-- ============================================================
-- 4. PARENT COMPANIES
-- ============================================================
INSERT INTO parent_companies (name, industry, country, status) VALUES
('TechCorp Group',  'Technology', 'India', 'Active'),
('MedGroup Ltd',    'Healthcare', 'India', 'Active'),
('Global Holdings', 'Investment', 'USA',   'Active');
GO

-- ============================================================
-- 5. COMPANIES
-- parent_company_id: 1=TechCorp Group, 2=MedGroup Ltd
-- category_id: 1=Enterprise,2=SMB,3=Startup
-- assigned_to: 1=Ravi,2=Anjali,3=Priya,4=Suresh
-- ============================================================
INSERT INTO companies (parent_company_id, name, type, industry, email, phone,
                       gstin, category_id, assigned_to, status, created_by)
VALUES
(1,    'TechCorp Ltd',    'Customer', 'Technology',     'contact@techcorp.com',  '+91-22-11223344', '27AABCC1234D1Z5', 1, 2, 'Active', 2),
(NULL, 'GlobalTech Inc',  'Customer', 'IT Services',    'hello@globaltech.com',  '+91-80-55667788', '29AABCC9012F3Z7', 1, 1, 'Active', 1),
(NULL, 'ABC Industries',  'Prospect', 'Manufacturing',  'info@abcind.com',       '+91-20-22334455', '27AABCC5678E2Z6', 2, 3, 'Active', 3),
(2,    'Pharma Corp',     'Lead',     'Pharmaceuticals','contact@pharmacorp.in', '+91-33-11001100', '19AABCC3456G4Z8', 2, 4, 'Active', 4),
(NULL, 'StartupXYZ',      'Prospect', 'SaaS',           'hi@startupxyz.io',      '+91-98765-00100', NULL,              3, 2, 'Active', 2);
GO

-- ============================================================
-- 6. BRANCHES  (company_id auto-assigned above: 1-5)
-- ============================================================
INSERT INTO branches (company_id, name, branch_type, phone, email, gstin, is_primary, status) VALUES
(1, 'TechCorp – Mumbai HQ',   'Headquarters',    '+91-22-11223344', 'mumbai@techcorp.com',  '27AABCC1234D1Z5', 1, 'Active'),
(1, 'TechCorp – Pune Branch', 'Branch',          '+91-20-22334455', 'pune@techcorp.com',    '27AABCC1234D1Z6', 0, 'Active'),
(2, 'GlobalTech – Delhi NCR', 'Regional Office', '+91-124-5566778', 'delhi@globaltech.com', '06AABCC9012F3Z1', 0, 'Active'),
(3, 'ABC – Ahmedabad',        'Branch',          '+91-79-22334455', 'ahm@abcind.com',       '24AABCC5678E2Z1', 0, 'Inactive');
GO

-- ============================================================
-- 7. CREDIT LIMITS
-- ============================================================
INSERT INTO credit_limits (company_id, credit_limit, used_amount, overdue_amount, status, next_review) VALUES
(1,  5000000,  2400000,       0, 'Good',     '2025-03-01'),
(2, 10000000,  9800000,  500000, 'Warning',  '2025-02-15'),
(3,  1000000,   320000,       0, 'Good',     '2025-04-01'),
(4,   500000,   520000,  150000, 'Exceeded', '2026-10-01'),
(5,   200000,    50000,       0, 'Good',     '2025-05-01');
GO

-- ============================================================
-- 8. GST DETAILS
-- ============================================================
INSERT INTO gst_details (company_id, gstin, legal_name, state, registration_type, is_verified) VALUES
(1, '27AABCC1234D1Z5', 'TechCorp Ltd',       'Maharashtra', 'Regular', 1),
(2, '29AABCC9012F3Z7', 'GlobalTech Inc',     'Karnataka',   'Regular', 1),
(3, '27AABCC5678E2Z6', 'ABC Industries Pvt', 'Maharashtra', 'Regular', 1);
GO

-- ============================================================
-- 9. ADDRESSES
-- ============================================================
INSERT INTO addresses (entity_type, entity_id, address_type, address_line1, city, state, pincode, gstin, is_default) VALUES
('Company', 1, 'Billing',  '4th Floor TechCorp Tower, BKC', 'Mumbai',   'Maharashtra', '400051', '27AABCC1234D1Z5', 1),
('Company', 1, 'Shipping', 'Plot 5, MIDC Andheri',           'Mumbai',   'Maharashtra', '400093', NULL,              1),
('Company', 2, 'Billing',  'Cyber City, Plot 12',            'Gurugram', 'Haryana',     '122002', '06AABCC9012F3Z1', 1),
('Company', 3, 'Billing',  '23 Industrial Area Phase 2',     'Pune',     'Maharashtra', '411057', '27AABCC5678E2Z6', 1);
GO

-- ============================================================
-- 10. CONTACTS
-- company_id: 1=TechCorp,2=GlobalTech,3=ABC,4=Pharma,5=Startup
-- assigned_to / created_by: user IDs 1-5
-- ============================================================
INSERT INTO contacts (company_id, first_name, last_name, email, phone, mobile,
                      designation, decision_maker, assigned_to, status, created_by) VALUES
(1, 'Mohan',  'Patel',   'mohan@techcorp.com',   '+91-22-1234', '9876543210', 'CTO',          1, 2, 'Active', 2),
(1, 'Priya',  'Verma',   'priya@techcorp.com',   '+91-22-5678', '9876543211', 'CFO',          1, 2, 'Active', 2),
(2, 'Sarah',  'Johnson', 'sarah@globaltech.com', '+91-80-1111', '9988776655', 'VP Sales',     1, 1, 'Active', 1),
(3, 'Vijay',  'Desai',   'vijay@abc.com',        '+91-20-2222', '9876500099', 'IT Manager',   0, 3, 'Active', 3),
(4, 'Ramesh', 'Kumar',   'ramesh@pharmacorp.in', '+91-33-3333', '9012345678', 'Purchase Mgr', 1, 4, 'Active', 4);
GO

-- ============================================================
-- 11. LEADS
-- assigned_to / created_by: 1=Ravi,2=Anjali,3=Priya,4=Suresh
-- ============================================================
INSERT INTO leads (lead_no, first_name, last_name, company_name, email, phone,
                   source, status, rating, ai_score, assigned_to, created_by) VALUES
('LEAD-2024-001', 'Arjun',  'Mehta',  'InnoTech Pvt', 'arjun@innotech.com',  '9011223344', 'Website',   'New',       'Hot',  87, 2, 2),
('LEAD-2024-002', 'Sunita', 'Reddy',  'DataSoft Ltd', 'sunita@datasoft.com', '9022334455', 'Facebook',  'Contacted', 'Warm', 62, 3, 3),
('LEAD-2024-003', 'Kiran',  'Shah',   'CloudBase',    'kiran@cloudbase.io',  '9033445566', 'Google Ads','Qualified', 'Hot',  91, 2, 2),
('LEAD-2024-004', 'Deepak', 'Joshi',  'RetailCo',     'deepak@retailco.com', '9044556677', 'WhatsApp',  'New',       'Cold', 34, 4, 4),
('LEAD-2024-005', 'Meena',  'Thomas', 'EduTech',      'meena@edutech.in',    '9055667788', 'Referral',  'Qualified', 'Hot',  78, 3, 3),
('LEAD-2024-006', 'Rohit',  'Sharma', 'FinServ Ltd',  'rohit@finserv.com',   '9066778899', 'LinkedIn',  'Contacted', 'Warm', 55, 2, 2);
GO

-- ============================================================
-- 12. OPPORTUNITIES
-- company_id 1-5, contact_id 1-5, assigned_to 1-4
-- ============================================================
INSERT INTO opportunities (opp_no, title, company_id, contact_id, assigned_to,
                           stage, amount, probability, expected_close, created_by) VALUES
('OPP-2024-001', 'TechCorp – CRM Implementation',   1, 1, 2, 'Proposal',      250000, 60, '2026-12-15', 2),
('OPP-2024-002', 'GlobalTech – Enterprise License',  2, 3, 1, 'Negotiation',   800000, 80, '2026-11-30', 1),
('OPP-2024-003', 'ABC – Module Expansion',           3, 4, 3, 'Qualification', 120000, 30, '2027-01-15', 3),
('OPP-2024-004', 'Pharma – Basic Plan',              4, 5, 4, 'Prospecting',    50000, 20, '2027-02-01', 4),
('OPP-2024-005', 'StartupXYZ – Starter Pack',        5, NULL,2,'Proposal',      40000, 50, '2026-12-01', 2);
GO

-- ============================================================
-- 13. CALLS
-- entity_id refs leads(1-6) and contacts(1-5)
-- assigned_to: user IDs 1-4
-- ============================================================
INSERT INTO calls (subject, direction, status, entity_type, entity_id,
                   assigned_to, call_datetime, duration_sec, outcome, created_by) VALUES
('Enquiry about CRM pricing',  'Inbound',  'Completed', 'Lead',    1, 2, '2024-11-15 10:30:00', 512,  'Interested – follow up', 2),
('Follow-up on proposal',      'Outbound', 'Completed', 'Contact', 1, 2, '2024-11-14 15:00:00', 384,  'Decision by Nov 20',     2),
('Demo scheduling',            'Outbound', 'No Answer', 'Lead',    2, 3, '2024-11-13 11:00:00', 0,    'Left voicemail',         3),
('Contract discussion',        'Outbound', 'Completed', 'Contact', 3, 1, '2024-11-12 14:00:00', 1840, 'Counter offer received',  1);
GO

-- ============================================================
-- 14. MEETINGS
-- ============================================================
INSERT INTO meetings (title, status, entity_type, entity_id,
                      start_datetime, end_datetime, agenda, created_by) VALUES
('Product Walkthrough – TechCorp', 'Completed', 'Contact', 1,
 '2024-11-13 15:00:00', '2024-11-13 16:00:00', 'Demo of pipeline, AI score, reports', 2),
('GlobalTech – Negotiation Call',  'Scheduled', 'Contact', 3,
 '2026-11-20 11:00:00', '2026-11-20 11:30:00', 'Finalize pricing and SLA terms',      1);
GO

-- ============================================================
-- 15. FOLLOW-UPS
-- ============================================================
INSERT INTO followups (subject, entity_type, entity_id, type, priority,
                       status, due_date, assigned_to, notes, created_by) VALUES
('Follow up after proposal – TechCorp', 'Contact', 1, 'Call',  'High',   'Pending', '2026-11-20 10:00:00', 2, 'Client viewing proposal',   2),
('Check interest – Pharma Corp',        'Lead',    4, 'Email', 'Medium', 'Pending', '2026-11-22 09:00:00', 4, 'Send pricing comparison',    4),
('Close GlobalTech deal',               'Contact', 3, 'Call',  'Urgent', 'Pending', '2026-11-18 11:00:00', 1, 'Budget approved internally', 1);
GO

-- ============================================================
-- 16. CAMPAIGNS
-- created_by: 1=Ravi,2=Anjali,3=Priya
-- ============================================================
INSERT INTO campaigns (name, type, status, total_recipients, budget, spent, revenue,
                       start_date, end_date, created_by) VALUES
('Q4 Product Launch Email',      'Email',    'Active',    4500,  5000.00,  3200.00, 0, '2024-10-01', '2024-10-31', 2),
('Diwali Offers SMS Blast',      'SMS',      'Completed', 10000, 2000.00,  2000.00, 0, '2024-10-20', '2024-10-25', 3),
('WhatsApp New Year Promo',      'WhatsApp', 'Draft',     0,     3000.00,     0.00, 0, '2024-12-28', '2025-01-05', 2),
('Facebook Brand Awareness',     'Facebook', 'Active',    25000, 10000.00, 6500.00, 0, '2024-10-15', '2024-11-15', 1),
('Google Search – CRM Keywords', 'Google',   'Paused',    8000,  8000.00,  4200.00, 0, '2024-09-01', '2024-11-30', 1),
('App Re-engagement Push',       'Push',     'Active',    15000, 1000.00,   650.00, 0, '2024-10-10', '2024-11-10', 3);
GO

-- ============================================================
-- 17. CAMPAIGN STATS  (campaign_id 1-6)
-- ============================================================
INSERT INTO campaign_stats (campaign_id, sent, delivered, opened, clicked, converted, bounced, unsubscribed) VALUES
(1, 4500,  4400,  1800, 720,  144, 100, 32),
(2, 10000, 9800,  8500, 2100, 630, 200, 45),
(3, 0,     0,     0,    0,    0,   0,   0),
(4, 25000, 24500, 12000,3600, 360, 500, 80),
(5, 8000,  8000,  8000, 1200, 96,  0,   12),
(6, 15000, 14800, 6000, 1800, 270, 200, 25);
GO

-- ============================================================
-- 18. DOCUMENTS
-- opportunity_id 1-5, entity_id = company_id 1-5
-- ============================================================
INSERT INTO documents (doc_no, doc_type, title, status, entity_type, entity_id,
                       opportunity_id, value, valid_until, created_by) VALUES
('DOC-2024-001', 'Proposal',  'Q4 Sales Proposal – TechCorp',       'Sent',    'Company', 1, 1, 250000.00, '2026-12-15', 2),
('DOC-2024-002', 'Agreement', 'Annual Service Agreement – ABC Ltd',  'Signed',  'Company', 3, 3, 120000.00, '2027-10-22', 3),
('DOC-2024-003', 'Quotation', 'Quotation #QT-2024-108',             'Draft',   'Company', 5, 5,  40000.00, '2026-12-15', 2),
('DOC-2024-004', 'Agreement', 'NDA – GlobalTech',                   'Sent',    'Company', 2, 2,      0.00, '2026-11-30', 1),
('DOC-2024-005', 'Proposal',  'Product Demo Proposal – StartupXYZ', 'Viewed',  'Company', 5, 5,  40000.00, '2026-12-05', 2);
GO

-- ============================================================
-- 19. DOCUMENT LINE ITEMS  (document_id 1,3,5)
-- ============================================================
INSERT INTO document_line_items (document_id, sort_order, item_code, description,
                                  quantity, unit, unit_price, discount_pct, tax_rate) VALUES
(1, 1, 'CRM-001', 'CRM Software License (Annual)',  1, 'Year',    120000.00,  0, 18),
(1, 2, 'SVC-001', 'Implementation & Setup',         1, 'Project',  50000.00,  0, 18),
(1, 3, 'TRN-001', 'Training (2 days on-site)',      2, 'Day',       15000.00,  0, 18),
(3, 1, 'CRM-STR', 'Starter Plan – Annual',          1, 'Year',     36000.00, 10, 18),
(5, 1, 'CRM-001', 'CRM Software License',           1, 'Year',    120000.00, 20, 18),
(5, 2, 'SVC-001', 'Implementation',                 1, 'Project',  50000.00, 20, 18);
GO

-- ============================================================
-- 20. DOCUMENT SIGNATURES
-- ============================================================
INSERT INTO document_signatures (document_id, signer_name, signer_email,
                                  signer_role, sign_order, status) VALUES
(1, 'Anjali Sharma', 'anjali@sancrm.com',   'Authorized Signatory',  1, 'Signed'),
(1, 'Mohan Patel',   'mohan@techcorp.com',  'Client Representative', 2, 'Pending'),
(4, 'Ravi Kumar',    'ravi@sancrm.com',     'Authorized Signatory',  1, 'Pending'),
(4, 'Sarah Johnson', 'sarah@globaltech.com','Client Representative', 2, 'Pending');
GO

-- ============================================================
-- 21. NOTES
-- ============================================================
INSERT INTO notes (entity_type, entity_id, title, content, tags, is_pinned, created_by) VALUES
('Company', 1, 'TechCorp Budget Discussion',
 'Client budget Rs 5-8L. Decision by end of November. Key: Mohan (CTO), Priya (CFO). Need mobile + API.',
 '["Budget","Important"]', 1, 2),
('Contact', 3, 'GlobalTech Follow-up',
 'Sarah will review proposal with team by Nov 18. Follow up if no response by Nov 20. Also evaluating Salesforce.',
 '["Follow-up"]', 0, 1),
('Company', 1, 'Product Demo Feedback',
 'Vijay liked pipeline view and AI scoring. Concerned about data migration from Excel.',
 '["Demo","Feedback"]', 0, 2);
GO

-- ============================================================
-- 22. ATTACHMENTS
-- ============================================================
INSERT INTO attachments (entity_type, entity_id, file_name, file_path,
                          file_size, mime_type, category, uploaded_by) VALUES
('Company', 1, 'TechCorp_Proposal_Q4_2024.pdf', '/uploads/docs/1/proposal_q4.pdf',   2516582, 'application/pdf', 'Proposal',    2),
('Company', 2, 'NDA_GlobalTech_Signed.pdf',     '/uploads/docs/2/nda_globaltech.pdf', 524288,  'application/pdf', 'Agreement',   1),
('Contact', 1, 'Mohan_BusinessCard.jpg',        '/uploads/contacts/1/card.jpg',        102400,  'image/jpeg',      'Contact Info',2);
GO

-- ============================================================
-- 23. COMMUNICATION HISTORY
-- ============================================================
INSERT INTO communication_history (entity_type, entity_id, channel, direction,
                                    subject, status, duration_sec, handled_by, occurred_at) VALUES
('Lead',    1, 'Call',     'Inbound',  'Enquiry about CRM pricing',     'Completed', 512,  2, '2024-11-15 10:30:00'),
('Contact', 1, 'Email',    'Outbound', 'Proposal for Q4 2024',          'Opened',    0,    2, '2024-11-14 14:15:00'),
('Lead',    3, 'WhatsApp', 'Outbound', 'Demo confirmation',             'Delivered', 0,    3, '2024-11-14 11:00:00'),
('Contact', 3, 'Meeting',  'Outbound', 'Product walkthrough – 45 mins', 'Completed', 2710, 1, '2024-11-13 15:00:00'),
('Lead',    4, 'SMS',      'Outbound', 'Reminder: Free trial expires',  'Delivered', 0,    5, '2024-11-13 09:00:00');
GO

-- ============================================================
-- 24. RELATIONSHIPS
-- ============================================================
INSERT INTO relationships (source_type, source_id, relation_type, target_type, target_id, created_by) VALUES
('Company', 1, 'Parent Company of', 'Company', 5, 1),
('Contact', 1, 'Decision Maker at', 'Company', 1, 2),
('Contact', 2, 'CFO / Approver at', 'Company', 1, 2),
('Contact', 3, 'VP Sales at',       'Company', 2, 1),
('Company', 2, 'Partner of',        'Company', 1, 1);
GO

-- ============================================================
-- 25. AI LEAD SCORES  (lead_id 1-6)
-- ============================================================
INSERT INTO ai_lead_scores (lead_id, score, grade, factors, model_version) VALUES
(1, 87, 'A', '{"email_opened":true,"website_visits":5,"budget_fit":0.9,"engagement":0.85}',  'v2.1'),
(2, 62, 'B', '{"email_opened":true,"website_visits":2,"budget_fit":0.6,"engagement":0.55}',  'v2.1'),
(3, 91, 'A', '{"email_opened":true,"website_visits":8,"budget_fit":0.95,"engagement":0.92}', 'v2.1'),
(4, 34, 'D', '{"email_opened":false,"website_visits":1,"budget_fit":0.3,"engagement":0.25}', 'v2.1'),
(5, 78, 'B', '{"email_opened":true,"website_visits":4,"budget_fit":0.75,"engagement":0.72}', 'v2.1'),
(6, 55, 'C', '{"email_opened":true,"website_visits":2,"budget_fit":0.5,"engagement":0.48}',  'v2.1');
GO

-- ============================================================
-- 26. OPPORTUNITY STAGE HISTORY  (opportunity_id 1-2)
-- ============================================================
INSERT INTO opportunity_stage_history (opportunity_id, from_stage, to_stage, changed_by, notes) VALUES
(1, NULL,            'Prospecting',   2, 'Lead converted'),
(1, 'Prospecting',   'Qualification', 2, 'Discovery call done'),
(1, 'Qualification', 'Proposal',      2, 'Proposal sent Nov 10'),
(2, NULL,            'Prospecting',   1, 'Lead converted'),
(2, 'Prospecting',   'Qualification', 1, 'Budget confirmed Rs 8L'),
(2, 'Qualification', 'Negotiation',   1, 'Counter offer received');
GO

PRINT 'SanCRM seed data inserted successfully.';
GO
