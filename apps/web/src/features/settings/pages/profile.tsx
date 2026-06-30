import type { AuthSession } from "@reactive-resume/auth/types";
import type { ChangeEvent } from "react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
	CameraIcon,
	CheckIcon,
	EnvelopeIcon,
	EyeIcon,
	EyeSlashIcon,
	IdentificationCardIcon,
	KeyIcon,
	LockKeyIcon,
	PaperPlaneTiltIcon,
	ShieldCheckIcon,
	SignOutIcon,
	UserIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { AnimatePresence, m } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@reactive-resume/ui/components/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@reactive-resume/ui/components/form";
import { Input } from "@reactive-resume/ui/components/input";
import { authClient } from "@/libs/auth/client";
import { getReadableErrorMessage } from "@/libs/error-message";
import { orpc } from "@/libs/orpc/client";
import { useAppForm } from "@/libs/tanstack-form";

// ─── Zod schema ──────────────────────────────────────────────────────────────

const formSchema = z.object({
	name: z.string().trim().min(1).max(64),
	username: z
		.string()
		.trim()
		.min(1)
		.max(64)
		.regex(/^[a-z0-9._-]+$/, {
			message: "Username can only contain lowercase letters, numbers, dots, hyphens and underscores.",
		}),
	email: z.email().trim(),
});

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your new password"),
	})
	.refine((d) => d.newPassword === d.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.map((w) => w[0]?.toUpperCase() ?? "")
		.slice(0, 2)
		.join("");
}

function nameToHue(name: string): number {
	let hash = 0;
	for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
	return Math.abs(hash) % 360;
}

// ─── Password input with show/hide toggle ──────────────────────────────────

type PasswordInputProps = {
	name: string;
	autoComplete: string;
	value: string;
	onBlur: () => void;
	onChange: (value: string) => void;
};

function PasswordInput({ name, autoComplete, value, onBlur, onChange }: PasswordInputProps) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative">
			<Input
				type={visible ? "text" : "password"}
				autoComplete={autoComplete}
				placeholder="••••••••"
				name={name}
				value={value}
				onBlur={onBlur}
				onChange={(e) => onChange(e.target.value)}
				className="h-10 rounded-lg pr-10"
			/>
			<button
				type="button"
				tabIndex={-1}
				onClick={() => setVisible((v) => !v)}
				className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
				aria-label={visible ? t`Hide password` : t`Show password`}
			>
				{visible ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
			</button>
		</div>
	);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type Props = { session: AuthSession };

/** Change-password inline form */
function ChangePasswordForm({ onClose }: { onClose: () => void }) {
	const form = useAppForm({
		defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
		validators: { onSubmit: changePasswordSchema },
		onSubmit: async ({ value }) => {
			const toastId = toast.loading(t`Updating password…`);
			const { error } = await authClient.changePassword({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
				revokeOtherSessions: false,
			});
			if (error) {
				toast.error(
					getReadableErrorMessage(
						error,
						t({
							comment: "Fallback toast when changing password fails",
							message: "Failed to update password. Please check your current password and try again.",
						}),
					),
					{ id: toastId },
				);
				return;
			}
			toast.success(t`Your password has been updated successfully.`, { id: toastId });
			onClose();
		},
	});

	return (
		<m.div
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			transition={{ duration: 0.18, ease: "easeOut" }}
			className="space-y-4 rounded-xl border bg-muted/30 p-5"
		>
			<p className="font-medium text-sm">
				<Trans>Change Password</Trans>
			</p>

			<form
				className="space-y-4"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="currentPassword">
						{(field) => (
							<FormItem
								className="sm:col-span-2"
								hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}
							>
								<FormLabel className="text-sm">
									<Trans>Current Password</Trans>
								</FormLabel>
								<FormControl
									render={
										<PasswordInput
											name={field.name}
											autoComplete="current-password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={field.handleChange}
										/>
									}
								/>
								<FormMessage errors={field.state.meta.errors} />
							</FormItem>
						)}
					</form.Field>

					<form.Field name="newPassword">
						{(field) => (
							<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
								<FormLabel className="text-sm">
									<Trans>New Password</Trans>
								</FormLabel>
								<FormControl
									render={
										<PasswordInput
											name={field.name}
											autoComplete="new-password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={field.handleChange}
										/>
									}
								/>
								<FormMessage errors={field.state.meta.errors} />
							</FormItem>
						)}
					</form.Field>

					<form.Field name="confirmPassword">
						{(field) => (
							<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
								<FormLabel className="text-sm">
									<Trans>Confirm New Password</Trans>
								</FormLabel>
								<FormControl
									render={
										<PasswordInput
											name={field.name}
											autoComplete="new-password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={field.handleChange}
										/>
									}
								/>
								<FormMessage errors={field.state.meta.errors} />
							</FormItem>
						)}
					</form.Field>
				</div>

				<div className="flex justify-end gap-3 pt-1">
					<Button type="button" variant="ghost" size="sm" onClick={onClose}>
						<Trans>Cancel</Trans>
					</Button>
					<Button type="submit" size="sm">
						<Trans>Update Password</Trans>
					</Button>
				</div>
			</form>
		</m.div>
	);
}

