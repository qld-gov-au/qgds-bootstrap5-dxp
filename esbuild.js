/* global process */
// ESBUILD PROJECT DEPENDENCIES
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Get command-line arguments
const args = process.argv.slice(2);
const isDevBuild = args.includes('--dev');

// Directory paths
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Get the version from package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const packageVersion = packageJson.version;

function getTimestamp() {
  const now = new Date();
  const day = String(now.getDate());
  const hours = String(now.getHours()).padStart(2, '0');

  return `${day}${hours}`;
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
    manifest.version = version;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`Updated version in ${manifestPath} to ${version}`);

}

// Get all main.cjs files
const files = findFiles(srcDir);
files.forEach((file) => {
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
      sourcemap: isDevBuild,
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
});