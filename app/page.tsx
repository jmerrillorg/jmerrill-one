/**
 * JM1 Homepage
 * Section order: Canon v1 Section 03 — Homepage Architecture (LOCKED)
 * Governance: No section additions without full architectural review (Canon v1 Section 10)
 */
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StoryBlock from "@/components/StoryBlock";
import {
  HeroSection,
  TickerSection,
  WhySection,
  BridgeSection,
  SystemDefSection,
  DivisionsSection,
  StatementSection,
  FlowSection,
  OperatingModelSection,
  EntrySection,
  AuthoritySection,
} from "@/components/sections/HomeSections";

export default function Home() {
  return (
    <>
      {/* 01 */ } <Nav />
      {/* 02 */ } <HeroSection />
      {/* 03 */ } <TickerSection />
      {/* 04 */ } <WhySection />
      {/* 05 */ } <BridgeSection />
                  <StoryBlock
                    quote="After 45 years of serving others, I finally have a plan that protects my family. One conversation. One week. Everything organized."
                    attribution="Estate planning client, Columbus OH"
                    ctaText="Protect your family →"
                    ctaHref="https://jmerrill.financial"
                  />
      {/* 06 */ } <SystemDefSection />
      {/* 07 */ } <DivisionsSection />
      {/* 08 */ } <StatementSection />
      {/* 09 */ } <FlowSection />
      {/* 10 */ } <OperatingModelSection />
      {/* 11 */ } <EntrySection />
      {/* 12 */ } <AuthoritySection />
      {/* 13+14 */ } <Footer />
    </>
  );
}
