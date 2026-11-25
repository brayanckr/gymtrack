// Servidor local mínimo (solo lectura) para inyectar los .drawio en el editor de VP Online desde el navegador.
// Uso: node servir.js   -> http://127.0.0.1:8765/<archivo>.drawio
const http = require('http');
const fs = require('fs');
const path = require('path');
http.createServer((req, res) => {
  const f = path.join(__dirname, path.basename(decodeURIComponent(req.url.split('?')[0])));
  const h = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Private-Network': 'true', 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': '*' };
  if (req.method === 'OPTIONS') { res.writeHead(204, h); return res.end(); }
  if (!f.endsWith('.drawio') || !fs.existsSync(f)) { res.writeHead(404, h); return res.end('no'); }
  res.writeHead(200, { ...h, 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(fs.readFileSync(f, 'utf8'));
}).listen(8765, '127.0.0.1', () => console.log('sirviendo en http://127.0.0.1:8765'));
