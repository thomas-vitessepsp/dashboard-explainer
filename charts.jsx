/* Rounded, playful chart primitives — Vitesse */

// ---------- helpers ----------
const PURP = {
  dark:   "#470A68",
  base:   "#831FBF",
  vivid:  "#B029FF",
  light:  "#CF7FFF",
  pastel: "#B49EB5",
  wash:   "#F3EBF8",
  washMid:"#E7D8F0",
};
const ORANGE = { warm: "#F15B40", light: "#FD9352" };
const GREEN  = { ok: "#1F8A5B", soft: "#5FB890" };
const NEUTRAL_MUTED = "#D6D0DA";

// catmull-rom -> bezier for smooth curves
function smoothPath(points, tension = 0.5) {
  if (points.length < 2) return "";
  const p = points;
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * tension / 6;
    const c1y = p1.y + (p2.y - p0.y) * tension / 6;
    const c2x = p2.x - (p3.x - p1.x) * tension / 6;
    const c2y = p2.y - (p3.y - p1.y) * tension / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// rounded-top rectangle path
function roundedTopBar(x, y, w, h, r) {
  if (h <= 0) return `M ${x} ${y} Z`;
  const radius = Math.min(r, w / 2, h);
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + radius}`,
    `Q ${x} ${y} ${x + radius} ${y}`,
    `L ${x + w - radius} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + radius}`,
    `L ${x + w} ${y + h}`,
    `Z`,
  ].join(" ");
}

// rounded-both-ends pill bar (for full rounded bars)
function pillBar(x, y, w, h, r) {
  if (h <= 0) return `M ${x} ${y} Z`;
  const radius = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + radius} ${y}`,
    `L ${x + w - radius} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + radius}`,
    `L ${x + w} ${y + h - radius}`,
    `Q ${x + w} ${y + h} ${x + w - radius} ${y + h}`,
    `L ${x + radius} ${y + h}`,
    `Q ${x} ${y + h} ${x} ${y + h - radius}`,
    `L ${x} ${y + radius}`,
    `Q ${x} ${y} ${x + radius} ${y}`,
    `Z`,
  ].join(" ");
}

