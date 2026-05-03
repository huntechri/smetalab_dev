#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const strictMode = args.has('--strict');
const fixSafeMode = args.has('--fix-safe');
const includeDocs = args.has('--include-docs');
const scanRoots=['app','components','features','shared','entities','packages'];
const excluded=['node_modules/','.next/','.vercel/','dist/','coverage/','test-results/','docs/','reports/','.agents/'];
const componentList=['Button','Input','Textarea','Select','Checkbox','Switch','Label','Form','Card','Badge','Table','Dialog','AlertDialog','Sheet','Popover','DropdownMenu','Tooltip','Tabs','Sidebar','Skeleton','LoadingState','EmptyState','ErrorState','ForbiddenState','StateShell'];
const rawTags=['form','input','button','table','select','textarea'];
const importsNeed=['@/shared/ui/','@/components/ui/','@repo/ui','@repo/ui/','@radix-ui/','lucide-react','sonner'];

const densityOverrides={
  'app/(login)/verify-email/page.tsx#Button':'default-control',
  'app/not-found.tsx#Button':'default-control',
  'app/page.tsx#Button':'default-control',
  'components/layout/user-menu.tsx#Button':'toolbar-action',
  'features/_shared/directories/components/directory-list-screen.tsx#Button':'toolbar-action',
  'features/_shared/guide-catalog/components/CatalogFilterSidebar.tsx#Button':'toolbar-action',
  'features/catalog/components/CatalogCategoryButton.tsx#Button':'toolbar-action',
  'features/catalog/components/MaterialCatalogPicker.client.tsx#Button':'compact-candidate',
  'features/catalog/components/WorkCatalogPicker.client.tsx#Button':'compact-candidate',
  'features/counterparties/components/CreateCounterpartySheet.tsx#Button':'default-control',
  'features/counterparties/components/counterparty-sheet-sections.tsx#Input':'default-control',
  'features/dashboard/components/TeamWidgetSection.tsx#Button':'toolbar-action',
  'features/global-purchases/components/cards/DeletePurchaseAction.tsx#Button':'table-cell',
  'features/guide/screens/GuideScreen.tsx#Button':'toolbar-action',
  'features/material-suppliers/components/CreateMaterialSupplierSheet.tsx#Button':'default-control',
  'features/material-suppliers/components/CreateMaterialSupplierSheet.tsx#Input':'default-control',
  'features/materials/components/MaterialsSidebar.tsx#Button':'toolbar-action',
  'features/notifications/components/notification-bell.tsx#Button':'compact-candidate',
  'features/notifications/components/notification-item.tsx#Button':'compact-candidate',
  'features/patterns/screens/PatternsScreen.tsx#Button':'toolbar-action',
  'features/permissions/components/PermissionLevelControl.tsx#Button':'default-control',
  'features/projects/dashboard/components/ProjectEstimatesCards.tsx#Button':'compact-candidate',
  'features/projects/dashboard/components/ProjectEstimatesSection.tsx#Button':'toolbar-action',
  'features/projects/dashboard/components/ProjectReceiptsSection.tsx#Button':'toolbar-action',
  'features/projects/dashboard/components/ProjectReceiptsSection.tsx#Input':'default-control',
  'features/projects/estimates/components/EstimateHeader.tsx#Button':'toolbar-action',
  'features/projects/estimates/components/registry/EstimateStatusMenu.tsx#Button':'table-cell',
  'features/projects/estimates/components/tabs/execution/EstimateExecutionAddExtraWorkSheet.tsx#Button':'default-control',
  'features/projects/list/components/project-actions.tsx#Button':'table-cell',
  'features/projects/list/components/projects-sort-select.tsx#Button':'toolbar-action',
  'features/team/components/InviteTeamMemberCard.tsx#Button':'default-control',
  'features/team/components/InviteTeamMemberCard.tsx#Input':'default-control',
  'features/team/components/TeamMembersCard.tsx#Button':'table-cell',
  'features/works/components/UnitSelect.tsx#Button':'default-control',
  'shared/ui/action-menu.tsx#Button':'toolbar-action',
  'shared/ui/calendar.tsx#Button':'compact-candidate',
  'shared/ui/carousel.tsx#Button':'compact-candidate',
  'shared/ui/date-picker.tsx#Button':'compact-candidate',
  'shared/ui/dense-list/pickers.tsx#Button':'compact-candidate',
  'shared/ui/estimate-tab.tsx#Input':'table-cell',
  'shared/ui/input-group.tsx#Button':'default-control',
  'shared/ui/input-group.tsx#Input':'default-control',
  'shared/ui/search-control.tsx#Button':'toolbar-action',
  'shared/ui/search-input.tsx#Input':'default-control',
};
const findings=[];const inventories={imports:[],rawHtml:[],density:[],jsxUsages:[],sourceOfTruthMatrix:[],figmaConflicts:[]};
const matrix=Object.fromEntries(componentList.map(c=>[c,{componentsUi:false,sharedUi:false,packagesUi:false,runtimeImports:0,decisions:new Set()}]));
function walk(d,a=[]){if(!fs.existsSync(d))return a;for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);const r=path.relative(ROOT,f).replaceAll('\\','/');if(e.isDirectory()){if(!includeDocs&&excluded.some(x=>r.startsWith(x)))continue;walk(f,a);continue;}if(!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name))continue;if(/\.(test|spec)\.tsx?$/.test(r))continue;a.push(r);}return a;}
const files=scanRoots.flatMap(d=>walk(path.join(ROOT,d)));
for(const file of files){const txt=fs.readFileSync(path.join(ROOT,file),'utf8');const own=file.startsWith('app/')?'app':file.startsWith('features/')?'feature':file.startsWith('shared/ui/')?'shared/ui':'other';const dense=/table|cell|columns|toolbar|inline|editable|params/i.test(file);const defaultSurface=/form|dialog|auth|settings|admin/i.test(file);const mobile=/mobile|touch/i.test(file);
 let m;const ir=/import\s+(?:type\s+)?([^;]+?)\s+from\s+['"]([^'"]+)['"]/g;while((m=ir.exec(txt))){const source=m[2];if(!importsNeed.some(s=>source===s||source.startsWith(s)))continue;const names=m[1].replace(/[{}\n]/g,' ').replace(/\s+/g,' ').trim();let severity='informational',decision='informational',category='import',fixSafe=false,issueHint='#244';if(source.startsWith('@/components/ui/')){severity='needs-review';decision='legacy-facade';fixSafe=true;}else if(source==='@repo/ui'||source.startsWith('@repo/ui/')){severity='real-violation';decision='forbidden-runtime';}else if(source.startsWith('@radix-ui/')){if(file.startsWith('app/')||file.startsWith('features/')){severity='real-violation';decision='forbidden-runtime';}else if(file.startsWith('components/ui/')){severity='needs-review';decision='legacy-entrypoint-needs-removal';}else if(file.startsWith('shared/ui/')){decision='allowed-in-primitive';}}else if(source==='sonner'&&!/toast|notification/i.test(file)){severity='needs-review';decision='needs-review';issueHint='#245';}else if(source==='lucide-react'){category='icon-import';issueHint='#246';}
 const row={file,source,importedNames:names,severity,category,owner:own,decision,fixSafe,issueHint};findings.push(row);inventories.imports.push(row);
 for(const c of componentList){if(new RegExp('\\b'+c+'\\b').test(names)){if(source.startsWith('@/components/ui/'))matrix[c].componentsUi=true;if(source.startsWith('@/shared/ui/'))matrix[c].sharedUi=true;if(source==='@repo/ui'||source.startsWith('@repo/ui/'))matrix[c].packagesUi=true;matrix[c].runtimeImports++;matrix[c].decisions.add(decision);}}
 }
 for(const t of rawTags){if(!new RegExp('<'+t+'(\\s|>)').test(txt))continue;let decision='needs-review',severity='needs-review';if(file.startsWith('shared/ui/')){decision='allowed';severity='informational';}else if(t==='form'){decision='needs-review';}else if(file.startsWith('app/')||file.startsWith('features/')){decision='possible-violation';}else{decision='exception';}
 const scope=file.startsWith('app/')||file.startsWith('features/')?'app/features':file.startsWith('shared/ui/')?'shared/ui':'other';const row={file,tag:'<'+t+'>',scope,severity,category:'raw-html',owner:own,decision,fixSafe:false,issueHint:'#245'};findings.push(row);inventories.rawHtml.push(row);}
 for(const c of ['Button','Input']){if(!new RegExp('<'+c+'(\\s|>)').test(txt))continue;const explicit=/\bsize=/.test(txt)&&new RegExp('<'+c+'[^>]*\bsize=').test(txt);let d='unknown';if(explicit&&/size="xs"/.test(txt))d='compact-explicit';else if(defaultSurface)d='default-control';else if(dense&&/toolbar/i.test(file))d='toolbar-action';else if(dense&&/table|cell|columns/i.test(file))d='table-cell';else if(dense||(/h-7/.test(txt)&&!explicit))d='compact-candidate';else if(mobile)d='mobile-touch';const overrideDecision=densityOverrides[`${file}#${c}`];if(overrideDecision)d=overrideDecision;
  const row={file,component:c,marker:explicit?'size=*':'bare',severity:d==='unknown'?'needs-review':'informational',category:'density',owner:own,decision:d,fixSafe:false,issueHint:'#243'};findings.push(row);inventories.jsxUsages.push(row);inventories.density.push(row);} }
