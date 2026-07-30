-- ============================================================
--  SanCRM – All Module Queries
--  Database: MySQL 8.0+
-- ============================================================
USE sancrm;

-- ============================================================
-- ██  1. USERS & ROLES
-- ============================================================

-- List all active users with their role
SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
       u.designation, u.department, r.name AS role, u.is_active, u.last_login
FROM   users u
JOIN   roles r ON r.id = u.role_id
WHERE  u.is_active = 1
ORDER  BY u.first_name;

-- Get a single user with permissions
SELECT u.*, r.name AS role_name, r.permissions
FROM   users u
JOIN   roles r ON r.id = u.role_id
WHERE  u.id = :user_id;

-- ============================================================
-- ██  2. PARENT COMPANIES
-- ============================================================

-- All parent companies with subsidiary count
SELECT pc.id, pc.name, pc.industry, pc.country, pc.revenue,
       COUNT(c.id) AS total_subsidiaries,
       pc.status
FROM   parent_companies pc
LEFT   JOIN companies c ON c.parent_company_id = pc.id
GROUP  BY pc.id
ORDER  BY pc.name;

-- Parent company with full hierarchy
SELECT pc.id AS parent_id, pc.name AS parent_name,
       c.id  AS company_id, c.name AS company_name, c.type,
       b.id  AS branch_id,  b.name AS branch_name, b.branch_type
FROM   parent_companies pc
LEFT   JOIN companies c ON c.parent_company_id = pc.id
LEFT   JOIN branches  b ON b.company_id = c.id
WHERE  pc.id = :parent_id
ORDER  BY c.name, b.name;

-- ============================================================
-- ██  3. COMPANIES (Accounts)
-- ============================================================

-- Full accounts list with category, credit status, assigned user
SELECT c.id, c.name, c.type, c.industry, c.email, c.phone,
       c.gstin, c.status, c.annual_revenue,
       pc.name   AS parent_company,
       cat.name  AS category,
       cat.priority,
       cl.credit_limit, cl.used_amount, cl.status AS credit_status,
       CONCAT(u.first_name,' ',u.last_name) AS assigned_to,
       COUNT(DISTINCT br.id)  AS branch_count,
       COUNT(DISTINCT ct.id)  AS contact_count,
       COUNT(DISTINCT op.id)  AS open_opportunities,
       c.created_at
FROM   companies c
LEFT   JOIN parent_companies    pc  ON pc.id  = c.parent_company_id
LEFT   JOIN customer_categories cat ON cat.id = c.category_id
LEFT   JOIN credit_limits       cl  ON cl.company_id = c.id
LEFT   JOIN users               u   ON u.id   = c.assigned_to
LEFT   JOIN branches            br  ON br.company_id = c.id
LEFT   JOIN contacts            ct  ON ct.company_id = c.id
LEFT   JOIN opportunities       op  ON op.company_id = c.id
                                   AND op.stage NOT IN ('Closed Won','Closed Lost')
WHERE  c.status = 'Active'
GROUP  BY c.id
ORDER  BY c.name;

-- Single company full detail
SELECT c.*, pc.name AS parent_name,
       cat.name AS category_name, cat.discount_pct, cat.sla_hours,
       cl.credit_limit, cl.used_amount, cl.overdue_amount, cl.status AS credit_status,
       CONCAT(u.first_name,' ',u.last_name) AS assigned_to_name
FROM   companies c
LEFT   JOIN parent_companies    pc  ON pc.id  = c.parent_company_id
LEFT   JOIN customer_categories cat ON cat.id = c.category_id
LEFT   JOIN credit_limits       cl  ON cl.company_id = c.id
LEFT   JOIN users               u   ON u.id = c.assigned_to
WHERE  c.id = :company_id;

-- Companies by industry summary
SELECT industry,
       COUNT(*)                                    AS total,
       SUM(annual_revenue)                         AS total_revenue,
       COUNT(CASE WHEN type='Customer' THEN 1 END) AS customers,
       COUNT(CASE WHEN type='Prospect' THEN 1 END) AS prospects
FROM   companies
WHERE  status = 'Active'
GROUP  BY industry
ORDER  BY total DESC;

-- Search companies (name / email / gstin)
SELECT id, name, type, industry, email, phone, status
FROM   companies
WHERE  (name   LIKE CONCAT('%',:q,'%')
     OR email  LIKE CONCAT('%',:q,'%')
     OR gstin  LIKE CONCAT('%',:q,'%'))
ORDER  BY name
LIMIT  20;

-- ============================================================
-- ██  4. BRANCHES
-- ============================================================

-- All branches with company info
SELECT b.id, b.name, b.branch_type, b.phone, b.email,
       b.gstin, b.is_primary, b.status,
       c.name  AS company_name,
       a.city, a.state, a.pincode
FROM   branches b
JOIN   companies c  ON c.id = b.company_id
LEFT   JOIN addresses a ON a.entity_type='Company'
                        AND a.entity_id = b.company_id
                        AND a.is_default = 1
ORDER  BY c.name, b.is_primary DESC, b.name;

-- Branches of a specific company
SELECT b.*, a.address_line1, a.city, a.state, a.pincode
FROM   branches b
LEFT   JOIN addresses a ON a.entity_type = 'Company'
                        AND a.entity_id  = b.company_id
