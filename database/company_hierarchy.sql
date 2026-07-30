-- ============================================================
--  SanCRM – Single Company Hierarchy Table
--  Covers all 3 levels in ONE table:
--    level 1 = Parent Company (Group / Holding)
--    level 2 = Company        (Operating Entity)
--    level 3 = Branch         (Office / Warehouse)
--
--  Uses adjacency-list pattern: parent_id points to
--  the row one level above in the same table.
-- ============================================================
USE sancrm;
GO

-- ============================================================
-- DROP & CREATE
-- ============================================================
IF OBJECT_ID('company_hierarchy', 'U') IS NOT NULL
    DROP TABLE company_hierarchy;
GO

CREATE TABLE company_hierarchy (
    -- ── Identity ────────────────────────────────────────────
    id              INT IDENTITY(1,1) PRIMARY KEY,
    parent_id       INT           NULL,          -- NULL = top-level (Parent Company)

    -- ── Hierarchy Level ─────────────────────────────────────
    fac_level       TINYINT       NOT NULL       -- 1=Parent Company, 2=Company, 3=Branch
                    CHECK (fac_level IN (1, 2, 3)),
    level_label     AS (
                      CASE fac_level
                        WHEN 1 THEN 'Parent Company'
                        WHEN 2 THEN 'Company'
                        WHEN 3 THEN 'Branch'
                      END
                    ),                           -- computed, no storage needed

    -- ── Core Identity ───────────────────────────────────────
    code            NVARCHAR(30)  NULL,          -- e.g. GRP-001, COM-001, BRN-001
    name            NVARCHAR(200) NOT NULL,
    legal_name      NVARCHAR(200) NULL,
    trade_name      NVARCHAR(200) NULL,

    -- ── Classification ──────────────────────────────────────
    type            NVARCHAR(30)  NULL
                    CHECK (type IS NULL OR type IN
                      ('Customer','Prospect','Lead','Partner','Vendor','Internal')),
    branch_type     NVARCHAR(30)  NULL
                    CHECK (branch_type IS NULL OR branch_type IN
                      ('Headquarters','Regional Office','Branch','Warehouse','Factory')),
    industry        NVARCHAR(100) NULL,
    category_id     INT           NULL,          -- FK to customer_categories

    -- ── Contact Info ────────────────────────────────────────
    email           NVARCHAR(150) NULL,
    phone           NVARCHAR(20)  NULL,
    phone_alt       NVARCHAR(20)  NULL,
    website         NVARCHAR(300) NULL,

    -- ── Address ─────────────────────────────────────────────
    address_line1   NVARCHAR(255) NULL,
    address_line2   NVARCHAR(255) NULL,
    city            NVARCHAR(100) NULL,
    state           NVARCHAR(100) NULL,
    pincode         NVARCHAR(15)  NULL,
    country         NVARCHAR(100) NOT NULL DEFAULT 'India',

    -- ── Tax / Compliance ────────────────────────────────────
    gstin           NVARCHAR(20)  NULL,
    pan             NVARCHAR(15)  NULL,
    tan             NVARCHAR(15)  NULL,
    gst_state_code  NVARCHAR(5)   NULL,
    gst_reg_type    NVARCHAR(20)  NULL
                    CHECK (gst_reg_type IS NULL OR gst_reg_type IN
                      ('Regular','Composition','Unregistered')),
    gst_verified    BIT           NOT NULL DEFAULT 0,

    -- ── Financials (Company/Parent level) ───────────────────
    annual_revenue  DECIMAL(18,2) NULL,
    employee_count  INT           NULL,
    currency        NVARCHAR(10)  NOT NULL DEFAULT 'INR',
    credit_limit    DECIMAL(18,2) NOT NULL DEFAULT 0,
    credit_used     DECIMAL(18,2) NOT NULL DEFAULT 0,
    credit_status   NVARCHAR(20)  NOT NULL DEFAULT 'Good'
                    CHECK (credit_status IN ('Good','Warning','Exceeded','Blocked')),

    -- ── Flags ───────────────────────────────────────────────
    is_primary      BIT           NOT NULL DEFAULT 0,   -- primary branch flag
    is_hq           BIT           NOT NULL DEFAULT 0,   -- HQ flag
    status          NVARCHAR(20)  NOT NULL DEFAULT 'Active'
                    CHECK (status IN ('Active','Inactive','Blocked')),

    -- ── CRM Assignment ──────────────────────────────────────
    assigned_to     INT           NULL,
    created_by      INT           NULL,

    -- ── Audit ───────────────────────────────────────────────
    created_at      DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2     NOT NULL DEFAULT GETUTCDATE(),

    -- ── Constraints ─────────────────────────────────────────
    CONSTRAINT FK_ch_parent      FOREIGN KEY (parent_id)   REFERENCES company_hierarchy(id),
    CONSTRAINT FK_ch_category    FOREIGN KEY (category_id) REFERENCES customer_categories(id),
    CONSTRAINT FK_ch_assigned    FOREIGN KEY (assigned_to) REFERENCES users(id),
    CONSTRAINT FK_ch_created_by  FOREIGN KEY (created_by)  REFERENCES users(id),

    -- Level rules:
    -- fac_level=1 must have parent_id NULL
    -- fac_level=2 must have parent_id pointing to a level-1 row (enforced via app / trigger)
    -- fac_level=3 must have parent_id pointing to a level-2 row
    CONSTRAINT CK_ch_level1_no_parent CHECK (
        fac_level <> 1 OR parent_id IS NULL
    )
);
GO

