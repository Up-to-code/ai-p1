"use strict";

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("qentrahDesktop", {
  platform: process.platform,
});
