export default function PrivacyPage() {
  return (
    <article>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-2">Privacy Policy</h1>
      <p className="text-text-muted text-sm mb-10">Last updated: May 4, 2026</p>

      <section className="space-y-6 text-text-secondary leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">1. Introduction</h2>
          <p>Anand Hub ("we", "us", "our") operates the central real estate data synchronization platform for Saudi Arabia. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">2. Information We Collect</h2>
          <p>We collect information you provide directly, including your name, email address, phone number, organization details, commercial registration numbers, and legal documentation submitted during onboarding.</p>
          <p className="mt-2">We automatically collect device information, IP addresses, browser type, and usage patterns through standard web analytics.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">3. How We Use Your Information</h2>
          <p>Your information is used to verify your organization's identity, manage your account, synchronize property data across connected platforms, process transactions, and comply with Saudi Arabia's Real Estate General Authority (REGA) regulations.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">4. Data Sharing</h2>
          <p>We share data only with connected platforms you explicitly authorize through our integration system. Property data is synchronized according to your organization's configured rules. We do not sell personal data to third parties.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">5. Data Security</h2>
          <p>We implement industry-standard security measures including encryption at rest and in transit, role-based access controls, audit logging, and signed webhook deliveries to protect your data.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">6. Data Retention</h2>
          <p>We retain your data for as long as your account is active or as needed to provide services. Organization data is retained in accordance with REGA compliance requirements.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">7. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact us at <a href="mailto:privacy@anand.sa" className="text-primary hover:underline">privacy@anand.sa</a>.</p>
        </div>
      </section>
    </article>
  );
}
