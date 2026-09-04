import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Privacy — J Merrill One",
  description: "Privacy practices for J Merrill One public websites, intake forms, and authorized platform integrations.",
};

const sections = [
  {
    title: "What We Collect",
    body: "J Merrill One collects only the information people choose to provide through our websites, intake forms, event forms, direct communications, and authorized account connections. That may include contact details, business context, messages, consent choices, and technical information needed to keep our services reliable and secure.",
  },
  {
    title: "How We Use Information",
    body: "We use information to respond to requests, route people to the right J Merrill company, operate approved communications, maintain records, protect our systems, and improve the clarity and usefulness of our public services.",
  },
  {
    title: "Authorized Integrations",
    body: "When a platform integration is connected, J Merrill One uses the minimum access needed for the approved business purpose. For social publishing integrations, access is limited to approved content execution, status readback, reconciliation, and operational audit evidence for authorized J Merrill destinations.",
  },
  {
    title: "Sharing",
    body: "We do not sell personal information. We share information only with the relevant J Merrill company, service providers operating under our direction, or where required to comply with law, protect rights, or complete a requested service.",
  },
  {
    title: "Retention And Choices",
    body: "We keep information only as long as needed for the reason it was collected, for operational records, or as required by law. People may contact us to request review, correction, or removal of information where applicable.",
  },
  {
    title: "Security",
    body: "Credential material and access tokens are not stored in public website code. Production secrets are held in governed secure storage, and public evidence should reference only secret names or metadata, never secret values.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="jm1-sec jm1-legal-hero">
          <div className="jm1-container">
            <div className="jm1-kicker">Privacy</div>
            <h1 className="jm1-sh">J Merrill One Privacy Notice</h1>
            <p className="jm1-sp">
              This notice explains how J Merrill One handles information across its public sites, intake
              paths, and authorized business integrations.
            </p>
            <p className="jm1-legal-updated">Last updated September 4, 2026</p>
          </div>
        </section>

        <section className="jm1-sec-sm">
          <div className="jm1-container jm1-legal-grid">
            {sections.map((section) => (
              <article className="jm1-legal-section" key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </article>
            ))}
            <article className="jm1-legal-section">
              <h2>Contact</h2>
              <p>
                Privacy questions may be sent through the J Merrill One contact path at{" "}
                <Link href="/contact">jmerrill.one/contact</Link>.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
