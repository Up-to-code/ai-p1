"use strict";

const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");

let workspaceServer = null;

function getDesktopIconPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "standalone", "apps", "workspace", "public", "app-icon-512.png")
    : path.join(__dirname, "..", "public", "app-icon-512.png");
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (!address || typeof address === "string") {
          reject(new Error("Could not allocate a local port."));
          return;
        }

        resolve(address.port);
      });
    });
  });
}

function waitForServer(url, timeoutMs = 30_000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      fetch(url, { method: "HEAD" })
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - startedAt > timeoutMs) {
            reject(new Error(`Workspace server did not start at ${url}`));
            return;
          }

          setTimeout(check, 300);
        });
    };

    check();
  });
}

async function getWorkspaceUrl() {
  if (!app.isPackaged) {
    const developmentUrl = process.env.ELECTRON_START_URL || "http://localhost:3000";
    await waitForServer(developmentUrl);
    return developmentUrl;
  }

  const port = await getFreePort();
  const appRoot = path.join(process.resourcesPath, "standalone", "apps", "workspace");
  const serverPath = path.join(appRoot, "server.js");

  workspaceServer = spawn(process.execPath, [serverPath], {
    cwd: appRoot,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      HOSTNAME: "127.0.0.1",
      PORT: String(port),
      QENTRAH_DESKTOP: "1",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || `http://127.0.0.1:${port}`,
      SITE_URL: process.env.SITE_URL || `http://127.0.0.1:${port}`,
    },
    stdio: app.isPackaged ? "pipe" : "inherit",
  });

  if (workspaceServer.stdout) {
    workspaceServer.stdout.on("data", (chunk) => console.log(String(chunk).trimEnd()));
  }

  if (workspaceServer.stderr) {
    workspaceServer.stderr.on("data", (chunk) => console.error(String(chunk).trimEnd()));
  }

  workspaceServer.once("exit", (code) => {
    if (code !== 0 && !app.isQuitting) {
      console.error(`Workspace server exited with code ${code}`);
    }
  });

  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url);
  return url;
}

async function createWindow() {
  const workspaceUrl = await getWorkspaceUrl();
  const iconPath = getDesktopIconPath();
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1120,
    minHeight: 720,
    title: "Qentrah Workspace",
    icon: iconPath,
    backgroundColor: "#0a1020",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  await mainWindow.loadURL(workspaceUrl);
}

app.whenReady().then(() => {
  if (process.platform === "darwin" && app.dock) {
    app.dock.setIcon(getDesktopIconPath());
  }

  createWindow().catch((error) => {
    console.error(error);
    app.quit();
  });
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch((error) => {
      console.error(error);
      app.quit();
    });
  }
});

app.on("before-quit", () => {
  app.isQuitting = true;

  if (workspaceServer) {
    workspaceServer.kill();
    workspaceServer = null;
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
