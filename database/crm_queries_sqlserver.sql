-- ============================================================
--  SanCRM – All Module Queries (T-SQL / SQL Server)
--  Compatible: SQL Server 2016+ / Azure SQL
--  Converted from MySQL crm_queries.sql
--  Parameters use @param_name notation (replace with actual values)
-- ============================================================
USE sancrm;
GO

-- ============================================================
-- ██  1. USERS & ROLES
-- ============================================================

-- List all active users with their role
SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
       u.designation, u.department, r.name AS role,
       u.is_active, u.last_login
FROM   users u
JOIN   roles r ON r.id = u.role_id
WHERE  u.is_active = 1
ORDER  BY u.first_name;
GO

-- Get a single user with permissions
SELECT u.*, r.name AS role_name, r.permissions
FROM   users u
JOIN   roles r ON r.id = u.role_id
WHERE  u.id = @user_id;
GO

-- ============================================================
-- ██  2. PARENT COMPANIES
-- ============================================================

-- All parent companies with subsidiary count
SELECT pc.id, pc.name, pc.industry, pc.country, pc.revenue,
       COUNT(c.id) AS total_subsidiaries,
       pc.status
FROM   parent_companies pc
LEFT   JOIN companies c ON c.parent_company_id = pc.id
GROUP  BY pc.id, pc.name, pc.industry, pc.country, pc.revenue, pc.status
ORDER  BY pc.name;
GO

-- Parent company with full hierarchy
SELECT pc.id  AS parent_id,  pc.name AS parent_name,
       c.id   AS company_id, c.name  AS company_name, c.type,
       b.id   AS branch_id,  b.name  AS branch_name,  b.branch_type
FROM   parent_companies pc
LEFT   JOIN companies c ON c.parent_company_id = pc.id
LEFT   JOIN branches  b ON b.company_id        = c.id
WHERE  pc.id = @parent_id
ORDER  BY c.name, b.name;
GO

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
       u.first_name + ' ' + u.last_name           AS assigned_to,
       COUNT(DISTINCT br.id)   AS branch_count,
       COUNT(DISTINCT ct.id)   AS contact_count,
       COUNT(DISTINCT op.id)   AS open_opportunities,
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
GROUP  BY c.id, c.name, c.type, c.industry, c.email, c.phone,
          c.gstin, c.status, c.annual_revenue,
          pc.name, cat.name, cat.priority,
          cl.credit_limit, cl.used_amount, cl.status,
          u.first_name, u.last_name, c.created_at
ORDER  BY c.name;
GO

-- Single company full detail
SELECT c.*, pc.name AS parent_name,
       cat.name AS category_name, cat.discount_pct, cat.sla_hours,
       cl.credit_limit, cl.used_amount, cl.overdue_amount, cl.status AS credit_status,
       u.first_name + ' ' + u.last_name AS assigned_to_name
FROM   companies c
LEFT   JOIN parent_companies    pc  ON pc.id  = c.parent_company_id
LEFT   JOIN customer_categories cat ON cat.id = c.category_id
LEFT   JOIN credit_limits       cl  ON cl.company_id = c.id
LEFT   JOIN users               u   ON u.id = c.assigned_to
WHERE  c.id = @company_id;
GO

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
GO

-- Search companies (name / email / gstin)
SELECT TOP 20 id, name, type, industry, email, phone, status
FROM   companies
WHERE  name  LIKE '%' + @q + '%'
    OR email LIKE '%' + @q + '%'
    OR gstin LIKE '%' + @q + '%'
ORDER  BY name;
GO

-- ============================================================
-- ██  4. BRANCHES
-- ============================================================

-- All branches with company info
SELECT b.id, b.name, b.branch_type, b.phone, b.email,
       b.gstin, b.is_primary, b.status,
       c.name  AS company_name,
       a.city, a.state, a.pincode
FROM   branches b
JOIN   companies c ON c.id = b.company_id
LEFT   JOIN addresses a ON a.entity_type = 'Company'
                       AND a.entity_id   = b.company_id
                       AND a.is_default  = 1
ORDER  BY c.name, b.is_primary DESC, b.name;
GO

-- Branches of a specific company
SELECT b.*, a.address_line1, a.city, a.state, a.pincode
FROM   branches b
LEFT   JOIN addresses a ON a.entity_type = 'Company'
                       AND a.entity_id   = b.company_id
WHERE  b.company_id = @company_id
ORDER  BY b.is_primary DESC;
GO

-- ============================================================
-- ██  5. CUSTOMER CATEGORIES
-- ============================================================

-- All categories with account counts
-- Note: ORDER BY FIELD() is MySQL-only; use CASE for T-SQL
SELECT cat.id, cat.name, cat.priority, cat.discount_pct,
       cat.credit_limit, cat.sla_hours, cat.color,
       COUNT(c.id) AS total_accounts
FROM   customer_categories cat
LEFT   JOIN companies c ON c.category_id = cat.id
GROUP  BY cat.id, cat.name, cat.priority, cat.discount_pct,
          cat.credit_limit, cat.sla_hours, cat.color
ORDER  BY CASE cat.priority
            WHEN 'Platinum' THEN 1
            WHEN 'Gold'     THEN 2
            WHEN 'Silver'   THEN 3
            WHEN 'Bronze'   THEN 4
            ELSE 5
          END;
GO

-- ============================================================
-- ██  6. CREDIT LIMITS
-- ============================================================

