export type CommercialLifecycle = {
  aggregate: "proposal" | "contract" | "deliverable" | "change_order";
  from: string;
  command: "send" | "accept" | "sign" | "activate" | "start" | "submit" | "approve" | "reject";
  to: string;
};

const allowed = new Set([
  "proposal:draft:send:sent", "proposal:sent:accept:accepted",
  "contract:draft:send:sent", "contract:sent:sign:signed", "contract:signed:activate:active",
  "deliverable:planned:start:in_progress", "deliverable:in_progress:submit:submitted", "deliverable:planned:submit:submitted",
  "deliverable:submitted:approve:approved", "deliverable:submitted:reject:rejected",
  "change_order:draft:submit:submitted", "change_order:submitted:approve:approved", "change_order:submitted:reject:rejected",
]);

export function assertCommercialTransition(transition: CommercialLifecycle) {
  const key = `${transition.aggregate}:${transition.from}:${transition.command}:${transition.to}`;
  if (!allowed.has(key)) throw new Error(`Invalid ${transition.aggregate} lifecycle transition.`);
}

export function assertProposalAcceptable(status: string, validUntil: number | undefined, now: number) {
  if (status !== "sent") throw new Error("Only a sent Proposal can be accepted.");
  if (validUntil !== undefined && validUntil < now) throw new Error("An expired Proposal cannot be accepted.");
}

export function nextAgreedAmount(currentMinor: number, approvedDeltaMinor: number) {
  const next = currentMinor + approvedDeltaMinor;
  if (!Number.isSafeInteger(next) || next < 0) throw new Error("Approved Change Order would produce an invalid agreed amount.");
  return next;
}
