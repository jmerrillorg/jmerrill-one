import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { marketingAuthOptions } from "@/lib/marketing-auth";
import { loadMarketingCommandCenter } from "@/lib/marketing-command-center";
import styles from "./marketing.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Founder Command Center | J Merrill One",
  robots: { index: false, follow: false },
};

function stateClass(state: string) {
  if (/ATTENTION|FAILED|MISMATCH|EXCEPTION/i.test(state)) return styles.attention;
  if (/ACTIVE|HEALTHY|PROVEN|PRESENT|READY/i.test(state)) return styles.healthy;
  return styles.neutral;
}

function formatDate(value: string) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(date);
}

export default async function MarketingCommandCenterPage() {
  const session = await getServerSession(marketingAuthOptions);
  if (!session?.user?.email) redirect("/api/auth/signin?callbackUrl=/marketing");

  const data = await loadMarketingCommandCenter();

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>J Merrill One / Founder Authority</p>
          <h1>Marketing Command Center</h1>
          <p className={styles.subtitle}>Read-only operational truth from the JM1-owned runtime.</p>
        </div>
        <div className={styles.identity}>
          <span>{session.user.email}</span>
          <Link href="/api/auth/signout?callbackUrl=/">Sign out</Link>
        </div>
      </header>

      <section className={styles.statusBar} aria-label="Runtime status">
        <span className={styles.liveDot} aria-hidden="true" />
        <strong>Publishing active</strong>
        <span>Financial configured, not activated</span>
        <span>LinkedIn external review only</span>
        <time dateTime={data.generatedAt}>Updated {formatDate(data.generatedAt)}</time>
      </section>

      <section className={styles.band}>
        <div className={styles.sectionHeading}>
          <p>Current authority</p>
          <h2>What is active now</h2>
        </div>
        <div className={styles.metricGrid}>
          <article><span>Featured author</span><strong>{data.current.featuredAuthor}</strong></article>
          <article><span>Title campaigns</span><strong>{data.current.titleCampaigns}</strong></article>
          <article><span>Acquisition</span><strong>{data.current.acquisition}</strong></article>
          <article><span>Reader</span><strong>{data.current.reader}</strong></article>
          <article><span>Brand</span><strong>{data.current.brand}</strong></article>
        </div>
      </section>

      <section className={styles.twoColumn}>
        <div className={styles.panel}>
          <div className={styles.sectionHeading}><p>Runtime</p><h2>System health</h2></div>
          <div className={styles.rows}>
            {data.health.map((item) => (
              <div className={styles.row} key={item.name}>
                <span>{item.name}</span>
                <strong className={stateClass(item.state)}>{item.state.replaceAll("_", " ")}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.sectionHeading}><p>Forward view</p><h2>Upcoming</h2></div>
          <dl className={styles.details}>
            <div><dt>Next featured author</dt><dd>{data.upcoming.nextFeaturedAuthor}</dd></div>
            <div><dt>Scheduled executions</dt><dd>{data.upcoming.scheduledExecutions}</dd></div>
            <div><dt>Reactivation candidates</dt><dd>{data.upcoming.reactivationCandidates}</dd></div>
            <div><dt>Launch authority</dt><dd>{data.upcoming.launches.length ? data.upcoming.launches.join(", ") : "Strategies for Success / Sep. 22"}</dd></div>
          </dl>
        </div>
      </section>

      <section className={styles.band}>
        <div className={styles.sectionHeading}><p>Catalog</p><h2>Commercial coverage</h2></div>
        <div className={styles.metricGrid}>
          <article><span>Source rows</span><strong>{data.catalog.sourceRows}</strong></article>
          <article><span>Canonical works</span><strong>{data.catalog.canonicalWorks}</strong></article>
          <article><span>Format products</span><strong>{data.catalog.formatProducts}</strong></article>
          <article><span>Reserved ISBNs</span><strong>{data.catalog.reservedIsbns}</strong></article>
          <article><span>Marketing eligible</span><strong>{data.catalog.marketingEligible}</strong></article>
          <article><span>Rights holds</span><strong>{data.catalog.rightsHolds}</strong></article>
        </div>
      </section>

      <section className={styles.band}>
        <div className={styles.sectionHeading}><p>Production assets</p><h2>Catalog file coverage</h2></div>
        <div className={styles.metricGrid}>
          <article><span>Registered files</span><strong>{data.assets.registeredFiles}</strong></article>
          <article><span>Works ready</span><strong>{data.assets.worksReady}</strong></article>
          <article><span>Partial or ambiguous</span><strong>{data.assets.worksPartial}</strong></article>
          <article><span>Missing</span><strong>{data.assets.worksMissing}</strong></article>
          <article><span>Primary covers</span><strong>{data.assets.primaryCovers}</strong></article>
        </div>
      </section>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeading}><p>Asset readiness</p><h2>Works needing review</h2></div>
        {data.assets.attention.length ? (
          <div className={styles.tableWrap}><table><thead><tr><th>Title</th><th>Author</th><th>State</th></tr></thead><tbody>
            {data.assets.attention.map((item) => <tr key={item.workId}><td><Link href={`/marketing/assets/${item.workId}`}>{item.title}</Link></td><td>{item.author}</td><td>{item.state.replaceAll("_", " ")}</td></tr>)}
          </tbody></table></div>
        ) : <p className={styles.empty}>All canonical works have governed production assets.</p>}
      </section>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeading}><p>Attention</p><h2>Founder exceptions</h2></div>
        {data.exceptions.length ? (
          <div className={styles.tableWrap}><table><thead><tr><th>Exception</th><th>Type</th><th>Owner</th><th>State</th></tr></thead><tbody>
            {data.exceptions.map((item, index) => <tr key={`${item.name}-${index}`}><td>{item.name || "Unnamed exception"}</td><td>{item.type || "Unclassified"}</td><td>{item.owner || "Not assigned"}</td><td>{item.state || "Open"}</td></tr>)}
          </tbody></table></div>
        ) : <p className={styles.empty}>No Founder action is currently required.</p>}
      </section>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeading}><p>Evidence</p><h2>Recent execution</h2></div>
        {data.executions.length ? (
          <div className={styles.tableWrap}><table><thead><tr><th>Execution</th><th>Platform</th><th>State</th><th>Requested schedule</th></tr></thead><tbody>
            {data.executions.map((item, index) => <tr key={`${item.name}-${index}`}><td>{item.name || "Unnamed execution"}</td><td>{item.platform || "Not set"}</td><td>{item.state || "Unknown"}</td><td>{formatDate(item.scheduled)}</td></tr>)}
          </tbody></table></div>
        ) : <p className={styles.empty}>No recent execution records.</p>}
      </section>

      <footer className={styles.footer}>Dataverse is the execution authority. Sintra is not the system of record.</footer>
    </main>
  );
}
