import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm transition-colors outline-none placeholder:text-zinc-400 focus:bg-white focus:border-zinc-200 disabled:opacity-50 shadow-none resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
