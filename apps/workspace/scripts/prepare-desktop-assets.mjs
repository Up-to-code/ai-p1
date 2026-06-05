import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { chromium } from "playwright";

const appRoot = process.cwd();
const buildDir = path.join(appRoot, "build");
const iconsetDir = path.join(buildDir, "icon.iconset");
const sourceIcon = path.join(appRoot, "public", "app-icon-512.png");
const dmgBackgroundSvg = path.join(buildDir, "dmg-background.svg");
const dmgBackgroundPng = path.join(buildDir, "dmg-background.png");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore" });

    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function firstExistingPath(paths) {
  for (const candidate of paths) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Keep looking.
    }
  }

  return undefined;
}

await mkdir(buildDir, { recursive: true });
await rm(iconsetDir, { recursive: true, force: true });
await mkdir(iconsetDir, { recursive: true });

const iconSizes = [
  ["16", "16", "icon_16x16.png"],
  ["32", "32", "icon_16x16@2x.png"],
  ["32", "32", "icon_32x32.png"],
  ["64", "64", "icon_32x32@2x.png"],
  ["128", "128", "icon_128x128.png"],
  ["256", "256", "icon_128x128@2x.png"],
  ["256", "256", "icon_256x256.png"],
  ["512", "512", "icon_256x256@2x.png"],
  ["512", "512", "icon_512x512.png"],
  ["512", "512", "icon_512x512@2x.png"],
];

for (const [height, width, filename] of iconSizes) {
  await run("sips", ["-z", height, width, sourceIcon, "--out", path.join(iconsetDir, filename)]);
}

await run("iconutil", ["-c", "icns", iconsetDir, "-o", path.join(buildDir, "icon.icns")]);
await run("sips", ["-s", "format", "png", sourceIcon, "--out", path.join(buildDir, "icon.png")]);

const dmgBackground = `<svg width="660" height="400" viewBox="0 0 660 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="660" height="400" fill="#121212"/>
  <rect x="0" y="0" width="660" height="400" fill="url(#wash)" opacity="0.72"/>
  <path d="M705 -57L446 400H660V-57H705Z" fill="#02256C" opacity="0.72"/>
  <text x="52" y="76" fill="#F8FBFF" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">Install</text>
  <text x="52" y="108" fill="#D8E6F3" font-family="Arial, Helvetica, sans-serif" font-size="14">Drag Qentrah Workspace into Applications.</text>
  <path d="M306 190H354" stroke="#F8FBFF" stroke-width="4" stroke-linecap="round"/>
  <path d="M342 178L354 190L342 202" stroke="#F8FBFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="660" y2="400" gradientUnits="userSpaceOnUse">
      <stop stop-color="#010B23"/>
      <stop offset="0.54" stop-color="#121212"/>
      <stop offset="1" stop-color="#034C74"/>
    </linearGradient>
  </defs>
</svg>`;

await writeFile(dmgBackgroundSvg, dmgBackground);
await rm(dmgBackgroundPng, { force: true });

const systemChrome = await firstExistingPath([
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
]);
const browser = await chromium.launch({
  headless: true,
  ...(systemChrome ? { executablePath: systemChrome } : {}),
});
try {
  const page = await browser.newPage({ viewport: { width: 660, height: 400 }, deviceScaleFactor: 1 });
  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          html, body { width: 660px; height: 400px; margin: 0; overflow: hidden; background: #121212; }
          svg { display: block; width: 660px; height: 400px; }
        </style>
      </head>
      <body>${dmgBackground}</body>
    </html>
  `);
  await page.screenshot({ path: dmgBackgroundPng, type: "png" });
} finally {
  await browser.close();
}
