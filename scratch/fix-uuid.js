const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const filesToUpdate = [
  'packages/semantic/src/services/inspectors.ts',
  'packages/semantic/src/hooks/useInspection.ts',
  'packages/semantic/src/camera/PhotoCapture.tsx',
  'apps/gxo-loadout/src/services/sites.ts',
  'apps/gxo-loadout/src/services/stagingLocations.ts',
  'apps/gxo-loadout/src/routes/CapturePicklistRoute.tsx',
  'apps/gxo-loadout/src/routes/CaptureReturnsStagingRoute.tsx',
  'apps/gxo-loadout/src/routes/VerifyReturnsRoute.tsx',
  'apps/gxo-loadout/src/routes/VerifyRoute.tsx',
  'apps/gxo-loadout/src/routes/CaptureReturnsBOLRoute.tsx',
  'apps/gxo-loadout/src/routes/CaptureBOLRoute.tsx'
];

for (const file of filesToUpdate) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${fullPath} - not found`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('crypto.randomUUID()')) {
    content = content.replace(/crypto\.randomUUID\(\)/g, 'generateId()');
    
    // Add import statement at top
    // For packages/semantic, import from '../utils/uuid' or similar depending on depth
    // For apps/gxo-loadout, import from '@gxo/semantic'
    if (file.startsWith('apps/gxo-loadout/')) {
      if (!content.includes("import {") || (!content.includes('generateId') && content.includes('@gxo/semantic'))) {
        content = content.replace(/import \{([^}]+)\} from '@gxo\/semantic';/, "import {$1, generateId} from '@gxo/semantic';");
      }
      if (!content.includes('generateId')) {
         content = "import { generateId } from '@gxo/semantic';\n" + content;
      }
    } else {
      // internal to semantic package
      const depth = file.split('/').length - 4; // packages/semantic/src/ = 3 + filename = 4
      const prefix = depth === 0 ? './' : '../'.repeat(depth);
      content = `import { generateId } from '${prefix}utils/uuid';\n` + content;
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
