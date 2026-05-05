# Unused Shared/UI Exports Audit

Exports from `shared/ui/` that are **never imported** anywhere in `app/`, `components/`, `features/`, `shared/`, or `lib/`.

> ⚠️ This is a static analysis — barrel re-exports (`index.ts`) and dynamic imports are not tracked. Verify before deleting.

---

**307 unused export(s) across 76 file(s)**

### `shared/ui/action-menu.tsx`
- `ActionDensity`
- `actionMenuTriggerIconClassName`
- `actionMenuItemClassName`
- `actionMenuItemIconClassName`
- `ActionMenuItemContentProps`
- `ActionIconButtonProps`
- `ActionButtonGroupProps`
- `ConfirmActionProps`

### `shared/ui/admin-surface.tsx`
- `AdminIconFrame`

### `shared/ui/alert-dialog.tsx`
- `AlertDialogMedia`
- `AlertDialogOverlay`
- `AlertDialogPortal`

### `shared/ui/alert.tsx`
- `Alert`
- `AlertTitle`
- `AlertDescription`

### `shared/ui/auth-shell.tsx`
- `AuthFeatureCard`

### `shared/ui/auto-form/helpers.tsx`
- `BUILTIN_FIELD_TYPES`
- `ZodObjectOrWrapped`
- `getDefaultValueInZodStack`
- `getSchemaDescription`
- `buildFieldConfigFromJsonSchema`

### `shared/ui/auto-form/shared-form-types.ts`
- `BaseInputProps`
- `StringInputProps`
- `NumberInputProps`
- `BooleanInputProps`
- `DateInputProps`
- `EnumInputProps`
- `TypedInputProps`
- `SerializableInputProps`
- `InputPropsByBackingType`
- `InputPropsFor`
- `AutoFormBuiltinFieldType`
- `FieldType`
- `JSONSchemaPropertyBase`
- `FieldConfigItemBase`
- `JSON_SCHEMA_TO_FIELD_CONFIG_MAP`

### `shared/ui/auto-form/types.ts`
- `AutoFormFieldType`
- `FieldInputProps`
- `FieldConfigItem`
- `FieldConfigObject`
- `FieldConfig`
- `ValueDependency`
- `EnumValues`
- `OptionsDependency`
- `Dependency`
- `AutoFormInputComponentProps`

### `shared/ui/avatar.tsx`
- `AvatarImage`
- `AvatarBadge`
- `AvatarGroup`
- `AvatarGroupCount`

### `shared/ui/badge.tsx`
- `badgeVariants`

### `shared/ui/breadcrumb.tsx`
- `BreadcrumbEllipsis`

### `shared/ui/breadcrumbs.tsx`
- `Breadcrumb07`

### `shared/ui/button-group.tsx`
- `ButtonGroup`
- `ButtonGroupSeparator`
- `ButtonGroupText`
- `buttonGroupVariants`

### `shared/ui/calendar.tsx`
- `CalendarDayButton`

### `shared/ui/card-shell.tsx`
- `CardShellDensity`
- `CardShellVariant`
- `CardShellInsetVariant`
- `CardShellProps`
- `CardShellInsetProps`
- `CardShellHeaderProps`
- `CardShellBodyProps`
- `CardShellFooterProps`

### `shared/ui/card.tsx`
- `CardFooter`
- `CardAction`

### `shared/ui/carousel.tsx`
- `type CarouselApi`
- `Carousel`
- `CarouselContent`
- `CarouselItem`
- `CarouselPrevious`
- `CarouselNext`

### `shared/ui/cells/directory-table-cells.tsx`
- `DirectoryBadgeTone`
- `DirectoryBadgeTrailItem`
- `DirectoryBadgeTrail`

### `shared/ui/cells/estimate-table-cells.tsx`
- `estimateHeaderAlignClassNames`

### `shared/ui/cells/table-cell-helpers.tsx`
- `formatCurrencyRu`

### `shared/ui/chart.tsx`
- `ChartConfig`
- `ChartStyle`

### `shared/ui/collapsible.tsx`
- `CollapsibleTrigger`
- `CollapsibleContent`

### `shared/ui/command.tsx`
- `CommandDialog`
- `CommandShortcut`
- `CommandSeparator`

### `shared/ui/content-container.tsx`
- `type ContentContainerProps`

### `shared/ui/context-menu.tsx`
- `ContextMenuTrigger`
- `ContextMenuContent`
- `ContextMenuItem`
- `ContextMenuCheckboxItem`
- `ContextMenuRadioItem`
- `ContextMenuLabel`
- `ContextMenuSeparator`
- `ContextMenuShortcut`
- `ContextMenuGroup`
- `ContextMenuPortal`
- `ContextMenuSub`
- `ContextMenuSubContent`
- `ContextMenuSubTrigger`
- `ContextMenuRadioGroup`

