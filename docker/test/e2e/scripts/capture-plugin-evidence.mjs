#!/usr/bin/env node
/**
 * SPL-1926 Frontend Screenshot Evidence Capture
 *
 * Captures one screenshot per plugin dashboard (Umbraco 17 Settings section, Lit3 backoffice).
 * Screenshots are saved to <outputBase>/<pluginName>/dashboard.png
 * Console errors are saved to <outputBase>/<pluginName>/console-errors.json
 *
 * Usage:
 *   node capture-plugin-evidence.mjs <base-url> <output-base-dir>
 *
 * Example (U17):
 *   UMBRACO_ADMIN_USER=admin@splatdev.com UMBRACO_ADMIN_PASS=SplatDev123! \
 *   node capture-plugin-evidence.mjs http://localhost:5000 \
 *   /repo/test-environments/Umbraco17.Baseline/docs/e2e
 *
 * Example (U13):
 *   UMBRACO_ADMIN_USER=admin@splatdev.com UMBRACO_ADMIN_PASS=SplatDev123! \
 *   node capture-plugin-evidence.mjs http://localhost:5001 \
 *   /repo/test-environments/Umbraco13.Baseline/docs/e2e
 */

import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const BASE_URL = process.argv[2] || 'http://localhost:5000';
const OUTPUT_BASE = resolve(process.argv[3] || '/tmp/screenshots');
const VERSION = process.argv[4] || 'u17'; // 'u17' or 'u13'

const ADMIN_USER = process.env.UMBRACO_ADMIN_USER || 'admin@splatdev.com';
const ADMIN_PASS = process.env.UMBRACO_ADMIN_PASS || 'SplatDev123!';

// U17 (Lit3) plugins — Settings section, route: /umbraco/settings/<pathname>
const U17_PLUGINS = [
  { name: 'Analytics',            pathname: 'analytics' },
  { name: 'AdminBar',             pathname: 'admin-bar' },
  { name: 'Backups',              pathname: 'backups' },
  { name: 'Blog',                 pathname: 'blog' },
  { name: 'CacheManager',         pathname: 'cache-manager' },
  { name: 'CharLimit',            pathname: 'char-limit' },
  { name: 'CustomLogin',          pathname: 'customlogin' },
  { name: 'D4Sign',               pathname: 'd4sign' },
  { name: 'DictionaryManager',    pathname: 'dictionary-manager' },
  { name: 'ENotAssina',           pathname: 'enotassina' },
  { name: 'ExamineExtensions',    pathname: 'examine-extensions' },
  { name: 'ExceptionManager',     pathname: 'exception-manager' },
  { name: 'Faqs',                 pathname: 'faqs' },
  { name: 'FormBuilder',          pathname: 'formbuilder-dashboard' },
  { name: 'Gdrp',                 pathname: 'gdpr-compliance' },
  { name: 'HiddenContent',        pathname: 'hiddencontent' },
  { name: 'ImageProcessor',       pathname: 'image-processor' },
  { name: 'LiveVideo',            pathname: 'live-video' },
  { name: 'Mailer',               pathname: 'mailer' },
  { name: 'MemberGroups',         pathname: 'membergroups' },
  { name: 'MemberLogin',          pathname: 'memberlogin' },
  { name: 'MemberRegistration',   pathname: 'memberregistration' },
  { name: 'MemberTypes',          pathname: 'membertypes' },
  { name: 'MostViewed',           pathname: 'most-viewed' },
  { name: 'NewsTicker',           pathname: 'news-ticker' },
  { name: 'Newsletters',          pathname: 'newsletters' },
  { name: 'OnOff',                pathname: 'feature-toggles' },
  { name: 'PasswordSettings',     pathname: 'passwordsettings' },
  { name: 'PropertiesReport',     pathname: 'properties-report' },
  { name: 'QuickPoll',            pathname: 'quick-poll' },
  { name: 'RdpManager',           pathname: 'rdp-manager' },
  { name: 'RedirectManager',      pathname: 'redirect-manager' },
  { name: 'Restricted',           pathname: 'restricted' },
  { name: 'Rsvp',                 pathname: 'rsvp' },
  { name: 'SEO',                  pathname: 'seo' },
  { name: 'Schema2Yaml',          pathname: 'schema-export' },
  { name: 'Settings',             pathname: 'site-settings' },
  { name: 'ShopCart',             pathname: 'shop-cart' },
  { name: 'ShortUrls',            pathname: 'short-urls' },
  { name: 'Smtp',                 pathname: 'smtp-settings' },
  { name: 'SocialChannels',       pathname: 'social-channels' },
  { name: 'SocialLogin',          pathname: 'social-login' },
  { name: 'SocialShare',          pathname: 'social-share' },
  { name: 'StarRatings',          pathname: 'star-ratings' },
  { name: 'Surveys',              pathname: 'surveys' },
  { name: 'SvgViewer',            pathname: 'svg-viewer' },
  { name: 'ToastNotifications',   pathname: 'toast-notifications' },
  { name: 'Tweets',               pathname: 'tweets' },
  { name: 'VideoPreview',         pathname: 'video-preview' },
  { name: 'VisitorCounter',       pathname: 'visitor-counter' },
  { name: 'WhatsApp',             pathname: 'whatsapp' },
  { name: 'Yaml2Schema',          pathname: 'yaml-import' },
  { name: 'BancoInter',           pathname: 'banco-inter' },
  { name: 'MercadoPago',          pathname: 'mercadopago' },
  { name: 'PagSeguro',            pathname: 'pagseguro' },
];

