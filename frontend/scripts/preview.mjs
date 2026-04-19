import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT) || 4173;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

function sendFile(res, filePath, file) {
  const ext = path.extname(filePath);

  res.writeHead(200, {
    "Content-Type": contentTypes[ext] || "application/octet-stream",
  });
  res.end(file);
}

function shouldServeAppShell(req, requestPath) {
  const acceptsHtml = (req.headers.accept || "").includes("text/html");
  const hasFileExtension = path.extname(requestPath) !== "";

  return acceptsHtml && !hasFileExtension;
}

const server = createServer(async (req, res) => {
  const requestPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const safePath = requestPath.replace(/^\/+/, "");
  const filePath = path.join(distDir, safePath);

  try {
    const file = await readFile(filePath);
    sendFile(res, filePath, file);
  } catch {
    if (shouldServeAppShell(req, requestPath)) {
      try {
        const appShell = await readFile(path.join(distDir, "index.html"));
        sendFile(res, path.join(distDir, "index.html"), appShell);
        return;
      } catch {
        // Fall through to the existing 404 if the app shell is missing.
      }
    }

    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("Not found. Run npm run build first.");
  }
});

server.listen(port, () => {
  console.log(`Preview server running at http://127.0.0.1:${port}`);
});
