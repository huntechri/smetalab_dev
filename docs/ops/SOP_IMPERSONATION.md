# SOP: Impersonation & Tenant Support

## Purpose
This document outlines the standard procedures for support agents and superadmins when interacting with tenant data or using the impersonation feature.

## 1. Requesting Authorization
- Impersonation should only be performed at the request of the user or to troubleshoot a critical bug reported by the user.
- Whenever possible, obtain written consent (email/ticket) before entering a tenant workspace.

## 2. Performing Impersonation
1. Navigate to `/dashboard/tenants/[tenantId]`.
2. Click the **"Impersonate"** button next to a specific user.
3. Verify that the **Impersonation Bar** is visible at the top of the screen.
4. Perform only the necessary actions to reproduce or fix the issue.

## 3. Prohibited Actions
During an impersonation session, the following actions are **STRICTLY PROHIBITED** unless explicitly authorized by the user for a specific troubleshooting step:
- Changing the user's password.
- Modifying billing or payment information.
- Deleting large volumes of data.
- Sending messages or invitations on behalf of the user.

## 4. Ending a Session
- Always click **"Stop Impersonation"** immediately after completing the task.
- If you forget, the session will expire automatically based on the platform's security settings (default: 1 hour).

## 5. Audit Logging
Every impersonation session logs the following:
- `superadmin_user_id`: Who started the session.
- `target_team_id`: Which tenant was accessed.
- `ip_address`: The IP of the admin.
- `started_at` & `ended_at`: Timestamps.

Failure to follow this SOP may result in revocation of admin privileges.
