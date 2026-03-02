# CRM Assessment - Production-Ready Multi-Tenant CRM

## Key Engineering Pillars Followed

## 🛡️ Engineering Justification

This section provides the technical rationale behind the design patterns and architectural decisions implemented in this project, specifically addressing the requirements of the **Associate Full Stack Developer Technical Examination**.

### 1. Multi-Tenant Architecture & Data Isolation

**Decision:** Shared Database, Shared Schema with Discriminator (Organization ID).
**Justification:**

- **Efficiency:** This is the industry-standard approach for cost-effective SaaS scaling. It avoids the overhead of managing thousands of separate database schemas.
- **Strict Isolation:** Isolation is enforced at the **query level**. I implemented a `TenantQuerysetMixin` that overrides the default `get_queryset` in all ViewSets.
- **Fail-safe Logic:** By linking every `User` to an `Organization` and using a `TenantMiddleware` to inject the current organization into the request context, the system automatically filters all results before they reach the Serializer. This "security by default" approach ensures Org A can never discover Org B's data, even if a developer makes a coding error in a specific endpoint.

### 2. Role-Based Access Control (RBAC)

**Decision:** Granular custom DRF Permission classes (`BasePermission`).
**Justification:**

- **Principle of Least Privilege:**
  - **Admin:** Full CRUD + Team/User management.
  - **Manager:** Full CRUD on contacts/companies to maintain operational speed, but restricted from system-level deletions or user management.
  - **Staff:** Restricted to "View", "Add" and "Edit" actions.
- **Hard Enforcement:** Permissions are checked at the **API entry point**, returning `403 Forbidden` for unauthorized actions. This prevents "ID guessing" attacks (Insecure Direct Object References).

### 3. Security Awareness & Data Integrity

**Decision:** JWT Auth + UUIDs + Soft Deletes + S3 Signed URLs.
**Justification:**

- **Token Security:** We use **JWT-based Authentication** with short-lived access tokens and refresh token rotation, ensuring sessions are secure and stateless.
- **Obfuscation (UUIDs):** By using `UUIDv4` instead of integer IDs (1, 2, 3...), we prevent attackers from "walking" the database to scrape records.
- **Data Safety:** The **Soft Delete** (`is_deleted` flag) pattern is used for Companies and Contacts. This protects against accidental data loss and maintains audit history while removing the record from the active business view.
- **S3 Privacy:**
  - **Zero Public Access:** The S3 bucket is 100% private.
  - **Signed URLs:** Logos are served via temporary **AWS Presigned URLs** (valid for 60m). This ensures that only authenticated users can view assets, and links shared externally expire quickly.

### 4. Structured Auditing (Activity Log)

**Decision:** Atomic service-level logging for all mutations.
**Justification:**

- **Reliability:** Every `CREATE`, `UPDATE`, and `DELETE` action is wrapped in a service hook that triggers an `ActivityLog` entry.
- **Traceability:** Logs capture the "Who, What, Where, and When". This provides a full forensic trail of administrative actions, which is a key requirement for enterprise CRM compliance.

### 5. Production Readiness & Clean Code

**Decision:** Separation of Concerns + Environment Isolation + CORS protection.
**Justification:**

- **Clean Architecture:** The backend is strictly divided into **Serializers**, **ViewSets**, **Permissions**, and **Models**, following DRF best practices. This ensures the project is maintainable and testable.
- **12-Factor App Compliance:**
  - All secrets (DATABASE_URL, AWS_KEYS) are managed via `.env`.
  - `python-decouple` is used to differentiate between Development and Production configurations.
- **CORS:** Strict origin whitelisting is configured to prevent Cross-Origin Request Forgery (CSRF) and unauthorized frontend access.
- **UX Maturity:** The frontend (React) features **Protected Routing**, standardized **Loading/Error states**, and **Paginated views** to ensure performance even with large datasets.

---

## 💻 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1. PostgreSQL Setup

Ensure PostgreSQL is running on your system, then create the database and user:

```sql
-- Connect to postgres (psql -U postgres)
CREATE DATABASE crm_db;
CREATE USER crm_user WITH PASSWORD 'crm_password';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
```

Update your `.env` with:
`DATABASE_URL=postgres://crm_user:crm_password@localhost:5432/crm_db`

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/development.txt
```

1. Create a `.env` file (refer to `.env.example`).
2. Run migrations: `python manage.py migrate`
3. Seed dev data: `python scripts/setup_dev.py`
4. Start server: `python manage.py runserver`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 3. Default Credentials

- **Email**: `admin@example.com`
- **Password**: `adminpassword123`

---

## 📁 Project Structure

```text
├── backend/
│   ├── apps/           # Domain logic (Users, CRM, Activity, Org)
│   ├── config/         # Django settings and routing
│   ├── middleware/     # Multi-tenancy logic
│   ├── permissions/    # RBAC classes
│   └── tests/          # Security & Isolation tests
├── frontend/
│   ├── src/
│   │   ├── features/   # Redux logic and page components
│   │   ├── services/   # Centralized API service (Axios)
│   │   └── layouts/    # Main layout and protected routing
```
