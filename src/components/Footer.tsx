export default function Footer() {
  return (
    <footer
      className="
        border-t
        border-border
        bg-background
        text-foreground
      "
    >
      <div className="mx-auto max-w-screen-xl px-6 py-10">

        {/* --------------------------------------------------
           Copyright
        -------------------------------------------------- */}
        <div className="mb-6 text-sm text-secondary">
          © 2025 J Merrill One. All rights reserved.
        </div>

        {/* --------------------------------------------------
           Grid
        -------------------------------------------------- */}
        <div className="grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4">

          {/* Headquarters */}
          <div>
            <div className="mb-1 font-semibold text-foreground">
              Headquarters
            </div>
            <div className="text-secondary">
              <div>2323 W 5th Ave, Suite 120</div>
              <div>Columbus, OH 43204</div>
            </div>
          </div>

          {/* Main Line */}
          <div>
            <div className="mb-1 font-semibold text-foreground">
              Main Line
            </div>
            <div className="text-secondary">
              (614) 965-6057
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="mb-1 font-semibold text-foreground">
              Contact
            </div>
            <div className="space-y-1 text-secondary">
              <a
                href="mailto:info@jmerrill.one"
                className="
                  block
                  transition-colors
                  hover:text-jm1-blue
                "
              >
                info@jmerrill.one
              </a>
              <a
                href="https://www.jmerrill.one"
                className="
                  block
                  transition-colors
                  hover:text-jm1-blue
                "
              >
                www.jmerrill.one
              </a>
            </div>
          </div>

          {/* Office Hours */}
          <div>
            <div className="mb-1 font-semibold text-foreground">
              Office Hours
            </div>
            <div className="space-y-1 text-secondary">
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