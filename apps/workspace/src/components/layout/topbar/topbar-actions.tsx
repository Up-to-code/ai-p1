"use client";

import { ProfileMenu } from "@/components/layout/profile-menu";

/** Right-side topbar actions. */
export function TopbarActions() {
  return (
    <div className="flex items-center justify-end">
      <ProfileMenu />
    </div>
  );
}
