import AppointmentCard from '@/components/AppointmentCard';
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Book an Appointment | J Merrill One",
  description: "Easily schedule consultations for publishing, insurance, and community programs.",
  path: "/appointments",
});

export default function AppointmentsPage() {
  return (
    <main className="bg-background text-foreground min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center text-appointments">Schedule an Appointment</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppointmentCard
            title="Publishing Consultation"
            description="Discuss your manuscript, package options, and publishing timeline with our team."
            href="https://outlook.office.com/book/JMerrillPublishingInc@jmerrill.pub/"
            color="publishing"
          />
          <AppointmentCard
            title="Financial Planning"
            description="Book a session to review your insurance, pre-need planning, or financial goals."
            href="https://bit.ly/4iZLTXc"
            color="financial"
          />
        </div>
      </div>
    </main>
  );
}