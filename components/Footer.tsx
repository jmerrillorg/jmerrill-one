import Link from "next/link";
import { canon } from "@/content/canon";

export default function Footer() {
  return (
    <>
      <div className="jm1-footer-sig">{canon.footerSig}</div>
      <footer className="jm1-footer">
        <div className="jm1-f-grid">
          <div>
            <div className="jm1-f-brand">
              J Merrill <span>One</span>
            </div>
            <p style={{ fontSize:"13px", color:"rgba(163,196,220,0.55)", lineHeight:1.75, maxWidth:"240px", whiteSpace:"pre-line" }}>
              {canon.footer.tagline}
            </p>
          </div>
          {canon.footer.cols.map((col) => (
            <div key={col.head}>
              <div className="jm1-f-ch">{col.head}</div>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"0.55rem" }}>
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={`/${href}`} className="jm1-f-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", letterSpacing:"0.08em", color:"rgba(163,196,220,0.25)" }}>
            {canon.footer.copy}
          </span>
          <div style={{ display:"flex", gap:"1.5rem" }}>
            {canon.footer.legal.map((item) => (
              <Link key={item} href="#" style={{ fontSize:"11px", color:"rgba(163,196,220,0.25)", textDecoration:"none" }}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
