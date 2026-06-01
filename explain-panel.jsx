/* Vitesse Insights — explanatory accordion panel.
   Sits to the left of the dashboard at matching width.
   Opening an item highlights and animates the corresponding widget. */

const TOPICS = [
{
  id: "kpis",
  label: "KPIs",
  title: "The pulse of your treasury.",
  desc: "Four key indicators provide an instant view of your portfolio's health and performance.",
  benefits: [
  "Spot anomalies early, before they become issues",
  "Compare performance across periods at a glance",
  "Share a clear, consistent view with stakeholders"]

},
{
  id: "balance",
  label: "Balance and credits / debits",
  title: "See cash move, day by day.",
  desc: "The fund balance line plots your aggregate position across the period. Paired bars beneath it expose every credit in and debit out. One view answers both \"how much do we hold?\" and \"what moved it?\"",
  benefits: [
  "Support treasury decisions with historical context",
  "Identify funding requirements before they impact operations",
  "Spot unusual movements or inactivity that may require attention"]

},
{
  id: "fund",
  label: "Fund holding",
  title: "Know where your money sits.",
  desc: "Break the total balance down by currency. One ring, every concentration risk in plain sight.",
  benefits: [
  "Catch FX over-exposure before it costs you",
  "Right-size buffers per currency and jurisdiction",
  "Make routing decisions backed by live data"]

},
{
  id: "payments",
  label: "Payments",
  title: "Payout patterns at scale.",
  desc: "Outgoing payment value, segmented by ticket size. A precise read on how claim cohorts actually settle.",
  benefits: [
  "See where payment value is concentrated across claim sizes",
  "Plan liquidity around your real payment mix",
  "Spot shifts in claim severity as they emerge"]

},
{
  id: "tpa",
  label: "TPAs benchmark",
  title: "Compare partners side by side.",
  desc: "Three lenses across the TPAs handling the most volume on your book. The same numbers each of them sees on their side, so the conversation starts from shared truth.",
  benefits: [
  "Identify TPAs trending toward underfunding or overfunding",
  "Reward fast-cycling partners with stronger lines",
  "Open performance reviews on shared, auditable data"]

},
{
  id: "runway",
  label: "Account runways",
  title: "Days until the next cash call.",
  desc: "Every delegated authority, sorted by how many days of payments its current balance can cover at recent run-rate. Fund proactively rather than reacting to an empty account.",
  benefits: [
  "Avoid emergency wires and weekend cash calls",
  "Recover idle liquidity in accounts with unnecessarily long runways",
  "Keep claimants paid without operational bottlenecks"]

}];


