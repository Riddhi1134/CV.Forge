import { t } from "@lingui/core/macro";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useDialogStore } from "@/dialogs/store";
import { BaseCard } from "./base-card";

export function ImportResumeCard() {
	const { openDialog } = useDialogStore();

	return (
		<BaseCard
			title={t`Import an existing resume`}
			description={t`Continue where you left off`}
			onClick={() => openDialog("resume.import", undefined)}
		>
			<div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
				<div className="rounded-full bg-primary/10 p-5">
					<DownloadSimpleIcon className="size-10 text-primary" />
				</div>

				<div className="text-center">
					<p className="font-semibold">Import Resume</p>

					<p className="text-muted-foreground text-xs">Upload existing resume</p>
				</div>
			</div>
		</BaseCard>
	);
}