WHERE  b.company_id = :company_id
ORDER  BY b.is_primary DESC;

-- ============================================================
-- ██  5. CUSTOMER CATEGORIES
-- ============================================================

-- All categories with account counts
SELECT cat.id, cat.name, cat.priority, cat.discount_pct,
       cat.credit_limit, cat.sla_hours, cat.color,
       COUNT(c.id) AS total_accounts
FROM   customer_categories cat
LEFT   JOIN companies c ON c.category_id = cat.id
GROUP  BY cat.id
ORDER  BY FIELD(cat.priority,'Platinum','Gold','Silver','Bronze');

-- ============================================================
-- ██  6. CREDIT LIMITS
-- ============================================================

-- Credit utilisation report
SELECT c.name AS company,
       cat.name AS category,
       cl.credit_limit,
       cl.used_amount,
       cl.overdue_amount,
       ROUND(cl.used_amount / cl.credit_limit * 100, 1) AS utilisation_pct,
       cl.status,
       cl.next_review,
       CONCAT(u.first_name,' ',u.last_name) AS reviewed_by
FROM   credit_limits cl
JOIN   companies          c   ON c.id   = cl.company_id
LEFT   JOIN customer_categories cat ON cat.id = c.category_id
LEFT   JOIN users         u   ON u.id   = cl.reviewed_by
ORDER  BY utilisation_pct DESC;

-- Accounts exceeding or nearing (>80%) limit
SELECT c.name, cl.credit_limit, cl.used_amount, cl.status,
       ROUND(cl.used_amount / cl.credit_limit * 100, 1) AS pct
FROM   credit_limits cl
JOIN   companies c ON c.id = cl.company_id
WHERE  cl.used_amount / cl.credit_limit >= 0.80
ORDER  BY pct DESC;

-- ============================================================
-- ██  7. GST DETAILS
-- ============================================================

-- All GST records
SELECT g.id, g.gstin, g.legal_name, g.state,
       g.registration_type, g.is_verified, g.verified_at,
       c.name  AS company_name,
       b.name  AS branch_name
FROM   gst_details g
JOIN   companies c ON c.id = g.company_id
LEFT   JOIN branches b ON b.id = g.branch_id
ORDER  BY c.name;

-- Unverified GSTINs
SELECT g.gstin, c.name AS company, g.state
FROM   gst_details g
JOIN   companies c ON c.id = g.company_id
WHERE  g.is_verified = 0;

-- ============================================================
-- ██  8. ADDRESSES (Billing & Shipping)
-- ============================================================

-- All billing addresses
SELECT a.*, c.name AS company_name
FROM   addresses a
JOIN   companies c ON c.id = a.entity_id AND a.entity_type = 'Company'
WHERE  a.address_type IN ('Billing','Both')
ORDER  BY c.name;

-- All shipping addresses
SELECT a.*, c.name AS company_name
FROM   addresses a
JOIN   companies c ON c.id = a.entity_id AND a.entity_type = 'Company'
WHERE  a.address_type IN ('Shipping','Both')
ORDER  BY c.name;

-- Billing + shipping for a single company
SELECT address_type, address_line1, address_line2,
       city, state, pincode, country, gstin
FROM   addresses
WHERE  entity_type = 'Company' AND entity_id = :company_id
ORDER  BY address_type;

-- ============================================================
-- ██  9. CONTACTS
-- ============================================================

-- Full contacts list
SELECT ct.id,
       CONCAT(ct.salutation,' ',ct.first_name,' ',ct.last_name) AS full_name,
       ct.contact_type, ct.email, ct.phone, ct.mobile, ct.designation,
       ct.decision_maker, ct.status,
       c.name  AS company_name,
       cg.name AS group_name,
       CONCAT(u.first_name,' ',u.last_name) AS assigned_to,
       ct.created_at
FROM   contacts ct
LEFT   JOIN companies       c  ON c.id  = ct.company_id
LEFT   JOIN customer_groups cg ON cg.id = ct.group_id
LEFT   JOIN users           u  ON u.id  = ct.assigned_to
WHERE  ct.status = 'Active'
ORDER  BY ct.first_name, ct.last_name;

-- Contacts for a specific company
SELECT ct.id,
       CONCAT(ct.first_name,' ',ct.last_name) AS full_name,
       ct.email, ct.phone, ct.designation, ct.decision_maker, ct.status
FROM   contacts ct
WHERE  ct.company_id = :company_id
ORDER  BY ct.decision_maker DESC, ct.first_name;

-- Search contacts
SELECT ct.id,
       CONCAT(ct.first_name,' ',ct.last_name) AS full_name,
       ct.email, ct.phone, c.name AS company
FROM   contacts ct
LEFT   JOIN companies c ON c.id = ct.company_id
WHERE  (ct.first_name LIKE CONCAT('%',:q,'%')
     OR ct.last_name  LIKE CONCAT('%',:q,'%')
     OR ct.email      LIKE CONCAT('%',:q,'%')
     OR ct.phone      LIKE CONCAT('%',:q,'%'))
LIMIT  20;

