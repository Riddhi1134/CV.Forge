// import { Trans } from "@lingui/react/macro";
// import { PasswordIcon, PencilSimpleLineIcon } from "@phosphor-icons/react";
// import { Link, useNavigate } from "@tanstack/react-router";
// import { m } from "motion/react";
// import { useCallback, useMemo } from "react";
// import { match } from "ts-pattern";
// import { Button } from "@reactive-resume/ui/components/button";
// import { useDialogStore } from "@/dialogs/store";
// import { useAuthAccounts } from "./hooks";

// export function PasswordSection() {
// 	const navigate = useNavigate();
// 	const { openDialog } = useDialogStore();
// 	const { hasAccount } = useAuthAccounts();

// 	const hasPassword = useMemo(() => hasAccount("credential"), [hasAccount]);

// 	const handleUpdatePassword = useCallback(() => {
// 		if (hasPassword) {
// 			openDialog("auth.change-password", undefined);
// 		} else {
// 			void navigate({ to: "/auth/forgot-password" });
// 		}
// 	}, [hasPassword, navigate, openDialog]);

// 	return (
// 		<m.div
// 			initial={{ opacity: 0, y: -20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
// 			className="flex items-center justify-between gap-x-4 will-change-[transform,opacity]"
// 		>
// 			<h2 className="flex items-center gap-x-3 font-medium text-base">
// 				<PasswordIcon />
// 				<Trans>Password</Trans>
// 			</h2>

// 			{match(hasPassword)
// 				.with(true, () => (
// 					<m.div
// 						className="will-change-transform"
// 						whileHover={{ y: -1, scale: 1.01 }}
// 						whileTap={{ scale: 0.99 }}
// 						transition={{ duration: 0.14, ease: "easeOut" }}
// 					>
// 						<Button variant="outline" onClick={handleUpdatePassword}>
// 							<PencilSimpleLineIcon />
// 							<Trans>Update Password</Trans>
// 						</Button>
// 					</m.div>
// 				))
// 				.with(false, () => (
// 					<m.div
// 						className="will-change-transform"
// 						whileHover={{ y: -1, scale: 1.01 }}
// 						whileTap={{ scale: 0.99 }}
// 						transition={{ duration: 0.14, ease: "easeOut" }}
// 					>
// 						<Button
// 							variant="outline"
// 							nativeButton={false}
// 							render={
// 								<Link to="/auth/forgot-password">
// 									<Trans>Set Password</Trans>
// 								</Link>
// 							}
// 						/>
// 					</m.div>
// 				))
// 				.exhaustive()}
// 		</m.div>
// 	);
// }

import { Trans } from "@lingui/react/macro";
import { LockKeyIcon, PencilSimpleLineIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { m } from "motion/react";
import { useCallback, useMemo } from "react";
import { match } from "ts-pattern";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@reactive-resume/ui/components/card";
import { useDialogStore } from "@/dialogs/store";
import { useAuthAccounts } from "./hooks";

export function PasswordSection() {
	const navigate = useNavigate();
	const { openDialog } = useDialogStore();
	const { hasAccount } = useAuthAccounts();

	const hasPassword = useMemo(() => hasAccount("credential"), [hasAccount]);

	const handleUpdatePassword = useCallback(() => {
		if (hasPassword) {
			openDialog("auth.change-password", undefined);
		} else {
			void navigate({ to: "/auth/forgot-password" });
		}
	}, [hasPassword, navigate, openDialog]);

	return (
		<m.div
			initial={{ opacity: 0, y: -16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
			className="will-change-[transform,opacity]"
		>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<LockKeyIcon className="size-4" />
							</div>
							<div>
								<CardTitle>
									<Trans>Password</Trans>
								</CardTitle>
								<CardDescription className="mt-0.5">
									<Trans>Sign in using your email and password.</Trans>
								</CardDescription>
							</div>
						</div>
						<div className="flex shrink-0 items-center gap-3">
							<Badge variant={hasPassword ? "default" : "secondary"} className="text-xs">
								{hasPassword ? <Trans>Active</Trans> : <Trans>Not set</Trans>}
							</Badge>
							{match(hasPassword)
								.with(true, () => (
									<Button size="sm" variant="outline" onClick={handleUpdatePassword}>
										<PencilSimpleLineIcon className="size-3.5" />
										<Trans>Update</Trans>
									</Button>
								))
								.with(false, () => (
									<Button
										size="sm"
										variant="outline"
										nativeButton={false}
										render={
											<Link to="/auth/forgot-password">
												<PlusCircleIcon className="size-3.5" />
												<Trans>Set Password</Trans>
											</Link>
										}
									/>
								))
								.exhaustive()}
						</div>
					</div>
				</CardHeader>
			</Card>
		</m.div>
	);
}
