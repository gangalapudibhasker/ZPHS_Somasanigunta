const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.join(__dirname, "..");
const apiDir = path.join(rootDir, "src", "app", "api");
const apiBackupDir = path.join(rootDir, "scratch", "_api_backup");

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (fs.existsSync(apiDir)) {
    console.log("Moving src/app/api temporarily for static export...");
    if (fs.existsSync(apiBackupDir)) {
      fs.rmSync(apiBackupDir, { recursive: true, force: true });
    }
    fs.renameSync(apiDir, apiBackupDir);
  }

  console.log("Running Next.js static export build...");
  execSync("npx next build", {
    cwd: rootDir,
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "true" },
  });

  const outDir = path.join(rootDir, "out");
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, ".nojekyll"), "", "utf8");
    fs.writeFileSync(path.join(rootDir, ".nojekyll"), "", "utf8");
    console.log("Copying static export files to repository root for GitHub Pages (main / root)...");
    for (const item of fs.readdirSync(outDir)) {
      const srcPath = path.join(outDir, item);
      const destPath = path.join(rootDir, item);
      copyRecursiveSync(srcPath, destPath);
    }
    console.log("Static export copied successfully!");
  }
} finally {
  if (fs.existsSync(apiBackupDir)) {
    console.log("Restoring src/app/api...");
    fs.renameSync(apiBackupDir, apiDir);
  }
}

