// import { m } from "motion/react";
// import { useEnabledProviders } from "./components/hooks";
// import { PasskeysSection } from "./components/passkeys";
// import { PasswordSection } from "./components/password";
// import { SocialProviderSection } from "./components/social-provider";
// import { TwoFactorSection } from "./components/two-factor";

// export function AuthenticationSettingsPage() {
// 	const { enabledProviders } = useEnabledProviders();

// 	return (
// 		<m.div
// 			initial={{ opacity: 0, y: -20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.25, ease: "easeOut" }}
// 			className="grid max-w-xl gap-4 will-change-[transform,opacity]"
// 		>
// 			<PasswordSection />

// 			<TwoFactorSection />

// 			<PasskeysSection />

// 			{"google" in enabledProviders && <SocialProviderSection provider="google" animationDelay={0.4} />}

// 			{"github" in enabledProviders && <SocialProviderSection provider="github" animationDelay={0.5} />}

// 			{"linkedin" in enabledProviders && <SocialProviderSection provider="linkedin" animationDelay={0.6} />}

// 			{"custom" in enabledProviders && (
// 				<SocialProviderSection provider="custom" animationDelay={0.7} name={enabledProviders.custom} />
// 			)}
// 		</m.div>
// 	);
// }

import { Trans } from "@lingui/react/macro";
import { m } from "motion/react";
import { useEnabledProviders } from "./components/hooks";
import { PasskeysSection } from "./components/passkeys";
import { PasswordSection } from "./components/password";
import { SocialProviderSection } from "./components/social-provider";
import { TwoFactorSection } from "./components/two-factor";

export function AuthenticationSettingsPage() {
	const { enabledProviders } = useEnabledProviders();

	const hasSocialProviders =
		"google" in enabledProviders ||
		"github" in enabledProviders ||
		"linkedin" in enabledProviders ||
		"custom" in enabledProviders;

	return (
		<m.div
			initial={{ opacity: 0, y: -16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
			className="grid max-w-lg gap-6 will-change-[transform,opacity]"
		>
			{/* Sign-in Methods */}
			<div className="grid gap-2">
				<div className="mb-1">
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
						<Trans>Sign-in Methods</Trans>
					</p>
				</div>
				<PasswordSection />
				<TwoFactorSection />
				<PasskeysSection />
			</div>

			{/* Connected Accounts */}
			{hasSocialProviders && (
				<div className="grid gap-2">
					<div className="mb-1">
						<p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
							<Trans>Connected Accounts</Trans>
						</p>
					</div>
					{"google" in enabledProviders && <SocialProviderSection provider="google" animationDelay={0.15} />}
					{"github" in enabledProviders && <SocialProviderSection provider="github" animationDelay={0.2} />}
					{"linkedin" in enabledProviders && <SocialProviderSection provider="linkedin" animationDelay={0.25} />}
					{"custom" in enabledProviders && (
						<SocialProviderSection provider="custom" animationDelay={0.3} name={enabledProviders.custom} />
					)}
				</div>
			)}
		</m.div>
	);
}
