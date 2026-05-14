import { LegalArticle, LegalBlock } from "@/components/landing/public-page-shell";
import { brandDomainUrl, brandProductName } from "@qentrah/brand-identity";

export default function PrivacyPage() {
  const workspaceName = brandProductName("workspace", "en");
  const privacyEmail = `privacy@${brandDomainUrl("root").replace("https://", "")}`;
  return (
    <LegalArticle title="Privacy Policy" updated="Last updated: May 4, 2026">
      <LegalBlock title="1. Introduction">
        <p>{workspaceName} ("we", "us", "our") operates the central real estate data synchronization platform for Saudi Arabia. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
      </LegalBlock>

      <LegalBlock title="2. Information We Collect">
        <p>We collect information you provide directly, including your name, email address, phone number, organization details, commercial registration numbers, and legal documentation submitted during onboarding.</p>
        <p>We automatically collect device information, IP addresses, browser type, and usage patterns through standard web analytics.</p>
      </LegalBlock>

      <LegalBlock title="3. How We Use Your Information">
        <p>Your information is used to verify your organization's identity, manage your account, synchronize property data across connected platforms, process transactions, and comply with Saudi Arabia's Real Estate General Authority (REGA) regulations.</p>
      </LegalBlock>

      <LegalBlock title="4. Data Sharing">
        <p>We share data only with connected platforms you explicitly authorize through our integration system. Property data is synchronized according to your organization's configured rules. We do not sell personal data to third parties.</p>
      </LegalBlock>

      <LegalBlock title="5. Data Security">
        <p>We implement industry-standard security measures including encryption at rest and in transit, role-based access controls, audit logging, and signed webhook deliveries to protect your data.</p>
      </LegalBlock>

      <LegalBlock title="6. Data Retention">
        <p>We retain your data for as long as your account is active or as needed to provide services. Organization data is retained in accordance with REGA compliance requirements.</p>
      </LegalBlock>

      <LegalBlock title="7. Contact Us">
        <p>
          If you have questions about this Privacy Policy, contact us at{" "}
          <a href={`mailto:${privacyEmail}`} className="font-black text-blue-600 hover:underline dark:text-blue-300">
            {privacyEmail}
          </a>
          .
        </p>
      </LegalBlock>
    </LegalArticle>
  );
}
