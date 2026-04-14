export const projectBadgeClassName = [
  'flex',
  'items-center',
  'justify-center',
  'gap-1',
  'rounded-[7.6px]',
  'border',
  'border-solid',
  'border-transparent',
  'bg-[hsl(220_100%_60%_/_0.05)]',
  'px-2',
  'py-[2px]',
  'text-[10px]',
  'font-bold',
  'leading-[15px]',
  'tracking-[0.5px]',
  'text-[hsl(230_84%_49%_/_0.8)]',
  'shadow-none',
].join(' ');

export const projectStatusBadgeToneClassName = {
  success: 'bg-[hsl(142_76%_36%_/_0.12)] text-[hsl(142_72%_30%)]',
  info: 'bg-[hsl(220_100%_60%_/_0.12)] text-[hsl(230_84%_49%_/_0.85)]',
  warning: 'bg-[hsl(38_92%_50%_/_0.14)] text-[hsl(24_95%_34%)]',
  neutral: 'bg-[hsl(220_9%_46%_/_0.12)] text-[hsl(220_9%_28%)]',
} as const;
