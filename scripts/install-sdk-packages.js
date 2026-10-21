const { spawn } = require('child_process');
const path = require('path');

const USER_HOME = process.env.USERPROFILE || 'C:\\Users\\CHRISTOPHER';
const SDKMANAGER = path.join(USER_HOME, 'Android', 'Sdk', 'cmdline-tools', 'latest', 'bin', 'sdkmanager.bat');

function runCommand(args, input) {
  return new Promise((resolve, reject) => {
    console.log(`[SDK] Running: ${path.basename(SDKMANAGER)} ${args.join(' ')}`);
    const proc = spawn(SDKMANAGER, args, {
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true,
      env: {
        ...process.env,
        ANDROID_HOME: path.join(USER_HOME, 'Android', 'Sdk'),
        ANDROID_SDK_ROOT: path.join(USER_HOME, 'Android', 'Sdk')
      }
    });

    if (input) {
      // Auto-feed 'y' for license agreements
      const interval = setInterval(() => {
        try {
          proc.stdin.write('y\n');
        } catch (e) {
          clearInterval(interval);
        }
      }, 500);

      proc.on('close', (code) => {
        clearInterval(interval);
        if (code === 0) resolve();
        else reject(new Error(`Exited with code ${code}`));
      });
    } else {
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Exited with code ${code}`));
      });
    }
  });
}

async function main() {
  try {
    console.log('[SDK] Accepting all Android SDK licenses...');
    await runCommand(['--licenses'], true);

    console.log('[SDK] Installing platform-tools, platforms;android-36, build-tools;36.0.0...');
    await runCommand(['platform-tools', 'platforms;android-36', 'build-tools;36.0.0'], true);

    console.log('[SDK] Android SDK components installed successfully!');
  } catch (err) {
    console.error('[SDK] Error during installation:', err);
    process.exit(1);
  }
}

main();
