// import { t } from "@lingui/core/macro";
// import { Trans } from "@lingui/react/macro";
// import { KeyIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { m } from "motion/react";
// import { toast } from "sonner";
// import { Button } from "@reactive-resume/ui/components/button";
// import { Separator } from "@reactive-resume/ui/components/separator";
// import { usePrompt } from "@/hooks/use-prompt";
// import { authClient } from "@/libs/auth/client";
// import { getReadableErrorMessage } from "@/libs/error-message";

// export function PasskeysSection() {
// 	const queryClient = useQueryClient();
// 	const prompt = usePrompt();

// 	const { data: passkeys = [] } = useQuery({
// 		queryKey: ["auth", "passkeys"],
// 		queryFn: () => authClient.passkey.listUserPasskeys(),
// 		select: ({ data }) => data ?? [],
// 	});

// 	const registerPasskeyMutation = useMutation({
// 		mutationFn: async () => {
// 			return await authClient.passkey.addPasskey();
// 		},
// 		onSuccess: async ({ data, error }) => {
// 			if (error) {
// 				toast.error(
// 					getReadableErrorMessage(
// 						error,
// 						t({
// 							comment: "Fallback toast when passkey registration fails",
// 							message: "Failed to register passkey. Please try again.",
// 						}),
// 					),
// 				);
// 				return;
// 			}

// 			toast.success(t`Passkey registered successfully.`);
// 			await queryClient.invalidateQueries({ queryKey: ["auth", "passkeys"] });

// 			const name = await prompt(t`Enter a name for your passkey.`, {
// 				description: t`This will help you identify it later, if you plan to have multiple passkeys.`,
// 				defaultValue: "",
// 				confirmText: t({
// 					comment: "Passkey rename prompt confirm action in authentication settings",
// 					message: "Save",
// 				}),
// 			});
// 			if (name === null) return;

// 			const passkeyId = typeof data?.id === "string" ? data.id : null;
// 			const passkeyName = name.trim();
// 			if (!passkeyId || passkeyName.length === 0) return;

// 			const { error: renameError } = await authClient.passkey.updatePasskey({ id: passkeyId, name: passkeyName });
// 			if (renameError) {
// 				toast.error(
// 					getReadableErrorMessage(
// 						renameError,
// 						t({
// 							comment: "Fallback toast when renaming a passkey fails",
// 							message: "Failed to rename passkey. Please try again.",
// 						}),
// 					),
// 				);
// 				return;
// 			}

// 			await queryClient.invalidateQueries({ queryKey: ["auth", "passkeys"] });
// 		},
// 		onError: () => {
// 			toast.error(t`Failed to register passkey. Please try again.`);
// 		},
// 	});

// 	const deletePasskeyMutation = useMutation({
// 		mutationFn: async (id: string) => {
// 			return await authClient.passkey.deletePasskey({ id });
// 		},
// 		onSuccess: async ({ error }) => {
// 			if (error) {
// 				toast.error(
// 					getReadableErrorMessage(
// 						error,
// 						t({
// 							comment: "Fallback toast when deleting a passkey fails",
// 							message: "Failed to delete passkey. Please try again.",
// 						}),
// 					),
// 				);
// 				return;
// 			}

// 			toast.success(t`Passkey deleted successfully.`);
// 			await queryClient.invalidateQueries({ queryKey: ["auth", "passkeys"] });
// 		},
// 		onError: () => {
// 			toast.error(t`Failed to delete passkey. Please try again.`);
// 		},
// 	});

// 	const handleRegisterPasskey = () => {
// 		if (registerPasskeyMutation.isPending) return;
// 		registerPasskeyMutation.mutate();
// 	};

// 	const handleDeletePasskey = (id: string) => {
// 		if (deletePasskeyMutation.isPending) return;
// 		deletePasskeyMutation.mutate(id);
// 	};

// 	return (
// 		<m.div
// 			initial={{ opacity: 0, y: -20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.2, delay: 0.3, ease: "easeOut" }}
// 			className="will-change-[transform,opacity]"
// 		>
// 			<Separator />

// 			<div className="mt-4 grid gap-3">
// 				<div className="flex flex-wrap items-center justify-between gap-3">
// 					<h2 className="flex items-center gap-x-3 font-medium text-base">
// 						<KeyIcon />
// 						<Trans>Passkeys</Trans>
// 					</h2>

// 					<Button variant="outline" onClick={handleRegisterPasskey} disabled={registerPasskeyMutation.isPending}>
// 						<PlusIcon />
// 						<Trans>Register New Device</Trans>
// 					</Button>
// 				</div>

// 				{passkeys.length === 0 && (
// 					<p className="text-muted-foreground text-sm">
// 						<Trans>No passkeys registered yet.</Trans>
// 					</p>
// 				)}

// 				{passkeys.length > 0 && (
// 					<div className="grid gap-2">
// 						{passkeys.map((passkey) => {
// 							return (
// 								<div
// 									key={passkey.id}
// 									className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2"
// 								>
// 									<p className="truncate font-medium text-sm">{passkey.name ?? t`Unnamed passkey`}</p>

