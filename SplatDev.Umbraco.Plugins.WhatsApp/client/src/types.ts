export interface ConversationSummary {
  id: number;
  waId: string;
  profileName?: string | null;
  /** Operator-maintained name. Preferred over profileName, which WhatsApp owns. */
  contactName?: string | null;
  lastMessagePreview?: string | null;
  lastMessageUtc?: string | null;
  lastInboundUtc?: string | null;
  unreadCount: number;
  /** False once the 24-hour customer-service window has closed. */
  windowOpen: boolean;
  windowMinutesRemaining: number;
}

export interface MessageView {
  id: number;
  whatsAppMessageId?: string | null;
  inbound: boolean;
  messageType: string;
  body?: string | null;
  templateName?: string | null;
  status: string;
  errorMessage?: string | null;
  timestampUtc: string;
}

export interface ThreadResponse {
  conversation: ConversationSummary;
  messages: MessageView[];
}

export interface MessageTemplate {
  name: string;
  language: string;
  status: string;
  category: string;
  bodyText?: string | null;
  variableCount: number;
  isUsable: boolean;
}

export interface PhoneNumberStatus {
  displayPhoneNumber?: string | null;
  verifiedName?: string | null;
  qualityRating?: string | null;
  platformType?: string | null;
  codeVerificationStatus?: string | null;
  webhookUrl?: string | null;
}

export interface WhatsAppStatus {
  configured: boolean;
  webhookConfigured: boolean;
  signatureValidation: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  windowHours: number;
  webhookPath: string;
  notificationsEnabled: boolean;
  notificationEmail?: string | null;
  dashboardIdleMinutes: number;
  notificationCooldownMinutes: number;
  dashboardLastSeenUtc?: string | null;
  phone?: PhoneNumberStatus | null;
}

/** Formats remaining window minutes as a compact "23h 41m" / "41m" label. */
export function formatWindow(minutes: number): string {
  if (minutes <= 0) return "closed";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
}

