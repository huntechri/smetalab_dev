import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');
const suppressBaselineWarning = resolve(process.cwd(), 'scripts/suppress-baseline-warning.cjs');
const nodeOptions = [
    process.env.NODE_OPTIONS,
    `--require=${suppressBaselineWarning}`,
].filter(Boolean).join(' ');

const env = {
    ...process.env,
    BROWSERSLIST_IGNORE_OLD_DATA: 'true',
    BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: 'true',
    NODE_OPTIONS: nodeOptions,
} as typeof process.env;

const result = spawnSync(process.execPath, [nextBin, 'dev', '-p', '5000', '-H', '0.0.0.0'], {
    stdio: 'inherit',
    env,
});

if (result.status !== 0) {
    process.exit(result.status ?? 1);
}
