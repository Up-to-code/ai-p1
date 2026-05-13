import { redirect } from "next/navigation";
import { AccountForms } from "@/components/portal/AccountForms";
import { getToken } from "@/lib/auth-server";
import { partnerAccountRepository } from "@/server/partnerAccount";

export default async function AccountPage() {
  const token = await getToken();
  if (!token) redirect("/signin?returnTo=/dashboard/account");
  const account = await partnerAccountRepository.getCurrent(token);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase text-primary">Account</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Developer identity</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage the developer identity and programmer organization used for app review and production authorization.
        </p>
      </div>
      <AccountForms account={account} />
    </div>
  );
}
