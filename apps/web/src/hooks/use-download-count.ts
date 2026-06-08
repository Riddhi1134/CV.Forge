import { useEffect, useState } from "react";

const STORAGE_KEY = "resume_download_count";

export function getDownloadCount(): number {
	try {
		return Number.parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
	} catch {
		return 0;
	}
}

export function incrementDownloadCount(): void {
	try {
		const next = getDownloadCount() + 1;
		localStorage.setItem(STORAGE_KEY, String(next));
		window.dispatchEvent(new Event("download-count-updated"));
	} catch {
		// ignore
	}
}

export function useDownloadCount(): number {
	const [count, setCount] = useState(getDownloadCount());

	useEffect(() => {
		const handler = () => setCount(getDownloadCount());
		window.addEventListener("download-count-updated", handler);
		window.addEventListener("focus", handler);
		return () => {
			window.removeEventListener("download-count-updated", handler);
			window.removeEventListener("focus", handler);
		};
	}, []);

	return count;
}