-- Indexes
CREATE INDEX idx_ch_parent_id  ON company_hierarchy(parent_id);
CREATE INDEX idx_ch_fac_level  ON company_hierarchy(fac_level);
CREATE INDEX idx_ch_status     ON company_hierarchy(status);
CREATE INDEX idx_ch_gstin      ON company_hierarchy(gstin);
CREATE INDEX idx_ch_assigned   ON company_hierarchy(assigned_to);
GO

-- ============================================================
-- TRIGGER – keep updated_at current
-- ============================================================
CREATE TRIGGER trg_company_hierarchy_updated
ON company_hierarchy AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE company_hierarchy
    SET    updated_at = GETUTCDATE()
    WHERE  id IN (SELECT id FROM inserted);
END;
GO

-- ============================================================
-- SAMPLE DATA
-- ============================================================
INSERT INTO company_hierarchy
    (parent_id, fac_level, code, name, legal_name, type, industry,
     email, phone, website,
     address_line1, city, state, pincode, country,
     gstin, pan, gst_reg_type, gst_verified,
     annual_revenue, currency, employee_count,
     credit_limit, credit_used, credit_status,
     is_hq, status)
VALUES

-- ── Level 1: Parent Companies ────────────────────────────────
(NULL, 1, 'GRP-001', 'TechCorp Group',  'TechCorp Group Holdings Pvt Ltd', NULL, 'Technology',
 'group@techcorp.com',  '+91-22-11223344', 'www.techcorpgroup.com',
 'BKC, Bandra East', 'Mumbai', 'Maharashtra', '400051', 'India',
 NULL, 'AAATG1234A', NULL, 0,
 500000000, 'INR', 1200,
 0, 0, 'Good', 1, 'Active'),

(NULL, 1, 'GRP-002', 'MedGroup Ltd',   'MedGroup Limited',                NULL, 'Healthcare',
 'info@medgroup.in',    '+91-33-22001100', 'www.medgroup.in',
 'Salt Lake Sector V', 'Kolkata', 'West Bengal', '700091', 'India',
 NULL, 'AAABM5678B', NULL, 0,
 800000000, 'INR', 3500,
 0, 0, 'Good', 1, 'Active'),

-- ── Level 2: Companies (parent_id → level-1 rows above) ─────
-- TechCorp Group children
(1, 2, 'COM-001', 'TechCorp Ltd',    'TechCorp Limited',               'Customer', 'Technology',
 'contact@techcorp.com', '+91-22-11223344', 'www.techcorp.com',
 '4th Floor, TechCorp Tower, BKC', 'Mumbai', 'Maharashtra', '400051', 'India',
 '27AABCC1234D1Z5', 'AABCC1234D', 'Regular', 1,
 120000000, 'INR', 450,
 5000000, 2400000, 'Good', 0, 'Active'),

(1, 2, 'COM-002', 'TechCorp South',  'TechCorp South Pvt Ltd',         'Customer', 'IT Services',
 'south@techcorp.com',   '+91-80-55667788', 'www.techcorp.com',
 'Cyber City, Plot 12', 'Gurugram', 'Haryana', '122002', 'India',
 '06AABCC9012F3Z1', 'AABCC9012F', 'Regular', 1,
 45000000, 'INR', 180,
 2000000, 850000, 'Good', 0, 'Active'),

