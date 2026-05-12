import { redirect } from "next/navigation";
import { AccountForms } from "@/components/portal/AccountForms";
import { getToken } from "@/lib/auth-server";
import { partnerAccountRepository } from "@/server/partnerAccount";

export default async function AccountPage() {
  const token = await getToken();
  if (!token) redirect("/signin?returnTo=/dashboard/account");
  const account = await partnerAccountRepository.getCurrent(token);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Account</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage the developer identity and programmer organization used for app review and production authorization.
        </p>
      </div>
      <AccountForms account={account} />
    </div>
  );
}