-- Decision makers across all companies
SELECT ct.id,
       CONCAT(ct.first_name,' ',ct.last_name) AS full_name,
       ct.designation, ct.email, ct.phone,
       c.name AS company
FROM   contacts ct
JOIN   companies c ON c.id = ct.company_id
WHERE  ct.decision_maker = 1 AND ct.status = 'Active'
ORDER  BY c.name;

-- Customer groups with member count
SELECT cg.id, cg.name, cg.description, cg.color,
       COUNT(cgm.contact_id) AS member_count,
       CONCAT(u.first_name,' ',u.last_name) AS created_by
FROM   customer_groups cg
LEFT   JOIN contact_group_members cgm ON cgm.group_id = cg.id
LEFT   JOIN users u ON u.id = cg.created_by
GROUP  BY cg.id
ORDER  BY member_count DESC;

-- ============================================================
-- ██  10. LEADS
-- ============================================================

-- All leads with AI score and assigned user
SELECT l.id, l.lead_no, l.first_name, l.last_name,
       l.company_name, l.email, l.phone,
       l.source, l.status, l.rating,
       als.score  AS ai_score,
       als.grade  AS ai_grade,
       l.created_at,
       CONCAT(u.first_name,' ',u.last_name) AS assigned_to
FROM   leads l
LEFT   JOIN ai_lead_scores als ON als.lead_id = l.id
LEFT   JOIN users u            ON u.id = l.assigned_to
WHERE  l.status NOT IN ('Converted','Lost')
ORDER  BY als.score DESC, l.created_at DESC;

-- Leads by source breakdown
SELECT source,
       COUNT(*)                                        AS total,
       SUM(CASE WHEN status='Qualified'   THEN 1 END) AS qualified,
       SUM(CASE WHEN status='Converted'   THEN 1 END) AS converted,
       ROUND(AVG(als.score),1)                        AS avg_ai_score
FROM   leads l
LEFT   JOIN ai_lead_scores als ON als.lead_id = l.id
GROUP  BY source
ORDER  BY total DESC;

-- Leads assigned to a specific user
SELECT l.id, l.lead_no, l.first_name, l.last_name,
       l.company_name, l.email, l.status, l.rating,
       als.score AS ai_score, l.created_at
FROM   leads l
LEFT   JOIN ai_lead_scores als ON als.lead_id = l.id
WHERE  l.assigned_to = :user_id
  AND  l.status NOT IN ('Converted','Lost')
ORDER  BY als.score DESC;

-- Hot leads (ai_score >= 75, status New/Contacted)
SELECT l.id, l.lead_no,
       CONCAT(l.first_name,' ',l.last_name) AS name,
       l.company_name, l.email, l.phone,
       als.score, als.grade,
       l.source, l.created_at
FROM   leads l
JOIN   ai_lead_scores als ON als.lead_id = l.id
WHERE  als.score >= 75
  AND  l.status IN ('New','Contacted')
ORDER  BY als.score DESC;

-- Lead conversion rate by assigned user (last 90 days)
SELECT CONCAT(u.first_name,' ',u.last_name) AS rep_name,
       COUNT(l.id)                               AS total_leads,
       SUM(CASE WHEN l.status='Converted' THEN 1 END) AS converted,
       ROUND(SUM(CASE WHEN l.status='Converted' THEN 1 END) /
             COUNT(l.id) * 100, 1)               AS conversion_rate_pct
FROM   leads l
JOIN   users u ON u.id = l.assigned_to
WHERE  l.created_at >= CURDATE() - INTERVAL 90 DAY
GROUP  BY l.assigned_to
ORDER  BY conversion_rate_pct DESC;

-- Duplicate leads detection (same email)
SELECT email, COUNT(*) AS dup_count,
       GROUP_CONCAT(id ORDER BY id) AS lead_ids,
       GROUP_CONCAT(CONCAT(first_name,' ',last_name) ORDER BY id) AS names
FROM   leads
WHERE  email IS NOT NULL AND email <> ''
GROUP  BY email
HAVING dup_count > 1;

-- Duplicate leads detection (same phone)
SELECT phone, COUNT(*) AS dup_count,
       GROUP_CONCAT(id ORDER BY id)                           AS lead_ids,
       GROUP_CONCAT(CONCAT(first_name,' ',last_name) ORDER BY id) AS names
FROM   leads
WHERE  phone IS NOT NULL AND phone <> ''
GROUP  BY phone
HAVING dup_count > 1;

-- ============================================================
-- ██  11. OPPORTUNITIES
-- ============================================================

-- Full pipeline with company and contact
SELECT o.id, o.opp_no, o.title,
       o.stage, o.amount, o.currency, o.probability,
       o.expected_close, o.actual_close,
       ROUND(o.amount * o.probability / 100, 2) AS weighted_value,
       c.name  AS company,
       CONCAT(ct.first_name,' ',ct.last_name) AS contact_name,
       CONCAT(u.first_name,' ',u.last_name)   AS assigned_to,
       o.created_at
FROM   opportunities o
JOIN   companies c  ON c.id  = o.company_id
LEFT   JOIN contacts ct ON ct.id = o.contact_id
LEFT   JOIN users    u  ON u.id  = o.assigned_to
WHERE  o.stage NOT IN ('Closed Won','Closed Lost')
ORDER  BY o.expected_close ASC;

