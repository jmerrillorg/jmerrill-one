// 📄 /new_one/src/app/faq/page.tsx
'use client';

import HeroLogo from '@/components/shared/HeroLogo';

export default function Page() {
  return (
    <div className="min-h-screen px-6 py-12 bg-background text-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <HeroLogo />
        <h1 className="text-4xl font-bold text-primary mt-6 mb-2">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Answers to the most common questions about our services, process, and support.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">What services does J Merrill One offer?</h2>
          <p className="text-muted-foreground">
            Publishing, Financial Services, and Nonprofit solutions—each delivered with excellence under one streamlined umbrella.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">How do I book an appointment?</h2>
          <p className="text-muted-foreground">
            Visit our <strong>Appointments</strong> page to choose your service and schedule a time that works best for you.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Where is your office located?</h2>
          <p className="text-muted-foreground">
            You’ll find us at 2323 W 5th Ave, Suite 120, Columbus, OH 43204—serving locally and virtually.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">What’s the best way to contact you?</h2>
          <p className="text-muted-foreground">
            Email us at <strong>info@jmerrill.one</strong> or call <strong>(614) 965-6057</strong>. We’re happy to assist.
          </p>
        </div>
      </div>
    </div>
  );
}