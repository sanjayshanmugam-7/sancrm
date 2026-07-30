# SanCRM — ASP.NET Core 8 Backend

Full-featured CRM REST API with JWT authentication, Swagger UI, business logic layer, and MySQL database.

---

## Architecture

```
SanCRM.sln
├── SanCRM.Domain          → Entities, Enums (no dependencies)
├── SanCRM.Infrastructure  → EF Core DbContext, CurrentUserService
├── SanCRM.Application     → Business logic services, DTOs, Interfaces, Validators
└── SanCRM.API             → Controllers, Middleware, Program.cs (entry point)
```

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| .NET SDK    | 8.0+    |
| MySQL       | 8.0+    |
| Node.js     | 18+     |

---

## Quick Start

### 1. Configure Database

Edit `SanCRM.API/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Port=3306;Database=sancrm;User=root;Password=YOUR_PASSWORD;CharSet=utf8mb4;"
}
```

### 2. Create the Database Schema

Run the existing SQL schema first:
```bash
mysql -u root -p < d:\SanCRM\database\crm_schema.sql
```

### 3. Run EF Core Migrations (Optional — if you want EF to manage schema)

```bash
cd d:\SanCRM\backend

# Install EF Core tools (once)
dotnet tool install --global dotnet-ef

# Create initial migration from DbContext
dotnet ef migrations add InitialCreate --project SanCRM.Infrastructure --startup-project SanCRM.API

# Apply migration to database
dotnet ef database update --project SanCRM.Infrastructure --startup-project SanCRM.API
```

### 4. Build and Run

```bash
cd d:\SanCRM\backend
dotnet restore
dotnet build
dotnet run --project SanCRM.API
```

API starts at: **http://localhost:8000**
Swagger UI at: **http://localhost:8000/swagger**

### 5. Start Frontend

```bash
cd d:\SanCRM\crm-app
npm install
npm start
```

Frontend starts at: **http://localhost:3000**

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/login | Public | Login → JWT token |
| POST | /api/v1/auth/register | Admin | Create user |
| GET  | /api/v1/auth/me | Bearer | Current user profile |
| POST | /api/v1/auth/change-password | Bearer | Change password |
| POST | /api/v1/auth/logout | Bearer | Logout |

### Leads — `/api/v1/leads`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Paginated list (filter: status, source, assignedTo, search) |
| POST | / | Create lead (auto-generates LEAD-YYYY-NNN, AI score) |
| GET | /stats | Dashboard lead stats |
| GET | /source-breakdown | Lead source analytics |
| GET | /duplicates | Detect duplicates by email/phone |
| POST | /bulk-delete | `{ ids: [] }` |
| POST | /assign | Bulk assign to user |
| POST | /import | CSV file upload |
| GET | /export | Download CSV |
| GET | /assignment-rules | List assignment rules |
| POST | /assignment-rules | Create rule |
| PUT | /assignment-rules/:id | Update rule |
| DELETE | /assignment-rules/:id | Delete rule |
| GET | /:id | Full lead detail |
| PUT | /:id | Update lead |
| DELETE | /:id | Delete lead |
| POST | /:id/merge | Merge duplicate into primary |
| POST | /:id/convert | Convert → contact/company/opportunity |
| GET | /:id/notes | Lead notes |
| POST | /:id/notes | Add note |
| GET | /:id/attachments | Attachments |
| POST | /:id/attachments | Upload file |
| GET | /:id/activities | Activities timeline |
| GET | /:id/communication-history | Comms history |
| POST | /:id/update-score | Recalculate AI score |

### Contacts — `/api/v1/contacts`
Full CRUD + groups, notes, attachments, comms, relationships

### Accounts — `/api/v1/accounts`
Full CRUD + branches, hierarchy, GST validation, credit limits, notes

### Opportunities — `/api/v1/opportunities`
Full CRUD + stage updates (with auto-history logging), AI prediction, pipeline stats, forecast

### Activities — `/api/v1/activities`
Calls, meetings, emails, follow-ups, calendar view, reminders

### Campaigns — `/api/v1/campaigns`
Full lifecycle (Draft→Active→Paused→Completed), recipients, stats, metrics

### Documents — `/api/v1/documents`
Proposals, quotations, agreements, OCR processing, e-signatures, PDF generation

### Communication — `/api/v1/communication`
History, notes, attachments (download), relationship mapping

### Dashboard — `/api/v1/dashboard`
KPI stats, revenue trend, pipeline summary, lead sources, recent activities

---

## Security

- **JWT Bearer tokens** — all endpoints require `Authorization: Bearer <token>`
- **Role-based authorization** — Admin / Manager / Sales Rep
- **BCrypt** — passwords hashed with work factor 11
- **Input validation** — FluentValidation on all create/update DTOs
- **Audit logging** — all CREATE / UPDATE / DELETE / LOGIN / LOGOUT written to `audit_logs`
- **CORS** — restricted to `http://localhost:3000`
- **Security headers** — X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **EF Core** — parameterized queries only, no raw SQL

---

## Default Roles (seeded)

| ID | Role Name | Notes |
|----|-----------|-------|
| 1  | Admin     | Full access including user management |
| 2  | Manager   | All CRM entities, assignment rules, credit limits |
| 3  | Sales Rep | Own leads/contacts/activities, read-only pipeline |

### Create First Admin User

After running the schema, insert a seeded admin directly:

```sql
INSERT INTO users (role_id, first_name, last_name, email, password_hash, is_active)
VALUES (1, 'Admin', 'User', 'admin@sancrm.com',
  '$2a$11$K7LfFmNpM4h6hK6k5N.9XOzF3UhCdkG5sP0vbHLr6wH2J3a7v1VL2', -- password: Admin@123
  1);
```

Or use the register endpoint:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Admin","lastName":"User","email":"admin@sancrm.com","password":"Admin@123","roleId":1}'
```

---

## Response Format

All endpoints return:
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

Paginated lists:
```json
{
  "success": true,
  "data": {
    "data": [...],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

---

## File Uploads

Files are stored locally under `uploads/` relative to the API working directory:
- `uploads/leads/{id}/` — lead attachments
- `uploads/contacts/{id}/` — contact attachments
- `uploads/documents/` — document files
- `uploads/ocr/` — OCR input files

Configure max file size in `appsettings.json` → `FileStorage.MaxFileSizeMB` (default 25 MB).

---

## Project File Structure

```
backend/
├── SanCRM.Domain/
│   ├── Entities/          → 33 entity classes
│   └── Enums/             → All CRM enums
├── SanCRM.Infrastructure/
│   ├── Data/
│   │   └── CrmDbContext.cs  → EF Core config, seed data
│   └── Services/
│       └── CurrentUserService.cs
├── SanCRM.Application/
│   ├── Common/            → PagedResult, ApiResponse, QueryParams
│   ├── DTOs/              → All request/response shapes
│   ├── Interfaces/        → Service contracts
│   ├── Services/          → Business logic (7 services)
│   └── Validators/        → FluentValidation rules
└── SanCRM.API/
    ├── Controllers/       → 8 controllers (Auth, Leads, Contacts,
    │                         Accounts, Opportunities, Activities,
    │                         Campaigns, Documents, Communication, Dashboard)
    ├── Middleware/        → ExceptionHandlerMiddleware
    ├── Properties/        → launchSettings.json
    ├── Program.cs         → App bootstrap
    └── appsettings.json   → Config (DB, JWT, CORS, Storage)
```
