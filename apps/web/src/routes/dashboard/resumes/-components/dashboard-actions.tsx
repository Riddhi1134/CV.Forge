import { DownloadSimpleIcon, FilePlusIcon, FilesIcon, ScanIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@reactive-resume/utils/style";
import { useDialogStore } from "@/dialogs/store";

type ActionCardProps = {
	icon: React.ReactNode;
	label: string;
	subtitle: string;
	onClick?: () => void;
	className?: string;
};

function ActionCard({ icon, label, subtitle, onClick, className }: ActionCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"group flex items-center gap-3 rounded-xl border bg-secondary/50 p-4 text-left",
				"transition-all duration-150 hover:border-primary/30 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
				className,
			)}
		>
			<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
				{icon}
			</div>
			<div className="min-w-0">
				<p className="truncate font-medium text-foreground text-sm leading-snug">{label}</p>
				<p className="truncate text-muted-foreground text-xs">{subtitle}</p>
			</div>
		</button>
	);
}

export function DashboardActions() {
	const { openDialog } = useDialogStore();
	const navigate = useNavigate();

	return (
		<div className="rounded-2xl border bg-card p-5">
			<div className="mb-4">
				<h2 className="font-semibold text-foreground text-sm">Quick Actions</h2>
				<p className="mt-0.5 text-muted-foreground text-xs">Common actions you use most often.</p>
			</div>

			<div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
				<ActionCard
					icon={<FilePlusIcon size={18} weight="duotone" />}
					label="Create Resume"
					subtitle="Start from scratch"
					onClick={() => openDialog("resume.create", undefined)}
				/>
				<ActionCard
					icon={<DownloadSimpleIcon size={18} weight="duotone" />}
					label="Import Resume"
					subtitle="Upload existing file"
					onClick={() => openDialog("resume.import", undefined)}
				/>
				<ActionCard
					icon={<FilesIcon size={18} weight="duotone" />}
					label="Templates"
					subtitle="Browse designs"
					onClick={() =>
						void navigate({
							to: "/dashboard/templates",
						})
					}
				/>

				<ActionCard
					icon={<ScanIcon size={18} weight="duotone" />}
					label="ATS Scanner"
					subtitle="Check your score"
					onClick={() => void navigate({ to: "/dashboard/ats-scanner" })}
				/>
			</div>
		</div>
	);
}
