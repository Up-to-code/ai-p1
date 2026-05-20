"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");

exports.default = async function afterPack(context) {
  const source = path.join(context.packager.projectDir, ".next", "standalone", "node_modules");
  const target = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`,
    "Contents",
    "Resources",
    "standalone",
    "node_modules",
  );

  await fs.rm(target, { recursive: true, force: true });
  await fs.cp(source, target, {
    recursive: true,
    dereference: false,
  });
};
