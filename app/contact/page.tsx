"use client";
import { useState, useRef } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { divisions } from "@/lib/tokens";
import { canon } from "@/content/canon";

type Intent = "publishing" | "financial" | "foundation" | "productions" | null;

const S = {
  label: { fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.12em",textTransform:"uppercase" as const,color:"#4A5568",display:"block",marginBottom:"6px" },
  input: { border:"1px solid rgba(0,44,84,0.15)",padding:"0.85rem 1rem",fontFamily:"'Syne',sans-serif",fontSize:"14px",color:"#05111F",outline:"none",width:"100%",background:"#fff" },
};

export default function ContactPage() {
  const [intent, setIntent] = useState<Intent>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const selectedDiv = divisions.find(d => d.id === intent);

  function selectIntent(id: Intent) {
    setIntent(id);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }), 100);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const firstName = fd.get("firstName") as string;
    const lastName  = fd.get("lastName") as string;
    const email     = fd.get("email") as string;
    const phone     = fd.get("phone") as string;
    const message   = fd.get("message") as string;
    const source    = fd.get("source") as string;
    /*
    INTEGRATION CHECKPOINT — CHAD
    Phase 2: replace with Power Automate fetch():
      fetch("POWER_AUTOMATE_HTTP_TRIGGER_URL", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ intent,firstName,lastName,email,phone,message,source,submittedAt:new Date().toISOString() })
      }).then(()=>{ setSubmittedName(firstName); setSubmitted(true); });
    Routing: publishing→JMP, financial→FIN, foundation→JMF, productions→JMPROD
    */
    const routes = canon.intake.emailRoutes as Record<string,string>;
    const to = intent ? (routes[intent] ?? routes.fallback) : routes.fallback;
    const subj = `JM1 Intake — ${selectedDiv?.label??""} — ${firstName} ${lastName}`;
    const body = [`Division: ${selectedDiv?.label??""}`,`Name: ${firstName} ${lastName}`,`Email: ${email}`,`Phone: ${phone||"Not provided"}`,`Source: ${source||"Not provided"}`,"","Message:",message].join("\n");
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    setSubmittedName(firstName);
    setSubmitted(true);
  }

  return (
    <>
      <Nav />
      <div className="jm1-ticker"><div className="jm1-ticker-inner">
        {[...canon.ticker,...canon.ticker].map((t,i)=><span key={i}>{i%2===0?<b>{t}</b>:t}{" · "}</span>)}
      </div></div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="jm1-sec" style={{ background:"#fff",borderBottom:"1px solid rgba(0,44,84,0.09)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",fontFamily:"'DM Mono',monospace",fontSize:"10px",letterSpacing:"0.22em",color:"#F4B400",textTransform:"uppercase",marginBottom:"2rem" }}>
          <span style={{ width:"32px",height:"1px",background:"#F4B400",display:"inline-block" }} />Contact
        </div>
        <h1 className="jm1-h1" style={{ fontSize:"clamp(40px,5vw,68px)",maxWidth:"680px" }}>
          What are you<br /><em>trying to move forward?</em>
        </h1>
        <p className="jm1-bridge" style={{ marginTop:"0.5rem",maxWidth:"540px" }}>
          Whatever you&apos;re working toward — a book, your family&apos;s protection, a message, a community — the right path exists here.
        </p>
      </section>

      {/* ── Step 1: Intent Cards ──────────────────────────────── */}
      <section className="jm1-sec" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="jm1-kicker">Step 1 — Choose Your Path</div>
        <h2 className="jm1-sh">What brings you<br /><em>to J Merrill One?</em></h2>
        <p style={{ fontSize:"14px",color:"#4A5568",lineHeight:1.75,maxWidth:"480px",marginBottom:"2.5rem" }}>
          Select what best matches what you&apos;re working toward. This routes your message to the right division.
        </p>
        <div className="contact-intent-grid">
          {divisions.map(d => (
            <button key={d.id} onClick={()=>selectIntent(d.id as Intent)} style={{ textAlign:"left",padding:"2.25rem 2rem",background:"#fff",position:"relative",overflow:"hidden",cursor:"pointer",border:"none" }}>
              <div style={{ position:"absolute",top:0,left:0,right:0,height:"3px",background:d.accent,opacity:intent===d.id?1:0,transition:"opacity 0.2s" }} />
              {intent===d.id && <div style={{ position:"absolute",top:"1rem",right:"1rem",width:"20px",height:"20px",background:"#002C54",display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ color:"#fff",fontSize:"10px" }}>✓</span></div>}
              <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.18em",textTransform:"uppercase",color:d.accent,display:"block",marginBottom:"0.6rem" }}>{d.label}</span>
              <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:"21px",color:"#05111F",lineHeight:1.3,marginBottom:"0.5rem",overflow:"visible" }}>{d.why}</div>
              <p style={{ fontSize:"12px",color:"#4A5568",lineHeight:1.6 }}>{d.heroBridge}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Step 2: Form ─────────────────────────────────────── */}
      {intent && (
        <section className="jm1-sec" style={{ background:"#fff",borderTop:"1px solid rgba(0,44,84,0.09)" }} ref={formRef}>
          <div className="jm1-kicker">Step 2 — Tell Us About You</div>
          <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.75rem 1.25rem",border:"1px solid rgba(0,44,84,0.09)",background:"#F7F8FA",marginBottom:"2rem",width:"fit-content" }}>
            <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",textTransform:"uppercase",letterSpacing:"0.12em",color:"#999" }}>Routing to:</span>
            <strong style={{ color:"#002C54",fontSize:"13px" }}>{selectedDiv?.label}</strong>
            <span style={{ fontSize:"13px",color:"#4A5568" }}>— {selectedDiv?.why}</span>
          </div>

          {submitted ? (
            <div style={{ border:"1px solid rgba(0,44,84,0.09)",padding:"4rem 3rem",textAlign:"center",maxWidth:"560px" }}>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.22em",textTransform:"uppercase",color:selectedDiv?.accent,marginBottom:"1.5rem" }}>Message Sent</div>
              <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:"36px",color:"#05111F",marginBottom:"1rem" }}>Thank you, {submittedName}.</div>
              <p style={{ fontSize:"15px",color:"#4A5568",lineHeight:1.8,marginBottom:"2rem" }}>Your message has been routed. Someone from the team will be in touch shortly.</p>
              <a href="/" style={{ background:selectedDiv?.accent,color:"#fff",padding:"0.9rem 2.25rem",fontFamily:"'Syne',sans-serif",fontSize:"11px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",textDecoration:"none",display:"inline-block" }}>Return to J Merrill One</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ maxWidth:"720px" }}>
              <input type="hidden" name="intent" value={intent} />
              <div className="contact-form-grid-2">
                <div><label style={S.label}>First Name *</label><input name="firstName" required placeholder="First name" style={S.input} /></div>
                <div><label style={S.label}>Last Name *</label><input name="lastName" required placeholder="Last name" style={S.input} /></div>
              </div>
              <div className="contact-form-grid-2">
                <div><label style={S.label}>Email Address *</label><input name="email" type="email" required placeholder="your@email.com" style={S.input} /></div>
                <div><label style={S.label}>Phone Number</label><input name="phone" type="tel" placeholder="(000) 000-0000" style={S.input} /></div>
              </div>
              <div style={{ marginBottom:"1rem" }}>
                <label style={S.label}>What are you trying to move forward? *</label>
                <textarea name="message" required rows={5} placeholder="Tell us about your situation and goals. The more you share, the better we can help." style={{ ...S.input,resize:"none" }} />
              </div>
              <div style={{ marginBottom:"2rem" }}>
                <label style={S.label}>How did you hear about us?</label>
                <select name="source" style={S.input}>
                  <option value="">Select one...</option>
                  <option>Word of mouth / referral</option>
                  <option>Web search</option>
                  <option>Social media</option>
                  <option>Published author / client</option>
                  <option>Community program</option>
                  <option>Other</option>
                </select>
              </div>
              <button type="submit" style={{ width:"100%",padding:"1.1rem",fontFamily:"'Syne',sans-serif",fontSize:"12px",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",background:selectedDiv?.accent??"#002C54",color:"#fff",border:"none",cursor:"pointer" }}>
                Enter the System ↗
              </button>
              <p style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.08em",textTransform:"uppercase",color:"#BDC5CE",textAlign:"center",marginTop:"0.75rem" }}>
                Routes to {selectedDiv?.label} team — {(canon.intake.emailRoutes as Record<string,string>)[intent]}
              </p>
            </form>
          )}
        </section>
      )}

      {/* ── Contact info ──────────────────────────────────────── */}
      <section className="jm1-sec-sm" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="contact-info-grid">
          {[{l:"Location",v:canon.location},{l:"Email",v:"info@jmerrill.one"},{l:"Office Hours",v:"Mon–Thu: 10AM–6PM\nFri: 10AM–4PM · Sat: By Appt"}].map((item,i)=>(
            <div key={item.l} style={{ padding:"1.5rem 1.75rem",borderRight:i<2?"1px solid rgba(0,44,84,0.09)":"none" }}>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",textTransform:"uppercase",color:"#F4B400",marginBottom:"0.5rem" }}>{item.l}</div>
              <div style={{ fontSize:"14px",color:"#4A5568",lineHeight:1.7,whiteSpace:"pre-line" }}>{item.v}</div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
