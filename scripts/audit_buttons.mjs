import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const results = [];

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            analyzeFile(fullPath);
        }
    }
}

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(rootDir, filePath);
    
    // Regex to find <Button or <button or other button-like elements
    // This is a simplified version of the previous script
    const buttonRegex = /<(Button|button|DropdownMenuItem|DropdownMenuTrigger|DialogTrigger|SheetTrigger|PopoverTrigger|AlertDialogTrigger)[^>]*>/g;
    let match;
    
    while ((match = buttonRegex.exec(content)) !== null) {
        const fullTag = match[0];
        const tagName = match[1];
        
        const variantMatch = /variant=["']([^"']+)["']/.exec(fullTag) || /variant=\{([^}]+)\}/.exec(fullTag);
        const sizeMatch = /size=["']([^"']+)["']/.exec(fullTag) || /size=\{([^}]+)\}/.exec(fullTag);
        const classNameMatch = /className=["']([^"']+)["']/.exec(fullTag) || /className=\{cn\(([^)]+)\)\}/.exec(fullTag) || /className=\{([^}]+)\}/.exec(fullTag);
        
        results.push({
            file: relativePath,
            tag: tagName,
            variant: variantMatch ? variantMatch[1] : 'default',
            size: sizeMatch ? sizeMatch[1] : 'default',
            className: classNameMatch ? classNameMatch[1].replace(/\s+/g, ' ').trim() : ''
        });
    }
}

console.log('Starting button audit...');
walk(path.join(rootDir, 'app'));
walk(path.join(rootDir, 'components'));
walk(path.join(rootDir, 'features'));
walk(path.join(rootDir, 'shared'));

const output = results.map(r => `File: ${r.file}\nTag: <${r.tag}>\nVariant: ${r.variant}\nSize: ${r.size}\nClasses: ${r.className}\n-------------------`).join('\n\n');

fs.writeFileSync(path.join(rootDir, 'docs', 'buttons_audit_updated.md'), `# Updated Button Audit\n\nTotal buttons found: ${results.length}\n\n${output}`);
console.log(`Audit complete. Found ${results.length} buttons. Results saved to docs/buttons_audit_updated.md`);