-- Credit utilisation report
SELECT c.name  AS company,
       cat.name AS category,
       cl.credit_limit,
       cl.used_amount,
       cl.overdue_amount,
       ROUND(cl.used_amount / NULLIF(cl.credit_limit,0) * 100, 1) AS utilisation_pct,
       cl.status,
       cl.next_review,
       u.first_name + ' ' + u.last_name AS reviewed_by
FROM   credit_limits cl
JOIN   companies            c   ON c.id   = cl.company_id
LEFT   JOIN customer_categories cat ON cat.id = c.category_id
LEFT   JOIN users           u   ON u.id   = cl.reviewed_by
ORDER  BY utilisation_pct DESC;
GO

-- Accounts exceeding or nearing (>80%) limit
SELECT c.name, cl.credit_limit, cl.used_amount, cl.status,
       ROUND(cl.used_amount / NULLIF(cl.credit_limit,0) * 100, 1) AS pct
FROM   credit_limits cl
JOIN   companies c ON c.id = cl.company_id
WHERE  cl.used_amount / NULLIF(cl.credit_limit,0) >= 0.80
ORDER  BY pct DESC;
GO

-- ============================================================
-- ██  7. GST DETAILS
-- ============================================================

-- All GST records
SELECT g.id, g.gstin, g.legal_name, g.state,
       g.registration_type, g.is_verified, g.verified_at,
       c.name AS company_name,
       b.name AS branch_name
FROM   gst_details g
JOIN   companies c ON c.id = g.company_id
LEFT   JOIN branches b ON b.id = g.branch_id
ORDER  BY c.name;
GO

-- Unverified GSTINs
SELECT g.gstin, c.name AS company, g.state
FROM   gst_details g
JOIN   companies c ON c.id = g.company_id
WHERE  g.is_verified = 0;
GO

-- ============================================================
-- ██  8. ADDRESSES
-- ============================================================

-- All billing addresses
SELECT a.*, c.name AS company_name
FROM   addresses a
JOIN   companies c ON c.id = a.entity_id AND a.entity_type = 'Company'
WHERE  a.address_type IN ('Billing','Both')
ORDER  BY c.name;
GO

-- All shipping addresses
SELECT a.*, c.name AS company_name
FROM   addresses a
JOIN   companies c ON c.id = a.entity_id AND a.entity_type = 'Company'
WHERE  a.address_type IN ('Shipping','Both')
ORDER  BY c.name;
GO

-- Billing + shipping for a single company
SELECT address_type, address_line1, address_line2,
       city, state, pincode, country, gstin
FROM   addresses
WHERE  entity_type = 'Company' AND entity_id = @company_id
ORDER  BY address_type;
GO

-- ============================================================
-- ██  9. CONTACTS
-- ============================================================

-- Full contacts list
SELECT ct.id,
       ISNULL(ct.salutation + ' ','') + ct.first_name + ' ' + ISNULL(ct.last_name,'') AS full_name,
       ct.contact_type, ct.email, ct.phone, ct.mobile, ct.designation,
       ct.decision_maker, ct.status,
       c.name  AS company_name,
       cg.name AS group_name,
       u.first_name + ' ' + u.last_name AS assigned_to,
       ct.created_at
FROM   contacts ct
LEFT   JOIN companies       c  ON c.id  = ct.company_id
LEFT   JOIN customer_groups cg ON cg.id = ct.group_id
LEFT   JOIN users           u  ON u.id  = ct.assigned_to
WHERE  ct.status = 'Active'
ORDER  BY ct.first_name, ct.last_name;
GO

-- Contacts for a specific company
SELECT ct.id,
       ct.first_name + ' ' + ISNULL(ct.last_name,'') AS full_name,
       ct.email, ct.phone, ct.designation, ct.decision_maker, ct.status
FROM   contacts ct
WHERE  ct.company_id = @company_id
ORDER  BY ct.decision_maker DESC, ct.first_name;
GO

-- Search contacts
SELECT TOP 20
       ct.id,
       ct.first_name + ' ' + ISNULL(ct.last_name,'') AS full_name,
       ct.email, ct.phone, c.name AS company
FROM   contacts ct
LEFT   JOIN companies c ON c.id = ct.company_id
WHERE  ct.first_name LIKE '%' + @q + '%'
    OR ct.last_name  LIKE '%' + @q + '%'
    OR ct.email      LIKE '%' + @q + '%'
    OR ct.phone      LIKE '%' + @q + '%';
GO

-- Decision makers across all companies
SELECT ct.id,
       ct.first_name + ' ' + ISNULL(ct.last_name,'') AS full_name,
       ct.designation, ct.email, ct.phone,
       c.name AS company
FROM   contacts ct
JOIN   companies c ON c.id = ct.company_id
WHERE  ct.decision_maker = 1 AND ct.status = 'Active'
ORDER  BY c.name;
GO

-- Customer groups with member count
SELECT cg.id, cg.name, cg.description, cg.color,
       COUNT(cgm.contact_id) AS member_count,
       u.first_name + ' ' + u.last_name AS created_by
FROM   customer_groups cg
LEFT   JOIN contact_group_members cgm ON cgm.group_id = cg.id
LEFT   JOIN users u ON u.id = cg.created_by
GROUP  BY cg.id, cg.name, cg.description, cg.color, u.first_name, u.last_name
ORDER  BY member_count DESC;
GO

-- ============================================================
-- ██  10. LEADS
-- ============================================================

-- All leads with AI score and assigned user
SELECT l.id, l.lead_no, l.first_name, l.last_name,
       l.company_name, l.email, l.phone,
       l.source, l.status, l.rating,
       als.score AS ai_score,
       als.grade AS ai_grade,
       l.created_at,
       u.first_name + ' ' + u.last_name AS assigned_to
