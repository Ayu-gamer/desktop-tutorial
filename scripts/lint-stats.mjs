import { ESLint } from 'eslint';

const eslint = new ESLint({ cwd: process.cwd() });
const results = await eslint.lintFiles(['src/']);
const errors = results.reduce((sum, item) => sum + item.errorCount, 0);
const warnings = results.reduce((sum, item) => sum + item.warningCount, 0);

console.log(`ESLint: ${results.length} files checked, ${errors} errors, ${warnings} warnings`);

if (errors > 0 || warnings > 3) {
  process.exitCode = 1;
}
