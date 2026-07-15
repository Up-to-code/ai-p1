#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(new URL("../apps/workspace/package.json", import.meta.url));
const sharp = require("sharp");
const root = fileURLToPath(new URL("..", import.meta.url));

const rasterPaths = [
  "apps/marketing/public/images/hero-bg-dark.png",
  "apps/marketing/public/images/hero-bg-light.png",
  "apps/marketing/public/imgi_72_image.webp",
  "apps/marketing/public/imgi_73_image.webp",
  "apps/marketing/public/imgi_74_image.webp",
  "apps/marketing/public/landing-images/agent-capability-1.png",
  "apps/marketing/public/landing-images/agent-capability-2.png",
  "apps/marketing/public/landing-images/agent-capability-3.png",
  "apps/marketing/public/landing-images/ai-section.png",
  "apps/marketing/public/landing-images/clients-section.png",
  "apps/marketing/public/landing-images/communication-section.png",
  "apps/marketing/public/landing-images/doc-section.png",
  "apps/marketing/public/landing-images/problem-section.png",
  "apps/marketing/public/landing-images/solution-section.png",
  "apps/marketing/public/landing-images/task-section.png",
  "apps/marketing/public/landing-images/white.png",
  "apps/marketing/public/security/permission-lock.webp",
  "apps/marketing/public/security/scoped-integration.webp",
  "apps/marketing/public/security/workspace-data.webp",
  "apps/mobile/assets/banner_search.png",
  "apps/mobile/assets/places/maadi.png",
  "apps/mobile/assets/places/new_cairo.png",
  "apps/mobile/assets/places/new_capital.png",
  "apps/mobile/assets/places/north_coast.png",
  "apps/mobile/assets/places/october_city.png",
  "apps/mobile/assets/places/sheikh_zayed.png",
  "apps/workspace/public/images/docs/template-covers.jpg",
];

const neutralSvgPaths = [
  "apps/mobile/assets/icons/apple_logo.svg",
  "apps/mobile/assets/icons/google_logo.svg",
  "apps/workspace/public/brands/mcp/chatgpt.svg",
  "apps/workspace/public/brands/mcp/claude.svg",
  "apps/workspace/public/brands/mcp/grok.svg",
  "apps/workspace/public/brands/mcp/openai.svg",
  "apps/workspace/public/brands/mcp/vscode.svg",
  "apps/workspace/public/icons/clickup/activity.svg",
  "apps/workspace/public/icons/clickup/ai-sparkle.svg",
  "apps/workspace/public/icons/clickup/bar-chart-filled.svg",
  "apps/workspace/public/icons/clickup/bar-chart.svg",
  "apps/workspace/public/icons/clickup/calendar.svg",
  "apps/workspace/public/icons/clickup/clipboard-check.svg",
  "apps/workspace/public/icons/clickup/clock.svg",
  "apps/workspace/public/icons/clickup/expand-arrows.svg",
  "apps/workspace/public/icons/clickup/file-text.svg",
  "apps/workspace/public/icons/clickup/folder.svg",
  "apps/workspace/public/icons/clickup/home.svg",
  "apps/workspace/public/icons/clickup/kanban.svg",
  "apps/workspace/public/icons/clickup/link.svg",
  "apps/workspace/public/icons/clickup/list.svg",
  "apps/workspace/public/icons/clickup/menu.svg",
  "apps/workspace/public/icons/clickup/table.svg",
  "apps/workspace/public/icons/clickup/user-plus.svg",
];

function placeholderSvg(width, height) {
  const radius = Math.max(8, Math.round(Math.min(width, height) * 0.04));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" rx="${radius}" fill="#eef2f6"/>
  <path d="M0 ${height} L${width} 0 V${height} Z" fill="#dde5ee"/>
  <circle cx="${Math.round(width * 0.28)}" cy="${Math.round(height * 0.32)}" r="${Math.max(4, Math.round(Math.min(width, height) * 0.08))}" fill="#9aa8b8"/>
  <rect x="${Math.round(width * 0.18)}" y="${Math.round(height * 0.6)}" width="${Math.round(width * 0.64)}" height="${Math.max(4, Math.round(height * 0.06))}" rx="4" fill="#9aa8b8"/>
</svg>`);
}

async function replaceRaster(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const metadata = await sharp(await readFile(absolutePath)).metadata();
  const width = metadata.width ?? 1024;
  const height = metadata.height ?? 768;
  let image = sharp(placeholderSvg(width, height));
  if (metadata.format === "jpeg") image = image.jpeg({ quality: 88 });
  else if (metadata.format === "webp") image = image.webp({ quality: 88 });
  else image = image.png();
  await image.toFile(absolutePath);
}

const neutralIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.8"/>
  <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>\n`;

await Promise.all(rasterPaths.map(replaceRaster));
await Promise.all(neutralSvgPaths.map((relativePath) => writeFile(path.join(root, relativePath), neutralIcon)));
console.log(`Replaced ${rasterPaths.length} raster files and ${neutralSvgPaths.length} SVG files with neutral public placeholders.`);
