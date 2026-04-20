const BASE_STATUS_BADGE_CLASS_NAME =
  "border-none text-[10px] font-semibold uppercase tracking-wide";

export function getSubscriptionBadgeClassName(status?: string | null): string {
  const normalizedStatus = (status ?? "free").toLowerCase();

  if (normalizedStatus === "active") {
    return `${BASE_STATUS_BADGE_CLASS_NAME} bg-emerald-500/12 text-emerald-700`;
  }

  if (normalizedStatus === "trialing") {
    return `${BASE_STATUS_BADGE_CLASS_NAME} bg-blue-500/12 text-blue-700`;
  }

  if (normalizedStatus === "past_due" || normalizedStatus === "incomplete") {
    return `${BASE_STATUS_BADGE_CLASS_NAME} bg-amber-500/15 text-amber-700`;
  }

  if (normalizedStatus === "unpaid" || normalizedStatus === "incomplete_expired") {
    return `${BASE_STATUS_BADGE_CLASS_NAME} bg-rose-500/12 text-rose-700`;
  }

  if (normalizedStatus === "paused") {
    return `${BASE_STATUS_BADGE_CLASS_NAME} bg-violet-500/12 text-violet-700`;
  }

  if (
    normalizedStatus === "canceled" ||
    normalizedStatus === "cancelled" ||
    normalizedStatus === "free"
  ) {
    return `${BASE_STATUS_BADGE_CLASS_NAME} bg-slate-500/12 text-slate-700`;
  }

  return `${BASE_STATUS_BADGE_CLASS_NAME} bg-slate-500/12 text-slate-700`;
}

export function getRoleBadgeClassName(role?: string | null): string {
  const normalizedRole = (role ?? "").toLowerCase();

  if (normalizedRole === "owner" || normalizedRole === "admin") {
    return "border-none bg-blue-500/12 text-blue-700";
  }

  if (normalizedRole === "manager") {
    return "border-none bg-violet-500/12 text-violet-700";
  }

  if (normalizedRole === "estimator") {
    return "border-none bg-amber-500/15 text-amber-700";
  }

  if (normalizedRole === "member") {
    return "border-none bg-slate-500/12 text-slate-700";
  }

  return "border-none bg-muted text-muted-foreground";
}
