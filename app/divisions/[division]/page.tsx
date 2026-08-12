import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { divisions, getDivision } from "@/lib/divisions";
import { getDivisionInquiryHref, getDivisionPublicHref, isInquiryLedDivision } from "@/lib/division-links";

const divisionMetadata: Record<string, string> = {
  publishing: "J Merrill Publishing helps authors protect ownership, publish with clarity, and carry their words forward.",
  financial: "J Merrill Financial helps families get protected with clear planning, steady guidance, and a non-intimidating process.",
  foundation: "J Merrill Foundation helps donors, volunteers, and partners turn generosity into practical, lasting community impact.",
  productions: "J Merrill Productions helps messages travel further through guided, inquiry-led video, audio, and content support.",
};

const serviceBridges: Record<string, { headline: string; body: string }> = {
  publishing: {
    headline: "Guidance before publishing decisions.",
    body: "Authors should not have to decode the publishing process alone. Before any service decision, we help you understand your options, protect your rights, and move forward with clarity.",
  },
  financial: {
    headline: "Peace of mind before paperwork.",
    body: "Family protection can feel intimidating when the documents are unfamiliar or overdue. We begin with clarity, care, and a process designed to help loved ones feel more secure, not more overwhelmed.",
  },
  foundation: {
    headline: "Trust before programs and giving paths.",
    body: "Generosity works best when people can see how their time, partnership, or support creates practical help that lasts. We want donors, volunteers, and community partners to understand the path before they choose it.",
  },
  productions: {
    headline: "The first step is the conversation.",
    body: "Before choosing a package, we want to understand your message, audience, and what you need the work to do. Productions on J Merrill One starts with inquiry so the right creative path can be shaped with care.",
  },
};