// donut arc with stroke-based rounded caps
function donutStrokeArc(cx, cy, r, startAngle, endAngle) {
  const ax1 = cx + r * Math.sin(startAngle);
  const ay1 = cy - r * Math.cos(startAngle);
  const ax2 = cx + r * Math.sin(endAngle);
  const ay2 = cy - r * Math.cos(endAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${ax1} ${ay1} A ${r} ${r} 0 ${large} 1 ${ax2} ${ay2}`;
}

// donut sector with rounded corners (corner radius adapts to small segments)
function donutSegmentRounded(cx, cy, rO, rI, sA, eA, cornerR) {
  const sweep = eA - sA;
  if (sweep <= 0.001) return "";
  // limit corner radius so it fits inside small segments
  const maxByThickness = (rO - rI) / 2 - 0.5;
  const maxBySweep    = (sweep * (rO + rI) / 2) / 2.4;
  const r = Math.max(0.5, Math.min(cornerR, maxByThickness, maxBySweep));
  const ao = r / rO;
  const ai = r / rI;
  const p = (rr, aa) => ({ x: cx + rr * Math.sin(aa), y: cy - rr * Math.cos(aa) });
  const oS = p(rO, sA + ao);
  const oE = p(rO, eA - ao);
  const iE = p(rI, eA - ai);
  const iS = p(rI, sA + ai);
  const radSO = p(rO - r, sA);
  const radEO = p(rO - r, eA);
  const radEI = p(rI + r, eA);
  const radSI = p(rI + r, sA);
  const large = sweep - 2 * ao > Math.PI ? 1 : 0;
  const largeI = sweep - 2 * ai > Math.PI ? 1 : 0;
  return [
    `M ${radSO.x} ${radSO.y}`,
    `A ${r} ${r} 0 0 1 ${oS.x} ${oS.y}`,
    `A ${rO} ${rO} 0 ${large} 1 ${oE.x} ${oE.y}`,
    `A ${r} ${r} 0 0 1 ${radEO.x} ${radEO.y}`,
    `L ${radEI.x} ${radEI.y}`,
    `A ${r} ${r} 0 0 1 ${iE.x} ${iE.y}`,
    `A ${rI} ${rI} 0 ${largeI} 0 ${iS.x} ${iS.y}`,
    `A ${r} ${r} 0 0 1 ${radSI.x} ${radSI.y}`,
    `Z`,
  ].join(" ");
}

// number format
const fmt = (n) => {
  if (Math.abs(n) >= 1e9) return `£${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `£${(n / 1e6).toFixed(0)}M`;
  if (Math.abs(n) >= 1e3) return `£${(n / 1e3).toFixed(0)}K`;
  return `£${n}`;
};
const fmtCount = (n) => n >= 1000 ? `${(n/1000).toFixed(0)}K` : `${n}`;

// Per-point sinusoidal jitter — returns `v` unchanged when t<=0 (idle).
// Each call site supplies a unique `phase` so points oscillate independently.
const jit = (v, t, phase, amp = 0.04) => t > 0 ? v * (1 + amp * Math.sin(t * 2.6 + phase)) : v;

// ====================================================================
// BalanceTrends — line + paired rounded bars (debit/credit)
// ====================================================================
const BalanceTrends = ({ data: rawData, width = 1100, height = 320, progress = 1, t = 0 }) => {
  const e = 1 - Math.pow(1 - progress, 3); // ease-out cubic
  // Pre-jitter each row's balance / debit / credit so the line slithers and
  // bars breathe independently when the corresponding accordion is open.
  const data = rawData.map((d, i) => ({
    ...d,
    balance: jit(d.balance, t, i * 0.7 + 0.0, 0.022),
    debit:   jit(d.debit,   t, i * 0.7 + 1.1, 0.085),
    credit:  jit(d.credit,  t, i * 0.7 + 2.3, 0.085),
  }));
  // generous gutters so axis titles + tick labels don't collide
  const padL = 92, padR = 92, padT = 28, padB = 56;
  const w = width - padL - padR;
  const h = height - padT - padB;

  // headroom above max data value so the line never kisses the top gridline
  const maxBal = 18;
  const maxFlow = 1.6;

  const balY = (v) => padT + h - (v / maxBal) * h;
  const flowY = (v) => padT + h - (v / maxFlow) * h;

  const n = data.length;
  // inset so the first/last bar groups don't overhang the axis tick labels
  const xInset = 30;
  const xStep = (w - 2 * xInset) / (n - 1);
  const xFor = (i) => padL + xInset + i * xStep;

  // clamp line y values so catmull-rom can't overshoot the top of the plot area
  // then lerp from baseline (h bottom) toward final y by eased progress
  const baseline = padT + h;
  const linePts = data.map((d, i) => {
    const yFinal = Math.max(padT + 6, balY(d.balance));
    return { x: xFor(i), y: baseline + (yFinal - baseline) * e };
  });
  const linePath = smoothPath(linePts, 0.7);

  // ticks chosen to match each axis's true scale
  const balTicks = [0, 3, 6, 9, 12, 15, 18];
  const flowTicks = [0, 0.4, 0.8, 1.2, 1.6];

  const barW = 30;
  const overlap = 12;
  const offsetX = (barW - overlap) / 2;
  const cornerR = 6;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block", overflow: "visible" }}>

      {/* dashed gridlines + left tick labels */}
      {balTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={padL + w} y1={balY(t)} y2={balY(t)} stroke="rgba(10,10,10,0.06)" strokeDasharray="2 4"/>
          <text x={padL - 12} y={balY(t) + 4} style={{ fontSize: "calc(var(--fs-13) * 1.3)" }} fill="#6B6470" textAnchor="end" fontFamily="var(--font-display)">£{t}M</text>
        </g>
      ))}
      {/* right tick labels — aligned to their true y on the flow scale */}
      {flowTicks.map((t, i) => (
        <text key={i} x={padL + w + 12} y={flowY(t) + 4} style={{ fontSize: "calc(var(--fs-13) * 1.3)" }} fill="#6B6470" fontFamily="var(--font-display)">£{t}M</text>
      ))}

      {/* axis titles — pushed to the outer edge, well clear of tick labels */}
      <text x={20} y={padT + h / 2} style={{ fontSize: "calc(var(--fs-13) * 1.3)" }} fill="#6B6470" transform={`rotate(-90, 20, ${padT + h / 2})`} textAnchor="middle" letterSpacing="0.04em">Fund balance</text>
      <text x={width - 20} y={padT + h / 2} style={{ fontSize: "calc(var(--fs-13) * 1.3)" }} fill="#6B6470" transform={`rotate(90, ${width - 20}, ${padT + h / 2})`} textAnchor="middle" letterSpacing="0.04em">Debit &amp; Credit</text>

      {/* paired overlapping rounded bars */}
      {data.map((d, i) => {
        const cx = xFor(i);
        const debitH = (d.debit / maxFlow) * h * e;
        const creditH = (d.credit / maxFlow) * h * e;
        return (
          <g key={i}>
            <path
              d={pillBar(cx - offsetX - barW / 2, padT + h - debitH, barW, debitH, cornerR)}
              fill={PURP.dark}
              opacity={d.partial ? 0.55 : 1}
            />
            <path
              d={pillBar(cx + offsetX - barW / 2, padT + h - creditH, barW, creditH, cornerR)}
              fill={PURP.base}
              opacity={d.partial ? 0.55 : 1}
            />
          </g>
        );
      })}

      {/* smoothed line */}
      <path d={linePath} fill="none" stroke={PURP.light} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>

      {/* line dots */}
      {linePts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke={PURP.light} strokeWidth="2"/>
      ))}

      {/* x-axis labels */}
      {data.map((d, i) => d.label ? (
        <text key={i} x={xFor(i)} y={padT + h + 24} style={{ fontSize: "calc(var(--fs-12) * 1.3)" }} fill="#6B6470" textAnchor="middle" fontFamily="var(--font-display)">
          {d.label}
          {d.partial ? <tspan x={xFor(i)} dy="15" style={{ fontSize: "calc(var(--fs-11) * 1.3)" }} fill="#928a99">(Partial)</tspan> : null}
        </text>
      ) : null)}
    </svg>
  );
};

