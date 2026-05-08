import { Triangle } from "lucide-react";

export default function AboutPage() {
  return (
    <article>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-none">
          <Triangle className="h-5 w-5 fill-current" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">About Anand Hub</h1>
      </div>

      <section className="space-y-6 text-text-secondary leading-relaxed">
        <p className="text-lg">
          Anand Hub is the central point of real estate in Saudi Arabia — a synchronization engine that connects fragmented, asynchronous real estate platforms into a single, unified source of truth.
        </p>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Our Mission</h2>
          <p>The Saudi real estate market is growing at an unprecedented rate, fueled by Vision 2030. But the technology infrastructure behind it remains fragmented — brokers use different CRMs, developers manage inventory across dozens of portals, and customers lack transparency on real-time availability.</p>
          <p className="mt-2">Anand Hub exists to solve this problem. We are not another software product. We are the infrastructure layer that synchronizes all of them.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">What We Do</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>Validate property data against REGA compliance schemas.</li>
            <li>Synchronize canonical property state across all connected platforms in real-time.</li>
            <li>Provide brokers and developers with a definitive, single source of truth.</li>
            <li>Offer programmers a clean, idempotent REST API and webhook-based integration layer.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-3">Built for Saudi Arabia</h2>
          <p>Anand Hub is designed from the ground up for the unique requirements of the Saudi real estate ecosystem. We understand the regulatory landscape, the commercial registration process, and the critical need for data accuracy in a market moving at the speed of Vision 2030.</p>
        </div>
      </section>
    </article>
  );
}