export async function generateStaticParams() {
  return divisions.map(d => ({ division: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ division: string }> }): Promise<Metadata> {
  const { division: divId } = await params;
  const d = getDivision(divId);
  if (!d) return { title: "Not Found" };
  return { title: `${d.fullName} — J Merrill One`, description: divisionMetadata[d.id] ?? d.why };
}

export default async function DivisionPage({ params }: { params: Promise<{ division: string }> }) {
  const { division: divId } = await params;
  const d = getDivision(divId);
  if (!d) notFound();
  const isInquiryLed = isInquiryLedDivision(d.id);
  const contactHref = getDivisionInquiryHref(d.id);
  const publicHref = getDivisionPublicHref(d.id, d.domain);
  const serviceBridge = serviceBridges[d.id];

  return (
    <>
      <Nav />
      <div className="jm1-ticker"><div className="jm1-ticker-inner">{["What you build should last","Ideas deserve to outlive the moment","Families deserve protection","Communities deserve more","Messages deserve to reach further","Legacy is by design, not by chance","What you build should last","Ideas deserve to outlive the moment","Families deserve protection","Communities deserve more","Messages deserve to reach further","Legacy is by design, not by chance"].map((t,i)=><span key={i}>{i%2===0?<b>{t}</b>:t}{" · "}</span>)}</div></div>

      {/* Hero */}
      <section className="jm1-sec" style={{ background:"#fff",borderBottom:"1px solid rgba(0,44,84,0.09)" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1.1fr 0.9fr",alignItems:"center",gap:"4rem" }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",fontFamily:"'DM Mono',monospace",fontSize:"10px",letterSpacing:"0.22em",color:d.accent,textTransform:"uppercase",marginBottom:"1rem" }}>
              <div style={{ width:"32px",height:"1px",background:d.accent }} />{d.fullName}
            </div>
            {/* Canon v1.1: A J Merrill One Company */}
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(0,44,84,0.35)",marginBottom:"2rem" }}>{d.parentLine}</div>
            <h1 style={{ fontFamily:"'Instrument Serif',serif",fontSize:"clamp(50px,6vw,80px)",fontWeight:400,lineHeight:1.05,letterSpacing:"-0.02em",color:"#05111F",overflow:"visible",paddingBottom:"4px",marginBottom:"1.5rem" }}>
              {d.heroHeadline.map((line,i)=> i===d.heroItalicLine
                ? <em key={i} style={{ fontStyle:"italic",color:d.accent }}>{line}<br /></em>
                : <span key={i}>{line}<br /></span>
              )}
            </h1>
            <p style={{ fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:"15px",color:"#4A5568",lineHeight:1.75,maxWidth:"500px",marginBottom:"1.25rem",borderLeft:`2px solid ${d.accent}`,paddingLeft:"1rem" }}>{d.heroBridge}</p>
            <p style={{ fontSize:"15px",color:"#4A5568",lineHeight:1.75,maxWidth:"500px",marginBottom:"2.5rem" }}>{d.heroBody}</p>
            <div className="div-btn-row">
              <Link href={contactHref} style={{ background:d.accent,color:"#fff",padding:"0.9rem 2.25rem",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",display:"inline-block",textDecoration:"none",border:`1px solid ${d.accent}` }}>{d.cta}</Link>
              <Link href={contactHref} style={{ background:"transparent",color:"#002C54",border:"1px solid rgba(0,44,84,0.25)",padding:"0.9rem 2.25rem",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",display:"inline-block",textDecoration:"none" }}>{isInquiryLed ? "Tell Us About Your Project" : d.ctaBook}</Link>
            </div>
          </div>
          <div style={{ border:"1px solid rgba(0,44,84,0.09)",background:"#F7F8FA",padding:"2.5rem",display:"flex",flexDirection:"column",gap:"1.5rem" }}>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.2em",color:d.accent,textTransform:"uppercase" }}>Division Identity</div>
            <div><div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"rgba(0,44,84,0.4)",textTransform:"uppercase",marginBottom:"0.5rem" }}>Our WHY</div><div style={{ fontFamily:"'Instrument Serif',serif",fontSize:"19px",color:"#05111F",fontStyle:"italic",lineHeight:1.35 }}>{d.why}</div></div>
            <div><div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"rgba(0,44,84,0.4)",textTransform:"uppercase",marginBottom:"0.5rem" }}>Brand Truth</div><div style={{ fontSize:"14px",color:"#4A5568",lineHeight:1.6 }}>{d.tagline}</div></div>
            <div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"rgba(0,44,84,0.4)",textTransform:"uppercase",marginBottom:"0.5rem" }}>{isInquiryLed ? "Start Here" : "Domain"}</div>
              {isInquiryLed ? (
                <Link href={contactHref} style={{ fontFamily:"'DM Mono',monospace",fontSize:"12px",color:d.accent,textDecoration:"none" }}>Start with J Merrill One →</Link>
              ) : (
                <a href={publicHref} target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'DM Mono',monospace",fontSize:"12px",color:d.accent,textDecoration:"none" }}>{d.domain} →</a>
              )}
            </div>
            <div><div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"rgba(0,44,84,0.4)",textTransform:"uppercase",marginBottom:"0.5rem" }}>J Merrill One</div><Link href="/" style={{ fontSize:"13px",color:"#4A5568",textDecoration:"none" }}>One of four J Merrill One companies</Link></div>
          </div>
        </div>
      </section>

      <section className="jm1-sec-sm" style={{ background:"#fff",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="jm1-kicker">Before You Choose a Service</div>
        <h2 className="jm1-sh" style={{ fontSize:"clamp(28px,3.2vw,40px)",marginBottom:"1rem" }}>{serviceBridge.headline}</h2>
        <p style={{ fontSize:"15px",color:"#4A5568",lineHeight:1.8,maxWidth:"720px" }}>{serviceBridge.body}</p>
      </section>

      {/* Services */}
      <section className="jm1-sec" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.24em",color:d.accent,textTransform:"uppercase",marginBottom:"1rem" }}><span style={{ display:"inline-block",width:"18px",height:"1px",background:d.accent }} />{isInquiryLed ? "Ways We Can Help" : "Services & Pricing"}</div>
        <h2 className="jm1-sh">What we offer.</h2>
        <p className="jm1-sp">{isInquiryLed ? "Every engagement starts with a conversation so the right creative support can be scoped with clarity." : "Every service is designed to give you access to professional-grade outcomes without unnecessary complexity or cost."}</p>
        <div className="div-services-grid">
          {d.services.map(s=>(
            <div key={s.sku} style={{ background:"#fff",padding:"1.75rem",display:"flex",flexDirection:"column",gap:"0.6rem",cursor:"pointer",transition:"background 0.2s" }}>
              <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"rgba(0,44,84,0.3)",textTransform:"uppercase" }}>{s.sku}</span>
              <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:"18px",color:"#05111F",overflow:"visible" }}>{s.name}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"13px",fontWeight:700,color:d.accent }}>{s.price}</div>
              <p style={{ fontSize:"12px",color:"#4A5568",lineHeight:1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display:"flex",gap:"0.75rem",marginTop:"2rem" }}>
          <Link href={contactHref} style={{ background:d.accent,color:"#fff",padding:"0.9rem 2.25rem",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",display:"inline-block",textDecoration:"none" }}>{isInquiryLed ? "Start the Conversation" : "Start a Conversation"}</Link>
          <Link href={contactHref} style={{ background:"transparent",color:"#002C54",border:"1px solid rgba(0,44,84,0.25)",padding:"0.9rem 2.25rem",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",display:"inline-block",textDecoration:"none" }}>{isInquiryLed ? "Tell Us About Your Project" : "View Full Catalog"}</Link>
        </div>
      </section>

      {/* Proof */}
      <section className="jm1-sec jm1-auth">
        <div className="jm1-auth-inner">
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.24em",color:d.accent,textTransform:"uppercase",marginBottom:"1rem" }}><span style={{ display:"inline-block",width:"18px",height:"1px",background:d.accent }} />Why People Trust This Work</div>
            <h2 style={{ fontFamily:"'Instrument Serif',serif",fontSize:"clamp(32px,3.8vw,52px)",fontWeight:400,lineHeight:1.12,color:"#fff",marginBottom:"0.75rem",overflow:"visible" }}>Built to serve<br /><em style={{ fontStyle:"italic",color:d.accent }}>real people well.</em></h2>
            <p style={{ fontSize:"14px",color:"rgba(163,196,220,0.8)",lineHeight:1.75,maxWidth:"500px" }}>Trusted proof begins with the people served: authors published, families protected, communities helped, and messages carried further.</p>
            <div style={{ display:"flex",gap:"4rem",marginTop:"3rem" }}>
              {d.stats.map(([val,label])=>(
                <div key={label} style={{ display:"flex",flexDirection:"column" }}>
                  <span style={{ fontFamily:"'Instrument Serif',serif",fontSize:"52px",fontWeight:400,color:"#F4B400",lineHeight:1,display:"block",overflow:"visible" }}>{val}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"rgba(163,196,220,0.6)",marginTop:"0.5rem",lineHeight:1.5,display:"block" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:"0.6rem",paddingTop:"0.5rem" }}>
            {[...d.badges,"Part of the J Merrill One family of organizations"].map(b=>(
              <div key={b} className="jm1-badge"><div style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#F4B400",flexShrink:0 }} />{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-division */}
      <section className="jm1-sec" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="div-cross-grid">
          <div>
            <div className="jm1-kicker">Connected Next Steps</div>
            <h2 className="jm1-sh">One need can lead<br /><em>to the next conversation.</em></h2>
            <p style={{ fontSize:"14px",color:"#4A5568",lineHeight:1.75,marginBottom:"2rem" }}>{d.crossDiv.why}</p>
            <a href={d.crossDiv.href} style={{ background:"transparent",color:"#002C54",border:"1px solid rgba(0,44,84,0.25)",padding:"0.9rem 2.25rem",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",display:"inline-block",textDecoration:"none" }}>Explore {d.crossDiv.label} →</a>
          </div>
          <div style={{ border:"1px solid rgba(0,44,84,0.09)",background:"#fff",padding:"2.5rem" }}>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase",marginBottom:"1rem" }}>How the Next Step Can Work</div>
            <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem" }}>
              {[{color:d.accent,label:d.label,text:`A person starts with ${d.label}`},{color:"transparent",label:"↓",text:"The next need becomes clear"},{color:"#F4B400",label:d.crossDiv.label,text:`A thoughtful introduction to ${d.crossDiv.label}`},{color:"transparent",label:"↓",text:"The conversation continues with context"},{color:"#002C54",label:"JM1",text:"One relationship, clearer follow-through"}].map((step,i)=>(
                step.label === "↓"
                  ? <div key={i} style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"#BDC5CE",textTransform:"uppercase",padding:"0 1rem" }}>{step.label} {step.text}</div>
                  : <div key={i} style={{ display:"flex",alignItems:"center",gap:"0.75rem",fontSize:"13px",color:"#4A5568",padding:"0.85rem 1rem",background:"#F7F8FA",border:"1px solid rgba(0,44,84,0.09)" }}>
                      <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.12em",textTransform:"uppercase",flexShrink:0,color:step.color }}>{step.label}</span>{step.text}
                    </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <div className="div-cta-band" style={{ background:d.accent, padding:"4.5rem 2.5rem" }}>
        <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:"clamp(28px,3.2vw,44px)",fontWeight:400,lineHeight:1.22,color:"#fff",maxWidth:"580px" }}>{d.heroHeadline[0].replace(".","")}<br /><em>Let&apos;s talk.</em></div>
        <div className="div-btn-row">
          <Link href={contactHref} style={{ background:"#fff",color:d.accent,padding:"0.9rem 2.25rem",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",display:"inline-block",textDecoration:"none" }}>{isInquiryLed ? "Tell Us About Your Project" : "Find Your Path"}</Link>
          <Link href="/" style={{ background:"transparent",color:"#fff",border:"1px solid rgba(255,255,255,0.4)",padding:"0.9rem 2.25rem",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",display:"inline-block",textDecoration:"none" }}>Back to J Merrill One</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