const stateIndexPath=path.join(ROOT,'shared/ui/states/index.ts');const stateIndex=fs.existsSync(stateIndexPath)?fs.readFileSync(stateIndexPath,'utf8'):'';
function compFiles(name){const keb=name.replace(/[A-Z]/g,(x,i)=>(i?'-':'')+x.toLowerCase());return [path.join(ROOT,'shared/ui',keb+'.tsx'),path.join(ROOT,'shared/ui',name+'.tsx'),path.join(ROOT,'shared/ui/states',name+'.tsx')];}
for(const c of componentList){const m=matrix[c];const existing=compFiles(c).filter(p=>fs.existsSync(p));const fileExists=existing.length>0;const exported=stateIndex.includes(c)||existing.some(p=>!p.includes('/states/'));const imported=m.runtimeImports>0;const status=m.sharedUi?'canonical':m.componentsUi?'legacy-facade':m.packagesUi?'package-export':imported?'forbidden-runtime':'missing';const decision=imported?([...m.decisions].join(', ')||'imported'):`not-imported; file-exists=${fileExists}; exported=${exported}`;inventories.sourceOfTruthMatrix.push({Component:c,'components/ui':m.componentsUi,'shared/ui':m.sharedUi,'packages/ui / @repo/ui':m.packagesUi,'Runtime imports':m.runtimeImports,Status:status,Decision:decision,componentFileStatus:fileExists?'exists':'missing-file',exportStatus:exported?'exported':'not-exported',importStatus:imported?'imported':'not-imported'});}
inventories.figmaConflicts=[{rule:'figma baseline loaded',status:'needs-source-of-truth-decision'},{rule:'button desktop target h-9',status:'needs-source-of-truth-decision'},{rule:'mobile touch target 44px',status:'needs-source-of-truth-decision'},{rule:'radius 8px',status:'needs-source-of-truth-decision'},{rule:'orange palette requires source-of-truth decision',status:'needs-source-of-truth-decision'},{rule:'shadcn/ui vs Smetalab UI Kit conflict requires source-of-truth decision',status:'needs-source-of-truth-decision'}];
const summary={filesScanned:files.length,realViolations:findings.filter(f=>f.severity==='real-violation').length,needsReview:findings.filter(f=>f.severity==='needs-review').length,informational:findings.filter(f=>f.severity==='informational').length,autoFixCandidates:findings.filter(f=>f.fixSafe).length,autoFixReason:'classification-first mode; fix-safe disabled',manualReview:findings.filter(f=>f.severity!=='informational').length,mode:strictMode?'strict':fixSafeMode?'fix-safe':'default'};
fs.mkdirSync(path.join(ROOT,'reports'),{recursive:true});fs.writeFileSync(path.join(ROOT,'reports/ui-inventory.json'),JSON.stringify({generatedAt:new Date().toISOString(),summary,findings,inventories},null,2));
const autoFix=findings.filter(f=>f.fixSafe).map(f=>`- ${f.file}: ${f.source}`);const md=`# UI Inventory Report\n\n## Top summary\n- real violations count: ${summary.realViolations}\n- needs-review count: ${summary.needsReview}\n- informational count: ${summary.informational}\n- auto-fix candidates count: ${summary.autoFixCandidates}\n- manual review count: ${summary.manualReview}\n\n## UI source-of-truth matrix\n| Component | components/ui | shared/ui | packages/ui / @repo/ui | Runtime imports | Status | Decision |\n|---|---|---|---|---|---|---|\n${inventories.sourceOfTruthMatrix.map(r=>`| ${r.Component} | ${r['components/ui']} | ${r['shared/ui']} | ${r['packages/ui / @repo/ui']} | ${r['Runtime imports']} | ${r.Status} | ${r.Decision} |`).join('\n')}\n\n## Raw HTML classification (app/features)\n${inventories.rawHtml.filter(r=>r.scope==='app/features').map(r=>`- ${r.file}: ${r.tag} => ${r.decision}`).join('\n')||'- none'}\n\n## Raw HTML classification (shared/ui)\n${inventories.rawHtml.filter(r=>r.scope==='shared/ui').map(r=>`- ${r.file}: ${r.tag} => ${r.decision}`).join('\n')||'- none'}\n\n## Raw HTML classification (other)\n${inventories.rawHtml.filter(r=>r.scope==='other').map(r=>`- ${r.file}: ${r.tag} => ${r.decision}`).join('\n')||'- none'}\n\n## Button/Input density table\n${inventories.jsxUsages.map(d=>`- ${d.file}: <${d.component}> ${d.marker} => ${d.decision}`).join('\n')||'- none'}\n\n## Density markers count/details\n- count: ${inventories.density.length}\n${inventories.density.slice(0,250).map(d=>`- ${d.file}: ${d.marker||d.decision}`).join('\n')}\n\n## Auto-fix candidates\n${summary.autoFixCandidates===0?`- none\n- reason: ${summary.autoFixReason}`:autoFix.join('\n')}\n\n## Unknown density surfaces require manual review before #243 auto-fix\n${inventories.jsxUsages.filter(d=>d.decision==='unknown').map(d=>`- ${d.file}: <${d.component}>`).join('\n')||'- none'}\n`;
fs.writeFileSync(path.join(ROOT,'reports/ui-inventory.md'),md);
if(fixSafeMode) console.log('Safe auto-fix disabled until matrix/classification finalization.');
console.log(`UI inventory generated. JSON: reports/ui-inventory.json, MD: reports/ui-inventory.md. Files scanned: ${summary.filesScanned}.`);
if(strictMode&&summary.realViolations>0) process.exitCode=1;
