import type { RouterOutput } from "@/libs/orpc/client";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { LockSimpleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, m } from "motion/react";
import { useMemo } from "react";
import { ResumeContextMenu } from "../menus/context-menu";
import { BaseCard } from "./base-card";
import { ResumeThumbnail } from "./resume-thumbnail";

type ResumeCardProps = {
	resume: RouterOutput["resume"]["list"][number];
};

type ResumeLockOverlayProps = {
	isLocked: boolean;
};

export function ResumeCard({ resume }: ResumeCardProps) {
	const { i18n } = useLingui();

	const updatedAt = useMemo(() => {
		return Intl.DateTimeFormat(i18n.locale, { dateStyle: "long", timeStyle: "short" }).format(resume.updatedAt);
	}, [i18n.locale, resume.updatedAt]);

	return (
		<ResumeContextMenu resume={resume}>
			<Link to="/builder/$resumeId" params={{ resumeId: resume.id }} className="block cursor-pointer">
				<m.div
					className="group relative transition-all duration-300 hover:border-primary/30 hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)]"
					whileHover={{ y: -6, scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					transition={{ type: "spring", stiffness: 260, damping: 20 }}
				>
					<BaseCard title={resume.name} description={t`Last updated on ${updatedAt}`} tags={resume.tags}>
						<ResumeThumbnail resume={resume} isLocked={resume.isLocked} />

						<ResumeLockOverlay isLocked={resume.isLocked} />
					</BaseCard>
				</m.div>
			</Link>
		</ResumeContextMenu>
	);
}

function ResumeLockOverlay({ isLocked }: ResumeLockOverlayProps) {
	return (
		<AnimatePresence>
			{isLocked && (
				<m.div
					key="resume-lock-overlay"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
					className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm"
				>
					<div className="flex items-center justify-center rounded-full bg-popover p-6">
						<LockSimpleIcon weight="thin" className="size-12 opacity-60" />
					</div>
				</m.div>
			)}
		</AnimatePresence>
	);
}
