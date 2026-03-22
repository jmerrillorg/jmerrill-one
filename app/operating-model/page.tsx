import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operating Model — J Merrill One",
  description: "The three-layer infrastructure that powers J Merrill One.",
};

const opCards = [
  { icon:"DV", label:"Layer 01", name:"Unified\nData Layer", desc:"Microsoft Dataverse as the single source of truth. One contact record. One relationship model. Every client is known across all four divisions.", items:["One contact record across all divisions","Shared relationship intelligence","Lifetime value made visible","Cross-brand opportunity detection"] },
  { icon:"AI", label:"Layer 02", name:"AI\nOrchestration", desc:"A governed agent operating system with dedicated AI support for Publishing, Financial, Marketing, and Executive decisions within the JM1 governance framework.", items:["Division-specific AI agents","Enterprise governance layer","Canon-aligned decision support","Azure AI Foundry integration"] },
  { icon:"PA", label:"Layer 03", name:"Cross-Division\nExecution", desc:"Power Automate routing that detects cross-brand opportunities in real time — every client touchpoint becomes enterprise-wide intelligence and action.", items:["Publishing → Financial routing","Financial → Foundation pathways","Productions amplifies all divisions","Real-time opportunity detection"] },
];

const jm1Controls = ["Domain structure and subdomain assignment","Master color palette and typography","Homepage architecture and section order","Canonical copy and WHY language","Technology stack decisions","AI usage standards and agent governance","Data schema and Dataverse structure","Cross-brand routing logic"];
const divControls = ["Service catalogs and pricing","Division-specific copy and testimonials","Marketing execution within their domain","Client-facing workflows and intake","Division-specific content strategy","Appointment and consultation scheduling"];

const techStack = [
  ["Web","#1E90FF","Framework","Next.js 14+ (App Router)"],["Web","#1E90FF","Styling","Tailwind CSS with JM1 design tokens"],
  ["Cloud","#007F5C","Hosting","Azure Static Web Apps"],["Web","#1E90FF","Rendering","Hybrid SSR/ISR (performance + SEO)"],
  ["Data","#002C54","Data Layer","Microsoft Dataverse"],["Data","#002C54","CRM","Dynamics 365 Sales Enterprise"],
  ["Data","#002C54","Finance","Dynamics 365 Business Central"],["Auto","#F4B400","Automation","Power Automate"],
  ["AI","#93329E","AI Infrastructure","Azure AI Foundry (post-launch)"],["Ops","#FF6F00","Bookings","Microsoft Bookings"],
  ["Sec","#4A5568","Identity","Microsoft Entra ID"],["Lang","#002C54","Language","TypeScript"],
];

const aiPhases = [
  { phase:"Phase 1 — Active", title:"Canon + Scaffold", items:["Web Canon v1 locked","Next.js scaffold complete","Design tokens + copy system live"] },
  { phase:"Phase 2 — Build", title:"Division Sites + Data", items:["Division sites launched","Dataverse intake forms live","Cross-brand routing via Power Automate"] },
  { phase:"Phase 3 — Intelligence", title:"AI Orchestration", items:["Azure AI Foundry integration","Division-specific AI agents","Executive decision support layer"] },
];

