export default function TermsPage() {
  return (
    <article>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-2">Terms of Service</h1>
      <p className="text-text-muted text-sm mb-10">Last updated: May 4, 2026</p>

      <section className="space-y-6 text-text-secondary leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using the Anand Hub platform, you agree to be bound by these Terms of Service. If you are using the platform on behalf of an organization, you represent that you have the authority to bind that organization to these terms.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">2. Platform Description</h2>
          <p>Anand Hub is a centralized real estate data synchronization engine for the Saudi Arabian market. The platform facilitates the exchange, validation, and distribution of property data between authorized organizations including brokers, developers, and integration partners.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">3. Account Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must ensure that all information provided during onboarding is accurate, current, and complete. Providing fraudulent documentation will result in immediate account termination.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">4. Data Accuracy</h2>
          <p>Organizations are solely responsible for the accuracy of property data submitted to the platform. Anand Hub validates data against regulatory schemas but does not guarantee the correctness of user-submitted information.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">5. Synchronization Rules</h2>
          <p>Data synchronization is subject to platform approval. Draft records are not distributed until the organization is approved and the records pass validation. Anand Hub reserves the right to suspend synchronization for organizations that violate data quality standards.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">6. Limitation of Liability</h2>
          <p>Anand Hub is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from the use of the platform or reliance on synchronized data.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">7. Governing Law</h2>
          <p>These Terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes shall be resolved in the competent courts of Riyadh.</p>
        </div>
      </section>
    </article>
  );
}
