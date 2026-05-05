# Typography & Metric Pill Inconsistencies Audit

This report documents instances of hardcoded metric typography (`text-[9px]`, `text-[10px]`, `text-[11px]`) and fake captions (`text-xs` with `opacity` or `text-muted-foreground`). These should be replaced with canonical tokens like `primitiveVisualTypographyClassNames.compactCaption` or wrapped in `EstimateMetricPill` / `Badge`.

---

**🎉 No typography inconsistencies found!**
## Total: 0 findings