-- Pipeline summary by stage
SELECT stage,
       COUNT(*)         AS deal_count,
       SUM(amount)      AS total_value,
       ROUND(SUM(amount * probability / 100), 2) AS weighted_value,
       ROUND(AVG(probability), 1)               AS avg_probability
FROM   opportunities
WHERE  stage NOT IN ('Closed Won','Closed Lost')
GROUP  BY stage
ORDER  BY FIELD(stage,'Prospecting','Qualification',
               'Needs Analysis','Proposal','Negotiation');

-- Won vs Lost this quarter
SELECT
  SUM(CASE WHEN stage='Closed Won'  THEN 1 END) AS won_count,
  SUM(CASE WHEN stage='Closed Lost' THEN 1 END) AS lost_count,
  SUM(CASE WHEN stage='Closed Won'  THEN amount END) AS won_value,
  ROUND(SUM(CASE WHEN stage='Closed Won' THEN 1 END) /
        NULLIF(SUM(CASE WHEN stage IN('Closed Won','Closed Lost') THEN 1 END),0)*100,1) AS win_rate_pct
FROM opportunities
WHERE actual_close >= DATE_FORMAT(CURDATE(),'%Y-%m-01') - INTERVAL 2 MONTH
  AND actual_close <= LAST_DAY(CURDATE());

-- Deals closing this month
SELECT o.id, o.opp_no, o.title, o.amount, o.stage,
       o.expected_close, o.probability,
       c.name AS company,
       CONCAT(u.first_name,' ',u.last_name) AS assigned_to
FROM   opportunities o
JOIN   companies c ON c.id = o.company_id
LEFT   JOIN users u ON u.id = o.assigned_to
WHERE  o.expected_close BETWEEN CURDATE() AND LAST_DAY(CURDATE())
  AND  o.stage NOT IN ('Closed Won','Closed Lost')
ORDER  BY o.expected_close;

-- Overdue opportunities (past expected close, still open)
SELECT o.id, o.opp_no, o.title, o.amount, o.stage,
       o.expected_close,
       DATEDIFF(CURDATE(), o.expected_close) AS days_overdue,
       c.name AS company,
       CONCAT(u.first_name,' ',u.last_name) AS assigned_to
FROM   opportunities o
JOIN   companies c ON c.id = o.company_id
LEFT   JOIN users u ON u.id = o.assigned_to
WHERE  o.expected_close < CURDATE()
  AND  o.stage NOT IN ('Closed Won','Closed Lost')
ORDER  BY days_overdue DESC;

-- Stage history / tracking for one opportunity
SELECT osh.from_stage, osh.to_stage,
       CONCAT(u.first_name,' ',u.last_name) AS changed_by,
       osh.notes, osh.changed_at
FROM   opportunity_stage_history osh
LEFT   JOIN users u ON u.id = osh.changed_by
WHERE  osh.opportunity_id = :opp_id
ORDER  BY osh.changed_at;

-- Sales rep performance
SELECT CONCAT(u.first_name,' ',u.last_name) AS rep,
       COUNT(o.id)                          AS total_opps,
       SUM(CASE WHEN o.stage='Closed Won'  THEN 1 END)      AS won,
       SUM(CASE WHEN o.stage='Closed Won'  THEN o.amount END) AS revenue,
       ROUND(AVG(CASE WHEN o.stage='Closed Won'
             THEN DATEDIFF(o.actual_close, o.created_at) END),0) AS avg_cycle_days
FROM   opportunities o
JOIN   users u ON u.id = o.assigned_to
WHERE  o.created_at >= CURDATE() - INTERVAL 365 DAY
GROUP  BY o.assigned_to
ORDER  BY revenue DESC NULLS LAST;

-- ============================================================
-- ██  12. ACTIVITIES – CALLS
-- ============================================================

-- All calls with entity info
SELECT cl.id, cl.subject, cl.direction, cl.status,
       cl.entity_type, cl.entity_id, cl.call_datetime,
       SEC_TO_TIME(cl.duration_sec) AS duration,
       cl.outcome,
       CONCAT(u.first_name,' ',u.last_name) AS assigned_to
FROM   calls cl
LEFT   JOIN users u ON u.id = cl.assigned_to
ORDER  BY cl.call_datetime DESC;

-- Call log for a specific entity (Lead / Contact / Company)
SELECT cl.id, cl.subject, cl.direction, cl.status,
       cl.call_datetime,
       SEC_TO_TIME(cl.duration_sec) AS duration,
       cl.outcome,
       CONCAT(u.first_name,' ',u.last_name) AS agent
FROM   calls cl
LEFT   JOIN users u ON u.id = cl.assigned_to
WHERE  cl.entity_type = :entity_type AND cl.entity_id = :entity_id
ORDER  BY cl.call_datetime DESC;

-- Call stats by rep (this month)
SELECT CONCAT(u.first_name,' ',u.last_name) AS rep,
       COUNT(*)                             AS total_calls,
       SUM(CASE WHEN direction='Inbound'    THEN 1 END) AS inbound,
       SUM(CASE WHEN direction='Outbound'   THEN 1 END) AS outbound,
       SUM(CASE WHEN status='Completed'     THEN 1 END) AS completed,
       SUM(CASE WHEN status='No Answer'     THEN 1 END) AS no_answer,
       ROUND(AVG(duration_sec)/60, 1)       AS avg_duration_min
