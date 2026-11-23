import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const assets = new Map([
  ['/', ['index.html','text/html']],
  ['/index.html', ['index.html','text/html']],
  ['/app.js', ['app.js','text/javascript']],
  ['/styles.css', ['styles.css','text/css']]
]);
createServer(async (request, response) => {
  const asset = assets.get(new URL(request.url, 'http://localhost').pathname);
  if (!asset) return response.writeHead(404).end('Not found');
  try {
    const file = await readFile(new URL(asset[0], import.meta.url));
    response.writeHead(200, { 'Content-Type': asset[1] + '; charset=utf-8', 'Cache-Control': 'no-store' }).end(file);
  } catch {
    response.writeHead(500).end('Could not read asset');
  }
}).listen(5173, () => console.log('JanSahay frontend: http://localhost:5173'));
