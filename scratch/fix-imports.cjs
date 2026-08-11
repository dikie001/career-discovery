const fs = require('fs');

const files = [
  "app/dashboard/discover/page.tsx",
  "app/dashboard/onboarding/page.tsx",
  "app/dashboard/profile/page.tsx",
  "app/dashboard/stats/page.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove the badly placed import
  content = content.replace(/import\s*\{\s*apiFetch\s*\}\s*from\s*"@\/lib\/api-client";\r?\n?/g, '');
  content = content.replace(/import\s*\{\s*apiFetch\s*\}\s*from\s*'@\/lib\/api-client';\r?\n?/g, '');
  
  // Add it properly after the first import line
  const importLines = content.split('\n');
  let newLines = [];
  let added = false;
  
  for (let i = 0; i < importLines.length; i++) {
    newLines.push(importLines[i]);
    if (!added && importLines[i].startsWith('import ')) {
       newLines.push('import { apiFetch } from "@/lib/api-client";');
       added = true;
    }
  }
  
  fs.writeFileSync(file, newLines.join('\n'), 'utf8');
}
console.log("Imports fixed");
