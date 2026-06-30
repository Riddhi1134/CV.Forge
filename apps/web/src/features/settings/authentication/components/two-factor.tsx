// import { Trans } from "@lingui/react/macro";
// import { KeyIcon, LockOpenIcon, ToggleLeftIcon, ToggleRightIcon } from "@phosphor-icons/react";
// import { m } from "motion/react";
// import { useCallback, useMemo } from "react";
// import { match } from "ts-pattern";
// import { Button } from "@reactive-resume/ui/components/button";
// import { Separator } from "@reactive-resume/ui/components/separator";
// import { useDialogStore } from "@/dialogs/store";
// import { authClient } from "@/libs/auth/client";
// import { useAuthAccounts } from "./hooks";

// export function TwoFactorSection() {
// 	const { openDialog } = useDialogStore();
// 	const { hasAccount } = useAuthAccounts();
// 	const { data: session } = authClient.useSession();

// 	const hasPassword = useMemo(() => hasAccount("credential"), [hasAccount]);
// 	const hasTwoFactor = useMemo(() => session?.user.twoFactorEnabled ?? false, [session]);

// 	const handleTwoFactorAction = useCallback(() => {
// 		if (hasTwoFactor) {
// 			openDialog("auth.two-factor.disable", undefined);
// 		} else {
// 			openDialog("auth.two-factor.enable", undefined);
// 		}
// 	}, [hasTwoFactor, openDialog]);

// 	if (!hasPassword) return null;

// 	return (
// 		<m.div
// 			className="will-change-[transform,opacity]"
// 			initial={{ opacity: 0, y: -20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.2, delay: 0.2, ease: "easeOut" }}
// 		>
// 			<Separator />

// 			<div className="mt-4 flex items-center justify-between gap-x-4">
// 				<h2 className="flex items-center gap-x-3 font-medium text-base">
// 					{hasTwoFactor ? <LockOpenIcon /> : <KeyIcon />}
// 					<Trans>Two-Factor Authentication</Trans>
// 				</h2>

// 				{match(hasTwoFactor)
// 					.with(true, () => (
// 						<m.div
// 							className="will-change-transform"
// 							whileHover={{ y: -1, scale: 1.01 }}
// 							whileTap={{ scale: 0.99 }}
// 							transition={{ duration: 0.14, ease: "easeOut" }}
// 						>
// 							<Button variant="outline" onClick={handleTwoFactorAction}>
// 								<ToggleLeftIcon />
// 								<Trans>Disable 2FA</Trans>
// 							</Button>
// 						</m.div>
// 					))
// 					.with(false, () => (
// 						<m.div
// 							className="will-change-transform"
// 							whileHover={{ y: -1, scale: 1.01 }}
// 							whileTap={{ scale: 0.99 }}
// 							transition={{ duration: 0.14, ease: "easeOut" }}
// 						>
// 							<Button variant="outline" onClick={handleTwoFactorAction}>
// 								<ToggleRightIcon />
// 								<Trans>Enable 2FA</Trans>
// 							</Button>
// 						</m.div>
// 					))
// 					.exhaustive()}
// 			</div>
// 		</m.div>
// 	);
// }

import { Trans } from "@lingui/react/macro";
import { CheckCircleIcon, ShieldCheckIcon, ShieldWarningIcon, XCircleIcon } from "@phosphor-icons/react";
import { m } from "motion/react";
import { useCallback, useMemo } from "react";
import { match } from "ts-pattern";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@reactive-resume/ui/components/card";
import { useDialogStore } from "@/dialogs/store";
import { authClient } from "@/libs/auth/client";
import { useAuthAccounts } from "./hooks";

export function TwoFactorSection() {
	const { openDialog } = useDialogStore();
	const { hasAccount } = useAuthAccounts();
	const { data: session } = authClient.useSession();

	const hasPassword = useMemo(() => hasAccount("credential"), [hasAccount]);
	const hasTwoFactor = useMemo(() => session?.user.twoFactorEnabled ?? false, [session]);

	const handleTwoFactorAction = useCallback(() => {
		if (hasTwoFactor) {
			openDialog("auth.two-factor.disable", undefined);
		} else {
			openDialog("auth.two-factor.enable", undefined);
		}
	}, [hasTwoFactor, openDialog]);

	if (!hasPassword) return null;

	return (
		<m.div
			className="will-change-[transform,opacity]"
			initial={{ opacity: 0, y: -16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
		>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div
								className={[
									"flex size-9 items-center justify-center rounded-lg",
									hasTwoFactor ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500",
								].join(" ")}
							>
								{hasTwoFactor ? <ShieldCheckIcon className="size-4" /> : <ShieldWarningIcon className="size-4" />}
							</div>
							<div>
								<CardTitle>
									<Trans>Two-Factor Authentication</Trans>
								</CardTitle>
								<CardDescription className="mt-0.5">
									{hasTwoFactor ? (
										<Trans>Your account has an extra layer of security.</Trans>
									) : (
										<Trans>Add an extra layer of security to your account.</Trans>
									)}
								</CardDescription>
							</div>
						</div>
						<div className="flex shrink-0 items-center gap-3">
							<Badge
								variant="secondary"
								className={[
									"gap-1 text-xs",
									hasTwoFactor ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600",
								].join(" ")}
							>
								{hasTwoFactor ? (
									<>
										<CheckCircleIcon className="size-3" />
										<Trans>Enabled</Trans>
									</>
								) : (
									<>
										<XCircleIcon className="size-3" />
										<Trans>Disabled</Trans>
									</>
								)}
							</Badge>
							{match(hasTwoFactor)
								.with(true, () => (
									<Button size="sm" variant="outline" onClick={handleTwoFactorAction}>
										<Trans>Disable 2FA</Trans>
									</Button>
								))
								.with(false, () => (
									<Button size="sm" variant="default" onClick={handleTwoFactorAction}>
										<ShieldCheckIcon className="size-3.5" />
										<Trans>Enable 2FA</Trans>
									</Button>
								))
								.exhaustive()}
						</div>
					</div>
				</CardHeader>
			</Card>
		</m.div>
	);
}
