#!/usr/bin/env node
/**
 * Captures backoffice and front-end screenshots for all Umbraco plugins.
 * Run inside the Docker test container after Umbraco is fully booted.
 *
 * Usage:
 *   node capture-screenshots.mjs <base-url> <output-dir>
 *
 * Example:
 *   node capture-screenshots.mjs http://localhost:5001 /output/screenshots
 */

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const BASE_URL = process.argv[2] || 'http://localhost:5001';
const OUTPUT_DIR = resolve(process.argv[3] || '/output/screenshots');

const ADMIN_USER = process.env.UMBRACO_ADMIN_USER || 'admin@splatdev.local';
const ADMIN_PASS = process.env.UMBRACO_ADMIN_PASS || 'SplatDev2024!';

const SCREENSHOT_WIDTH = 1280;
const SCREENSHOT_HEIGHT = 800;

// ---- PLUGIN CATALOG ----
// Each entry: { name, backofficePath?, frontendPath?, frontendSelector?, type }
// name: plugin display name (used as filename)
// backofficePath: path to the plugin's backoffice dashboard/section
// frontendPath: path to a page that shows the plugin's front-end rendering
// frontendSelector: CSS selector to wait for on the frontend page
const PLUGINS = [
  // === BACKOFFICE + FRONTEND ===
  { name: '2fa', backofficePath: '/umbraco#/member/member/list/0?2fa=1', frontendPath: '/', frontendSelector: 'body' },
  { name: 'AdminBar', backofficePath: '/umbraco#/umbraco-admin-bar', frontendPath: '/', frontendSelector: '#umbraco-admin-bar' },
  { name: 'Blog', backofficePath: '/umbraco#/content/content/edit/0?blog=1', frontendPath: '/blog', frontendSelector: '.blog-post' },
  { name: 'CopyValue', backofficePath: '/umbraco#/settings/property-editors', frontendPath: null },
  { name: 'CustomLogin', backofficePath: '/umbraco#/settings/custom-login', frontendPath: '/login', frontendSelector: '#login-form' },
  { name: 'DefaultValue', backofficePath: '/umbraco#/settings/property-editors', frontendPath: null },
  { name: 'Faqs', backofficePath: '/umbraco#/content/faq', frontendPath: '/faq', frontendSelector: '.faq-list' },
  { name: 'HiddenContent', backofficePath: '/umbraco#/content/content', frontendPath: '/', frontendSelector: 'body' },
  { name: 'MemberGroups', backofficePath: '/umbraco#/member/member-group', frontendPath: '/register', frontendSelector: 'body' },
  { name: 'MemberLogin', backofficePath: '/umbraco#/settings/member-login', frontendPath: '/login', frontendSelector: '.member-login' },
  { name: 'MemberRegistration', backofficePath: '/umbraco#/settings/member-registration', frontendPath: '/register', frontendSelector: '.member-registration' },
  { name: 'MemberTypes', backofficePath: '/umbraco#/settings/member-types', frontendPath: '/register', frontendSelector: 'body' },
  { name: 'MostViewed', backofficePath: '/umbraco#/settings/most-viewed', frontendPath: '/', frontendSelector: '.most-viewed' },
  { name: 'NewsTicker', backofficePath: '/umbraco#/settings/news-ticker', frontendPath: '/', frontendSelector: '.news-ticker' },
  { name: 'Newsletters', backofficePath: '/umbraco#/settings/newsletters', frontendPath: '/newsletter', frontendSelector: '.newsletter-form' },
  { name: 'OnOff', backofficePath: '/umbraco#/settings/property-editors', frontendPath: '/', frontendSelector: '.onoff-toggle' },
  { name: 'PasswordSettings', backofficePath: '/umbraco#/settings/password-settings', frontendPath: '/login', frontendSelector: 'body' },
  { name: 'QuickPoll', backofficePath: '/umbraco#/settings/quick-poll', frontendPath: '/poll', frontendSelector: '.quick-poll' },
  { name: 'Restricted', backofficePath: '/umbraco#/settings/restricted-content', frontendPath: '/restricted', frontendSelector: 'body' },
  { name: 'Rsvp', backofficePath: '/umbraco#/settings/rsvp', frontendPath: '/rsvp', frontendSelector: '.rsvp-form' },
  { name: 'StarRatings', backofficePath: '/umbraco#/settings/star-ratings', frontendPath: '/', frontendSelector: '.star-rating' },
  { name: 'Surveys', backofficePath: '/umbraco#/settings/surveys', frontendPath: '/survey', frontendSelector: '.survey-form' },
  { name: 'Tweets', backofficePath: '/umbraco#/settings/tweets', frontendPath: '/', frontendSelector: '.tweet-feed' },
  { name: 'VisitorCounter', backofficePath: '/umbraco#/settings/visitor-counter', frontendPath: '/', frontendSelector: '.visitor-counter' },

  // === BACKOFFICE ONLY ===
  { name: 'Analytics', backofficePath: '/umbraco#/analytics', frontendPath: null },
  { name: 'BackupManager', backofficePath: '/umbraco#/backup-manager', frontendPath: null },
  { name: 'Backups', backofficePath: '/umbraco#/backups', frontendPath: null },
  { name: 'CacheManager', backofficePath: '/umbraco#/cache-manager', frontendPath: null },
  { name: 'CharLimit', backofficePath: '/umbraco#/settings/property-editors', frontendPath: null },
  { name: 'D4Sign', backofficePath: '/umbraco#/d4sign', frontendPath: null },
  { name: 'DictionaryManager', backofficePath: '/umbraco#/translation/dictionary', frontendPath: null },
  { name: 'Dropzone', backofficePath: '/umbraco#/settings/property-editors', frontendPath: null },
  { name: 'ENotAssina', backofficePath: '/umbraco#/enotassina', frontendPath: null },
  { name: 'EmailNotifications', backofficePath: '/umbraco#/settings/email-notifications', frontendPath: null },
  { name: 'EmailTemplates', backofficePath: '/umbraco#/settings/email-templates', frontendPath: null },
  { name: 'ExamineExtensions', backofficePath: '/umbraco#/settings/examine', frontendPath: null },
  { name: 'ExceptionManager', backofficePath: '/umbraco#/settings/exception-manager', frontendPath: null },
  { name: 'Exif', backofficePath: '/umbraco#/settings/exif', frontendPath: null },
  { name: 'Forums', backofficePath: '/umbraco#/forums', frontendPath: null },
  { name: 'Gdrp', backofficePath: '/umbraco#/gdpr', frontendPath: null },
  { name: 'JsonRpc', backofficePath: '/umbraco#/settings/json-rpc', frontendPath: null },
  { name: 'LazyLoad', backofficePath: '/umbraco#/settings/lazy-load', frontendPath: null },
  { name: 'LiveVideo', backofficePath: '/umbraco#/settings/live-video', frontendPath: null },
  { name: 'Mailer', backofficePath: '/umbraco#/settings/mailer', frontendPath: null },
  { name: 'MemberNotifications', backofficePath: '/umbraco#/settings/member-notifications', frontendPath: null },
  { name: 'Newsletter', backofficePath: '/umbraco#/settings/newsletter', frontendPath: null },
  { name: 'OAuth', backofficePath: '/umbraco#/settings/oauth', frontendPath: null },
  { name: 'Payments.BancoInter', backofficePath: '/umbraco#/payments/banco-inter', frontendPath: null },
  { name: 'Payments.MercadoPago', backofficePath: '/umbraco#/payments/mercadopago', frontendPath: null },
  { name: 'Payments.PagSeguro', backofficePath: '/umbraco#/payments/pagseguro', frontendPath: null },
  { name: 'PdfCurator', backofficePath: '/umbraco#/settings/pdf-curator', frontendPath: null },
  { name: 'PhotoGallery', backofficePath: '/umbraco#/settings/photo-gallery', frontendPath: null },
  { name: 'PropertiesReport', backofficePath: '/umbraco#/settings/properties-report', frontendPath: null },
  { name: 'RdpManager', backofficePath: '/umbraco#/rdp-manager', frontendPath: null },
  { name: 'RedirectManager', backofficePath: '/umbraco#/settings/redirect-manager', frontendPath: null },
  { name: 'SEO', backofficePath: '/umbraco#/settings/seo', frontendPath: null },
  { name: 'Settings', backofficePath: '/umbraco#/settings/plugin-settings', frontendPath: null },
  { name: 'ShopCart', backofficePath: '/umbraco#/shop-cart', frontendPath: null },
  { name: 'ShortUrls', backofficePath: '/umbraco#/settings/short-urls', frontendPath: null },
  { name: 'Slider', backofficePath: '/umbraco#/settings/slider', frontendPath: null },
  { name: 'Smtp', backofficePath: '/umbraco#/settings/smtp', frontendPath: null },
  { name: 'SocialMedia.Channels', backofficePath: '/umbraco#/settings/social-media/channels', frontendPath: null },
  { name: 'SocialMedia.Login', backofficePath: '/umbraco#/settings/social-media/login', frontendPath: null },
  { name: 'SocialMedia.Share', backofficePath: '/umbraco#/settings/social-media/share', frontendPath: null },
  { name: 'SvgViewer', backofficePath: '/umbraco#/settings/svg-viewer', frontendPath: null },
  { name: 'ToastNotifications', backofficePath: '/umbraco#/settings/toast-notifications', frontendPath: null },
  { name: 'VideoPreview', backofficePath: '/umbraco#/settings/video-preview', frontendPath: null },
  { name: 'WhatsApp', backofficePath: '/umbraco#/settings/whatsapp', frontendPath: null },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(page) {
  await page.goto(`${BASE_URL}/umbraco`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('#umbraco', { timeout: 30000 });
  // Wait for login form
  await page.waitForSelector('input[name="username"],input[type="email"]', { timeout: 30000 });
  await page.fill('input[name="username"],input[type="email"]', ADMIN_USER);
  await page.fill('input[name="password"],input[type="password"]', ADMIN_PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/umbraco#/**', { timeout: 30000 });
  await sleep(3000);
}

async function captureBackoffice(page, plugin, pluginDir) {
  if (!plugin.backofficePath) return false;
  try {
    const url = `${BASE_URL}${plugin.backofficePath}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // Wait for backoffice content to render (AngularJS digest cycle + DOM update)
    await Promise.any([
      page.waitForSelector('.umb-panel, [ng-view], .ng-scope, uui-box', { timeout: 10000 }),
      sleep(4000),
    ]);
    // Extra wait for dynamic content
    await sleep(2000);
    const filename = `${plugin.name}-backoffice.png`;
    await page.screenshot({
      path: join(OUTPUT_DIR, filename),
      fullPage: false,
    });
    console.log(`  ✅ backoffice: ${filename}`);
    return true;
  } catch (err) {
    console.log(`  ❌ backoffice (${plugin.name}): ${err.message}`);
    return false;
  }
}

async function captureFrontend(page, plugin) {
  if (!plugin.frontendPath) return false;
  try {
    const url = `${BASE_URL}${plugin.frontendPath}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    if (plugin.frontendSelector) {
      try {
        await page.waitForSelector(plugin.frontendSelector, { timeout: 10000 });
      } catch {
        // selector not found, still capture page as-is
      }
    }
    // Wait for any remaining lazy-loaded content
    await sleep(2000);
    const filename = `${plugin.name}-frontend.png`;
    await page.screenshot({
      path: join(OUTPUT_DIR, filename),
      fullPage: false,
    });
    console.log(`  ✅ frontend: ${filename}`);
    return true;
  } catch (err) {
    console.log(`  ❌ frontend (${plugin.name}): ${err.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n=== Screenshot Capture ===`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output:   ${OUTPUT_DIR}`);
  console.log(`Plugins:  ${PLUGINS.length}\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: SCREENSHOT_WIDTH, height: SCREENSHOT_HEIGHT },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Logging in to backoffice...');
  try {
    await login(page);
    console.log('Login successful\n');
  } catch (err) {
    console.error(`Login failed: ${err.message}`);
    await browser.close();
    process.exit(1);
  }

  const results = [];

  for (const plugin of PLUGINS) {
    console.log(`📸 ${plugin.name}:`);
    const bo = await captureBackoffice(page, plugin);
    const fe = await captureFrontend(page, plugin);
    results.push({ ...plugin, backofficeCaptured: bo, frontendCaptured: fe });
  }

  // Write a manifest of what was captured
  const manifest = results.map(r => ({
    name: r.name,
    backoffice: r.backofficeCaptured,
    frontend: r.frontendCaptured,
  }));
  writeFileSync(join(OUTPUT_DIR, 'capture-manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\n=== Done ===`);
  console.log(`Screenshots saved to: ${OUTPUT_DIR}`);

  await browser.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