FROM   calls cl
JOIN   users u ON u.id = cl.assigned_to
WHERE  cl.call_datetime >= DATE_FORMAT(CURDATE(),'%Y-%m-01')
GROUP  BY cl.assigned_to
ORDER  BY total_calls DESC;

-- ============================================================
-- ██  13. ACTIVITIES – MEETINGS
-- ============================================================

-- All upcoming meetings
SELECT m.id, m.title, m.status,
       m.entity_type, m.entity_id,
       m.start_datetime, m.end_datetime,
       m.location, m.meeting_url,
       TIMESTAMPDIFF(MINUTE, m.start_datetime, m.end_datetime) AS duration_min,
       CONCAT(u.first_name,' ',u.last_name) AS organizer
FROM   meetings m
LEFT   JOIN users u ON u.id = m.created_by
WHERE  m.start_datetime >= NOW()
  AND  m.status = 'Scheduled'
ORDER  BY m.start_datetime;

-- Meetings with attendee list
SELECT m.id, m.title, m.start_datetime,
       GROUP_CONCAT(DISTINCT CONCAT(u.first_name,' ',u.last_name) SEPARATOR ', ') AS internal_attendees,
       GROUP_CONCAT(DISTINCT CONCAT(ct.first_name,' ',ct.last_name) SEPARATOR ', ') AS external_attendees
FROM   meetings m
LEFT   JOIN meeting_attendees ma ON ma.meeting_id = m.id
LEFT   JOIN users    u  ON u.id  = ma.user_id
LEFT   JOIN contacts ct ON ct.id = ma.contact_id
WHERE  m.id = :meeting_id
GROUP  BY m.id;

-- ============================================================
-- ██  14. ACTIVITIES – FOLLOW-UPS
-- ============================================================

-- All pending follow-ups with overdue flag
SELECT f.id, f.subject, f.type, f.priority, f.status,
       f.entity_type, f.entity_id, f.due_date,
       CASE WHEN f.due_date < NOW() AND f.status='Pending'
            THEN 'Overdue' ELSE f.status END AS actual_status,
       DATEDIFF(f.due_date, CURDATE())       AS days_until_due,
       CONCAT(u.first_name,' ',u.last_name)  AS assigned_to
FROM   followups f
LEFT   JOIN users u ON u.id = f.assigned_to
WHERE  f.status IN ('Pending','Overdue')
ORDER  BY f.due_date ASC;

-- Today's follow-ups for a user
SELECT f.id, f.subject, f.type, f.priority,
       f.entity_type, f.entity_id, f.due_date, f.notes
FROM   followups f
WHERE  f.assigned_to = :user_id
  AND  DATE(f.due_date) = CURDATE()
  AND  f.status = 'Pending'
ORDER  BY f.priority DESC, f.due_date;

-- Overdue follow-ups
SELECT f.id, f.subject, f.type,
       f.due_date,
       DATEDIFF(CURDATE(), f.due_date) AS days_overdue,
       f.entity_type, f.entity_id,
       CONCAT(u.first_name,' ',u.last_name) AS assigned_to
FROM   followups f
JOIN   users u ON u.id = f.assigned_to
WHERE  f.due_date < NOW() AND f.status = 'Pending'
ORDER  BY days_overdue DESC;

-- ============================================================
-- ██  15. COMMUNICATION HISTORY
-- ============================================================

-- Full communication history for an entity
SELECT ch.id, ch.channel, ch.direction, ch.subject,
       ch.status, ch.duration_sec,
       ch.occurred_at,
       CONCAT(u.first_name,' ',u.last_name) AS handled_by
FROM   communication_history ch
LEFT   JOIN users u ON u.id = ch.handled_by
WHERE  ch.entity_type = :entity_type AND ch.entity_id = :entity_id
ORDER  BY ch.occurred_at DESC;

-- All comms across all entities (timeline view)
SELECT ch.id, ch.channel, ch.direction, ch.subject,
       ch.entity_type, ch.entity_id, ch.occurred_at, ch.status,
       CONCAT(u.first_name,' ',u.last_name) AS handled_by
FROM   communication_history ch
LEFT   JOIN users u ON u.id = ch.handled_by
WHERE  ch.occurred_at >= CURDATE() - INTERVAL 30 DAY
ORDER  BY ch.occurred_at DESC
LIMIT  100;

-- Channel breakdown stats (last 30 days)
SELECT channel,
       COUNT(*)                                          AS total,
       SUM(CASE WHEN direction='Inbound'  THEN 1 END)   AS inbound,
       SUM(CASE WHEN direction='Outbound' THEN 1 END)   AS outbound
FROM   communication_history
WHERE  occurred_at >= CURDATE() - INTERVAL 30 DAY
GROUP  BY channel
ORDER  BY total DESC;

-- ============================================================
-- ██  16. NOTES
-- ============================================================

-- Notes for a specific entity
SELECT n.id, n.title, n.content, n.tags, n.is_pinned,
       CONCAT(u.first_name,' ',u.last_name) AS created_by,
       n.created_at, n.updated_at
