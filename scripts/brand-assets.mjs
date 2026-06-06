#!/usr/bin/env node
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const require = createRequire(new URL("../apps/workspace/package.json", import.meta.url));
const sharp = require("sharp");

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = path.join(root, "packages", "brand-identity", "assets", "source");
const source = {
  mobileIcon: path.join(sourceDir, "app-icon-mobile.png"),
  brandMarkPng: path.join(sourceDir, "brand-mark.png"),
  brandMarkSvg: path.join(sourceDir, "brand-mark.svg"),
  brandLogoSvg: path.join(sourceDir, "brand-logo.svg"),
  brandLogoWhiteSvg: path.join(sourceDir, "brand-logo-white.svg"),
  mobileSplashLight: path.join(sourceDir, "mobile-splash-light.png"),
  mobileSplashDark: path.join(sourceDir, "mobile-splash-dark.png"),
};

const webApps = ["admin", "marketing", "partners", "workspace"];

function appPath(...segments) {
  return path.join(root, "apps", ...segments);
}

async function ensureParent(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function copyAsset(from, to) {
  await ensureParent(to);
  await copyFile(from, to);
}

async function renderPng(input, output, width, height = width) {
  await ensureParent(output);
  await sharp(input).resize(width, height, { fit: "contain" }).png().toFile(output);
}

async function renderDesktopSafeIcon(output, size) {
  const masterSize = 1024;
  const insetSize = 840;
  const offset = Math.round((masterSize - insetSize) / 2);
  const inner = await sharp(source.mobileIcon).resize(insetSize, insetSize, { fit: "contain" }).png().toBuffer();

  const master = await sharp({
    create: {
      width: masterSize,
      height: masterSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: inner, left: offset, top: offset }])
    .png()
    .toBuffer();

  await ensureParent(output);
  await sharp(master)
    .resize(size, size, { fit: "contain" })
    .png()
    .toFile(output);
}

async function renderFaviconSvg(output) {
  const dataUrl = `data:image/png;base64,${(await sharp(source.mobileIcon).resize(512, 512).png().toBuffer()).toString("base64")}`;
  await ensureParent(output);
  await writeFile(
    output,
    `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">\n  <image href="${dataUrl}" width="512" height="512"/>\n</svg>\n`,
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
  await copyAsset(source.mobileIcon, path.join(mobile, "brand", "qentrah-mobile-icon.png"));
  await copyAsset(source.mobileIcon, path.join(mobile, "brand", "qentrah-adaptive-icon.png"));
  await copyAsset(source.brandMarkPng, path.join(mobile, "brand", "qentrah-logo.png"));
  await copyAsset(source.brandMarkSvg, path.join(mobile, "brand", "qentrah-logo.svg"));
  await copyAsset(source.mobileSplashLight, path.join(mobile, "brand", "qentrah-splash-icon.png"));
  await copyAsset(source.mobileSplashDark, path.join(mobile, "brand", "qentrah-splash-icon-dark.png"));

  await renderPng(source.mobileIcon, path.join(mobile, "brand", "qentrah-favicon.png"), 512);
  await renderPng(source.mobileIcon, path.join(mobile, "icon.png"), 512);
  await renderPng(source.mobileIcon, path.join(mobile, "adaptive-icon.png"), 512);
  await renderPng(source.mobileIcon, path.join(mobile, "favicon.png"), 48);
  await renderPng(source.mobileSplashLight, path.join(mobile, "splash-icon.png"), 48);
  await renderPng(source.mobileSplashLight, path.join(mobile, "brand", "qentrah-splash-icon@2x.png"), 320, 352);
  await renderPng(source.mobileSplashLight, path.join(mobile, "brand", "qentrah-splash-icon@3x.png"), 480, 528);
}

async function syncWebApp(appName) {
  const publicDir = appPath(appName, "public");
  await renderDesktopSafeIcon(path.join(publicDir, "app-icon-1024.png"), 1024);
  await renderDesktopSafeIcon(path.join(publicDir, "app-icon-512.png"), 512);
  await renderDesktopSafeIcon(path.join(publicDir, "app-icon-192.png"), 192);
  await renderDesktopSafeIcon(path.join(publicDir, "apple-touch-icon.png"), 180);
  await renderFaviconSvg(path.join(publicDir, "favicon.svg"));
  await renderFaviconSvg(path.join(publicDir, "mask-icon.svg"));
  if (appName === "partners") {
    await renderFaviconSvg(path.join(publicDir, "app-icon.svg"));
  }
}

async function syncLogos() {
  for (const appName of ["marketing", "partners", "workspace"]) {
    const publicDir = appPath(appName, "public");
    await copyAsset(source.brandLogoSvg, path.join(publicDir, "brand-logo.svg"));
    await copyAsset(source.brandLogoWhiteSvg, path.join(publicDir, "brand-logo-white.svg"));
  }

  await renderFaviconSvg(appPath("demo-partner-app", "public", "favicon.svg"));
}

async function main() {
  await syncMobile();
  await Promise.all(webApps.map(syncWebApp));
  await syncLogos();

  await rm(appPath("workspace", "build", "icon.iconset"), { recursive: true, force: true });
  await run("npm", ["--workspace", "@qentrah/workspace", "run", "desktop:assets"], root);

  console.log("Brand assets synced from packages/brand-identity/assets/source.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
