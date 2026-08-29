const fs = require('fs');
let content = fs.readFileSync('src/data/site.ts', 'utf8');
content = content.replace(/"33600000000"/g, '"+33641325328"');
fs.writeFileSync('src/data/site.ts', content);