// ====================================================================
// Donut — lightly rounded corners, all segments visible
// ====================================================================
const Donut = ({ data: rawData, size = 280, thickness = 44, gap = 0.025, cornerR = 5, progress = 1, t = 0, totalValue = 15.12, totalUnit = "M" }) => {
  const eased = 1 - Math.pow(1 - progress, 3);
  // Jitter each segment's value when the accordion is open; segments rebalance
  // smoothly because total = sum(values).
  const data = rawData.map((d, i) => ({
    ...d,
    value: jit(d.value, t, i * 1.3 + 0.4, 0.045),
  }));
  const totalDisplay = jit(totalValue, t, 0.6, 0.024);
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 6;
  const rInner = rOuter - thickness;
  const rMid = (rOuter + rInner) / 2;
  const total = data.reduce((s, d) => s + d.value, 0);

  // Pre-compute full (final) sweeps so we know where each segment will end up
  // and where its centre label belongs.
  const fullSweeps = data.map((d) => (d.value / total) * Math.PI * 2);
  let fullCursor = 0;
  const fullMids = fullSweeps.map((fs) => {
    const m = fullCursor + fs / 2;
    fullCursor += fs;
    return m;
  });

  // Walk a single cursor through the eased sweeps so segments always stay flush
  // against each other while the whole pie extends.
  let cursor = 0;
  const segs = data.map((d, i) => {
    const grown = fullSweeps[i] * eased;
    const s = cursor + gap / 2;
    const e = cursor + grown - gap / 2;
    cursor += grown;
    return { ...d, s, e, sweep: grown, mid: fullMids[i] };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: "block", overflow: "visible", maxWidth: size, height: "auto" }}>
      {segs.map((seg, i) => {
        if (seg.e - seg.s <= 0.001) return null;
        return (
          <path
            key={i}
            d={donutSegmentRounded(cx, cy, rOuter, rInner, seg.s, seg.e, cornerR)}
            fill={seg.color}
          />
        );
      })}

      {segs.map((seg, i) => {
        const pct = (seg.value / total) * 100;
        if (pct < 8) return null;
        if (eased < 0.92) return null; // only show label once the segment is essentially fully drawn
        const lx = cx + rMid * Math.sin(seg.mid);
        const ly = cy - rMid * Math.cos(seg.mid);
        return (
          <text
            key={i}
            x={lx}
            y={ly + 4}
            textAnchor="middle"
            style={{ fontSize: pct > 25 ? "12px" : "var(--fs-14)" }}
            fontWeight="500"
            fill={seg.onColor || "#fff"}
            fontFamily="var(--font-display)"
            letterSpacing="-0.02em"
          >
            {pct.toFixed(1)}%
          </text>
        );
      })}

      <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: "var(--fs-13)" }} fill="#6B6470" letterSpacing="0.06em" opacity={Math.min(1, progress * 2)}>TOTAL</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="17" fill="#0A0A0A" fontFamily="var(--font-display)" fontWeight="500" letterSpacing="-0.04em" style={{ fontVariantNumeric: "tabular-nums" }}>£{(totalDisplay * eased).toFixed(2)}{totalUnit}</text>
    </svg>
  );
};

