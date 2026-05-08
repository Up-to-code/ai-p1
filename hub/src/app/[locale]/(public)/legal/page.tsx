export default function LegalPage() {
  return (
    <article>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-2">Legal Notice</h1>
      <p className="text-text-muted text-sm mb-10">Last updated: May 4, 2026</p>

      <section className="space-y-6 text-text-secondary leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Company Information</h2>
          <p>Anand Hub is operated by Anand Technology Co., registered in the Kingdom of Saudi Arabia under Commercial Registration No. 1010XXXXXX.</p>
          <ul className="mt-3 space-y-1 list-disc list-inside">
            <li>Headquarters: Riyadh, Kingdom of Saudi Arabia</li>
            <li>Email: <a href="mailto:legal@anand.sa" className="text-primary hover:underline">legal@anand.sa</a></li>
            <li>VAT Registration: 3XXXXXXXXXX0003</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Regulatory Compliance</h2>
          <p>Anand Hub operates in accordance with the regulations set forth by the Real Estate General Authority (REGA) and the Saudi Central Bank (SAMA) where applicable. All property data synchronization processes comply with local data protection and real estate advertising standards.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Intellectual Property</h2>
          <p>All content, trademarks, logos, and intellectual property displayed on this platform are the property of Anand Technology Co. or their respective owners. Unauthorized use is prohibited.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Dispute Resolution</h2>
          <p>Any disputes arising from the use of this platform shall be subject to the exclusive jurisdiction of the courts of Riyadh, Kingdom of Saudi Arabia, in accordance with Saudi law.</p>
        </div>
      </section>
    </article>
  );
}
