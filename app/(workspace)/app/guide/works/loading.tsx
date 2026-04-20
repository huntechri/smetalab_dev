import { LoadingState } from '@repo/ui';

export default function Loading() {
    return (
        <LoadingState
            title="Загрузка работ"
            description="Подготавливаем справочник работ..."
            className="min-h-[40vh]"
        />
    );
}
