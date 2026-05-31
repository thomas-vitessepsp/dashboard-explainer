/* Vitesse Insights — refreshed charts */

const balanceData = [
{ label: "8 Mar", balance: 7.20, debit: 1.10, credit: 0.24 },
{ label: null, balance: 6.60, debit: 0.38, credit: 0.12 },
{ label: "22 Mar", balance: 7.40, debit: 1.22, credit: 0.36 },
{ label: null, balance: 7.70, debit: 0.30, credit: 0.18 },
{ label: "5 Apr", balance: 7.00, debit: 0.86, credit: 0.60 },
{ label: null, balance: 7.60, debit: 0.40, credit: 0.14 },
{ label: "19 Apr", balance: 7.60, debit: 0.96, credit: 0.78 },
{ label: null, balance: 7.80, debit: 0.28, credit: 0.16 },
{ label: "3 May", balance: 7.40, debit: 1.08, credit: 0.88 },
{ label: null, balance: 7.70, debit: 0.42, credit: 0.20 },
{ label: "17 May", balance: 7.90, debit: 1.18, credit: 0.96 },
{ label: null, balance: 7.30, debit: 0.96, credit: 0.24 },
{ label: "27 May", balance: 8.00, debit: 0.64, credit: 0.38, partial: true }];


const fundData = [
{ name: "USD", value: 48.8, color: PURP.base, onColor: "#fff" },
{ name: "GBP", value: 33.8, color: PURP.dark, onColor: "#fff" },
{ name: "EUR", value: 10.0, color: PURP.pastel, onColor: "#3C3640" },
{ name: "PLN", value: 3.6, color: ORANGE.light, onColor: "#3C3640" },
{ name: "SEK", value: 2.4, color: ORANGE.warm, onColor: "#fff" },
{ name: "Other", value: 1.4, color: NEUTRAL_MUTED, onColor: "#3C3640" }];


const paymentData = [
{ label: "8 Mar", small: 0.18, mid: 0.42, large: 0.50, volume: 170 },
{ label: null, small: 0.18, mid: 0.44, large: 0.52, volume: 175 },
{ label: "22 Mar", small: 0.20, mid: 0.46, large: 0.56, volume: 180 },
{ label: null, small: 0.19, mid: 0.50, large: 0.60, volume: 190 },
{ label: "5 Apr", small: 0.20, mid: 0.48, large: 0.54, volume: 180 },
{ label: null, small: 0.21, mid: 0.46, large: 0.56, volume: 180 },
{ label: "19 Apr", small: 0.19, mid: 0.46, large: 0.52, volume: 170 },
{ label: null, small: 0.22, mid: 0.52, large: 0.62, volume: 190 },
{ label: "3 May", small: 0.23, mid: 0.54, large: 0.64, volume: 200 },
{ label: null, small: 0.20, mid: 0.48, large: 0.56, volume: 180 },
{ label: "17 May", small: 0.18, mid: 0.42, large: 0.48, volume: 160 },
{ label: null, small: 0.19, mid: 0.46, large: 0.52, volume: 190 },
{ label: "27 May", small: 0.12, mid: 0.18, large: 0.10, volume: 80, partial: true }];


const tpaGroups = [
{ label: "Fund balance", values: [3.46, 2.24, 0.80], unit: "M" },
{ label: "Number of accounts", values: [32, 18, 9] },
{ label: "Avg. runway", values: [42, 51, 47], unit: "d" }];

const tpaSeries = [
{ name: "Blue Plain Risk Admins", color: PURP.dark },
{ name: "Insurova", color: PURP.base },
{ name: "Iron Oak Claims", color: PURP.pastel }];


