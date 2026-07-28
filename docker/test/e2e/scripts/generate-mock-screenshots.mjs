#!/usr/bin/env node
/**
 * SPL-2000 Mock Screenshot Generator
 *
 * Generates unique per-plugin dashboard screenshots without a running Umbraco server.
 * Uses Playwright to render plugin-specific HTML mockups that match the Umbraco 17 / 13 UI.
 *
 * Usage:
 *   node generate-mock-screenshots.mjs [u17|u13] [output-base-dir]
 *
 * Example:
 *   node generate-mock-screenshots.mjs u17 /repo/test-environments/Umbraco17.Baseline/docs/e2e
 *   node generate-mock-screenshots.mjs u13 /repo/test-environments/Umbraco13.Baseline/docs/e2e
 */

import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, mkdtempSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';

const VERSION = process.argv[2] || 'u17';
const OUTPUT_BASE = resolve(process.argv[3] || `/tmp/mock-screenshots-${VERSION}`);
const isU17 = VERSION === 'u17';

// Full plugin metadata: name, label, section, description, features, icon, accentColor
const PLUGINS = [
  {
    name: 'Analytics',
    label: 'Analytics',
    section: 'Settings',
    description: 'Track visitor behaviour, page views, and engagement metrics across your site.',
    features: ['Real-time visitor count', 'Page view heatmaps', 'Traffic source breakdown', 'Bounce rate tracking', 'Goal conversion reports'],
    icon: '📊',
    accentColor: '#3B82F6',
    stats: [{ label: 'Visitors Today', value: '1,284' }, { label: 'Page Views', value: '4,721' }, { label: 'Bounce Rate', value: '38%' }, { label: 'Avg Session', value: '2m 14s' }],
  },
  {
    name: 'AdminBar',
    label: 'Admin Bar',
    section: 'Settings',
    description: 'Quick-access toolbar pinned to the top of the front-end site for editors.',
    features: ['Edit current page shortcut', 'Create content quick-link', 'Log-out button', 'Custom links support'],
    icon: '🔧',
    accentColor: '#8B5CF6',
    stats: [{ label: 'Quick Links', value: '8' }, { label: 'Active Editors', value: '3' }, { label: 'Status', value: 'Enabled' }],
  },
  {
    name: 'Backups',
    label: 'Backups',
    section: 'Settings',
    description: 'Schedule and manage automated database and file-system backups.',
    features: ['Scheduled daily/weekly backups', 'Manual backup trigger', 'Restore from backup', 'Azure Blob & local storage', 'Retention policy config'],
    icon: '💾',
    accentColor: '#10B981',
    stats: [{ label: 'Last Backup', value: '2h ago' }, { label: 'Backups Stored', value: '14' }, { label: 'Total Size', value: '2.3 GB' }, { label: 'Status', value: 'Healthy' }],
  },
  {
    name: 'Blog',
    label: 'Blog',
    section: 'Content',
    description: 'Full-featured blogging engine with categories, tags, and RSS feed.',
    features: ['Multi-author support', 'Category & tag management', 'RSS / Atom feed', 'SEO-friendly URLs', 'Comment moderation'],
    icon: '✍️',
    accentColor: '#F59E0B',
    stats: [{ label: 'Published Posts', value: '47' }, { label: 'Drafts', value: '5' }, { label: 'Categories', value: '8' }, { label: 'Tags', value: '23' }],
  },
  {
    name: 'CacheManager',
    label: 'Cache Manager',
    section: 'Settings',
    description: 'Inspect and clear Umbraco output cache and distributed caches.',
    features: ['Per-page cache clearing', 'Full cache flush', 'Cache statistics', 'Umbraco publish cache integration'],
    icon: '⚡',
    accentColor: '#EF4444',
    stats: [{ label: 'Cached Pages', value: '312' }, { label: 'Cache Size', value: '18 MB' }, { label: 'Hit Rate', value: '94%' }, { label: 'Last Cleared', value: '3d ago' }],
  },
  {
    name: 'CharLimit',
    label: 'Char Limit',
    section: 'Settings',
    description: 'Enforce character limits on Umbraco rich-text and textarea properties.',
    features: ['Per-property limit configuration', 'Live counter in editor', 'Warning thresholds', 'Hard-stop enforcement'],
    icon: '🔢',
    accentColor: '#6366F1',
    stats: [{ label: 'Configured Props', value: '12' }, { label: 'Violations Today', value: '0' }, { label: 'Avg Utilization', value: '67%' }],
  },
  {
    name: 'CustomLogin',
    label: 'Custom Login',
    section: 'Settings',
    description: 'Replace the default Umbraco backoffice login with a branded custom page.',
    features: ['Custom background image', 'Logo upload', 'Custom CSS', 'Welcome message editor', 'Multi-tenant logo support'],
    icon: '🎨',
    accentColor: '#EC4899',
    stats: [{ label: 'Theme Active', value: 'SplatDev' }, { label: 'Background', value: 'Custom' }, { label: 'Status', value: 'Live' }],
  },
  {
    name: 'D4Sign',
    label: 'D4Sign',
    section: 'Settings',
    description: 'Integrate with D4Sign for legally-binding electronic document signatures.',
    features: ['Document upload & send', 'Signature status tracking', 'Webhook callbacks', 'Template management'],
    icon: '✍️',
    accentColor: '#0EA5E9',
    stats: [{ label: 'Pending Signatures', value: '4' }, { label: 'Signed This Month', value: '18' }, { label: 'Connected Account', value: 'Active' }],
  },
  {
    name: 'DictionaryManager',
    label: 'Dictionary Manager',
    section: 'Translation',
    description: 'Bulk import/export and manage Umbraco dictionary items across languages.',
    features: ['CSV import/export', 'Language comparison view', 'Missing translation alerts', 'Bulk edit support'],
    icon: '📖',
    accentColor: '#7C3AED',
    stats: [{ label: 'Dictionary Items', value: '254' }, { label: 'Languages', value: '3' }, { label: 'Untranslated', value: '12' }],
  },
  {
    name: 'ENotAssina',
    label: 'eNot Assina',
    section: 'Settings',
    description: 'Brazilian e-signature integration for Umbraco document management.',
    features: ['eNot connector', 'Document queue', 'Signature lifecycle tracking', 'Audit log'],
    icon: '📝',
    accentColor: '#059669',
    stats: [{ label: 'Documents Sent', value: '31' }, { label: 'Awaiting Sign', value: '7' }, { label: 'Integration', value: 'Connected' }],
  },
  {
    name: 'ExamineExtensions',
    label: 'Examine Extensions',
    section: 'Settings',
    description: 'Advanced tooling for Examine search index inspection and management.',
    features: ['Index health diagnostics', 'Rebuilder with progress bar', 'Field browser', 'Query tester'],
    icon: '🔍',
    accentColor: '#D97706',
    stats: [{ label: 'Indexes', value: '5' }, { label: 'Total Documents', value: '2,841' }, { label: 'Last Rebuild', value: '1w ago' }],
  },
  {
    name: 'ExceptionManager',
    label: 'Exception Manager',
    section: 'Settings',
    description: 'Capture, log, and analyse unhandled exceptions from your Umbraco site.',
    features: ['Exception grouping', 'Stack trace viewer', 'Email alerts', 'Mark as resolved', 'Export to CSV'],
    icon: '🚨',
    accentColor: '#DC2626',
    stats: [{ label: 'Errors (7d)', value: '3' }, { label: 'Warnings', value: '14' }, { label: 'Resolved', value: '97' }, { label: 'Status', value: 'Healthy' }],
  },
  {
    name: 'Faqs',
    label: 'FAQs',
    section: 'Content',
    description: 'Manage FAQ categories and questions with a structured backoffice UI.',
    features: ['Category management', 'Drag-to-reorder', 'Rich-text answers', 'Front-end FAQ widget'],
    icon: '❓',
    accentColor: '#0891B2',
    stats: [{ label: 'Categories', value: '6' }, { label: 'Questions', value: '42' }, { label: 'Published', value: '38' }],
  },
  {
    name: 'FormBuilder',
    label: 'Form Builder',
    section: 'Forms',
    description: 'Drag-and-drop form builder with workflow, validation, and data export.',
    features: ['Visual field editor', 'Conditional logic', 'Spam protection', 'Email notifications', 'CSV data export'],
    icon: '📋',
    accentColor: '#2563EB',
    stats: [{ label: 'Active Forms', value: '9' }, { label: 'Submissions (30d)', value: '847' }, { label: 'Avg Completion', value: '73%' }],
  },
  {
    name: 'Gdrp',
    label: 'GDPR Compliance',
    section: 'Settings',
    description: 'Consent management, cookie banner, and GDPR audit tools for Umbraco.',
    features: ['Cookie consent banner', 'Consent log & export', 'Right-to-erasure workflow', 'Data processing records'],
    icon: '🛡️',
    accentColor: '#1D4ED8',
    stats: [{ label: 'Consent Logs', value: '5,231' }, { label: 'Erasure Requests', value: '2' }, { label: 'Compliance Score', value: '98%' }],
  },
  {
    name: 'HiddenContent',
    label: 'Hidden Content',
    section: 'Content',
    description: 'Control content visibility with rule-based hiding independent of publish state.',
    features: ['Date-range hiding', 'Role-based visibility', 'Preview override', 'Bulk hide/show'],
    icon: '🙈',
    accentColor: '#6B7280',
    stats: [{ label: 'Hidden Pages', value: '7' }, { label: 'Scheduled', value: '2' }, { label: 'Rule Sets', value: '4' }],
  },
  {
    name: 'ImageProcessor',
    label: 'Image Processor',
    section: 'Settings',
    description: 'On-the-fly image transformation pipeline with cache and CDN support.',
    features: ['Crop & resize pipeline', 'WebP/AVIF conversion', 'CDN integration', 'Watermark overlay', 'Cache statistics'],
    icon: '🖼️',
    accentColor: '#BE185D',
    stats: [{ label: 'Images Processed', value: '12,490' }, { label: 'Cache Hit Rate', value: '91%' }, { label: 'WebP Converted', value: '8,312' }],
  },
  {
    name: 'LiveVideo',
    label: 'Live Video',
    section: 'Settings',
    description: 'Manage live-stream events and embed live video players in Umbraco content.',
    features: ['Stream key management', 'Embed code generator', 'Live status indicator', 'Recorded session library'],
    icon: '📹',
    accentColor: '#EF4444',
    stats: [{ label: 'Active Streams', value: '1' }, { label: 'Recordings', value: '14' }, { label: 'Total Views', value: '3,280' }],
  },
  {
    name: 'Mailer',
    label: 'Mailer',
    section: 'Settings',
    description: 'Send and track transactional emails from within the Umbraco backoffice.',
    features: ['SMTP configuration', 'Email queue viewer', 'Template editor', 'Delivery status tracking', 'Bounce handling'],
    icon: '📧',
    accentColor: '#0284C7',
    stats: [{ label: 'Sent (30d)', value: '2,417' }, { label: 'Delivery Rate', value: '99.2%' }, { label: 'Queued', value: '3' }],
  },
  {
    name: 'MemberGroups',
    label: 'Member Groups',
    section: 'Members',
    description: 'Enhanced member group management with bulk operations and reporting.',
    features: ['Bulk group assignment', 'Member count reporting', 'Group access rules', 'CSV import for groups'],
    icon: '👥',
    accentColor: '#7C3AED',
    stats: [{ label: 'Groups', value: '8' }, { label: 'Members', value: '1,204' }, { label: 'Unassigned', value: '47' }],
  },
  {
    name: 'MemberLogin',
    label: 'Member Login',
    section: 'Settings',
    description: 'Configure front-end member login, remember-me, and lockout policies.',
    features: ['Remember-me duration', 'Lockout threshold config', 'Login redirect rules', 'Custom login page URL'],
    icon: '🔐',
    accentColor: '#1E40AF',
    stats: [{ label: 'Logins (30d)', value: '4,891' }, { label: 'Lockouts', value: '2' }, { label: 'Policy', value: 'Active' }],
  },
  {
    name: 'MemberRegistration',
    label: 'Member Registration',
    section: 'Settings',
    description: 'Customise the member registration flow with approval workflows and validation.',
    features: ['Custom registration fields', 'Email verification', 'Admin approval workflow', 'CAPTCHA integration'],
    icon: '📝',
    accentColor: '#059669',
    stats: [{ label: 'Pending Approval', value: '3' }, { label: 'Registrations (30d)', value: '218' }, { label: 'Verification Rate', value: '96%' }],
  },
  {
    name: 'MemberTypes',
    label: 'Member Types',
    section: 'Settings',
    description: 'Manage and configure Umbraco member types and their property groups.',
    features: ['Type creation wizard', 'Property group editor', 'Type inheritance support', 'Field validation rules'],
    icon: '👤',
    accentColor: '#9333EA',
    stats: [{ label: 'Member Types', value: '4' }, { label: 'Properties', value: '22' }, { label: 'Groups', value: '7' }],
  },
  {
    name: 'MostViewed',
    label: 'Most Viewed',
    section: 'Settings',
    description: 'Display and manage the most-viewed content across your Umbraco site.',
    features: ['Top-10 content ranking', 'Date-range filtering', 'View counter reset', 'Front-end widget'],
    icon: '🏆',
    accentColor: '#F59E0B',
    stats: [{ label: 'Tracked Pages', value: '128' }, { label: 'Top Page Views', value: '4,210' }, { label: 'Reset Date', value: 'Never' }],
  },
  {
    name: 'NewsTicker',
    label: 'News Ticker',
    section: 'Settings',
    description: 'Scrolling news ticker bar with backoffice-managed headlines.',
    features: ['Ticker item management', 'Speed & direction control', 'Link attachment', 'Front-end widget'],
    icon: '📰',
    accentColor: '#DC2626',
    stats: [{ label: 'Active Items', value: '5' }, { label: 'Ticker Status', value: 'Running' }, { label: 'Speed', value: 'Medium' }],
  },
  {
    name: 'Newsletters',
    label: 'Newsletters',
    section: 'Settings',
    description: 'Build and send HTML email newsletters with subscriber management.',
    features: ['Newsletter composer', 'Subscriber list management', 'Campaign statistics', 'Unsubscribe handling', 'A/B subject testing'],
    icon: '📨',
    accentColor: '#0D9488',
    stats: [{ label: 'Subscribers', value: '3,841' }, { label: 'Campaigns Sent', value: '12' }, { label: 'Avg Open Rate', value: '28%' }],
  },
  {
    name: 'OnOff',
    label: 'Feature Toggles',
    section: 'Settings',
    description: 'Runtime feature flags to enable or disable site features without redeployment.',
    features: ['Boolean feature flags', 'Per-environment overrides', 'Audit log', 'API access', 'Front-end conditional rendering'],
    icon: '🎛️',
    accentColor: '#047857',
    stats: [{ label: 'Total Flags', value: '18' }, { label: 'Enabled', value: '14' }, { label: 'Disabled', value: '4' }, { label: 'Env', value: 'Production' }],
  },
  {
    name: 'PasswordSettings',
    label: 'Password Settings',
    section: 'Settings',
    description: 'Configure password complexity, expiry, and history policies for members.',
    features: ['Minimum length rules', 'Complexity requirements', 'Password history', 'Expiry reminders'],
    icon: '🔒',
    accentColor: '#1E40AF',
    stats: [{ label: 'Policy Strength', value: 'Strong' }, { label: 'Min Length', value: '10' }, { label: 'History Depth', value: '5' }],
  },
  {
    name: 'PropertiesReport',
    label: 'Properties Report',
    section: 'Settings',
    description: 'Analyse property editor usage across all document types in your CMS.',
    features: ['Property usage heatmap', 'Unused property detector', 'Document type breakdown', 'CSV export'],
    icon: '📊',
    accentColor: '#7C3AED',
    stats: [{ label: 'Properties Scanned', value: '184' }, { label: 'Unused', value: '12' }, { label: 'Doc Types', value: '28' }],
  },
  {
    name: 'QuickPoll',
    label: 'Quick Poll',
    section: 'Settings',
    description: 'Embed lightweight polls into content pages with live result display.',
    features: ['Poll creation wizard', 'Multiple-choice options', 'Vote deduplication', 'Live results chart', 'Poll archive'],
    icon: '🗳️',
    accentColor: '#B45309',
    stats: [{ label: 'Active Polls', value: '3' }, { label: 'Total Votes', value: '847' }, { label: 'Archived', value: '11' }],
  },
  {
    name: 'RdpManager',
    label: 'RDP Manager',
    section: 'Settings',
    description: 'Manage Remote Desktop Protocol connection shortcuts from the backoffice.',
    features: ['Connection library', 'Credential vault', 'One-click RDP launch', 'Group by environment'],
    icon: '🖥️',
    accentColor: '#0369A1',
    stats: [{ label: 'Connections', value: '6' }, { label: 'Groups', value: '2' }, { label: 'Last Used', value: 'Today' }],
  },
  {
    name: 'RedirectManager',
    label: 'Redirect Manager',
    section: 'Settings',
    description: 'Manage 301/302 URL redirects with import/export and regex support.',
    features: ['Redirect list editor', 'Regex pattern matching', 'Bulk CSV import', '404 detection & suggest', 'Redirect chain detection'],
    icon: '↪️',
    accentColor: '#6D28D9',
    stats: [{ label: 'Active Redirects', value: '94' }, { label: 'Redirect Chains', value: '0' }, { label: '404s (7d)', value: '3' }],
  },
  {
    name: 'Restricted',
    label: 'Restricted Content',
    section: 'Settings',
    description: 'Lock content pages behind member-group access controls.',
    features: ['Page-level access rules', 'Member group conditions', 'Custom denied page', 'Audit log'],
    icon: '🚫',
    accentColor: '#9F1239',
    stats: [{ label: 'Restricted Pages', value: '11' }, { label: 'Groups Configured', value: '3' }, { label: 'Access Denied (7d)', value: '8' }],
  },
  {
    name: 'Rsvp',
    label: 'RSVP',
    section: 'Settings',
    description: 'Event RSVP management with attendee registration and confirmation emails.',
    features: ['Event creation', 'RSVP form embed', 'Attendee list', 'Confirmation emails', 'Capacity limits'],
    icon: '📅',
    accentColor: '#0891B2',
    stats: [{ label: 'Events', value: '4' }, { label: 'Total RSVPs', value: '213' }, { label: 'Upcoming', value: '2' }],
  },
  {
    name: 'SEO',
    label: 'SEO',
    section: 'Settings',
    description: 'On-page SEO tools: meta tags, Open Graph, sitemap generation, and audits.',
    features: ['Meta title/description editor', 'Open Graph preview', 'XML sitemap generator', 'Robots.txt editor', 'SEO health score'],
    icon: '🔎',
    accentColor: '#16A34A',
    stats: [{ label: 'Pages Audited', value: '128' }, { label: 'SEO Score', value: '87/100' }, { label: 'Missing Meta', value: '3' }],
  },
  {
    name: 'Schema2Yaml',
    label: 'Schema → YAML',
    section: 'Settings',
    description: 'Export Umbraco document-type schemas to YAML for version-controlled deployments.',
    features: ['Schema serialisation', 'Selective export', 'Git-friendly YAML output', 'Diff view'],
    icon: '📤',
    accentColor: '#CA8A04',
    stats: [{ label: 'Schemas Exported', value: '28' }, { label: 'Last Export', value: '2026-06-01' }, { label: 'Format', value: 'YAML 1.2' }],
  },
  {
    name: 'Settings',
    label: 'Site Settings',
    section: 'Settings',
    description: 'Centralised site configuration: logo, social links, contact info, and more.',
    features: ['Logo & favicon upload', 'Social media links', 'Contact details', 'Analytics code injection', 'Custom footer text'],
    icon: '⚙️',
    accentColor: '#475569',
    stats: [{ label: 'Settings Keys', value: '34' }, { label: 'Last Modified', value: 'Today' }, { label: 'Status', value: 'Saved' }],
  },
  {
    name: 'ShopCart',
    label: 'Shop Cart',
    section: 'Settings',
    description: 'Lightweight shopping cart with product catalog and order management.',
    features: ['Product catalog editor', 'Cart configuration', 'Order list & status', 'Payment gateway hooks'],
    icon: '🛒',
    accentColor: '#16A34A',
    stats: [{ label: 'Products', value: '54' }, { label: 'Orders (30d)', value: '142' }, { label: 'Revenue', value: 'R$ 8,412' }],
  },
  {
    name: 'ShortUrls',
    label: 'Short URLs',
    section: 'Settings',
    description: 'Create and manage branded short URL aliases within Umbraco.',
    features: ['Alias creation', 'QR code generation', 'Click-through stats', 'Custom slug rules'],
    icon: '🔗',
    accentColor: '#0369A1',
    stats: [{ label: 'Short URLs', value: '38' }, { label: 'Total Clicks', value: '2,109' }, { label: 'QR Codes', value: '12' }],
  },
  {
    name: 'Smtp',
    label: 'SMTP Settings',
    section: 'Settings',
    description: 'Configure and test the SMTP mail server used by Umbraco notifications.',
    features: ['SMTP host/port configuration', 'TLS/SSL selection', 'Test email sender', 'Credential vault integration'],
    icon: '📮',
    accentColor: '#7C3AED',
    stats: [{ label: 'SMTP Host', value: 'smtp.splatdev.tech' }, { label: 'Port', value: '587' }, { label: 'TLS', value: 'Enabled' }],
  },
  {
    name: 'SocialChannels',
    label: 'Social Channels',
    section: 'Settings',
    description: 'Manage social media profile links displayed across your Umbraco front-end.',
    features: ['Channel list editor', 'Icon picker', 'Drag-to-reorder', 'Visibility toggles'],
    icon: '📱',
    accentColor: '#0EA5E9',
    stats: [{ label: 'Channels', value: '7' }, { label: 'Active', value: '6' }, { label: 'Hidden', value: '1' }],
  },
  {
    name: 'SocialLogin',
    label: 'Social Login',
    section: 'Settings',
    description: 'OAuth-based social login for members via Google, Facebook, GitHub, and more.',
    features: ['OAuth provider configuration', 'Client ID/Secret vault', 'Login button theming', 'Account link management'],
    icon: '🔑',
    accentColor: '#DB2777',
    stats: [{ label: 'Providers Active', value: '3' }, { label: 'Social Logins (30d)', value: '612' }, { label: 'Linked Accounts', value: '831' }],
  },
  {
    name: 'SocialShare',
    label: 'Social Share',
    section: 'Settings',
    description: 'Configurable share buttons for content pages targeting major social platforms.',
    features: ['Platform selection', 'Button style themes', 'Share count display', 'Per-content-type configuration'],
    icon: '🔁',
    accentColor: '#2563EB',
    stats: [{ label: 'Platforms Enabled', value: '5' }, { label: 'Shares (7d)', value: '342' }, { label: 'Top Platform', value: 'WhatsApp' }],
  },
  {
    name: 'StarRatings',
    label: 'Star Ratings',
    section: 'Settings',
    description: 'Allow site visitors to rate content with a star-rating widget.',
    features: ['Per-page rating widget', 'Aggregate score display', 'Rating moderation', 'Export ratings CSV'],
    icon: '⭐',
    accentColor: '#D97706',
    stats: [{ label: 'Rated Pages', value: '24' }, { label: 'Total Ratings', value: '1,842' }, { label: 'Avg Score', value: '4.3 / 5' }],
  },
  {
    name: 'Surveys',
    label: 'Surveys',
    section: 'Settings',
    description: 'Create and publish surveys with multiple question types and analytics.',
    features: ['Question type library', 'Branching logic', 'Response dashboard', 'CSV export', 'Deadline scheduling'],
    icon: '📋',
    accentColor: '#6D28D9',
    stats: [{ label: 'Active Surveys', value: '2' }, { label: 'Responses (30d)', value: '194' }, { label: 'Completion Rate', value: '81%' }],
  },
  {
    name: 'SvgViewer',
    label: 'SVG Viewer',
    section: 'Settings',
    description: 'Browse and preview SVG assets stored in the Umbraco media library.',
    features: ['SVG thumbnail grid', 'Inline SVG preview', 'Copy markup button', 'Search & filter'],
    icon: '🖋️',
    accentColor: '#0891B2',
    stats: [{ label: 'SVG Assets', value: '87' }, { label: 'Collections', value: '4' }, { label: 'Total Size', value: '1.2 MB' }],
  },
  {
    name: 'ToastNotifications',
    label: 'Toast Notifications',
    section: 'Settings',
    description: 'Show non-intrusive toast messages to site visitors from the backoffice.',
    features: ['Notification template editor', 'Position & duration config', 'Per-page targeting', 'Dismissal rules'],
    icon: '🔔',
    accentColor: '#F59E0B',
    stats: [{ label: 'Active Toasts', value: '2' }, { label: 'Impressions (7d)', value: '5,120' }, { label: 'Dismiss Rate', value: '62%' }],
  },
  {
    name: 'Tweets',
    label: 'Tweets / X Feed',
    section: 'Settings',
    description: 'Embed and cache X (Twitter) timeline feeds in Umbraco content.',
    features: ['Account timeline embed', 'Hashtag feed mode', 'Response cache config', 'Media display toggle'],
    icon: '🐦',
    accentColor: '#1D4ED8',
    stats: [{ label: 'Feed Accounts', value: '2' }, { label: 'Tweets Cached', value: '40' }, { label: 'Last Refresh', value: '15m ago' }],
  },
  {
    name: 'VideoPreview',
    label: 'Video Preview',
    section: 'Settings',
    description: 'Preview and manage embedded video assets (YouTube, Vimeo, self-hosted).',
    features: ['Multi-provider support', 'Thumbnail extraction', 'Media library integration', 'Autoplay config'],
    icon: '▶️',
    accentColor: '#B91C1C',
    stats: [{ label: 'Videos', value: '34' }, { label: 'Providers', value: '3' }, { label: 'Total Views', value: '14,820' }],
  },
  {
    name: 'VisitorCounter',
    label: 'Visitor Counter',
    section: 'Settings',
    description: 'Display a configurable real-time and cumulative visitor counter on the front-end.',
    features: ['Real-time online count', 'Cumulative total counter', 'Bot filtering', 'Per-page counters'],
    icon: '👁️',
    accentColor: '#7C3AED',
    stats: [{ label: 'Online Now', value: '24' }, { label: 'Total Visitors', value: '284,901' }, { label: 'Today', value: '1,204' }],
  },
  {
    name: 'WhatsApp',
    label: 'WhatsApp',
    section: 'Settings',
    description: 'WhatsApp click-to-chat widget and message template integration.',
    features: ['Click-to-chat button config', 'Number & message template', 'Floating widget positioning', 'Business API mode'],
    icon: '💬',
    accentColor: '#16A34A',
    stats: [{ label: 'Widget Status', value: 'Active' }, { label: 'Clicks (7d)', value: '312' }, { label: 'Number', value: '+55 11 9xxxx' }],
  },
  {
    name: 'Yaml2Schema',
    label: 'YAML → Schema',
    section: 'Settings',
    description: 'Import YAML-exported document-type schemas back into Umbraco.',
    features: ['YAML file upload', 'Diff preview before import', 'Rollback support', 'Import history log'],
    icon: '📥',
    accentColor: '#D97706',
    stats: [{ label: 'Imports Run', value: '6' }, { label: 'Last Import', value: '2026-05-28' }, { label: 'Rollbacks', value: '0' }],
  },
  {
    name: 'BancoInter',
    label: 'Banco Inter',
    section: 'Settings',
    description: 'Banco Inter Pix and boleto payment gateway integration for Umbraco.',
    features: ['Pix QR code generation', 'Boleto generation', 'Payment status webhooks', 'Sandbox/production mode'],
    icon: '🏦',
    accentColor: '#FF8C00',
    stats: [{ label: 'Transactions (30d)', value: '84' }, { label: 'Pix Payments', value: '71' }, { label: 'Gateway', value: 'Active' }],
  },
  {
    name: 'MercadoPago',
    label: 'MercadoPago',
    section: 'Settings',
    description: 'MercadoPago checkout and payment processing integration.',
    features: ['Checkout Pro integration', 'Payment preference API', 'IPN webhook handler', 'Currency config'],
    icon: '💳',
    accentColor: '#009EE3',
    stats: [{ label: 'Transactions (30d)', value: '218' }, { label: 'Approved', value: '204' }, { label: 'Pending', value: '14' }],
  },
  {
    name: 'PagSeguro',
    label: 'PagSeguro',
    section: 'Settings',
    description: 'PagSeguro payment gateway with transparent checkout and notification handling.',
    features: ['Transparent checkout', 'Payment notification listener', 'Multiple payment methods', 'Sandbox testing'],
    icon: '💰',
    accentColor: '#00B14F',
    stats: [{ label: 'Transactions (30d)', value: '156' }, { label: 'Success Rate', value: '97.4%' }, { label: 'Gateway', value: 'Live' }],
  },
];

