import Link from "next/link";
import HeroLogo from '@/components/shared/HeroLogo'

export default function FinancialPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white text-[#111111]">
      <div className="max-w-6xl mx-auto text-center">
        <HeroLogo />
        <h1 className="text-4xl font-bold mt-4 text-[#007F5C]">J Merrill Financial, LLC.</h1>
        <p className="mt-2 text-lg text-[#004D40]">
          Helping You Plan Ahead with Confidence
        </p>
      </div>

      <div className="mt-10 max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border border-[#F4B400] p-6 rounded-lg shadow-sm bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2 text-[#007F5C]">Advance Planning</h2>
          <p className="text-sm text-[#004D40]">
            Pre-need funeral planning, final expense strategies, and document prep to help your family navigate life’s most sensitive moments with confidence.
          </p>
        </div>

        <div className="border border-[#F4B400] p-6 rounded-lg shadow-sm bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2 text-[#007F5C]">Life Insurance</h2>
          <p className="text-sm text-[#004D40]">
            Term, whole life, and guaranteed products tailored to your goals and lifestyle. Protection that grows with you.
          </p>
        </div>

        <div className="border border-[#F4B400] p-6 rounded-lg shadow-sm bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2 text-[#007F5C]">Health Insurance</h2>
          <p className="text-sm text-[#004D40]">
            Individual and family plans that support your physical well-being. Expert guidance through enrollment and eligibility.
          </p>
        </div>

        <div className="border border-[#F4B400] p-6 rounded-lg shadow-sm bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2 text-[#007F5C]">Dental, Vision & Supplemental</h2>
          <p className="text-sm text-[#004D40]">
            Add-on protection that fills the gaps. Affordable options for dental, vision, critical illness, accident, and more.
          </p>
        </div>

        <div className="border border-[#F4B400] p-6 rounded-lg shadow-sm bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2 text-[#007F5C]">Insurance Reviews</h2>
          <p className="text-sm text-[#004D40]">
            Already covered? Let’s review your policies to make sure you’re not overpaying or underinsured.
          </p>
        </div>

        <div className="border border-[#F4B400] p-6 rounded-lg shadow-sm bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2 text-[#007F5C]">Workshops & Community Events</h2>
          <p className="text-sm text-[#004D40]">
            Education that empowers. We host free and low-cost workshops on advance planning, life insurance, and financial wellness.
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/appointments?brand=financial"
          className="inline-block px-6 py-3 text-white bg-[#007F5C] rounded-lg font-medium hover:bg-[#004D40] transition"
        >
          Book a Financial Services Appointment
        </Link>
      </div>
    </div>
  );
}