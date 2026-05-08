import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Markdown } from "./markdown"

export type MessageProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

const Message = ({ children, className, ...props }: MessageProps) => (
  <div className={cn("flex gap-3", className)} {...props}>
    {children}
  </div>
)

export type MessageAvatarProps = {
  src: string
  alt: string
  fallback?: string
  delayMs?: number
  className?: string
}

const MessageAvatar = ({
  src,
  alt,
  fallback,
  delayMs,
  className,
}: MessageAvatarProps) => {
  return (
    <Avatar className={cn("h-8 w-8 shrink-0", className)}>
      <AvatarImage src={src} alt={alt} />
      {fallback && <AvatarFallback delay={delayMs}>{fallback}</AvatarFallback>}
    </Avatar>
  )
}

export type MessageContentProps = {
  children: React.ReactNode
  markdown?: boolean
  showCursor?: boolean
  className?: string
} & React.ComponentProps<typeof Markdown> &
  React.HTMLProps<HTMLDivElement>

const MessageContent = ({
  children,
  markdown = false,
  showCursor = false,
  className,
  ...props
}: MessageContentProps) => {
  const classNames = cn(
    "rounded-lg p-2 text-foreground bg-secondary prose break-words whitespace-normal",
    className
  )

  const content = (
    <>
      {children}
      {showCursor && (
        <span className="inline-block w-2 h-4 ml-1 bg-current animate-blink align-middle" />
      )}
    </>
  )

  return markdown ? (
    <div className={classNames} {...props}>
      <Markdown className="inline">
        {children as string}
      </Markdown>
      {showCursor && (
        <span className="inline-block w-2 h-4 ml-1 bg-current animate-blink align-middle" />
      )}
    </div>
  ) : (
    <div className={classNames} {...props}>
      {content}
    </div>
  )
}

export type MessageActionsProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

const MessageActions = ({
  children,
  className,
  ...props
}: MessageActionsProps) => (
  <div
    className={cn("text-muted-foreground flex items-center gap-2", className)}
    {...props}
  >
    {children}
  </div>
)

export type MessageActionProps = {
  className?: string
  tooltip: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
} & React.ComponentProps<typeof Tooltip>

const MessageAction = ({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: MessageActionProps) => {
  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent side={side} className={className}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Message, MessageAvatar, MessageContent, MessageActions, MessageAction }
