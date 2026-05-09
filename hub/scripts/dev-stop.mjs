import { execFileSync } from "node:child_process";

const projectRoot = process.cwd();
const targets = [
  `${projectRoot}/node_modules/.bin/next dev`,
  `${projectRoot}/node_modules/.bin/convex dev`,
];

function listProcesses() {
  const output = execFileSync("ps", ["-axo", "pid=,command="], {
    encoding: "utf8",
  });

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const firstSpace = line.indexOf(" ");
      return {
        pid: Number(line.slice(0, firstSpace)),
        command: line.slice(firstSpace + 1),
      };
    });
}

const matches = listProcesses().filter((processInfo) =>
  targets.some((target) => processInfo.command.includes(target)),
);

for (const processInfo of matches) {
  process.kill(processInfo.pid, "SIGTERM");
}

console.log(
  matches.length > 0
    ? `Stopped ${matches.length} local dev process(es).`
    : "No local Next/Convex dev processes found.",
);