FROM   notes n
LEFT   JOIN users u ON u.id = n.created_by
WHERE  n.entity_type = :entity_type AND n.entity_id = :entity_id
ORDER  BY n.is_pinned DESC, n.created_at DESC;

-- All notes search
SELECT n.id, n.entity_type, n.entity_id, n.title,
       n.content, n.tags, n.is_pinned, n.created_at
FROM   notes n
WHERE  n.title   LIKE CONCAT('%',:q,'%')
    OR n.content LIKE CONCAT('%',:q,'%')
ORDER  BY n.is_pinned DESC, n.created_at DESC
LIMIT  50;

-- ============================================================
-- ██  17. ATTACHMENTS
-- ============================================================

-- Attachments for a specific entity
SELECT a.id, a.file_name, a.file_path, a.file_size,
       a.mime_type, a.category,
       CONCAT(u.first_name,' ',u.last_name) AS uploaded_by,
       a.created_at
FROM   attachments a
LEFT   JOIN users u ON u.id = a.uploaded_by
WHERE  a.entity_type = :entity_type AND a.entity_id = :entity_id
ORDER  BY a.created_at DESC;

-- All attachments grouped by type
SELECT entity_type,
       COUNT(*)           AS file_count,
       SUM(file_size)     AS total_bytes,
       ROUND(SUM(file_size)/1048576, 1) AS total_mb
FROM   attachments
GROUP  BY entity_type;

-- ============================================================
-- ██  18. RELATIONSHIP MAPPING
-- ============================================================

-- All relationships
SELECT r.id, r.source_type, r.source_id, r.relation_type,
       r.target_type, r.target_id, r.created_at
FROM   relationships r
WHERE  r.is_active = 1
ORDER  BY r.source_type, r.source_id;

-- All relationships for a specific entity (in both directions)
SELECT r.id, r.relation_type,
       r.source_type, r.source_id,
       r.target_type, r.target_id
FROM   relationships r
WHERE  r.is_active = 1
  AND  ((r.source_type = :type AND r.source_id = :id)
     OR (r.target_type = :type AND r.target_id = :id));

-- ============================================================
-- ██  19. CAMPAIGNS
-- ============================================================

-- All campaigns with live stats
SELECT c.id, c.name, c.type, c.status,
       c.budget, c.spent, c.start_date, c.end_date,
       cs.sent, cs.delivered, cs.opened, cs.clicked,
       cs.converted, cs.bounced, cs.unsubscribed,
       ROUND(cs.opened    / NULLIF(cs.delivered,0)*100, 1) AS open_rate_pct,
       ROUND(cs.clicked   / NULLIF(cs.opened,0)   *100, 1) AS ctr_pct,
       ROUND(cs.converted / NULLIF(cs.clicked,0)  *100, 1) AS conv_rate_pct,
       ROUND(cs.bounced   / NULLIF(cs.sent,0)     *100, 1) AS bounce_rate_pct,
       CONCAT(u.first_name,' ',u.last_name) AS created_by
FROM   campaigns c
LEFT   JOIN campaign_stats cs ON cs.campaign_id = c.id
LEFT   JOIN users u ON u.id = c.created_by
ORDER  BY c.created_at DESC;

-- Campaign performance by channel
SELECT type AS channel,
       COUNT(*)             AS total_campaigns,
       SUM(cs.sent)         AS total_sent,
       ROUND(AVG(cs.opened/NULLIF(cs.delivered,0)*100),1) AS avg_open_rate,
       ROUND(AVG(cs.clicked/NULLIF(cs.opened,0)*100),1)   AS avg_ctr,
       SUM(cs.converted)    AS total_conversions,
       SUM(c.revenue)       AS total_revenue
FROM   campaigns c
LEFT   JOIN campaign_stats cs ON cs.campaign_id = c.id
GROUP  BY type;

-- Active campaigns
SELECT c.id, c.name, c.type, c.budget, c.spent,
       ROUND(c.spent/NULLIF(c.budget,0)*100,1) AS budget_used_pct,
       c.end_date,
       DATEDIFF(c.end_date, CURDATE()) AS days_remaining
FROM   campaigns c
WHERE  c.status = 'Active'
ORDER  BY c.end_date;

-- Campaign recipients status breakdown
SELECT c.name AS campaign,
       cr.status,
       COUNT(*) AS count
FROM   campaign_recipients cr
JOIN   campaigns c ON c.id = cr.campaign_id
WHERE  c.id = :campaign_id
GROUP  BY cr.status;

-- ============================================================
-- ██  20. DOCUMENTS
-- ============================================================

-- All documents with related entity
SELECT d.id, d.doc_no, d.doc_type, d.title, d.status,
       d.value, d.valid_until,
       d.entity_type, d.entity_id,
       o.title  AS opportunity_title,
       CONCAT(u.first_name,' ',u.last_name) AS created_by,
       d.created_at
FROM   documents d
LEFT   JOIN opportunities o ON o.id = d.opportunity_id
LEFT   JOIN users u ON u.id = d.created_by
ORDER  BY d.created_at DESC;

-- Documents for a specific entity
SELECT d.id, d.doc_no, d.doc_type, d.title, d.status, d.value, d.created_at
FROM   documents d
WHERE  d.entity_type = :entity_type AND d.entity_id = :entity_id
ORDER  BY d.created_at DESC;

