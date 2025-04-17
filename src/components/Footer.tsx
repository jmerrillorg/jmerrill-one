import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-gray-200 dark:border-gray-700 text-subtle text-sm py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Branding */}
        <div>
          <p className="font-semibold text-primary">© {new Date().getFullYear()} J Merrill One</p>
          <p className="text-subtle">All rights reserved.</p>
        </div>

        {/* Footer Nav Links */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-foreground font-medium">
          <Link href="https://jmerrill.pub" className="hover:text-primary">Publishing</Link>
          <Link href="https://jmerrill.financial" className="hover:text-primary">Financial</Link>
          <Link href="https://jmerrill.org" className="hover:text-primary">Foundation</Link>
          <Link href="/legal" className="hover:text-primary">Legal</Link>
        </div>
      </div>
    </footer>
  );
}