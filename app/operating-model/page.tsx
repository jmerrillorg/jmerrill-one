import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Work — J Merrill One",
  description: "See how J Merrill One stays consistent, accountable, and coordinated across every division for the people it serves.",
};

const opCards = [
  { icon:"01", label:"Layer 01", name:"Shared\nMemory", desc:"People should not have to repeat their story every time a need changes. JM1 keeps relationship context clear across its companies.", items:["Cleaner handoffs","Better follow-through","Less starting over","Clearer next steps"] },
  { icon:"02", label:"Layer 02", name:"Shared\nStandards", desc:"JM1 holds the common commitments for public language, service expectations, and accountability across every company.", items:["Human-first language","Consistent service expectations","Clear ownership","Practical accountability"] },
  { icon:"03", label:"Layer 03", name:"Shared\nNext Steps", desc:"When publishing, family planning, giving, or storytelling creates a natural next need, JM1 helps the conversation continue.", items:["Publishing to family protection","Financial to charitable giving","Foundation to storytelling","Productions to broader reach"] },
];

const jm1Controls = ["Shared public promise","Master color palette and typography","Homepage journey and primary navigation","Canonical copy and WHY language","Technology decisions for shared operations","AI usage standards for internal work","Relationship records and intake standards","Cross-company handoff rules"];
const divControls = ["Service catalogs and pricing","Division-specific copy and testimonials","Marketing execution within their domain","Client-facing workflows and intake","Division-specific content strategy","Appointment and consultation scheduling"];

const techStack = [
  ["Web","#1E90FF","Public website","Next.js"],["Cloud","#007F5C","Hosting","Azure Static Web Apps"],
  ["Records","#002C54","Relationship records","Microsoft Dataverse"],["CRM","#002C54","Client follow-up","Dynamics 365"],
  ["Finance","#002C54","Business records","Dynamics 365 Business Central"],["Work","#F4B400","Team workflows","Power Automate"],
  ["AI","#93329E","Internal assistance","Azure AI tools"],["Ops","#FF6F00","Scheduling","Microsoft Bookings"],
  ["Security","#4A5568","Identity","Microsoft Entra ID"],["Code","#002C54","Implementation","TypeScript"],
];

const aiPhases = [
  { phase:"Phase 1 — Active", title:"Public Trust", items:["Human-first website live","Division paths clear","Website requests received by the right team"] },
  { phase:"Phase 2 — Build", title:"Better Follow-Through", items:["Division sites aligned","Relationship records cleaner","Team handoffs more consistent"] },
  { phase:"Phase 3 — Later", title:"Internal Assistance", items:["AI supports staff decisions","AI remains behind the public experience","Human judgment stays accountable"] },
];

export default function OperatingModelPage() {
  return (
    <>
      <Nav />
      <div className="jm1-ticker"><div className="jm1-ticker-inner">{["Publishing","Financial Planning","Community Impact","Media Production","GPO Registered","SAM.gov Active","Legacy by Design","Columbus, OH","Publishing","Financial Planning","Community Impact","Media Production","GPO Registered","SAM.gov Active","Legacy by Design","Columbus, OH"].map((t,i)=><span key={i}>{i%2===0?<b>{t}</b>:t}{" · "}</span>)}</div></div>

      <section className="jm1-sec" style={{ background:"#fff",borderBottom:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="jm1-kicker">How We Work</div>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:"10px", letterSpacing:"0.18em", textTransform:"uppercase", color:"#F4B400", marginBottom:"1.5rem" }}>Built for people. Governed for permanence.</p>
        <p style={{ fontSize:"15px", color:"#4A5568", lineHeight:1.8, maxWidth:"680px", marginBottom:"2rem" }}>Every behind-the-scenes choice at J Merrill One exists because a person needed something to last. This page is for clients, partners, donors, and stakeholders who want to understand how JM1 stays coordinated.</p>
        <h1 className="jm1-sh" style={{ fontSize:"clamp(48px,6vw,80px)",lineHeight:1.03,letterSpacing:"-0.02em",marginBottom:"1rem" }}>How J Merrill One<br /><em>stays consistent.</em></h1>
        <p className="jm1-bridge" style={{ marginBottom:"0",marginTop:"0.5rem" }}>The way we work matters because people should not have to start over every time a need moves from one company to another.</p>
        <p style={{ fontSize:"15px",color:"#4A5568",lineHeight:1.8,maxWidth:"680px",marginTop:"1rem" }}>JM1 uses shared standards so communication, accountability, and follow-through stay aligned across publishing, financial planning, community impact, and productions. The technical pieces support that promise; they are not the reason the promise exists.</p>
      </section>

      <section className="jm1-sec" style={{ background:"#F7F8FA",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="jm1-kicker">How the Model Supports People</div>
        <h2 className="jm1-sh">Three shared commitments.<br /><em>One coordinated experience.</em></h2>
        <p className="jm1-sp">These commitments help JM1 stay organized, responsive, and consistent so the people we serve experience clearer handoffs and better follow-through.</p>
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
        <div className="jm1-kicker">Shared Accountability</div>
        <h2 className="jm1-sh">Centrally governed.<br /><em>Divisionally executed.</em></h2>
        <p className="jm1-sp">JM1 holds the shared standards so people encounter one level of care, clarity, and accountability. Each division still has room to serve its own audience well.</p>
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
        <div className="jm1-kicker">Partner Reference</div>
        <h2 className="jm1-sh">Tools behind<br /><em>the follow-through.</em></h2>
        <p className="jm1-sp">These tools matter because they help JM1 keep records cleaner, handoffs smoother, and follow-through more reliable across every division.</p>
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
        <div className="jm1-kicker" style={{ color:"#F4B400" }}><span style={{ display:"inline-block",width:"18px",height:"1px",background:"#F4B400" }} />Internal Assistance Roadmap</div>
        <h2 className="jm1-sh" style={{ color:"#fff" }}>Better support.<br /><em>Still human-led.</em></h2>
        <p style={{ fontSize:"15px",color:"rgba(163,196,220,0.8)",lineHeight:1.8,maxWidth:"620px",marginBottom:"3.5rem" }}>AI and automation may help JM1 improve follow-through, but they are not the public experience. They support faster handoffs, cleaner records, and better decision support while human responsibility stays in front.</p>
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