const AccordionItem = ({ topic, open, onClick, index }) => {
  const numStr = String(index + 1).padStart(2, "0");
  return (
    <div style={{
      borderBottom: open ? "1px solid transparent" : "1px solid rgba(10,10,10,0.10)",
      background: open ? "#F3EBF8" : "transparent",
      borderRadius: open ? 12 : 0,
      transition: "background 240ms cubic-bezier(0.4,0,0.2,1)"
    }}>
      <button
        onClick={onClick}
        aria-expanded={open}
        style={{
          width: "100%",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "var(--font-display)",
          color: "inherit"
        }}>

        <span style={{
          fontSize: 12,
          color: open ? "#831FBF" : "#928a99",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.08em",
          width: 32,
          transition: "color 200ms"
        }}>{numStr}</span>
        <span style={{
          flex: 1,
          fontSize: 20,
          fontWeight: 400,
          color: open ? "#470A68" : "#0A0A0A",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          transition: "color 200ms"
        }}>{topic.label}</span>
        <span style={{
          width: 28, height: 28, borderRadius: 999,
          flex: "none",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: open ? "#fff" : "#3C3640",
          background: open ? "#831FBF" : "transparent",
          border: open ? "1px solid #831FBF" : "1px solid rgba(10,10,10,0.18)",
          transition: "all 220ms cubic-bezier(0.4,0,0.2,1)"
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{
            transition: "transform 240ms cubic-bezier(0.4,0,0.2,1)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)"
          }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      <div style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 360ms cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            padding: "0 14px 18px 48px",
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-6px)",
            transition: "opacity 320ms ease, transform 320ms cubic-bezier(0.16,1,0.3,1)"
          }}>
            <h3 style={{
              margin: "0 0 10px",
              fontFamily: "var(--font-display)",
              fontSize: 25,
              fontWeight: 400,
              letterSpacing: "-0.03em",
              color: "#0A0A0A",
              lineHeight: 1.15,
              textWrap: "balance"
            }}>
              {topic.title}
            </h3>
            <p style={{
              margin: "0 0 16px",
              fontSize: 14,
              lineHeight: 1.55,
              color: "#3C3640",
              fontFamily: "var(--font-body)",
              letterSpacing: "-0.005em",
              textWrap: "pretty"
            }}>
              {topic.desc}
            </p>
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              paddingTop: 12,
              borderTop: "1px solid rgba(10,10,10,0.08)"
            }}>
              <div style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#831FBF",
                fontWeight: 500
              }}>Benefits</div>
              {topic.benefits.map((b, i) =>
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 14,
                lineHeight: 1.45,
                color: "#0A0A0A",
                fontFamily: "var(--font-body)"
              }}>
                  <span style={{
                  marginTop: 1,
                  flex: "none",
                  width: 18, height: 18, borderRadius: 999,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid rgba(241,91,64,0.35)",
                  color: "#F15B40"
                }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                  <span>{b}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

};

