function m(r) {
  if (r <= 0) return "closed";
  const e = Math.floor(r / 60), t = r % 60;
  return e > 0 ? `${e}h ${t}m left` : `${t}m left`;
}
function p(r) {
  const e = (r ?? "").replace(/\D/g, "");
  if (!e) return "";
  for (const t of f) {
    if (!e.startsWith(t)) continue;
    const o = h(t, e.slice(t.length));
    if (o) return `+${t} ${o}`;
  }
  return `+${e}`;
}
const a = {
  // North America — NANP covers US, Canada, and the Caribbean (DR, PR, Jamaica...)
  1: { 10: { groups: [3, 3, 4], parens: !0 } },
  // Mexico. 10 digits national; CDMX/GDL/MTY use a 2-digit area code, the rest 3.
  // An 11-digit value is the legacy "1" mobile prefix WhatsApp used to include.
  52: {
    10: { groups: [3, 3, 4] },
    11: { groups: [3, 3, 4], mobilePrefix: "1" }
  },
  // Brazil — 2-digit area code, 9-digit mobile or 8-digit landline.
  55: {
    11: { groups: [2, 5, 4], parens: !0 },
    10: { groups: [2, 4, 4], parens: !0 }
  },
  // Argentina — mobiles carry a leading 9 that is written separately.
  54: {
    11: { groups: [2, 4, 4], hyphenTail: !0, mobilePrefix: "9" },
    10: { groups: [2, 4, 4], hyphenTail: !0 }
  },
  // Rest of South America
  56: { 9: { groups: [1, 4, 4] } },
  // Chile
  57: { 10: { groups: [3, 3, 4] } },
  // Colombia
  58: { 10: { groups: [3, 3, 4] } },
  // Venezuela
  51: { 9: { groups: [3, 3, 3] } },
  // Peru
  593: { 9: { groups: [2, 3, 4] } },
  // Ecuador
  591: { 8: { groups: [4, 4] } },
  // Bolivia
  595: { 9: { groups: [3, 3, 3] } },
  // Paraguay
  598: { 8: { groups: [4, 4] } },
  // Uruguay
  592: { 7: { groups: [3, 4] } },
  // Guyana
  597: { 7: { groups: [3, 4] } },
  // Suriname
  // Central America
  502: { 8: { groups: [4, 4] } },
  // Guatemala
  503: { 8: { groups: [4, 4] } },
  // El Salvador
  504: { 8: { groups: [4, 4] } },
  // Honduras
  505: { 8: { groups: [4, 4] } },
  // Nicaragua
  506: { 8: { groups: [4, 4] } },
  // Costa Rica
  507: { 8: { groups: [4, 4] } },
  // Panama
  509: { 8: { groups: [4, 4] } },
  // Haiti
  // Europe — where the studio already has contacts
  44: { 10: { groups: [4, 3, 3] }, 9: { groups: [4, 5] } },
  // UK
  351: { 9: { groups: [3, 3, 3] } },
  // Portugal
  34: { 9: { groups: [3, 3, 3] } },
  // Spain
  33: { 9: { groups: [1, 2, 2, 2, 2] } },
  // France
  49: { 11: { groups: [4, 7] }, 10: { groups: [3, 7] } },
  // Germany
  39: { 10: { groups: [3, 3, 4] } }
  // Italy
}, f = Object.keys(a).sort((r, e) => e.length - r.length);
function h(r, e) {
  const t = a[r];
  if (!t) return null;
  let o = e, n = "";
  const s = t[o.length];
  if (!s) return null;
  s.mobilePrefix && o.startsWith(s.mobilePrefix) && (n = `${s.mobilePrefix} `, o = o.slice(s.mobilePrefix.length));
  const u = [];
  let i = 0;
  for (const g of s.groups) {
    if (i >= o.length) break;
    u.push(o.slice(i, i + g)), i += g;
  }
  if (i < o.length && u.push(o.slice(i)), u.length > 1 && (s.parens || s.hyphenTail)) {
    const [g, ...c] = u, l = s.parens ? `(${g})` : g;
    return `${n}${l} ${c.join("-")}`;
  }
  return n + u.join(" ");
}
function d(r, e, t) {
  return (t ?? "").trim() || (r ?? "").trim() || p(e);
}
function $(r, e, t) {
  const n = ((t ?? "").trim() || (r ?? "").trim()).split(/\s+/).filter(Boolean);
  if (n.length >= 2) return (n[0][0] + n[n.length - 1][0]).toUpperCase();
  if (n.length === 1) return n[0].slice(0, 2).toUpperCase();
  const s = (e ?? "").replace(/\D/g, "");
  return s ? s.slice(-2) : "?";
}
function b(r) {
  const e = r ?? "";
  let t = 0;
  for (let o = 0; o < e.length; o++) t = t * 31 + e.charCodeAt(o) | 0;
  return Math.abs(t) % 360;
}
function y(r) {
  if (!r) return "";
  const e = /[Zz]|[+-]\d{2}:?\d{2}$/.test(r) ? r : `${r}Z`, t = new Date(e);
  if (Number.isNaN(t.getTime())) return "";
  const o = t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), n = /* @__PURE__ */ new Date();
  n.setHours(0, 0, 0, 0);
  const s = Math.floor((n.getTime() - t.getTime()) / 864e5);
  return s < 0 ? o : s < 1 ? `Yesterday ${o}` : s < 7 ? `${t.toLocaleDateString([], { weekday: "short" })} ${o}` : t.toLocaleDateString([], { day: "2-digit", month: "short" });
}
export {
  $ as a,
  d as b,
  b as c,
  y as d,
  m as e,
  p as f
};
//# sourceMappingURL=types-BWOc9hyT.js.map
