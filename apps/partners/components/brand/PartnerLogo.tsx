import Link from "next/link";

export function PartnerLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center text-lg font-bold tracking-tight text-foreground">
      anan<span className="text-primary">portal</span>
    </Link>
  );
}
