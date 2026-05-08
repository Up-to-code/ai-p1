import fs from 'node:fs';
const path = 'messages/ar.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const autoUi = data.AutoUi;
if (autoUi) {
  const newAutoUi = {};
  for (const [key, value] of Object.entries(autoUi)) {
    const newKey = key.replace(/\./g, '___');
    newAutoUi[newKey] = value;
  }
  data.AutoUi = newAutoUi;
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  console.log('Fixed ar.json AutoUi keys');
} else {
  console.log('AutoUi not found in ar.json');
}
