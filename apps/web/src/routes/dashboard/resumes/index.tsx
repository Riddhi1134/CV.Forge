import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { FunnelIcon, GridFourIcon, ListIcon, ReadCvLogoIcon, SortAscendingIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import z from "zod";
import { Separator } from "@reactive-resume/ui/components/separator";
import { Tabs, TabsList, TabsTrigger } from "@reactive-resume/ui/components/tabs";
import { cn } from "@reactive-resume/utils/style";
import { Combobox } from "@/components/ui/combobox";
import { orpc } from "@/libs/orpc/client";
import { DashboardHeader } from "../-components/header";
import { DashboardActions } from "./-components/dashboard-actions";
import { DashboardBanner } from "./-components/dashboard-banner";
import { DashboardStats } from "./-components/dashboard-stats";
import { GridView } from "./-components/grid-view";
import { ListView } from "./-components/list-view";

type SortOption = "lastUpdatedAt" | "createdAt" | "name";

const searchSchema = z.object({
	tags: z.array(z.string()).default([]),
	sort: z.enum(["lastUpdatedAt", "createdAt", "name"]).default("lastUpdatedAt"),
	view: z.enum(["grid", "list"]).default("grid"),
});

type Search = z.output<typeof searchSchema>;

const defaultSearch: Search = { tags: [], sort: "lastUpdatedAt", view: "grid" };

export const Route = createFileRoute("/dashboard/resumes/")({
	component: RouteComponent,
	validateSearch: searchSchema,
	search: { middlewares: [stripSearchParams(defaultSearch)] },
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const { i18n } = useLingui();
	const { tags, sort, view } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	const { data: allTags } = useQuery(orpc.resume.tags.list.queryOptions());
	const { data: resumes } = useQuery(orpc.resume.list.queryOptions({ input: { tags, sort } }));

	const totalResumes = resumes?.length ?? 0;
	const isEmpty = !resumes || resumes.length === 0;

	const lastUpdated = resumes?.[0]?.updatedAt
		? new Intl.DateTimeFormat(i18n.locale, { dateStyle: "medium" }).format(new Date(resumes[0].updatedAt))
		: undefined;

	const tagOptions = useMemo(() => (allTags ?? []).map((tag) => ({ value: tag, label: tag })), [allTags]);

	const sortOptions = useMemo(
		() => [
			{ value: "lastUpdatedAt", label: i18n.t("Last Updated") },
			{ value: "createdAt", label: i18n.t("Created") },
			{ value: "name", label: i18n.t("Name") },
		],
		[i18n],
	);

	const [scrolled, setScrolled] = useState(false);
	useEffect(() => {
		const fn = () => setScrolled(window.scrollY > 10);
		window.addEventListener("scroll", fn);
		return () => window.removeEventListener("scroll", fn);
	}, []);

	return (
		<div className="space-y-6">
			{/* Hero banner */}
			<DashboardBanner name={session?.user?.name} />

			{/* Stats row */}
			<DashboardStats totalResumes={totalResumes} lastUpdated={lastUpdated} />

			{/* Quick actions */}
			<DashboardActions />

			{/* ── Your Resumes ── */}
			<div className="space-y-4">
				{/* Section title row */}
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2.5">
						<DashboardHeader icon={ReadCvLogoIcon} title={t`Your Resumes`} />
						{totalResumes > 0 && (
							<span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
								{totalResumes}
							</span>
						)}
					</div>
					<p className="hidden text-muted-foreground text-xs sm:block">
						<Trans>Manage, edit and organize all your resumes in one place.</Trans>
					</p>
				</div>

				<p className="text-muted-foreground text-xs sm:hidden">
					<Trans>Manage, edit and organize all your resumes in one place.</Trans>
				</p>

				<Separator className="opacity-50" />

				{/* Sticky filter bar */}
				<div
					className={cn(
						"sticky top-0 z-20 flex flex-wrap items-center gap-3 rounded-xl border bg-card/80 px-4 py-3 backdrop-blur-xl transition-all duration-200",
						scrolled && "shadow-[0_4px_24px_rgba(0,0,0,0.25)]",
					)}
				>
					{/* Sort */}
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<SortAscendingIcon size={15} />
						<span className="font-medium text-foreground/70">
							<Trans>Sort</Trans>
						</span>
						<Combobox
							value={sort}
							options={sortOptions}
							placeholder={t`Sort by`}
							onValueChange={(value) => {
								if (!value) return;
								void navigate({
									search: (prev: Search) => ({ ...prev, sort: value as SortOption }),
								});
							}}
						/>
					</div>

					{/* Vertical divider */}
					<div className="h-4 w-px bg-border" />

					{/* Filter */}
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<FunnelIcon size={15} />
						<span className="font-medium text-foreground/70">
							<Trans>Filter</Trans>
						</span>
						<Combobox
							multiple
							value={tags}
							options={tagOptions}
							placeholder={t`All tags`}
							onValueChange={(value) => {
								void navigate({
									search: (prev: Search) => ({ ...prev, tags: value ?? [] }),
								});
							}}
						/>
					</div>

					{/* Grid / List toggle */}
					<Tabs className="ltr:ms-auto rtl:me-auto" value={view}>
						<TabsList>
							<TabsTrigger
								value="grid"
								nativeButton={false}
								className="rounded-r-none"
								render={<Link to="." search={(prev: Search) => ({ ...prev, view: "grid" })} />}
							>
								<GridFourIcon />
								<Trans>Grid</Trans>
							</TabsTrigger>
							<TabsTrigger
								value="list"
								nativeButton={false}
								className="rounded-l-none"
								render={<Link to="." search={(prev: Search) => ({ ...prev, view: "list" })} />}
							>
								<ListIcon />
								<Trans>List</Trans>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>

				{/* Empty state */}
				{isEmpty ? (
					<div className="flex min-h-[42vh] flex-col items-center justify-center gap-5 rounded-2xl border border-border/60 border-dashed bg-card/40 px-4 text-center">
						<div className="rounded-full bg-primary/10 p-5">
							<ReadCvLogoIcon className="h-9 w-9 text-primary" />
						</div>
						<div className="space-y-1">
							<h2 className="font-semibold text-xl tracking-tight">
								<Trans>No resumes yet</Trans>
							</h2>
							<p className="max-w-sm text-muted-foreground text-sm">
								<Trans>Create your first resume and start building your professional profile in minutes.</Trans>
							</p>
						</div>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => navigate({ to: "/dashboard/resumes/create" })}
								className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
							>
								<Trans>Create Resume</Trans>
							</button>
							<button
								type="button"
								onClick={() => navigate({ to: "/dashboard/resumes/import" })}
								className="rounded-lg border px-5 py-2 font-medium text-foreground text-sm transition-colors hover:bg-secondary"
							>
								<Trans>Import Resume</Trans>
							</button>
						</div>
					</div>
				) : view === "list" ? (
					<ListView resumes={resumes ?? []} />
				) : (
					<GridView resumes={resumes ?? []} />
				)}
			</div>
		</div>
	);
}