// ====================================================================
// PaymentChart — stacked rounded bars + smoothed line
// ====================================================================
const PaymentChart = ({ data: rawData, width = 720, height = 320, progress = 1, t = 0 }) => {
  const e = 1 - Math.pow(1 - progress, 3);
  // Independent per-point wobble across all three stacked series + the volume line.
  const data = rawData.map((d, i) => ({
    ...d,
    small:  jit(d.small,  t, i * 0.55 + 0.0, 0.055),
    mid:    jit(d.mid,    t, i * 0.55 + 1.2, 0.055),
    large:  jit(d.large,  t, i * 0.55 + 2.4, 0.055),
    volume: jit(d.volume, t, i * 0.55 + 3.5, 0.04),
  }));
  const padL = 92, padR = 92, padT = 28, padB = 56;
  const w = width - padL - padR;
  const h = height - padT - padB;

  // headroom: tallest stacked bar is ~1.41M, give plot room up to 2M
  const maxVal = 2;
  const maxVol = 280;

  const yVal = (v) => padT + h - (v / maxVal) * h;
  const yVol = (v) => padT + h - (v / maxVol) * h;

  const n = data.length;
  const xStep = w / n;
  const xFor = (i) => padL + i * xStep + xStep / 2;

  const barW = 25;
  const overlap = 9;
  const step = barW - overlap;
  const cornerR = 7;
  // 3 series: dark, base, pastel — drawn left to right, last on top
  const seriesColors = [PURP.dark, PURP.base, PURP.pastel];

  const linePts = data.map((d, i) => {
    const yFinal = Math.max(padT + 6, yVol(d.volume));
    const baseline = padT + h;
    return { x: xFor(i), y: baseline + (yFinal - baseline) * e };
  });
  const linePath = smoothPath(linePts, 0.7);

  const valTicks = [0, 0.5, 1, 1.5, 2];
  const volTicks = [0, 70, 140, 210, 280];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      {/* gridlines */}
      {valTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={padL + w} y1={yVal(t)} y2={yVal(t)} stroke="rgba(10,10,10,0.06)" strokeDasharray="2 4"/>
          <text x={padL - 12} y={yVal(t) + 4} style={{ fontSize: "calc(var(--fs-13) * 1.3)" }} fill="#6B6470" textAnchor="end" fontFamily="var(--font-display)">£{t}M</text>
        </g>
      ))}
      {volTicks.map((t, i) => (
        <text key={i} x={padL + w + 12} y={yVol(t) + 4} style={{ fontSize: "calc(var(--fs-13) * 1.3)" }} fill="#6B6470" fontFamily="var(--font-display)">{t}</text>
      ))}

      <text x={20} y={padT + h / 2} style={{ fontSize: "calc(var(--fs-13) * 1.3)" }} fill="#6B6470" transform={`rotate(-90, 20, ${padT + h / 2})`} textAnchor="middle" letterSpacing="0.04em">Payment value</text>
      <text x={width - 20} y={padT + h / 2} style={{ fontSize: "calc(var(--fs-13) * 1.3)" }} fill="#6B6470" transform={`rotate(90, ${width - 20}, ${padT + h / 2})`} textAnchor="middle" letterSpacing="0.04em">Payment volume</text>

      {/* overlapping bars per date */}
      {data.map((d, i) => {
        const cx = xFor(i);
        const vals = [d.small, d.mid, d.large]; // matches color order
        // left = i 0 (dark), middle = i 1 (base), right = i 2 (pastel)
        const offsets = [-step, 0, step];
        return (
          <g key={i} opacity={d.partial ? 0.5 : 1}>
            {vals.map((v, j) => {
              const bh = (v / maxVal) * h * e;
              const x = cx + offsets[j] - barW / 2;
              const y = padT + h - bh;
              return (
                <path key={j} d={pillBar(x, y, barW, bh, cornerR)} fill={seriesColors[j]}/>
              );
            })}
          </g>
        );
      })}

      {/* line over bars */}
      <path d={linePath} fill="none" stroke={PURP.light} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {linePts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke={PURP.light} strokeWidth="2"/>
      ))}

      {/* x labels */}
      {data.map((d, i) => d.label ? (
        <text key={i} x={xFor(i)} y={padT + h + 24} style={{ fontSize: "calc(var(--fs-12) * 1.3)" }} fill="#6B6470" textAnchor="middle" fontFamily="var(--font-display)">
          {d.label}
          {d.partial ? <tspan x={xFor(i)} dy="15" style={{ fontSize: "calc(var(--fs-11) * 1.3)" }} fill="#928a99">(Partial)</tspan> : null}
        </text>
      ) : null)}
    </svg>
  );
};