const runwayRows = [
{ account: "Blue Plain | GBP Auto", days: 6, daily: "£149,600", closing: "£880,200", tone: "danger" },
{ account: "Insurova | GBP Auto", days: 11, daily: "£80,950", closing: "£874,000", tone: "warn" },
{ account: "Blue Plain | USD Work Comp", days: 13, daily: "£67,450", closing: "£889,600", tone: "warn" },
{ account: "Blue Plain | NOK Auto", days: 14, daily: "£55,950", closing: "£768,300", tone: "soft" },
{ account: "Insurova | PLN Auto", days: 17, daily: "£48,750", closing: "£851,700", tone: "soft" },
{ account: "Blue Plain | PLN Prop", days: 18, daily: "£51,600", closing: "£935,950", tone: "soft" }];


// ---------- animation ----------
// One-shot reveal 0→1 on mount; in parallel, an "active clock" t (seconds since
// the topic became active, 0 when idle). p drives reveal; t drives per-point
// jitter so each widget's values, lines, bars and segments wiggle independently.
function useTopicProgress(active) {
  const [s, setS] = React.useState({ p: 0, t: 0 });
  const startRef = React.useRef(null);
  const activeStartRef = React.useRef(null);
  React.useEffect(() => {
    if (startRef.current === null) startRef.current = performance.now();
    activeStartRef.current = active ? performance.now() : null;
    let raf;
    let cancelled = false;
    const REVEAL_MS = 1000;
    const loop = (now) => {
      if (cancelled) return;
      const dt = now - startRef.current;
      const p = Math.min(1, dt / REVEAL_MS);
      const t = activeStartRef.current !== null ? (now - activeStartRef.current) / 1000 : 0;
      setS({ p, t });
      // Keep ticking only if reveal is in-flight OR widget is active
      if (p < 1 || activeStartRef.current !== null) {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {cancelled = true;cancelAnimationFrame(raf);};
  }, [active]);
  return s;
}
const easeOut = (p) => 1 - Math.pow(1 - p, 3);

// Parse "£7.56M" / "430" / "99.13%" → {prefix, target, decimals, suffix}
function parseAnimatable(str) {
  const m = String(str).match(/^([^\d\-]*)(-?[\d,]*\.?\d+)(.*)$/);
  if (!m) return null;
  const numStr = m[2];
  const target = parseFloat(numStr.replace(/,/g, ""));
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { prefix: m[1], target, decimals, suffix: m[3] };
}
function formatAnimated(parsed, current) {
  if (!parsed) return "";
  const fixed = current.toFixed(parsed.decimals);
  // Add thousand separators to the integer part so e.g. 17604 → "17,604"
  const [intPart, decPart] = fixed.split(".");
  const sign = intPart.startsWith("-") ? "-" : "";
  const intAbs = sign ? intPart.slice(1) : intPart;
  const withCommas = intAbs.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const numStr = decPart !== undefined ? `${sign}${withCommas}.${decPart}` : `${sign}${withCommas}`;
  return `${parsed.prefix}${numStr}${parsed.suffix}`;
}

// Per-point sinusoidal jitter — returns `v` unchanged when t<=0 (idle).
const jitV = (v, t, phase, amp) => t > 0 ? v * (1 + amp * Math.sin(t * 2.6 + phase)) : v;

// ---------- atoms ----------
const Card = ({ children, style, active, ...rest }) =>
<div {...rest} style={{
  background: "#FFFFFF",
  border: active ? "1px solid #831FBF" : "1px solid rgba(10,10,10,0.12)",
  boxShadow: active ? "0 0 0 4px rgba(131,31,191,0.10), 0 12px 32px -16px rgba(71,10,104,0.18)" : "none",
  borderRadius: 18,
  padding: 24,
  transition: "border-color 220ms cubic-bezier(0.4,0,0.2,1), box-shadow 220ms cubic-bezier(0.4,0,0.2,1)",
  ...style
}}>{children}</div>;


// Hover hint popover for the (?) badges next to widget titles. Content is
// grounded in the Vitesse docs (docs.vitessepsp.com — Portfolio Overview,
// Metrics, Charts, Tables). Hovering the badge OR the popover keeps it open.
const HintBadge = ({ title, body, align = "left" }) => {
  const [open, setOpen] = React.useState(false);
  const tipRef = React.useRef(null);
  // Horizontal nudge applied once the popover is open, so it never spills past
  // the viewport edge on narrow / mobile screens regardless of its anchor side.
  const [dx, setDx] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!open) { setDx(0); return; }
    const el = tipRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 10;
    let shift = 0;
    if (r.right > window.innerWidth - margin) shift = (window.innerWidth - margin) - r.right;
    else if (r.left < margin) shift = margin - r.left;
    if (shift !== 0) setDx((prev) => prev + shift);
  }, [open]);
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}>
      
      <span style={{
        width: 18, height: 18, borderRadius: 999,
        border: open ? "1px solid #831FBF" : "1px solid rgba(10,10,10,0.18)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: "var(--fs-11)", color: open ? "#831FBF" : "#6B6470",
        cursor: "help", userSelect: "none", flex: "0 0 auto",
        transition: "color 180ms cubic-bezier(0.4,0,0.2,1), border-color 180ms cubic-bezier(0.4,0,0.2,1)"
      }}>?</span>
      {open ? <span ref={tipRef} role="tooltip" style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        left: align === "right" ? "auto" : -6,
        right: align === "right" ? -6 : "auto",
        transform: "translateX(" + dx + "px)",
        width: 300,
        maxWidth: "78vw",
        zIndex: 60
      }}>
        <span style={{
          display: "block",
          background: "#FFFFFF",
          border: "1px solid rgba(10,10,10,0.10)",
          borderRadius: 14,
          boxShadow: "0 18px 44px -20px rgba(71,10,104,0.32), 0 2px 8px -5px rgba(10,10,10,0.10)",
          padding: "15px 17px",
          textAlign: "left",
          animation: "hintIn 200ms cubic-bezier(0.16,1,0.3,1) both"
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-14)", fontWeight: 600, color: "#0A0A0A", letterSpacing: "-0.01em", marginBottom: 7 }}>{title}</div>
          <div style={{ fontSize: "var(--fs-13)", lineHeight: 1.55, color: "#3C3640", letterSpacing: "-0.005em" }}>{body}</div>
        </span>
      </span> : null}
    </span>);

};


