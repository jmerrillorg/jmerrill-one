export default function Footer() {
  return (
    <footer className="bg-background text-foreground text-sm border-t border-muted px-6 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="text-left space-y-2">
          <p className="font-semibold">&copy; {new Date().getFullYear()} J Merrill One. All rights reserved.</p>
          <p>
            Headquarters:<br />
            2323 W 5th Ave, Suite 120<br />
            Columbus, OH 43204
          </p>
          <p>Main Line: (614) 965-6057</p>
          <p>
            Email: <a href="mailto:info@jmerrill.one" className="underline hover:text-primary">info@jmerrill.one</a><br />
            Web: <a href="https://www.jmerrill.one" className="underline hover:text-primary">www.jmerrill.one</a>
          </p>
        </div>

        {/* Center Column */}
        <div className="text-center space-y-2">
          <p className="font-semibold">Office Hours</p>
          <p>Mon–Thu: 10:00 AM – 6:00 PM</p>
          <p>Fri: 10:00 AM – 4:00 PM</p>
          <p>Sat: By Appointment Only</p>
          <p>Sun: Closed</p>
        </div>

        {/* Right Column */}
        <div className="text-right space-y-2">
          <p className="font-semibold">J Merrill One Companies</p>
          <ul className="space-y-1">
            <li>
              <a
                href="https://www.jmerrill.pub"
                className="underline hover:text-publishing"
                target="_blank" rel="noopener noreferrer"
              >
                J Merrill Publishing, Inc.
              </a>
            </li>
            <li>
              <a
                href="https://www.jmerrill.financial"
                className="underline hover:text-financial"
                target="_blank" rel="noopener noreferrer"
              >
                J Merrill Financial, LLC
              </a>
            </li>
            <li>
              <a
                href="https://www.jmerrill.foundation"
                className="underline hover:text-foundation"
                target="_blank" rel="noopener noreferrer"
              >
                J Merrill Foundation, Inc.
              </a>
            </li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Registered in Ohio<br />
            Tax-exempt status applies to&nbsp;
            <a
              href="https://www.jmerrill.foundation"
              className="underline hover:text-foundation"
              target="_blank" rel="noopener noreferrer"
            >
              J Merrill Foundation
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
} 