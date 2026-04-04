import Link from "next/link";

interface Props {
  quote: string;
  attribution: string;
  ctaText: string;
  ctaHref: string;
}

export default function StoryBlock({ quote, attribution, ctaText, ctaHref }: Props) {
  return (
    <div style={{ background:"#002C54", padding:"5.5rem 2.5rem", borderTop:"1px solid rgba(163,196,220,0.1)" }}>
      <div style={{ maxWidth:"760px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"2rem" }}>
        <div style={{ width:"32px", height:"2px", background:"#F4B400" }} />
        <blockquote style={{ margin:0, fontFamily:"'Instrument Serif',serif", fontSize:"clamp(22px,2.8vw,36px)", fontWeight:400, lineHeight:1.4, fontStyle:"italic", color:"#fff" }}>
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(163,196,220,0.5)" }}>
          {attribution}
        </div>
        <Link href={ctaHref} style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#F4B400", textDecoration:"none", display:"inline-block" }}>
          {ctaText}
        </Link>
      </div>
    </div>
  );
}
