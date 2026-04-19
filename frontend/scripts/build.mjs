import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import browserify from "browserify";
import babelify from "babelify";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const distDir = path.join(rootDir, "dist");
const assetsDir = path.join(distDir, "assets");

await mkdir(assetsDir, { recursive: true });

await copyFile(path.join(rootDir, "index.html"), path.join(distDir, "index.html"));
await runCommand(
  process.execPath,
  [
    path.join(rootDir, "node_modules", "@tailwindcss", "cli", "dist", "index.mjs"),
    "-i",
    path.join(rootDir, "src", "styles.css"),
    "-o",
    path.join(assetsDir, "app.css"),
    "--minify",
  ],
  rootDir,
);

const bundler = browserify(path.join(rootDir, "src", "main.jsx"), {
  extensions: [".js", ".jsx"],
  debug: true,
});

bundler.transform(
  babelify.configure({
    extensions: [".js", ".jsx"],
    presets: [
      ["@babel/preset-env", { targets: { esmodules: true } }],
      ["@babel/preset-react", { runtime: "automatic" }],
    ],
  }),
);

await new Promise((resolve, reject) => {
  const output = createWriteStream(path.join(assetsDir, "app.js"));

  bundler.bundle().on("error", reject).pipe(output);
  output.on("finish", resolve);
  output.on("error", reject);
});

console.log("Frontend build completed in dist/");

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}
