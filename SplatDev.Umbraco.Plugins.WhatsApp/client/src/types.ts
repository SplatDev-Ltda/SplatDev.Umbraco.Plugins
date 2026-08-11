export interface ConversationSummary {
  id: number;
  waId: string;
  profileName?: string | null;
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

  // [country code, national-number grouping]. Ordered longest-prefix-first so 44 does
  // not shadow 441, etc.
  const rules: Array<[string, (n: string) => string | null]> = [
    // Brazil: 2-digit area code, then 9-digit mobile (99999-9999) or 8-digit landline.
    ["55", (n) =>
      n.length === 11 ? `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
      : n.length === 10 ? `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
      : null],
    // NANP: (NPA) NXX-XXXX
    ["1", (n) => (n.length === 10 ? `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}` : null)],
    // UK: 4-3-4 / 4-6 are the common readable groupings.
    ["44", (n) =>
      n.length === 10 ? `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}`
      : n.length === 9 ? `${n.slice(0, 4)} ${n.slice(4)}`
      : null],
    // Portugal / Spain / France / Germany / Italy: 3-3-3 style groups read well.
    ["351", (n) => (n.length === 9 ? `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}` : null)],
    ["34", (n) => (n.length === 9 ? `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}` : null)],
    ["33", (n) => (n.length === 9 ? `${n.slice(0, 1)} ${n.slice(1, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7)}` : null)],
    ["49", (n) => (n.length >= 10 ? `${n.slice(0, 3)} ${n.slice(3)}` : null)],
    ["39", (n) => (n.length >= 9 ? `${n.slice(0, 3)} ${n.slice(3)}` : null)],
  ];

  for (const [cc, group] of rules) {
    if (!digits.startsWith(cc)) continue;
    const national = digits.slice(cc.length);
    const grouped = group(national);
    if (grouped) return `+${cc} ${grouped}`;
  }

  return `+${digits}`;
}

/** The name to show for a contact, falling back to the formatted number. */
export function contactName(profileName?: string | null, waId?: string | null): string {
  const name = (profileName ?? "").trim();
  return name || formatPhone(waId);
}

/**
 * Initials for the avatar. Two letters from a real name, otherwise the last two digits
 * of the number so distinct contacts still look distinct.
 */
export function contactInitials(profileName?: string | null, waId?: string | null): string {
  const parts = (profileName ?? "").trim().split(/\s+/).filter(Boolean);
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
