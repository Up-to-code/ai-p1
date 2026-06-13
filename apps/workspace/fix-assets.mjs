import fs from 'fs';
import path from 'path';

const file = path.resolve('src/domains/calendar/components/calendar-screen.tsx');
let content = fs.readFileSync(file, 'utf-8');

// 1. Remove LinkedAssetCard component
const linkedAssetStart = content.indexOf('function LinkedAssetCard({');
if (linkedAssetStart > -1) {
  const nextFuncStart = content.indexOf('function ', linkedAssetStart + 10);
  content = content.substring(0, linkedAssetStart) + (nextFuncStart > -1 ? content.substring(nextFuncStart) : '');
}

// 2. Remove AssetQuickView component
const quickViewStart = content.indexOf('function AssetQuickView({');
if (quickViewStart > -1) {
  const nextFuncStart = content.indexOf('function ', quickViewStart + 10);
  content = content.substring(0, quickViewStart) + (nextFuncStart > -1 ? content.substring(nextFuncStart) : '');
}

// 3. Remove usage in ClientSheet
content = content.replace(/\{assetLinks\.map\(\(entry\) => \([\s\S]*?<\/LinkedAssetCard>\n\s*\)\)}/g, '');
content = content.replace(/\{!assetLinks \|\| assetLinks\.length === 0 \? \([\s\S]*?No linked assets[\s\S]*?\) : \(/g, '');
content = content.replace(/<LinkedAssetCard[\s\S]*?\/>/g, '');

// 4. Remove usage in QuickView modal
content = content.replace(/\{entity\.type === "asset" && <AssetQuickView assetId=\{entity\.id\} onClose=\{onClose\} \/>\}/g, '');

// 5. Remove usage in EventDetailDialog
content = content.replace(/\{\(event\.assetTitle \|\| event\.assetId\) && \([\s\S]*?<\/PropertyRow>\n\s*\)\}/g, '');

fs.writeFileSync(file, content);
console.log('Successfully fixed asset usages');