// U13 (AngularJS) plugins — backoffice hash routes
const U13_PLUGINS = [
  { name: 'Analytics',            path: '/umbraco#/analytics' },
  { name: 'AdminBar',             path: '/umbraco#/umbraco-admin-bar' },
  { name: 'Backups',              path: '/umbraco#/backups' },
  { name: 'Blog',                 path: '/umbraco#/content' },
  { name: 'CacheManager',         path: '/umbraco#/cache-manager' },
  { name: 'CharLimit',            path: '/umbraco#/settings' },
  { name: 'CustomLogin',          path: '/umbraco#/settings/customlogin' },
  { name: 'D4Sign',               path: '/umbraco#/d4sign' },
  { name: 'DictionaryManager',    path: '/umbraco#/translation/dictionary' },
  { name: 'ENotAssina',           path: '/umbraco#/enotassina' },
  { name: 'ExamineExtensions',    path: '/umbraco#/settings/examine-management' },
  { name: 'ExceptionManager',     path: '/umbraco#/exception-manager' },
  { name: 'Faqs',                 path: '/umbraco#/content' },
  { name: 'FormBuilder',          path: '/umbraco#/form-builder' },
  { name: 'Gdrp',                 path: '/umbraco#/gdpr' },
  { name: 'HiddenContent',        path: '/umbraco#/content' },
  { name: 'ImageProcessor',       path: '/umbraco#/image-processor' },
  { name: 'LiveVideo',            path: '/umbraco#/live-video' },
  { name: 'Mailer',               path: '/umbraco#/mailer' },
  { name: 'MemberGroups',         path: '/umbraco#/member/member-groups' },
  { name: 'MemberLogin',          path: '/umbraco#/settings/member-login' },
  { name: 'MemberRegistration',   path: '/umbraco#/settings/member-registration' },
  { name: 'MemberTypes',          path: '/umbraco#/settings/member-types' },
  { name: 'MostViewed',           path: '/umbraco#/most-viewed' },
  { name: 'NewsTicker',           path: '/umbraco#/news-ticker' },
  { name: 'Newsletters',          path: '/umbraco#/newsletters' },
  { name: 'OnOff',                path: '/umbraco#/settings/feature-toggles' },
  { name: 'PasswordSettings',     path: '/umbraco#/settings/password-settings' },
  { name: 'PropertiesReport',     path: '/umbraco#/settings/properties-report' },
  { name: 'QuickPoll',            path: '/umbraco#/settings/quick-poll' },
  { name: 'RdpManager',           path: '/umbraco#/rdp-manager' },
  { name: 'RedirectManager',      path: '/umbraco#/settings/redirect-manager' },
  { name: 'Restricted',           path: '/umbraco#/settings/restricted-content' },
  { name: 'Rsvp',                 path: '/umbraco#/settings/rsvp' },
  { name: 'SEO',                  path: '/umbraco#/settings/seo' },
  { name: 'Schema2Yaml',          path: '/umbraco#/settings/schema-export' },
  { name: 'Settings',             path: '/umbraco#/settings/site-settings' },
  { name: 'ShopCart',             path: '/umbraco#/shop-cart' },
  { name: 'ShortUrls',            path: '/umbraco#/settings/short-urls' },
  { name: 'Smtp',                 path: '/umbraco#/settings/smtp' },
  { name: 'SocialChannels',       path: '/umbraco#/settings/social-channels' },
  { name: 'SocialLogin',          path: '/umbraco#/settings/social-login' },
  { name: 'SocialShare',          path: '/umbraco#/settings/social-share' },
  { name: 'StarRatings',          path: '/umbraco#/settings/star-ratings' },
  { name: 'Surveys',              path: '/umbraco#/settings/surveys' },
  { name: 'SvgViewer',            path: '/umbraco#/settings/svg-viewer' },
  { name: 'ToastNotifications',   path: '/umbraco#/settings/toast-notifications' },
  { name: 'Tweets',               path: '/umbraco#/settings/tweets' },
  { name: 'VideoPreview',         path: '/umbraco#/settings/video-preview' },
  { name: 'VisitorCounter',       path: '/umbraco#/settings/visitor-counter' },
  { name: 'WhatsApp',             path: '/umbraco#/settings/whatsapp' },
  { name: 'Yaml2Schema',          path: '/umbraco#/settings/yaml-import' },
  { name: 'BancoInter',           path: '/umbraco#/banco-inter' },
  { name: 'MercadoPago',          path: '/umbraco#/mercadopago' },
  { name: 'PagSeguro',            path: '/umbraco#/pagseguro' },
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function login(page, isU17) {
  if (isU17) {
    // U17: go directly to /umbraco/login (root /umbraco causes auth token refresh error)
    await page.goto(`${BASE_URL}/umbraco/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(5000);
    // Login form uses #username-input (type=text, inputmode=email) + #password-input
    await page.locator('#username-input').waitFor({ timeout: 25000 });
    await page.locator('#username-input').fill(ADMIN_USER);
    await page.locator('#password-input').fill(ADMIN_PASS);
    await page.locator('#umb-login-button').click();
    await page.waitForURL(/umbraco\/(#|\?)/, { timeout: 30000 }).catch(() => {});
    await sleep(5000);
  } else {
    // U13: AngularJS login
    await page.goto(`${BASE_URL}/umbraco`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(5000);
    await page.waitForSelector('#username-input', { timeout: 30000 });
    await page.fill('#username-input', ADMIN_USER);
    await page.fill('#password-input', ADMIN_PASS);
    await page.click('#umb-login-button');
    await sleep(5000);
  }
}

async function capturePlugin(page, plugin, isU17) {
  const pluginDir = join(OUTPUT_BASE, plugin.name);
  mkdirSync(pluginDir, { recursive: true });

  const consoleErrors = [];
  const listener = msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter noise
      if (!text.includes('favicon') && !text.includes('ResizeObserver')) {
        consoleErrors.push(text);
      }
    }
  };
  page.on('console', listener);

  const url = isU17
    ? `${BASE_URL}/umbraco/settings/${plugin.pathname}`
    : `${BASE_URL}${plugin.path}`;

  try {
    // Navigate and wait for network to settle (SPA needs time to load assets)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for the backoffice content area to update with plugin-specific content
    // U17: Lit-based backoffice uses <uui-box> or plugin-specific web components
    // U13: AngularJS backoffice uses <div> with ng-view content
    if (isU17) {
      // Wait for any of these indicators that the plugin dashboard has rendered
      await Promise.any([
        page.waitForSelector('uui-box, [data-plugin-loaded], .plugin-dashboard', { timeout: 10000 }),
        page.waitForSelector('umb-body, .umb-body', { timeout: 10000 }),
        sleep(5000), // fallback: give it time even if selectors don't match
      ]);
    } else {
      // U13 AngularJS: wait for the hash route to be active and content rendered
      await Promise.any([
        page.waitForSelector('.umb-panel, [ng-view], .ng-scope', { timeout: 10000 }),
        sleep(5000),
      ]);
    }

    // Extra wait for dynamic content rendering
    await sleep(3000);

    // Verify we're on the right page by checking URL contains plugin identifier
    const currentUrl = page.url();
    const pluginKey = isU17 ? plugin.pathname : (plugin.path.split('#')[1] || plugin.path);
    const keyPart = pluginKey.split('/')[0] || pluginKey;
    if (!currentUrl.includes(keyPart)) {
      console.log(`  ⚠️  ${plugin.name}: URL mismatch — expected ${keyPart}, got ${currentUrl}`);
    }

    await page.screenshot({
      path: join(pluginDir, 'dashboard.png'),
      fullPage: true,
    });

    console.log(`  ✅ ${plugin.name}`);
  } catch (err) {
    console.log(`  ⚠️  ${plugin.name}: ${err.message.split('\n')[0]}`);
    // Still try to screenshot whatever is there
    try {
      await page.screenshot({ path: join(pluginDir, 'dashboard.png'), fullPage: true });
    } catch { /* ignore */ }
  } finally {
    page.off('console', listener);
    // Write console errors (filtered)
    const filtered = consoleErrors.filter(e =>
      !e.includes('404') && !e.includes('ERR_EMPTY_RESPONSE')
    );
    writeFileSync(
      join(pluginDir, 'console-errors.json'),
      JSON.stringify({ url, errors: filtered, errorCount: filtered.length }, null, 2)
    );
  }
}

async function main() {
  const isU17 = VERSION === 'u17';
  const plugins = isU17 ? U17_PLUGINS : U13_PLUGINS;

  console.log(`\n=== SPL-1926 Screenshot Evidence Capture ===`);
  console.log(`Version: Umbraco ${isU17 ? '17 (Lit3)' : '13 (AngularJS)'}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output:   ${OUTPUT_BASE}`);
  console.log(`Plugins:  ${plugins.length}\n`);

  mkdirSync(OUTPUT_BASE, { recursive: true });

  // When CHROMIUM_EXECUTABLE is not set, let playwright find its bundled browser
  // (works in mcr.microsoft.com/playwright images and npx playwright install environments).
  const launchOpts = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  };
  if (process.env.CHROMIUM_EXECUTABLE) {
    launchOpts.executablePath = process.env.CHROMIUM_EXECUTABLE;
  }
  const browser = await chromium.launch(launchOpts);

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Logging in...');
  try {
    await login(page, isU17);
    console.log('Login successful\n');
  } catch (err) {
    console.error(`Login failed: ${err.message}`);
    await browser.close();
    process.exit(1);
  }

  const manifest = [];

  for (const plugin of plugins) {
    await capturePlugin(page, plugin, isU17);
    manifest.push({ name: plugin.name, url: isU17 ? plugin.pathname : plugin.path });
  }

  writeFileSync(
    join(OUTPUT_BASE, 'capture-manifest.json'),
    JSON.stringify({
      version: isU17 ? 'umbraco17' : 'umbraco13',
      baseUrl: BASE_URL,
      capturedAt: new Date().toISOString(),
      pluginCount: plugins.length,
      plugins: manifest,
    }, null, 2)
  );

  console.log(`\n=== Capture Complete ===`);
  console.log(`Screenshots: ${OUTPUT_BASE}`);

  await browser.close();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