/** Right-hand status / quick-actions rail */
function ProfileSidebar({ session, onResendVerification }: { session: AuthSession; onResendVerification: () => void }) {
	const verified = session.user.emailVerified;
	const createdAt = session.user.createdAt ? new Date(session.user.createdAt) : null;

	return (
		<aside className="space-y-5 lg:sticky lg:top-6">
			{/* Account status card */}
			<div className="rounded-2xl border bg-card p-5 shadow-sm">
				<p className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-widest">
					<Trans>Account status</Trans>
				</p>

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-2 text-sm">
							<ShieldCheckIcon className="size-4 text-muted-foreground" />
							<Trans>Email</Trans>
						</span>
						{verified ? (
							<span className="flex items-center gap-1 font-medium text-green-600 text-xs dark:text-green-400">
								<CheckIcon className="size-3" weight="bold" />
								<Trans>Verified</Trans>
							</span>
						) : (
							<span className="flex items-center gap-1 font-medium text-amber-600 text-xs dark:text-amber-400">
								<WarningIcon className="size-3" />
								<Trans>Unverified</Trans>
							</span>
						)}
					</div>

					{!verified && (
						<Button variant="outline" size="sm" className="w-full" onClick={onResendVerification}>
							<EnvelopeIcon className="size-3.5" />
							<Trans>Resend verification</Trans>
						</Button>
					)}

					{createdAt && (
						<div className="flex items-center justify-between border-t pt-3 text-sm">
							<span className="text-muted-foreground">
								<Trans>Member since</Trans>
							</span>
							<span className="font-medium">
								{createdAt.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Security tips card */}
			<div className="rounded-2xl border bg-muted/30 p-5">
				<p className="mb-3 flex items-center gap-2 font-medium text-sm">
					<LockKeyIcon className="size-4 text-muted-foreground" />
					<Trans>Keep your account secure</Trans>
				</p>
				<ul className="space-y-2.5 text-muted-foreground text-xs leading-relaxed">
					<li className="flex gap-2">
						<span className="mt-0.5 size-1 shrink-0 rounded-full bg-foreground/40" />
						<Trans>Use a unique password you don't reuse on other sites.</Trans>
					</li>
					<li className="flex gap-2">
						<span className="mt-0.5 size-1 shrink-0 rounded-full bg-foreground/40" />
						<Trans>Verify your email so you can recover your account if locked out.</Trans>
					</li>
					<li className="flex gap-2">
						<span className="mt-0.5 size-1 shrink-0 rounded-full bg-foreground/40" />
						<Trans>Sign out on devices you no longer use.</Trans>
					</li>
				</ul>
			</div>
		</aside>
	);
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProfileSettingsPage({ session }: Props) {
	const router = useRouter();
	const [showChangePassword, setShowChangePassword] = useState(false);
	const [sendingReset, setSendingReset] = useState(false);
	const [loggingOut, setLoggingOut] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>((session.user as { image?: string }).image);
	const [uploadingAvatar, setUploadingAvatar] = useState(false);
	const { mutateAsync: uploadFile } = useMutation(
		orpc.storage.uploadFile.mutationOptions({
			meta: { noInvalidate: true },
		}),
	);
	const avatarInputRef = useRef<HTMLInputElement>(null);

	// ── Profile form ─────────────────────────────────────────────────────────
	const form = useAppForm({
		defaultValues: {
			name: session.user.name,
			username: session.user.username,
			email: session.user.email,
		},
		validators: { onSubmit: formSchema },
		onSubmit: async ({ value }) => {
			const { error } = await authClient.updateUser({
				name: value.name,
				username: value.username,
				displayUsername: value.username,
			});

			if (error) {
				toast.error(
					getReadableErrorMessage(
						error,
						t({
							comment: "Fallback toast when updating profile details fails",
							message: "Failed to update your profile. Please try again.",
						}),
					),
				);
				return;
			}

			toast.success(t`Your profile has been updated successfully.`);
			form.reset({ name: value.name, username: value.username, email: session.user.email });
			void router.invalidate();

			if (value.email !== session.user.email) {
				const { error: emailError } = await authClient.changeEmail({
					newEmail: value.email,
					callbackURL: "/dashboard/settings/profile",
				});

				if (emailError) {
					toast.error(
						getReadableErrorMessage(
							emailError,
							t({
								comment: "Fallback toast when requesting email change confirmation fails",
								message: "Failed to request email change. Please try again.",
							}),
						),
					);
					return;
				}

				toast.success(
					t`A confirmation link has been sent to your current email address. Please check your inbox to confirm the change.`,
				);
				form.reset({ name: value.name, username: value.username, email: session.user.email });
				void router.invalidate();
			}
		},
	});

	const onCancel = () => form.reset();
	const isDirty = useStore(form.store, (s) => s.isDirty);
	const currentName = useStore(form.store, (s) => s.values.name);

	const hue = nameToHue(session.user.name);
	const initials = getInitials(currentName || session.user.name);

	// ── Handlers ─────────────────────────────────────────────────────────────

	const handleResendVerificationEmail = async () => {
		const toastId = toast.loading(t`Resending verification email...`);
		const { error } = await authClient.sendVerificationEmail({
			email: session.user.email,
			callbackURL: "/dashboard/settings/profile",
		});
		if (error) {
			toast.error(
				getReadableErrorMessage(
					error,
					t({
						comment: "Fallback toast when resending account verification email fails",
						message: "Failed to resend verification email. Please try again.",
					}),
				),
				{ id: toastId },
			);
			return;
		}
		toast.success(
			t`A new verification link has been sent to your email address. Please check your inbox to verify your account.`,
			{ id: toastId },
		);
		void router.invalidate();
	};

	const handleSendPasswordReset = async () => {
		setSendingReset(true);
		const toastId = toast.loading(t`Sending password reset email…`);
		const { error } = await authClient.requestPasswordReset({
			email: session.user.email,
			redirectTo: "/auth/reset-password",
		});
		setSendingReset(false);
		if (error) {
			toast.error(
				getReadableErrorMessage(
					error,
					t({
						comment: "Fallback toast when sending password reset email fails",
						message: "Failed to send password reset email. Please try again.",
					}),
				),
				{ id: toastId },
			);
			return;
		}
		toast.success(t`A password reset link has been sent to ${session.user.email}. Please check your inbox.`, {
			id: toastId,
		});
	};

	/** Resize + compress an image client-side so the resulting data URL stays
	 *  well under typical JSON body-size limits (avoids 502s on upload). */

	const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error(t`Please choose an image file.`);
			return;
		}
		if (file.size > 10 * 1024 * 1024) {
			toast.error(t`Image must be smaller than 10MB.`);
			return;
		}

		setUploadingAvatar(true);
		const toastId = toast.loading(t`Uploading photo…`);
		try {
			// Downscale before sending — a raw camera photo as base64 JSON can
			// easily exceed body-size limits and trigger a 502 from the proxy.
			const result = await uploadFile(file);

			const { error } = await authClient.updateUser({
				image: result.url,
			});
			if (error) {
				toast.error(
					getReadableErrorMessage(
						error,
						t({
							comment: "Fallback toast when updating profile photo fails",
							message: "Failed to update your photo. Please try again.",
						}),
					),
					{ id: toastId },
				);
				return;
			}
			setAvatarUrl(result.url);
			toast.success(t`Your profile photo has been updated.`, { id: toastId });
			void router.invalidate();
		} catch {
			toast.error(t`Failed to update your photo. Please try again.`, { id: toastId });
		} finally {
			setUploadingAvatar(false);
			e.target.value = "";
		}
	};

	const handleLogout = async () => {
		setLoggingOut(true);
		const toastId = toast.loading(t`Signing out…`);
		await authClient.signOut();
		toast.success(t`You have been signed out.`, { id: toastId });
		window.location.href = "/auth/login";
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<m.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28, ease: "easeOut" }}
			className="max-w-5xl space-y-8"
		>
			{/* ── Avatar banner ───────────────────────────────────────────────── */}
			<div className="flex items-center gap-5 rounded-2xl border bg-card p-5 shadow-sm">
				<div className="group relative shrink-0">
					<input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
					<button
						type="button"
						onClick={() => avatarInputRef.current?.click()}
						disabled={uploadingAvatar}
						aria-label={t`Change profile photo`}
						className="relative flex size-16 select-none items-center justify-center overflow-hidden rounded-full font-semibold text-white text-xl shadow-md disabled:cursor-not-allowed"
						style={
							avatarUrl
								? undefined
								: {
										background: `linear-gradient(135deg, hsl(${hue},65%,52%), hsl(${(hue + 40) % 360},70%,42%))`,
									}
						}
					>
						{avatarUrl ? <img src={avatarUrl} alt="" className="size-full object-cover" /> : initials}

						{/* Hover / upload overlay */}
						<span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
							<CameraIcon className="size-5 text-white" />
						</span>

						{uploadingAvatar && (
							<span className="absolute inset-0 flex items-center justify-center bg-black/40">
								<span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							</span>
						)}
					</button>

					{session.user.emailVerified && (
						<span className="pointer-events-none absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-background">
							<CheckIcon className="size-3 text-white" weight="bold" />
						</span>
					)}
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate font-semibold text-base leading-tight">{session.user.name}</p>
					<p className="truncate text-muted-foreground text-sm">@{session.user.username}</p>
					<p className="mt-1 truncate text-muted-foreground text-xs">{session.user.email}</p>
				</div>

				{session.user.emailVerified ? (
					<span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 font-medium text-green-700 text-xs ring-1 ring-green-200 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-800">
						<CheckIcon className="size-3" weight="bold" />
						<Trans>Verified</Trans>
					</span>
				) : (
					<span className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 text-xs ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800">
						<WarningIcon className="size-3" />
						<Trans>Unverified</Trans>
					</span>
				)}
			</div>

			{/* ── Two-column layout: main content + sidebar ─────────────────────── */}
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
				<div className="space-y-8">
					{/* Profile form */}
					<m.form
						className="space-y-5"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							void form.handleSubmit();
						}}
					>
						<div className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase tracking-widest">
							<span className="h-px flex-1 bg-border" />
							<span>
								<Trans>Account details</Trans>
							</span>
							<span className="h-px flex-1 bg-border" />
						</div>

						<div className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
							<div className="grid gap-5 sm:grid-cols-2">
								{/* Name */}
								<form.Field name="name">
									{(field) => (
										<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
											<FormLabel className="flex items-center gap-1.5 font-medium text-sm">
												<UserIcon className="size-3.5 text-muted-foreground" />
												<Trans>Full Name</Trans>
											</FormLabel>
											<FormControl
												render={
													<Input
														min={3}
														max={64}
														autoComplete="name"
														placeholder={t({
															comment: "Example full name placeholder on profile settings form",
															message: "Alex Rivera",
														})}
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														className="h-10 rounded-lg transition-shadow focus-visible:shadow-sm"
													/>
												}
											/>
											<FormMessage errors={field.state.meta.errors} />
										</FormItem>
									)}
								</form.Field>

								{/* Username */}
								<form.Field name="username">
									{(field) => (
										<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
											<FormLabel className="flex items-center gap-1.5 font-medium text-sm">
												<IdentificationCardIcon className="size-3.5 text-muted-foreground" />
												<Trans>Username</Trans>
											</FormLabel>
											<div className="relative">
												<span className="pointer-events-none absolute inset-y-0 left-3 flex select-none items-center text-muted-foreground text-sm">
													@
												</span>
												<FormControl
													render={
														<Input
															min={3}
															max={64}
															autoComplete="username"
															placeholder={t({
																comment: "Example username placeholder on profile settings form",
																message: "alex.rivera",
															})}
															className="h-10 rounded-lg pl-7 lowercase transition-shadow focus-visible:shadow-sm"
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) => field.handleChange(e.target.value)}
														/>
													}
												/>
											</div>
											<FormMessage errors={field.state.meta.errors} />
										</FormItem>
									)}
								</form.Field>
							</div>

							{/* Email */}
							<form.Field name="email">
								{(field) => (
									<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
										<FormLabel className="flex items-center gap-1.5 font-medium text-sm">
											<EnvelopeIcon className="size-3.5 text-muted-foreground" />
											<Trans>Email Address</Trans>
										</FormLabel>
										<FormControl
											render={
												<Input
													type="email"
													autoComplete="email"
													placeholder={t({
														comment: "Example email placeholder on profile settings form",
														message: "alex.rivera@gmail.com",
													})}
													className="h-10 rounded-lg lowercase transition-shadow focus-visible:shadow-sm"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
												/>
											}
										/>
										<FormMessage errors={field.state.meta.errors} />
										<div className="mt-1.5">
											{session.user.emailVerified ? (
												<p className="flex items-center gap-1.5 text-green-600 text-xs dark:text-green-400">
													<CheckIcon className="size-3.5" weight="bold" />
													<Trans>Email verified</Trans>
												</p>
											) : (
												<div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
													<WarningIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
													<p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-amber-700 text-xs dark:text-amber-400">
														<Trans>Your email address is not verified.</Trans>
														<Button
															variant="link"
															className="h-auto gap-x-1 p-0! text-amber-700 text-xs underline-offset-2 dark:text-amber-400"
															onClick={handleResendVerificationEmail}
														>
															<Trans>Resend verification email</Trans>
														</Button>
													</p>
												</div>
											)}
										</div>
									</FormItem>
								)}
							</form.Field>
						</div>

						{/* Save / Cancel bar */}
						<AnimatePresence initial={false} mode="popLayout">
							{isDirty && (
								<m.div
									initial={{ opacity: 0, y: -6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									transition={{ duration: 0.16, ease: "easeOut" }}
									className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3 will-change-[transform,opacity]"
								>
									<p className="text-muted-foreground text-xs">
										<Trans>You have unsaved changes.</Trans>
									</p>
									<div className="flex items-center gap-3">
										<Button type="reset" variant="ghost" size="sm" onClick={onCancel}>
											<Trans>Cancel</Trans>
										</Button>
										<Button type="submit" size="sm">
											<Trans>Save Changes</Trans>
										</Button>
									</div>
								</m.div>
							)}
						</AnimatePresence>
					</m.form>

					{/* ── Security section ─────────────────────────────────────────── */}
					<div className="space-y-4">
						<div className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase tracking-widest">
							<span className="h-px flex-1 bg-border" />
							<span>
								<Trans>Security</Trans>
							</span>
							<span className="h-px flex-1 bg-border" />
						</div>

						<div className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
							{/* Change password row */}
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-lg bg-muted">
										<LockKeyIcon className="size-4 text-muted-foreground" />
									</div>
									<div>
										<p className="font-medium text-sm">
											<Trans>Password</Trans>
										</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Change your account password</Trans>
										</p>
									</div>
								</div>
								<Button variant="outline" size="sm" onClick={() => setShowChangePassword((v) => !v)}>
									<KeyIcon className="size-3.5" />
									{showChangePassword ? <Trans>Cancel</Trans> : <Trans>Change Password</Trans>}
								</Button>
							</div>

							{/* Inline change-password form */}
							<AnimatePresence initial={false}>
								{showChangePassword && <ChangePasswordForm onClose={() => setShowChangePassword(false)} />}
							</AnimatePresence>

							<div className="h-px bg-border" />

							{/* Send reset email row */}
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-lg bg-muted">
										<PaperPlaneTiltIcon className="size-4 text-muted-foreground" />
									</div>
									<div>
										<p className="font-medium text-sm">
											<Trans>Password Reset Email</Trans>
										</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Send a reset link to</Trans>{" "}
											<span className="font-medium text-foreground">{session.user.email}</span>
										</p>
									</div>
								</div>
								<Button variant="outline" size="sm" disabled={sendingReset} onClick={handleSendPasswordReset}>
									<EnvelopeIcon className="size-3.5" />
									{sendingReset ? <Trans>Sending…</Trans> : <Trans>Send Reset Email</Trans>}
								</Button>
							</div>
						</div>
					</div>

					{/* ── Session section ──────────────────────────────────────────── */}
					<div className="space-y-4">
						<div className="flex items-center gap-2 font-medium text-muted-foreground text-xs uppercase tracking-widest">
							<span className="h-px flex-1 bg-border" />
							<span>
								<Trans>Session</Trans>
							</span>
							<span className="h-px flex-1 bg-border" />
						</div>

						<div className="rounded-2xl border bg-card p-5 shadow-sm">
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-3">
									<div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
										<SignOutIcon className="size-4 text-destructive" />
									</div>
									<div>
										<p className="font-medium text-sm">
											<Trans>Sign Out</Trans>
										</p>
										<p className="text-muted-foreground text-xs">
											<Trans>Sign out of your account on this device</Trans>
										</p>
									</div>
								</div>
								<Button variant="destructive" size="sm" disabled={loggingOut} onClick={handleLogout}>
									<SignOutIcon className="size-3.5" />
									{loggingOut ? <Trans>Signing out…</Trans> : <Trans>Sign Out</Trans>}
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* ── Right sidebar ───────────────────────────────────────────────── */}
				<ProfileSidebar session={session} onResendVerification={handleResendVerificationEmail} />
			</div>
		</m.div>
	);
}
