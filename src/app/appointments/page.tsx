import Image from "next/image";
import Link from "next/link";

export default function AppointmentsPage() {
  const bookingLinks = [
    {
      name: "Publishing",
      url: "https://outlook.office.com/book/JMerrillPublishing@jmerrill.one/?ismsaljsauthenabled",
      color:
        "bg-blue-600 hover:bg-blue-500 border-2 border-blue-400 hover:border-blue-300 focus:ring-4 focus:ring-blue-200 dark:bg-blue-500 dark:hover:bg-blue-400 dark:border-blue-300 dark:hover:border-blue-200 dark:focus:ring-blue-700"
    },
    {
      name: "Financial",
      url: "https://outlook.office.com/book/JMerrillFinancial@jmerrill.one/?ismsaljsauthenabled",
      color:
        "bg-teal-600 hover:bg-teal-500 border-2 border-yellow-400 hover:border-yellow-300 focus:ring-4 focus:ring-yellow-200 dark:bg-teal-500 dark:hover:bg-teal-400 dark:border-yellow-300 dark:hover:border-yellow-200 dark:focus:ring-yellow-600"
    },
    {
      name: "Foundation",
      url: "https://outlook.office.com/book/JMerrillFoundation@jmerrill.one/?ismsaljsauthenabled",
      color:
        "bg-purple-700 hover:bg-purple-600 border-2 border-purple-300 hover:border-purple-200 focus:ring-4 focus:ring-purple-200 dark:bg-purple-600 dark:hover:bg-purple-500 dark:border-purple-200 dark:hover:border-purple-100 dark:focus:ring-purple-700"
    },
    {
      name: "Jackie",
      url: "https://outlook.office.com/book/JackieSmithJrMrJMerrill@jmerrill.one/?ismsaljsauthenabled",
      color:
        "bg-gray-800 hover:bg-gray-700 border-2 border-yellow-500 hover:border-yellow-400 focus:ring-4 focus:ring-yellow-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-yellow-400 dark:hover:border-yellow-300 dark:focus:ring-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#002C54] text-center flex flex-col justify-between">
      <div className="max-w-4xl mx-auto py-10 px-4 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Book a Consultation
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          Choose your division below to schedule directly through Microsoft Bookings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {bookingLinks.map(({ name, url, color }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block px-6 py-4 text-white font-semibold rounded-xl shadow-md transform transition ${color} hover:shadow-lg hover:scale-105 focus:outline-none`}
            >
              {name} Bookings
            </a>
          ))}
        </div>

        <p className="text-gray-500 dark:text-gray-300">
          Need help choosing a service?{" "}
          <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
            Contact us
          </a>{" "}
          or call{" "}
          <a href="tel:16149656057" className="font-semibold text-gray-800 dark:text-gray-200">
            (614) 965-6057
          </a>.
        </p>
      </div>

{/* JM1 Mission Footer */}
<footer className="py-8 bg-gray-50 dark:bg-[#001B36]">
  <div className="flex flex-col items-center space-y-4">
    {/* Logo links home */}
    <Link href="/" passHref>
      <Image
        src="/logo.jpg"
        alt="J Merrill One Logo"
        width={120}
        height={120}
        className="object-contain cursor-pointer"
        priority
      />
    </Link>

    {/* Mission tagline links to About page */}
    <Link
      href="/about"
      className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition"
    >
      <span className="font-semibold">J Merrill One</span> — Empowering
      purpose-driven people to help themselves: publishing their voice,
      planning their legacy, and strengthening their community.
    </Link>
  </div>
</footer>
    </div>
  );
}