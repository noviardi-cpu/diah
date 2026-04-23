const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const componentsDir = path.join(__dirname, 'components');
let filesToProcess = walkSync(componentsDir);
filesToProcess.push(path.join(__dirname, 'App.tsx'));
filesToProcess.push(path.join(__dirname, 'index.html'));

filesToProcess.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html')) {
    let content = fs.readFileSync(file, 'utf8');

    // Invert light colors to dark colors for background
    content = content.replace(/bg-white/g, 'bg-pink-900');
    content = content.replace(/bg-slate-50(?!0)/g, 'bg-pink-950');
    content = content.replace(/bg-slate-100/g, 'bg-pink-800');
    content = content.replace(/bg-slate-200/g, 'bg-pink-700');
    content = content.replace(/bg-pink-50\b/g, 'bg-pink-950');
    content = content.replace(/bg-pink-100\b/g, 'bg-pink-800');
    content = content.replace(/bg-pink-200\b/g, 'bg-pink-700');
    content = content.replace(/bg-slate-800/g, 'bg-pink-800');
    content = content.replace(/bg-slate-900/g, 'bg-pink-900');
    content = content.replace(/bg-slate-950/g, 'bg-pink-950');

    content = content.replace(/bg-fuchsia-50\b/g, 'bg-fuchsia-950');
    content = content.replace(/bg-fuchsia-100\b/g, 'bg-fuchsia-900');
    content = content.replace(/bg-rose-50\b/g, 'bg-rose-950');
    content = content.replace(/bg-rose-100\b/g, 'bg-rose-900');

    // Text to white
    content = content.replace(/text-slate-\d+/g, 'text-white');
    content = content.replace(/text-black/g, 'text-pink-100');

    // Ensure buttons have readable contrast if they were using dark text on light backgrounds
    content = content.replace(/text-slate-800/g, 'text-white');

    fs.writeFileSync(file, content);
  }
});

console.log("Inverted pink light theme to dark theme!");
