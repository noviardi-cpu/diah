const fs = require('fs');
let content = fs.readFileSync('maciocia_100_patterns.ts', 'utf8');
let matches = content.match(/id:\s*['"]([^'"]+)['"]/g);
if (matches) {
  let ids = matches.map(m => m.replace(/id:\s*['"]/, '').replace(/['"]$/, ''));
  let dupes = ids.filter((item, index) => ids.indexOf(item) !== index);
  console.log("Duplicates found:", dupes);
} else {
  console.log("No matches found.");
}