FROM   leads l
LEFT   JOIN ai_lead_scores als ON als.lead_id = l.id
LEFT   JOIN users u            ON u.id = l.assigned_to
WHERE  l.status NOT IN ('Converted','Lost')
ORDER  BY als.score DESC, l.created_at DESC;
GO

-- Leads by source breakdown
SELECT l.source,
       COUNT(*)                                          AS total,
       SUM(CASE WHEN l.status='Qualified' THEN 1 END)   AS qualified,
       SUM(CASE WHEN l.status='Converted' THEN 1 END)   AS converted,
       ROUND(AVG(CAST(als.score AS FLOAT)), 1)          AS avg_ai_score
FROM   leads l
LEFT   JOIN ai_lead_scores als ON als.lead_id = l.id
GROUP  BY l.source
ORDER  BY total DESC;
GO

-- Leads assigned to a specific user
SELECT l.id, l.lead_no, l.first_name, l.last_name,
       l.company_name, l.email, l.status, l.rating,
       als.score AS ai_score, l.created_at
FROM   leads l
LEFT   JOIN ai_lead_scores als ON als.lead_id = l.id
WHERE  l.assigned_to = @user_id
  AND  l.status NOT IN ('Converted','Lost')
ORDER  BY als.score DESC;
GO

-- Hot leads (ai_score >= 75, status New/Contacted)
SELECT l.id, l.lead_no,
       l.first_name + ' ' + ISNULL(l.last_name,'') AS name,
       l.company_name, l.email, l.phone,
       als.score, als.grade,
       l.source, l.created_at
FROM   leads l
JOIN   ai_lead_scores als ON als.lead_id = l.id
WHERE  als.score >= 75
  AND  l.status IN ('New','Contacted')
ORDER  BY als.score DESC;
GO

-- Lead conversion rate by assigned user (last 90 days)
SELECT u.first_name + ' ' + u.last_name               AS rep_name,
       COUNT(l.id)                                     AS total_leads,
       SUM(CASE WHEN l.status='Converted' THEN 1 END)  AS converted,
       ROUND(
         SUM(CASE WHEN l.status='Converted' THEN 1.0 END)
         / NULLIF(COUNT(l.id),0) * 100, 1)             AS conversion_rate_pct
FROM   leads l
JOIN   users u ON u.id = l.assigned_to
WHERE  l.created_at >= DATEADD(DAY, -90, CAST(GETUTCDATE() AS DATE))
GROUP  BY l.assigned_to, u.first_name, u.last_name
ORDER  BY conversion_rate_pct DESC;
GO

-- Duplicate leads detection (same email)
-- Note: No GROUP_CONCAT in T-SQL — use STRING_AGG (SQL Server 2017+)
SELECT email,
       COUNT(*)                                                    AS dup_count,
       STRING_AGG(CAST(id AS NVARCHAR(20)), ',') WITHIN GROUP (ORDER BY id) AS lead_ids,
       STRING_AGG(first_name + ' ' + ISNULL(last_name,''), ',')
           WITHIN GROUP (ORDER BY id)                             AS names
FROM   leads
WHERE  email IS NOT NULL AND email <> ''
GROUP  BY email
HAVING COUNT(*) > 1;
GO

-- Duplicate leads detection (same phone)
SELECT phone,
       COUNT(*)                                                    AS dup_count,
       STRING_AGG(CAST(id AS NVARCHAR(20)), ',') WITHIN GROUP (ORDER BY id) AS lead_ids,
       STRING_AGG(first_name + ' ' + ISNULL(last_name,''), ',')
           WITHIN GROUP (ORDER BY id)                             AS names
FROM   leads
WHERE  phone IS NOT NULL AND phone <> ''
GROUP  BY phone
HAVING COUNT(*) > 1;
GO

-- ============================================================
-- ██  11. OPPORTUNITIES
-- ============================================================

-- Full pipeline with company and contact
SELECT o.id, o.opp_no, o.title,
       o.stage, o.amount, o.currency, o.probability,
       o.expected_close, o.actual_close,
       ROUND(o.amount * o.probability / 100.0, 2) AS weighted_value,
       c.name  AS company,
       ct.first_name + ' ' + ISNULL(ct.last_name,'') AS contact_name,
       u.first_name  + ' ' + u.last_name              AS assigned_to,
       o.created_at
FROM   opportunities o
JOIN   companies c  ON c.id  = o.company_id
LEFT   JOIN contacts ct ON ct.id = o.contact_id
LEFT   JOIN users    u  ON u.id  = o.assigned_to
WHERE  o.stage NOT IN ('Closed Won','Closed Lost')
ORDER  BY o.expected_close ASC;
GO

-- Pipeline summary by stage
SELECT stage,
       COUNT(*)    AS deal_count,
       SUM(amount) AS total_value,
       ROUND(SUM(amount * probability / 100.0), 2) AS weighted_value,
       ROUND(AVG(CAST(probability AS FLOAT)), 1)    AS avg_probability
FROM   opportunities
WHERE  stage NOT IN ('Closed Won','Closed Lost')
GROUP  BY stage
ORDER  BY CASE stage
    WHEN 'Prospecting'    THEN 1
    WHEN 'Qualification'  THEN 2
    WHEN 'Needs Analysis' THEN 3
    WHEN 'Proposal'       THEN 4
    WHEN 'Negotiation'    THEN 5
    ELSE 6 END;
GO

