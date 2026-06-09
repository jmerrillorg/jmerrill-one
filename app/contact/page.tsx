import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact — J Merrill One",
  description: "Tell J Merrill One what you're trying to move forward, and we'll route you to the right division.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
