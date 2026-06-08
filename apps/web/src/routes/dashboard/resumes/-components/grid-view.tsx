// import type { RouterOutput } from "@/libs/orpc/client";
// import { AnimatePresence, m } from "motion/react";
// import { CreateResumeCard } from "./cards/create-card";
// import { ImportResumeCard } from "./cards/import-card";
// import { ResumeCard } from "./cards/resume-card";

// type Resume = RouterOutput["resume"]["list"][number];

// type Props = {
// 	resumes: Resume[];
// };

// export function GridView({ resumes }: Props) {
// 	return (
// 		<div className="grid 3xl:grid-cols-6 grid-cols-1 gap-5 sm:gap-6 lg:gap-7 xl:grid-cols-4 2xl:grid-cols-5">
// 			<m.div
// 				initial={{ opacity: 0, y: -20 }}
// 				animate={{ opacity: 1, y: 0 }}
// 				exit={{ opacity: 0, y: -20 }}
// 				transition={{ duration: 0.2, ease: "easeOut" }}
// 				className="will-change-[transform,opacity]"
// 			>
// 				<div className="ring-2 ring-primary/20 rounded-3xl">
// 	<CreateResumeCard />
// </div>
// 			</m.div>

// 			<m.div
// 				initial={{ opacity: 0, y: -20 }}
// 				animate={{ opacity: 1, y: 0 }}
// 				exit={{ opacity: 0, y: -20 }}
// 				transition={{ duration: 0.2, delay: 0.03, ease: "easeOut" }}
// 				className="will-change-[transform,opacity]"
// 			>
// 				<div className="ring-2 ring-primary/10 rounded-3xl">
// 	<ImportResumeCard />
// </div>
// 			</m.div>

// 			<AnimatePresence initial={false} mode="popLayout">
// 				{resumes?.map((resume, index) => (
// 					<m.div
// 						layout
// 						key={resume.id}
// 						initial={{ opacity: 0, y: -20 }}
// 						animate={{ opacity: 1, y: 0 }}
// 						exit={{
// 							opacity: 0,
// 							y: -20,
// 							filter: "blur(8px)",
// 						}}
// 						transition={{ duration: 0.2, delay: Math.min(0.12, (index + 2) * 0.02), ease: "easeOut" }}
// 						className="will-change-[transform,opacity]"
// 					>
// 						<ResumeCard resume={resume} />
// 					</m.div>
// 				))}
// 			</AnimatePresence>
// 		</div>
// 	);
// }

import type { RouterOutput } from "@/libs/orpc/client";
import { AnimatePresence, m } from "motion/react";
import { CreateResumeCard } from "./cards/create-card";
import { ImportResumeCard } from "./cards/import-card";
import { ResumeCard } from "./cards/resume-card";

type Resume = RouterOutput["resume"]["list"][number];

type Props = {
	resumes: Resume[];
};

export function GridView({ resumes }: Props) {
	return (
		<div className="grid 3xl:grid-cols-6 grid-cols-1 gap-5 sm:gap-6 lg:gap-7 xl:grid-cols-4 2xl:grid-cols-5">
			{/* Create Resume card — subtle primary ring to draw attention */}
			<m.div
				initial={{ opacity: 0, y: -16 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -16 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
				className="will-change-[transform,opacity]"
			>
				<div className="rounded-3xl ring-2 ring-primary/25 transition-shadow hover:ring-primary/50">
					<CreateResumeCard />
				</div>
			</m.div>

			{/* Import Resume card */}
			<m.div
				initial={{ opacity: 0, y: -16 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -16 }}
				transition={{ duration: 0.2, delay: 0.03, ease: "easeOut" }}
				className="will-change-[transform,opacity]"
			>
				<div className="rounded-3xl ring-1 ring-border transition-shadow hover:ring-primary/30">
					<ImportResumeCard />
				</div>
			</m.div>

			{/* Existing resume cards */}
			<AnimatePresence initial={false} mode="popLayout">
				{resumes?.map((resume, index) => (
					<m.div
						layout
						key={resume.id}
						initial={{ opacity: 0, y: -16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
						transition={{
							duration: 0.2,
							delay: Math.min(0.12, (index + 2) * 0.02),
							ease: "easeOut",
						}}
						className="will-change-[transform,opacity]"
					>
						<ResumeCard resume={resume} />
					</m.div>
				))}
			</AnimatePresence>
		</div>
	);
}
