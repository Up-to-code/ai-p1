#!/usr/bin/env node

import { access, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { constants, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const require = createRequire(new URL("../apps/workspace/package.json", import.meta.url));
const sharp = require("sharp");

const root = fileURLToPath(new URL("..", import.meta.url));
const publicSourceDir = path.join(root, "packages", "brand-identity", "assets", "source");
const overrideValue = process.env.QENTRAH_BRAND_ASSET_DIR?.trim();
const sourceDir = overrideValue ? path.resolve(overrideValue) : publicSourceDir;
const sourceKind = overrideValue ? "asset override" : "tracked Qentrah logo source";
const requiredSourceNames = [
  "brand-mark.svg",
  "brand-logo.svg",
  "brand-logo-white.svg",
];

const source = {
  appIcon: path.join(
    sourceDir,
    existsSync(path.join(sourceDir, "app-icon.svg")) ? "app-icon.svg" : "app-icon-mobile.png",
  ),
  brandMarkSvg: path.join(sourceDir, "brand-mark.svg"),
  brandLogoSvg: path.join(sourceDir, "brand-logo.svg"),
  brandLogoWhiteSvg: path.join(sourceDir, "brand-logo-white.svg"),
};

const webApps = ["marketing", "partners", "workspace"];

function appPath(...segments) {
  return path.join(root, "apps", ...segments);
}

async function validateSourceDirectory() {
  try {
    await access(source.appIcon, constants.R_OK);
  } catch {
    throw new Error(
      `Brand asset source is incomplete: ${sourceDir} must contain app-icon.svg or app-icon-mobile.png`,
    );
  }
  for (const name of requiredSourceNames) {
    const file = path.join(sourceDir, name);
    try {
      await access(file, constants.R_OK);
    } catch {
      throw new Error(`Brand asset source is incomplete: missing readable ${file}`);
    }
  }
}

async function ensureParent(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function copyAsset(from, to) {
  await ensureParent(to);
  await copyFile(from, to);
}

async function renderIco(input, output) {
  const png = await sharp(input).resize(256, 256, { fit: "contain" }).png().toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  await ensureParent(output);
  await writeFile(output, Buffer.concat([header, png]));
}

async function renderPng(input, output, width, height = width) {
  await ensureParent(output);
  await sharp(input).resize(width, height, { fit: "contain" }).png().toFile(output);
}

async function renderFaviconSvg(output) {
  const appIcon = await sharp(source.appIcon).resize(512, 512, { fit: "contain" }).png().toBuffer();
  await ensureParent(output);
  await writeFile(
    output,
    `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">\n  <image width="512" height="512" href="data:image/png;base64,${appIcon.toString("base64")}"/>\n</svg>\n`,
  );
}

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function syncMobile() {
  const mobile = appPath("mobile", "assets");
  await renderIco(source.appIcon, path.join(mobile, "brand", "logo.ico"));
  await renderPng(source.appIcon, path.join(mobile, "brand", "qentrah-mobile-icon.png"), 1024);
  await renderPng(source.appIcon, path.join(mobile, "brand", "qentrah-adaptive-icon.png"), 1024);
  await renderPng(source.appIcon, path.join(mobile, "brand", "qentrah-logo.png"), 512);
  await copyAsset(source.brandMarkSvg, path.join(mobile, "brand", "qentrah-logo.svg"));
  await renderPng(source.appIcon, path.join(mobile, "brand", "qentrah-splash-icon.png"), 160);
  await renderPng(source.appIcon, path.join(mobile, "brand", "qentrah-splash-icon-dark.png"), 160);
  await renderPng(source.appIcon, path.join(mobile, "brand", "qentrah-favicon.png"), 512);
  await renderPng(source.appIcon, path.join(mobile, "icon.png"), 512);
  await renderPng(source.appIcon, path.join(mobile, "adaptive-icon.png"), 512);
  await renderPng(source.appIcon, path.join(mobile, "favicon.png"), 48);
  await renderPng(source.appIcon, path.join(mobile, "splash-icon.png"), 48);
  await renderPng(source.appIcon, path.join(mobile, "brand", "qentrah-splash-icon@2x.png"), 320, 352);
  await renderPng(source.appIcon, path.join(mobile, "brand", "qentrah-splash-icon@3x.png"), 480, 528);

  const iosAssets = appPath("mobile", "ios", "Qentrah", "Images.xcassets");
  await renderPng(
    source.appIcon,
    path.join(iosAssets, "AppIcon.appiconset", "App-Icon-1024x1024@1x.png"),
    1024,
  );

  const splashSet = path.join(iosAssets, "SplashScreenLogo.imageset");
  for (const [name, width, height] of [
    ["splash-logo.png", 160, 176],
    ["splash-logo@2x.png", 320, 352],
    ["splash-logo@3x.png", 480, 528],
    ["splash-logo-dark.png", 160, 176],
    ["splash-logo-dark@2x.png", 320, 352],
    ["splash-logo-dark@3x.png", 480, 528],
  ]) {
    await renderPng(source.appIcon, path.join(splashSet, name), width, height);
  }
}

async function syncWebApp(appName) {
  const publicDir = appPath(appName, "public");
  await renderIco(source.appIcon, path.join(publicDir, "logo.ico"));
  await renderPng(source.appIcon, path.join(publicDir, "app-icon-1024.png"), 1024);
  await renderPng(source.appIcon, path.join(publicDir, "app-icon-512.png"), 512);
  await renderPng(source.appIcon, path.join(publicDir, "app-icon-192.png"), 192);
  await renderPng(source.appIcon, path.join(publicDir, "apple-touch-icon.png"), 180);
  await renderFaviconSvg(path.join(publicDir, "favicon.svg"));
  await renderFaviconSvg(path.join(publicDir, "mask-icon.svg"));
  if (appName === "partners") {
    await renderFaviconSvg(path.join(publicDir, "app-icon.svg"));
  }

  await copyAsset(source.brandLogoSvg, path.join(publicDir, "brand-logo.svg"));
  await copyAsset(source.brandLogoWhiteSvg, path.join(publicDir, "brand-logo-white.svg"));
  await copyAsset(source.brandLogoSvg, path.join(publicDir, "logo-derk-color.svg"));
  await copyAsset(source.brandLogoWhiteSvg, path.join(publicDir, "logo-dark-mood.svg"));
}

async function syncWorkspaceAliases() {
  await renderPng(source.appIcon, appPath("workspace", "public", "qwntrah-logo-app.png"), 512);
  await renderPng(source.appIcon, appPath("workspace", "public", "ai", "logo.png"), 512);
}

async function main() {
  await validateSourceDirectory();
  await syncMobile();
  await Promise.all(webApps.map(syncWebApp));
  await syncWorkspaceAliases();

  if (process.platform === "darwin" && !process.argv.includes("--skip-desktop")) {
    await rm(appPath("workspace", "build", "icon.iconset"), { recursive: true, force: true });
    await run("npm", ["--workspace", "@qentrah/workspace", "run", "desktop:assets"], root);
  }

  const sourceDigest = await readFile(source.appIcon).then((value) => value.byteLength);
  console.log(`Brand assets generated from ${sourceKind} (${sourceDigest} byte app icon).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
