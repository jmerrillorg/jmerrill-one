// src/app/appointments/page.tsx

import { AppointmentCard, AppointmentSection } from "@/components/AppointmentCard";

export default function AppointmentsPage() {
  const sections: AppointmentSection[] = [
    {
      title: "J Merrill Publishing, Inc.",
      description: "Schedule your publishing consultation or strategy session.",
      button: {
        label: "Book Publishing Appointment",
        url: "https://outlook.office.com/book/JMerrillPublishingInc@jmerrill.pub/"
      }
    },
    {
      title: "J Merrill Financial, LLC.",
      description: "Meet for insurance, pre-need, or policy review services.",
      button: {
        label: "Book Financial Appointment",
        url: "https://outlook.office.com/book/JMerrillFinancial@jmerrill.financial/"
      }
    },
    {
      title: "J Merrill Foundation, Inc.",
      description: "Connect about programs, partnerships, and community outreach.",
      button: {
        label: "Book Foundation Appointment",
        url: "https://outlook.office.com/book/JMerrillFoundation@jmerrill.org/"
      }
    },
    {
      title: "Marlan Gary Funeral Home",
      description: "Pre-need planning or funeral consultation services.",
      button: {
        label: "Book Funeral Appointment",
        url: "https://outlook.office.com/book/MarlanGaryPreNeed@jmerrill.financial/"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
        Appointments Hub
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {sections.map((section, i) => (
          <AppointmentCard key={i} section={section} />
        ))}
      </div>
    </div>
  );
}