-- Won vs Lost this quarter
SELECT
  SUM(CASE WHEN stage='Closed Won'  THEN 1 END) AS won_count,
  SUM(CASE WHEN stage='Closed Lost' THEN 1 END) AS lost_count,
  SUM(CASE WHEN stage='Closed Won'  THEN amount END) AS won_value,
  ROUND(
    SUM(CASE WHEN stage='Closed Won' THEN 1.0 END)
    / NULLIF(SUM(CASE WHEN stage IN ('Closed Won','Closed Lost') THEN 1 END),0) * 100
  ,1) AS win_rate_pct
FROM opportunities
WHERE actual_close >= DATEADD(MONTH, DATEDIFF(MONTH,0,GETUTCDATE())-2, 0)
  AND actual_close <= EOMONTH(GETUTCDATE());
GO

-- Deals closing this month
SELECT o.id, o.opp_no, o.title, o.amount, o.stage,
       o.expected_close, o.probability,
       c.name AS company,
       u.first_name + ' ' + u.last_name AS assigned_to
FROM   opportunities o
JOIN   companies c ON c.id = o.company_id
LEFT   JOIN users u ON u.id = o.assigned_to
WHERE  o.expected_close BETWEEN CAST(DATEADD(DAY,1-DAY(GETUTCDATE()), CAST(GETUTCDATE() AS DATE)) AS DATE)
                            AND CAST(EOMONTH(GETUTCDATE()) AS DATE)
  AND  o.stage NOT IN ('Closed Won','Closed Lost')
ORDER  BY o.expected_close;
GO

-- Overdue opportunities (past expected close, still open)
SELECT o.id, o.opp_no, o.title, o.amount, o.stage,
       o.expected_close,
       DATEDIFF(DAY, o.expected_close, CAST(GETUTCDATE() AS DATE)) AS days_overdue,
       c.name AS company,
       u.first_name + ' ' + u.last_name AS assigned_to
FROM   opportunities o
JOIN   companies c ON c.id = o.company_id
LEFT   JOIN users u ON u.id = o.assigned_to
WHERE  o.expected_close < CAST(GETUTCDATE() AS DATE)
  AND  o.stage NOT IN ('Closed Won','Closed Lost')
ORDER  BY days_overdue DESC;
GO

-- Stage history for one opportunity
SELECT osh.from_stage, osh.to_stage,
       u.first_name + ' ' + u.last_name AS changed_by,
       osh.notes, osh.changed_at
FROM   opportunity_stage_history osh
LEFT   JOIN users u ON u.id = osh.changed_by
WHERE  osh.opportunity_id = @opp_id
ORDER  BY osh.changed_at;
GO

-- Sales rep performance (last 365 days)
SELECT u.first_name + ' ' + u.last_name AS rep,
       COUNT(o.id)                      AS total_opps,
       SUM(CASE WHEN o.stage='Closed Won' THEN 1 END)        AS won,
       SUM(CASE WHEN o.stage='Closed Won' THEN o.amount END)  AS revenue,
       ROUND(AVG(CASE WHEN o.stage='Closed Won'
             THEN CAST(DATEDIFF(DAY, o.created_at, o.actual_close) AS FLOAT)
             END), 0)                   AS avg_cycle_days
FROM   opportunities o
JOIN   users u ON u.id = o.assigned_to
WHERE  o.created_at >= DATEADD(DAY, -365, GETUTCDATE())
GROUP  BY o.assigned_to, u.first_name, u.last_name
ORDER  BY revenue DESC;
GO

-- ============================================================
-- ██  12. ACTIVITIES – CALLS
-- ============================================================

-- All calls with entity info
SELECT cl.id, cl.subject, cl.direction, cl.status,
       cl.entity_type, cl.entity_id, cl.call_datetime,
       -- Format seconds as HH:MM:SS
       RIGHT('0'+CAST(cl.duration_sec/3600 AS NVARCHAR),2)+':'+
       RIGHT('0'+CAST((cl.duration_sec%3600)/60 AS NVARCHAR),2)+':'+
       RIGHT('0'+CAST(cl.duration_sec%60 AS NVARCHAR),2)       AS duration,
       cl.outcome,
       u.first_name + ' ' + u.last_name AS assigned_to
FROM   calls cl
LEFT   JOIN users u ON u.id = cl.assigned_to
ORDER  BY cl.call_datetime DESC;
GO

-- Call log for a specific entity
SELECT cl.id, cl.subject, cl.direction, cl.status,
       cl.call_datetime,
       RIGHT('0'+CAST(cl.duration_sec/3600 AS NVARCHAR),2)+':'+
       RIGHT('0'+CAST((cl.duration_sec%3600)/60 AS NVARCHAR),2)+':'+
       RIGHT('0'+CAST(cl.duration_sec%60 AS NVARCHAR),2)       AS duration,
       cl.outcome,
       u.first_name + ' ' + u.last_name AS agent
FROM   calls cl
LEFT   JOIN users u ON u.id = cl.assigned_to
WHERE  cl.entity_type = @entity_type AND cl.entity_id = @entity_id
ORDER  BY cl.call_datetime DESC;
GO

-- Call stats by rep (this month)
SELECT u.first_name + ' ' + u.last_name              AS rep,
       COUNT(*)                                       AS total_calls,
       SUM(CASE WHEN direction='Inbound'  THEN 1 END) AS inbound,
       SUM(CASE WHEN direction='Outbound' THEN 1 END) AS outbound,
       SUM(CASE WHEN status='Completed'   THEN 1 END) AS completed,
       SUM(CASE WHEN status='No Answer'   THEN 1 END) AS no_answer,
       ROUND(AVG(CAST(duration_sec AS FLOAT))/60, 1)  AS avg_duration_min
