import { stripTypeScriptTypes } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist');

await mkdir(outDir, { recursive: true });

for (const name of ['todo', 'app']) {
  const source = await readFile(path.join(root, 'src', `${name}.ts`), 'utf8');
  const output = stripTypeScriptTypes(source, { mode: 'strip' });
  await writeFile(path.join(outDir, `${name}.js`), output, 'utf8');
  console.log(`built dist/${name}.js`);
}
