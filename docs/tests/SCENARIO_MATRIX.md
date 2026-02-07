# QA Scenario Matrix: RBAC & Multi-tenancy

This matrix defines the critical test scenarios for ensuring data isolation (multi-tenancy) and correct permission enforcement (RBAC).

## 1. Multi-tenancy (Data Isolation)

| Scenario ID | Actor | Action | Target Resource | Expected Outcome |
|---|---|---|---|---|
| MT-01 | User A (Tenant 1) | READ | Resource (Tenant 1) | ALLOW |
| MT-02 | User A (Tenant 1) | READ | Resource (Tenant 2) | DENY (403/404) |
| MT-03 | User A (Tenant 1) | UPDATE | Resource (Tenant 1) | ALLOW (if permission) |
| MT-04 | User A (Tenant 1) | UPDATE | Resource (Tenant 2) | DENY (403/404) |
| MT-05 | User A (Tenant 1) | LIST | Resources | Only Tenant 1 items |
| MT-06 | User A (Tenant 1) | INVITE | User to Tenant 2 | DENY |

## 2. RBAC (Role-Based Access Control) - Within Tenant

Assuming Standard Roles: `owner`, `admin`, `member`.

| Scenario ID | Role | Action | Description | Expected Outcome |
|---|---|---|---|---|
| RBAC-01 | Owner | Manage Team | Add/Remove members | ALLOW |
| RBAC-02 | Owner | Delete Team | Delete the tenant | ALLOW |
| RBAC-03 | Admin | Manage Team | Add members | ALLOW |
| RBAC-04 | Admin | Delete Team | Delete the tenant | DENY |
| RBAC-05 | Member | Manage Team | Add/Remove members | DENY |
| RBAC-06 | Member | Write Resource | Create/Edit Works/Materials | ALLOW (if 'write' access) |
| RBAC-07 | Member | Read Resource | View Works/Materials | ALLOW |
| RBAC-08 | Member | Access Settings | View Billing/Settings | DENY |

## 3. Platform & Impersonation

| Scenario ID | Actor | Action | Context | Expected Outcome |
|---|---|---|---|---|
| PLT-01 | Superadmin | Manage Platform | View all tenants | ALLOW |
| PLT-02 | Superadmin | Impersonate | Act as User B (Tenant 2) | ALLOW |
| PLT-03 | Superadmin (Impersonating) | Manage Resource | Modify Tenant 2 data | ALLOW |
| PLT-04 | Regular User | Impersonate | Try to impersonate | DENY |

## 4. Authentication Flows (E2E)

| Scenario ID | Flow | Steps | Expected Outcome |
|---|---|---|---|
| AUTH-01 | Reg & Login | Register -> Verify Email -> Login | Success, redirected to dashboard |
| AUTH-02 | Team Switch | Login -> Switch from Team A to Team B | Dashboard updates to Team B data |
| AUTH-03 | Invitation | Receive Invite -> Click Link -> Join | User becomes member of Team |
