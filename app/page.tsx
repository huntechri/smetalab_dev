import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';
import { ContentContainer } from '@/shared/ui/content-container';
import {
  MarketingPageShell,
  MarketingHero,
  MarketingSection,
  MarketingCard,
  MarketingCTA,
  MarketingSkipLink,
  MarketingBrandLogo,
  MarketingGradientOrbs,
  MarketingHeader,
  MarketingMobileMenu,
  MarketingFooter,
} from '@/shared/ui/marketing-shell';
import { Badge } from '@/shared/ui/badge';
import {
  primitiveMarketingCardGradientClassName,
  primitiveMarketingDemoShellClassName,
  primitiveMarketingCodeBlockClassName,
  primitiveMarketingSectionLabelClassName,
  primitiveMarketingH2ClassName,
  primitiveMarketingBodyClassName,
  primitiveMarketingHeaderNavLinkClassName,
  primitiveMarketingFooterNavLinkClassName,
  primitiveMarketingSectionBgClassName,
  primitiveMarketingDemoBudgetClassName,
  primitiveMarketingCardAltClassName,
  primitiveMarketingDemoFrameClassName,
  primitiveMarketingDemoFrameLabelClassName,
  primitiveMarketingDemoGlowClassName,
  primitiveMarketingPricingCardClassName,
  primitiveMarketingPricingAccentClassName,
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

const desktopAuthLinks: AuthLink[] = [
    { href: '/sign-in', label: 'Войти', variant: 'ghost' },
    { href: '/sign-up', label: 'Запросить демо', variant: 'default' },
];

const mobileAuthLinks: AuthLink[] = [
    { href: '/sign-in', label: 'Войти', variant: 'outline' },
    { href: '/sign-up', label: 'Запросить демо', variant: 'default' },
];

const desktopNavContent = navigationLinks.map((link) => (
    <Link key={link.href} href={link.href} className={primitiveMarketingHeaderNavLinkClassName}>
        {link.label}
    </Link>
));

const desktopActionsContent = desktopAuthLinks.map((link) => (
    <Button key={link.href} variant={link.variant} size="default" role="button" asChild>
        <Link href={link.href}>{link.label}</Link>
    </Button>
));

const mobilePanelContent = (
    <>
        <nav className="flex flex-col gap-3 text-sm text-white/90" aria-label="Основная навигация (мобильная)">
            {navigationLinks.map((link) => (
                <Link key={link.href} href={link.href} className={primitiveMarketingHeaderNavLinkClassName}>
                    {link.label}
                </Link>
            ))}
        </nav>
        <div className="flex flex-col gap-3">
            {mobileAuthLinks.map((link) => (
                <Button key={link.href} variant={link.variant} size="default" role="button" asChild>
                    <Link href={link.href}>{link.label}</Link>
                </Button>
            ))}
        </div>
    </>
);

export default function LandingPage() {
    return (
        <MarketingPageShell>
            <MarketingSkipLink href="#main" />

            <MarketingHeader
                brand={<MarketingBrandLogo />}
                desktopNav={desktopNavContent}
                desktopActions={desktopActionsContent}
                mobileMenu={<MarketingMobileMenu panel={mobilePanelContent} />}
            />

            <main id="main" className="relative overflow-hidden">
                <MarketingGradientOrbs />

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
                                    <Badge variant="outline" size="xs">Project Control</Badge>
                                    <Badge variant="outline" size="xs">Live site</Badge>
                                </div>
                                <div className="mt-6 grid gap-4">
                                    <div className={primitiveMarketingCodeBlockClassName}>
                                        <Badge variant="outline" size="xs">Статус участка</Badge>
                                        <p className="mt-2 font-semibold text-white/95">Жилой комплекс &ldquo;Северный&rdquo;. Прогресс: 62%</p>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className={cn('rounded-2xl border border-white/10 p-4', primitiveMarketingCardGradientClassName)}>
                                            <Badge variant="outline" size="xs">Бюджет</Badge>
                                            <div className={primitiveMarketingDemoBudgetClassName}>84.3 млн ₽</div>
                                            <Badge variant="outline" size="xs">Отклонение: −2.1%</Badge>
                                        </div>
                                        <div className={primitiveMarketingCardAltClassName}>
                                            <p className="text-xs text-white/75">Поставки</p>
                                            <div className="mt-3 text-xl font-semibold">12/16</div>
                                            <p className="text-sm text-white/80">в пути</p>
                                        </div>
                                    </div>
                                    <div className={primitiveMarketingCardAltClassName}>
                                        <p className="text-xs text-white/75">График работ</p>
                                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {scheduleFrames.map((frame) => (
                                                <div key={frame} className={primitiveMarketingDemoFrameClassName}>
                                                    <span className={primitiveMarketingDemoFrameLabelClassName}>{frame}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div aria-hidden className={primitiveMarketingDemoGlowClassName} />
                        </>
                    }
                />

                <MarketingSection id="capabilities" className={primitiveMarketingSectionBgClassName}>
                    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="space-y-6">
                            <span className={primitiveMarketingSectionLabelClassName}>Capabilities</span>
                            <h2 className={primitiveMarketingH2ClassName}>Операционная архитектура стройки</h2>
                            <p className="text-white/80">Система объединяет сметы, графики, снабжение и контроль качества в единой ленте решений.</p>
                            <div className="flex flex-wrap gap-3 text-xs text-white/80">
                                {capabilityTags.map((tag) => (
                                    <Badge key={tag} variant="outline" size="xs" className="uppercase tracking-[0.3em]">{tag}</Badge>
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

                <MarketingSection id="workflow">
                    <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-4">
                            <span className={primitiveMarketingSectionLabelClassName}>Workflow</span>
                            <h2 className={primitiveMarketingH2ClassName}>Три шага до прозрачной стройки</h2>
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

                <MarketingSection id="pricing" className={primitiveMarketingSectionBgClassName}>
                    <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <span className={primitiveMarketingSectionLabelClassName}>Pricing</span>
                            <h2 className={primitiveMarketingH2ClassName}>Тарифы для смелых идей</h2>
                        </div>
                        <p className="max-w-md text-white/80">Гибкий старт для подрядчиков и девелоперов, которым нужен прозрачный контроль проектов.</p>
                    </div>
                    <div className="mt-10 grid gap-6 lg:grid-cols-3">
                        {pricingPlans.map((plan) => (
                            <div
                                key={plan.name}
                                className={plan.accent
                                    ? primitiveMarketingPricingAccentClassName
                                    : primitiveMarketingPricingCardClassName
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

            <MarketingFooter>
                <ContentContainer className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <span className="text-sm uppercase tracking-[0.4em] text-white/75">Smetalab BuildOS</span>
                        <p className={primitiveMarketingBodyClassName}>© {new Date().getFullYear()} Smetalab. Все права защищены.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
                        {navigationLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={primitiveMarketingFooterNavLinkClassName}>{link.label}</Link>
                        ))}
                    </div>
                </ContentContainer>
            </MarketingFooter>
        </MarketingPageShell>
    );
}
