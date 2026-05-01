import { checkoutAction } from '@/lib/infrastructure/payments/actions';
import { getStripePrices, getStripeProducts } from '@/lib/infrastructure/payments/stripe';
import { PricingSubmitButton } from '@/features/admin';
import { AdminPricingCard, AdminPricingGrid } from '@/shared/ui/admin-surface';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <AdminPricingGrid>
      <AdminPricingCard
        name={basePlan?.name || 'Base'}
        price={basePrice?.unitAmount || 800}
        interval={basePrice?.interval || 'month'}
        trialDays={basePrice?.trialPeriodDays || 7}
        features={[
          'Unlimited Usage',
          'Unlimited Workspace Members',
          'Email Support',
        ]}
        priceId={basePrice?.id}
        action={checkoutAction}
        submitButton={<PricingSubmitButton />}
      />
      <AdminPricingCard
        name={plusPlan?.name || 'Plus'}
        price={plusPrice?.unitAmount || 1200}
        interval={plusPrice?.interval || 'month'}
        trialDays={plusPrice?.trialPeriodDays || 7}
        features={[
          'Everything in Base, and:',
          'Early Access to New Features',
          '24/7 Support + Slack Access',
        ]}
        priceId={plusPrice?.id}
        action={checkoutAction}
        submitButton={<PricingSubmitButton />}
      />
    </AdminPricingGrid>
  );
}