// ====================================================================
// GroupedBars — overlapping bars within each group
// ====================================================================
const GroupedBars = ({ groups: rawGroups, series, width = 720, height = 320, unit = "", progress = 1, t = 0 }) => {
  const e = 1 - Math.pow(1 - progress, 3);
  // Jitter every cell in the grid independently so each TPA's columns wiggle
  // on their own clock.
  const groups = rawGroups.map((g, gi) => ({
    ...g,
    values: g.values.map((v, si) => jit(v, t, gi * 1.7 + si * 1.1 + 0.3, 0.045)),
  }));
  // generous top room for value labels + bottom room for group titles
  const padL = 24, padR = 24, padT = 36, padB = 52;
  const w = width - padL - padR;
  const h = height - padT - padB;

  // Per-group max so wildly different units (£M, # accounts, days) each fill
  // their column rather than sharing one global scale. Use ORIGINAL values
  // so the tallest bar still wobbles visibly relative to a fixed reference.
  const groupMax = rawGroups.map((g) => Math.max(...g.values));

  const groupW = w / groups.length;
  const barW = 32;
  const overlap = 12;
  const step = barW - overlap;
  const cornerR = 7;
  // offsets centered
  const n = series.length;
  const offsets = series.map((_, i) => (i - (n - 1) / 2) * step);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      <line x1={padL} x2={padL + w} y1={padT + h} y2={padT + h} stroke="rgba(10,10,10,0.08)" strokeDasharray="2 4"/>

      {groups.map((g, gi) => {
        const cx = padL + gi * groupW + groupW / 2;
        const localMax = groupMax[gi];
        // index of the tallest bar in THIS group — drives label horizontal nudge
        // (use the original values so the tallest pick stays stable through wobble)
        const origVals = rawGroups[gi].values;
        const tallestSi = origVals.indexOf(Math.max(...origVals));
        const gUnit = g.unit !== undefined ? g.unit : unit;
        return (
          <g key={gi}>
            {series.map((s, si) => {
              const v = g.values[si];
              const origV = origVals[si];
              const labelText = Number.isInteger(origV) ? Math.round(v).toString() : v.toFixed(2);
              // bars use 85% of plot height to leave room for the value label above
              const bh = (v / localMax) * h * 0.85 * e;
              const x = cx + offsets[si] - barW / 2;
              const y = padT + h - bh;
              // push label outward away from the tallest bar so the trio of
              // numbers doesn't pile on top of each other
              const labelDx = si < tallestSi ? -20 : si > tallestSi ? 20 : 0;
              return (
                <g key={si}>
                  <path d={pillBar(x, y, barW, bh, cornerR)} fill={s.color}/>
                  <text
                    x={x + barW / 2 + labelDx}
                    y={y - 8}
                    style={{ fontSize: "calc(var(--fs-12) * 1.3)", fontVariantNumeric: "tabular-nums" }}
                    fill="#6B6470"
                    textAnchor="middle"
                    fontFamily="var(--font-display)"
                    letterSpacing="-0.01em"
                    opacity={progress > 0.95 ? 1 : 0}
                  >{labelText}{gUnit}</text>
                </g>
              );
            })}
            <text x={cx} y={padT + h + 26} style={{ fontSize: "calc(var(--fs-14) * 1.3)" }} fill="#3C3640" textAnchor="middle" fontFamily="var(--font-display)" letterSpacing="-0.01em">
              {g.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

Object.assign(window, { BalanceTrends, Donut, PaymentChart, GroupedBars, PURP, ORANGE, GREEN, NEUTRAL_MUTED });
