const fs = require('fs');
let constantsContent = fs.readFileSync('constants.ts', 'utf8');
let maciociaContent = fs.readFileSync('maciocia_100_patterns.ts', 'utf8');

let getIds = (str) => {
  let matches = str.match(/id:\s*['"]([^'"]+)['"]/g) || [];
  return matches.map(m => m.replace(/id:\s*['"]/, '').replace(/['"]$/, ''));
};

let ids1 = getIds(constantsContent);
let ids2 = getIds(maciociaContent);

let allIds = [...ids1, ...ids2];
let dupes = allIds.filter((item, index) => allIds.indexOf(item) !== index);
console.log("Cross-file Duplicates found:", [...new Set(dupes)]);
