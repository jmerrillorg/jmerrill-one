/**
 * JM1 Homepage
 * Section order: Canon v1 Section 03 — Homepage Architecture (LOCKED)
 * Governance: No section additions without full architectural review (Canon v1 Section 10)
 */
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
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