FROM   calls cl
JOIN   users u ON u.id = cl.assigned_to
WHERE  cl.call_datetime >= DATEADD(DAY, 1-DAY(GETUTCDATE()),
                           CAST(GETUTCDATE() AS DATE))
GROUP  BY cl.assigned_to, u.first_name, u.last_name
ORDER  BY total_calls DESC;
GO

-- ============================================================
-- ██  13. ACTIVITIES – MEETINGS
-- ============================================================

-- All upcoming meetings
SELECT m.id, m.title, m.status,
       m.entity_type, m.entity_id,
       m.start_datetime, m.end_datetime,
       m.location, m.meeting_url,
       DATEDIFF(MINUTE, m.start_datetime, m.end_datetime) AS duration_min,
       u.first_name + ' ' + u.last_name AS organizer
FROM   meetings m
LEFT   JOIN users u ON u.id = m.created_by
WHERE  m.start_datetime >= GETUTCDATE()
  AND  m.status = 'Scheduled'
ORDER  BY m.start_datetime;
GO

-- Meetings with attendee list (STRING_AGG requires SQL Server 2017+)
SELECT m.id, m.title, m.start_datetime,
       STRING_AGG(DISTINCT u.first_name  + ' ' + u.last_name,  ', ')
           AS internal_attendees,
       STRING_AGG(DISTINCT ct.first_name + ' ' + ISNULL(ct.last_name,''), ', ')
           AS external_attendees
FROM   meetings m
LEFT   JOIN meeting_attendees ma ON ma.meeting_id = m.id
LEFT   JOIN users    u  ON u.id  = ma.user_id
LEFT   JOIN contacts ct ON ct.id = ma.contact_id
WHERE  m.id = @meeting_id
GROUP  BY m.id, m.title, m.start_datetime;
GO

-- ============================================================
-- ██  14. ACTIVITIES – FOLLOW-UPS
-- ============================================================

-- All pending follow-ups with overdue flag
SELECT f.id, f.subject, f.type, f.priority, f.status,
       f.entity_type, f.entity_id, f.due_date,
       CASE WHEN f.due_date < GETUTCDATE() AND f.status='Pending'
            THEN 'Overdue' ELSE f.status END  AS actual_status,
       DATEDIFF(DAY, CAST(GETUTCDATE() AS DATE), CAST(f.due_date AS DATE)) AS days_until_due,
       u.first_name + ' ' + u.last_name AS assigned_to
FROM   followups f
LEFT   JOIN users u ON u.id = f.assigned_to
WHERE  f.status IN ('Pending','Overdue')
ORDER  BY f.due_date ASC;
GO

-- Today's follow-ups for a user
SELECT f.id, f.subject, f.type, f.priority,
       f.entity_type, f.entity_id, f.due_date, f.notes
FROM   followups f
WHERE  f.assigned_to = @user_id
  AND  CAST(f.due_date AS DATE) = CAST(GETUTCDATE() AS DATE)
  AND  f.status = 'Pending'
ORDER  BY f.priority DESC, f.due_date;
GO

-- Overdue follow-ups
SELECT f.id, f.subject, f.type,
       f.due_date,
       DATEDIFF(DAY, CAST(f.due_date AS DATE), CAST(GETUTCDATE() AS DATE)) AS days_overdue,
       f.entity_type, f.entity_id,
       u.first_name + ' ' + u.last_name AS assigned_to
FROM   followups f
JOIN   users u ON u.id = f.assigned_to
WHERE  f.due_date < GETUTCDATE() AND f.status = 'Pending'
ORDER  BY days_overdue DESC;
GO

-- ============================================================
-- ██  15. COMMUNICATION HISTORY
-- ============================================================

-- Full communication history for an entity
SELECT ch.id, ch.channel, ch.direction, ch.subject,
       ch.status, ch.duration_sec,
       ch.occurred_at,
       u.first_name + ' ' + u.last_name AS handled_by
FROM   communication_history ch
LEFT   JOIN users u ON u.id = ch.handled_by
WHERE  ch.entity_type = @entity_type AND ch.entity_id = @entity_id
ORDER  BY ch.occurred_at DESC;
GO

-- All comms across all entities (timeline, last 30 days)
SELECT TOP 100
       ch.id, ch.channel, ch.direction, ch.subject,
       ch.entity_type, ch.entity_id, ch.occurred_at, ch.status,
       u.first_name + ' ' + u.last_name AS handled_by
FROM   communication_history ch
LEFT   JOIN users u ON u.id = ch.handled_by
WHERE  ch.occurred_at >= DATEADD(DAY, -30, GETUTCDATE())
ORDER  BY ch.occurred_at DESC;
GO

-- Channel breakdown stats (last 30 days)
SELECT channel,
       COUNT(*)                                          AS total,
       SUM(CASE WHEN direction='Inbound'  THEN 1 END)   AS inbound,
       SUM(CASE WHEN direction='Outbound' THEN 1 END)   AS outbound
FROM   communication_history
WHERE  occurred_at >= DATEADD(DAY, -30, GETUTCDATE())
GROUP  BY channel
ORDER  BY total DESC;
GO

-- ============================================================
-- ██  16. NOTES
-- ============================================================

-- Notes for a specific entity
SELECT n.id, n.title, n.content, n.tags, n.is_pinned,
       u.first_name + ' ' + u.last_name AS created_by,
       n.created_at, n.updated_at
FROM   notes n
LEFT   JOIN users u ON u.id = n.created_by
WHERE  n.entity_type = @entity_type AND n.entity_id = @entity_id
ORDER  BY n.is_pinned DESC, n.created_at DESC;
GO

