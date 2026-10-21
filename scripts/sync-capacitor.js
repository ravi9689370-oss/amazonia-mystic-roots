#!/usr/bin/env node
/**
 * Reads APP_NAME from src/config.js (the ONE place it lives) and generates:
 *   - capacitor.config.json   (appName + webDir: dist)
 *   - assets/icon.svg, assets/splash.svg   (for @capacitor/assets icon generation)
 *   - public/icon.svg         (favicon/favicon for the Vite build output)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const configSrc = fs.readFileSync(path.join(root, 'src', 'config.js'), 'utf8');

const nameMatch = configSrc.match(/APP_NAME\s*=\s*["'`]([^"'`]+)["'`]/);
const appName = nameMatch ? nameMatch[1].trim() : 'APP_NAME_HERE';

const appIdMatch = configSrc.match(/APP_ID\s*=\s*["'`]([^"'`]+)["'`]/);
const appId = appIdMatch ? appIdMatch[1].trim() : 'com.mysticroots.amazonia';

const capacitorConfig = {
  appId,
  appName,
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

fs.writeFileSync(
  path.join(root, 'capacitor.config.json'),
  JSON.stringify(capacitorConfig, null, 2) + '\n'
);

const iconSrc = path.join(root, 'icon.svg');
if (fs.existsSync(iconSrc)) {
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
  fs.copyFileSync(iconSrc, path.join(root, 'assets', 'icon.svg'));
  fs.copyFileSync(iconSrc, path.join(root, 'assets', 'splash.svg'));
  fs.copyFileSync(iconSrc, path.join(root, 'public', 'icon.svg'));
}

console.log(`[sync-capacitor] appName = "${appName}", appId = "${appId}", webDir = "dist"`);
console.log('[sync-capacitor] capacitor.config.json + icon assets are ready.');
