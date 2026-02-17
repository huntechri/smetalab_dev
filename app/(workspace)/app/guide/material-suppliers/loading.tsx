import { LoadingState } from '@/components/ui/states';

export default function Loading() {
    return (
        <LoadingState
            title="Загрузка поставщиков материалов"
            description="Подготавливаем справочник поставщиков материалов..."
            className="min-h-[40vh]"
        />
    );
}