const ExplainPanel = ({ openTopic, setOpenTopic, isHidden }) => {
  const sectionRef = React.useRef(null);
  const stickyRef = React.useRef(null);

  // When embedded in a full-height iframe, the iframe document never scrolls,
  // so CSS `position: sticky` can't fire. The parent posts its scroll position
  // and header height; we translate the panel to stay pinned just below the
  // header. When an accordion item is open, we nudge the panel up just enough
  // to bring that item's full content into view (without pushing its top above
  // the header), so opening an item never hides its content below the fold.
  const ctlRef = React.useRef(null);
  React.useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;
    const last = { iframeTop: 0, viewportH: window.innerHeight, topOffset: 0 };
    // Travel distance frozen against the COLLAPSED panel + column height (both
    // stable during interaction) so accordion height changes can't make it jump.
    let maxShift = 0;
    function measure() {
      maxShift = Math.max(0, section.offsetHeight - sticky.offsetHeight);
    }

    // Geometry of the currently-open accordion item, relative to the panel top.
    // (Transform cancels out because we subtract the panel's own rect.)
    let anchorTop = 0, anchorH = 0;
    function readAnchor() {
      const openBtn = sticky.querySelector('button[aria-expanded="true"]');
      if (!openBtn) { anchorTop = 0; anchorH = 0; return; }
      const item = openBtn.parentElement;
      const sRect = sticky.getBoundingClientRect();
      const iRect = item.getBoundingClientRect();
      anchorTop = iRect.top - sRect.top;
      anchorH = iRect.height;
    }

    function apply() {
      const it = last.iframeTop;
      const top = last.topOffset;
      const vh = last.viewportH;
      // Travel limit measured LIVE against the current panel height — which
      // includes whatever accordion item is open. This guarantees the panel's
      // bottom can never be pushed past the column (dashboard) bottom, so an
      // open item never spills below the embed or inflates the document height.
      const maxShiftNow = Math.max(0, section.offsetHeight - sticky.offsetHeight);
      // Base: pin the panel just below the header.
      let pin = top - it;
      if (pin < 0) pin = 0;
      if (pin > maxShiftNow) pin = maxShiftNow;
      let shift = pin;
      // If an open item's content runs past the viewport bottom, move the panel
      // up so the item's BOTTOM lines up with the viewport bottom — bringing the
      // whole open item into view. (Clamped to 0 below, so a very tall item that
      // can't fully fit simply pins to the top instead.)
      if (anchorH > 0) {
        const itemTop = it + pin + anchorTop;
        const itemBottom = itemTop + anchorH;
        const overflow = itemBottom - vh;
        if (overflow > 0) {
          shift = pin - overflow;
        }
      }
      if (shift < 0) shift = 0;
      if (shift > maxShiftNow) shift = maxShiftNow;
      sticky.style.transform = "translateY(" + shift + "px)";
    }

    function onMessage(e) {
      const d = e.data;
      if (!d || d.type !== "parent-scroll") return;
      last.iframeTop = d.iframeTop || 0;
      if (typeof d.viewportH === "number") last.viewportH = d.viewportH;
      if (typeof d.topOffset === "number") last.topOffset = d.topOffset;
      sticky.style.transition = "none";   // scroll tracking is instant
      readAnchor();                        // fresh geometry, no rAF dependency
      apply();
    }

    function onResize() { measure(); readAnchor(); apply(); }

    // Called when the open item changes: reposition immediately (synchronous,
    // so it works even when rAF is throttled), then run a short bounded rAF
    // loop to follow the expand animation smoothly. No persistent observer.
    let following = 0;
    function onOpenChange() {
      sticky.style.transition = "transform 280ms cubic-bezier(0.16,1,0.3,1)";
      readAnchor();
      apply();
      following += 1;
      const myRun = following;
      const start = (performance && performance.now) ? performance.now() : Date.now();
      function follow() {
        if (myRun !== following) return;          // superseded by a newer change
        readAnchor();
        apply();
        const now = (performance && performance.now) ? performance.now() : Date.now();
        if (now - start < 420) {
          requestAnimationFrame(follow);
        } else {
          sticky.style.transition = "none";
        }
      }
      requestAnimationFrame(follow);
      // Fallback re-reads in case rAF is throttled (e.g. background tab): the
      // expand animation runs ~360ms, so catch its mid and end points too.
      setTimeout(() => { if (myRun === following) { readAnchor(); apply(); } }, 200);
      setTimeout(() => { if (myRun === following) { readAnchor(); apply(); sticky.style.transition = "none"; } }, 420);
    }

    measure();
    readAnchor();
    apply();
    window.addEventListener("message", onMessage);
    window.addEventListener("resize", onResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
    ctlRef.current = onOpenChange;
    try { window.parent.postMessage({ type: "explain-ready" }, "*"); } catch (err) {}
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("resize", onResize);
      following += 1;   // stop any in-flight follow loop
      ctlRef.current = null;
    };
  }, []);

  // Re-position smoothly whenever the open accordion item changes.
  React.useEffect(() => {
    if (ctlRef.current) ctlRef.current();
  }, [openTopic]);

  if (isHidden) return null;

  return (
    <section ref={sectionRef} data-explain-panel style={{
      flex: "3 1 360px",
      minWidth: 0,
      alignSelf: "stretch",
      borderRight: "1px solid rgba(10,10,10,0.08)",
      background: "#FBFAFC",
      fontFamily: "var(--font-body)",
      color: "#0A0A0A"
    }}>
      <div ref={stickyRef} style={{
        position: "sticky",
        top: 0,
        willChange: "transform",
        padding: "28px 28px 40px"
      }}>
      <div style={{ borderTop: "1px solid rgba(10,10,10,0.10)" }}>
        {TOPICS.map((t, i) =>
        <AccordionItem
          key={t.id}
          topic={t}
          open={openTopic === t.id}
          onClick={() => setOpenTopic(openTopic === t.id ? null : t.id)}
          index={i} />

        )}
      </div>
      </div>
    </section>);

};

window.ExplainPanel = ExplainPanel;
window.TOPICS = TOPICS;