### `shared/ui/dashboard-dynamics-chart.tsx`
- `DashboardDynamicsRange`
- `DashboardDynamicsMode`
- `dashboardDynamicsSeriesKeys`
- `DashboardDynamicsSeriesKey`
- `DashboardDynamicsVisibleSeries`
- `DashboardDynamicsChartPoint`
- `dashboardDynamicsChartConfig`

### `shared/ui/data-table.tsx`
- `DataTableProps`

### `shared/ui/dense-card.tsx`
- `denseCardClassName`

### `shared/ui/dense-list/inline-edit.ts`
- `denseListInlineCellClassName`

### `shared/ui/dense-list/tokens.tsx`
- `denseListIndicatorClassName`
- `denseListMutedIndicatorClassName`

### `shared/ui/dialog.tsx`
- `DialogClose`
- `DialogOverlay`
- `DialogPortal`
- `DialogTrigger`

### `shared/ui/drawer.tsx`
- `DrawerPortal`
- `DrawerOverlay`
- `DrawerTrigger`
- `DrawerClose`
- `DrawerContent`
- `DrawerHeader`
- `DrawerFooter`
- `DrawerTitle`
- `DrawerDescription`

### `shared/ui/dropdown-menu.tsx`
- `DropdownMenuPortal`
- `DropdownMenuGroup`
- `DropdownMenuRadioGroup`
- `DropdownMenuRadioItem`
- `DropdownMenuShortcut`
- `DropdownMenuSub`
- `DropdownMenuSubTrigger`
- `DropdownMenuSubContent`

### `shared/ui/estimate-tab.tsx`
- `EstimateTabError`

### `shared/ui/field.tsx`
- `Field`
- `FieldLabel`
- `FieldDescription`
- `FieldError`
- `FieldGroup`
- `FieldLegend`
- `FieldSeparator`
- `FieldSet`
- `FieldContent`
- `FieldTitle`

### `shared/ui/form-layout.tsx`
- `FormSectionHeaderProps`
- `RadioGroupRowProps`
- `FormErrorText`
- `formLayoutVariants`
- `formSectionVariants`

### `shared/ui/form.tsx`
- `useFormField`
- `FormDescription`

### `shared/ui/hover-card.tsx`
- `HoverCardTrigger`
- `HoverCardContent`

### `shared/ui/input-group.tsx`
- `InputGroup`
- `InputGroupAddon`
- `InputGroupButton`
- `InputGroupText`
- `InputGroupInput`
- `InputGroupTextarea`

### `shared/ui/input-otp.tsx`
- `InputOTP`
- `InputOTPGroup`
- `InputOTPSlot`
- `InputOTPSeparator`

### `shared/ui/input.tsx`
- `inputVariants`

### `shared/ui/item.tsx`
- `Item`
- `ItemMedia`
- `ItemContent`
- `ItemActions`
- `ItemGroup`
- `ItemSeparator`
- `ItemTitle`
- `ItemDescription`
- `ItemHeader`
- `ItemFooter`

### `shared/ui/kbd.tsx`
- `Kbd`
- `KbdGroup`

### `shared/ui/kpi-card.tsx`
- `KPICardValueTone`

### `shared/ui/marketing-shell.tsx`
- `MarketingPageShellProps`
- `MarketingSectionProps`
- `MarketingHeroProps`
- `MarketingCardProps`
- `MarketingCTAProps`
- `MarketingSkipLinkProps`
- `MarketingBrandLogoProps`
- `MarketingHeaderProps`
- `MarketingMobileMenuProps`
- `MarketingFooterProps`

### `shared/ui/menubar.tsx`
- `MenubarPortal`
- `MenubarMenu`
- `MenubarTrigger`
- `MenubarContent`
- `MenubarGroup`
- `MenubarSeparator`
- `MenubarLabel`
- `MenubarItem`
- `MenubarShortcut`
- `MenubarCheckboxItem`
- `MenubarRadioGroup`
- `MenubarRadioItem`
- `MenubarSub`
- `MenubarSubTrigger`
- `MenubarSubContent`

### `shared/ui/navigation-menu.tsx`
- `NavigationMenuList`
- `NavigationMenuItem`
- `NavigationMenuContent`
- `NavigationMenuTrigger`
- `NavigationMenuLink`
- `NavigationMenuIndicator`
- `NavigationMenuViewport`
- `navigationMenuTriggerStyle`

