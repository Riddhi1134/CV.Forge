// import type { AuthProvider } from "@reactive-resume/auth/types";
// import { Trans } from "@lingui/react/macro";
// import { LinkBreakIcon, LinkIcon } from "@phosphor-icons/react";
// import { m } from "motion/react";
// import { useCallback, useMemo } from "react";
// import { match } from "ts-pattern";
// import { Button } from "@reactive-resume/ui/components/button";
// import { Separator } from "@reactive-resume/ui/components/separator";
// import { getProviderIcon, getProviderName, useAuthAccounts, useAuthProviderActions } from "./hooks";

// type SocialProviderSectionProps = {
// 	provider: AuthProvider;
// 	name?: string;
// 	animationDelay?: number;
// };

// export function SocialProviderSection({ provider, name, animationDelay = 0 }: SocialProviderSectionProps) {
// 	const { link, unlink } = useAuthProviderActions();
// 	const { hasAccount, getAccountByProviderId } = useAuthAccounts();

// 	const providerName = useMemo(() => name ?? getProviderName(provider), [name, provider]);
// 	const providerIcon = useMemo(() => getProviderIcon(provider), [provider]);

// 	const account = useMemo(() => getAccountByProviderId(provider), [getAccountByProviderId, provider]);
// 	const isConnected = useMemo(() => hasAccount(provider), [hasAccount, provider]);

// 	const handleLink = useCallback(async () => {
// 		await link(provider);
// 	}, [link, provider]);

// 	const handleUnlink = useCallback(async () => {
// 		if (!account?.accountId) return;
// 		await unlink(provider, account.accountId);
// 	}, [account, unlink, provider]);

// 	return (
// 		<m.div
// 			className="will-change-[transform,opacity]"
// 			initial={{ opacity: 0, y: -20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.2, delay: animationDelay, ease: "easeOut" }}
// 		>
// 			<Separator />

// 			<div className="mt-4 flex items-center justify-between gap-x-4">
// 				<h2 className="flex items-center gap-x-3 font-medium text-base">
// 					{providerIcon}
// 					{providerName}
// 				</h2>

// 				{match(isConnected)
// 					.with(true, () => (
// 						<m.div
// 							className="will-change-transform"
// 							whileHover={{ y: -1, scale: 1.01 }}
// 							whileTap={{ scale: 0.99 }}
// 							transition={{ duration: 0.14, ease: "easeOut" }}
// 						>
// 							<Button variant="outline" onClick={handleUnlink}>
// 								<LinkBreakIcon />
// 								<Trans comment="Authentication settings action to unlink a connected social login provider">
// 									Disconnect
// 								</Trans>
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
// 							<Button variant="outline" onClick={handleLink}>
// 								<LinkIcon />
// 								<Trans comment="Authentication settings action to link a social login provider">Connect</Trans>
// 							</Button>
// 						</m.div>
// 					))
// 					.exhaustive()}
// 			</div>
// 		</m.div>
// 	);
// }

import type { AuthProvider } from "@reactive-resume/auth/types";
import { Trans } from "@lingui/react/macro";
import { CheckCircleIcon, LinkBreakIcon, LinkIcon } from "@phosphor-icons/react";
import { m } from "motion/react";
import { useCallback, useMemo } from "react";
import { match } from "ts-pattern";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@reactive-resume/ui/components/card";
import { getProviderIcon, getProviderName, useAuthAccounts, useAuthProviderActions } from "./hooks";

type SocialProviderSectionProps = {
	provider: AuthProvider;
	name?: string;
	animationDelay?: number;
};

export function SocialProviderSection({ provider, name, animationDelay = 0 }: SocialProviderSectionProps) {
	const { link, unlink } = useAuthProviderActions();
	const { hasAccount, getAccountByProviderId } = useAuthAccounts();

	const providerName = useMemo(() => name ?? getProviderName(provider), [name, provider]);
	const providerIcon = useMemo(() => getProviderIcon(provider), [provider]);

	const account = useMemo(() => getAccountByProviderId(provider), [getAccountByProviderId, provider]);
	const isConnected = useMemo(() => hasAccount(provider), [hasAccount, provider]);

	const handleLink = useCallback(async () => {
		await link(provider);
	}, [link, provider]);
	const handleUnlink = useCallback(async () => {
		if (!account?.accountId) return;
		await unlink(provider, account.accountId);
	}, [account, unlink, provider]);

	return (
		<m.div
			className="will-change-[transform,opacity]"
			initial={{ opacity: 0, y: -16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, delay: animationDelay, ease: "easeOut" }}
		>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
								<span className="size-4 [&>svg]:size-4">{providerIcon}</span>
							</div>
							<div>
								<CardTitle>{providerName}</CardTitle>
								<CardDescription className="mt-0.5">
									{isConnected ? (
										<Trans>Your {providerName} account is linked.</Trans>
									) : (
										<Trans>Connect your {providerName} account for quick sign-in.</Trans>
									)}
								</CardDescription>
							</div>
						</div>
						<div className="flex shrink-0 items-center gap-3">
							{isConnected && (
								<Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 text-xs">
									<CheckCircleIcon className="size-3" />
									<Trans>Connected</Trans>
								</Badge>
							)}
							{match(isConnected)
								.with(true, () => (
									<Button size="sm" variant="outline" onClick={handleUnlink}>
										<LinkBreakIcon className="size-3.5" />
										<Trans>Disconnect</Trans>
									</Button>
								))
								.with(false, () => (
									<Button size="sm" variant="outline" onClick={handleLink}>
										<LinkIcon className="size-3.5" />
										<Trans>Connect</Trans>
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
