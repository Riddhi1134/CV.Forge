// import { useMemo } from "react";
// import { SparkleIcon } from "@phosphor-icons/react";

// type Props = {
// 	name?: string;
// };

// export function DashboardBanner({ name }: Props) {
// 	const greeting = useMemo(() => {
// 		const hour = new Date().getHours();

// 		if (hour < 12) return "Good Morning";
// 		if (hour < 17) return "Good Afternoon";

// 		return "Good Evening";
// 	}, []);

// 	return (
// 		<div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 p-8 text-white shadow-xl">
// 			<div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
// 			<div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

// 			<div className="relative z-10">
// 				<div className="mb-3 flex items-center gap-2">
// 					<SparkleIcon size={22} weight="fill" />
// 					<span className="text-sm font-medium opacity-90">
// 						Reactive Resume Dashboard
// 					</span>
// 				</div>

// 				<h1 className="text-3xl font-bold tracking-tight">
// 					{greeting}
// 					{name ? `, ${name}` : ""} 👋
// 				</h1>

// 				<p className="mt-2 max-w-2xl text-white/80">
// 					Welcome back! Manage resumes, track performance,
// 					and build professional CVs faster than ever.
// 				</p>
// 			</div>
// 		</div>
// 	);
// }

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
					<span>Reactive Resume Dashboard</span>
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
