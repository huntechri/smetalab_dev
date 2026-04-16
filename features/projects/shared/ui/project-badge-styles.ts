export const projectBadgeClassName = [
  'inline-flex',
  'items-center',
  'justify-center',
  'gap-1',
  'rounded-full',
  'border-none',
  'bg-[hsl(220_100%_60%_/_0.09)]',
  'px-2',
  'py-0.5',
  'text-[10px]',
  'font-semibold',
  'leading-none',
  'tracking-[0.3px]',
  'text-[hsl(230_84%_40%)]',
  'shadow-none',
].join(' ');

export const projectStatusBadgeToneClassName = {
  success: 'border-none bg-emerald-500/12 text-emerald-700',
  info: 'border-none bg-blue-500/12 text-blue-700',
  warning: 'border-none bg-amber-500/15 text-amber-700',
  neutral: 'border-none bg-slate-500/12 text-slate-700',
  danger: 'border-none bg-rose-500/12 text-rose-700',
} as const;