-- All notes search
SELECT TOP 50
       n.id, n.entity_type, n.entity_id, n.title,
       n.content, n.tags, n.is_pinned, n.created_at
FROM   notes n
WHERE  n.title   LIKE '%' + @q + '%'
    OR n.content LIKE '%' + @q + '%'
ORDER  BY n.is_pinned DESC, n.created_at DESC;
GO

-- ============================================================
-- ██  17. ATTACHMENTS
-- ============================================================

-- Attachments for a specific entity
SELECT a.id, a.file_name, a.file_path, a.file_size,
       a.mime_type, a.category,
       u.first_name + ' ' + u.last_name AS uploaded_by,
       a.created_at
FROM   attachments a
LEFT   JOIN users u ON u.id = a.uploaded_by
WHERE  a.entity_type = @entity_type AND a.entity_id = @entity_id
ORDER  BY a.created_at DESC;
GO

-- All attachments grouped by type
SELECT entity_type,
       COUNT(*)                                          AS file_count,
       SUM(file_size)                                    AS total_bytes,
       ROUND(SUM(CAST(file_size AS FLOAT))/1048576, 1)  AS total_mb
FROM   attachments
GROUP  BY entity_type;
GO

-- ============================================================
-- ██  18. RELATIONSHIP MAPPING
-- ============================================================

-- All active relationships
SELECT r.id, r.source_type, r.source_id, r.relation_type,
       r.target_type, r.target_id, r.created_at
FROM   relationships r
WHERE  r.is_active = 1
ORDER  BY r.source_type, r.source_id;
GO

-- All relationships for a specific entity (both directions)
SELECT r.id, r.relation_type,
       r.source_type, r.source_id,
       r.target_type, r.target_id
FROM   relationships r
WHERE  r.is_active = 1
  AND  ((r.source_type = @type AND r.source_id = @id)
     OR (r.target_type = @type AND r.target_id = @id));
GO

-- ============================================================
-- ██  19. CAMPAIGNS
-- ============================================================

-- All campaigns with live stats
SELECT c.id, c.name, c.type, c.status,
       c.budget, c.spent, c.start_date, c.end_date,
       cs.sent, cs.delivered, cs.opened, cs.clicked,
       cs.converted, cs.bounced, cs.unsubscribed,
       ROUND(CAST(cs.opened    AS FLOAT) / NULLIF(cs.delivered,0)*100, 1) AS open_rate_pct,
       ROUND(CAST(cs.clicked   AS FLOAT) / NULLIF(cs.opened,0)   *100, 1) AS ctr_pct,
       ROUND(CAST(cs.converted AS FLOAT) / NULLIF(cs.clicked,0)  *100, 1) AS conv_rate_pct,
       ROUND(CAST(cs.bounced   AS FLOAT) / NULLIF(cs.sent,0)     *100, 1) AS bounce_rate_pct,
       u.first_name + ' ' + u.last_name AS created_by
FROM   campaigns c
LEFT   JOIN campaign_stats cs ON cs.campaign_id = c.id
LEFT   JOIN users u ON u.id = c.created_by
ORDER  BY c.created_at DESC;
GO

-- Campaign performance by channel
SELECT c.type AS channel,
       COUNT(*)                AS total_campaigns,
       SUM(cs.sent)            AS total_sent,
       ROUND(AVG(CAST(cs.opened   AS FLOAT)/NULLIF(cs.delivered,0)*100),1) AS avg_open_rate,
       ROUND(AVG(CAST(cs.clicked  AS FLOAT)/NULLIF(cs.opened,0)   *100),1) AS avg_ctr,
       SUM(cs.converted)       AS total_conversions,
       SUM(c.revenue)          AS total_revenue
FROM   campaigns c
LEFT   JOIN campaign_stats cs ON cs.campaign_id = c.id
GROUP  BY c.type;
GO

-- Active campaigns with budget usage and days remaining
SELECT c.id, c.name, c.type, c.budget, c.spent,
       ROUND(c.spent/NULLIF(c.budget,0)*100,1)  AS budget_used_pct,
       c.end_date,
       DATEDIFF(DAY, CAST(GETUTCDATE() AS DATE), c.end_date) AS days_remaining
FROM   campaigns c
WHERE  c.status = 'Active'
ORDER  BY c.end_date;
GO

-- Campaign recipients status breakdown
SELECT c.name AS campaign,
       cr.status,
       COUNT(*) AS cnt
FROM   campaign_recipients cr
JOIN   campaigns c ON c.id = cr.campaign_id
WHERE  c.id = @campaign_id
GROUP  BY c.name, cr.status;
GO

-- ============================================================
-- ██  20. DOCUMENTS
-- ============================================================

-- All documents with related entity
SELECT d.id, d.doc_no, d.doc_type, d.title, d.status,
       d.value, d.valid_until,
       d.entity_type, d.entity_id,
       o.title  AS opportunity_title,
       u.first_name + ' ' + u.last_name AS created_by,
       d.created_at
FROM   documents d
LEFT   JOIN opportunities o ON o.id = d.opportunity_id
LEFT   JOIN users u ON u.id = d.created_by
ORDER  BY d.created_at DESC;
GO

-- Documents for a specific entity
SELECT d.id, d.doc_no, d.doc_type, d.title, d.status, d.value, d.created_at
FROM   documents d
WHERE  d.entity_type = @entity_type AND d.entity_id = @entity_id
ORDER  BY d.created_at DESC;
GO

