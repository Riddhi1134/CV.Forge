import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { ArrowUpRightIcon, CheckIcon, MoonIcon, SunIcon, TranslateIcon } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { m } from "motion/react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reactive-resume/ui/components/card";
import { getLocaleOptions } from "@/features/locale/combobox";
import { useTheme } from "@/features/theme/provider";
import { isLocale, loadLocale, setLocaleCookie } from "@/libs/locale";
import { isTheme } from "@/libs/theme";

// ─── Theme Tile ───────────────────────────────────────────────────────────────

const THEME_CONFIG = [
	{
		value: "light",
		label: "Light",
		icon: SunIcon,
		preview: {
			bg: "#ffffff",
			sidebar: "#f4f4f5",
			card: "#ffffff",
			text: "#18181b",
			accent: "#3b82f6",
			border: "#e4e4e7",
		},
	},
	{
		value: "dark",
		label: "Dark",
		icon: MoonIcon,
		preview: {
			bg: "#09090b",
			sidebar: "#18181b",
			card: "#1c1c1f",
			text: "#fafafa",
			accent: "#60a5fa",
			border: "#27272a",
		},
	},
] as const;

function ThemePreview({ preview }: { preview: (typeof THEME_CONFIG)[number]["preview"] }) {
	return (
		<div
			className="relative h-20 w-full overflow-hidden rounded-lg"
			style={{ background: preview.bg, border: `1px solid ${preview.border}` }}
		>
			{/* Mini sidebar */}
			<div
				className="absolute top-0 left-0 flex h-full w-8 flex-col gap-1 p-1.5"
				style={{ background: preview.sidebar, borderRight: `1px solid ${preview.border}` }}
			>
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-1.5 rounded-sm"
						style={{ background: i === 1 ? preview.accent : preview.border, width: i === 1 ? "80%" : "60%" }}
					/>
				))}
			</div>
			{/* Content area */}
			<div className="absolute top-2 right-2 left-10 flex flex-col gap-1.5">
				<div className="h-2 w-16 rounded-sm" style={{ background: preview.text, opacity: 0.8 }} />
				<div
					className="h-8 w-full rounded-md p-1.5"
					style={{ background: preview.card, border: `1px solid ${preview.border}` }}
				>
					<div className="h-1.5 w-10 rounded-sm" style={{ background: preview.text, opacity: 0.4 }} />
					<div className="mt-1 h-1.5 w-16 rounded-sm" style={{ background: preview.text, opacity: 0.2 }} />
				</div>
				<div className="h-3 w-10 rounded-sm" style={{ background: preview.accent, opacity: 0.9 }} />
			</div>
		</div>
	);
}

function ThemeTiles() {
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	const onSelect = async (value: string) => {
		if (!isTheme(value)) return;
		setTheme(value);
		void router.invalidate();
	};

	return (
		<div className="grid grid-cols-2 gap-3">
			{THEME_CONFIG.map(({ value, label, icon: Icon, preview }) => {
				const active = theme === value;
				return (
					<button
						type="button"
						key={value}
						onClick={() => onSelect(value)}
						className={[
							"group relative flex flex-col gap-2.5 rounded-xl p-3 text-left transition-all duration-200",
							"ring-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
							active
								? "bg-primary/5 shadow-sm ring-primary"
								: "bg-muted/30 ring-border hover:bg-muted/60 hover:ring-foreground/20",
						].join(" ")}
					>
						<ThemePreview preview={preview} />
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Icon className="size-3.5 text-muted-foreground" />
								<span className="font-medium text-foreground text-xs">{label}</span>
							</div>
							{active && (
								<div className="flex size-4 items-center justify-center rounded-full bg-primary">
									<CheckIcon className="size-2.5 text-primary-foreground" weight="bold" />
								</div>
							)}
						</div>
					</button>
				);
			})}
		</div>
	);
}

// ─── Language Grid ────────────────────────────────────────────────────────────

function LanguageGrid() {
	const { i18n } = useLingui();
	const options = getLocaleOptions();
	const current = i18n.locale;

	const onSelect = async (value: string) => {
		if (!isLocale(value)) return;
		setLocaleCookie(value);
		await loadLocale(value);
		window.location.reload();
	};

	return (
		<div className="flex flex-col gap-3">
			{/* Current selection pill */}
			<div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
				<TranslateIcon className="size-3.5 shrink-0 text-muted-foreground" />
				<span className="text-muted-foreground text-xs">
					<Trans>Current:</Trans>
				</span>
				<span className="font-semibold text-foreground text-xs">
					{options.find((o) => o.value === current)?.label ?? current}
				</span>
				<Badge className="ml-auto px-1.5 py-0 text-[10px]" variant="secondary">
					{current}
				</Badge>
			</div>

			{/* Scrollable language list */}
			<div className="max-h-52 divide-y divide-border overflow-y-auto rounded-lg ring-1 ring-border">
				{options.map((opt) => {
					const active = opt.value === current;
					return (
						<button
							type="button"
							key={opt.value}
							onClick={() => onSelect(opt.value)}
							className={[
								"flex w-full items-center justify-between px-3 py-2 text-left transition-colors",
								active ? "bg-primary/8 text-primary" : "text-foreground hover:bg-muted/50",
							].join(" ")}
						>
							<span className="font-medium text-xs">{opt.label}</span>
							<div className="flex items-center gap-2">
								<span className="font-mono text-[10px] text-muted-foreground">{opt.value}</span>
								{active && <CheckIcon className="size-3 text-primary" weight="bold" />}
							</div>
						</button>
					);
				})}
			</div>

			{/* Contribute link */}
			<a
				href="https://crowdin.com/project/reactive-resume"
				target="_blank"
				rel="noopener noreferrer"
				className="group flex items-center gap-2 rounded-lg border border-border border-dashed px-3 py-2.5 transition-colors hover:border-primary/50 hover:bg-primary/5"
			>
				<TranslateIcon className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
				<span className="text-muted-foreground text-xs transition-colors group-hover:text-foreground">
					<Trans>Help translate the app to your language</Trans>
				</span>
				<ArrowUpRightIcon className="ml-auto size-3 text-muted-foreground transition-colors group-hover:text-primary" />
			</a>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PreferencesSettingsPage() {
	return (
		<m.div
			initial={{ opacity: 0, y: -16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
			className="grid max-w-lg gap-4 will-change-[transform,opacity]"
		>
			{/* Theme */}
			<m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.2 }}>
				<Card>
					<CardHeader className="border-b">
						<CardTitle>
							<Trans>Appearance</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Choose how Reactive Resume looks on your device.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-4">
						<ThemeTiles />
					</CardContent>
				</Card>
			</m.div>

			{/* Language */}
			<m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.2 }}>
				<Card>
					<CardHeader className="border-b">
						<CardTitle>
							<Trans>Language</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>Select the language used across the interface.</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-4">
						<LanguageGrid />
					</CardContent>
				</Card>
			</m.div>
		</m.div>
	);
}
