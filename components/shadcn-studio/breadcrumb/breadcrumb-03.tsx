import Link from 'next/link'
import * as React from 'react'
import { ChevronsRightIcon, FileIcon, FolderIcon, HomeIcon } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/shared/ui/breadcrumb'

type Breadcrumb03Item = {
  label: string
  href?: string
}

type Breadcrumb03Props = {
  items: Breadcrumb03Item[]
  className?: string
}

function getBreadcrumbIcon(index: number, lastIndex: number) {
  if (index === 0) {
    return HomeIcon
  }

  if (index === lastIndex) {
    return FileIcon
  }

  return FolderIcon
}

function renderBreadcrumbItem(item: Breadcrumb03Item, index: number, lastIndex: number) {
  const Icon = getBreadcrumbIcon(index, lastIndex)
  const href = item.href
  const isCurrent = index === lastIndex || !href

  return (
    <BreadcrumbItem key={`${item.label}-${index}`}>
      {isCurrent ? (
        <BreadcrumbPage className='flex max-w-[180px] items-center gap-2 truncate font-medium'>
          <Icon className='size-4 shrink-0' aria-hidden='true' />
          <span className='truncate'>{item.label}</span>
        </BreadcrumbPage>
      ) : (
        <BreadcrumbLink asChild className='flex max-w-[180px] items-center gap-2 truncate'>
          <Link href={href}>
            <Icon className='size-4 shrink-0' aria-hidden='true' />
            <span className='truncate'>{item.label}</span>
          </Link>
        </BreadcrumbLink>
      )}
    </BreadcrumbItem>
  )
}

function renderMobileBreadcrumbItem(
  item: Breadcrumb03Item,
  index: number,
  lastIndex: number,
  { compactFirst = false }: { compactFirst?: boolean } = {}
) {
  const Icon = getBreadcrumbIcon(index, lastIndex)
  const href = item.href
  const isCurrent = index === lastIndex || !href

  if (compactFirst && index === 0 && href) {
    return (
      <BreadcrumbItem key={`${item.label}-${index}`} className='shrink-0'>
        <BreadcrumbLink asChild className='flex size-7 items-center justify-center rounded-md'>
          <Link href={href} aria-label={item.label}>
            <Icon className='size-3.5 shrink-0' aria-hidden='true' />
            <span className='sr-only'>{item.label}</span>
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
    )
  }

  return (
    <BreadcrumbItem key={`${item.label}-${index}`} className={isCurrent ? 'min-w-0 flex-1' : 'min-w-0 shrink'}>
      {isCurrent ? (
        <BreadcrumbPage className='flex min-w-0 max-w-full items-center gap-1.5 truncate font-medium'>
          <Icon className='size-3.5 shrink-0' aria-hidden='true' />
          <span className='truncate'>{item.label}</span>
        </BreadcrumbPage>
      ) : (
        <BreadcrumbLink asChild className='flex min-w-0 max-w-[84px] items-center gap-1.5 truncate'>
          <Link href={href}>
            <Icon className='size-3.5 shrink-0' aria-hidden='true' />
            <span className='truncate'>{item.label}</span>
          </Link>
        </BreadcrumbLink>
      )}
    </BreadcrumbItem>
  )
}

export function Breadcrumb03({ items, className }: Breadcrumb03Props) {
  const lastIndex = items.length - 1

  if (items.length === 0) {
    return null
  }

  return (
    <>
      <Breadcrumb className={['hidden md:block', className].filter(Boolean).join(' ')}>
        <BreadcrumbList>
          {items.map((item, index) => (
            <React.Fragment key={`${item.label}-${index}`}>
              {renderBreadcrumbItem(item, index, lastIndex)}
              {index < lastIndex ? (
                <BreadcrumbSeparator>
                  <ChevronsRightIcon className='size-4' aria-hidden='true' />
                </BreadcrumbSeparator>
              ) : null}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <Breadcrumb className={['max-w-full md:hidden', className].filter(Boolean).join(' ')}>
        <BreadcrumbList className='min-w-0 flex-nowrap gap-1 overflow-hidden text-xs'>
          {items.length > 2 ? (
            <>
              {renderMobileBreadcrumbItem(items[0], 0, lastIndex, { compactFirst: true })}
              <BreadcrumbSeparator className='shrink-0'>
                <ChevronsRightIcon className='size-3 opacity-50' aria-hidden='true' />
              </BreadcrumbSeparator>
              <BreadcrumbItem className='shrink-0'>
                <BreadcrumbEllipsis className='size-5' />
              </BreadcrumbItem>
              <BreadcrumbSeparator className='shrink-0'>
                <ChevronsRightIcon className='size-3 opacity-50' aria-hidden='true' />
              </BreadcrumbSeparator>
              {renderMobileBreadcrumbItem(items[lastIndex], lastIndex, lastIndex)}
            </>
          ) : (
            items.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                {renderMobileBreadcrumbItem(item, index, lastIndex)}
                {index < lastIndex ? (
                  <BreadcrumbSeparator className='shrink-0'>
                    <ChevronsRightIcon className='size-3 opacity-50' aria-hidden='true' />
                  </BreadcrumbSeparator>
                ) : null}
              </React.Fragment>
            ))
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}

export default function BreadcrumbChevronsSeparatorDemo() {
  return (
    <Breadcrumb03
      items={[
        { label: 'Главная', href: '/' },
        { label: 'Документы', href: '/documents' },
        { label: 'Добавить документ' }
      ]}
    />
  )
}
