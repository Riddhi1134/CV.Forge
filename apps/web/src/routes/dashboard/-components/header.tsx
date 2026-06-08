// import type { Icon as IconType } from "@phosphor-icons/react";
// import { SidebarTrigger } from "@reactive-resume/ui/components/sidebar";
// import { cn } from "@reactive-resume/utils/style";

// type Props = {
// 	title: string;
// 	icon: IconType;
// 	className?: string;
// };

// export function DashboardHeader({ title, icon: IconComponent, className }: Props) {
// 	return (
// 		<div className={cn("relative flex items-center justify-center gap-x-2.5 md:justify-start", className)}>
// 			<SidebarTrigger className="absolute inset-s-0 md:hidden" />
// 			<IconComponent weight="light" className="size-5" />
// 			<div>
// 	<h1 className="font-semibold text-2xl tracking-tight">
// 		{title}
// 	</h1>
// </div>
// 		</div>
// 	);
// }

import type { Icon as IconType } from "@phosphor-icons/react";
import { SidebarTrigger } from "@reactive-resume/ui/components/sidebar";
import { cn } from "@reactive-resume/utils/style";

type Props = {
	title: string;
	icon: IconType;
	className?: string;
	/** Optional count shown as a pill badge next to the title */
	count?: number;
};

export function DashboardHeader({ title, icon: IconComponent, className, count }: Props) {
	return (
		<div className={cn("relative flex items-center justify-center gap-x-2.5 md:justify-start", className)}>
			{/* Mobile sidebar trigger */}
			<SidebarTrigger className="absolute inset-s-0 md:hidden" />

			<IconComponent weight="light" className="size-5 text-muted-foreground" />

			<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>

			{count !== undefined && (
				<span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">{count}</span>
			)}
		</div>
	);
}
