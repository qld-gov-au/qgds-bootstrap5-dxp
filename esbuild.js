/* global process */
// ESBUILD PROJECT DEPENDENCIES
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar'); // Added chokidar for file watching

// Get command-line arguments
const args = process.argv.slice(2);
const isLocalBuild = args.includes('--local');
const isDevBuild = args.includes('--dev');
const isWatchBuild = args.includes('--watch');

// Directory paths
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Get the version from package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const packageVersion = packageJson.version;

function getTimestamp() {
  const now = new Date();
  const month = String(now.getMonth());
  const day = String(now.getDate());
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${month}${day}${hours}${minutes}`;
}

// Add a timestamp only if it's a dev build
const timestamp = `${getTimestamp()}`

// Function to find all files in src directory
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}


// Copy non-CJS and non-CSS files to dist directory
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} to ${dest}`);
}

// Update the version in manifest.json files
function updateManifestVersion(manifestPath) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const oldVersion = manifest.version;
  const version = isDevBuild ? `${packageVersion}${getTimestamp()}` : `${packageVersion}`;
  const namespace = isDevBuild ? `qgds-bs5-dev` : `qgds-bs5`;
  const namespaceLayout = isDevBuild ? `qgds-bs5-layout-dev` : `qgds-bs5-layout`;

  if (!isLocalBuild) {
    manifest.version = version;
  }

  if (manifestPath.includes("dist/layout/")){
    manifest.namespace = namespaceLayout;
  } else {
    manifest.namespace = namespace;
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`Updated version in ${manifestPath} to ${version} with namespace ${namespace}`);
}

function processFile(file) {
  const relativePath = path.relative(srcDir, file);
  const outFile = path.join(distDir, relativePath);

  if (file.endsWith('.cjs')) {
    esbuild.buildSync({
      entryPoints: [file],
      outfile: outFile,
      minify: !isDevBuild,
      sourcemap: isDevBuild,
      treeShaking: true,
      bundle: true,
      format: 'cjs',
      platform: 'node',
    });

    console.log(`Built ${file} to ${outFile}`);
  } else if (file.endsWith('manifest.json')) {
    // Update the version in manifest.json and copy to dist
    const tempManifestPath = path.join(distDir, relativePath);
    copyFile(file, tempManifestPath);
    updateManifestVersion(tempManifestPath);
  }  else if (file.endsWith('.css')) {
    // Process CSS files with esbuild
    esbuild.buildSync({
      entryPoints: [file],
      outfile: outFile,
      minify: !isDevBuild,
      sourcemap: isDevBuild
    });
    console.log(`Processed CSS ${file} to ${outFile}`);
  } else if (file.endsWith('.scss')) {
    // Process SCSS files with esbuild and esbuild-sass-plugin
    esbuild.buildSync({
      entryPoints: [file],
      outfile: outFile.replace('.scss', '.css'),
      bundle: true,
      minify: !isDevBuild,
      sourcemap: isDevBuild,
      plugins: [sassPlugin()],
    });
    console.log(`Processed SCSS ${file} to ${outFile.replace('.scss', '.css')}`);
  } else {
    // Copy non-CJS, non-CSS files
    copyFile(file, outFile);
  }
}

console.log("clean dist")
if (fs.existsSync("./dist")) {
  fs.rmSync("./dist", { recursive: true });
}


const files = findFiles(srcDir);
files.forEach((file) => {
  processFile(file);
});

if (isWatchBuild) {
  chokidar.watch(srcDir, { ignoreInitial: true }).on('all', (event, filePath) => {
    if (fs.existsSync(filePath) && !fs.lstatSync(filePath).isDirectory()) {
      console.log(`File ${event}: ${filePath}`);
      processFile(filePath);
    }
  });

  console.log('Watching for changes...');
}