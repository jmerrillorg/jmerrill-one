import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { divisions } from "@/lib/tokens";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why We Exist — J Merrill One",
  description: "What people build should last. The principled belief that drives J Merrill One.",
};

const darkAccents: Record<string,string> = { pub:"#4DAEFF", fin:"#2EC98A", fnd:"#C87FD4", pro:"#FF9140" };

export default function WhyWeExistPage() {
  return (
    <>
      <Nav />
      <div className="jm1-ticker">
        <div className="jm1-ticker-inner">
          {["What you build should last","Ideas deserve to outlive the moment","Families deserve protection","Communities deserve more","Messages deserve to reach further","Legacy is by design, not by chance",
            "What you build should last","Ideas deserve to outlive the moment","Families deserve protection","Communities deserve more","Messages deserve to reach further","Legacy is by design, not by chance"
          ].map((t,i)=><span key={i}>{i%2===0?<b>{t}</b>:t}{" · "}</span>)}
        </div>
      </div>

      {/* Hero */}
      <section className="jm1-why" style={{ paddingBottom:"5.5rem" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.24em",color:"#F4B400",textTransform:"uppercase",marginBottom:"1.5rem" }}>
          <span style={{ display:"inline-block",width:"18px",height:"1px",background:"#F4B400" }} />Why We Exist
        </div>
        <h1 className="jm1-why-h">What people build<br /><em>should last.</em></h1>
        <p className="jm1-why-stmt">
          Ideas. Families. Wealth. Communities. Too often, they don't.<br />
          J Merrill One exists to change that — by building the system that structures, protects, and carries them forward.
        </p>
      </section>

      {/* The Belief */}
      <section className="jm1-sec" style={{ background:"#fff",borderTop:"1px solid rgba(0,44,84,0.09)" }}>
        <div className="why-belief-grid">
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.24em",color:"#F4B400",textTransform:"uppercase",marginBottom:"1rem" }}>
              <span style={{ display:"inline-block",width:"18px",height:"1px",background:"#F4B400" }} />The Belief
            </div>
            <h2 className="jm1-sh">A system advanced enough<br /><em>to serve people better<br />than anyone else.</em></h2>
            <p style={{ fontSize:"15px",color:"#4A5568",lineHeight:1.8,marginTop:"1rem" }}>
              J Merrill One was built on a simple truth: the people who create, earn, build, and give deserve a system that protects what they're working toward — not just while they're working, but for the generations that follow.
            </p>
            <p style={{ fontSize:"15px",color:"#4A5568",lineHeight:1.8,marginTop:"1rem" }}>
              We don't begin with architecture. We begin with the people the architecture is for.
            </p>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
            {[["125+","Works published and distributed","Ideas that now exist permanently in the world."],["4","Integrated operating divisions","Each one serving a distinct human need."],["01","Unified operating system","One architecture behind every interaction."]].map(([val,label,sub])=>(
              <div key={label} style={{ border:"1px solid rgba(0,44,84,0.09)",padding:"1.5rem 2rem",display:"flex",gap:"1.5rem",alignItems:"flex-start",background:"#fff" }}>
                <span style={{ fontFamily:"'Instrument Serif',serif",fontSize:"52px",color:"#F4B400",lineHeight:1,flexShrink:0 }}>{val}</span>
                <div><div style={{ fontSize:"14px",fontWeight:600,color:"#05111F",marginBottom:"4px" }}>{label}</div><div style={{ fontSize:"12px",color:"#4A5568",fontStyle:"italic" }}>{sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Expressions */}
      <section className="jm1-sec jm1-why" style={{ paddingTop:"5.5rem" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.6rem",fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.24em",color:"#F4B400",textTransform:"uppercase",marginBottom:"1rem" }}>
          <span style={{ display:"inline-block",width:"18px",height:"1px",background:"#F4B400" }} />Four Expressions of One Belief
        </div>
        <h2 className="jm1-sh" style={{ color:"#fff",marginBottom:"0.75rem" }}>The same WHY.<br /><span style={{ fontStyle:"italic",color:"#F4B400" }}>Four different domains.</span></h2>
        <p style={{ fontSize:"14px",color:"rgba(163,196,220,0.75)",lineHeight:1.75,maxWidth:"500px",marginBottom:"3.5rem" }}>Each division is a different expression of the same foundational belief. The WHY never changes — only the domain it serves.</p>
        <div style={{ display:"flex",flexDirection:"column",gap:"1px",background:"rgba(163,196,220,0.08)" }}>
          {divisions.map(d=>(
            <div key={d.id} className="why-expression-row" style={{ background:"rgba(255,255,255,0.03)",padding:"2.5rem",borderBottom:"1px solid rgba(163,196,220,0.06)" }}>
              <div>
                <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.18em",textTransform:"uppercase",color:darkAccents[d.id] }}>{d.label}</span>
                <div style={{ width:"2rem",height:"1px",background:d.accent,margin:"0.5rem 0" }} />
                <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:"18px",color:"#fff" }}>{d.fullName}</div>
              </div>
              <div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase",marginBottom:"0.75rem" }}>The WHY</div>
                <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:"19px",color:"#fff",fontStyle:"italic",lineHeight:1.35 }}>{d.why}</div>
              </div>
              <div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.14em",color:"#F4B400",textTransform:"uppercase",marginBottom:"0.75rem" }}>What It Protects</div>
                <p style={{ fontSize:"13px",color:"rgba(255,255,255,0.65)",lineHeight:1.7 }}>{d.humanBody}</p>
                <a href={`https://${d.domain}`} style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.12em",color:"#BDC5CE",textTransform:"uppercase",marginTop:"1rem",display:"block" }}>{d.domain} →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Statement */}
      <div className="jm1-statement">
        <div>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:"9px",letterSpacing:"0.22em",color:"rgba(163,196,220,0.5)",textTransform:"uppercase",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:"0.6rem" }}>
            <span style={{ display:"inline-block",width:"16px",height:"1px",background:"#F4B400" }} />Enterprise Position
          </div>
          <div className="jm1-st-text">We are not building a company.<br />We are building <em>the infrastructure<br />for generational legacy.</em></div>
        </div>
        <div>
          <p style={{ fontSize:"13px",color:"rgba(163,196,220,0.65)",lineHeight:1.75,maxWidth:"280px" }}>Every system, every workflow, and every tool at J Merrill One is engineered to protect what people build — and carry it forward for the people they love.</p>
          <a href="/ecosystem" className="jm1-btn-ghost" style={{ marginTop:"1.5rem",display:"inline-block",color:"rgba(163,196,220,0.8)",borderColor:"rgba(163,196,220,0.3)" }}>Explore the Ecosystem →</a>
        </div>
      </div>
      <Footer />
    </>
  );
}
