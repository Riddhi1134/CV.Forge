import { t } from "@lingui/core/macro";
import { PlusIcon } from "@phosphor-icons/react";
import { useDialogStore } from "@/dialogs/store";
import { BaseCard } from "./base-card";

export function CreateResumeCard() {
	const { openDialog } = useDialogStore();

	return (
		<BaseCard
			title={t`Create a new resume`}
			description={t`Start building your resume from scratch`}
			onClick={() => openDialog("resume.create", undefined)}
		>
			<div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
				<div className="rounded-full bg-primary/10 p-5">
					<PlusIcon className="size-10 text-primary" />
				</div>

				<div className="text-center">
					<p className="font-semibold">Create Resume</p>

					<p className="text-muted-foreground text-xs">Start building from scratch</p>
				</div>
			</div>
		</BaseCard>
	);
}
