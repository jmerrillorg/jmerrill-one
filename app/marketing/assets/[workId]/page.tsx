import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { marketingAuthOptions } from "@/lib/marketing-auth";
import { loadProductionAssetDrilldown } from "@/lib/marketing-command-center";
import styles from "../../marketing.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Production Asset Detail | J Merrill One", robots: { index: false, follow: false } };
const text = (value: unknown) => typeof value === "string" ? value : "";

export default async function ProductionAssetDetailPage({ params }: { params: Promise<{ workId: string }> }) {
  const session = await getServerSession(marketingAuthOptions);
  if (!session?.user?.email) redirect("/api/auth/signin?callbackUrl=/marketing");
  const { workId } = await params;
  const data = await loadProductionAssetDrilldown(workId);
  return (
    <main className={styles.shell}>
      <header className={styles.header}><div><p className={styles.eyebrow}>Production asset registry</p><h1>{text(data.work.jm1pub_titlename)}</h1><p className={styles.subtitle}>{text(data.work.jm1pub_authorname)}</p></div><div className={styles.identity}><Link href="/marketing">Back to command center</Link></div></header>
      <section className={styles.band}><div className={styles.sectionHeading}><p>Catalog identity</p><h2>Editions and products</h2></div><div className={styles.metricGrid}><article><span>Canonical work</span><strong>{workId}</strong></article><article><span>Editions</span><strong>{data.editions.length}</strong></article><article><span>Format products</span><strong>{data.products.length}</strong></article><article><span>Governed asset views</span><strong>{data.assets.length}</strong></article></div></section>
      <section className={styles.tableSection}><div className={styles.sectionHeading}><p>Edition / product</p><h2>Published identities</h2></div><div className={styles.tableWrap}><table><thead><tr><th>Product</th><th>ISBN</th><th>Format</th><th>Distribution</th></tr></thead><tbody>{data.products.map((item) => <tr key={text(item.jm1pub_publishingassetid)}><td>{text(item.jm1pub_name)}</td><td>{text(item.jm1pub_isbn13) || "Not assigned"}</td><td>{text(item["jm1pub_assetformat@OData.Community.Display.V1.FormattedValue"]) || text(item.jm1pub_assetformat)}</td><td>{text(item["jm1pub_distributionstatus@OData.Community.Display.V1.FormattedValue"]) || text(item.jm1pub_distributionstatus)}</td></tr>)}</tbody></table></div></section>
      <section className={styles.tableSection}><div className={styles.sectionHeading}><p>SharePoint authority</p><h2>Governed production assets</h2></div><div className={styles.tableWrap}><table><thead><tr><th>Asset</th><th>Type</th><th>State</th><th>SHA-256</th><th>Modified</th></tr></thead><tbody>{data.assets.map((item, index) => <tr key={`${text(item.jm1pub_filename)}-${index}`}><td><a href={text(item.jm1pub_weburl)} target="_blank" rel="noreferrer">{text(item.jm1pub_filename)}</a></td><td>{text(item.jm1pub_assettype)}</td><td>{text(item.jm1pub_assetstate)}</td><td>{text(item.jm1pub_sha256) || "Not captured"}</td><td>{text(item.jm1pub_lastmodified)}</td></tr>)}</tbody></table></div></section>
    </main>
  );
}
