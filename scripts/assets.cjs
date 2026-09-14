const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
fs.mkdirSync(path.join(root,'build/stockfish'),{recursive:true})
for (const file of ['stockfish.js','stockfish.wasm','Copying.txt']) {
  fs.copyFileSync(path.join(root,'dist/stockfish',file),path.join(root,'build/stockfish',file))
}
fs.copyFileSync(path.join(root,'public/index.html'),path.join(root,'build/index.html'))
