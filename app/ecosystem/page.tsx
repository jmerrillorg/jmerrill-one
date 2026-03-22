import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { divisions } from "@/lib/tokens";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Ecosystem — J Merrill One",
  description: "Four divisions. One architecture. The J Merrill One ecosystem.",
};

const pathways = [
  { from:"Publishing", to:"Financial + Productions", why:"An author generating income from a published title is immediately a Financial candidate for estate planning — and a Productions candidate for media amplification." },
  { from:"Financial",  to:"Foundation + Publishing", why:"A client structuring their estate is a natural Foundation partner for charitable giving — and may carry a legacy story worth publishing." },
  { from:"Foundation", to:"Productions + Financial", why:"A donor with community impact to share is a Productions candidate for storytelling — and may benefit from structured giving through Financial." },
];

export default function EcosystemPage() {
  return (
    <>
      <Nav />
      <div className="jm1-ticker">
        <div className="jm1-ticker-inner">
          {["Publishing","Financial Planning","Community Impact","Media Production","AI Orchestration","Microsoft-Native","GPO Registered","SAM.gov Active","Legacy by Design","Columbus, OH",
            "Publishing","Financial Planning","Community Impact","Media Production","AI Orchestration","Microsoft-Native","GPO Registered","SAM.gov Active","Legacy by Design","Columbus, OH"
          ].map((t,i)=><span key={i}>{i%2===0?<b>{t}</b>:t}{" · "}</span>)}
        </div>
      </div>

      {/* Hero */}
      <section className="jm1-sec" style={{ background:"#fff",borderBottom:"1px solid rgba(0,44,84,0.09)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.24em",color:"#F4B400",textTransform:"uppercase",marginBottom:"1.5rem" }}>
          <span style={{ display:"inline-block",width:"18px",height:"1px",background:"#F4B400" }} />The Ecosystem
        </div>
        <h1 className="jm1-sh" style={{ fontSize:"clamp(48px,6vw,80px)",lineHeight:1.03,letterSpacing:"-0.02em",marginBottom:"1rem" }}>Four divisions.<br /><em>One architecture.</em></h1>
        <p className="jm1-bridge" style={{ marginBottom:"0",marginTop:"0.5rem",fontSize:"16px" }}>What people build should last — across publishing, financial strategy, community impact, and media production.</p>
        <p style={{ fontSize:"15px",color:"#4A5568",lineHeight:1.8,maxWidth:"580px",marginTop:"1rem" }}>J Merrill One is not a holding company. It is an operating system. Each division is a precision expression of the parent platform — purpose-built for its domain, governed by the parent architecture, and connected to every other division through shared infrastructure.</p>
      </section>

      {/* Divisions */}
      <section className="jm1-sec" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="jm1-kicker">The Divisions</div>
        <h2 className="jm1-sh">Outputs of<br /><em>the system.</em></h2>
        <p className="jm1-sp">Each division is governed, connected, and coordinated at the JM1 parent level. They share one data layer, one intelligence model, and one governing canon.</p>
        <div style={{ border:"1px solid rgba(0,44,84,0.09)" }}>
          {divisions.map(d=>(
            <a key={d.id} href={`/divisions/${d.id}`} style={{ textDecoration:"none",display:"block" }}>
              <div className="jm1-eco-row" style={{ background:"#fff",padding:"2.5rem",display:"grid",gridTemplateColumns:"80px 1fr 1fr 1fr",gap:"2.5rem",alignItems:"start",borderBottom:"1px solid rgba(0,44,84,0.09)",cursor:"pointer",transition:"background 0.2s" }}
                >
                <div><span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.16em",color:"rgba(0,44,84,0.2)",display:"block",marginBottom:"8px" }}>{d.num}</span><div style={{ width:"2rem",height:"2px",background:d.accent }} /></div>
                <div><span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.18em",textTransform:"uppercase",display:"block",marginBottom:"8px",color:d.accent }}>{d.label}</span><div style={{ fontFamily:"'Instrument Serif',serif",fontSize:"22px",color:"#05111F",marginBottom:"8px" }}>{d.fullName}</div><p style={{ fontSize:"12px",color:"#4A5568",fontStyle:"italic",lineHeight:1.5 }}>{d.why}</p></div>
                <div><div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase",marginBottom:"0.75rem" }}>About</div><p style={{ fontSize:"13px",color:"#4A5568",lineHeight:1.7 }}>{d.desc}</p></div>
                <div><div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase",marginBottom:"0.75rem" }}>Entry Point</div><p style={{ fontSize:"13px",color:"#4A5568",lineHeight:1.6,fontStyle:"italic",marginBottom:"1rem" }}>&quot;{d.entryLabel}&quot;</p><span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.12em",color:"#BDC5CE",textTransform:"uppercase" }}>{d.domain} →</span></div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Cross-Division */}
      <section className="jm1-sec" style={{ background:"#fff",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="jm1-kicker">Cross-Division Intelligence</div>
        <h2 className="jm1-sh">The power is in<br /><em>the orchestration.</em></h2>
        <p className="jm1-sp">What separates JM1 from a portfolio of brands is the intelligence layer that connects them. A client in one division becomes an opportunity across all four.</p>
        <div className="eco-pathway-grid">
          {pathways.map(p=>(
            <div key={p.from} className="eco-pathway-col">
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase" }}>Pathway</div>
              <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:"21px",color:"#05111F" }}>{p.from}</div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.1em",color:"#A3C4DC",textTransform:"uppercase" }}>→ {p.to}</div>
              <p style={{ fontSize:"12px",color:"#4A5568",lineHeight:1.65 }}>{p.why}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="jm1-statement">
        <div>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.22em",color:"rgba(163,196,220,0.5)",textTransform:"uppercase",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:"0.6rem" }}>
            <span style={{ display:"inline-block",width:"16px",height:"1px",background:"#F4B400" }} />Enterprise Position
          </div>
          <div className="jm1-st-text">One system.<br /><em>Four expressions.<br />Infinite leverage.</em></div>
        </div>
        <div>
          <p style={{ fontSize:"13px",color:"rgba(163,196,220,0.65)",lineHeight:1.75,maxWidth:"280px" }}>The JM1 architecture creates compounding value that no single-division company can replicate.</p>
          <a href="/contact" style={{ background:"#F4B400",color:"#05111F",padding:"0.9rem 2.25rem",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",display:"inline-block",textDecoration:"none",marginTop:"1.5rem" }}>Find Your Path →</a>
        </div>
      </div>
      <Footer />
    </>
  );
}
