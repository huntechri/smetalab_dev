import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { ContentContainer } from '@/shared/ui/content-container';
import {
  MarketingPageShell,
  MarketingHero,
  MarketingSection,
  MarketingCard,
  MarketingCTA,
} from '@/shared/ui/marketing-shell';
import {
  primitiveMarketingGradientOrangeClassName,
  primitiveMarketingGradientCyanClassName,
  primitiveMarketingGradientPurpleClassName,
  primitiveMarketingPillSmallClassName,
  primitiveMarketingCardGradientClassName,
  primitiveMarketingPillXsClassName,
  primitiveMarketingDemoShellClassName,
  primitiveMarketingCodeBlockClassName,
} from '@/shared/ui/primitive-marketing';
import {
  ArrowRight,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  HardHat,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavigationLink = {
    href: `#${string}`;
    label: string;
};

type CapabilityCard = {
    icon: LucideIcon;
    title: string;
    text: string;
};

type WorkflowStep = {
    step: string;
    title: string;
    text: string;
};

type PricingPlan = {
    name: string;
    price: string;
    desc: string;
    action: string;
    href: '/sign-up';
    accent: boolean;
};

type AuthLink = {
    href: '/sign-in' | '/sign-up';
    label: string;
    variant: 'ghost' | 'outline' | 'default';
};

const navigationLinks: NavigationLink[] = [
    { href: '#capabilities', label: 'Возможности' },
    { href: '#workflow', label: 'Процесс' },
    { href: '#pricing', label: 'Тарифы' },
];

const capabilityTags = [
    'Календарное планирование',
    'Контроль смет',
    'Снабжение',
    'Отчётность для заказчика',
];

const capabilityCards: CapabilityCard[] = [
    { icon: CalendarClock, title: 'Графики и смены', text: 'Контроль этапов, смен и критических сроков.' },
    { icon: Truck, title: 'Снабжение', text: 'Поставки, заявки, остатки — без хаоса.' },
    { icon: Building2, title: 'Портфель объектов', text: 'Сравнение эффективности между площадками.' },
    { icon: ChartNoAxesCombined, title: 'Финансовая панель', text: 'Бюджет, маржинальность, отклонения.' },
];

const workflowSteps: WorkflowStep[] = [
    { step: '01', title: 'Собери объект', text: 'Импорт сметы, календаря, ресурсов.' },
    { step: '02', title: 'Запусти исполнение', text: 'Бригады, поставки, контроль качества.' },
    { step: '03', title: 'Отчитывайся', text: 'Дашборды, отчёты, SLA и риски.' },
];

const pricingPlans: PricingPlan[] = [
    { name: 'Pilot', price: '0 ₽', desc: 'Для пилотного объекта', action: 'Создать объект', href: '/sign-up', accent: false },
    { name: 'General', price: '12 900 ₽', desc: 'Для генподрядчика', action: 'Подключить команду', href: '/sign-up', accent: true },
    { name: 'Enterprise', price: 'по запросу', desc: 'Для сетей и девелоперов', action: 'Запросить расчёт', href: '/sign-up', accent: false },
];

const scheduleFrames = ['Нед 1', 'Нед 2', 'Нед 3'];

const pricingFeatures = ['До 5 объектов', 'Контроль закупок', 'Отчёты заказчику'];

const navLinkClassNameBase = 'rounded-md transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60';
const headerNavLinkClassName = `${navLinkClassNameBase} px-3 py-2`;
const footerNavLinkClassName = `${navLinkClassNameBase} px-2 py-1`;

const desktopAuthLinks: AuthLink[] = [
    { href: '/sign-in', label: 'Войти', variant: 'ghost' },
    { href: '/sign-up', label: 'Запросить демо', variant: 'default' },
];

const mobileAuthLinks: AuthLink[] = [
    { href: '/sign-in', label: 'Войти', variant: 'outline' },
    { href: '/sign-up', label: 'Запросить демо', variant: 'default' },
];

export default function LandingPage() {
    return (
        <MarketingPageShell>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-black">
                Пропустить к содержимому
            </a>

            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0A0F]">
                <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6A3D] text-black font-bold">S</div>
                        <div className="leading-none">
                            <span className="block text-xs uppercase tracking-[0.4em] text-white/80">Smetalab</span>
                            <span className="block text-sm font-semibold">BuildOS</span>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-4 text-sm text-white/90" aria-label="Основная навигация">
                        {navigationLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={headerNavLinkClassName}>{link.label}</Link>
                        ))}
                    </nav>
                    <div className="hidden md:flex items-center gap-3">
                        {desktopAuthLinks.map((link) => (
                            <Button key={link.href} variant={link.variant} size="default" role="button" asChild>
                                <Link href={link.href}>{link.label}</Link>
                            </Button>
                        ))}
                    </div>
                    <details className="group md:hidden">
                        <summary
                            aria-controls="mobile-navigation-panel"
                            className="list-none rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-white/40 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 [&::-webkit-details-marker]:hidden"
                        >
                            Меню
                        </summary>
                        <div id="mobile-navigation-panel" className="absolute left-0 right-0 top-16 z-50 border-t border-white/10 bg-[#0B0A0F] shadow-2xl">
                            <div className="container mx-auto flex flex-col gap-4 px-4 py-6">
                                <nav className="flex flex-col gap-3 text-sm text-white/90" aria-label="Основная навигация (мобильная)">
                                    {navigationLinks.map((link) => (
                                        <Link key={link.href} href={link.href} className={headerNavLinkClassName}>{link.label}</Link>
                                    ))}
                                </nav>
                                <div className="flex flex-col gap-3">
                                    {mobileAuthLinks.map((link) => (
                                        <Button key={link.href} variant={link.variant} size="default" role="button" asChild>
                                            <Link href={link.href}>{link.label}</Link>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </header>

            <main id="main" className="relative overflow-hidden">
                {/* Background gradient orbs */}
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className={['absolute left-1/2 top-[-260px] h-[520px] w-[520px] -translate-x-1/2 rounded-full', primitiveMarketingGradientOrangeClassName, 'blur-2xl will-change-transform'].join(' ')} />
                    <div className={['absolute right-[-120px] top-[220px] h-[420px] w-[420px] rounded-full', primitiveMarketingGradientCyanClassName, 'blur-3xl will-change-transform'].join(' ')} />
                    <div className={['absolute left-[-160px] top-[520px] h-[380px] w-[380px] rounded-full', primitiveMarketingGradientPurpleClassName, 'blur-3xl will-change-transform'].join(' ')} />
                </div>

                <MarketingHero
                    pill={
                        <>
                            <HardHat className="h-4 w-4 text-[#FF6A3D]" aria-hidden="true" />
                            Construction command center
                        </>
                    }
                    heading="Система управления строительством для подрядчиков, которые не терпят хаос."
                    lead="Планируйте работы, контролируйте закупки, синхронизируйте бригады и держите бюджет под контролем. Все проекты — в одной операционной панели."
                    actions={
                        <>
                            <Button variant="brand" size="xl" asChild>
                                <Link href="/sign-up">
                                    Запустить пилот
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="xl" role="button" asChild>
                                <Link href="#workflow">Сценарий внедрения</Link>
                            </Button>
                        </>
                    }
                    features={
                        <>
                            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#B4FF7A]" aria-hidden="true" /> Контроль доступа и аудита</span>
                            <span>Единая база материалов</span>
                            <span>Отчеты для заказчика</span>
                        </>
                    }
                    demo={
                        <>
                            <div className={primitiveMarketingDemoShellClassName}>
                                <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/75">
                                    <span className={primitiveMarketingPillXsClassName}>Project Control</span>
                                    <span className={primitiveMarketingPillXsClassName}>Live site</span>
                                </div>
                                <div className="mt-6 grid gap-4">
                                    <div className={primitiveMarketingCodeBlockClassName}>
                                        <p className={primitiveMarketingPillXsClassName}>Статус участка</p>
                                        <p className="mt-2 font-semibold text-white/95">Жилой комплекс &ldquo;Северный&rdquo;. Прогресс: 62%</p>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className={['rounded-2xl border border-white/10 p-4', primitiveMarketingCardGradientClassName].join(' ')}>
                                            <p className={primitiveMarketingPillXsClassName}>Бюджет</p>
                                            <div className="mt-4 inline-flex rounded-2xl bg-[#0B0A0F] px-3 py-1 text-2xl font-semibold text-white">84.3 млн ₽</div>
                                            <p className={primitiveMarketingPillXsClassName}>Отклонение: −2.1%</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-[#111015] p-4">
                                            <p className="text-xs text-white/75">Поставки</p>
                                            <div className="mt-3 text-xl font-semibold">12/16</div>
                                            <p className="text-sm text-white/80">в пути</p>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-[#111015] p-4">
                                        <p className="text-xs text-white/75">График работ</p>
                                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {scheduleFrames.map((frame) => (
                                                <div key={frame} className="relative h-20 rounded-xl border border-white/10 bg-linear-to-br from-white/10 to-transparent">
                                                    <span className="absolute left-2 top-2 rounded-full bg-[#0B0A0F] px-2 py-0.5 text-[10px] text-white">{frame}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div aria-hidden className="absolute -bottom-10 -left-6 h-20 w-40 rounded-full bg-[#B4FF7A]/40 blur-3xl animate-pulse" />
                        </>
                    }
                />

                <MarketingSection id="capabilities" label="Capabilities" className="bg-[#0F0E14]">
                    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-semibold">Операционная архитектура стройки</h2>
                            <p className="text-white/80">Система объединяет сметы, графики, снабжение и контроль качества в единой ленте решений.</p>
                            <div className="flex flex-wrap gap-3 text-xs text-white/80">
                                {capabilityTags.map((tag) => (
                                    <span key={tag} className={primitiveMarketingPillSmallClassName}>{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            {capabilityCards.map((item) => (
                                <MarketingCard
                                    key={item.title}
                                    icon={item.icon}
                                    title={item.title}
                                    text={item.text}
                                />
                            ))}
                        </div>
                    </div>
                </MarketingSection>

                <MarketingSection id="workflow" label="Workflow">
                    <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-semibold">Три шага до прозрачной стройки</h2>
                        </div>
                        <p className="max-w-lg text-white/80">Один контур процесса: план → исполнение → контроль. Без таблиц на стороне.</p>
                    </div>
                    <div className="mt-10 grid gap-6 lg:grid-cols-3">
                        {workflowSteps.map((item) => (
                            <MarketingCard
                                key={item.step}
                                variant="workflow"
                                title={item.title}
                                text={item.text}
                                step={item.step}
                            />
                        ))}
                    </div>
                </MarketingSection>

                <MarketingSection id="pricing" label="Pricing" className="bg-[#0F0E14]">
                    <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-semibold">Тарифы для смелых идей</h2>
                        </div>
                        <p className="max-w-md text-white/80">Гибкий старт для подрядчиков и девелоперов, которым нужен прозрачный контроль проектов.</p>
                    </div>
                    <div className="mt-10 grid gap-6 lg:grid-cols-3">
                        {pricingPlans.map((plan) => (
                            <div
                                key={plan.name}
                                className={plan.accent
                                    ? 'rounded-3xl border border-[#FF6A3D] bg-[#16131A] p-6 shadow-[0_30px_80px_rgba(255,106,61,0.2)]'
                                    : 'rounded-3xl border border-white/10 bg-[#14121A] p-6'
                                }
                            >
                                <span className="text-xs uppercase tracking-[0.3em] text-white/75">{plan.name}</span>
                                <div className="mt-6 text-3xl font-semibold">{plan.price}</div>
                                <p className="mt-2 text-sm text-white/80">{plan.desc}</p>
                                <ul className="mt-6 space-y-2 text-sm text-white/70">
                                    {pricingFeatures.map((feature) => (
                                        <li key={feature}>{feature}</li>
                                    ))}
                                </ul>
                                <Button
                                    variant={plan.accent ? 'brand' : 'outline'}
                                    size="default"
                                    asChild
                                >
                                    <Link href={plan.href}>{plan.action}</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </MarketingSection>

                <MarketingCTA
                    heading="Управляй стройкой как операцией, а не как хаосом."
                    description="Покажем вашу картину объекта за 30 минут и составим план внедрения."
                    actions={
                        <>
                            <Button size="xl" asChild>
                                <Link href="/sign-up">Запросить презентацию</Link>
                            </Button>
                            <Button variant="outline" size="xl" asChild>
                                <Link href="/sign-up">Назначить встречу</Link>
                            </Button>
                        </>
                    }
                />
            </main>

            <footer className="border-t border-white/10 bg-[#0B0A0F]">
                <ContentContainer className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <span className="text-sm uppercase tracking-[0.4em] text-white/75">Smetalab BuildOS</span>
                        <p className="text-sm text-white/80">© {new Date().getFullYear()} Smetalab. Все права защищены.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
                        {navigationLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={footerNavLinkClassName}>{link.label}</Link>
                        ))}
                    </div>
                </ContentContainer>
            </footer>
        </MarketingPageShell>
    );
}
