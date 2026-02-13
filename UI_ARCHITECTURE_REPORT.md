# UI Architecture Report

> Last updated: 2026-02-13

## Status

This document was converted from a stale auto-generated inventory to a **curated architecture summary**.  
The previous version listed outdated file locations and is intentionally removed to avoid misleading navigation.

## Current UI Structure

- `app/`
  - Route shells and pages for App Router segments.
  - Server Components are default; Client Components are only used for interactive leaves.
- `features/`
  - Domain-centric UI modules (`admin`, `projects`, `materials`, `works`, `counterparties`, `notifications`, `permissions`).
  - Each feature is decomposed into `components/`, `hooks/`, `screens/`, and `schemas/` where relevant.
- `components/ui/`
  - Shared shadcn/ui primitives.
- `components/`
  - Cross-feature composition components (app shell, providers, navigation).

## Mapping Notes

- Most legacy route-level UI that used to live directly in `app/**` has been extracted into `features/**`.
- If you need exact dependency mapping, regenerate a fresh report from the current codebase instead of relying on archived snapshots.

## Maintenance Rule

When moving UI files between `app/**` and `features/**`, update this summary in the same PR.