-- Quotation / Proposal with line items and running totals
SELECT d.id, d.doc_no, d.title,
       li.sort_order, li.item_code, li.description,
       li.quantity, li.unit, li.unit_price,
       li.discount_pct, li.tax_rate,
       li.amount                                        AS line_total,
       SUM(li.amount)             OVER (PARTITION BY d.id) AS subtotal,
       SUM(li.amount*li.tax_rate/100.0) OVER (PARTITION BY d.id) AS total_tax,
       SUM(li.amount + li.amount*li.tax_rate/100.0)
                                  OVER (PARTITION BY d.id) AS grand_total
FROM   documents d
JOIN   document_line_items li ON li.document_id = d.id
WHERE  d.id = @doc_id
ORDER  BY li.sort_order;
GO

-- Pending signatures
SELECT d.id, d.doc_no, d.title, d.doc_type,
       ds.signer_name, ds.signer_email, ds.signer_role,
       ds.status AS sign_status, ds.created_at
FROM   document_signatures ds
JOIN   documents d ON d.id = ds.document_id
WHERE  ds.status = 'Pending'
ORDER  BY ds.created_at;
GO

-- ============================================================
-- ██  21. OCR DOCUMENTS
-- ============================================================

-- All OCR documents
SELECT id, file_name, doc_type, status, confidence,
       extracted_data, uploaded_by, processed_at, created_at
FROM   ocr_documents
ORDER  BY created_at DESC;
GO

-- Unprocessed OCR queue
SELECT id, file_name, doc_type, created_at
FROM   ocr_documents
WHERE  status IN ('Queued','Processing')
ORDER  BY created_at;
GO

-- ============================================================
-- ██  22. BULK IMPORT
-- ============================================================

-- Import history
SELECT bi.id, bi.import_type, bi.file_name,
       bi.total_rows, bi.imported, bi.skipped, bi.failed, bi.duplicates,
       bi.status,
       u.first_name + ' ' + u.last_name AS imported_by,
       bi.started_at, bi.completed_at,
       DATEDIFF(SECOND, bi.started_at, bi.completed_at) AS duration_sec
FROM   bulk_imports bi
LEFT   JOIN users u ON u.id = bi.imported_by
ORDER  BY bi.created_at DESC;
GO

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
GO

-- ============================================================
-- ██  24. AI LEAD SCORES
-- ============================================================

-- Score distribution
SELECT grade,
       COUNT(*)                          AS lead_count,
       ROUND(AVG(CAST(score AS FLOAT)),1) AS avg_score,
       MIN(score)                        AS min_score,
       MAX(score)                        AS max_score
FROM   ai_lead_scores
GROUP  BY grade
ORDER  BY CASE grade WHEN 'A' THEN 1 WHEN 'B' THEN 2
                     WHEN 'C' THEN 3 WHEN 'D' THEN 4 ELSE 5 END;
GO

-- Top 10 hot leads
SELECT TOP 10
       l.id, l.lead_no,
       l.first_name + ' ' + ISNULL(l.last_name,'') AS name,
       l.company_name, l.email, l.source,
       als.score, als.grade, als.factors
FROM   ai_lead_scores als
JOIN   leads l ON l.id = als.lead_id
WHERE  l.status NOT IN ('Converted','Lost')
ORDER  BY als.score DESC;
GO

-- ============================================================
-- ██  25. AUDIT LOG
-- ============================================================

-- Recent activity log (last 200 rows)
SELECT TOP 200
       al.id, al.action, al.entity_type, al.entity_id,
       al.old_values, al.new_values,
       al.ip_address, al.occurred_at,
       u.first_name + ' ' + u.last_name AS user_name
FROM   audit_logs al
LEFT   JOIN users u ON u.id = al.user_id
ORDER  BY al.occurred_at DESC;
GO

-- Audit for a specific record
SELECT al.action,
       u.first_name + ' ' + u.last_name AS done_by,
       al.old_values, al.new_values, al.occurred_at
FROM   audit_logs al
LEFT   JOIN users u ON u.id = al.user_id
WHERE  al.entity_type = @entity_type AND al.entity_id = @entity_id
ORDER  BY al.occurred_at DESC;
GO

-- ============================================================
-- ██  26. DASHBOARD – KPI QUERIES
-- ============================================================

-- Dashboard summary numbers (single-row snapshot)
SELECT
  (SELECT COUNT(*) FROM leads
   WHERE  status NOT IN ('Converted','Lost')
     AND  created_at >= DATEADD(DAY, 1-DAY(GETUTCDATE()),
                        CAST(GETUTCDATE() AS DATE)))            AS new_leads_this_month,

  (SELECT COUNT(*) FROM leads
   WHERE  status = 'Converted'
     AND  converted_at >= DATEADD(DAY, 1-DAY(GETUTCDATE()),
                          CAST(GETUTCDATE() AS DATE)))          AS conversions_this_month,

  (SELECT COUNT(*) FROM opportunities
   WHERE  stage NOT IN ('Closed Won','Closed Lost'))            AS open_opportunities,

  (SELECT ROUND(SUM(amount * probability/100.0),0)
   FROM   opportunities
   WHERE  stage NOT IN ('Closed Won','Closed Lost'))            AS weighted_pipeline,

  (SELECT SUM(amount) FROM opportunities
   WHERE  stage='Closed Won'
     AND  actual_close >= DATEADD(DAY, 1-DAY(GETUTCDATE()),
                          CAST(GETUTCDATE() AS DATE)))          AS revenue_this_month,

  (SELECT COUNT(*) FROM followups
   WHERE  status='Pending' AND due_date < GETUTCDATE())         AS overdue_followups,

  (SELECT COUNT(*) FROM campaigns WHERE status='Active')        AS active_campaigns,

  (SELECT COUNT(*) FROM document_signatures WHERE status='Pending') AS pending_signatures;