### `shared/ui/page-header.tsx`
- `PageHeader`
- `type PageHeaderProps`

### `shared/ui/page-shell.tsx`
- `PageShellDensity`
- `PageShellWidth`
- `PageShellSpacing`
- `ContentContainerProps`
- `PageHeaderProps`
- `PageHeader`
- `PageShellProps`
- `WorkspaceMainProps`

### `shared/ui/pagination.tsx`
- `Pagination`
- `PaginationContent`
- `PaginationLink`
- `PaginationItem`
- `PaginationPrevious`
- `PaginationNext`
- `PaginationEllipsis`

### `shared/ui/popover.tsx`
- `PopoverAnchor`
- `PopoverHeader`
- `PopoverTitle`
- `PopoverDescription`

### `shared/ui/primitive-chart.ts`
- `primitiveChartIndicatorDashedClassName`
- `primitiveChartLegendItemClassName`
- `primitiveChartLegendMarkClassName`
- `primitiveChartContentClassName`

### `shared/ui/primitive-form.ts`
- `primitiveFieldPaddingClassName`
- `primitiveFieldDescriptionPaddingClassName`

### `shared/ui/primitive-marketing.ts`
- `primitiveMarketingPulseClassName`
- `primitiveMarketingNavLinkBaseClassName`

### `shared/ui/primitive-overlay.ts`
- `primitiveDrawerMaxHeightClassName`
- `primitiveDrawerHandleWidthClassName`

### `shared/ui/primitive-spacing.ts`
- `PrimitiveSurfaceDensity`
- `primitiveCalendarNavigationPaddingClassName`
- `primitiveCalendarCellPaddingClassName`
- `primitiveCalendarGridPaddingClassName`

### `shared/ui/primitive-surface.ts`
- `PrimitiveSurfaceTone`
- `PrimitiveSurfaceElevation`
- `primitiveSurfaceElevationClassNames`
- `PrimitiveSurfaceBorder`
- `PrimitiveCardShellDensity`

### `shared/ui/resizable.tsx`
- `ResizableHandle`
- `ResizablePanel`
- `ResizablePanelGroup`

### `shared/ui/scroll-area.tsx`
- `ScrollBar`

### `shared/ui/section.tsx`
- `SectionDensity`
- `SectionProps`
- `SectionHeaderProps`

### `shared/ui/select.tsx`
- `SelectGroup`
- `SelectLabel`
- `SelectScrollDownButton`
- `SelectScrollUpButton`
- `SelectSeparator`

### `shared/ui/sheet.tsx`
- `SheetClose`

### `shared/ui/sidebar.tsx`
- `SidebarGroupAction`
- `SidebarInput`
- `SidebarMenuAction`
- `SidebarMenuBadge`
- `SidebarMenuSkeleton`
- `SidebarMenuSub`
- `SidebarMenuSubButton`
- `SidebarMenuSubItem`
- `SidebarRail`
- `SidebarSeparator`

### `shared/ui/spinner.tsx`
- `Spinner`

### `shared/ui/states/StateShell.tsx`
- `StateShellVariant`
- `StateShellDensity`
- `StateShellProps`

### `shared/ui/status-badge.tsx`
- `StatusTone`
- `statusBadgeVariantByTone`
- `StatusIndicatorPulse`
- `StatusIndicatorSize`

### `shared/ui/surface.tsx`
- `SurfaceVariant`
- `SurfaceDensity`
- `SurfaceTone`
- `SurfaceBorder`
- `SurfaceRadius`
- `SurfaceShadow`
- `SurfaceClassNameOptions`
- `getSurfaceClassName`
- `SurfaceProps`

### `shared/ui/table-actions.tsx`
- `TablePlaceholderRowActions`

### `shared/ui/table-density.tsx`
- `TableDensity`
- `TableTextAlign`
- `TableTextTone`
- `TableTextWeight`
- `TableTextSize`
- `TableHeaderLabelProps`
- `TableCellTextProps`

### `shared/ui/table-empty-state.tsx`
- `TableEmptyStateDensity`

### `shared/ui/table.tsx`
- `TableFooter`
- `TableCaption`

### `shared/ui/tabs.tsx`
- `tabsListVariants`

### `shared/ui/textarea.tsx`
- `textareaVariants`

### `shared/ui/toggle-group.tsx`
- `ToggleGroupItem`

### `shared/ui/toolbar-button.tsx`
- `toolbarButtonClassName`

### `shared/ui/toolbar.tsx`
- `ToolbarDivider`


---
_Generated: 2026-05-05T12:40:09.361Z_
