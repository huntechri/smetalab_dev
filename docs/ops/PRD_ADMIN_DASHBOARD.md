# PRD: Admin Tenant Management & Support Tools

## Overview
To provide high-quality support and maintain operational control, administrators (Superadmins/Support) need a dedicated interface to manage tenants, monitor activity, and resolve user issues.

## User Stories

### 1. Tenant Overview
**As a Support Agent**, I want to see a comprehensive overview of a tenant's status so that I can quickly understand their context when they contact support.
- **Acceptance Criteria:**
    - Display tenant name, ID, and creation date.
    - Show current subscription plan and status (Active, Past Due, Canceled).
    - List all team members with their roles.
    - Show summary metrics (total works, total materials, total estimates).

### 2. Impersonation
**As a Superadmin**, I want to securely log into a tenant's workspace as one of their users so that I can reproduce and fix reported bugs.
- **Acceptance Criteria:**
    - Action must be logged in `impersonation_sessions`.
    - Session must automatically end after a period of inactivity or logout.
    - A visible banner must indicate that the session is an impersonation.
    - Superadmin must have a "Stop Impersonation" button.

### 3. Subscription Management
**As a Support Agent**, I want to be able to manually override a tenant's subscription plan so that I can handle special billing cases or promotions.
- **Acceptance Criteria:**
    - Ability to select a new plan from a dropdown.
    - Changes must be reflected in the database and synced with Stripe (if applicable).

## Metrics to Track
- **DAU/MAU** per tenant.
- **Resource Usage:** Count of `works`, `materials`, `estimates`.
- **Last Active Date:** When any member of the tenant last performed an action.
- **Error Rate:** Occurrences of errors logged for this specific tenant.

## Security & Audit
- All mutations (updates) in the admin dashboard must be logged with the ID of the admin who performed them.
- Access to `/admin/**` restricted to users with `platform_role` in ('superadmin', 'support').
