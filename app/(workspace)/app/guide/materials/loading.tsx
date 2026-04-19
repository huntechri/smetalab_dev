import { LoadingState } from '@repo/ui';

export default function Loading() {
    return (
        <LoadingState
            title="Загрузка материалов"
            description="Подготавливаем справочник материалов..."
            className="min-h-[40vh]"
        />
    );
}