const SectionTitle = ({ children, help, hint, hintAlign }) =>
<div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}>
    <h3 style={{
    margin: 0,
    fontFamily: "var(--font-display)",
    fontSize: "var(--fs-19)",
    fontWeight: 500,
    letterSpacing: "-0.02em",
    color: "#0A0A0A",
    whiteSpace: "nowrap"
  }}>{children}</h3>
    {hint ? <HintBadge title={hint.title} body={hint.body} align={hintAlign} /> :
  help ? <span style={{
    width: 18, height: 18, borderRadius: 999, border: "1px solid rgba(10,10,10,0.18)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: "var(--fs-11)", color: "#6B6470"
  }}>?</span> : null}
  </div>;


const Tab = ({ active, children }) =>
<div style={{
  padding: "10px 4px",
  fontFamily: "var(--font-display)",
  fontWeight: 500,
  fontSize: 15,
  letterSpacing: "-0.025em",
  color: active ? "#831FBF" : "#6B6470",
  borderBottom: active ? "2px solid #831FBF" : "2px solid transparent",
  cursor: "pointer"
}}>{children}</div>;


const Pill = ({ children, active }) =>
<span style={{
  display: "inline-flex", alignItems: "center", padding: "7px 14px",
  borderRadius: 999, fontSize: "var(--fs-13)",
  background: active ? "#F3EBF8" : "transparent",
  color: active ? "#470A68" : "#6B6470",
  border: active ? "1px solid #E7D8F0" : "1px solid transparent",
  cursor: "pointer"
}}>{children}</span>;


const Select = ({ children, leading }) =>
<div style={{
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "10px 14px",
  border: "1px solid rgba(10,10,10,0.12)", borderRadius: 12,
  fontSize: "var(--fs-14)", color: "#0A0A0A", background: "#fff",
  cursor: "default"
}}>
    {leading}
    <span>{children}</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9l6 6 6-6" /></svg>
  </div>;


