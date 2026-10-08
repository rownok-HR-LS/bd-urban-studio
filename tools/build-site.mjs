// Builds the GitHub Pages site into ./site:
//   /bd-urban-studio/        customer web app (Expo export)
//   /bd-urban-studio/admin/  ops console (Vite build)
import { execSync } from 'node:child_process';
import { copyFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'site');
const run = (cmd, cwd) => execSync(cmd, { cwd: join(root, cwd), stdio: 'inherit' });

rmSync(site, { recursive: true, force: true });
run('npx expo export -p web --output-dir ../../site', 'apps/mobile');
run('npx vite build --outDir ../../site/admin --emptyOutDir', 'apps/admin');

// GitHub Pages has no rewrites: serve the app shell for unknown paths so deep
// links like /bd-urban-studio/product/plt-0004 still open the app.
copyFileSync(join(site, 'index.html'), join(site, '404.html'));
writeFileSync(join(site, '.nojekyll'), '');
console.log('\nSite built in ./site');