-- Quotation / Proposal with line items and totals
SELECT d.id, d.doc_no, d.title,
       li.sort_order, li.item_code, li.description,
       li.quantity, li.unit, li.unit_price,
       li.discount_pct, li.tax_rate, li.amount AS line_total,
       SUM(li.amount) OVER (PARTITION BY d.id)       AS subtotal,
       SUM(li.amount * li.tax_rate/100)
         OVER (PARTITION BY d.id)                    AS total_tax,
       SUM(li.amount + li.amount*li.tax_rate/100)
         OVER (PARTITION BY d.id)                    AS grand_total
FROM   documents d
JOIN   document_line_items li ON li.document_id = d.id
WHERE  d.id = :doc_id
ORDER  BY li.sort_order;

-- Pending signatures
SELECT d.id, d.doc_no, d.title, d.doc_type,
       ds.signer_name, ds.signer_email, ds.signer_role,
       ds.status AS sign_status, ds.created_at
FROM   document_signatures ds
JOIN   documents d ON d.id = ds.document_id
WHERE  ds.status = 'Pending'
ORDER  BY ds.created_at;

-- ============================================================
-- ██  21. OCR DOCUMENTS
-- ============================================================

-- All OCR documents
SELECT id, file_name, doc_type, status, confidence,
       extracted_data, uploaded_by, processed_at, created_at
FROM   ocr_documents
ORDER  BY created_at DESC;

-- Unprocessed OCR queue
SELECT id, file_name, doc_type, created_at
FROM   ocr_documents
WHERE  status IN ('Queued','Processing')
ORDER  BY created_at;

-- ============================================================
-- ██  22. BULK IMPORT
-- ============================================================

-- Import history
SELECT bi.id, bi.import_type, bi.file_name,
       bi.total_rows, bi.imported, bi.skipped, bi.failed, bi.duplicates,
       bi.status,
       CONCAT(u.first_name,' ',u.last_name) AS imported_by,
       bi.started_at, bi.completed_at,
       TIMESTAMPDIFF(SECOND,bi.started_at,bi.completed_at) AS duration_sec
FROM   bulk_imports bi
LEFT   JOIN users u ON u.id = bi.imported_by
ORDER  BY bi.created_at DESC;

-- ============================================================
-- ██  23. DUPLICATE DETECTION
-- ============================================================

-- Unresolved duplicates
SELECT dr.id, dr.entity_type,
       dr.record_id, dr.duplicate_of_id,
       dr.match_score, dr.match_fields, dr.status, dr.created_at
FROM   duplicate_records dr
WHERE  dr.status = 'Pending'
ORDER  BY dr.match_score DESC;

-- ============================================================
-- ██  24. AI LEAD SCORES
-- ============================================================

-- Score distribution
SELECT grade,
       COUNT(*)               AS lead_count,
       ROUND(AVG(score),1)    AS avg_score,
       MIN(score)             AS min_score,
       MAX(score)             AS max_score
FROM   ai_lead_scores
GROUP  BY grade
ORDER  BY FIELD(grade,'A','B','C','D');

-- Top 10 hot leads
SELECT l.id, l.lead_no,
       CONCAT(l.first_name,' ',l.last_name) AS name,
       l.company_name, l.email, l.source,
       als.score, als.grade, als.factors
FROM   ai_lead_scores als
JOIN   leads l ON l.id = als.lead_id
WHERE  l.status NOT IN ('Converted','Lost')
ORDER  BY als.score DESC
LIMIT  10;

-- ============================================================
-- ██  25. AUDIT LOG
-- ============================================================

-- Recent activity log
SELECT al.id, al.action, al.entity_type, al.entity_id,
       al.old_values, al.new_values,
       al.ip_address, al.occurred_at,
       CONCAT(u.first_name,' ',u.last_name) AS user_name
FROM   audit_logs al
LEFT   JOIN users u ON u.id = al.user_id
ORDER  BY al.occurred_at DESC
LIMIT  200;

-- Audit for a specific record
SELECT al.action,
       CONCAT(u.first_name,' ',u.last_name) AS done_by,
       al.old_values, al.new_values, al.occurred_at
FROM   audit_logs al
LEFT   JOIN users u ON u.id = al.user_id
WHERE  al.entity_type = :entity_type AND al.entity_id = :entity_id
ORDER  BY al.occurred_at DESC;

-- ============================================================
-- ██  26. DASHBOARD – KPI QUERIES
-- ============================================================

-- Dashboard summary numbers
SELECT
  (SELECT COUNT(*) FROM leads WHERE status NOT IN ('Converted','Lost')
   AND created_at >= DATE_FORMAT(CURDATE(),'%Y-%m-01'))    AS new_leads_this_month,

  (SELECT COUNT(*) FROM leads WHERE status = 'Converted'
   AND converted_at >= DATE_FORMAT(CURDATE(),'%Y-%m-01'))  AS conversions_this_month,

  (SELECT COUNT(*) FROM opportunities
   WHERE stage NOT IN ('Closed Won','Closed Lost'))         AS open_opportunities,

  (SELECT ROUND(SUM(amount * probability/100),0)
   FROM opportunities
   WHERE stage NOT IN ('Closed Won','Closed Lost'))         AS weighted_pipeline,

  (SELECT SUM(amount) FROM opportunities
   WHERE stage='Closed Won'
   AND actual_close >= DATE_FORMAT(CURDATE(),'%Y-%m-01'))   AS revenue_this_month,

  (SELECT COUNT(*) FROM followups
   WHERE status='Pending' AND due_date < NOW())             AS overdue_followups,

  (SELECT COUNT(*) FROM campaigns WHERE status='Active')    AS active_campaigns,

  (SELECT COUNT(*) FROM document_signatures WHERE status='Pending') AS pending_signatures;