const KpiCard = ({ label, value, suffix, delta, deltaDir, helper, progress = 1, t = 0, active, clampMax, wobbleAmp = 0.012, hint, hintAlign }) => {
  const isUp = deltaDir === "up";
  const isFlat = deltaDir === "flat";
  const isDown = deltaDir === "down";
  const bg = isUp ? "#E8F5EE" : isDown ? "#FCEDE7" : "#F0EBF1";
  const fg = isUp ? "#1F8A5B" : isDown ? "#C2402A" : "#6B6470";
  const reveal = easeOut(Math.max(0, Math.min(1, progress)));
  const wobble = t > 0 && reveal >= 1 ? 1 + wobbleAmp * Math.sin(t * 2.6 + 0.7) : 1;
  const parsed = React.useMemo(() => parseAnimatable(value), [value]);
  let raw = parsed ? parsed.target * reveal * wobble : null;
  if (raw !== null && clampMax !== undefined) raw = Math.min(raw, clampMax);
  const displayValue = parsed ?
  formatAnimated(parsed, raw) :
  value;

  // Delta pill: the number inside wobbles slightly; the pill itself stays put.
  const deltaParsed = React.useMemo(() => parseAnimatable(delta), [delta]);
  const animating = t > 0 && reveal >= 1;
  let displayDelta = delta;
  if (animating && deltaParsed && deltaParsed.target !== 0) {
  const dDec = deltaParsed.decimals;
    const dWobble = 1 + 0.20 * Math.sin(t * 2.6 + 2.1);
    const dRaw = deltaParsed.target * dWobble;
    displayDelta = formatAnimated({ ...deltaParsed, decimals: dDec }, dRaw);
  }
  return (
    <Card active={active} style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#3C3640", fontSize: "var(--fs-14)" }}>
        {label}
        {hint ? <HintBadge title={hint.title} body={hint.body} align={hintAlign} /> : <span style={{
          width: 18, height: 18, borderRadius: 999, border: "1px solid rgba(10,10,10,0.18)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: "var(--fs-11)", color: "#6B6470"
        }}>?</span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 31, fontWeight: 400, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{displayValue}</span>
        {suffix ? <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "#3C3640", letterSpacing: "-0.02em" }}>{suffix}</span> : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, fontSize: "var(--fs-13)" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          padding: "3px 7px", borderRadius: 999,
          background: bg, color: fg, fontWeight: 500,
          fontVariantNumeric: "tabular-nums", flex: "0 0 auto", whiteSpace: "nowrap"
        }}>
          {isUp ? "▲" : isDown ? "▼" : "—"} {displayDelta}
        </span>
        <span style={{ color: "#6B6470", fontSize: "calc(9px * var(--ui-scale))", whiteSpace: "nowrap" }}>{helper}</span>
      </div>
    </Card>);

};

const LegendItem = ({ color, label, swatchShape = "dot", checkbox = false, compact = false }) =>
<div style={{
  display: "inline-flex", alignItems: "center", gap: compact ? 5 : 8,
  fontSize: "var(--fs-11)",
  whiteSpace: "nowrap",
  ...(checkbox ? {
    padding: compact ? "3px 9px" : "8px 14px",
    border: "1px solid rgba(10,10,10,0.08)",
    borderRadius: 999,
    background: "#fff"
  } : {})
}}>
    {swatchShape === "line" ?
  <svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke={color} strokeWidth="2.5" strokeLinecap="round" /></svg> :

  <span style={{ width: 10, height: 10, borderRadius: 999, background: color, display: "inline-block" }} />
  }
    <span>{label}</span>
    {checkbox ?
  <span style={{
    width: 16, height: 16, background: "#831FBF", borderRadius: 4,
    display: "inline-flex", alignItems: "center", justifyContent: "center"
  }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
      </span> :
  null}
  </div>;


const RunwayBadge = ({ days, tone, animT = 0, idx = 0 }) => {
  const map = {
    danger: { bg: "#FCEDE7", fg: "#C2402A" },
    warn: { bg: "#FFF6E5", fg: "#8A5A00" },
    soft: { bg: "#E8F4EC", fg: "#3FA078" },
    ok: { bg: "#E8F5EE", fg: "#1F8A5B" }
  };
  const palette = map[tone] || map.warn;
  // Pill width scales with the days value so a 6-day pill is narrowest and an
  // 18-day pill is widest. When the Runway accordion is open we also wobble
  // the width on its own sine wave so the bars visibly breathe.
  const baseWidth = 36 + days * 2;
  const wobble = animT > 0 ? 1 + 0.075 * Math.sin(animT * 2.6 + idx * 0.9 + 1.7) : 1;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "flex-start",
      width: `${baseWidth * wobble}px`, maxWidth: "100%",
      padding: "5px 8px",
      borderRadius: 999, fontSize: "var(--fs-12)", fontWeight: 500,
      background: palette.bg, color: palette.fg, fontFamily: "var(--font-display)",
      fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden"
    }}>{days} days</span>);

};

