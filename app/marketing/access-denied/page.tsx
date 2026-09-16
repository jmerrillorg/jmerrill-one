import type { Metadata } from "next";
import Link from "next/link";
import styles from "../marketing.module.css";

export const metadata: Metadata = { title: "Access Restricted | J Merrill One", robots: { index: false, follow: false } };

export default function MarketingAccessDeniedPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>J Merrill One / Restricted</p>
          <h1>Access not authorized</h1>
          <p className={styles.subtitle}>This operating surface is limited to approved JM1 administrators.</p>
        </div>
        <div className={styles.identity}><Link href="/api/auth/signin?callbackUrl=/marketing">Try another account</Link><Link href="/">Return to site</Link></div>
      </section>
    </main>
  );
}
