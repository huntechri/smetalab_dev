import { Button } from '@/shared/ui/button';
import { AdminLandingShell } from '@/shared/ui/admin-surface';
import { ArrowRight, CreditCard, Database, Orbit } from 'lucide-react';
import { AdminTerminal } from '@/features/admin';
import Link from 'next/link';

const features = [
  {
    title: 'Next.js and React',
    description: 'Leverage the power of modern web technologies for optimal performance and developer experience.',
    icon: Orbit,
  },
  {
    title: 'Postgres and Drizzle ORM',
    description: 'Robust database solution with an intuitive ORM for efficient data management and scalability.',
    icon: Database,
  },
  {
    title: 'Stripe Integration',
    description: 'Seamless payment processing and subscription management with industry-leading Stripe integration.',
    icon: CreditCard,
  },
];

export default function HomePage() {
  return (
    <AdminLandingShell
      heroTitle="Smart Engineering &"
      heroAccent="Management Platform"
      heroDescription="Smetalab provides advanced tools for professional project estimation, management, and automated reporting. Built for engineers, by engineers."
      heroAction={(
        <Link href="/pricing">
          <Button variant="brand" size="xl">
            Get Started
            <ArrowRight className="ml-2 size-5" />
          </Button>
        </Link>
      )}
      heroVisual={<AdminTerminal />}
      features={features}
      ctaTitle="Ready to launch your SaaS?"
      ctaDescription="Our template provides everything you need to get your SaaS up and running quickly. Don't waste time on boilerplate - focus on what makes your product unique."
      ctaAction={(
        <a href="https://github.com/huntechri/smetalab_dev" target="_blank">
          <Button size="lg" variant="outline">
            View the code
            <ArrowRight className="ml-3 size-6" />
          </Button>
        </a>
      )}
    />
  );
}
