import { Card, CardContent } from "@/components/ui/card";

const TEAM = [
  { name: "Ahmed Mansour", role: "Founder & CEO", initials: "AM" },
  { name: "Sara Al-Rashid", role: "Head of Engineering", initials: "SR" },
  { name: "Khalid Nasser", role: "Head of Compliance", initials: "KN" },
  { name: "Noura Al-Otaibi", role: "Head of Partnerships", initials: "NO" },
];

export default function TeamPublicPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-2">Our Team</h1>
      <p className="text-text-secondary mb-10">The people building the infrastructure for Saudi Arabia's real estate future.</p>

      <div className="grid sm:grid-cols-2 gap-6">
        {TEAM.map((member) => (
          <Card key={member.name} className="border-border/60 shadow-none">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                {member.initials}
              </div>
              <div>
                <h3 className="font-medium text-text-primary">{member.name}</h3>
                <p className="text-sm text-text-secondary">{member.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