-- MedGroup child
(2, 2, 'COM-003', 'Pharma Corp',     'Pharma Corporation India Pvt Ltd','Lead',     'Pharmaceuticals',
 'contact@pharmacorp.in','+91-33-11001100', 'www.pharmacorp.in',
 'Chowringhee Road', 'Kolkata', 'West Bengal', '700020', 'India',
 '19AABCC3456G4Z8', 'AABCC3456G', 'Regular', 0,
 60000000, 'INR', 320,
 500000, 520000, 'Exceeded', 0, 'Active'),

-- Standalone company (no parent group)
(NULL, 2, 'COM-004', 'ABC Industries', 'ABC Industries Pvt Ltd',        'Prospect', 'Manufacturing',
 'info@abcind.com',      '+91-20-22334455', 'www.abcind.com',
 '23 Industrial Area Phase 2', 'Pune', 'Maharashtra', '411057', 'India',
 '27AABCC5678E2Z6', 'AABCC5678E', 'Regular', 1,
 80000000, 'INR', 650,
 1000000, 320000, 'Good', 0, 'Active'),

-- ── Level 3: Branches (parent_id → level-2 rows above) ───────
-- TechCorp Ltd branches (id=3)
(3, 3, 'BRN-001', 'TechCorp – Mumbai HQ',       NULL, NULL, NULL,
 'mumbai@techcorp.com',  '+91-22-11223344', NULL,
 'TechCorp Tower, BKC', 'Mumbai', 'Maharashtra', '400051', 'India',
 '27AABCC1234D1Z5', NULL, 'Regular', 1,
 NULL, 'INR', NULL,
 0, 0, 'Good', 1, 'Active'),

(3, 3, 'BRN-002', 'TechCorp – Pune Branch',     NULL, NULL, NULL,
 'pune@techcorp.com',    '+91-20-22334455', NULL,
 'MIDC Andheri', 'Pune', 'Maharashtra', '411028', 'India',
 '27AABCC1234D1Z6', NULL, 'Regular', 0,
 NULL, 'INR', NULL,
 0, 0, 'Good', 0, 'Active'),

(3, 3, 'BRN-003', 'TechCorp – Bangalore',       NULL, NULL, NULL,
 'blr@techcorp.com',     '+91-80-44556677', NULL,
 'Whitefield Tech Park', 'Bengaluru', 'Karnataka', '560066', 'India',
 '29AABCC1234D1Z7', NULL, 'Regular', 0,
 NULL, 'INR', NULL,
 0, 0, 'Good', 0, 'Active'),

-- TechCorp South branches (id=4)
(4, 3, 'BRN-004', 'GlobalTech – Delhi NCR',     NULL, NULL, NULL,
 'delhi@techcorp.com',   '+91-124-5566778', NULL,
 'Cyber City, Plot 12', 'Gurugram', 'Haryana', '122002', 'India',
 '06AABCC9012F3Z1', NULL, 'Regular', 1,
 NULL, 'INR', NULL,
 0, 0, 'Good', 1, 'Active'),

-- ABC Industries branches (id=6)
(6, 3, 'BRN-005', 'ABC – Ahmedabad Plant',      NULL, NULL, NULL,
 'ahm@abcind.com',       '+91-79-22334455', NULL,
 '24 GIDC Estate', 'Ahmedabad', 'Gujarat', '382330', 'India',
 '24AABCC5678E2Z1', NULL, 'Regular', 0,
 NULL, 'INR', NULL,
 0, 0, 'Good', 0, 'Inactive'),

(6, 3, 'BRN-006', 'ABC – Nashik Warehouse',     NULL, NULL, NULL,
 'nashik@abcind.com',    '+91-253-2234455', NULL,
 'MIDC Satpur', 'Nashik', 'Maharashtra', '422007', 'India',
 '27AABCC5678E2Z2', NULL, 'Regular', 0,
 NULL, 'INR', NULL,
 0, 0, 'Good', 0, 'Active');
GO

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- 1. Full hierarchy tree (all 3 levels with parent name)
SELECT
    ch.id,
    ch.fac_level,
    ch.level_label,
    ch.code,
    ch.name,
    ISNULL(p.name, '—')     AS parent_name,
    ISNULL(gp.name, '—')    AS grandparent_name,
    ch.type,
    ch.branch_type,
    ch.city,
    ch.state,
    ch.gstin,
    ch.status,
    ch.credit_limit,
    ch.credit_used,
    ch.credit_status,
    ch.created_at
