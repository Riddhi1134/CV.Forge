export function getTrustedOrigins(appUrl: string, extraOrigins?: string): string[] {
	const normalizeOrigin = (origin: string): string => origin.replace(/\/$/, "");
	const trustedOrigins = new Set<string>(["http://localhost:3000", "http://127.0.0.1:3000"]);

	const configuredUrl = new URL(appUrl);
	trustedOrigins.add(normalizeOrigin(configuredUrl.origin));

	if (configuredUrl.hostname === "localhost" || configuredUrl.hostname === "127.0.0.1") {
		const loopbackAlias = configuredUrl.hostname === "localhost" ? "127.0.0.1" : "localhost";
		configuredUrl.hostname = loopbackAlias;
		trustedOrigins.add(normalizeOrigin(configuredUrl.origin));
	}

	if (extraOrigins) {
		for (const origin of extraOrigins.split(",")) {
			const trimmed = origin.trim();
			if (trimmed) trustedOrigins.add(normalizeOrigin(trimmed));
		}
	}

	return Array.from(trustedOrigins);
}