-- Monthly revenue trend (last 12 months)
SELECT DATE_FORMAT(actual_close,'%Y-%m') AS month,
       COUNT(*)                          AS deals_closed,
       SUM(amount)                       AS revenue
FROM   opportunities
WHERE  stage = 'Closed Won'
  AND  actual_close >= CURDATE() - INTERVAL 12 MONTH
GROUP  BY DATE_FORMAT(actual_close,'%Y-%m')
ORDER  BY month;

-- Lead source performance
SELECT l.source,
       COUNT(l.id)                                             AS total_leads,
       SUM(CASE WHEN l.status='Converted' THEN 1 ELSE 0 END)  AS converted,
       ROUND(SUM(CASE WHEN l.status='Converted' THEN 1 ELSE 0 END)
             /COUNT(l.id)*100, 1)                              AS conv_rate_pct,
       ROUND(AVG(als.score),1)                                 AS avg_ai_score
FROM   leads l
LEFT   JOIN ai_lead_scores als ON als.lead_id = l.id
WHERE  l.created_at >= CURDATE() - INTERVAL 90 DAY
GROUP  BY l.source
ORDER  BY total_leads DESC;

-- Activities summary today
SELECT
  (SELECT COUNT(*) FROM calls     WHERE DATE(call_datetime)  = CURDATE()) AS calls_today,
  (SELECT COUNT(*) FROM meetings  WHERE DATE(start_datetime) = CURDATE()) AS meetings_today,
  (SELECT COUNT(*) FROM followups WHERE DATE(due_date)       = CURDATE()
   AND status='Pending')                                                   AS followups_today,
  (SELECT COUNT(*) FROM email_logs WHERE DATE(sent_at)       = CURDATE()
   AND direction='Outbound')                                               AS emails_sent_today;

-- ============================================================
-- ██  27. CRUD – INSERT TEMPLATES
-- ============================================================

-- Insert a new lead
INSERT INTO leads (lead_no, first_name, last_name, company_name, email,
                   phone, source, status, rating, assigned_to, created_by)
VALUES (:lead_no, :first_name, :last_name, :company_name, :email,
        :phone, :source, 'New', :rating, :assigned_to, :created_by);

-- Insert a new contact
INSERT INTO contacts (company_id, first_name, last_name, email, phone,
                      mobile, designation, decision_maker, assigned_to, created_by)
VALUES (:company_id, :first_name, :last_name, :email, :phone,
        :mobile, :designation, :decision_maker, :assigned_to, :created_by);

-- Insert a new company
INSERT INTO companies (parent_company_id, name, type, industry, email, phone,
                       gstin, category_id, assigned_to, status, created_by)
VALUES (:parent_company_id, :name, :type, :industry, :email, :phone,
        :gstin, :category_id, :assigned_to, 'Active', :created_by);

-- Insert a new opportunity
INSERT INTO opportunities (opp_no, title, company_id, contact_id, assigned_to,
                           stage, amount, probability, expected_close, created_by)
VALUES (:opp_no, :title, :company_id, :contact_id, :assigned_to,
        'Prospecting', :amount, :probability, :expected_close, :created_by);

-- Insert a follow-up
INSERT INTO followups (subject, entity_type, entity_id, type, priority,
                       status, due_date, assigned_to, notes, created_by)
VALUES (:subject, :entity_type, :entity_id, :type, :priority,
        'Pending', :due_date, :assigned_to, :notes, :created_by);

-- Insert a note
INSERT INTO notes (entity_type, entity_id, title, content, tags, is_pinned, created_by)
VALUES (:entity_type, :entity_id, :title, :content, :tags, :is_pinned, :created_by);

-- Convert lead to contact + company + opportunity
START TRANSACTION;
  INSERT INTO contacts  (company_id, first_name, last_name, email, phone, designation, assigned_to, created_by)
  SELECT :new_company_id, first_name, last_name, email, phone, designation, assigned_to, assigned_to
  FROM   leads WHERE id = :lead_id;

  INSERT INTO opportunities (opp_no, title, company_id, contact_id, assigned_to, stage, amount, expected_close, created_by)
  VALUES (:opp_no, :opp_title, :new_company_id, LAST_INSERT_ID(), :assigned_to, 'Prospecting', :amount, :exp_close, :assigned_to);

  UPDATE leads
  SET    status = 'Converted',
         converted_at = NOW(),
         converted_to_contact     = (SELECT MAX(id) FROM contacts),
         converted_to_opportunity = (SELECT MAX(id) FROM opportunities)
  WHERE  id = :lead_id;
COMMIT;