FROM   company_hierarchy ch
LEFT   JOIN company_hierarchy p  ON p.id  = ch.parent_id
LEFT   JOIN company_hierarchy gp ON gp.id = p.parent_id
ORDER  BY
    ISNULL(gp.id, ISNULL(p.id, ch.id)),  -- group by top-level
    ISNULL(p.id, ch.id),                  -- then by company
    ch.fac_level,
    ch.name;
GO

-- 2. Only Parent Companies (Level 1)
SELECT id, code, name, industry, country,
       annual_revenue, employee_count, status
FROM   company_hierarchy
WHERE  fac_level = 1
ORDER  BY name;
GO

-- 3. Only Companies (Level 2) with their parent group
SELECT ch.id, ch.code, ch.name, ch.type, ch.industry,
       ch.email, ch.phone, ch.gstin,
       ch.credit_limit, ch.credit_used, ch.credit_status,
       p.name AS parent_group, ch.status
FROM   company_hierarchy ch
LEFT   JOIN company_hierarchy p ON p.id = ch.parent_id
WHERE  ch.fac_level = 2
ORDER  BY ch.name;
GO

-- 4. Only Branches (Level 3) with company and group
SELECT ch.id, ch.code, ch.name,
       ch.branch_type, ch.is_primary, ch.is_hq,
       ch.city, ch.state, ch.gstin,
       p.name  AS company_name,
       gp.name AS group_name,
       ch.status
FROM   company_hierarchy ch
LEFT   JOIN company_hierarchy p  ON p.id  = ch.parent_id
LEFT   JOIN company_hierarchy gp ON gp.id = p.parent_id
WHERE  ch.fac_level = 3
ORDER  BY p.name, ch.is_primary DESC, ch.name;
GO

-- 5. All branches under a specific company  (@company_id = level-2 row)
DECLARE @company_id INT = 3;   -- change to any level-2 id

SELECT ch.id, ch.code, ch.name, ch.branch_type,
       ch.city, ch.state, ch.phone, ch.gstin,
       ch.is_primary, ch.status
FROM   company_hierarchy ch
WHERE  ch.parent_id = @company_id
  AND  ch.fac_level = 3
ORDER  BY ch.is_primary DESC, ch.name;
GO

-- 6. Complete rollup: count companies + branches per parent group
SELECT
    pg.id, pg.name AS parent_group,
    COUNT(DISTINCT c.id)  AS total_companies,
    COUNT(DISTINCT b.id)  AS total_branches,
    SUM(c.annual_revenue) AS total_revenue,
    SUM(c.employee_count) AS total_employees
FROM   company_hierarchy pg
LEFT   JOIN company_hierarchy c ON c.parent_id = pg.id AND c.fac_level = 2
LEFT   JOIN company_hierarchy b ON b.parent_id = c.id  AND b.fac_level = 3
WHERE  pg.fac_level = 1
GROUP  BY pg.id, pg.name
ORDER  BY total_revenue DESC;
GO

-- 7. Credit utilisation across all companies
SELECT
    ch.id, ch.code, ch.name,
    p.name AS parent_group,
    ch.credit_limit,
    ch.credit_used,
    ROUND(ch.credit_used / NULLIF(ch.credit_limit,0) * 100, 1) AS used_pct,
    ch.credit_status
FROM   company_hierarchy ch
LEFT   JOIN company_hierarchy p ON p.id = ch.parent_id
WHERE  ch.fac_level = 2
  AND  ch.credit_limit > 0
ORDER  BY used_pct DESC;
GO

-- 8. Search across all levels (name / gstin / city)
DECLARE @q NVARCHAR(100) = 'Tech';   -- change search term

SELECT ch.id, ch.fac_level, ch.level_label, ch.code, ch.name,
       ch.city, ch.state, ch.gstin, ch.status,
       p.name AS parent_name
FROM   company_hierarchy ch
LEFT   JOIN company_hierarchy p ON p.id = ch.parent_id
WHERE  ch.name  LIKE '%' + @q + '%'
    OR ch.gstin LIKE '%' + @q + '%'
    OR ch.city  LIKE '%' + @q + '%'
ORDER  BY ch.fac_level, ch.name;
GO

PRINT 'company_hierarchy table, data, and queries ready.';
GO
