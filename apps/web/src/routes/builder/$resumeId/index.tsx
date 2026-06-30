// import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

// export const Route = createFileRoute("/builder/$resumeId/")({
// 	component: lazyRouteComponent(() => import("./-components/preview-page"), "PreviewPage"),
// });

import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
	template: z.string().optional(),
});

export const Route = createFileRoute("/builder/$resumeId/")({
	validateSearch: searchSchema,
	component: lazyRouteComponent(() => import("./-components/preview-page"), "PreviewPage"),
});
