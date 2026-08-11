const fs = require('fs');
const path = require('path');

const files = [
  "app/dashboard/discover/page.tsx",
  "app/dashboard/onboarding/page.tsx",
  "app/dashboard/page.tsx",
  "app/dashboard/profile/page.tsx",
  "app/dashboard/roadmaps/page.tsx",
  "app/dashboard/skill-gap/page.tsx",
  "app/dashboard/stats/page.tsx",
  "components/dashboard/ai-chat.tsx"
];

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('fetch("/api') || content.includes("fetch('/api")) {
    content = content.replace(/fetch\("\/api/g, 'apiFetch("/api');
    content = content.replace(/fetch\('\/api/g, 'apiFetch(\'/api');
    
    // Add import if not present
    if (!content.includes('import { apiFetch }')) {
      const importRegex = /^import\s+.*$/gm;
      const lastImportMatch = [...content.matchAll(importRegex)].pop();
      
      if (lastImportMatch) {
        const insertPos = lastImportMatch.index + lastImportMatch[0].length;
        content = content.slice(0, insertPos) + '\nimport { apiFetch } from "@/lib/api-client";' + content.slice(insertPos);
      } else {
        content = 'import { apiFetch } from "@/lib/api-client";\n' + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
