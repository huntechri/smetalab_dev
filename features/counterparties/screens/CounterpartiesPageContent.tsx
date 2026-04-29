import type { CounterpartyRow } from '@/shared/types/domain/counterparty-row';
import { CounterpartiesScreen } from './CounterpartiesScreen';

type CounterpartiesPageContentProps = {
  initialData: CounterpartyRow[];
  totalCount: number;
};

export function CounterpartiesPageContent({ initialData, totalCount }: CounterpartiesPageContentProps) {
  return (
    <div className="flex-1 w-full flex flex-col">
      <CounterpartiesScreen initialData={initialData} totalCount={totalCount} />
    </div>
  );
}
