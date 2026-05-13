import { LegalArticle, LegalBlock } from "@/components/landing/public-page-shell";

export default function LegalPage() {
  return (
    <LegalArticle title="Legal Notice" updated="Last updated: May 4, 2026">
      <LegalBlock title="Company Information">
        <p>Anand Workspace is operated by Anand Technology Co., registered in the Kingdom of Saudi Arabia under Commercial Registration No. 1010XXXXXX.</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Headquarters: Riyadh, Kingdom of Saudi Arabia</li>
          <li>
            Email:{" "}
            <a href="mailto:legal@anand.sa" className="font-black text-blue-600 hover:underline dark:text-blue-300">
              legal@anand.sa
            </a>
          </li>
          <li>VAT Registration: 3XXXXXXXXXX0003</li>
        </ul>
      </LegalBlock>

      <LegalBlock title="Regulatory Compliance">
        <p>Anand Workspace operates in accordance with the regulations set forth by the Real Estate General Authority (REGA) and the Saudi Central Bank (SAMA) where applicable. All property data synchronization processes comply with local data protection and real estate advertising standards.</p>
      </LegalBlock>

      <LegalBlock title="Intellectual Property">
        <p>All content, trademarks, logos, and intellectual property displayed on this platform are the property of Anand Technology Co. or their respective owners. Unauthorized use is prohibited.</p>
      </LegalBlock>

      <LegalBlock title="Dispute Resolution">
        <p>Any disputes arising from the use of this platform shall be subject to the exclusive jurisdiction of the courts of Riyadh, Kingdom of Saudi Arabia, in accordance with Saudi law.</p>
      </LegalBlock>
    </LegalArticle>
  );
}
