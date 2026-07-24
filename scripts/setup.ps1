Set-Location $PSScriptRoot\..
npm install
npx prisma generate
npx prisma db push --accept-data-loss
npx tsx prisma/seed-roadmaps.ts
