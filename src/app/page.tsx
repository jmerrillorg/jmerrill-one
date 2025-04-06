import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900">
      {/* Logo Section */}
      <div className="w-full flex justify-center mt-10">
        <Image src="/logo.jpg" alt="J Merrill Logo" width={200} height={200} />
      </div>

      {/* Main Content */}
      <main className="text-center mt-6 p-4">
        <h1 className="text-4xl font-bold">Welcome to J Merrill One</h1>
        <p className="mt-2 text-lg text-gray-700">Your hub for Publishing, Financial Services, and Community Development.</p>
      </main>

      {/* Services Section */}
      <section className="mt-8 w-full max-w-4xl px-6">
        <div className="grid md:grid-cols-3 gap-6">
          <a href="https://jmerrill.pub" className="p-6 bg-white shadow rounded-lg text-center hover:shadow-lg">
            <h2 className="text-2xl font-semibold">Publishing</h2>
            <p className="text-gray-600 mt-2">Empowering authors with full-service publishing solutions.</p>
          </a>
          <a href="https://jmerrill.org" className="p-6 bg-white shadow rounded-lg text-center hover:shadow-lg">
            <h2 className="text-2xl font-semibold">Foundation</h2>
            <p className="text-gray-600 mt-2">Supporting communities through outreach and education.</p>
          </a>
          <a href="https://jmerrill.financial" className="p-6 bg-white shadow rounded-lg text-center hover:shadow-lg">
            <h2 className="text-2xl font-semibold">Financial</h2>
            <p className="text-gray-600 mt-2">Providing financial services, insurance, and legacy planning.</p>
          </a>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="mt-10 text-center w-full max-w-4xl px-6">
        <h2 className="text-2xl font-semibold">Coming Soon</h2>
        <p className="text-gray-600 mt-2">J Merrill Productions - Expanding into media and immersive content.</p>
      </section>

      {/* Contact Section */}
      <section className="mt-10 text-center w-full max-w-4xl px-6 bg-gray-200 py-6 rounded-lg">
        <h2 className="text-2xl font-semibold">Contact Us</h2>
        <p className="mt-2">J Merrill One</p>
        <p>📍 434 Hillpine Dr, Columbus, OH 43207-5010</p>
        <p>📞 Main Line: (614) 965-6057</p>
        <p>✉ Email: <a href="mailto:info@jmerrill.one" className="text-blue-600">info@jmerrill.one</a></p>
      </section>

      </div>
  );
}