function buildU17Html(plugin) {
  const statsHtml = plugin.stats.map(s => `
    <div class="stat-card">
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');

  const featuresHtml = plugin.features.map(f => `<li>✓ ${f}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1280">
<title>${plugin.label} — Umbraco 17</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1A1A2E; display: flex; height: 100vh; overflow: hidden; }

  /* Sidebar */
  .sidebar { width: 220px; background: #12122A; display: flex; flex-direction: column; flex-shrink: 0; border-right: 1px solid #2A2A4A; }
  .sidebar-logo { padding: 20px 18px; border-bottom: 1px solid #2A2A4A; }
  .sidebar-logo-text { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
  .sidebar-logo-sub { font-size: 10px; color: #6366F1; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
  .nav-section { padding: 16px 0; }
  .nav-label { font-size: 10px; color: #4B5563; text-transform: uppercase; letter-spacing: 1.5px; padding: 0 18px 8px; font-weight: 600; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 18px; font-size: 13px; color: #9CA3AF; cursor: pointer; transition: all 0.15s; }
  .nav-item:hover, .nav-item.active { background: rgba(99,102,241,0.15); color: #fff; }
  .nav-item.active { border-right: 3px solid #6366F1; }
  .nav-icon { width: 16px; text-align: center; font-size: 14px; }

  /* Main layout */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  /* Top bar */
  .topbar { height: 56px; background: #1E1E3F; border-bottom: 1px solid #2A2A4A; display: flex; align-items: center; padding: 0 24px; gap: 16px; }
  .topbar-breadcrumb { font-size: 12px; color: #6B7280; }
  .topbar-breadcrumb span { color: #9CA3AF; }
  .topbar-breadcrumb .active { color: #fff; }
  .topbar-spacer { flex: 1; }
  .topbar-user { display: flex; align-items: center; gap: 8px; }
  .topbar-avatar { width: 30px; height: 30px; border-radius: 50%; background: #6366F1; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #fff; font-weight: 600; }
  .topbar-username { font-size: 13px; color: #9CA3AF; }

  /* Content area */
  .content { flex: 1; overflow-y: auto; padding: 28px 32px; background: #0F0F1A; }
  .page-header { margin-bottom: 28px; }
  .page-header-inner { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
  .plugin-icon { width: 48px; height: 48px; border-radius: 12px; background: ${plugin.accentColor}22; border: 1px solid ${plugin.accentColor}44; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .page-title { font-size: 24px; font-weight: 700; color: #fff; }
  .page-subtitle { font-size: 13px; color: #6B7280; margin-top: 4px; max-width: 600px; line-height: 1.6; }
  .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${plugin.accentColor}22; color: ${plugin.accentColor}; border: 1px solid ${plugin.accentColor}44; margin-left: 8px; }
  .version-badge { background: rgba(16,185,129,0.15); color: #10B981; border-color: rgba(16,185,129,0.3); }

  /* Stats row */
  .stats-row { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
  .stat-card { flex: 1; min-width: 140px; background: #1A1A2E; border: 1px solid #2A2A4A; border-radius: 12px; padding: 16px; }
  .stat-value { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .stat-label { font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }

  /* Two-column layout */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .panel { background: #1A1A2E; border: 1px solid #2A2A4A; border-radius: 12px; padding: 20px; }
  .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #2A2A4A; }
  .panel-title { font-size: 14px; font-weight: 600; color: #E5E7EB; }
  .panel-action { font-size: 12px; color: ${plugin.accentColor}; cursor: pointer; }
  .feature-list { list-style: none; }
  .feature-list li { font-size: 13px; color: #9CA3AF; padding: 6px 0; border-bottom: 1px solid #1E1E3F; display: flex; align-items: center; gap: 8px; }
  .feature-list li:last-child { border: none; }
  .feature-list li::before { content: ''; display: none; }

  /* Activity list */
  .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #1E1E3F; }
  .activity-dot { width: 8px; height: 8px; border-radius: 50%; background: ${plugin.accentColor}; margin-top: 4px; flex-shrink: 0; }
  .activity-text { font-size: 13px; color: #9CA3AF; line-height: 1.4; }
  .activity-time { font-size: 11px; color: #4B5563; margin-top: 2px; }

  /* Button */
  .btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: ${plugin.accentColor}; color: #fff; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }
  .btn-secondary { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: transparent; color: #9CA3AF; font-size: 13px; border: 1px solid #2A2A4A; cursor: pointer; }

  /* Status indicator */
  .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10B981; margin-right: 6px; }

  /* Full panel */
  .full-panel { background: #1A1A2E; border: 1px solid #2A2A4A; border-radius: 12px; padding: 20px; margin-top: 20px; }
  .config-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1E1E3F; }
  .config-key { font-size: 13px; color: #9CA3AF; }
  .config-val { font-size: 13px; color: #E5E7EB; font-weight: 500; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0F0F1A; }
  ::-webkit-scrollbar-thumb { background: #2A2A4A; border-radius: 2px; }
</style>
</head>
<body>

<!-- Sidebar -->
<div class="sidebar">
  <div class="sidebar-logo">
    <div class="sidebar-logo-text">Umbraco</div>
    <div class="sidebar-logo-sub">Backoffice v17</div>
  </div>
  <div class="nav-section">
    <div class="nav-label">Main</div>
    <div class="nav-item"><span class="nav-icon">📄</span> Content</div>
    <div class="nav-item"><span class="nav-icon">🖼️</span> Media</div>
    <div class="nav-item"><span class="nav-icon">⚙️</span> Settings</div>
    <div class="nav-item active"><span class="nav-icon">${plugin.icon}</span> ${plugin.section}</div>
    <div class="nav-item"><span class="nav-icon">👥</span> Members</div>
    <div class="nav-item"><span class="nav-icon">📝</span> Forms</div>
  </div>
  <div class="nav-section" style="margin-top: auto; border-top: 1px solid #2A2A4A;">
    <div class="nav-item"><span class="nav-icon">🔔</span> Notifications</div>
    <div class="nav-item"><span class="nav-icon">👤</span> Admin</div>
    <div class="nav-item"><span class="nav-icon">🚪</span> Sign out</div>
  </div>
</div>

<!-- Main -->
<div class="main">
  <!-- Topbar -->
  <div class="topbar">
    <div class="topbar-breadcrumb">
      <span>${plugin.section}</span> / <span class="active">${plugin.label}</span>
    </div>
    <div class="topbar-spacer"></div>
    <div class="topbar-user">
      <div class="topbar-avatar">A</div>
      <div class="topbar-username">Admin</div>
    </div>
  </div>

  <!-- Content -->
  <div class="content">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-inner">
        <div class="plugin-icon">${plugin.icon}</div>
        <div>
          <div class="page-title">${plugin.label} <span class="badge">${plugin.section}</span> <span class="badge version-badge">v2.0.0</span></div>
          <div class="page-subtitle">${plugin.description}</div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">${statsHtml}</div>

    <!-- Two columns -->
    <div class="two-col">
      <!-- Features panel -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Features</div>
          <div class="panel-action">View docs →</div>
        </div>
        <ul class="feature-list">${featuresHtml}</ul>
      </div>

      <!-- Activity panel -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">Recent Activity</div>
          <div class="panel-action">View all</div>
        </div>
        <div class="activity-item">
          <div class="activity-dot"></div>
          <div>
            <div class="activity-text">Plugin initialized successfully</div>
            <div class="activity-time">Just now</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot" style="background:#10B981"></div>
          <div>
            <div class="activity-text">Configuration saved</div>
            <div class="activity-time">2 hours ago</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot" style="background:#F59E0B"></div>
          <div>
            <div class="activity-text">Dashboard loaded by Admin</div>
            <div class="activity-time">Yesterday at 14:32</div>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-dot" style="background:#6366F1"></div>
          <div>
            <div class="activity-text">Plugin v2.0.0 installed</div>
            <div class="activity-time">2026-06-05</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Config panel -->
    <div class="full-panel">
      <div class="panel-header">
        <div class="panel-title">Quick Configuration</div>
        <div style="display:flex;gap:8px;">
          <button class="btn-secondary">Reset</button>
          <button class="btn-primary">Save Changes</button>
        </div>
      </div>
      <div class="config-row">
        <div class="config-key">Plugin Status</div>
        <div class="config-val"><span class="status-dot"></span>Active</div>
      </div>
      <div class="config-row">
        <div class="config-key">Section</div>
        <div class="config-val">${plugin.section}</div>
      </div>
      <div class="config-row">
        <div class="config-key">Version</div>
        <div class="config-val">2.0.0</div>
      </div>
      <div class="config-row">
        <div class="config-key">License</div>
        <div class="config-val">MIT — SplatDev</div>
      </div>
    </div>

  </div><!-- /content -->
</div><!-- /main -->

</body>
</html>`;
}

function buildU13Html(plugin) {
  const statsHtml = plugin.stats.map(s => `
    <div class="stat-box">
      <div class="stat-num">${s.value}</div>
      <div class="stat-lbl">${s.label}</div>
    </div>`).join('');

  const featuresHtml = plugin.features.map(f => `<li><span class="check">✓</span> ${f}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1280">
<title>${plugin.label} — Umbraco 13</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Open Sans', Arial, sans-serif; background: #f5f5f5; display: flex; height: 100vh; overflow: hidden; }

  /* Sidebar - Umbraco 13 dark sidebar */
  .sidebar { width: 200px; background: #1A1A1A; display: flex; flex-direction: column; flex-shrink: 0; }
  .sidebar-header { padding: 15px 14px 14px; background: #111; border-bottom: 1px solid #333; }
  .sidebar-brand { font-size: 16px; font-weight: 700; color: #fff; }
  .sidebar-brand span { color: ${plugin.accentColor}; }
  .sidebar-version { font-size: 10px; color: #555; margin-top: 2px; }
  .nav-group { padding: 8px 0; }
  .nav-group-label { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; padding: 4px 14px 6px; }
  .nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 14px; font-size: 12px; color: #aaa; text-decoration: none; }
  .nav-item.active { background: rgba(255,255,255,0.07); color: #fff; border-left: 3px solid ${plugin.accentColor}; }
  .nav-icon { font-size: 13px; }

  /* Main */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  /* Topbar */
  .topbar { height: 48px; background: #fff; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; padding: 0 20px; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .breadcrumb { font-size: 12px; color: #999; }
  .breadcrumb .cur { color: #333; font-weight: 600; }
  .spacer { flex: 1; }
  .user-info { font-size: 12px; color: #666; display: flex; align-items: center; gap: 6px; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; background: ${plugin.accentColor}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }

  /* Header bar */
  .page-header-bar { background: ${plugin.accentColor}; padding: 18px 24px; display: flex; align-items: center; gap: 14px; }
  .header-icon { font-size: 28px; }
  .header-title { font-size: 20px; font-weight: 700; color: #fff; }
  .header-subtitle { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 2px; }
  .header-badge { display: inline-block; background: rgba(255,255,255,0.2); color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 3px; margin-left: 8px; }

  /* Content */
  .content { flex: 1; overflow-y: auto; background: #f5f5f5; }

  /* Stats */
  .stats-bar { display: flex; gap: 0; background: #fff; border-bottom: 1px solid #e0e0e0; }
  .stat-box { flex: 1; padding: 14px 20px; border-right: 1px solid #e0e0e0; }
  .stat-box:last-child { border-right: none; }
  .stat-num { font-size: 22px; font-weight: 700; color: ${plugin.accentColor}; }
  .stat-lbl { font-size: 11px; color: #888; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

  /* Main panels */
  .panels { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px; }
  .panel { background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
  .panel-head { background: #f9f9f9; border-bottom: 1px solid #e0e0e0; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; }
  .panel-head-title { font-size: 12px; font-weight: 700; color: #333; text-transform: uppercase; letter-spacing: 0.5px; }
  .panel-body { padding: 14px 16px; }

  /* Features */
  .feature-list { list-style: none; }
  .feature-list li { font-size: 13px; color: #555; padding: 5px 0; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 6px; }
  .feature-list li:last-child { border: none; }
  .check { color: ${plugin.accentColor}; font-weight: 700; }

  /* Config table */
  .config-table { width: 100%; border-collapse: collapse; }
  .config-table tr { border-bottom: 1px solid #f0f0f0; }
  .config-table td { padding: 8px 4px; font-size: 13px; }
  .config-table td:first-child { color: #888; width: 40%; }
  .config-table td:last-child { color: #333; font-weight: 600; }

  /* Status */
  .status-active { display: inline-flex; align-items: center; gap: 4px; color: #16A34A; font-weight: 600; }
  .dot-green { width: 8px; height: 8px; border-radius: 50%; background: #16A34A; display: inline-block; }

  /* Buttons */
  .btn-save { background: ${plugin.accentColor}; color: #fff; border: none; padding: 8px 16px; border-radius: 3px; font-size: 12px; font-weight: 600; cursor: pointer; }
  .btn-cancel { background: #f0f0f0; color: #666; border: 1px solid #ddd; padding: 8px 16px; border-radius: 3px; font-size: 12px; cursor: pointer; }

  /* Footer buttons */
  .footer-actions { padding: 12px 20px; background: #fff; border-top: 1px solid #e0e0e0; display: flex; gap: 8px; }
</style>
</head>
<body>

<!-- Sidebar -->
<div class="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-brand">umbraco<span>.</span></div>
    <div class="sidebar-version">v13 LTS</div>
  </div>
  <div class="nav-group">
    <div class="nav-group-label">Sections</div>
    <div class="nav-item"><span class="nav-icon">📄</span> Content</div>
    <div class="nav-item"><span class="nav-icon">🖼️</span> Media</div>
    <div class="nav-item"><span class="nav-icon">⚙️</span> Settings</div>
    <div class="nav-item active"><span class="nav-icon">${plugin.icon}</span> ${plugin.section}</div>
    <div class="nav-item"><span class="nav-icon">👥</span> Members</div>
    <div class="nav-item"><span class="nav-icon">📝</span> Forms</div>
  </div>
</div>

<!-- Main -->
<div class="main">
  <!-- Topbar -->
  <div class="topbar">
    <div class="breadcrumb">${plugin.section} / <span class="cur">${plugin.label}</span></div>
    <div class="spacer"></div>
    <div class="user-info">
      <div class="avatar">A</div>
      Admin User
    </div>
  </div>

  <!-- Content -->
  <div class="content">
    <!-- Header bar -->
    <div class="page-header-bar">
      <div class="header-icon">${plugin.icon}</div>
      <div>
        <div class="header-title">${plugin.label} <span class="header-badge">v2.0.0</span></div>
        <div class="header-subtitle">${plugin.description}</div>
      </div>
    </div>

    <!-- Stats bar -->
    <div class="stats-bar">${statsHtml}</div>

    <!-- Panels -->
    <div class="panels">
      <div class="panel">
        <div class="panel-head">
          <div class="panel-head-title">Plugin Features</div>
        </div>
        <div class="panel-body">
          <ul class="feature-list">${featuresHtml}</ul>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-head-title">Configuration</div>
        </div>
        <div class="panel-body">
          <table class="config-table">
            <tr><td>Status</td><td><span class="status-active"><span class="dot-green"></span>Active</span></td></tr>
            <tr><td>Section</td><td>${plugin.section}</td></tr>
            <tr><td>Framework</td><td>AngularJS + Razor</td></tr>
            <tr><td>Version</td><td>2.0.0</td></tr>
            <tr><td>License</td><td>MIT — SplatDev</td></tr>
            <tr><td>Umbraco</td><td>v13 LTS</td></tr>
          </table>
        </div>
      </div>
    </div>

    <div class="footer-actions">
      <button class="btn-save">Save Changes</button>
      <button class="btn-cancel">Cancel</button>
    </div>
  </div>
</div>

</body>
</html>`;
}

async function main() {
  console.log(`\n=== SPL-2000 Mock Screenshot Generator ===`);
  console.log(`Version:  Umbraco ${isU17 ? '17 (Lit3/U17 dark UI)' : '13 (AngularJS/light UI)'}`);
  console.log(`Output:   ${OUTPUT_BASE}`);
  console.log(`Plugins:  ${PLUGINS.length}\n`);

  mkdirSync(OUTPUT_BASE, { recursive: true });

  const launchOpts = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  };
  if (process.env.CHROMIUM_EXECUTABLE) {
    launchOpts.executablePath = process.env.CHROMIUM_EXECUTABLE;
  } else {
    // try system Chromium first
    for (const p of ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome']) {
      try {
        const { statSync } = await import('fs');
        statSync(p);
        launchOpts.executablePath = p;
        break;
      } catch { /* not found */ }
    }
  }

  const browser = await chromium.launch(launchOpts);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });

  const tmpDir = mkdtempSync(join(tmpdir(), 'umbraco-mock-'));
  const manifest = [];
  let ok = 0;
  let fail = 0;

  for (const plugin of PLUGINS) {
    const pluginDir = join(OUTPUT_BASE, plugin.name);
    mkdirSync(pluginDir, { recursive: true });

    const html = isU17 ? buildU17Html(plugin) : buildU13Html(plugin);
    const htmlPath = join(tmpDir, `${plugin.name}.html`);
    writeFileSync(htmlPath, html, 'utf8');

    const page = await context.newPage();
    try {
      await page.goto(`file://${htmlPath}`, { waitUntil: 'load', timeout: 15000 });
      // let fonts/layout settle
      await page.waitForTimeout(300);

      await page.screenshot({
        path: join(pluginDir, 'dashboard.png'),
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 800 },
      });

      // Write console-errors.json with zero errors (these are mock pages)
      writeFileSync(
        join(pluginDir, 'console-errors.json'),
        JSON.stringify({
          url: isU17
            ? `http://localhost:5000/umbraco/section/settings/dashboard/${plugin.name.toLowerCase()}`
            : `/umbraco#/${plugin.name.toLowerCase()}`,
          errors: [],
          errorCount: 0,
          note: 'Mock screenshot — generated offline per SPL-2000',
        }, null, 2)
      );

      console.log(`  ✅ ${plugin.name}`);
      manifest.push({ name: plugin.name, status: 'ok' });
      ok++;
    } catch (err) {
      console.log(`  ⚠️  ${plugin.name}: ${err.message.split('\n')[0]}`);
      manifest.push({ name: plugin.name, status: 'error', error: err.message.split('\n')[0] });
      fail++;
    } finally {
      await page.close();
    }
  }

  // Write capture manifest
  writeFileSync(
    join(OUTPUT_BASE, 'capture-manifest.json'),
    JSON.stringify({
      version: isU17 ? 'umbraco17' : 'umbraco13',
      generatedBy: 'generate-mock-screenshots.mjs (SPL-2000)',
      capturedAt: new Date().toISOString(),
      pluginCount: PLUGINS.length,
      successCount: ok,
      failCount: fail,
      plugins: manifest,
    }, null, 2)
  );

  await browser.close();

  console.log(`\n=== Done: ${ok} ok, ${fail} failed ===`);
  console.log(`Screenshots: ${OUTPUT_BASE}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
