import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, extname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../../src');
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

createServer((req, res) => {
  let path = req.url === '/' ? '/index.html' : req.url;
  // Strip query strings
  path = path.split('?')[0];
  const file = resolve(ROOT, '.' + path);

  if (!existsSync(file) || !statSync(file).isFile()) {
    // SPA fallback
    const index = resolve(ROOT, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(readFileSync(index));
    return;
  }

  const ext = extname(file);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(PORT, () => {
  console.log(`\n  🚀 AMBRIA Dev Server → http://localhost:${PORT}\n`);
});
