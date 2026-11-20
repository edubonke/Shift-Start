const fs = require('fs');
const path = require('path');
const source = require.resolve('lunr/lunr.min.js');
const target = path.join('assets','js','lunr.min.js');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
console.log(`Vendored ${source} -> ${target}`);