GO

-- Monthly revenue trend (last 12 months)
SELECT FORMAT(actual_close,'yyyy-MM')    AS month,
       COUNT(*)                          AS deals_closed,
       SUM(amount)                       AS revenue
FROM   opportunities
WHERE  stage = 'Closed Won'
  AND  actual_close >= DATEADD(MONTH, -12, GETUTCDATE())
GROUP  BY FORMAT(actual_close,'yyyy-MM')
ORDER  BY month;
GO

-- Lead source performance (last 90 days)
SELECT l.source,
       COUNT(l.id)                                                  AS total_leads,
       SUM(CASE WHEN l.status='Converted' THEN 1 ELSE 0 END)        AS converted,
       ROUND(SUM(CASE WHEN l.status='Converted' THEN 1.0 ELSE 0 END)
             / NULLIF(COUNT(l.id),0)*100, 1)                        AS conv_rate_pct,
       ROUND(AVG(CAST(als.score AS FLOAT)),1)                        AS avg_ai_score
FROM   leads l
LEFT   JOIN ai_lead_scores als ON als.lead_id = l.id
WHERE  l.created_at >= DATEADD(DAY, -90, GETUTCDATE())
GROUP  BY l.source
ORDER  BY total_leads DESC;
GO

-- Activities summary today
SELECT
  (SELECT COUNT(*) FROM calls
   WHERE  CAST(call_datetime AS DATE) = CAST(GETUTCDATE() AS DATE))  AS calls_today,

  (SELECT COUNT(*) FROM meetings
   WHERE  CAST(start_datetime AS DATE) = CAST(GETUTCDATE() AS DATE)) AS meetings_today,

  (SELECT COUNT(*) FROM followups
   WHERE  CAST(due_date AS DATE) = CAST(GETUTCDATE() AS DATE)
     AND  status = 'Pending')                                         AS followups_today,

  (SELECT COUNT(*) FROM email_logs
   WHERE  CAST(sent_at AS DATE) = CAST(GETUTCDATE() AS DATE)
     AND  direction = 'Outbound')                                     AS emails_sent_today;
GO

-- ============================================================
-- ██  27. CRUD – INSERT / UPDATE TEMPLATES
-- ============================================================

-- Insert a new lead
INSERT INTO leads (lead_no, first_name, last_name, company_name, email,
                   phone, source, status, rating, assigned_to, created_by)
VALUES (@lead_no, @first_name, @last_name, @company_name, @email,
        @phone, @source, 'New', @rating, @assigned_to, @created_by);
GO

-- Insert a new contact
INSERT INTO contacts (company_id, first_name, last_name, email, phone,
                      mobile, designation, decision_maker, assigned_to, created_by)
VALUES (@company_id, @first_name, @last_name, @email, @phone,
        @mobile, @designation, @decision_maker, @assigned_to, @created_by);
GO

-- Insert a new company
INSERT INTO companies (parent_company_id, name, type, industry, email, phone,
                       gstin, category_id, assigned_to, status, created_by)
VALUES (@parent_company_id, @name, @type, @industry, @email, @phone,
        @gstin, @category_id, @assigned_to, 'Active', @created_by);
GO

-- Insert a new opportunity
INSERT INTO opportunities (opp_no, title, company_id, contact_id, assigned_to,
                           stage, amount, probability, expected_close, created_by)
VALUES (@opp_no, @title, @company_id, @contact_id, @assigned_to,
        'Prospecting', @amount, @probability, @expected_close, @created_by);
GO

-- Insert a follow-up
INSERT INTO followups (subject, entity_type, entity_id, type, priority,
                       status, due_date, assigned_to, notes, created_by)
VALUES (@subject, @entity_type, @entity_id, @type, @priority,
        'Pending', @due_date, @assigned_to, @notes, @created_by);
GO

-- Insert a note
INSERT INTO notes (entity_type, entity_id, title, content, tags, is_pinned, created_by)
VALUES (@entity_type, @entity_id, @title, @content, @tags, @is_pinned, @created_by);
GO

-- ============================================================
-- Convert lead → contact + company + opportunity
-- SQL Server uses BEGIN TRAN / COMMIT TRAN (no START TRANSACTION)
-- ============================================================
BEGIN TRAN;
BEGIN TRY

    -- 1. Insert contact from lead
    INSERT INTO contacts (company_id, first_name, last_name, email, phone,
                          designation, assigned_to, created_by)
    SELECT @new_company_id, first_name, last_name, email, phone,
           designation, assigned_to, assigned_to
    FROM   leads
    WHERE  id = @lead_id;

    DECLARE @new_contact_id INT = SCOPE_IDENTITY();

    -- 2. Insert opportunity
    INSERT INTO opportunities (opp_no, title, company_id, contact_id,
                               assigned_to, stage, amount, expected_close, created_by)
    VALUES (@opp_no, @opp_title, @new_company_id, @new_contact_id,
            @assigned_to, 'Prospecting', @amount, @exp_close, @assigned_to);

    DECLARE @new_opp_id INT = SCOPE_IDENTITY();

    -- 3. Mark lead as converted
    UPDATE leads
    SET    status                    = 'Converted',
           converted_at              = GETUTCDATE(),
           converted_to_contact      = @new_contact_id,
           converted_to_opportunity  = @new_opp_id
    WHERE  id = @lead_id;

    COMMIT TRAN;
END TRY
BEGIN CATCH
    ROLLBACK TRAN;
    THROW;
END CATCH;
GO
