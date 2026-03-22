import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jackie Smith Jr. — J Merrill One",
  description: "Founder & CEO, J Merrill One. Enterprise platform spanning publishing, financial strategy, community impact, and media production.",
  openGraph: {
    title: "Jackie Smith Jr. — J Merrill One",
    description: "Founder & CEO · J Merrill One",
    url: "https://jmerrill.one/card/jackie",
    siteName: "J Merrill One",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Jackie Smith Jr.",
    "theme-color": "#002C54",
  },
};

export default function JackieCard() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          min-height: 100dvh;
          background: #002C54;
          font-family: 'Syne', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        .card-root {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem 1.5rem;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(163,196,220,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 90% 90%, rgba(244,180,0,0.05) 0%, transparent 60%),
            #002C54;
        }

        .card-wrap {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
        }

        .card-accent {
          height: 3px;
          background: linear-gradient(90deg, #F4B400 0%, #A3C4DC 60%, transparent 100%);
        }

        .card-main {
          background: #fff;
          padding: 2.5rem 2.25rem 2rem;
          position: relative;
          overflow: hidden;
        }
        .card-main::before {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 120px; height: 120px;
          background: radial-gradient(ellipse at top right, rgba(163,196,220,0.1), transparent 70%);
          pointer-events: none;
        }

        /* ── Eyebrow ── */
        .card-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          color: #F4B400;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }
        .eyebrow-line { width: 22px; height: 1px; background: #F4B400; flex-shrink: 0; }

        /* ── Name ── */
        .card-name {
          font-family: 'Instrument Serif', Georgia, serif;
          font-size: clamp(34px, 8.5vw, 50px);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #05111F;
          overflow: visible;
          margin-bottom: 0.2rem;
        }
        .name-suffix {
          font-size: 0.5em;
          color: #A3C4DC;
          font-style: italic;
          vertical-align: super;
          margin-left: 0.1em;
        }
        .card-title-line {
          font-family: 'DM Mono', monospace;
          font-size: 9.5px;
          letter-spacing: 0.18em;
          color: #4A5568;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .card-company {
          font-family: 'Instrument Serif', serif;
          font-size: 17px;
          color: #002C54;
          font-style: italic;
          margin-bottom: 1.75rem;
        }

        .card-rule { height: 1px; background: rgba(0,44,84,0.09); margin-bottom: 1.5rem; }

        /* ── Division tiles ── */
        .card-divisions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.45rem;
          margin-bottom: 1.75rem;
        }
        .card-div {
          padding: 0.55rem 0.75rem;
          border: 0.5px solid rgba(0,44,84,0.1);
          background: #F7F8FA;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .div-label {
          font-family: 'DM Mono', monospace;
          font-size: 7px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 500;
        }
        .div-name {
          font-family: 'Instrument Serif', serif;
          font-size: 12.5px;
          color: #05111F;
          line-height: 1.2;
        }

        /* ── Contact rows ── */
        .card-contacts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .contact-row {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          text-decoration: none;
          color: #4A5568;
          font-size: 13px;
          line-height: 1;
          transition: color 0.15s;
        }
        .contact-row:hover { color: #002C54; }
        .contact-icon {
          width: 28px; height: 28px;
          border: 0.5px solid rgba(0,44,84,0.14);
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .contact-icon svg { width: 12px; height: 12px; }

        /* ── Social row ── */
        .card-rule-sm { height: 1px; background: rgba(0,44,84,0.09); margin-bottom: 1.25rem; }
        .card-social {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0;
        }
        .social-label {
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.16em;
          color: #BDC5CE;
          text-transform: uppercase;
          flex-shrink: 0;
          margin-right: 0.25rem;
        }
        .social-link {
          width: 32px; height: 32px;
          border: 0.5px solid rgba(0,44,84,0.12);
          background: #F7F8FA;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .social-link:hover { background: #002C54; border-color: #002C54; }
        .social-link:hover svg path,
        .social-link:hover svg rect,
        .social-link:hover svg circle { fill: #fff !important; }
        .social-link svg { width: 14px; height: 14px; }

        /* ── Add to Contacts CTA ── */
        .card-vcf {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          background: #002C54;
          color: #fff;
          text-decoration: none;
          padding: 0.9rem 1.5rem;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: background 0.15s;
          border-top: none;
          margin-top: 1.5rem;
        }
        .card-vcf:hover { background: #05111F; }
        .card-vcf svg { width: 14px; height: 14px; flex-shrink: 0; }

        /* ── Footer ── */
        .card-footer {
          background: #05111F;
          padding: 1.1rem 2.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .footer-wm {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #fff;
        }
        .footer-wm span { color: #F4B400; }
        .footer-url {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          color: rgba(163,196,220,0.45);
          text-decoration: none;
        }

        /* ── Tag ── */
        .card-tag {
          padding: 0.85rem 2.25rem 0;
          text-align: center;
          font-family: 'DM Mono', monospace;
          font-size: 8.5px;
          letter-spacing: 0.12em;
          color: rgba(163,196,220,0.28);
          text-transform: uppercase;
          line-height: 1.6;
        }

        @media (max-width: 460px) {
          .card-main { padding: 2rem 1.75rem 1.75rem; }
          .card-footer { padding: 1rem 1.75rem; }
          .card-tag { padding: 0.75rem 1.75rem 0; }
        }
      `}</style>

      <div className="card-root">
        <div className="card-wrap">
          <div className="card-accent" />
          <div className="card-main">

            {/* Eyebrow */}
            <div className="card-eyebrow">
              <div className="eyebrow-line" />
              Founder &amp; Chief Executive Officer
            </div>

            {/* Name */}
            <h1 className="card-name">
              Jackie Smith<span className="name-suffix">Jr.</span>
            </h1>
            <div className="card-title-line">J Merrill One</div>
            <div className="card-company">One system. Four divisions.</div>

            <div className="card-rule" />

            {/* Divisions */}
            <div className="card-divisions">
              {[
                { label:"Publishing",  name:"J Merrill Publishing",  color:"#1E90FF" },
                { label:"Financial",   name:"J Merrill Financial",   color:"#007F5C" },
                { label:"Foundation",  name:"J Merrill Foundation",  color:"#93329E" },
                { label:"Productions", name:"J Merrill Productions", color:"#FF6F00" },
              ].map(d => (
                <div key={d.label} className="card-div" style={{ borderTop:`2px solid ${d.color}` }}>
                  <span className="div-label" style={{ color:d.color }}>{d.label}</span>
                  <span className="div-name">{d.name}</span>
                </div>
              ))}
            </div>

            {/* Contact rows */}
            <div className="card-contacts">
              <a href="https://jmerrill.one" className="contact-row">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#002C54" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3c-2 3-3 5.7-3 9s1 6 3 9m0-18c2 3 3 5.7 3 9s-1 6-3 9M3 12h18"/></svg>
                </div>
                jmerrill.one
              </a>
              <a href="mailto:jackie@jmerrill.one" className="contact-row">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#002C54" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>
                </div>
                jackie@jmerrill.one
              </a>
              <a href="tel:+16149656057" className="contact-row">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#002C54" strokeWidth="1.5"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
                </div>
                614.965.6057
              </a>
              <a href="https://jmerrill.one/contact" className="contact-row">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#002C54" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="1"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                </div>
                Schedule a conversation
              </a>
            </div>

            {/* Social */}
            <div className="card-rule-sm" />
            <div className="card-social">
              <span className="social-label">Follow</span>

              {/* LinkedIn */}
              <a href="https://www.linkedin.com/company/jmerrillone" className="social-link" title="LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="#002C54"/><rect x="2" y="9" width="4" height="12" fill="#002C54"/><circle cx="4" cy="4" r="2" fill="#002C54"/></svg>
              </a>

              {/* Instagram */}
              <a href="https://www.instagram.com/jmerrillone/" className="social-link" title="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" fill="#002C54"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="#fff"/><circle cx="12" cy="12" r="3" fill="#002C54"/><circle cx="17.5" cy="6.5" r="1" fill="#fff"/></svg>
              </a>

              {/* Facebook */}
              <a href="https://www.facebook.com/JMerrillOne" className="social-link" title="Facebook" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="#002C54"/></svg>
              </a>
            </div>

            {/* Add to Contacts — vCard */}
            <a href="/card/jackie-contact.vcf" download="Jackie-Smith-Jr-JM1.vcf" className="card-vcf">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4" strokeWidth="1.8"/></svg>
              Add to Contacts
            </a>

          </div>

          {/* Footer */}
          <div className="card-footer">
            <div className="footer-wm">J Merrill <span>One</span></div>
            <a href="https://jmerrill.one" className="footer-url">jmerrill.one</a>
          </div>

          <div className="card-tag">
            What people build should last<br />
            Headquartered in Columbus, OH
          </div>
        </div>
      </div>
    </>
  );
}
