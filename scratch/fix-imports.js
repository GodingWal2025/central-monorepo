const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const filesToUpdate = [
  'apps/gxo-loadout/src/routes/CapturePicklistRoute.tsx',
  'apps/gxo-loadout/src/routes/CaptureReturnsStagingRoute.tsx',
  'apps/gxo-loadout/src/routes/VerifyReturnsRoute.tsx',
  'apps/gxo-loadout/src/routes/VerifyRoute.tsx',
  'apps/gxo-loadout/src/routes/CaptureReturnsBOLRoute.tsx',
  'apps/gxo-loadout/src/routes/CaptureBOLRoute.tsx',
  'apps/gxo-loadout/src/services/sites.ts',
  'apps/gxo-loadout/src/services/stagingLocations.ts'
];

for (const file of filesToUpdate) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('generateId') && !content.includes('import { generateId }')) {
    if (content.includes("import { generateId,") || content.includes(", generateId }")) {
      continue;
    }
    content = "import { generateId } from '@gxo/semantic';\n" + content;
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
