import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    Building2,
    CalendarClock,
    ChartNoAxesCombined,
    HardHat,
    ShieldCheck,
    Truck
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen overflow-x-clip bg-[#0B0A0F] text-white font-sans">
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
                        <Link href="#capabilities" className="rounded-md px-3 py-2 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Возможности</Link>
                        <Link href="#workflow" className="rounded-md px-3 py-2 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Процесс</Link>
                        <Link href="#pricing" className="rounded-md px-3 py-2 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Тарифы</Link>
                    </nav>
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/sign-in">
                            <Button variant="ghost">Войти</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button>Запросить демо</Button>
                        </Link>
                    </div>
                    <details className="group md:hidden">
                        <summary className="list-none rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-white/40 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 [&::-webkit-details-marker]:hidden">
                            Меню
                        </summary>
                        <div className="absolute left-0 right-0 top-16 z-50 border-t border-white/10 bg-[#0B0A0F] shadow-2xl">
                            <div className="container mx-auto flex flex-col gap-4 px-4 py-6">
                                <nav className="flex flex-col gap-3 text-sm text-white/90" aria-label="Основная навигация (мобильная)">
                                    <Link href="#capabilities" className="rounded-md px-3 py-2 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Возможности</Link>
                                    <Link href="#workflow" className="rounded-md px-3 py-2 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Процесс</Link>
                                    <Link href="#pricing" className="rounded-md px-3 py-2 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Тарифы</Link>
                                </nav>
                                <div className="flex flex-col gap-3">
                                    <Link href="/sign-in">
                                        <Button
                                            variant="outline"
                                        >
                                            Войти
                                        </Button>
                                    </Link>
                                    <Link href="/sign-up">
                                        <Button>Запросить демо</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            </header>

            <main id="main" className="relative overflow-hidden">
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute left-1/2 top-[-260px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,93,42,0.45),rgba(11,10,15,0))] blur-2xl will-change-transform" />
                    <div className="absolute right-[-120px] top-[220px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(127,255,212,0.25),rgba(11,10,15,0))] blur-3xl will-change-transform" />
                    <div className="absolute left-[-160px] top-[520px] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(108,62,255,0.25),rgba(11,10,15,0))] blur-3xl will-change-transform" />
                </div>

                <section className="relative">
                    <div className="container mx-auto px-4 md:px-8 pt-20 pb-16 md:pt-28 md:pb-24">
                        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
                                    <HardHat className="h-4 w-4 text-[#FF6A3D]" aria-hidden="true" />
                                    Construction command center
                                </div>
                                <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] font-semibold">
                                    Система управления строительством для подрядчиков, которые не терпят хаос.
                                </h1>
                                <p className="max-w-xl text-lg text-white/90">
                                    Планируйте работы, контролируйте закупки, синхронизируйте бригады и держите бюджет под контролем.
                                    Все проекты — в одной операционной панели.
                                </p>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <Button variant="brand" size="xl">
                                        Запустить пилот
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                    <Button variant="outline" size="xl">
                                        Сценарий внедрения
                                    </Button>
                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-sm text-white/75">
                                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#B4FF7A]" aria-hidden="true" /> Контроль доступа и аудита</span>
                                    <span>Единая база материалов</span>
                                    <span>Отчеты для заказчика</span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/75">
                                        <span className="rounded-full bg-[#0B0A0F] px-2 py-0.5 text-white">Project Control</span>
                                        <span className="rounded-full bg-[#0B0A0F] px-2 py-0.5 text-white">Live site</span>
                                    </div>
                                    <div className="mt-6 grid gap-4">
                                        <div className="rounded-2xl border border-white/10 bg-[#15131B] p-4">
                                            <p className="inline-flex rounded-full bg-[#0B0A0F] px-2 py-0.5 text-xs text-white">Статус участка</p>
                                            <p className="mt-2 font-semibold text-white/95">Жилой комплекс “Северный”. Прогресс: 62%</p>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-white/10 bg-linear-to-br from-[#FF6A3D]/30 via-[#0B0A0F] to-[#B4FF7A]/30 p-4">
                                                <p className="inline-flex rounded-full bg-[#0B0A0F] px-2 py-0.5 text-xs text-white">Бюджет</p>
                                                <div className="mt-4 inline-flex rounded-2xl bg-[#0B0A0F] px-3 py-1 text-2xl font-semibold text-white">84.3 млн ₽</div>
                                                <p className="inline-flex rounded-full bg-[#0B0A0F] px-2 py-0.5 text-xs text-white">Отклонение: −2.1%</p>
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
                                                {['Нед 1', 'Нед 2', 'Нед 3'].map((frame) => (
                                                    <div key={frame} className="relative h-20 rounded-xl border border-white/10 bg-linear-to-br from-white/10 to-transparent">
                                                        <span className="absolute left-2 top-2 rounded-full bg-[#0B0A0F] px-2 py-0.5 text-[10px] text-white">{frame}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div aria-hidden className="absolute -bottom-10 -left-6 h-20 w-40 rounded-full bg-[#B4FF7A]/40 blur-3xl animate-pulse" />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="capabilities" className="relative border-t border-white/10 bg-[#0F0E14]">
                    <div className="container mx-auto px-4 md:px-8 py-20">
                        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                            <div className="space-y-6">
                                <span className="text-xs uppercase tracking-[0.3em] text-white/75">Capabilities</span>
                                <h2 className="text-3xl md:text-4xl font-semibold">Операционная архитектура стройки</h2>
                                <p className="text-white/80">Система объединяет сметы, графики, снабжение и контроль качества в единой ленте решений.</p>
                                <div className="flex flex-wrap gap-3 text-xs text-white/80">
                                    {['Календарное планирование', 'Контроль смет', 'Снабжение', 'Отчётность для заказчика'].map((tag) => (
                                        <span key={tag} className="rounded-full border border-white/20 bg-white/5 px-3 py-1">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {[
                                    { icon: CalendarClock, title: 'Графики и смены', text: 'Контроль этапов, смен и критических сроков.' },
                                    { icon: Truck, title: 'Снабжение', text: 'Поставки, заявки, остатки — без хаоса.' },
                                    { icon: Building2, title: 'Портфель объектов', text: 'Сравнение эффективности между площадками.' },
                                    { icon: ChartNoAxesCombined, title: 'Финансовая панель', text: 'Бюджет, маржинальность, отклонения.' },
                                ].map((item) => (
                                    <div key={item.title} className="rounded-2xl border border-white/10 bg-[#15131B] p-5 transition hover:-translate-y-1 hover:border-white/30">
                                        <item.icon className="h-6 w-6 text-[#FF6A3D]" aria-hidden="true" />
                                        <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                                        <p className="mt-2 text-sm text-white/80">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="workflow" className="relative border-t border-white/10">
                    <div className="container mx-auto px-4 md:px-8 py-20">
                        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-4">
                                <span className="text-xs uppercase tracking-[0.3em] text-white/75">Workflow</span>
                                <h2 className="text-3xl md:text-4xl font-semibold">Три шага до прозрачной стройки</h2>
                            </div>
                            <p className="max-w-lg text-white/80">Один контур процесса: план → исполнение → контроль. Без таблиц на стороне.</p>
                        </div>
                        <div className="mt-10 grid gap-6 lg:grid-cols-3">
                            {[
                                { step: '01', title: 'Собери объект', text: 'Импорт сметы, календаря, ресурсов.' },
                                { step: '02', title: 'Запусти исполнение', text: 'Бригады, поставки, контроль качества.' },
                                { step: '03', title: 'Отчитывайся', text: 'Дашборды, отчёты, SLA и риски.' },
                            ].map((item) => (
                                <div key={item.step} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
                                    <div className="absolute right-6 top-6 text-xs text-white/75">{item.step}</div>
                                    <h3 className="text-xl font-semibold">{item.title}</h3>
                                    <p className="mt-3 text-sm text-white/80">{item.text}</p>
                                    <div className="mt-6 h-[2px] w-16 bg-[#FF6A3D]" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="pricing" className="relative border-t border-white/10 bg-[#0F0E14]">
                    <div className="container mx-auto px-4 md:px-8 py-20">
                        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <span className="text-xs uppercase tracking-[0.3em] text-white/75">Pricing</span>
                                <h2 className="text-3xl md:text-4xl font-semibold">Тарифы для смелых идей</h2>
                            </div>
                            <p className="max-w-md text-white/80">Гибкий старт для подрядчиков и девелоперов, которым нужен прозрачный контроль проектов.</p>
                        </div>
                        <div className="mt-10 grid gap-6 lg:grid-cols-3">
                            {[
                                { name: 'Pilot', price: '0 ₽', desc: 'Для пилотного объекта', action: 'Создать объект', accent: false },
                                { name: 'General', price: '12 900 ₽', desc: 'Для генподрядчика', action: 'Подключить команду', accent: true },
                                { name: 'Enterprise', price: 'по запросу', desc: 'Для сетей и девелоперов', action: 'Запросить расчёт', accent: false },
                            ].map((plan) => (
                                <div key={plan.name} className={`rounded-3xl border ${plan.accent ? 'border-[#FF6A3D] bg-[#16131A] shadow-[0_30px_80px_rgba(255,106,61,0.2)]' : 'border-white/10 bg-[#14121A]'} p-6`}>
                                    <span className="text-xs uppercase tracking-[0.3em] text-white/75">{plan.name}</span>
                                    <div className="mt-6 text-3xl font-semibold">{plan.price}</div>
                                    <p className="mt-2 text-sm text-white/80">{plan.desc}</p>
                                    <ul className="mt-6 space-y-2 text-sm text-white/70">
                                        <li>До 5 объектов</li>
                                        <li>Контроль закупок</li>
                                        <li>Отчёты заказчику</li>
                                    </ul>
                                    <Button 
                                        variant={plan.accent ? "brand" : "outline"}
                                    >
                                        {plan.action}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative border-t border-white/10">
                    <div className="container mx-auto px-4 md:px-8 py-20">
                        <div className="rounded-[32px] border border-white/10 bg-linear-to-br from-[#1B1822] via-[#111017] to-[#0B0A0F] p-10 md:p-14">
                            <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                                <div className="space-y-4 rounded-2xl bg-[#0B0A0F] p-4">
                                    <span className="text-xs uppercase tracking-[0.3em] text-white/75">Final Call</span>
                                    <h2 className="text-3xl md:text-4xl font-semibold">Управляй стройкой как операцией, а не как хаосом.</h2>
                                    <p className="text-white/80">Покажем вашу картину объекта за 30 минут и составим план внедрения.</p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Button size="xl">Запросить презентацию</Button>
                                    <Button variant="outline" size="xl">Назначить встречу</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/10 bg-[#0B0A0F]">
                <div className="container mx-auto flex flex-col gap-6 px-4 md:px-8 py-10 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <span className="text-sm uppercase tracking-[0.4em] text-white/75">Smetalab BuildOS</span>
                        <p className="text-sm text-white/80">© {new Date().getFullYear()} Smetalab. Все права защищены.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
                        <Link href="#capabilities" className="rounded-md px-2 py-1 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Возможности</Link>
                        <Link href="#workflow" className="rounded-md px-2 py-1 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Процесс</Link>
                        <Link href="#pricing" className="rounded-md px-2 py-1 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">Тарифы</Link>
                    </div>
                </div>
            </footer>

        </div>
    );
}