// 									<div className="flex items-center gap-2">
// 										<Button
// 											variant="destructive"
// 											size="sm"
// 											onClick={() => handleDeletePasskey(passkey.id)}
// 											disabled={deletePasskeyMutation.isPending}
// 										>
// 											<TrashIcon />
// 											<Trans comment="Passkey row action to remove the selected passkey">Delete</Trans>
// 										</Button>
// 									</div>
// 								</div>
// 							);
// 						})}
// 					</div>
// 				)}
// 			</div>
// 		</m.div>
// 	);
// }

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { FingerprintIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "motion/react";
import { toast } from "sonner";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reactive-resume/ui/components/card";
import { usePrompt } from "@/hooks/use-prompt";
import { authClient } from "@/libs/auth/client";
import { getReadableErrorMessage } from "@/libs/error-message";

export function PasskeysSection() {
	const queryClient = useQueryClient();
	const prompt = usePrompt();

	const { data: passkeys = [] } = useQuery({
		queryKey: ["auth", "passkeys"],
		queryFn: () => authClient.passkey.listUserPasskeys(),
		select: ({ data }) => data ?? [],
	});

	const registerPasskeyMutation = useMutation({
		mutationFn: async () => {
			return await authClient.passkey.addPasskey();
		},
		onSuccess: async ({ data, error }) => {
			if (error) {
				toast.error(getReadableErrorMessage(error, t`Failed to register passkey. Please try again.`));
				return;
			}

			toast.success(t`Passkey registered successfully.`);
			await queryClient.invalidateQueries({ queryKey: ["auth", "passkeys"] });

			const name = await prompt(t`Enter a name for your passkey.`, {
				description: t`This will help you identify it later, if you plan to have multiple passkeys.`,
				defaultValue: "",
				confirmText: t`Save`,
			});
			if (name === null) return;

			const passkeyId = typeof data?.id === "string" ? data.id : null;
			const passkeyName = name.trim();
			if (!passkeyId || passkeyName.length === 0) return;

			const { error: renameError } = await authClient.passkey.updatePasskey({ id: passkeyId, name: passkeyName });
			if (renameError) {
				toast.error(getReadableErrorMessage(renameError, t`Failed to rename passkey. Please try again.`));
				return;
			}

			await queryClient.invalidateQueries({ queryKey: ["auth", "passkeys"] });
		},
		onError: () => {
			toast.error(t`Failed to register passkey. Please try again.`);
		},
	});

	const deletePasskeyMutation = useMutation({
		mutationFn: async (id: string) => {
			return await authClient.passkey.deletePasskey({ id });
		},
		onSuccess: async ({ error }) => {
			if (error) {
				toast.error(getReadableErrorMessage(error, t`Failed to delete passkey. Please try again.`));
				return;
			}
			toast.success(t`Passkey deleted successfully.`);
			await queryClient.invalidateQueries({ queryKey: ["auth", "passkeys"] });
		},
		onError: () => {
			toast.error(t`Failed to delete passkey. Please try again.`);
		},
	});

	return (
		<m.div
			initial={{ opacity: 0, y: -16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, delay: 0.15, ease: "easeOut" }}
			className="will-change-[transform,opacity]"
		>
			<Card>
				<CardHeader className={passkeys.length > 0 ? "border-b" : ""}>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
								<FingerprintIcon className="size-4" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<CardTitle>
										<Trans>Passkeys</Trans>
									</CardTitle>
									{passkeys.length > 0 && (
										<Badge variant="secondary" className="px-1.5 py-0 text-xs">
											{passkeys.length}
										</Badge>
									)}
								</div>
								<CardDescription className="mt-0.5">
									<Trans>Sign in securely without a password using biometrics.</Trans>
								</CardDescription>
							</div>
						</div>
						<Button
							size="sm"
							variant="outline"
							onClick={() => {
								if (!registerPasskeyMutation.isPending) registerPasskeyMutation.mutate();
							}}
							disabled={registerPasskeyMutation.isPending}
						>
							<PlusIcon className="size-3.5" />
							<Trans>Add Passkey</Trans>
						</Button>
					</div>
				</CardHeader>

				{passkeys.length === 0 && (
					<CardContent className="pt-4">
						<div className="flex flex-col items-center gap-2 rounded-lg border border-border border-dashed py-6 text-center">
							<FingerprintIcon className="size-7 text-muted-foreground/40" />
							<p className="text-muted-foreground text-sm">
								<Trans>No passkeys registered yet.</Trans>
							</p>
							<p className="text-muted-foreground/60 text-xs">
								<Trans>Add a passkey to sign in with Face ID, Touch ID, or a security key.</Trans>
							</p>
						</div>
					</CardContent>
				)}

				{passkeys.length > 0 && (
					<CardContent className="pt-0 pb-2">
						<div className="divide-y divide-border">
							{passkeys.map((passkey) => (
								<div key={passkey.id} className="flex items-center justify-between gap-3 py-3">
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-violet-500/10">
											<FingerprintIcon className="size-3.5 text-violet-500" />
										</div>
										<p className="truncate font-medium text-sm">{passkey.name ?? t`Unnamed passkey`}</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
										onClick={() => {
											if (!deletePasskeyMutation.isPending) deletePasskeyMutation.mutate(passkey.id);
										}}
										disabled={deletePasskeyMutation.isPending}
									>
										<TrashIcon className="size-3.5" />
										<Trans>Remove</Trans>
									</Button>
								</div>
							))}
						</div>
					</CardContent>
				)}
			</Card>
		</m.div>
	);
}
