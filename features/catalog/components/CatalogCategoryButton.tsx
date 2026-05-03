import { Button, type ButtonProps } from '@/shared/ui/button';

type CatalogCategoryButtonProps = Omit<Button size="xs"Props, 'variant'> & {
    active?: boolean;
    activeVariant?: ButtonProps['variant'];
    inactiveVariant?: ButtonProps['variant'];
};

export function CatalogCategoryButton({
    active = false,
    activeVariant = 'primary',
    inactiveVariant = 'ghost',
    ...props
}: CatalogCategoryButtonProps) {
    return (
        <Button size="xs"
            variant={active ? activeVariant : inactiveVariant}
            {...props}
        />
    );
}
