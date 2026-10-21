const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const USER_HOME = process.env.USERPROFILE || 'C:\\Users\\CHRISTOPHER';
const SDK_DIR = path.join(USER_HOME, 'Android', 'Sdk');
const CMDLINE_TOOLS_DIR = path.join(SDK_DIR, 'cmdline-tools');
const LATEST_TOOLS_DIR = path.join(CMDLINE_TOOLS_DIR, 'latest');
const ZIP_PATH = path.join(USER_HOME, 'commandlinetools-win.zip');
const DOWNLOAD_URL = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip';

console.log('[Setup-SDK] Target Android SDK Directory:', SDK_DIR);

// 1. Create directory structure
if (!fs.existsSync(CMDLINE_TOOLS_DIR)) {
  fs.mkdirSync(CMDLINE_TOOLS_DIR, { recursive: true });
}

// 2. Download zip if not already extracted
if (!fs.existsSync(path.join(LATEST_TOOLS_DIR, 'bin', 'sdkmanager.bat'))) {
  if (!fs.existsSync(ZIP_PATH)) {
    console.log('[Setup-SDK] Downloading Android command line tools (153MB)...');
    execSync(`curl.exe -L -o "${ZIP_PATH}" "${DOWNLOAD_URL}"`, { stdio: 'inherit' });
  }

  console.log('[Setup-SDK] Extracting command line tools...');
  const tempExtract = path.join(CMDLINE_TOOLS_DIR, '_temp');
  if (fs.existsSync(tempExtract)) {
    fs.rmSync(tempExtract, { recursive: true, force: true });
  }
  fs.mkdirSync(tempExtract, { recursive: true });

  execSync(`powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${tempExtract}' -Force"`, { stdio: 'inherit' });

  // Move cmdline-tools internal folder to 'latest'
  const extractedCmdline = path.join(tempExtract, 'cmdline-tools');
  if (fs.existsSync(LATEST_TOOLS_DIR)) {
    fs.rmSync(LATEST_TOOLS_DIR, { recursive: true, force: true });
  }
  fs.renameSync(extractedCmdline, LATEST_TOOLS_DIR);
  fs.rmSync(tempExtract, { recursive: true, force: true });

  if (fs.existsSync(ZIP_PATH)) {
    fs.unlinkSync(ZIP_PATH);
  }
  console.log('[Setup-SDK] Command line tools installed to:', LATEST_TOOLS_DIR);
} else {
  console.log('[Setup-SDK] Command line tools already present in:', LATEST_TOOLS_DIR);
}

// 3. Configure android/local.properties
const localPropertiesPath = path.resolve(__dirname, '../android/local.properties');
const escapedSdkDir = SDK_DIR.replace(/\\/g, '\\\\');
fs.writeFileSync(localPropertiesPath, `sdk.dir=${escapedSdkDir}\n`);
console.log('[Setup-SDK] Written android/local.properties with sdk.dir');

console.log('[Setup-SDK] Base setup complete!');
