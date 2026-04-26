import { LoadingState } from '@/shared/ui/states';

export default function Loading() {
    return (
        <LoadingState
            title="Загрузка работ"
            description="Подготавливаем справочник работ..."
            className="min-h-[40vh]"
        />
    );
}
