import { ChevronDown } from "lucide-react";
import { type ComponentProps, useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { Button } from "../components/ui/button";
import { cn } from "@anan/platform-core/classnames";

interface ChatMessageAreaScrollButtonProps {
	alignment?: "left" | "center" | "right";
	className?: string;
}

export function ChatMessageAreaScrollButton({
	alignment = "center",
	className,
}: ChatMessageAreaScrollButtonProps) {
	const { isAtBottom, scrollToBottom } = useStickToBottomContext();

	const handleScrollToBottom = useCallback(() => {
		scrollToBottom();
	}, [scrollToBottom]);

	if (isAtBottom) {
		return null;
	}

	const alignmentClasses = {
		left: "left-4",
		center: "left-1/2 -translate-x-1/2",
		right: "right-4",
	};

	return (
		<Button
			variant="secondary"
			className={cn(
				"absolute bottom-4 inline-flex h-9 min-w-[104px] items-center justify-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_20%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-panel)_88%,transparent)] px-3 text-[11px] font-black text-[var(--workspace-bubble-other-foreground)] shadow-[0_12px_26px_rgba(0,0,0,0.16)] backdrop-blur-md transition hover:bg-[color:color-mix(in_srgb,var(--workspace-highlight)_6%,var(--workspace-panel))] hover:text-[var(--workspace-highlight)]",
				alignmentClasses[alignment],
				className,
			)}
			onClick={handleScrollToBottom}
		>
			<ChevronDown className="h-4 w-4" />
			<span>إلى الأسفل</span>
		</Button>
	);
}

type ChatMessageAreaProps = ComponentProps<typeof StickToBottom>;

export function ChatMessageArea({ className, ...props }: ChatMessageAreaProps) {
	return (
		<StickToBottom
			className={cn("relative min-h-0 flex-1 basis-0", className)}
			resize="smooth"
			initial="smooth"
			{...props}
		/>
	);
}

type ChatMessageAreaContentProps = ComponentProps<typeof StickToBottom.Content>;

export function ChatMessageAreaContent({
	className,
	scrollClassName,
	...props
}: ChatMessageAreaContentProps) {
	return (
		<StickToBottom.Content
			scrollClassName={cn("h-full min-h-0 overflow-y-auto", scrollClassName)}
			className={cn("mx-auto flex min-h-full w-full max-w-2xl flex-col justify-end py-2", className)}
			{...props}
		/>
	);
}