export default function OperatingModelPage() {
  return (
    <>
      <Nav />
      <div className="jm1-ticker"><div className="jm1-ticker-inner">{["Publishing","Financial Planning","Community Impact","Media Production","AI Orchestration","Microsoft-Native","GPO Registered","SAM.gov Active","Legacy by Design","Columbus, OH","Publishing","Financial Planning","Community Impact","Media Production","AI Orchestration","Microsoft-Native","GPO Registered","SAM.gov Active","Legacy by Design","Columbus, OH"].map((t,i)=><span key={i}>{i%2===0?<b>{t}</b>:t}{" · "}</span>)}</div></div>

      <section className="jm1-sec" style={{ background:"#fff",borderBottom:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="jm1-kicker">Operating Model</div>
        <h1 className="jm1-sh" style={{ fontSize:"clamp(48px,6vw,80px)",lineHeight:1.03,letterSpacing:"-0.02em",marginBottom:"1rem" }}>The architecture<br /><em>that runs it all.</em></h1>
        <p className="jm1-bridge" style={{ marginBottom:"0",marginTop:"0.5rem" }}>We built the infrastructure because what people build should last — and lasting things require systems built to carry them.</p>
        <p style={{ fontSize:"15px",color:"#4A5568",lineHeight:1.8,maxWidth:"580px",marginTop:"1rem" }}>J Merrill One operates on a three-layer infrastructure. Every division inherits this model — it is not rebuilt per brand. This creates enterprise-grade capability at a fraction of the typical cost and complexity.</p>
      </section>

      <section className="jm1-sec" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="jm1-kicker">Infrastructure Layers</div>
        <h2 className="jm1-sh">Three layers.<br /><em>One unified system.</em></h2>
        <p className="jm1-sp">The three pillars give every division intelligence, governance, and automation that would otherwise require separate enterprise-grade investments.</p>
        <div className="jm1-op-grid">
          {opCards.map((c,i)=>(
            <div key={c.icon} className="jm1-op-card">
              <div style={{ display:"flex",alignItems:"center",gap:"1rem" }}>
                <div className="jm1-op-icon">{c.icon}</div>
                <div><div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase",marginBottom:"4px" }}>Layer 0{i+1}</div><div className="jm1-op-name" style={{ whiteSpace:"pre-line" }}>{c.name}</div></div>
              </div>
              <p className="jm1-op-desc">{c.desc}</p>
              <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem" }}>{c.items.map(item=><div key={item} style={{ display:"flex",alignItems:"center",gap:"0.6rem",fontSize:"12px",color:"#4A5568" }}><span className="jm1-op-dot" />{item}</div>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="jm1-sec" style={{ background:"#fff",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="jm1-kicker">Governance Model</div>
        <h2 className="jm1-sh">Centrally governed.<br /><em>Divisionally executed.</em></h2>
        <p className="jm1-sp">JM1 controls what creates leverage across all divisions. Divisions control what creates conversion within their domain.</p>
        <div className="opmodel-gov-grid">
          <div style={{ background:"#002C54",padding:"3rem" }}>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase",marginBottom:"1.5rem" }}>JM1 Controls</div>
            {jm1Controls.map(item=><div key={item} style={{ display:"flex",alignItems:"flex-start",gap:"0.75rem",marginBottom:"0.85rem",fontSize:"13px",color:"rgba(163,196,220,0.85)" }}><span style={{ width:"5px",height:"5px",borderRadius:"50%",background:"#F4B400",flexShrink:0,marginTop:"5px" }} />{item}</div>)}
          </div>
          <div style={{ background:"#F7F8FA",border:"1px solid rgba(0,44,84,0.09)",padding:"3rem" }}>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase",marginBottom:"1.5rem" }}>Divisions Control</div>
            {divControls.map(item=><div key={item} style={{ display:"flex",alignItems:"flex-start",gap:"0.75rem",marginBottom:"0.85rem",fontSize:"13px",color:"#4A5568" }}><span style={{ width:"5px",height:"5px",borderRadius:"50%",background:"#002C54",flexShrink:0,marginTop:"5px" }} />{item}</div>)}
          </div>
        </div>
      </section>

      <section className="jm1-sec" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="jm1-kicker">Technology Stack</div>
        <h2 className="jm1-sh">Microsoft-native.<br /><em>Azure-powered.</em></h2>
        <p className="jm1-sp">The JM1 technology stack is locked at the parent level per Canon v1 Section 09.</p>
        <div className="opmodel-tech-grid">
          {techStack.map(([tag,color,label,val])=>(
            <div key={label} style={{ background:"#fff",border:"1px solid rgba(0,44,84,0.09)",padding:"1.25rem 1.5rem",display:"flex",alignItems:"center",gap:"1rem" }}>
              <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"8px",letterSpacing:"0.1em",textTransform:"uppercase",padding:"2px 8px",border:`0.5px solid ${color}`,color:color as string,flexShrink:0,opacity:0.85 }}>{tag}</span>
              <div><span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.1em",color:"#999",textTransform:"uppercase",display:"block" }}>{label}</span><span style={{ fontSize:"13px",color:"#4A5568",fontWeight:500 }}>{val}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="jm1-sec jm1-why" style={{ paddingTop:"5.5rem" }}>
        <div className="jm1-kicker" style={{ color:"#F4B400" }}><span style={{ display:"inline-block",width:"18px",height:"1px",background:"#F4B400" }} />AI Roadmap</div>
        <h2 className="jm1-sh" style={{ color:"#fff" }}>Leading the industry.<br /><em>By design.</em></h2>
        <p style={{ fontSize:"15px",color:"rgba(163,196,220,0.8)",lineHeight:1.8,maxWidth:"580px",marginBottom:"3.5rem" }}>J Merrill One is not adopting AI tools. We are building an AI-orchestrated enterprise — where every workflow, every division, and every client interaction is powered by intelligent automation.</p>
        <div className="opmodel-ai-grid">
          {aiPhases.map(p=>(
            <div key={p.phase} style={{ background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(163,196,220,0.1)",padding:"2.5rem",display:"flex",flexDirection:"column",gap:"1rem" }}>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase" }}>{p.phase}</div>
              <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:"21px",color:"#fff" }}>{p.title}</div>
              <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem" }}>{p.items.map(item=><div key={item} style={{ display:"flex",alignItems:"flex-start",gap:"0.6rem",fontSize:"12px",color:"rgba(163,196,220,0.7)" }}><span style={{ width:"4px",height:"4px",borderRadius:"50%",background:"#F4B400",flexShrink:0,marginTop:"5px" }} />{item}</div>)}</div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