/** Renders a UTC timestamp in the viewer's locale, tolerating a missing value. */
export function formatTime(iso?: string | null): string {
  if (!iso) return "";
  // Timestamps are serialized as UTC but may arrive without a zone designator.
  const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

/** Formats a wa_id (digits only) back into something readable. */
export function formatWaId(waId: string): string {
  return waId?.startsWith("+") ? waId : `+${waId ?? ""}`;
}

/**
 * Formats a wa_id into a readable national number.
 *
 * wa_id arrives as bare digits in E.164 order (country code first, no plus), e.g.
 * "5515991424586". Rendering that raw is hard to scan and hard to read back over the
 * phone, so it is grouped the way the destination country writes it. Storage and every
 * API call keep the untouched E.164 digits — this is display only, per the E.164
 * guidance that you store canonical and format for humans.
 *
 * Falls back to "+<digits>" for country codes without a rule, which is still valid
 * international notation, so an unknown country degrades rather than breaks.
 */
export function formatPhone(waId?: string | null): string {
  const digits = (waId ?? "").replace(/\D/g, "");
  if (!digits) return "";

  for (const cc of DIAL_CODES) {
    if (!digits.startsWith(cc)) continue;
    const grouped = groupNational(cc, digits.slice(cc.length));
    if (grouped) return `+${cc} ${grouped}`;
  }

  // Unknown country code, or a length we have no rule for. Plain E.164 is still valid
  // international notation, so this degrades rather than breaks.
  return `+${digits}`;
}

/**
 * National-number groupings per country code, keyed by the national length so a country
 * can write mobiles and landlines differently.
 *
 * `parens` wraps the first group, which is the convention in Brazil and the NANP.
 * `hyphenTail` joins the groups after the first with a hyphen without wrapping the first,
 * which is how Argentina writes 9 11 2345-6789.
 * `mobilePrefix` splits off a leading trunk/mobile digit that is written on its own —
 * Argentina's 9 and Mexico's legacy 1, both of which WhatsApp still sends inside the wa_id.
 */
interface Grouping {
  groups: number[];
  parens?: boolean;
  hyphenTail?: boolean;
  mobilePrefix?: string;
}

const NUMBER_RULES: Record<string, Record<number, Grouping>> = {
  // North America — NANP covers US, Canada, and the Caribbean (DR, PR, Jamaica...)
  "1": { 10: { groups: [3, 3, 4], parens: true } },

  // Mexico. 10 digits national; CDMX/GDL/MTY use a 2-digit area code, the rest 3.
  // An 11-digit value is the legacy "1" mobile prefix WhatsApp used to include.
  "52": {
    10: { groups: [3, 3, 4] },
    11: { groups: [3, 3, 4], mobilePrefix: "1" },
  },

  // Brazil — 2-digit area code, 9-digit mobile or 8-digit landline.
  "55": {
    11: { groups: [2, 5, 4], parens: true },
    10: { groups: [2, 4, 4], parens: true },
  },

  // Argentina — mobiles carry a leading 9 that is written separately.
  "54": {
    11: { groups: [2, 4, 4], hyphenTail: true, mobilePrefix: "9" },
    10: { groups: [2, 4, 4], hyphenTail: true },
  },

  // Rest of South America
  "56": { 9: { groups: [1, 4, 4] } },            // Chile
  "57": { 10: { groups: [3, 3, 4] } },           // Colombia
  "58": { 10: { groups: [3, 3, 4] } },           // Venezuela
  "51": { 9: { groups: [3, 3, 3] } },            // Peru
  "593": { 9: { groups: [2, 3, 4] } },           // Ecuador
  "591": { 8: { groups: [4, 4] } },              // Bolivia
  "595": { 9: { groups: [3, 3, 3] } },           // Paraguay
  "598": { 8: { groups: [4, 4] } },              // Uruguay
  "592": { 7: { groups: [3, 4] } },              // Guyana
  "597": { 7: { groups: [3, 4] } },              // Suriname

  // Central America
  "502": { 8: { groups: [4, 4] } },              // Guatemala
  "503": { 8: { groups: [4, 4] } },              // El Salvador
  "504": { 8: { groups: [4, 4] } },              // Honduras
  "505": { 8: { groups: [4, 4] } },              // Nicaragua
  "506": { 8: { groups: [4, 4] } },              // Costa Rica
  "507": { 8: { groups: [4, 4] } },              // Panama
  "509": { 8: { groups: [4, 4] } },              // Haiti

  // Europe — where the studio already has contacts
  "44": { 10: { groups: [4, 3, 3] }, 9: { groups: [4, 5] } },   // UK
  "351": { 9: { groups: [3, 3, 3] } },                          // Portugal
  "34": { 9: { groups: [3, 3, 3] } },                           // Spain
  "33": { 9: { groups: [1, 2, 2, 2, 2] } },                     // France
  "49": { 11: { groups: [4, 7] }, 10: { groups: [3, 7] } },     // Germany
  "39": { 10: { groups: [3, 3, 4] } },                          // Italy
};

/** Dial codes tried longest-first so 593 is not shadowed by a shorter prefix. */
const DIAL_CODES = Object.keys(NUMBER_RULES).sort((a, b) => b.length - a.length);

function groupNational(cc: string, national: string): string | null {
  const byLength = NUMBER_RULES[cc];
  if (!byLength) return null;

  let rest = national;
  let lead = "";

  const rule = byLength[rest.length];
  if (!rule) return null;

  if (rule.mobilePrefix && rest.startsWith(rule.mobilePrefix)) {
    lead = `${rule.mobilePrefix} `;
    rest = rest.slice(rule.mobilePrefix.length);
  }

  const parts: string[] = [];
  let i = 0;
  for (const size of rule.groups) {
    if (i >= rest.length) break;
    parts.push(rest.slice(i, i + size));
    i += size;
  }
  if (i < rest.length) parts.push(rest.slice(i));

  if (parts.length > 1 && (rule.parens || rule.hyphenTail)) {
    const [first, ...tail] = parts;
    const head = rule.parens ? `(${first})` : first;
    return `${lead}${head} ${tail.join("-")}`;
  }
  return lead + parts.join(" ");
}

/**
 * The name to show, in order of trust: the name your team saved, then the WhatsApp
 * profile name, then the formatted number. The saved name wins because WhatsApp's can
 * change underneath you and is absent for anyone without a profile name set.
 */
export function contactName(
  profileName?: string | null,
  waId?: string | null,
  savedName?: string | null,
): string {
  return (savedName ?? "").trim() || (profileName ?? "").trim() || formatPhone(waId);
}

/**
 * Initials for the avatar. Two letters from a real name, otherwise the last two digits
 * of the number so distinct contacts still look distinct.
 */
export function contactInitials(
  profileName?: string | null,
  waId?: string | null,
  savedName?: string | null,
): string {
  const source = (savedName ?? "").trim() || (profileName ?? "").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const digits = (waId ?? "").replace(/\D/g, "");
  return digits ? digits.slice(-2) : "?";
}

/**
 * Stable avatar hue from the wa_id, so a contact keeps the same colour between sessions
 * and across operators without storing anything.
 */
export function contactHue(waId?: string | null): number {
  const s = waId ?? "";
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

/** Compact timestamp: time for today, "Yesterday", weekday within a week, else a date. */
export function formatTimeShort(iso?: string | null): string {
  if (!iso) return "";
  const normalized = /[Zz]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return "";

  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const days = Math.floor((startOfToday.getTime() - d.getTime()) / 86_400_000);

  if (days < 0) return time;                    // today
  if (days < 1) return `Yesterday ${time}`;
  if (days < 7) return `${d.toLocaleDateString([], { weekday: "short" })} ${time}`;
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}


export interface Contact {
  id: number;
  waId: string;
  displayName?: string | null;
  company?: string | null;
  email?: string | null;
  notes?: string | null;
  createdUtc: string;
  updatedUtc: string;
  /** Set when this number already has a conversation, so the UI can link to it. */
  conversationId?: number | null;
}

export interface ContactUpsert {
  waId: string;
  displayName?: string | null;
  company?: string | null;
  email?: string | null;
  notes?: string | null;
}
