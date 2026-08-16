import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { DivisionsSection, EntrySection } from "@/components/sections/HomeSections";

export const metadata: Metadata = {
  title: "Divisions — J Merrill One",
  description: "Explore the four J Merrill divisions serving publishing, financial, foundation, and production needs.",
};

export default function DivisionsPage() {
  return (
    <>
      <Nav />
      <DivisionsSection />
      <EntrySection />
      <Footer />
    </>
  );
}
