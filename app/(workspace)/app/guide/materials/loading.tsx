import { LoadingState } from '@/shared/ui/states';

export default function Loading() {
    return (
        <LoadingState
            title="Загрузка материалов"
            description="Подготавливаем справочник материалов..."
            className="min-h-[40vh]"
        />
    );
}
