// import {
// 	FileTextIcon,
// 	ClockCounterClockwiseIcon,
// } from "@phosphor-icons/react";

// type Props = {
// 	totalResumes: number;
// 	lastUpdated?: string;
// };

// export function DashboardStats({
// 	totalResumes,
// 	lastUpdated,
// }: Props) {
// 	return (
// 		<div className="grid gap-4 sm:grid-cols-2">
// 			<div className="rounded-2xl border bg-card p-5 shadow-sm">
// 				<div className="flex items-center justify-between">
// 					<div>
// 						<p className="text-sm text-muted-foreground">
// 							Total Resumes
// 						</p>

// 						<h3 className="text-3xl font-bold">
// 							{totalResumes}
// 						</h3>
// 					</div>

// 					<FileTextIcon size={24} />
// 				</div>
// 			</div>

// 			<div className="rounded-2xl border bg-card p-5 shadow-sm">
// 				<div className="flex items-center justify-between">
// 					<div>
// 						<p className="text-sm text-muted-foreground">
// 							Last Updated
// 						</p>

// 						<h3 className="font-semibold">
// 							{lastUpdated ?? "No resumes"}
// 						</h3>
// 					</div>

// 					<ClockCounterClockwiseIcon size={24} />
// 				</div>
// 			</div>
// 		</div>
// 	);
// }

import { ClockCounterClockwiseIcon, DownloadSimpleIcon, EyeIcon, FileTextIcon } from "@phosphor-icons/react";

type Props = {
	totalResumes: number;
	lastUpdated?: string;
};

export function DashboardStats({ totalResumes, lastUpdated }: Props) {
	const stats = [
		{
			icon: FileTextIcon,
			label: "Total Resumes",
			value: totalResumes,
			large: true,
			colorClass: "bg-primary/10 text-primary",
		},
		{
			icon: ClockCounterClockwiseIcon,
			label: "Last Updated",
			value: lastUpdated ?? "—",
			large: false,
			colorClass: "bg-emerald-500/10 text-emerald-500",
		},
		{
			icon: EyeIcon,
			label: "Profile Views",
			value: "—",
			large: true,
			colorClass: "bg-amber-500/10 text-amber-500",
		},
		{
			icon: DownloadSimpleIcon,
			label: "Downloads",
			value: "—",
			large: true,
			colorClass: "bg-pink-500/10 text-pink-500",
		},
	] as const;

	return (
		<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{stats.map(({ icon: Icon, label, value, large, colorClass }) => (
				<div
					key={label}
					className="rounded-2xl border bg-card p-5 transition-all duration-150 hover:border-primary/20 hover:shadow-sm"
				>
					{/* Icon pill */}
					<div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${colorClass}`}>
						<Icon size={18} weight="duotone" />
					</div>

					<p className="text-muted-foreground text-xs">{label}</p>
					<p className={`mt-1 font-bold text-foreground tracking-tight ${large ? "text-3xl" : "text-lg"}`}>{value}</p>
				</div>
			))}
		</div>
	);
}
