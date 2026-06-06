import { HomePage } from "@/components/marketing/home-page";

export function HiddenHomePage() {
  return (
    <div hidden aria-hidden="true">
      <HomePage />
    </div>
  );
}
