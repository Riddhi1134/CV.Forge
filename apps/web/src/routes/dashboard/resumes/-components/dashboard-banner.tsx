import { SparkleIcon } from "@phosphor-icons/react";
import { useMemo } from "react";

type Props = {
	name?: string;
};

export function DashboardBanner({ name }: Props) {
	const greeting = useMemo(() => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good Morning";
		if (hour < 17) return "Good Afternoon";
		return "Good Evening";
	}, []);

	return (
		<div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-8 shadow-sm">
			{/* Soft indigo glow — top right */}
			<div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
			{/* Soft pink glow — bottom left */}
			<div className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-pink-500/8 blur-3xl" />

			<div className="relative z-10">
				{/* Badge */}
				<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 font-medium text-primary text-xs">
					<SparkleIcon size={13} weight="fill" />
					<span>CV-Forge Dashboard</span>
				</div>

				{/* Greeting */}
				<h1 className="font-bold text-3xl text-foreground tracking-tight">
					{greeting}
					{name ? `, ${name}` : ""} 👋
				</h1>

				{/* Subtitle */}
				<p className="mt-2 max-w-xl text-muted-foreground text-sm leading-relaxed">
					Welcome back! Manage resumes, track performance, and build professional CVs faster than ever.
				</p>
			</div>
		</div>
	);
}
