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
  desc: "The fund-balance line plots your aggregate position across the period. Paired bars beneath it expose every credit in and debit out. One view answers both \"how much do we hold?\" and \"what moved it?\"",
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
  "Optimise your funding processes",
  "Avoid emergency wires and weekend cash calls",
  "Keep claimants paid without operational bottlenecks"]

}];


const AccordionItem = ({ topic, open, onClick, index }) => {
  const numStr = String(index + 1).padStart(2, "0");
  return (
    <div style={{
      borderBottom: "1px solid rgba(10,10,10,0.10)",
      transition: "background 240ms cubic-bezier(0.4,0,0.2,1)"
    }}>
      <button
        onClick={onClick}
        aria-expanded={open}
        style={{
          width: "100%",
          padding: "20px 4px",
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
            padding: "4px 4px 26px 38px",
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-6px)",
            transition: "opacity 320ms ease, transform 320ms cubic-bezier(0.16,1,0.3,1)"
          }}>
            <h3 style={{
              margin: "0 0 14px",
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
              margin: "0 0 22px",
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
              display: "flex", flexDirection: "column", gap: 10,
              paddingTop: 16,
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

const ExplainPanel = ({ openTopic, setOpenTopic }) => {
  const sectionRef = React.useRef(null);
  const stickyRef = React.useRef(null);

  // When embedded in a full-height iframe, the iframe document never scrolls,
  // so CSS `position: sticky` can't fire. The parent page posts its scroll
  // position (plus its header height and viewport height); we translate the
  // panel to stay pinned just below the header, and release at the panel's
  // bottom. If the open content is taller than the space below the header we
  // drop stickiness entirely so its bottom stays reachable by scrolling.
  React.useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;
    let frame = 0;
    const last = { iframeTop: 0, viewportH: window.innerHeight, topOffset: 0 };

    function apply() {
      const avail = last.viewportH - last.topOffset;
      let shift;
      if (sticky.offsetHeight > avail) {
        // Content doesn't fit below the header — let it scroll naturally.
        shift = 0;
      } else {
        const maxShift = Math.max(0, section.offsetHeight - sticky.offsetHeight);
        shift = Math.min(Math.max(0, last.topOffset - last.iframeTop), maxShift);
      }
      sticky.style.transform = "translateY(" + shift + "px)";
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    }

    function onMessage(e) {
      const d = e.data;
      if (!d || d.type !== "parent-scroll") return;
      last.iframeTop = d.iframeTop || 0;
      if (typeof d.viewportH === "number") last.viewportH = d.viewportH;
      if (typeof d.topOffset === "number") last.topOffset = d.topOffset;
      schedule();
    }

    window.addEventListener("message", onMessage);
    // Re-apply when the panel's own height changes (accordion open/close).
    const ro = window.ResizeObserver ? new ResizeObserver(schedule) : null;
    if (ro) ro.observe(sticky);
    // Tell the parent we're ready to receive scroll updates.
    try { window.parent.postMessage({ type: "explain-ready" }, "*"); } catch (err) {}
    return () => {
      window.removeEventListener("message", onMessage);
      if (ro) ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

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
      <div style={{
        textTransform: "uppercase",
        fontSize: 12,
        letterSpacing: "0.16em",
        color: "#831FBF",
        marginBottom: 14,
        fontWeight: 500
      }}>TREASURY INSIGHTS DASHBOARD</div>
      <h1 style={{
        margin: 0,
        fontFamily: "var(--font-display)",
        fontSize: 36,
        fontWeight: 300,
        letterSpacing: "-0.04em",
        lineHeight: 1.05,
        textWrap: "balance"
      }}>Where treasury visibility meets operational efficiency.</h1>
      <p style={{
        margin: "14px 0 28px",
        fontSize: 15,
        lineHeight: 1.5,
        color: "#3C3640",
        letterSpacing: "-0.005em",
        textWrap: "pretty"
      }}>
        Six lenses on the same treasury. Explore each topic or hover over a
        dashboard widget to discover what it reveals and the value it delivers.
      </p>
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