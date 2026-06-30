// import { t } from "@lingui/core/macro";
// import { FloppyDiskIcon } from "@phosphor-icons/react";
// import { useHotkey } from "@tanstack/react-hotkeys";
// import { Suspense, useState } from "react";
// import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
// import { toast } from "sonner";
// import { LoadingScreen } from "@/components/layout/loading-screen";
// import { ResumePreview } from "@/features/resume/preview/preview";
// import { BuilderDock } from "./dock";
// import { DEFAULT_BUILDER_PREVIEW_PAGE_LAYOUT, getNextBuilderPreviewPageLayout } from "./page-layout";

// export function PreviewPage() {
// 	const [pageLayout, setPageLayout] = useState(DEFAULT_BUILDER_PREVIEW_PAGE_LAYOUT);

// 	useHotkey("Mod+S", () => {
// 		toast.info(t`Your changes are saved automatically.`, { id: "auto-save", icon: <FloppyDiskIcon /> });
// 	});

// 	return (
// 		<Suspense fallback={<LoadingScreen />}>
// 			<div className="fixed inset-0">
// 				<TransformWrapper
// 					centerOnInit
// 					maxScale={5}
// 					minScale={0.5}
// 					initialScale={0.75}
// 					limitToBounds={false}
// 					wheel={{ step: 0.001 }}
// 				>
// 					<TransformComponent wrapperClass="h-full! w-full!">
// 						<ResumePreview showPageNumbers pageLayout={pageLayout} />
// 					</TransformComponent>

// 					<BuilderDock
// 						pageLayout={pageLayout}
// 						onTogglePageLayout={() => {
// 							setPageLayout((current) => getNextBuilderPreviewPageLayout(current));
// 						}}
// 					/>
// 				</TransformWrapper>
// 			</div>
// 		</Suspense>
// 	);
// }

import type { Template } from "@reactive-resume/schema/templates";
import { t } from "@lingui/core/macro";
import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useSearch } from "@tanstack/react-router";
import { Suspense, useEffect, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { useUpdateResumeData } from "@/features/resume/builder/draft";
import { ResumePreview } from "@/features/resume/preview/preview";
import { BuilderDock } from "./dock";
import { DEFAULT_BUILDER_PREVIEW_PAGE_LAYOUT, getNextBuilderPreviewPageLayout } from "./page-layout";

export function PreviewPage() {
	const [pageLayout, setPageLayout] = useState(DEFAULT_BUILDER_PREVIEW_PAGE_LAYOUT);
	const { template } = useSearch({ from: "/builder/$resumeId/" });
	const updateResumeData = useUpdateResumeData();

	// Apply template from URL search param on first load
	useEffect(() => {
		if (!template) return;
		updateResumeData((draft) => {
			draft.metadata.template = template as Template;
		});
	}, [template, updateResumeData]);

	useHotkey("Mod+S", () => {
		toast.info(t`Your changes are saved automatically.`, { id: "auto-save", icon: <FloppyDiskIcon /> });
	});

	return (
		<Suspense fallback={<LoadingScreen />}>
			<div className="fixed inset-0">
				<TransformWrapper
					centerOnInit
					maxScale={5}
					minScale={0.5}
					initialScale={0.75}
					limitToBounds={false}
					wheel={{ step: 0.001 }}
				>
					<TransformComponent wrapperClass="h-full! w-full!">
						<ResumePreview showPageNumbers pageLayout={pageLayout} />
					</TransformComponent>
					<BuilderDock
						pageLayout={pageLayout}
						onTogglePageLayout={() => {
							setPageLayout((current) => getNextBuilderPreviewPageLayout(current));
						}}
					/>
				</TransformWrapper>
			</div>
		</Suspense>
	);
}
