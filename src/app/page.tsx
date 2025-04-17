import Image from "next/image";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Welcome to J Merrill One",
  description: "Your hub for Publishing, Financial Services, and Community Development.",
  path: "/",
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      {/* Logo Section */}
      <div className="w-full flex justify-center mt-10">
        <Image
          src="/logo.jpg"
          alt="J Merrill Logo"
          width={200}
          height={200}
          className="rounded-full border-4 border-primary"
        />
      </div>

      {/* Main Content */}
      <main className="text-center mt-6 p-4">
        <h1 className="text-4xl font-bold text-primary">Welcome to J Merrill One</h1>
        <p className="mt-2 text-lg text-secondary">
          Your hub for Publishing, Financial Services, and Community Development.
        </p>
      </main>

      {/* Services Section */}
      <section className="mt-10 w-full max-w-6xl px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a
            href="https://jmerrill.pub"
            className="p-6 bg-accent border-2 border-publishing rounded-xl shadow transition hover:ring-2 hover:ring-publishing text-center"
          >
            <h2 className="text-2xl font-semibold text-publishing">Publishing</h2>
            <p className="text-foreground mt-2">
              Empowering authors with full-service publishing solutions.
            </p>
          </a>
          <a
            href="/foundation"
            className="p-6 bg-accent border-2 border-foundation rounded-xl shadow transition hover:ring-2 hover:ring-foundation text-center"
          >
            <h2 className="text-2xl font-semibold text-foundation">Foundation</h2>
            <p className="text-foreground mt-2">
              Supporting communities through outreach and education.
            </p>
          </a>
          <a
            href="https://jmerrill.financial"
            className="p-6 bg-accent border-2 border-financial rounded-xl shadow transition hover:ring-2 hover:ring-financial text-center"
          >
            <h2 className="text-2xl font-semibold text-financial">Financial</h2>
            <p className="text-foreground mt-2">
              Providing financial services, insurance, and legacy planning.
            </p>
          </a>
          <a
            href="/appointments"
            className="p-6 bg-accent border-2 border-gray-300 rounded-xl shadow transition hover:ring-2 hover:ring-primary text-center"
          >
            <h2 className="text-2xl font-semibold text-primary">Appointments</h2>
            <p className="text-foreground mt-2">
              Book consultations for publishing, financial, or nonprofit services.
            </p>
          </a>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="mt-12 text-center w-full max-w-4xl px-6">
        <h2 className="text-2xl font-semibold text-primary">Coming Soon</h2>
        <p className="text-productions mt-2">
          <a href="/productions" className="underline hover:text-productions/80 transition">
            J Merrill Productions
          </a>{" "}
          – Expanding into media and immersive content.
        </p>
      </section>

      {/* Contact Section */}
      <section className="mt-12 text-center w-full max-w-4xl px-6 py-6 rounded-xl shadow bg-card text-body">
        <h2 className="text-2xl font-semibold text-primary">Contact Us</h2>
        <p className="mt-2">J Merrill One</p>
        <p className="text-subtle">📍 434 Hillpine Dr, Columbus, OH 43207-5010</p>
        <p className="text-subtle">📞 Main Line: (614) 965-6057</p>
        <p className="text-subtle">
          ✉ Email: {" "}
          <a href="mailto:info@jmerrill.one" className="text-primary underline">
            info@jmerrill.one
          </a>
        </p>
      </section>
    </div>
  );
}