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
  appIcon: path.join(root, "Branding", "qwntrah-logo-app.png"),
  webIcon: path.join(root, "Branding", "qentrahlogo.png"),
  brandMarkSvg: path.join(sourceDir, "brand-mark.svg"),
  brandLogoSvg: path.join(sourceDir, "brand-logo.svg"),
  brandLogoWhiteSvg: path.join(sourceDir, "brand-logo-white.svg"),
};

const webApps = ["marketing", "partners", "workspace"];

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

async function syncFaviconIco(appName) {
  const icoDest = appName === "mobile"
    ? appPath("mobile", "assets", "brand", "logo.ico")
    : appPath(appName, "public", "logo.ico");
  await renderIco(appName === "mobile" ? source.appIcon : source.webIcon, icoDest);
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

async function renderDesktopSafeIcon(output, size) {
  await ensureParent(output);
  await sharp(source.webIcon)
    .resize(size, size, { fit: "contain" })
    .png()
    .toFile(output);
}

async function renderFaviconSvg(output) {
  const appIcon = await sharp(source.webIcon).resize(512, 512, { fit: "contain" }).png().toBuffer();
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
  await syncFaviconIco("mobile");
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
}

async function syncWebApp(appName) {
  const publicDir = appPath(appName, "public");
  await syncFaviconIco(appName);
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

  await renderPng(source.appIcon, appPath("workspace", "public", "qwntrah-logo-app.png"), 512);
}

async function main() {
  await renderIco(source.webIcon, path.join(root, "Branding", "logo.ico"));
  await syncMobile();
  await Promise.all(webApps.map(syncWebApp));
  await syncLogos();

  await rm(appPath("workspace", "build", "icon.iconset"), { recursive: true, force: true });
  await run("npm", ["--workspace", "@qentrah/workspace", "run", "desktop:assets"], root);

  console.log("App icons synced from Branding/qwntrah-logo-app.png; website icons synced from Branding/qentrahlogo.png.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
