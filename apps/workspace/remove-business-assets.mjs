import fs from 'fs';
import path from 'path';

const file = path.resolve('src/domains/calendar/components/calendar-screen.tsx');
let content = fs.readFileSync(file, 'utf-8');

// Remove from type definition
content = content.replace(/assets:\s*Array<\{ id: string; title: string \}>;\n\s*/g, '');
content = content.replace(/assetsLoading:\s*boolean;\n\s*/g, '');

// Remove the `const selectedAsset = assets.find(...)` line
content = content.replace(/const selectedAsset = assets\.find\(\(asset\) => asset\.id === \(form\.assetId\)\);\n\s*/g, '');

// Remove asset from picker options
content = content.replace(/asset:\s*\{\n\s*loading:\s*assetsLoading,\n\s*options:\s*assets\.map\(\(asset\) => \(\{ id: asset\.id, label: asset\.title, icon: <Building2 className="h-4 w-4" \/> \}\)\),\n\s*selectedId:\s*form\.assetId \|\| "",\n\s*\},\n\s*/g, '');

fs.writeFileSync(file, content);
console.log('Successfully removed assets from BusinessScheduleDialog');
