export default function Footer() {
  return (
    <footer className="border-t border-jm1-mist bg-background">
      <div className="mx-auto max-w-screen-xl px-6 py-10">

        {/* Copyright */}
        <div className="mb-6 text-sm text-jm1-slate">
          © 2025 J Merrill One. All rights reserved.
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm">

          {/* Headquarters */}
          <div>
            <div className="mb-1 font-semibold text-jm1-ink">
              Headquarters
            </div>
            <div className="text-jm1-slate">
              <div>2323 W 5th Ave, Suite 120</div>
              <div>Columbus, OH 43204</div>
            </div>
          </div>

          {/* Main Line */}
          <div>
            <div className="mb-1 font-semibold text-jm1-ink">
              Main Line
            </div>
            <div className="text-jm1-slate">
              (614) 965-6057
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="mb-1 font-semibold text-jm1-ink">
              Contact
            </div>
            <div className="space-y-1 text-jm1-slate">
              <a
                href="mailto:info@jmerrill.one"
                className="block hover:text-jm1-brand transition-colors"
              >
                info@jmerrill.one
              </a>
              <a
                href="https://www.jmerrill.one"
                className="block hover:text-jm1-brand transition-colors"
              >
                www.jmerrill.one
              </a>
            </div>
          </div>

          {/* Office Hours */}
          <div>
            <div className="mb-1 font-semibold text-jm1-ink">
              Office Hours
            </div>
            <div className="text-jm1-slate space-y-1">
              <div>Mon–Thu: 10:00 AM – 6:00 PM</div>
              <div>Fri: 10:00 AM – 4:00 PM</div>
              <div>Sat: By Appointment Only</div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}