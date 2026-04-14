import { LoadingState } from '@/shared/ui/states';

export default function Loading() {
    return (
        <LoadingState
            title="Загрузка контрагентов"
            description="Подготавливаем справочник контрагентов..."
            className="min-h-[40vh]"
        />
    );
}
