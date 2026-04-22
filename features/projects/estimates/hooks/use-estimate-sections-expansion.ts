'use client';

import { useEffect, useRef, useState } from 'react';
import type { SectionNode } from '../lib/estimate-cards-table';

export function useEstimateSectionsExpansion(sectionNodes: SectionNode[]) {
  const knownSectionIdsRef = useRef<Set<string>>(
    new Set(sectionNodes.map((node) => node.section.id)),
  );
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(
    () => new Set(sectionNodes.map((node) => node.section.id)),
  );

  useEffect(() => {
    const sectionIds = new Set(sectionNodes.map((node) => node.section.id));
    const knownSectionIds = knownSectionIdsRef.current;

    setExpandedSectionIds((previous) => {
      const next = new Set<string>();

      for (const sectionId of sectionIds) {
        if (previous.has(sectionId) || !knownSectionIds.has(sectionId)) {
          next.add(sectionId);
        }
      }

      if (
        next.size === previous.size &&
        [...next].every((sectionId) => previous.has(sectionId))
      ) {
        return previous;
      }

      return next;
    });

    knownSectionIdsRef.current = sectionIds;
  }, [sectionNodes]);

  const toggleSection = (sectionId: string) => {
    setExpandedSectionIds((previous) => {
      const next = new Set(previous);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  return {
    expandedSectionIds,
    toggleSection,
  };
}
