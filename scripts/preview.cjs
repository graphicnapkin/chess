const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname,'../build')
http.createServer((req,res) => {
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname)
  const target = path.resolve(root,'.'+(pathname === '/' ? '/index.html' : pathname))
  if (!target.startsWith(root+path.sep)) { res.writeHead(403); res.end(); return }
  res.setHeader('Cross-Origin-Opener-Policy','same-origin')
  res.setHeader('Cross-Origin-Embedder-Policy','require-corp')
  res.setHeader('Cache-Control','no-store')
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm','.txt':'text/plain','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf'})[path.extname(target)] || 'application/octet-stream')
  fs.readFile(target,(error,data) => { res.writeHead(error ? 404 : 200);res.end(error ? 'Not found' : data) })
}).listen(9001,'127.0.0.1',()=>console.log('Production preview: http://127.0.0.1:9001'))
