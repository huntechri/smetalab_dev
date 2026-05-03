import { Button, type ButtonProps } from '@/shared/ui/button';

type CatalogCategoryButtonProps = Omit<ButtonProps, 'variant'> & {
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
        <Button
            variant={active ? activeVariant : inactiveVariant}
            {...props}
        />
    );
}
