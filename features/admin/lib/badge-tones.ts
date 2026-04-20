export function getSubscriptionBadgeVariant(status?: string | null): "success" | "info" | "warning" | "danger" | "paused" | "neutral" {
  const normalizedStatus = (status ?? "free").toLowerCase();

  if (normalizedStatus === "active") {
    return "success";
  }

  if (normalizedStatus === "trialing") {
    return "info";
  }

  if (normalizedStatus === "past_due" || normalizedStatus === "incomplete") {
    return "warning";
  }

  if (normalizedStatus === "unpaid" || normalizedStatus === "incomplete_expired") {
    return "danger";
  }

  if (normalizedStatus === "paused") {
    return "paused";
  }

  return "neutral";
}

export function getRoleBadgeVariant(role?: string | null): "info" | "paused" | "warning" | "neutral" {
  const normalizedRole = (role ?? "").toLowerCase();

  if (normalizedRole === "owner" || normalizedRole === "admin") {
    return "info";
  }

  if (normalizedRole === "manager") {
    return "paused";
  }

  if (normalizedRole === "estimator") {
    return "warning";
  }

  return "neutral";
}
