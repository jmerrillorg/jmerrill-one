import Link from "next/link";
import HeroLogo from '@/components/shared/HeroLogo'

export default function FoundationPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white text-[#111111]">
      <div className="max-w-6xl mx-auto text-center">
        <HeroLogo />
        <h1 className="text-4xl font-bold mt-4 text-[#93329E]">J Merrill Foundation, Inc.</h1>
        <p className="mt-2 text-lg text-[#CBAACB]">
          Purpose. Wisdom. Empowerment.
        </p>
      </div>

      <div className="mt-10 max-w-6xl mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="border border-[#A3C4DC] p-6 rounded-lg shadow-sm bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2 text-[#93329E]">Trailblazing Impact</h2>
          <p className="text-sm text-[#CBAACB]">
            We bridge mission with innovation—empowering communities through technology, equity-driven solutions, and measurable transformation.
          </p>
        </div>

        <div className="border border-[#A3C4DC] p-6 rounded-lg shadow-sm bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2 text-[#93329E]">Innovation Labs</h2>
          <p className="text-sm text-[#CBAACB]">
            Our Labs section pilots bold ideas—from AI storytelling and blockchain-backed giving to live dashboards and immersive education tools.
          </p>
        </div>

        <div className="border border-[#A3C4DC] p-6 rounded-lg shadow-sm bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2 text-[#93329E]">Mission-Aligned Services</h2>
          <p className="text-sm text-[#CBAACB]">
            We offer programs, partnerships, and platforms that advance social good. Nonprofit consultations, tech capacity building, and funding pathways included.
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/appointments?brand=foundation"
          className="inline-block px-6 py-3 text-white bg-[#93329E] rounded-lg font-medium hover:bg-[#7A2783] transition"
        >
          Book a Foundation Services Appointment
        </Link>
      </div>
    </div>
  );
}