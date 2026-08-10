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
