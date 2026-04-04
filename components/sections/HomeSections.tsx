"use client";
import Link from "next/link";
import { canon } from "@/content/canon";
import { divisions } from "@/lib/tokens";

// ── Kicker helper
function K({ text, color="#F4B400", mb="1rem" }: { text:string; color?:string; mb?:string }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.24em",color,textTransform:"uppercase" as const,marginBottom:mb }}>
      <span style={{ display:"inline-block",width:"18px",height:"1px",background:color }} />{text}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="jm1-hero">
      <div>
        <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",fontFamily:"'DM Mono',monospace",fontSize:"10px",letterSpacing:"0.22em",color:"#F4B400",textTransform:"uppercase",marginBottom:"2.25rem" }}>
          <span style={{ width:"32px",height:"1px",background:"#F4B400",display:"inline-block" }} />{canon.hero.eyebrow}
        </div>
        <h1 className="jm1-h1">
          What you<br /><em>build should</em><br /><span className="ul">last.</span>
        </h1>
        <p className="jm1-bridge">{canon.hero.bridge}</p>
        <p className="jm1-hero-body">{canon.hero.body}</p>
        <div style={{ display:"flex",gap:"0.75rem",flexWrap:"wrap" as const,marginBottom:"3.5rem" }}>
          <Link href="/divisions/financial" className="jm1-btn-fill">{canon.hero.cta1}</Link>
          <Link href="/why-we-exist" className="jm1-btn-ghost">{canon.hero.cta2}</Link>
        </div>
        <div style={{ display:"flex",gap:"2.75rem",paddingTop:"2.5rem",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
          {canon.hero.stats.map(s=>(
            <div key={s.label} style={{ display:"flex",flexDirection:"column" as const }}>
              <span className="jm1-stat-n">{s.value}</span>
              <span className="jm1-stat-l">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ width:"100%",maxWidth:"360px",border:"1px solid rgba(0,44,84,0.09)",background:"#F7F8FA" }}>
          <div style={{ padding:"1rem 1.5rem",borderBottom:"1px solid rgba(0,44,84,0.09)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.2em",color:"#F4B400",textTransform:"uppercase" }}>JM1 System Architecture</span>
            <div style={{ display:"flex",gap:"5px" }}>{[0,1,2].map(i=><span key={i} style={{ width:"6px",height:"6px",borderRadius:"50%",background:"rgba(0,44,84,0.09)" }} />)}</div>
          </div>
          <div style={{ padding:"2rem 1.5rem",borderBottom:"1px solid rgba(0,44,84,0.09)",display:"flex",justifyContent:"center" }}>
            <div style={{ width:"80px",height:"80px",border:"1px solid #F4B400",display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",background:"#fff",gap:"3px" }}>
              <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"8px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase" }}>JM1</span>
              <span style={{ fontFamily:"'Instrument Serif',serif",fontSize:"16px",color:"#05111F" }}>Control</span>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:"rgba(0,44,84,0.09)" }}>
            {divisions.map(d=>(
              <Link key={d.id} href={`/divisions/${d.id}`} style={{ textDecoration:"none" }}>
                <div style={{ background:"#fff",padding:"1rem 1.25rem",display:"flex",flexDirection:"column" as const,gap:"3px",cursor:"pointer",transition:"background 0.15s" }} onMouseEnter={e=>(e.currentTarget.style.background="#F7F8FA")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                  <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"8px",letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:500,color:d.accent }}>{d.label}</span>
                  <span style={{ fontSize:"12px",fontWeight:600,color:"#05111F" }}>{d.fullName}</span>
                  <span style={{ fontSize:"10px",color:"#4A5568" }}>{d.why.split(" ").slice(0,4).join(" ")}…</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ padding:"0.85rem 1.5rem",fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.12em",color:"#BDC5CE",textTransform:"uppercase",textAlign:"center" }}>Governed · Connected · Unified</div>
        </div>
      </div>
    </section>
  );
}

export function TickerSection() {
  const items = [...canon.ticker, ...canon.ticker];
  return (
    <div className="jm1-ticker"><div className="jm1-ticker-inner">
      {items.map((item,i)=><span key={i}>{i%2===0?<b>{item}</b>:item}{" · "}</span>)}
    </div></div>
  );
}

export function WhySection() {
  const darkAccents: Record<string,string> = { pub:"#4DAEFF", fin:"#2EC98A", fnd:"#C87FD4", pro:"#FF9140" };
  return (
    <section className="jm1-why">
      <div style={{ maxWidth:"920px" }}>
        <K text={canon.why.kicker} mb="1.5rem" />
        <h2 className="jm1-why-h">Ideas die. Families go unprotected.<br /><em>Too many legacies die with the people who built them.</em></h2>
        <p className="jm1-why-stmt">{canon.why.statement}</p>
        <div className="jm1-why-pillars">
          {divisions.map(d=>(
            <div key={d.id} className="jm1-why-p">
              <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.18em",textTransform:"uppercase",color:darkAccents[d.id] }}>{d.label}</span>
              <div className="jm1-why-p-truth">{d.why}</div>
              <p className="jm1-why-p-sub">{d.desc.slice(0,90)}…</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BridgeSection() {
  return (
    <section className="jm1-sec" style={{ background:"#fff",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
      <K text={canon.bridge.kicker} />
      <h2 className="jm1-sh" style={{ fontSize:"clamp(28px,3.2vw,44px)",whiteSpace:"pre-line" }}>{canon.bridge.headline}</h2>
      <p style={{ fontSize:"14px",color:"#4A5568",lineHeight:1.7,maxWidth:"520px",marginBottom:"3rem" }}>{canon.bridge.sub}</p>
      <div className="jm1-bridge-grid">
        {divisions.map(d=>(
          <Link key={d.id} href={`https://${d.domain}`} style={{ textDecoration:"none" }}>
            <div className="jm1-bc">
              <div className="jm1-bc-bar" style={{ background:d.accent }} />
              <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.18em",textTransform:"uppercase",color:d.accent }}>{d.label}</span>
              <div className="jm1-bc-title">{d.humanTitle}</div>
              <p className="jm1-bc-body">{d.humanBody}</p>
              <span className="jm1-bc-link">{d.ctaLabel} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SystemDefSection() {
  return (
    <section className="jm1-sec" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
      <K text={canon.sysdef.kicker} />
      <h2 className="jm1-sh">{canon.sysdef.headline[0]}<br /><em>{canon.sysdef.headline[1]}</em><br />{canon.sysdef.headline[2]}</h2>
      <div className="jm1-sysdef-frame">
        <p className="jm1-sysdef-title">J Merrill One is <em>not a company<br />with multiple services.</em></p>
        <p className="jm1-sysdef-body">{canon.sysdef.body}</p>
        <div className="jm1-sysdef-pillars">
          {canon.sysdef.layers.map(l=>(
            <div key={l.tag} className="jm1-pillar">
              <span className="jm1-p-tag">{l.tag}</span>
              <div className="jm1-p-name">{l.name}</div>
              <p className="jm1-p-desc">{l.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DivisionsSection() {
  return (
    <section id="divisions" className="jm1-sec" style={{ background:"#fff",borderTop:"1px solid rgba(0,44,84,0.09)",borderBottom:"1px solid rgba(0,44,84,0.09)" }}>
      <K text={canon.divisions.kicker} />
      <h2 className="jm1-sh">{canon.divisions.headline[0]}<br /><em>{canon.divisions.headline[1]}</em></h2>
      <p className="jm1-sp">{canon.divisions.sub}</p>
      <div className="jm1-brand-grid">
        {divisions.map(d=>(
          <Link key={d.id} href={`https://${d.domain}`} style={{ textDecoration:"none" }}>
            <div className="jm1-b-tile">
              <div className="jm1-b-bar" style={{ background:d.accent }} />
              <span className="jm1-b-n">{d.num}</span>
              <span className="jm1-b-tag" style={{ color:d.accent }}>{d.label}</span>
              <div className="jm1-b-name" style={{ whiteSpace:"pre-line" }}>{"J Merrill\n"+d.label}</div>
              <p className="jm1-b-desc">{d.desc}</p>
              <span className="jm1-b-link">{d.domain} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function StatementSection() {
  return (
    <div className="jm1-statement">
      <div>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.22em",color:"rgba(163,196,220,0.5)",textTransform:"uppercase",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:"0.6rem" }}>
          <span style={{ display:"inline-block",width:"16px",height:"1px",background:"#F4B400" }} />{canon.statement.pre}
        </div>
        <div className="jm1-st-text">{canon.statement.line1}<br />We are building <em>the infrastructure<br />for generational legacy.</em></div>
      </div>
      <p style={{ fontSize:"13px",color:"rgba(163,196,220,0.65)",lineHeight:1.75,maxWidth:"280px" }}>{canon.statement.sub}</p>
    </div>
  );
}

export function FlowSection() {
  return (
    <section className="jm1-sec" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
      <K text={canon.flow.kicker} />
      <h2 className="jm1-sh">{canon.flow.headline[0]}<br /><em>{canon.flow.headline[1]}</em></h2>
      <p className="jm1-sp">{canon.flow.sub}</p>
      <p style={{ fontSize:"11px",color:"rgba(100,120,140,0.7)",fontStyle:"italic",marginBottom:"1.5rem",marginTop:"-2.5rem" }}>{canon.flow.note}</p>
      <div className="jm1-flow-grid">
        {canon.flow.steps.map(s=>(
          <div key={s.num} className="jm1-f-step">
            <div className="jm1-f-idx">{s.num} ——</div>
            <div className="jm1-f-head">{s.head}</div>
            <p className="jm1-f-body">{s.body}</p>
            {s.brand && <div className="jm1-f-brand">↑ {s.brand}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function OperatingModelSection() {
  return (
    <section className="jm1-sec" style={{ background:"#fff",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
      <K text={canon.opmodel.kicker} />
      <h2 className="jm1-sh">{canon.opmodel.headline[0]}<br /><em>{canon.opmodel.headline[1]}</em></h2>
      <p className="jm1-sp">{canon.opmodel.sub}</p>
      <div className="jm1-op-grid">
        {canon.opmodel.cards.map(c=>(
          <div key={c.icon} className="jm1-op-card">
            <div className="jm1-op-icon">{c.icon}</div>
            <div className="jm1-op-name" style={{ whiteSpace:"pre-line" }}>{c.name}</div>
            <p className="jm1-op-desc">{c.desc}</p>
            <div style={{ display:"flex",flexDirection:"column" as const,gap:"0.5rem" }}>
              {c.items.map(item=>(
                <div key={item} style={{ display:"flex",alignItems:"center",gap:"0.6rem",fontSize:"12px",color:"#4A5568" }}>
                  <span className="jm1-op-dot" />{item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EntrySection() {
  return (
    <section className="jm1-sec" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
      <K text={canon.entry.kicker} />
      <h2 className="jm1-sh">{canon.entry.headline[0]}<br /><em>{canon.entry.headline[1]}</em></h2>
      <p className="jm1-sp">{canon.entry.sub}</p>
      <div className="jm1-entry-grid">
        {divisions.map(d=>(
          <Link key={d.id} href={`https://${d.domain}`} style={{ textDecoration:"none" }}>
            <div className="jm1-e-card">
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.18em",color:"#F4B400",textTransform:"uppercase",marginBottom:"0.75rem" }}>{d.label}</div>
              <div className="jm1-e-title">{d.entryLabel}</div>
              <p className="jm1-e-sub">{d.entrySub}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ProofSection() {
  return (
    <section className="jm1-sec" style={{ background:"#fff",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
      <K text={canon.proof.kicker} />
      <h2 className="jm1-sh">{canon.proof.headline[0]}<br /><em>{canon.proof.headline[1]}</em></h2>
      <p className="jm1-sp">{canon.proof.sub}</p>
      <div className="jm1-proof-grid">
        {canon.proof.stories.map(s=>(
          <div key={s.division} className="jm1-proof-card">
            <div style={{ width:"2.5rem",height:"2px",background:s.accent }} />
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",textTransform:"uppercase",color:s.accent }}>{s.division}</div>
            <div className="jm1-proof-headline">{s.headline}</div>
            <p style={{ fontSize:"12px",color:"#4A5568",lineHeight:1.65,flex:1 }}>{s.body}</p>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.12em",color:"#BDC5CE",textTransform:"uppercase",paddingTop:"0.75rem",borderTop:"1px solid rgba(0,44,84,0.09)" }}>{s.why}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AuthoritySection() {
  return (
    <section className="jm1-sec jm1-auth">
      <div className="jm1-auth-inner">
        <div>
          <K text={canon.authority.kicker} />
          <h2 className="jm1-sh jm1-sh-white">{canon.authority.headline[0]}<br /><em>{canon.authority.headline[1]}</em></h2>
          <p style={{ fontSize:"14px",color:"rgba(163,196,220,0.8)",lineHeight:1.75,maxWidth:"500px" }}>{canon.authority.sub}</p>
          <div style={{ display:"flex",gap:"4rem",marginTop:"3rem" }}>
            {canon.authority.stats.map(s=>(
              <div key={s.label} style={{ display:"flex",flexDirection:"column" as const }}>
                <span className="jm1-a-n">{s.value}</span>
                <span style={{ fontSize:"12px",color:"rgba(163,196,220,0.7)",marginTop:"0.5rem",letterSpacing:"0.04em",lineHeight:1.5,whiteSpace:"pre-line" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column" as const,gap:"0.6rem",paddingTop:"0.5rem" }}>
          {canon.authority.badges.map(b=>(
            <div key={b} className="jm1-badge">
              <div style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#F4B400",flexShrink:0 }} />{b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
