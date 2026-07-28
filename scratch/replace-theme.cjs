const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-slate-950/95': 'bg-background/95',
  'bg-slate-900/95': 'bg-card/95',
  'bg-slate-950/90': 'bg-background/90',
  'bg-slate-900/90': 'bg-card/90',
  'bg-slate-950/50': 'bg-background/50',
  'bg-slate-900/50': 'bg-card/50',
  'bg-slate-900/40': 'bg-card/40',
  'bg-slate-800/40': 'bg-muted/40',
  'bg-slate-800/50': 'bg-muted/50',
  'bg-slate-800/30': 'bg-muted/30',
  'bg-slate-950': 'bg-background',
  'bg-slate-900': 'bg-card',
  'bg-slate-800': 'bg-muted',
  'bg-slate-700': 'bg-accent',
  
  'text-slate-50': 'text-foreground',
  'text-slate-100': 'text-foreground',
  'text-slate-200': 'text-card-foreground',
  'text-slate-300': 'text-muted-foreground',
  'text-slate-400': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  
  'border-slate-800/50': 'border-border/50',
  'border-slate-700/50': 'border-border/50',
  'border-slate-700/30': 'border-border/30',
  'border-slate-800': 'border-border',
  'border-slate-700': 'border-border',
  'border-slate-600': 'border-input',
  'border-slate-200': 'border-border',
  
  'shadow-slate-950/50': 'shadow-black/10 dark:shadow-black/50',
  'shadow-slate-950/20': 'shadow-black/5 dark:shadow-black/20',
  
  'from-slate-950': 'from-background',
  'via-slate-900': 'via-card',
  'to-slate-950': 'to-background',
  
  'from-slate-900': 'from-card',
  'to-slate-900': 'to-card',
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [...walk('./app'), ...walk('./components')];
let totalUpdated = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  Object.keys(replacements).forEach(key => {
    // Replace the exact class string but ensure it has word boundaries or is preceded/followed by space, quote, or backtick
    const regex = new RegExp(`(?<=["'\\s\`]|:)${key.replace(/\\/g, '\\\\').replace(/\//g, '\\/')}(?=["'\\s\`])`, 'g');
    newContent = newContent.replace(regex, replacements[key]);
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    totalUpdated++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Finished updating ${totalUpdated} files.`);
