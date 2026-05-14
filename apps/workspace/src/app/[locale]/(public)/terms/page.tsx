import { LegalArticle, LegalBlock } from "@/components/landing/public-page-shell";
import { brandProductName } from "@qentrah/brand-identity";

export default function TermsPage() {
  const workspaceName = brandProductName("workspace", "en");
  return (
    <LegalArticle title="Terms of Service" updated="Last updated: May 4, 2026">
      <LegalBlock title="1. Acceptance of Terms">
        <p>By accessing or using the {workspaceName} platform, you agree to be bound by these Terms of Service. If you are using the platform on behalf of an organization, you represent that you have the authority to bind that organization to these terms.</p>
      </LegalBlock>

      <LegalBlock title="2. Platform Description">
        <p>{workspaceName} is a centralized real estate data synchronization engine for the Saudi Arabian market. The platform facilitates the exchange, validation, and distribution of property data between authorized organizations including brokers, developers, and integration partners.</p>
      </LegalBlock>

      <LegalBlock title="3. Account Responsibilities">
        <p>You are responsible for maintaining the confidentiality of your account credentials. You must ensure that all information provided during onboarding is accurate, current, and complete. Providing fraudulent documentation will result in immediate account termination.</p>
      </LegalBlock>

      <LegalBlock title="4. Data Accuracy">
        <p>Organizations are solely responsible for the accuracy of property data submitted to the platform. {workspaceName} validates data against regulatory schemas but does not guarantee the correctness of user-submitted information.</p>
      </LegalBlock>

      <LegalBlock title="5. Synchronization Rules">
        <p>Data synchronization is subject to platform approval. Draft records are not distributed until the organization is approved and the records pass validation. {workspaceName} reserves the right to suspend synchronization for organizations that violate data quality standards.</p>
      </LegalBlock>

      <LegalBlock title="6. Limitation of Liability">
        <p>{workspaceName} is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from the use of the platform or reliance on synchronized data.</p>
      </LegalBlock>

      <LegalBlock title="7. Governing Law">
        <p>These Terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes shall be resolved in the competent courts of Riyadh.</p>
      </LegalBlock>
    </LegalArticle>
  );
}