// ---------- sidebar ----------
const SidebarItem = ({ icon, label, active }) =>
<div title={label} style={{
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 44, height: 44, margin: "0 auto",
  borderRadius: 10,
  color: active ? "#470A68" : "#6B6470",
  background: active ? "#F3EBF8" : "transparent",
  cursor: "pointer"
}}>
    <span style={{ width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
  </div>;


const Sidebar = () =>
<aside data-nav-sidebar style={{
  width: 80,
  flex: "0 0 80px",
  minHeight: "100vh",
  background: "#fff",
  borderRight: "1px solid rgba(10,10,10,0.06)",
  padding: "20px 0",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  position: "sticky",
  top: 0
}}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0 16px" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, letterSpacing: "-0.03em", color: "#470A68", lineHeight: 1 }}>V</div>
    </div>
    <SidebarItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l9-8 9 8M5 10v10h14V10" /></svg>} label="Home" />
    <SidebarItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" /></svg>} label="Treasury" active />
    <SidebarItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M2 10h20" /></svg>} label="Payments" />
    <SidebarItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>} label="Administration" />
    <SidebarItem icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>} label="Coming Soon" />
    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0 4px", borderTop: "1px solid rgba(10,10,10,0.06)" }}>
      <div style={{ width: 34, height: 34, borderRadius: 999, background: "#470A68", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-14)", fontWeight: 500 }}>T</div>
    </div>
  </aside>;


// ---------- hint content (grounded in docs.vitessepsp.com) ----------
const HINTS = {
  fundBalance: { title: "Fund balance", body: "The total fund balance across all active accounts, shown in your selected display currency." },
  accounts: { title: "Number of accounts", body: "The total number of active accounts across your portfolio." },
  avgPayment: { title: "Average payment", body: "The average payment value over the selected time period." },
  successRate: { title: "Payment success rate", body: "The percentage of payments successfully processed during the selected time period." },
  balance: { title: "Balance trends", body: "Your fund balance, and corresponding credits and debits over the selected period." },
  fund: { title: "Fund holding", body: "A percentage breakdown of your funds by currency in value." },
  payments: { title: "Payments", body: "Total payment value over the selected period and currency. The bars show payment volume by size band." },
  tpa: { title: "Top TPA", body: "The top third-party administrators ranked by the total value of delegated funds. For each, see fund balance, number of accounts, and average runway over the last three months." },
  runway: { title: "Account runway", body: "Every account ranked by projected runway, i.e. the days of payments its current balance covers at recent run-rate. Use it as a directional signal for funding planning." }
};


// ---------- main view ----------
const Dashboard = () => {
  // Accordion open state is driven ONLY by clicking items in the explain panel.
  const [openTopic, setOpenTopic] = React.useState(null);
  // Widget hover state is independent: hovering a dashboard widget animates that
  // widget (and highlights it) but never opens or selects an accordion item.
  const [hoverTopic, setHoverTopic] = React.useState(null);
  // A widget is "active" (animating + highlighted) when it's hovered OR when its
  // accordion item is open — but hover no longer feeds the accordion.
  const activeTopic = hoverTopic || openTopic;
  // Below this width the explanation panel is hidden and the dashboard takes the
  // full width on its own (the panel's hover/scroll behaviour doesn't suit a
  // narrow, touch viewport).
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const handler = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);
  const kpisA = useTopicProgress(activeTopic === "kpis");
  const balanceA = useTopicProgress(activeTopic === "balance");
  const fundA = useTopicProgress(activeTopic === "fund");
  const paymentsA = useTopicProgress(activeTopic === "payments");
  const tpaA = useTopicProgress(activeTopic === "tpa");
  const runwayA = useTopicProgress(activeTopic === "runway");
  const isActive = (id) => activeTopic === id;
  // Hover hysteresis: a transient mouseleave (caused by the box-shadow transition
  // momentarily shifting the pointer's hit-test, or any sub-pixel reflow) must
  // NOT immediately collapse the hovered topic. We debounce the close and cancel
  // it the instant the pointer re-enters any widget, so nothing oscillates.
  const closeTimer = React.useRef(null);
  const cancelClose = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } };
  const hoverProps = (id) => ({
    onMouseEnter: () => { cancelClose(); setHoverTopic(id); setOpenTopic(id); },
    onMouseMove: () => { cancelClose(); setHoverTopic((cur) => cur === id ? cur : id); setOpenTopic((cur) => cur === id ? cur : id); },
    onMouseLeave: () => {
      cancelClose();
      closeTimer.current = setTimeout(() => {
        setHoverTopic((cur) => cur === id ? null : cur);
        setOpenTopic((cur) => cur === id ? null : cur);
        closeTimer.current = null;
      }, 220);
    }
  });
  // Top TPA header figures track the FIRST series (Blue Plain Risk Admins) of
  // the grouped-bar chart as it animates. Mirror GroupedBars' jit() exactly:
  // jit(v) = v * (1 + 0.045 * sin(t*2.6 + gi*1.7 + si*1.1 + 0.3)), series si = 0.
  const tpaWob = (gi) => tpaA.t > 0 ? (1 + 0.045 * Math.sin(tpaA.t * 2.6 + gi * 1.7 + 0.3)) : 1;
  const tpaFund = tpaGroups[0].values[0] * tpaWob(0);
  const tpaAccts = Math.round(tpaGroups[1].values[0] * tpaWob(1));
  const tpaRunway = Math.round(tpaGroups[2].values[0] * tpaWob(2));
  return (
    <div style={{
      display: "flex",
      alignItems: "stretch",
      minHeight: "100vh",
      background: "#FFFFFF",
      fontFamily: "var(--font-body)",
      color: "#0A0A0A"
    }}>
    <ExplainPanel openTopic={openTopic} setOpenTopic={setOpenTopic} isHidden={isMobile} />
    <main style={{ flex: "1 1 900px", minWidth: 0, padding: isMobile ? "24px 18px 36px" : "28px 36px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
      <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, letterSpacing: "-0.04em" }}>Portfolio Overview</h1>

      {/* filters */}
      {!isMobile ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Select leading={<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Display currency: <span style={{ width: 22, height: 16, borderRadius: 3, overflow: "hidden", display: "inline-flex" }}>
          <svg viewBox="0 0 60 30" width="22" height="16"><clipPath id="t"><path d="M0 0v30h60V0z" /></clipPath><clipPath id="s"><path d="M30 15h30v15zv15H0zH0V0zV0h30z" /></clipPath><g clipPath="url(#t)"><path d="M0 0v30h60V0z" fill="#012169" /><path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" /><path d="M0 0l60 30m0-30L0 30" clipPath="url(#s)" stroke="#C8102E" strokeWidth="4" /><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" /><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" /></g></svg>
        </span></span>} />
        <div style={{ display: "flex", gap: 12 }}>
          <Select>Last 3 months</Select>
          <Select>Account Currency</Select>
        </div>
      </div> : null}

      {/* KPI row */}
      <div {...hoverProps("kpis")} style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))", gap: 16 }}>
        <KpiCard label="Fund Balance" value="£7.56M" delta="+14%" deltaDir="up" helper="from previous period" progress={kpisA.p} t={kpisA.t} active={isActive("kpis")} wobbleAmp={0.018} hint={HINTS.fundBalance} />
        <KpiCard label="Number of accounts" value="430" delta="+2.6%" deltaDir="up" helper="from previous period" progress={kpisA.p} t={kpisA.t} active={isActive("kpis")} wobbleAmp={0.012} hint={HINTS.accounts} />
        <KpiCard label="Average payment" value="£5.45K" delta="+1.4%" deltaDir="up" helper="from previous period" progress={kpisA.p} t={kpisA.t} active={isActive("kpis")} wobbleAmp={0.022} hint={HINTS.avgPayment} />
        <KpiCard label="Payment success rate" value="99.13%" delta="-0.03 pp" deltaDir="down" helper="from previous period" progress={kpisA.p} t={kpisA.t} active={isActive("kpis")} wobbleAmp={0.005} clampMax={99.99} hint={HINTS.successRate} hintAlign="right" />
      </div>

      {/* Balance Trends */}
      <Card active={isActive("balance")} {...hoverProps("balance")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <SectionTitle help hint={HINTS.balance}>Balance Trend</SectionTitle>
        </div>
        <BalanceTrends data={balanceData} width={1560} height={isMobile ? 780 : 340} progress={balanceA.p} t={balanceA.t} />
        <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
          <LegendItem color={PURP.light} label="Fund Balance" swatchShape="line" checkbox={!isMobile} />
          <LegendItem color={PURP.dark} label="Debit" checkbox={!isMobile} />
          <LegendItem color={PURP.base} label="Credit" checkbox={!isMobile} />
        </div>
      </Card>

      {/* Fund allocation + Payment */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) minmax(0, 2fr)", gap: 16 }}>
        <Card active={isActive("fund")} {...hoverProps("fund")}>
          <SectionTitle help hint={HINTS.fund}>Fund holding</SectionTitle>
          <div style={{ marginTop: 4 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#831FBF", fontSize: "var(--fs-15)", fontWeight: 500 }}>
              by currency
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 12 }}>
            <Donut data={fundData} size={210} thickness={40} gap={0.05} progress={fundA.p} t={fundA.t} />
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 8px" }}>
              {fundData.slice().reverse().filter((d) => d.name !== "Other").map((d, i) =>
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--fs-11)", color: "#3C3640", whiteSpace: "nowrap" }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: d.color, display: "inline-block" }} />
                  {d.name}
                </span>
                )}
            </div>
          </div>
        </Card>
        <Card active={isActive("payments")} {...hoverProps("payments")}>
          <SectionTitle help hint={HINTS.payments}>Payments</SectionTitle>
          <PaymentChart data={paymentData} width={1040} height={isMobile ? 540 : 360} progress={paymentsA.p} t={paymentsA.t} />
          <div style={{ display: "flex", gap: 24, marginTop: 12, flexWrap: "wrap" }}>
            <LegendItem color={PURP.light} label="Payment value" swatchShape="line" />
            <LegendItem color={PURP.dark} label="£0–£500" checkbox={!isMobile} />
            <LegendItem color={PURP.base} label="£500–£5K" checkbox={!isMobile} />
            <LegendItem color={PURP.pastel} label="Above £5K" checkbox={!isMobile} />
          </div>
        </Card>
      </div>

      {/* Top TPA + Runway */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) minmax(0, 1fr)", gap: 16, alignItems: "stretch" }}>
        <Card active={isActive("tpa")} {...hoverProps("tpa")} style={{ display: "flex", flexDirection: "column" }}>
          <SectionTitle help hint={HINTS.tpa}>Top TPA</SectionTitle>
          <h2 style={{ margin: "8px 0 4px", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, letterSpacing: "-0.04em" }}>Blue Plain Risk Admins</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", color: "#3C3640", fontSize: "var(--fs-12)" }}>
            <span style={{ whiteSpace: "nowrap" }}>Fund balance: <b style={{ color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>£{tpaFund.toFixed(2)}M</b></span>
            <span style={{ whiteSpace: "nowrap" }}>Accounts: <b style={{ color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>{tpaAccts}</b></span>
            <span style={{ whiteSpace: "nowrap" }}>Avg. runway: <b style={{ color: "#0A0A0A", fontVariantNumeric: "tabular-nums" }}>{tpaRunway} days</b></span>
          </div>
          <div style={{ marginTop: 8, flex: 1 }}>
            <GroupedBars groups={tpaGroups} series={tpaSeries} width={640} height={500} progress={tpaA.p} t={tpaA.t} />
          </div>
          <div style={{ display: "flex", gap: "6px 12px", marginTop: 12, flexWrap: "wrap" }}>
            {tpaSeries.map((s, i) =>
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--fs-11)", color: "#3C3640", whiteSpace: "nowrap" }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: s.color, display: "inline-block" }} />
                {s.name}
              </span>
            )}
          </div>
        </Card>
        <Card active={isActive("runway")} {...hoverProps("runway")} style={{ padding: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "20px 16px 12px" }}>
            <SectionTitle help hint={HINTS.runway} hintAlign="right">Runway</SectionTitle>
          </div>
          <div style={{ padding: "0 16px 8px", display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,0.9fr) minmax(0,1fr) minmax(0,1fr)", gap: 6, fontSize: "var(--fs-12)", color: "#6B6470", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            <span>Account</span>
            <span>Runway</span>
            <span style={{ textAlign: "center" }}>AVG. DAILY PAYMENTS</span>
            <span>CLOSING BALANCE</span>
          </div>
          <div style={{ borderTop: "1px solid rgba(10,10,10,0.06)", flex: 1, display: "flex", flexDirection: "column" }}>
            {runwayRows.map((r, i) => {
                // Stagger reveals so the cascade fills the full anim window.
                const n = runwayRows.length;
                const slotLen = 0.45; // each row reveals over 45% of progress
                const start = i / Math.max(1, n - 1) * (1 - slotLen);
                const local = Math.max(0, Math.min(1, (runwayA.p - start) / slotLen));
                const eased = 1 - Math.pow(1 - local, 3);
                // When the runway accordion is open, gently wobble each row's
                // figures so the table also has a "live" feel.
                const dailyParsed = parseAnimatable(r.daily);
                const closingParsed = parseAnimatable(r.closing);
                const wA = runwayA.t > 0 ? 1 + 0.028 * Math.sin(runwayA.t * 2.6 + i * 0.7) : 1;
                const wB = runwayA.t > 0 ? 1 + 0.025 * Math.sin(runwayA.t * 2.6 + i * 0.7 + 1.4) : 1;
                const dailyTxt = dailyParsed ? formatAnimated(dailyParsed, dailyParsed.target * wA) : r.daily;
                const closingTxt = closingParsed ? formatAnimated(closingParsed, closingParsed.target * wB) : r.closing;
                return (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,0.9fr) minmax(0,1fr) minmax(0,1fr)", gap: 6,
                    alignItems: "center",
                    padding: "14px 16px",
                    borderBottom: i < runwayRows.length - 1 ? "1px solid rgba(10,10,10,0.04)" : "none",
                    fontSize: "var(--fs-14)",
                    flex: 1,
                    opacity: eased,
                    transform: `translateY(${(1 - eased) * 8}px)`
                  }}>
                  <span style={{ color: "#0A0A0A", fontSize: "var(--fs-12)" }}>{r.account}</span>
                  <RunwayBadge days={r.days} tone={r.tone} animT={runwayA.t} idx={i} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-12)", textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{dailyTxt}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-12)", color: "#6B6470", fontVariantNumeric: "tabular-nums" }}>{closingTxt}</span>
                </div>);

              })}
          </div>
        </Card>
      </div>
    </main>
  </div>);

};


window.Dashboard = Dashboard;