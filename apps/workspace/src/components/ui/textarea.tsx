import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full resize-none rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-900 shadow-none outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-200 focus:bg-white disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/20 dark:focus:bg-white/10",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
