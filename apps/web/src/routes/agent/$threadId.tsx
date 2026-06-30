// import type { UIMessage, UIMessageChunk } from "ai";
// import type * as React from "react";
// import type { PanelImperativeHandle } from "react-resizable-panels";
// import type { RouterOutput } from "@/libs/orpc/client";
// import { useChat } from "@ai-sdk/react";
// import { t } from "@lingui/core/macro";
// import { Trans } from "@lingui/react/macro";
// import { eventIteratorToUnproxiedDataStream } from "@orpc/client";
// import {
// 	ArchiveIcon,
// 	ArrowClockwiseIcon,
// 	ArrowSquareOutIcon,
// 	ChatCircleDotsIcon,
// 	CircleNotchIcon,
// 	ClockCounterClockwiseIcon,
// 	CopyIcon,
// 	DotsThreeVerticalIcon,
// 	FileIcon,
// 	FilePdfIcon,
// 	MinusIcon,
// 	NotePencilIcon,
// 	PaperclipIcon,
// 	PaperPlaneRightIcon,
// 	PlusIcon,
// 	SidebarSimpleIcon,
// 	SlideshowIcon,
// 	SparkleIcon,
// 	SquaresFourIcon,
// 	StopIcon,
// 	TrashIcon,
// } from "@phosphor-icons/react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
// import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
// import { m } from "motion/react";
// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import ReactMarkdown from "react-markdown";
// import { toast } from "sonner";
// import { Badge } from "@reactive-resume/ui/components/badge";
// import { Button } from "@reactive-resume/ui/components/button";
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuSeparator,
// 	DropdownMenuTrigger,
// } from "@reactive-resume/ui/components/dropdown-menu";
// import { ResizableGroup, ResizablePanel, ResizableSeparator } from "@reactive-resume/ui/components/resizable";
// import { ScrollArea } from "@reactive-resume/ui/components/scroll-area";
// import { Tabs, TabsList, TabsTrigger } from "@reactive-resume/ui/components/tabs";
// import { Textarea } from "@reactive-resume/ui/components/textarea";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@reactive-resume/ui/components/tooltip";
// import { downloadWithAnchor, generateFilename } from "@reactive-resume/utils/file";
// import { cn } from "@reactive-resume/utils/style";
// import { createResumePdfBlob } from "@/features/resume/export/pdf-document";
// import { ResumePreview } from "@/features/resume/preview/preview";
// import { useConfirm } from "@/hooks/use-confirm";
// import { getOrpcErrorMessage } from "@/libs/error-message";
// import { client, orpc, streamClient } from "@/libs/orpc/client";
// import { templates as resumeTemplates } from "@/dialogs/resume/template/data";
// import { AgentThreadSidebar } from "./-components/thread-sidebar";
// import { attachmentIdsFromTransportBody, buildAgentChatSubmission } from "./-helpers/chat-attachments";
// import { useAgentResumeUpdateSubscription } from "./-hooks/use-agent-resume-updates";

// type AgentThreadDetail = RouterOutput["agent"]["threads"]["get"];
// type AgentAction = AgentThreadDetail["actions"][number];
// type AgentAttachment = AgentThreadDetail["attachments"][number];
// type PatchOperation = AgentAction["operations"][number];

// type CoverLetterToolCardProps = {
// 	part: UIMessage["parts"][number];
// };

// type PatchToolCardProps = {
// 	part: UIMessage["parts"][number];
// 	action: AgentAction | undefined;
// 	onRevert: (actionId: string) => void;
// 	isReverting: boolean;
// };

// type StarterPromptMarqueeProps = {
// 	onSelect: (prompt: string) => void;
// };

// type AssistantMarkdownProps = {
// 	text: string;
// };

// type MessagePartProps = {
// 	part: UIMessage["parts"][number];
// 	isUser: boolean;
// 	onAnswer: (toolCallId: string, answer: string) => void;
// 	onRevert: (actionId: string) => void;
// 	isReverting: boolean;
// 	actionsById: Map<string, AgentAction>;
// };

// type ChatMessageProps = {
// 	message: UIMessage;
// 	onAnswer: (toolCallId: string, answer: string) => void;
// 	onRevert: (actionId: string) => void;
// 	isReverting: boolean;
// 	actionsById: Map<string, AgentAction>;
// };

// type AgentChatProps = {
// 	threadId: string;
// 	initialMessages: UIMessage[];
// 	isReadOnly: boolean;
// 	readOnlyReason: "archived" | "missing" | null;
// 	threadStatus: string;
// 	activeRunId: string | null;
// 	actions: AgentAction[];
// 	onToggleThreads?: () => void;
// 	onToggleResume?: () => void;
// };

// type AgentChatReadOnlyBannerProps = {
// 	isReadOnly: boolean;
// 	readOnlyReason: "archived" | "missing" | null;
// };

// type AgentChatMessagesProps = {
// 	actionsById: Map<string, AgentAction>;
// 	error: Error | undefined;
// 	isReadOnly: boolean;
// 	isReverting: boolean;
// 	isStreaming: boolean;
// 	messages: UIMessage[];
// 	onAnswer: (toolCallId: string, answer: string) => void;
// 	onRevert: (actionId: string) => void;
// 	onRetry: () => void;
// 	onStarterSelect: (prompt: string) => void;
// };

// type AgentChatHeaderProps = {
// 	isArchived: boolean;
// 	isArchivePending: boolean;
// 	isDeletePending: boolean;
// 	onArchive: () => void;
// 	onCopyConversation: () => void;
// 	onCopyConversationJson: () => void;
// 	onDelete: () => void;
// 	onToggleResume?: () => void;
// 	onToggleThreads?: () => void;
// };

// type AgentChatComposerProps = {
// 	fileInputRef: React.RefObject<HTMLInputElement | null>;
// 	input: string;
// 	isReadOnly: boolean;
// 	isStreaming: boolean;
// 	isUploading: boolean;
// 	pendingAttachments: Array<Pick<AgentAttachment, "filename" | "id" | "mediaType">>;
// 	onInputChange: (value: string) => void;
// 	onSend: () => void;
// 	onStopRun: () => void;
// 	onUploadFiles: (files: FileList | null) => void;
// };

// type ToolbarButtonProps = React.ComponentProps<typeof Button> & {
// 	label: string;
// };

// type ResumePaneProps = {
// 	resume: AgentThreadDetail["resume"];
// 	onTemplateChange?: () => void;
// };

// type CoverLetterPaneProps = {
// 	coverLetter: {
// 		id: string;
// 		title: string;
// 		company: string;
// 		role: string;
// 		yourName: string;
// 		content: string;
// 		template: string;
// 	} | null;
// };

// // ─── Template field definitions ───────────────────────────────────────────────

// type FieldDef = { label: string; example: string; required: boolean };

// const TEMPLATE_FIELDS: Record<string, FieldDef[]> = {
// 	onyx: [
// 		{ label: "Full Name", example: "e.g. Priya Sharma", required: true },
// 		{ label: "Headline", example: "e.g. Senior Software Engineer", required: true },
// 		{ label: "Email", example: "e.g. priya@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Bangalore, India", required: false },
// 		{ label: "Summary", example: "Short bio / professional summary", required: false },
// 		{ label: "Experience", example: "Company · Role · Duration · Description", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Skills", example: "e.g. React, TypeScript, Node.js", required: false },
// 	],
// 	azurill: [
// 		{ label: "Full Name", example: "e.g. Riddhi Bhardwaj", required: true },
// 		{ label: "Headline", example: "e.g. UI/UX Designer", required: true },
// 		{ label: "Email", example: "e.g. riddhi@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Jaipur, India", required: false },
// 		{ label: "Profile Photo", example: "Upload a photo (optional)", required: false },
// 		{ label: "Summary", example: "Short intro about yourself", required: false },
// 		{ label: "Skills", example: "e.g. Figma, React, CSS — shown as skill bars", required: true },
// 		{ label: "Experience", example: "Company · Role · Duration", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Profiles / Social", example: "GitHub, LinkedIn usernames", required: false },
// 	],
// 	bronzor: [
// 		{ label: "Full Name", example: "e.g. Arjun Mehta", required: true },
// 		{ label: "Headline", example: "e.g. Financial Analyst", required: true },
// 		{ label: "Email", example: "e.g. arjun@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Mumbai, India", required: false },
// 		{ label: "Summary", example: "Professional summary", required: false },
// 		{ label: "Experience", example: "Company · Role · Duration", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Skills", example: "e.g. Excel, SAP, Financial Modelling", required: false },
// 		{ label: "Certifications", example: "e.g. CFA Level 1", required: false },
// 	],
// 	chikorita: [
// 		{ label: "Full Name", example: "e.g. Sneha Kapoor", required: true },
// 		{ label: "Headline", example: "e.g. HR Manager", required: true },
// 		{ label: "Email", example: "e.g. sneha@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Delhi, India", required: false },
// 		{ label: "Profile Photo", example: "Circular photo displayed in header", required: false },
// 		{ label: "Summary", example: "Short professional bio", required: false },
// 		{ label: "Experience", example: "Company · Role · Duration", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Skills", example: "e.g. Recruitment, HRMS, Payroll", required: false },
// 	],
// 	ditgar: [
// 		{ label: "Full Name", example: "e.g. Karan Verma", required: true },
// 		{ label: "Headline", example: "e.g. Data Scientist", required: true },
// 		{ label: "Email", example: "e.g. karan@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Hyderabad, India", required: false },
// 		{ label: "Summary", example: "Short technical bio", required: false },
// 		{ label: "Skills", example: "e.g. Python, ML, TensorFlow — shown as grid", required: true },
// 		{ label: "Experience", example: "Company · Role · Duration", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Projects", example: "Project name · Description · Link", required: false },
// 	],
// 	ditto: [
// 		{ label: "Full Name", example: "e.g. Rohit Singh", required: true },
// 		{ label: "Headline", example: "e.g. Software Developer", required: true },
// 		{ label: "Email", example: "e.g. rohit@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Pune, India", required: false },
// 		{ label: "Summary", example: "ATS-friendly professional summary", required: false },
// 		{ label: "Experience", example: "Company · Role · Duration", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Skills", example: "Plain text skill list for ATS", required: false },
// 	],
// 	gengar: [
// 		{ label: "Full Name", example: "e.g. Neha Gupta", required: true },
// 		{ label: "Headline", example: "e.g. Business Analyst", required: true },
// 		{ label: "Email", example: "e.g. neha@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Chennai, India", required: false },
// 		{ label: "Summary", example: "Professional overview", required: false },
// 		{ label: "Experience", example: "Company · Role · Duration", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Skills", example: "e.g. SQL, Tableau, Excel", required: false },
// 	],
// 	glalie: [
// 		{ label: "Full Name", example: "e.g. Vikram Nair", required: true },
// 		{ label: "Headline", example: "e.g. Senior Counsel", required: true },
// 		{ label: "Email", example: "e.g. vikram@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Kolkata, India", required: false },
// 		{ label: "Summary", example: "Executive summary", required: false },
// 		{ label: "Experience", example: "Company · Role · Duration", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Skills", example: "e.g. Corporate Law, Contracts", required: false },
// 		{ label: "Certifications", example: "e.g. Bar Council enrollment", required: false },
// 	],
// 	kakuna: [
// 		{ label: "Full Name", example: "e.g. Ananya Joshi", required: true },
// 		{ label: "Headline", example: "e.g. Software Intern", required: true },
// 		{ label: "Email", example: "e.g. ananya@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Ahmedabad, India", required: false },
// 		{ label: "Education", example: "University · Degree · Year · CGPA", required: true },
// 		{ label: "Projects", example: "Project name · Tech used · Description", required: true },
// 		{ label: "Skills", example: "e.g. Java, Spring Boot, MySQL", required: true },
// 		{ label: "Experience", example: "Internship / Part-time work", required: false },
// 	],
// 	lapras: [
// 		{ label: "Full Name", example: "e.g. Suresh Pillai", required: true },
// 		{ label: "Headline", example: "e.g. VP of Engineering", required: true },
// 		{ label: "Email", example: "e.g. suresh@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Bangalore, India", required: false },
// 		{ label: "Summary", example: "Senior executive summary", required: true },
// 		{ label: "Experience", example: "Company · Role · Duration · Key achievements", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Awards", example: "e.g. Employee of the Year 2022", required: false },
// 	],
// 	leafish: [
// 		{ label: "Full Name", example: "e.g. Meera Iyer", required: true },
// 		{ label: "Headline", example: "e.g. Public Health Specialist", required: true },
// 		{ label: "Email", example: "e.g. meera@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Coimbatore, India", required: false },
// 		{ label: "Summary", example: "Mission-driven professional summary", required: false },
// 		{ label: "Experience", example: "Organization · Role · Duration", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Volunteer", example: "Organization · Role · Duration", required: false },
// 		{ label: "Skills", example: "e.g. Epidemiology, SPSS, Public Policy", required: false },
// 	],
// 	meowth: [
// 		{ label: "Full Name", example: "e.g. Li Wei / 李伟", required: true },
// 		{ label: "Headline", example: "e.g. Software Engineer", required: true },
// 		{ label: "Email", example: "e.g. liwei@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +86 138 0000 0000", required: false },
// 		{ label: "Location", example: "e.g. Beijing, China", required: false },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Experience", example: "Company · Role · Duration — compact inline format", required: true },
// 		{ label: "Skills", example: "e.g. Java, Python, Spring", required: true },
// 		{ label: "Projects", example: "Project · Tech stack · Brief description", required: false },
// 	],
// 	pikachu: [
// 		{ label: "Full Name", example: "e.g. Tanya Malhotra", required: true },
// 		{ label: "Headline", example: "e.g. Content Strategist", required: true },
// 		{ label: "Email", example: "e.g. tanya@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Noida, India", required: false },
// 		{ label: "Summary", example: "Creative intro about yourself", required: false },
// 		{ label: "Experience", example: "Company · Role · Duration", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Skills", example: "e.g. SEO, Copywriting, Figma", required: false },
// 		{ label: "Profiles / Social", example: "LinkedIn, Portfolio link", required: false },
// 	],
// 	rhyhorn: [
// 		{ label: "Full Name", example: "e.g. Aditya Rao", required: true },
// 		{ label: "Headline", example: "e.g. UX Designer", required: true },
// 		{ label: "Email", example: "e.g. aditya@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Bangalore, India", required: false },
// 		{ label: "Summary", example: "Minimal one-line intro", required: false },
// 		{ label: "Experience", example: "Company · Role · Duration", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Projects", example: "Project name · Outcome · Link", required: false },
// 		{ label: "Skills", example: "e.g. Figma, Sketch, Prototyping", required: false },
// 	],
// 	scizor: [
// 		{ label: "Full Name", example: "e.g. Rahul Sharma", required: true },
// 		{ label: "Headline", example: "e.g. Strategy Consultant", required: true },
// 		{ label: "Email", example: "e.g. rahul@email.com", required: true },
// 		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
// 		{ label: "Location", example: "e.g. Gurugram, India", required: false },
// 		{ label: "Summary", example: "Executive-level professional summary", required: true },
// 		{ label: "Experience", example: "Company · Role · Duration · Achievements", required: true },
// 		{ label: "Education", example: "University · Degree · Year", required: true },
// 		{ label: "Skills", example: "e.g. Strategy, M&A, Leadership", required: false },
// 		{ label: "Certifications", example: "e.g. PMP, CFA", required: false },
// 	],
// };

// function getTemplateFields(templateId: string): FieldDef[] {
// 	return TEMPLATE_FIELDS[templateId] ?? TEMPLATE_FIELDS["onyx"]!;
// }

// // ─── Resume Field Guide ────────────────────────────────────────────────────────

// type ResumeFieldGuideProps = {
// 	resume: AgentThreadDetail["resume"];
// };

// function ResumeFieldGuide({ resume }: ResumeFieldGuideProps) {
// 	const template = resume?.data?.metadata?.template ?? "onyx";
// 	const basics = resume?.data?.basics;
// 	const hasContent = !!(basics?.name && basics.name.trim().length > 0);

// 	// Agar real content hai toh guide mat dikho
// 	if (hasContent) return null;

// 	const fields = getTemplateFields(template);
// 	const templateMeta = resumeTemplates[template as keyof typeof resumeTemplates];
// 	const templateName = templateMeta?.name ?? template;
// 	const templateDesc = typeof templateMeta?.description === "object"
// 		? (templateMeta.description as { message?: string }).message ?? ""
// 		: "";

// 	return (
// 		<div className="mx-auto w-full max-w-lg rounded-xl border border-primary/20 bg-background p-5 shadow-sm">
// 			{/* Header */}
// 			<div className="mb-4 flex items-start gap-3">
// 				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
// 					<SparkleIcon className="size-5 text-primary" />
// 				</div>
// 				<div>
// 					<div className="font-semibold text-foreground">
// 						Template: <span className="text-primary capitalize">{templateName}</span>
// 					</div>
// 					{templateDesc && (
// 						<div className="mt-0.5 text-muted-foreground text-xs leading-relaxed">{templateDesc}</div>
// 					)}
// 				</div>
// 			</div>

// 			{/* Template thumbnail */}
// 			{templateMeta?.imageUrl && (
// 				<div className="mb-4 overflow-hidden rounded-lg border">
// 					<img
// 						src={templateMeta.imageUrl}
// 						alt={templateName}
// 						className="w-full object-cover"
// 						style={{ maxHeight: "160px", objectPosition: "top" }}
// 					/>
// 				</div>
// 			)}

// 			{/* Fields */}
// 			<div className="mb-3 text-muted-foreground text-xs font-medium uppercase tracking-wide">
// 				Fields used in this template
// 			</div>
// 			<div className="space-y-1.5">
// 				{fields.map((field) => (
// 					<div
// 						key={field.label}
// 						className={cn(
// 							"flex items-center justify-between rounded-md px-3 py-2 text-xs",
// 							field.required
// 								? "border border-primary/20 bg-primary/5"
// 								: "border border-border bg-muted/30",
// 						)}
// 					>
// 						<div className="flex items-center gap-2">
// 							{field.required ? (
// 								<span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
// 							) : (
// 								<span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
// 							)}
// 							<span className={cn("font-medium", field.required ? "text-foreground" : "text-muted-foreground")}>
// 								{field.label}
// 							</span>
// 						</div>
// 						<span className="text-muted-foreground/70 text-right">{field.example}</span>
// 					</div>
// 				))}
// 			</div>

// 			{/* Legend */}
// 			<div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
// 				<div className="flex items-center gap-1.5">
// 					<span className="h-1.5 w-1.5 rounded-full bg-primary" />
// 					Required
// 				</div>
// 				<div className="flex items-center gap-1.5">
// 					<span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
// 					Optional
// 				</div>
// 			</div>

// 			{/* Prompt hint */}
// 			<div className="mt-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-3 text-xs text-muted-foreground leading-relaxed">
// 				💬 Chat mein likho:{" "}
// 				<span className="italic text-foreground/70">
// 					"My name is Priya Sharma, I am a Senior Software Engineer at Google..."
// 				</span>{" "}
// 				— AI agent baaki sab fields automatically fill kar dega.
// 			</div>
// 		</div>
// 	);
// }

// // ─── Rest of existing code (unchanged) ────────────────────────────────────────

// function toRecord(value: unknown) {
// 	return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
// }

// function PatchToolCard({ part, action, onRevert, isReverting }: PatchToolCardProps) {
// 	const partRecord = part as Record<string, unknown>;
// 	const state = typeof partRecord.state === "string" ? partRecord.state : null;
// 	const input = toRecord(partRecord.input);
// 	const output = toRecord(partRecord.output);
// 	const actionId =
// 		state === "output-available"
// 			? (action?.id ?? (typeof output?.actionId === "string" ? output.actionId : null))
// 			: null;
// 	const title =
// 		action?.title ??
// 		(typeof output?.title === "string" ? output.title : null) ??
// 		(typeof input?.title === "string" ? input.title : t`Resume patch`);
// 	const operations: PatchOperation[] =
// 		action?.operations ??
// 		(Array.isArray(output?.operations)
// 			? (output.operations as PatchOperation[])
// 			: Array.isArray(input?.operations)
// 				? (input.operations as PatchOperation[])
// 				: []);
// 	const status = action?.status ?? "applied";
// 	const revertMessage = action?.revertMessage ?? null;
// 	const label =
// 		state === "output-error"
// 			? t`Patch failed`
// 			: state !== "output-available"
// 				? t`Patch pending`
// 				: status === "rolled_back" || status === "reverted"
// 					? t`Patch rolled back`
// 					: status === "conflicted"
// 						? t`Patch conflicted`
// 						: t`Patch applied`;
// 	const canRollback = action?.canRollback ?? (Boolean(actionId) && status === "applied");
// 	const revertDisabled =
// 		isReverting || !canRollback || status === "rolled_back" || status === "reverted" || status === "conflicted";
// 	const errorText = typeof partRecord.errorText === "string" ? partRecord.errorText : null;
// 	const rawPayload = JSON.stringify(
// 		{
// 			state,
// 			input,
// 			...(partRecord.rawInput !== undefined ? { rawInput: partRecord.rawInput } : {}),
// 			output,
// 			...(errorText ? { errorText } : {}),
// 			...(action ? { action } : {}),
// 			operations,
// 		},
// 		null,
// 		2,
// 	);

// 	return (
// 		<details className="group text-muted-foreground text-xs">
// 			<summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-md py-1 font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
// 				<span>{label}</span>
// 				<span className="text-muted-foreground/70 group-open:hidden">{title}</span>
// 			</summary>
// 			<div className="mt-2 space-y-2 rounded-md border bg-muted/20 p-3">
// 				<div className="flex items-center justify-between gap-3">
// 					<div className="min-w-0">
// 						<p className="truncate font-medium text-foreground">{title}</p>
// 						{status === "conflicted" && revertMessage ? (
// 							<p className="mt-1 text-amber-600 dark:text-amber-300">{revertMessage}</p>
// 						) : null}
// 						{status === "rolled_back" && revertMessage ? (
// 							<p className="mt-1 text-muted-foreground">{revertMessage}</p>
// 						) : null}
// 						{errorText ? <p className="mt-1 text-rose-500">{errorText}</p> : null}
// 					</div>
// 					{actionId ? (
// 						<Button size="xs" variant="ghost" disabled={revertDisabled} onClick={() => onRevert(actionId)}>
// 							<ClockCounterClockwiseIcon />
// 							<Trans>Restore</Trans>
// 						</Button>
// 					) : null}
// 				</div>
// 				<pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded border bg-background p-3 font-mono text-[0.7rem] leading-relaxed">
// 					{rawPayload}
// 				</pre>
// 			</div>
// 		</details>
// 	);
// }

// function CoverLetterToolCard({ part }: CoverLetterToolCardProps) {
// 	const partRecord = part as Record<string, unknown>;
// 	const output =
// 		typeof partRecord.output === "object" && partRecord.output
// 			? (partRecord.output as Record<string, unknown>)
// 			: null;
// 	const state = typeof partRecord.state === "string" ? partRecord.state : null;
// 	const coverLetter = typeof output?.coverLetter === "string" ? output.coverLetter : null;
// 	const jobTitle = typeof output?.jobTitle === "string" ? output.jobTitle : null;
// 	const companyName = typeof output?.companyName === "string" ? output.companyName : null;
// 	const isReady = state === "output-available" && coverLetter;

// 	const handleCopy = () => {
// 		if (!coverLetter) return;
// 		void navigator.clipboard.writeText(coverLetter);
// 		toast.success(t`Cover letter copied!`);
// 	};

// 	return (
// 		<details className="group text-muted-foreground text-xs" open={!!isReady}>
// 			<summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-md py-1 font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
// 				<span>{isReady ? t`Cover Letter Ready` : t`Generating Cover Letter…`}</span>
// 				{jobTitle && companyName ? (
// 					<span className="text-muted-foreground/70 group-open:hidden">
// 						{jobTitle} @ {companyName}
// 					</span>
// 				) : null}
// 			</summary>
// 			{isReady ? (
// 				<div className="mt-2 space-y-2 rounded-md border bg-muted/20 p-3">
// 					<div className="flex items-center justify-between gap-3">
// 						<p className="font-medium text-foreground">
// 							{jobTitle} @ {companyName}
// 						</p>
// 						<Button size="xs" variant="outline" onClick={handleCopy}>
// 							<CopyIcon />
// 							<Trans>Copy</Trans>
// 						</Button>
// 					</div>
// 					<pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded border bg-background p-3 font-mono text-[0.7rem] leading-relaxed">
// 						{coverLetter}
// 					</pre>
// 				</div>
// 			) : (
// 				<div className="mt-2 rounded-md border bg-muted/20 p-3 text-muted-foreground">
// 					<Trans>Please wait…</Trans>
// 				</div>
// 			)}
// 		</details>
// 	);
// }

// export const Route = createFileRoute("/agent/$threadId")({
// 	component: RouteComponent,
// });

// function fileToBase64(file: File): Promise<string> {
// 	return new Promise((resolve, reject) => {
// 		const reader = new FileReader();
// 		reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
// 		reader.onerror = reject;
// 		reader.readAsDataURL(file);
// 	});
// }

// function textFromMessage(message: UIMessage) {
// 	const textParts: string[] = [];
// 	for (const part of message.parts) {
// 		if (part.type === "text") textParts.push(part.text);
// 	}
// 	return textParts.join("\n");
// }

// function parseAgentSseStream(stream: ReadableStream<string>) {
// 	let buffer = "";
// 	const eventBoundary = /\r?\n\r?\n/;
// 	return stream.pipeThrough(
// 		new TransformStream<string, UIMessageChunk>({
// 			transform(chunk, controller) {
// 				buffer += chunk;
// 				let boundary = eventBoundary.exec(buffer);
// 				while (boundary) {
// 					const event = buffer.slice(0, boundary.index);
// 					buffer = buffer.slice(boundary.index + boundary[0].length);
// 					for (const line of event.split(/\r?\n/)) {
// 						if (!line.startsWith("data:")) continue;
// 						const data = line.slice("data:".length).trimStart();
// 						if (!data || data === "[DONE]") continue;
// 						try {
// 							controller.enqueue(JSON.parse(data) as UIMessageChunk);
// 						} catch (error) {
// 							console.warn("[agent] dropping malformed SSE frame", error);
// 						}
// 					}
// 					boundary = eventBoundary.exec(buffer);
// 				}
// 			},
// 		}),
// 	);
// }

// function promptPreview(prompt: string) {
// 	const words = prompt.split(/\s+/).filter(Boolean);
// 	return `${words.slice(0, 7).join(" ")}${words.length > 7 ? "…" : ""}`;
// }

// function chunkPrompts(prompts: string[], columns: number) {
// 	return prompts.reduce<string[][]>(
// 		(rows, prompt, index) => {
// 			rows[index % columns]?.push(prompt);
// 			return rows;
// 		},
// 		Array.from({ length: columns }, () => []),
// 	);
// }

// function StarterPromptMarquee({ onSelect }: StarterPromptMarqueeProps) {
// 	const prompts = [
// 		t`Tailor this resume to a product manager job description and emphasize roadmap ownership, stakeholder communication, and measurable launch outcomes.`,
// 		t`Compare this resume against this role URL and update keywords while keeping the voice concise and credible.`,
// 		t`Find weak bullets and rewrite them with stronger outcomes, numbers, scope, and sharper verbs.`,
// 		t`Rework the summary so it targets a senior engineering manager role without sounding generic.`,
// 		t`Identify gaps for an applicant tracking system and apply only high-confidence keyword improvements.`,
// 		t`Rewrite this resume for a startup founder-to-product-lead transition with clear business impact.`,
// 		t`Make the experience section more results-oriented and remove vague responsibilities.`,
// 		t`Adjust the resume for a remote-first role that values async communication and ownership.`,
// 		t`Review the resume against a job description and ask me questions before changing uncertain sections.`,
// 		t`Tighten the skills section so it supports the target role instead of reading like a keyword dump.`,
// 		t`Update project bullets to show leadership, constraints, tradeoffs, and measurable outcomes.`,
// 		t`Prepare a conservative patch that improves clarity without changing my career narrative.`,
// 	];
// 	const promptRows = chunkPrompts(prompts, 3);
// 	return (
// 		<div className="relative mx-auto grid w-full max-w-4xl gap-3 overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
// 			{promptRows.map((row, rowIndex) => {
// 				const marqueePrompts = row.flatMap((prompt) => [
// 					{ id: `${prompt}-primary`, prompt },
// 					{ id: `${prompt}-repeat-a`, prompt },
// 					{ id: `${prompt}-repeat-b`, prompt },
// 				]);
// 				const duration = 135 + rowIndex * 22;
// 				const animate = rowIndex % 2 === 0 ? { x: ["0%", "-33.333%"] } : { x: ["-33.333%", "0%"] };
// 				return (
// 					<m.div
// 						key={`prompt-row-${row.join("|")}`}
// 						className="flex w-max gap-3"
// 						animate={animate}
// 						transition={{ duration, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
// 					>
// 						{marqueePrompts.map(({ id, prompt }) => (
// 							<Button
// 								key={id}
// 								type="button"
// 								variant="outline"
// 								className="h-8 shrink-0 rounded-full bg-background/70 px-3 font-normal text-muted-foreground hover:text-foreground"
// 								onClick={() => onSelect(prompt)}
// 							>
// 								{promptPreview(prompt)}
// 							</Button>
// 						))}
// 					</m.div>
// 				);
// 			})}
// 		</div>
// 	);
// }

// function getMessagePartKey(messageId: string, part: UIMessage["parts"][number]) {
// 	if ("toolCallId" in part && typeof part.toolCallId === "string")
// 		return `${messageId}-${part.type}-${part.toolCallId}`;
// 	if (part.type === "text") return `${messageId}-text-${part.text}`;
// 	if (part.type === "file") return `${messageId}-file-${part.url ?? part.filename}`;
// 	return `${messageId}-${part.type}-${JSON.stringify(part)}`;
// }

// function AssistantMarkdown({ text }: AssistantMarkdownProps) {
// 	return (
// 		<ReactMarkdown
// 			skipHtml
// 			components={{
// 				p: ({ children }) => <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
// 				ul: ({ children }) => <ul className="my-2 ms-5 list-disc space-y-1">{children}</ul>,
// 				ol: ({ children }) => <ol className="my-2 ms-5 list-decimal space-y-1">{children}</ol>,
// 				li: ({ children }) => <li className="ps-1">{children}</li>,
// 				a: ({ children, href }) => (
// 					<a className="text-primary underline underline-offset-4" href={href} target="_blank" rel="noreferrer">
// 						{children}
// 					</a>
// 				),
// 				code: ({ children, className }) => (
// 					<code className={cn("rounded border bg-muted px-1 py-0.5 font-mono text-[0.85em]", className)}>
// 						{children}
// 					</code>
// 				),
// 				pre: ({ children }) => (
// 					<pre className="my-3 max-w-full overflow-auto rounded-md border bg-muted/30 p-3 text-xs leading-relaxed">
// 						{children}
// 					</pre>
// 				),
// 				blockquote: ({ children }) => (
// 					<blockquote className="my-3 border-l-2 ps-3 text-muted-foreground">{children}</blockquote>
// 				),
// 			}}
// 		>
// 			{text}
// 		</ReactMarkdown>
// 	);
// }

// function MessagePart({ part, isUser, onAnswer, onRevert, isReverting, actionsById }: MessagePartProps) {
// 	if (part.type === "text") {
// 		return isUser ? (
// 			<div className="whitespace-pre-wrap leading-relaxed">{part.text}</div>
// 		) : (
// 			<AssistantMarkdown text={part.text} />
// 		);
// 	}
// 	if (part.type === "reasoning") {
// 		return (
// 			<details className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
// 				<summary className="cursor-pointer text-muted-foreground">
// 					<Trans>Thinking</Trans>
// 				</summary>
// 				<div className="mt-2 whitespace-pre-wrap">{part.text}</div>
// 			</details>
// 		);
// 	}
// 	if (part.type === "tool-ask_user_question") {
// 		const input =
// 			"input" in part && typeof part.input === "object" && part.input ? (part.input as Record<string, unknown>) : {};
// 		const choices = Array.isArray(input.choices)
// 			? input.choices.filter((choice): choice is string => typeof choice === "string")
// 			: [];
// 		const question = typeof input.question === "string" ? input.question : t`The agent needs your input.`;
// 		return (
// 			<div className="space-y-3 rounded-md border bg-card p-3">
// 				<div className="font-medium">{question}</div>
// 				<div className="flex flex-wrap gap-2">
// 					{choices.map((choice) => (
// 						<Button key={choice} size="sm" variant="outline" onClick={() => onAnswer(part.toolCallId, choice)}>
// 							{choice}
// 						</Button>
// 					))}
// 				</div>
// 			</div>
// 		);
// 	}
// 	if (part.type === "tool-apply_resume_patch") {
// 		const output =
// 			"output" in part && typeof part.output === "object" && part.output
// 				? (part.output as Record<string, unknown>)
// 				: null;
// 		const actionId = typeof output?.actionId === "string" ? output.actionId : null;
// 		const action = actionId ? actionsById.get(actionId) : undefined;
// 		return <PatchToolCard part={part} action={action} onRevert={onRevert} isReverting={isReverting} />;
// 	}
// 	if (part.type === "tool-generate_cover_letter") {
// 		return <CoverLetterToolCard part={part} />;
// 	}
// 	if (part.type === "source-url") {
// 		const title = part.title?.trim() || null;
// 		return (
// 			<a className="block text-primary text-sm underline" href={part.url} target="_blank" rel="noreferrer">
// 				{title ? (
// 					<>
// 						<span className="block truncate">{title}</span>
// 						<span className="block truncate text-muted-foreground">{part.url}</span>
// 					</>
// 				) : (
// 					<span className="block truncate">{part.url}</span>
// 				)}
// 			</a>
// 		);
// 	}
// 	if (part.type === "file") {
// 		return (
// 			<div className="flex max-w-full items-center gap-2 rounded-md border bg-background/20 px-2 py-1 text-sm">
// 				<FileIcon className="shrink-0" />
// 				<span className="truncate">{part.filename ?? part.url}</span>
// 			</div>
// 		);
// 	}
// 	return null;
// }

// function ChatMessage({ message, onAnswer, onRevert, isReverting, actionsById }: ChatMessageProps) {
// 	const isUser = message.role === "user";
// 	return (
// 		<div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
// 			<div
// 				className={cn(
// 					"space-y-3 text-sm",
// 					isUser
// 						? "max-w-[86%] rounded-md bg-primary px-4 py-3 text-primary-foreground"
// 						: "w-full max-w-full py-1 text-foreground",
// 				)}
// 			>
// 				{message.parts.map((part) => (
// 					<MessagePart
// 						key={getMessagePartKey(message.id, part)}
// 						part={part}
// 						isUser={isUser}
// 						onAnswer={onAnswer}
// 						onRevert={onRevert}
// 						isReverting={isReverting}
// 						actionsById={actionsById}
// 					/>
// 				))}
// 			</div>
// 		</div>
// 	);
// }

// function AgentChat({
// 	threadId,
// 	initialMessages,
// 	isReadOnly,
// 	readOnlyReason,
// 	threadStatus,
// 	activeRunId,
// 	actions,
// 	onToggleThreads,
// 	onToggleResume,
// }: AgentChatProps) {
// 	const queryClient = useQueryClient();
// 	const navigate = useNavigate();
// 	const confirm = useConfirm();
// 	const fileInputRef = useRef<HTMLInputElement>(null);
// 	const refreshedPatchOutputsRef = useRef(new Set<string>());
// 	const lastSyncedThreadIdRef = useRef<string | null>(null);
// 	const [input, setInput] = useState("");
// 	const [pendingAttachments, setPendingAttachments] = useState<Array<Pick<AgentAttachment, "id" | "filename" | "mediaType">>>([]);
// 	const [isUploading, setIsUploading] = useState(false);
// 	const revertMutation = useMutation(orpc.agent.actions.revert.mutationOptions());
// 	const archiveMutation = useMutation(orpc.agent.threads.archive.mutationOptions());
// 	const deleteMutation = useMutation(orpc.agent.threads.delete.mutationOptions());
// 	const isArchived = threadStatus === "archived";

// 	const refreshThread = useCallback(async () => {
// 		await Promise.all([
// 			queryClient.invalidateQueries({ queryKey: orpc.agent.threads.list.queryKey() }),
// 			queryClient.invalidateQueries({ queryKey: orpc.agent.threads.get.queryKey({ input: { id: threadId } }) }),
// 		]);
// 	}, [queryClient, threadId]);

// 	const actionsById = useMemo(() => {
// 		const map = new Map<string, AgentAction>();
// 		for (const action of actions) map.set(action.id, action);
// 		return map;
// 	}, [actions]);

// 	const handleArchive = () => {
// 		archiveMutation.mutate(
// 			{ id: threadId },
// 			{
// 				onSuccess: async () => {
// 					toast.success(t`Thread archived.`);
// 					await refreshThread();
// 				},
// 				onError: (error) => {
// 					toast.error(getOrpcErrorMessage(error, { fallback: t`Failed to archive thread.` }));
// 				},
// 			},
// 		);
// 	};

// 	const handleDelete = async () => {
// 		const confirmation = await confirm(t`Delete this agent thread?`, {
// 			description: t`This action cannot be undone. Conversation messages and uploaded attachments will be removed. The working resume draft remains in your dashboard and can be deleted separately.`,
// 		});
// 		if (!confirmation) return;
// 		deleteMutation.mutate(
// 			{ id: threadId },
// 			{
// 				onSuccess: async () => {
// 					toast.success(t`Thread deleted.`);
// 					await queryClient.invalidateQueries({ queryKey: orpc.agent.threads.list.queryKey() });
// 					void navigate({ to: "/agent" });
// 				},
// 				onError: (error) => {
// 					toast.error(getOrpcErrorMessage(error, { fallback: t`Failed to delete thread.` }));
// 				},
// 			},
// 		);
// 	};

// 	const transport = useMemo(
// 		() => ({
// 			async sendMessages(options: { messages: UIMessage[]; abortSignal?: AbortSignal; body?: object }) {
// 				const message = options.messages.at(-1);
// 				if (!message) throw new Error("No message to send.");
// 				const attachmentIds = attachmentIdsFromTransportBody(options.body);
// 				return parseAgentSseStream(
// 					eventIteratorToUnproxiedDataStream(
// 						await streamClient.agent.messages.send(
// 							{ threadId, message, attachmentIds },
// 							{ signal: options.abortSignal },
// 						),
// 					),
// 				);
// 			},
// 			async reconnectToStream() {
// 				return parseAgentSseStream(
// 					eventIteratorToUnproxiedDataStream(await streamClient.agent.messages.resume({ threadId })),
// 				);
// 			},
// 		}),
// 		[threadId],
// 	);

// 	const { messages, sendMessage, regenerate, setMessages, status, error, clearError, addToolOutput } = useChat({
// 		id: threadId,
// 		messages: initialMessages,
// 		resume: !!activeRunId,
// 		transport,
// 		sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
// 		onFinish: () => {
// 			void refreshThread();
// 		},
// 	});

// 	useEffect(() => {
// 		let shouldRefresh = false;
// 		for (const message of messages) {
// 			for (const part of message.parts) {
// 				if (part.type !== "tool-apply_resume_patch" || !("output" in part) || !part.output) continue;
// 				const output = typeof part.output === "object" ? (part.output as Record<string, unknown>) : null;
// 				const actionId = typeof output?.actionId === "string" ? output.actionId : null;
// 				const toolCallId = "toolCallId" in part && typeof part.toolCallId === "string" ? part.toolCallId : null;
// 				const patchOutputKey = actionId ?? toolCallId;
// 				if (!patchOutputKey || refreshedPatchOutputsRef.current.has(patchOutputKey)) continue;
// 				refreshedPatchOutputsRef.current.add(patchOutputKey);
// 				shouldRefresh = true;
// 			}
// 		}
// 		if (shouldRefresh) void refreshThread();
// 	}, [messages, refreshThread]);

// 	useEffect(() => {
// 		if (lastSyncedThreadIdRef.current === threadId) return;
// 		lastSyncedThreadIdRef.current = threadId;
// 		setMessages(initialMessages);
// 	}, [threadId, initialMessages, setMessages]);

// 	const isStreaming = status === "submitted" || status === "streaming";

// 	const send = () => {
// 		const text = input.trim();
// 		if ((!text && pendingAttachments.length === 0) || isReadOnly || isStreaming || isUploading) return;
// 		clearError();
// 		const submission = buildAgentChatSubmission(text, pendingAttachments);
// 		sendMessage(submission.message, submission.options);
// 		setInput("");
// 		setPendingAttachments([]);
// 	};

// 	const uploadFiles = async (files: FileList | null) => {
// 		if (!files?.length) return;
// 		setIsUploading(true);
// 		try {
// 			const attachments = await Promise.all(
// 				Array.from(files).map(async (file) => {
// 					const attachment = await client.agent.attachments.create({
// 						threadId,
// 						filename: file.name,
// 						mediaType: file.type || "application/octet-stream",
// 						data: await fileToBase64(file),
// 					});
// 					return { id: attachment.id, filename: attachment.filename, mediaType: attachment.mediaType };
// 				}),
// 			);
// 			setPendingAttachments((current) => [...current, ...attachments]);
// 			toast.success(t`Attachment uploaded.`);
// 		} catch (error) {
// 			toast.error(getOrpcErrorMessage(error, { fallback: t`Failed to upload attachment.` }));
// 		} finally {
// 			setIsUploading(false);
// 			if (fileInputRef.current) fileInputRef.current.value = "";
// 		}
// 	};

// 	const stopRun = async () => {
// 		const last = messages.at(-1);
// 		await client.agent.messages.stop({
// 			threadId,
// 			...(last?.role === "assistant" ? { partialMessage: last } : {}),
// 		});
// 	};

// 	const copyConversationJson = () => {
// 		void navigator.clipboard.writeText(
// 			JSON.stringify({ threadId, threadStatus, chatStatus: status, isReadOnly, readOnlyReason, messages, actions }, null, 2),
// 		);
// 		toast.success(t`Conversation JSON copied.`);
// 	};

// 	const copyConversationText = () => {
// 		void navigator.clipboard.writeText(messages.map(textFromMessage).join("\n\n"));
// 		toast.success(t`Conversation copied.`);
// 	};

// 	const answerToolCall = (toolCallId: string, answer: string) => {
// 		addToolOutput({ tool: "ask_user_question", toolCallId, output: answer });
// 	};

// 	const revertAction = (actionId: string) => {
// 		const confirmation = window.confirm(
// 			t`Restore the resume to before this patch? This will roll back this patch and any patches applied after it.`,
// 		);
// 		if (!confirmation) return;
// 		revertMutation.mutate(
// 			{ id: actionId },
// 			{
// 				onSuccess: (action) => {
// 					if (action.status === "conflicted") {
// 						toast.error(action.revertMessage ?? t`Cannot restore; the resume has changed since this edit was applied.`);
// 					} else if (action.status === "rolled_back" || action.status === "reverted") {
// 						toast.success(t`Patch rolled back.`);
// 					}
// 					void refreshThread();
// 				},
// 				onError: (error) => toast.error(getOrpcErrorMessage(error, { fallback: t`Could not restore this patch.` })),
// 			},
// 		);
// 	};

// 	const retryLastMessage = () => {
// 		clearError();
// 		void regenerate();
// 	};

// 	return (
// 		<section className="flex h-full min-h-0 flex-col bg-background">
// 			<AgentChatHeader
// 				isArchived={isArchived}
// 				isArchivePending={archiveMutation.isPending}
// 				isDeletePending={deleteMutation.isPending}
// 				onArchive={handleArchive}
// 				onCopyConversation={copyConversationText}
// 				onCopyConversationJson={copyConversationJson}
// 				onDelete={() => void handleDelete()}
// 				onToggleResume={onToggleResume}
// 				onToggleThreads={onToggleThreads}
// 			/>
// 			<AgentChatReadOnlyBanner isReadOnly={isReadOnly} readOnlyReason={readOnlyReason} />
// 			<AgentChatMessages
// 				actionsById={actionsById}
// 				error={error}
// 				isReadOnly={isReadOnly}
// 				isReverting={revertMutation.isPending}
// 				isStreaming={isStreaming}
// 				messages={messages}
// 				onAnswer={answerToolCall}
// 				onRevert={revertAction}
// 				onRetry={retryLastMessage}
// 				onStarterSelect={setInput}
// 			/>
// 			<AgentChatComposer
// 				fileInputRef={fileInputRef}
// 				input={input}
// 				isReadOnly={isReadOnly}
// 				isStreaming={isStreaming}
// 				isUploading={isUploading}
// 				pendingAttachments={pendingAttachments}
// 				onInputChange={setInput}
// 				onSend={send}
// 				onStopRun={() => void stopRun()}
// 				onUploadFiles={(files) => void uploadFiles(files)}
// 			/>
// 		</section>
// 	);
// }

// function AgentChatReadOnlyBanner({ isReadOnly, readOnlyReason }: AgentChatReadOnlyBannerProps) {
// 	if (!isReadOnly) return null;
// 	return (
// 		<div className="border-amber-300 border-b bg-amber-50 px-4 py-2 text-amber-950 text-sm dark:bg-amber-950/20 dark:text-amber-200">
// 			{readOnlyReason === "archived" ? (
// 				<Trans>This thread is archived. New messages cannot be sent.</Trans>
// 			) : (
// 				<Trans>This thread is read-only because the working resume or AI provider is unavailable.</Trans>
// 			)}
// 		</div>
// 	);
// }

// function AgentChatMessages({
// 	actionsById,
// 	error,
// 	isReadOnly,
// 	isReverting,
// 	isStreaming,
// 	messages,
// 	onAnswer,
// 	onRevert,
// 	onRetry,
// 	onStarterSelect,
// }: AgentChatMessagesProps) {
// 	return (
// 		<ScrollArea className="min-h-0 flex-1">
// 			<div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
// 				{messages.length === 0 ? (
// 					<div className="grid gap-6 py-12 text-center">
// 						<SparkleIcon className="mx-auto size-8 text-muted-foreground" />
// 						<h2 className="font-semibold text-2xl">
// 							<Trans>What do you want to do?</Trans>
// 						</h2>
// 						<StarterPromptMarquee onSelect={onStarterSelect} />
// 					</div>
// 				) : null}
// 				{messages.map((message) => (
// 					<ChatMessage
// 						key={message.id}
// 						message={message}
// 						isReverting={isReverting}
// 						actionsById={actionsById}
// 						onAnswer={onAnswer}
// 						onRevert={onRevert}
// 					/>
// 				))}
// 				{isStreaming ? (
// 					<div className="flex justify-start">
// 						<div className="rounded-md bg-muted px-4 py-3 text-muted-foreground text-sm">
// 							<Trans>Working…</Trans>
// 						</div>
// 					</div>
// 				) : null}
// 				{error ? (
// 					<div className="flex items-center justify-between gap-3 rounded-md border border-rose-300 bg-rose-50 p-3 text-rose-950 text-sm dark:bg-rose-950/20 dark:text-rose-200">
// 						<span>{error.message}</span>
// 						{!isReadOnly ? (
// 							<Button size="sm" variant="outline" type="button" onClick={onRetry}>
// 								<ArrowClockwiseIcon />
// 								<Trans>Retry</Trans>
// 							</Button>
// 						) : null}
// 					</div>
// 				) : null}
// 			</div>
// 		</ScrollArea>
// 	);
// }

// function AgentChatHeader({
// 	isArchived,
// 	isArchivePending,
// 	isDeletePending,
// 	onArchive,
// 	onCopyConversation,
// 	onCopyConversationJson,
// 	onDelete,
// 	onToggleResume,
// 	onToggleThreads,
// }: AgentChatHeaderProps) {
// 	return (
// 		<div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
// 			<div className="flex min-w-0 items-center gap-2">
// 				{onToggleThreads ? (
// 					<Button size="icon-sm" variant="ghost" onClick={onToggleThreads}>
// 						<SidebarSimpleIcon />
// 						<span className="sr-only"><Trans>Toggle threads</Trans></span>
// 					</Button>
// 				) : null}
// 				<div className="min-w-0 truncate font-semibold"><Trans>Chat</Trans></div>
// 			</div>
// 			<div className="flex items-center gap-1">
// 				{onToggleResume ? (
// 					<Button size="icon-sm" variant="ghost" onClick={onToggleResume}>
// 						<SquaresFourIcon />
// 						<span className="sr-only"><Trans>Toggle resume preview</Trans></span>
// 					</Button>
// 				) : null}
// 				<DropdownMenu>
// 					<DropdownMenuTrigger
// 						render={
// 							<Button size="icon-sm" variant="ghost">
// 								<DotsThreeVerticalIcon />
// 								<span className="sr-only"><Trans>Thread actions</Trans></span>
// 							</Button>
// 						}
// 					/>
// 					<DropdownMenuContent align="end">
// 						<DropdownMenuItem onClick={onCopyConversation}>
// 							<CopyIcon /><Trans>Copy</Trans>
// 						</DropdownMenuItem>
// 						<DropdownMenuItem onClick={onCopyConversationJson}>
// 							<CopyIcon /><Trans>Copy JSON</Trans>
// 						</DropdownMenuItem>
// 						<DropdownMenuSeparator />
// 						{!isArchived ? (
// 							<DropdownMenuItem disabled={isArchivePending} onClick={onArchive}>
// 								<ArchiveIcon /><Trans>Archive</Trans>
// 							</DropdownMenuItem>
// 						) : null}
// 						<DropdownMenuItem variant="destructive" disabled={isDeletePending} onClick={onDelete}>
// 							<TrashIcon /><Trans>Delete</Trans>
// 						</DropdownMenuItem>
// 					</DropdownMenuContent>
// 				</DropdownMenu>
// 			</div>
// 		</div>
// 	);
// }

// function AgentChatComposer({
// 	fileInputRef,
// 	input,
// 	isReadOnly,
// 	isStreaming,
// 	isUploading,
// 	pendingAttachments,
// 	onInputChange,
// 	onSend,
// 	onStopRun,
// 	onUploadFiles,
// }: AgentChatComposerProps) {
// 	return (
// 		<form
// 			className="border-t p-3"
// 			onSubmit={(event) => {
// 				event.preventDefault();
// 				onSend();
// 			}}
// 		>
// 			<div className="mx-auto max-w-3xl space-y-2">
// 				{pendingAttachments.length > 0 ? (
// 					<div className="flex flex-wrap gap-2">
// 						{pendingAttachments.map((attachment) => (
// 							<Badge key={attachment.id} variant="secondary">
// 								<FileIcon />
// 								{attachment.filename}
// 							</Badge>
// 						))}
// 					</div>
// 				) : null}
// 				<div className="flex items-end gap-1 rounded-md border bg-card p-1.5">
// 					<input
// 						ref={fileInputRef}
// 						type="file"
// 						multiple
// 						aria-label={t`Upload attachments`}
// 						className="hidden"
// 						onChange={(event) => onUploadFiles(event.target.files)}
// 					/>
// 					<Button
// 						type="button"
// 						size="icon"
// 						variant="ghost"
// 						aria-label={t`Attach files`}
// 						disabled={isReadOnly || isUploading}
// 						onClick={() => fileInputRef.current?.click()}
// 					>
// 						{isUploading ? <ArrowClockwiseIcon className="animate-spin" /> : <PaperclipIcon />}
// 					</Button>
// 					<Textarea
// 						value={input}
// 						rows={1}
// 						disabled={isReadOnly || isStreaming}
// 						onChange={(event) => onInputChange(event.target.value)}
// 						onKeyDown={(event) => {
// 							if (event.nativeEvent.isComposing) return;
// 							if (event.key !== "Enter" || event.shiftKey) return;
// 							event.preventDefault();
// 							onSend();
// 						}}
// 						placeholder={isReadOnly ? t`This thread is read-only` : t`Ask anything about this resume`}
// 						className="max-h-40 min-h-9 resize-none border-0 bg-transparent p-2 leading-5 shadow-none focus-visible:ring-0"
// 					/>
// 					{isStreaming && !isReadOnly ? (
// 						<Button type="button" size="icon" variant="outline" aria-label={t`Stop generation`} onClick={onStopRun}>
// 							<StopIcon />
// 						</Button>
// 					) : (
// 						<Button
// 							type="submit"
// 							size="icon"
// 							aria-label={t`Send message`}
// 							disabled={isReadOnly || isUploading || (!input.trim() && pendingAttachments.length === 0)}
// 						>
// 							<PaperPlaneRightIcon />
// 						</Button>
// 					)}
// 				</div>
// 			</div>
// 		</form>
// 	);
// }

// const AGENT_PREVIEW_ZOOM_STORAGE_KEY = "reactive-resume:agent-preview-zoom:v3";
// const AGENT_PREVIEW_ZOOM_MIGRATION_KEY = `${AGENT_PREVIEW_ZOOM_STORAGE_KEY}:initialized`;
// const MIN_PREVIEW_ZOOM = 0.4;
// const MAX_PREVIEW_ZOOM = 1.5;
// const PREVIEW_ZOOM_STEP = 0.05;
// const DEFAULT_PREVIEW_ZOOM = 1;

// function clampPreviewZoom(value: number) {
// 	return Math.min(MAX_PREVIEW_ZOOM, Math.max(MIN_PREVIEW_ZOOM, value));
// }

// function getInitialPreviewZoom() {
// 	if (typeof window === "undefined") return DEFAULT_PREVIEW_ZOOM;
// 	if (!window.localStorage.getItem(AGENT_PREVIEW_ZOOM_MIGRATION_KEY)) {
// 		window.localStorage.setItem(AGENT_PREVIEW_ZOOM_STORAGE_KEY, String(DEFAULT_PREVIEW_ZOOM));
// 		window.localStorage.setItem(AGENT_PREVIEW_ZOOM_MIGRATION_KEY, "true");
// 		return DEFAULT_PREVIEW_ZOOM;
// 	}
// 	const stored = Number(window.localStorage.getItem(AGENT_PREVIEW_ZOOM_STORAGE_KEY));
// 	return Number.isFinite(stored) ? clampPreviewZoom(stored) : DEFAULT_PREVIEW_ZOOM;
// }

// function ToolbarButton({ label, children, ...props }: ToolbarButtonProps) {
// 	return (
// 		<Tooltip>
// 			<TooltipTrigger
// 				render={
// 					<Button size="icon-sm" variant="ghost" aria-label={label} {...props}>
// 						{children}
// 					</Button>
// 				}
// 			/>
// 			<TooltipContent side="bottom" align="center">{label}</TooltipContent>
// 		</Tooltip>
// 	);
// }

// function ResumePane({ resume, onTemplateChange }: ResumePaneProps) {
// 	const queryClient = useQueryClient();
// 	const [zoom, setZoom] = useState(getInitialPreviewZoom);
// 	const [isPrinting, setIsPrinting] = useState(false);
// 	const [showTemplatePanel, setShowTemplatePanel] = useState(false);

// 	// Jab template change ho toh zoom reset karo
// 	useEffect(() => {
// 		window.localStorage.setItem(AGENT_PREVIEW_ZOOM_STORAGE_KEY, String(zoom));
// 	}, [zoom]);

// 	const setClampedZoom = useCallback((value: number) => {
// 		setZoom(clampPreviewZoom(Number(value.toFixed(2))));
// 	}, []);

// 	const onDownloadPDF = useCallback(async () => {
// 		if (!resume) return;
// 		const filename = generateFilename(resume.name || resume.data.basics.name || resume.id, "pdf");
// 		const toastId = toast.loading(t`Please wait while your PDF is being generated…`);
// 		setIsPrinting(true);
// 		try {
// 			const blob = await createResumePdfBlob(resume.data);
// 			downloadWithAnchor(blob, filename);
// 		} catch {
// 			toast.error(t`There was a problem while generating the PDF, please try again.`);
// 		} finally {
// 			setIsPrinting(false);
// 			toast.dismiss(toastId);
// 		}
// 	}, [resume]);

// 	const handleTemplateSelect = async (templateId: string) => {
// 		if (!resume) return;
// 		try {
// 			await client.resume.update({
// 				id: resume.id,
// 				data: {
// 					...resume.data,
// 					metadata: {
// 						...resume.data.metadata,
// 						template: templateId as never,
// 					},
// 				},
// 			});
// 			await queryClient.invalidateQueries({
// 				queryKey: orpc.agent.threads.get.queryKey({ input: { id: resume.id } }),
// 			});
// 			await queryClient.invalidateQueries({
// 				queryKey: orpc.agent.threads.list.queryKey(),
// 			});
// 			toast.success(t`Template changed!`);
// 			onTemplateChange?.();
// 		} catch {
// 			toast.error(t`Failed to change template.`);
// 		}
// 		setShowTemplatePanel(false);
// 	};

// 	const zoomPercent = Math.round(zoom * 100);
// 	const currentTemplate = resume?.data.metadata.template ?? "";
// 	const hasContent = !!(resume?.data?.basics?.name && resume.data.basics.name.trim().length > 0);

// 	return (
// 		<section className="flex h-full min-h-0 flex-col bg-muted/30">
// 			{/* Header */}
// 			<div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
// 				<div>
// 					<div className="font-semibold"><Trans>Resume</Trans></div>
// 					<div className="text-muted-foreground text-xs">
// 						{resume?.name ?? t`Missing working resume`}
// 						{currentTemplate ? (
// 							<span className="ml-2 capitalize text-primary">· {currentTemplate}</span>
// 						) : null}
// 					</div>
// 				</div>
// 				{resume && (
// 					<ToolbarButton
// 						label={t`Change template`}
// 						onClick={() => setShowTemplatePanel((prev) => !prev)}
// 					>
// 						<SlideshowIcon />
// 					</ToolbarButton>
// 				)}
// 			</div>

// 			{/* Template Panel */}
// 			{showTemplatePanel && (
// 				<div className="border-b bg-background p-3">
// 					<div className="mb-2 flex items-center justify-between">
// 						<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
// 							<Trans>Select Template</Trans>
// 						</p>
// 						<button
// 							type="button"
// 							className="text-muted-foreground text-xs hover:text-foreground"
// 							onClick={() => setShowTemplatePanel(false)}
// 						>
// 							✕
// 						</button>
// 					</div>
// 					<ScrollArea className="h-48">
// 						<div className="grid grid-cols-3 gap-2 pr-2">
// 							{Object.entries(resumeTemplates).map(([id, metadata]) => (
// 								<button
// 									key={id}
// 									type="button"
// 									onClick={() => void handleTemplateSelect(id)}
// 									className={cn(
// 										"flex flex-col gap-1 rounded-md border p-1.5 text-left transition-all hover:border-primary",
// 										currentTemplate === id && "border-primary ring-1 ring-primary",
// 									)}
// 								>
// 									<img
// 										src={metadata.imageUrl}
// 										alt={metadata.name}
// 										className="aspect-[210/297] w-full rounded object-cover"
// 									/>
// 									<span className="truncate text-center text-xs font-medium">{metadata.name}</span>
// 								</button>
// 							))}
// 						</div>
// 					</ScrollArea>
// 				</div>
// 			)}

// 			{/* Zoom toolbar — sirf tab dikhao jab content ho */}
// 			{hasContent && (
// 				<div className="sticky top-0 z-10 flex h-10 items-center justify-between border-b bg-background/90 px-2 backdrop-blur">
// 					<div className="flex items-center gap-1">
// 						<ToolbarButton label={t`Decrease zoom`} disabled={!resume} onClick={() => setClampedZoom(zoom - PREVIEW_ZOOM_STEP)}>
// 							<MinusIcon />
// 						</ToolbarButton>
// 						<Tooltip>
// 							<TooltipTrigger
// 								render={
// 									<input
// 										type="text"
// 										inputMode="numeric"
// 										value={`${zoomPercent}%`}
// 										disabled={!resume}
// 										aria-label={t`Zoom level`}
// 										className="h-8 w-14 rounded-md border bg-background px-1 text-center text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
// 										onChange={(event) => {
// 											const nextValue = Number(event.target.value.replace(/[^0-9.]/g, ""));
// 											if (Number.isFinite(nextValue)) setClampedZoom(nextValue / 100);
// 										}}
// 									/>
// 								}
// 							/>
// 							<TooltipContent side="bottom" align="center"><Trans>Zoom level</Trans></TooltipContent>
// 						</Tooltip>
// 						<ToolbarButton label={t`Increase zoom`} disabled={!resume} onClick={() => setClampedZoom(zoom + PREVIEW_ZOOM_STEP)}>
// 							<PlusIcon />
// 						</ToolbarButton>
// 					</div>
// 					<div className="flex items-center gap-1">
// 						<ToolbarButton
// 							label={t`Open in builder`}
// 							disabled={!resume}
// 							nativeButton={false}
// 							render={resume ? <Link to="/builder/$resumeId" params={{ resumeId: resume.id }} /> : undefined}
// 						>
// 							<ArrowSquareOutIcon />
// 						</ToolbarButton>
// 						<ToolbarButton label={t`Download PDF`} disabled={!resume || isPrinting} onClick={() => void onDownloadPDF()}>
// 							{isPrinting ? <CircleNotchIcon className="animate-spin" /> : <FilePdfIcon />}
// 						</ToolbarButton>
// 					</div>
// 				</div>
// 			)}

// 			{/* Preview area */}
// 			<div className="min-h-0 flex-1 overflow-auto">
// 				{/* Zoom toolbar for empty state — download/open buttons still accessible */}
// 				{!hasContent && resume && (
// 					<div className="flex h-10 items-center justify-end border-b bg-background/90 px-2">
// 						<div className="flex items-center gap-1">
// 							<ToolbarButton
// 								label={t`Open in builder`}
// 								disabled={!resume}
// 								nativeButton={false}
// 								render={resume ? <Link to="/builder/$resumeId" params={{ resumeId: resume.id }} /> : undefined}
// 							>
// 								<ArrowSquareOutIcon />
// 							</ToolbarButton>
// 						</div>
// 					</div>
// 				)}
// 				<div className="p-4">
// 					{resume ? (
// 						hasContent ? (
// 							// Real data hai — actual PDF preview dikhao
// 							<ResumePreview
// 								data={resume.data}
// 								pageLayout="vertical"
// 								pageScale={zoom}
// 								showPageNumbers
// 								className="mx-auto"
// 								pageClassName="shadow-lg"
// 							/>
// 						) : (
// 							// Empty resume — field guide dikhao
// 							<ResumeFieldGuide resume={resume} />
// 						)
// 					) : (
// 						<div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
// 							<Trans>The working resume was deleted. This thread is read-only.</Trans>
// 						</div>
// 					)}
// 				</div>
// 			</div>
// 		</section>
// 	);
// }

// function parseCoverLetterContent(content: string) {
// 	const lines = content.split("\n").map((l) => l.trim());
// 	let idx = 0;
// 	const next = () => { while (idx < lines.length && lines[idx] === "") idx++; return lines[idx] ?? ""; };
// 	const consume = () => lines[idx++] ?? "";
// 	next(); const name = consume();
// 	next(); const titleLine = consume();
// 	next(); const contactLine = consume();
// 	next(); const date = consume();
// 	next();
// 	const recipientLines: string[] = [];
// 	while (idx < lines.length) {
// 		const l = lines[idx];
// 		if (l === "") { idx++; continue; }
// 		recipientLines.push(l); idx++;
// 		if (l.toLowerCase().startsWith("re:")) break;
// 	}
// 	const recipientBlock = recipientLines.join("\n");
// 	next(); const salutation = consume();
// 	const signoffKeywords = ["warm regards", "sincerely", "best regards", "kind regards", "yours faithfully", "yours sincerely", "regards,"];
// 	const bodyParagraphs: string[] = [];
// 	let currentPara: string[] = [];
// 	while (idx < lines.length) {
// 		const l = lines[idx];
// 		if (signoffKeywords.some((k) => l.toLowerCase().startsWith(k))) break;
// 		if (l === "") { if (currentPara.length > 0) { bodyParagraphs.push(currentPara.join(" ")); currentPara = []; } }
// 		else { currentPara.push(l); }
// 		idx++;
// 	}
// 	if (currentPara.length > 0) bodyParagraphs.push(currentPara.join(" "));
// 	const signoff = consume();
// 	next(); const signeeName = consume();
// 	next(); const signeeTitle = consume();
// 	next(); const signeeLinkedIn = consume();
// 	return { name, titleLine, contactLine, date, recipientBlock, salutation, bodyParagraphs, signoff, signeeName, signeeTitle, signeeLinkedIn };
// }

// function RenderCoverLetterTemplate({ letter }: { letter: NonNullable<CoverLetterPaneProps["coverLetter"]> }) {
// 	const p = parseCoverLetterContent(letter.content);

// 	if (letter.template === "Modern") {
// 		return (
// 			<div style={{ display: "grid", gridTemplateColumns: "180px 1fr", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", fontFamily: "system-ui, sans-serif", background: "#ffffff" }}>
// 				<div style={{ background: "#1e1b4b", padding: "28px 16px", display: "flex", flexDirection: "column", gap: "20px" }}>
// 					<div>
// 						<div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>
// 							{(p.name || letter.yourName).charAt(0).toUpperCase()}
// 						</div>
// 						<div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8ff" }}>{p.name || letter.yourName}</div>
// 						{p.titleLine && <div style={{ fontSize: "10px", color: "#a5b4fc", marginTop: "3px" }}>{p.titleLine}</div>}
// 					</div>
// 					{p.contactLine && (
// 						<div style={{ borderTop: "1px solid #3730a3", paddingTop: "12px" }}>
// 							<div style={{ fontSize: "9px", color: "#a5b4fc", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "6px" }}>Contact</div>
// 							{p.contactLine.split("|").map((part, i) => <div key={i} style={{ fontSize: "10px", color: "#c7d2fe", lineHeight: 1.6 }}>{part.trim()}</div>)}
// 						</div>
// 					)}
// 					<div style={{ borderTop: "1px solid #3730a3", paddingTop: "12px" }}>
// 						<div style={{ fontSize: "9px", color: "#a5b4fc", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "6px" }}>Applying for</div>
// 						<div style={{ fontSize: "11px", color: "#c7d2fe" }}>{letter.role}</div>
// 						<div style={{ fontSize: "10px", color: "#818cf8", marginTop: "3px" }}>at {letter.company}</div>
// 					</div>
// 				</div>
// 				<div style={{ padding: "28px 24px", color: "#1e293b" }}>
// 					<div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#7c3aed", marginBottom: "12px" }}>Cover Letter</div>
// 					{p.salutation && <div style={{ fontSize: "13px", marginBottom: "12px" }}>{p.salutation}</div>}
// 					<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
// 						{p.bodyParagraphs.map((para, i) => <p key={i} style={{ margin: 0, fontSize: "13px", lineHeight: "1.8", color: "#334155" }}>{para}</p>)}
// 					</div>
// 					<div style={{ marginTop: "20px" }}>
// 						<div style={{ fontSize: "12px", color: "#334155", marginBottom: "8px" }}>{p.signoff || "Warm regards,"}</div>
// 						<div style={{ fontSize: "13px", fontWeight: 700, color: "#1e1b4b" }}>{p.signeeName || letter.yourName}</div>
// 					</div>
// 				</div>
// 			</div>
// 		);
// 	}

// 	if (letter.template === "Minimal") {
// 		return (
// 			<div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "36px 40px", fontFamily: "'Inter', system-ui, sans-serif", color: "#0f172a" }}>
// 				<div style={{ marginBottom: "24px" }}>
// 					<div style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a" }}>{p.name || letter.yourName}</div>
// 					{p.titleLine && <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}><div style={{ width: "28px", height: "2px", background: "#065f46", borderRadius: "1px" }} /><span style={{ fontSize: "11px", color: "#334155" }}>{p.titleLine}</span></div>}
// 					{p.contactLine && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "5px" }}>{p.contactLine}</div>}
// 				</div>
// 				{p.salutation && <div style={{ fontSize: "13px", marginBottom: "16px" }}>{p.salutation}</div>}
// 				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
// 					{p.bodyParagraphs.map((para, i) => (
// 						<div key={i} style={{ display: "flex", gap: "12px" }}>
// 							{i === 0 && <div style={{ width: "3px", background: "#065f46", borderRadius: "2px", flexShrink: 0 }} />}
// 							<p style={{ margin: 0, fontSize: "13px", lineHeight: "1.9", color: "#334155", flex: 1 }}>{para}</p>
// 						</div>
// 					))}
// 				</div>
// 				<div style={{ marginTop: "28px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
// 					<div style={{ fontSize: "12px", color: "#334155", marginBottom: "10px" }}>{p.signoff || "Warm regards,"}</div>
// 					<div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{p.signeeName || letter.yourName}</div>
// 				</div>
// 			</div>
// 		);
// 	}

// 	if (letter.template === "Executive") {
// 		return (
// 			<div style={{ background: "#fffdf8", borderRadius: "12px", border: "1px solid #e7e0d0", padding: "40px 44px", fontFamily: "Georgia, serif", color: "#1c1917" }}>
// 				<div style={{ textAlign: "center", marginBottom: "8px" }}>
// 					<div style={{ borderTop: "2px solid #78350f", borderBottom: "2px solid #78350f", padding: "10px 0" }}>
// 						<div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "0.05em" }}>{(p.name || letter.yourName).toUpperCase()}</div>
// 						{p.titleLine && <div style={{ fontSize: "10px", color: "#92400e", letterSpacing: "0.12em", marginTop: "3px", fontFamily: "system-ui", textTransform: "uppercase" as const }}>{p.titleLine}</div>}
// 					</div>
// 					{p.contactLine && <div style={{ fontSize: "11px", color: "#a16207", marginTop: "8px", fontFamily: "system-ui" }}>{p.contactLine}</div>}
// 				</div>
// 				<div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
// 					<div style={{ flex: 1, height: "1px", background: "#d6c9a8" }} />
// 					<div style={{ width: "6px", height: "6px", background: "#78350f", borderRadius: "50%" }} />
// 					<div style={{ flex: 1, height: "1px", background: "#d6c9a8" }} />
// 				</div>
// 				{p.salutation && <div style={{ fontSize: "13px", marginBottom: "16px" }}>{p.salutation}</div>}
// 				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
// 					{p.bodyParagraphs.map((para, i) => <p key={i} style={{ margin: 0, fontSize: "13px", lineHeight: "1.9", color: "#292524", textAlign: "justify" as const }}>{para}</p>)}
// 				</div>
// 				<div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
// 					<div style={{ flex: 1, height: "1px", background: "#d6c9a8" }} />
// 					<div style={{ width: "6px", height: "6px", background: "#78350f", borderRadius: "50%" }} />
// 					<div style={{ flex: 1, height: "1px", background: "#d6c9a8" }} />
// 				</div>
// 				<div style={{ fontSize: "13px", marginBottom: "12px" }}>{p.signoff || "Warm regards,"}</div>
// 				<div style={{ fontSize: "14px", fontWeight: 700 }}>{p.signeeName || letter.yourName}</div>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div style={{ fontFamily: "Georgia, serif", background: "#ffffff", color: "#1a1a2e", padding: "36px 40px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
// 			<div style={{ borderBottom: "2px solid #1e3a5f", paddingBottom: "16px", marginBottom: "20px" }}>
// 				<div style={{ fontSize: "20px", fontWeight: 700, color: "#1e3a5f" }}>{p.name || letter.yourName}</div>
// 				{p.titleLine && <div style={{ fontSize: "12px", color: "#334155", marginTop: "3px", fontFamily: "system-ui" }}>{p.titleLine}</div>}
// 				{p.contactLine && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px", fontFamily: "system-ui" }}>{p.contactLine}</div>}
// 			</div>
// 			{p.date && <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px", fontFamily: "system-ui", fontStyle: "italic" }}>{p.date}</div>}
// 			{p.recipientBlock && (
// 				<div style={{ marginBottom: "16px", fontFamily: "system-ui" }}>
// 					{p.recipientBlock.split("\n").map((line, i, arr) => (
// 						<div key={i} style={{ fontSize: "12px", color: i === arr.length - 1 ? "#1e3a5f" : "#334155", fontWeight: i === arr.length - 1 ? 600 : 400, lineHeight: "1.6" }}>{line}</div>
// 					))}
// 				</div>
// 			)}
// 			{p.salutation && <div style={{ fontSize: "13px", marginBottom: "16px" }}>{p.salutation}</div>}
// 			<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
// 				{p.bodyParagraphs.map((para, i) => <p key={i} style={{ margin: 0, fontSize: "13px", lineHeight: "1.85", color: "#2d3748" }}>{para}</p>)}
// 			</div>
// 			<div style={{ marginTop: "24px" }}>
// 				<div style={{ fontSize: "13px", color: "#2d3748", marginBottom: "12px" }}>{p.signoff || "Warm regards,"}</div>
// 				<div style={{ fontSize: "14px", fontWeight: 700, color: "#1e3a5f" }}>{p.signeeName || letter.yourName}</div>
// 				{p.signeeTitle && <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "system-ui", marginTop: "2px" }}>{p.signeeTitle}</div>}
// 			</div>
// 		</div>
// 	);
// }

// function CoverLetterPane({ coverLetter }: CoverLetterPaneProps) {
// 	const [isOpen, setIsOpen] = useState(false);
// 	const [copied, setCopied] = useState(false);

// 	const handleCopy = () => {
// 		if (!coverLetter) return;
// 		void navigator.clipboard.writeText(coverLetter.content);
// 		setCopied(true);
// 		setTimeout(() => setCopied(false), 2000);
// 	};

// 	return (
// 		<section className="flex min-h-0 flex-col bg-muted/30">
// 			<button
// 				type="button"
// 				onClick={() => setIsOpen((prev) => !prev)}
// 				className="flex h-14 w-full shrink-0 items-center justify-between border-b px-4 text-left transition-colors hover:bg-muted/50"
// 			>
// 				<div>
// 					<div className="font-semibold"><Trans>Cover Letter</Trans></div>
// 					<div className="text-muted-foreground text-xs">
// 						{coverLetter ? `${coverLetter.role} @ ${coverLetter.company}` : <Trans>No cover letter yet</Trans>}
// 					</div>
// 				</div>
// 				<div className="flex items-center gap-2">
// 					{coverLetter && isOpen && (
// 						<Button size="xs" variant="outline" onClick={(e) => { e.stopPropagation(); handleCopy(); }}>
// 							<CopyIcon />
// 							{copied ? <Trans>Copied!</Trans> : <Trans>Copy</Trans>}
// 						</Button>
// 					)}
// 					<span className="text-muted-foreground text-xs">{isOpen ? "▲" : "▼"}</span>
// 				</div>
// 			</button>
// 			{isOpen && (
// 				<div className="overflow-auto p-4" style={{ maxHeight: "50vh" }}>
// 					{coverLetter ? (
// 						<RenderCoverLetterTemplate letter={coverLetter} />
// 					) : (
// 						<div className="rounded-md border border-dashed p-6 text-center text-muted-foreground text-sm">
// 							<Trans>Generate a cover letter in the chat to see it here.</Trans>
// 						</div>
// 					)}
// 				</div>
// 			)}
// 		</section>
// 	);
// }

// function RouteComponent() {
// 	const { threadId } = Route.useParams();
// 	const navigate = useNavigate();
// 	const queryClient = useQueryClient();
// 	const [mobileTab, setMobileTab] = useState("chat");
// 	const threadsPanelRef = useRef<PanelImperativeHandle | null>(null);
// 	const [isThreadsCollapsed, setIsThreadsCollapsed] = useState(false);
// 	const { data, isLoading, error } = useQuery(orpc.agent.threads.get.queryOptions({ input: { id: threadId } }));
// 	useAgentResumeUpdateSubscription({ resumeId: data?.resume?.id, threadId });

// 	const latestCoverLetter = useMemo(() => {
// 		if (!data?.messages) return null;
// 		for (const message of [...data.messages].reverse()) {
// 			for (const part of message.parts) {
// 				if (part.type !== "tool-generate_cover_letter") continue;
// 				const output =
// 					"output" in part && typeof part.output === "object" && part.output
// 						? (part.output as Record<string, unknown>)
// 						: null;
// 				if (!output) continue;
// 				const coverLetterText = typeof output.coverLetter === "string" ? output.coverLetter : null;
// 				const jobTitle = typeof output.jobTitle === "string" ? output.jobTitle : "";
// 				const companyName = typeof output.companyName === "string" ? output.companyName : "";
// 				if (coverLetterText) {
// 					return {
// 						id: "thread-cover-letter",
// 						title: `Cover Letter – ${companyName}`,
// 						company: companyName,
// 						role: jobTitle,
// 						yourName: "",
// 						content: coverLetterText,
// 						template: "Classic",
// 					};
// 				}
// 			}
// 		}
// 		return null;
// 	}, [data?.messages]);

// 	const toggleThreadsPanel = useCallback(() => {
// 		const panel = threadsPanelRef.current;
// 		if (!panel) return;
// 		if (panel.isCollapsed()) {
// 			panel.expand();
// 			setIsThreadsCollapsed(false);
// 		} else {
// 			panel.collapse();
// 			setIsThreadsCollapsed(true);
// 		}
// 	}, []);

// 	const handleTemplateChange = useCallback(async () => {
// 		await queryClient.invalidateQueries({
// 			queryKey: orpc.agent.threads.get.queryKey({ input: { id: threadId } }),
// 		});
// 	}, [queryClient, threadId]);

// 	if (isLoading) {
// 		return (
// 			<div className="grid h-svh place-items-center bg-background text-muted-foreground">
// 				<Trans>Loading agent workspace…</Trans>
// 			</div>
// 		);
// 	}

// 	if (error || !data) {
// 		return (
// 			<div className="grid h-svh place-items-center bg-background p-6 text-center">
// 				<div className="space-y-4">
// 					<p className="text-muted-foreground"><Trans>This agent thread could not be opened.</Trans></p>
// 					<Button onClick={() => void navigate({ to: "/agent/new" })}>
// 						<Trans>Start a new thread</Trans>
// 					</Button>
// 				</div>
// 			</div>
// 		);
// 	}

// 	const readOnlyReason: "archived" | "missing" | null = data.isReadOnly
// 		? data.thread.status === "archived" ? "archived" : "missing"
// 		: null;

// 	return (
// 		<div className="h-svh bg-background">
// 			{/* Desktop */}
// 			<div className="hidden h-full lg:block">
// 				<ResizableGroup orientation="horizontal" className="h-full">
// 					<ResizablePanel
// 						id="threads"
// 						panelRef={threadsPanelRef}
// 						defaultSize="18%"
// 						minSize="240px"
// 						maxSize="360px"
// 						collapsible
// 						collapsedSize="0px"
// 						onResize={(size) => setIsThreadsCollapsed(size.inPixels < 24)}
// 					>
// 						<AgentThreadSidebar activeThreadId={threadId} className={cn(isThreadsCollapsed && "invisible")} />
// 					</ResizablePanel>
// 					<ResizableSeparator withHandle />
// 					<ResizablePanel id="chat" defaultSize="34%" minSize="280px">
// 						<AgentChat
// 							threadId={threadId}
// 							initialMessages={data.messages}
// 							isReadOnly={data.isReadOnly}
// 							readOnlyReason={readOnlyReason}
// 							threadStatus={data.thread.status}
// 							activeRunId={data.thread.activeRunId}
// 							actions={data.actions}
// 							onToggleThreads={toggleThreadsPanel}
// 						/>
// 					</ResizablePanel>
// 					<ResizableSeparator withHandle />
// 					<ResizablePanel id="right-stack" defaultSize="48%" minSize="300px" maxSize="60%">
// 						<div className="flex h-full flex-col">
// 							<div className="min-h-0 flex-1 overflow-auto">
// 								<ResumePane
// 									resume={data.resume}
// 									onTemplateChange={() => void handleTemplateChange()}
// 								/>
// 							</div>
// 							<div className="h-px shrink-0 bg-border" />
// 							<CoverLetterPane coverLetter={latestCoverLetter} />
// 						</div>
// 					</ResizablePanel>
// 				</ResizableGroup>
// 			</div>

// 			{/* Mobile */}
// 			<div className="flex h-full flex-col lg:hidden">
// 				<div className="border-b p-2">
// 					<Tabs value={mobileTab} onValueChange={setMobileTab}>
// 						<TabsList className="grid w-full grid-cols-4">
// 							<TabsTrigger value="threads">
// 								<SidebarSimpleIcon /><Trans>Threads</Trans>
// 							</TabsTrigger>
// 							<TabsTrigger value="chat">
// 								<ChatCircleDotsIcon /><Trans>Chat</Trans>
// 							</TabsTrigger>
// 							<TabsTrigger value="resume">
// 								<SquaresFourIcon /><Trans>Resume</Trans>
// 							</TabsTrigger>
// 							<TabsTrigger value="cover-letter">
// 								<NotePencilIcon /><Trans>Cover Letter</Trans>
// 							</TabsTrigger>
// 						</TabsList>
// 					</Tabs>
// 				</div>
// 				<div className="min-h-0 flex-1">
// 					<div className={cn("h-full", mobileTab !== "threads" && "hidden")}>
// 						<AgentThreadSidebar activeThreadId={threadId} />
// 					</div>
// 					<div className={cn("h-full", mobileTab !== "chat" && "hidden")}>
// 						<AgentChat
// 							threadId={threadId}
// 							initialMessages={data.messages}
// 							isReadOnly={data.isReadOnly}
// 							readOnlyReason={readOnlyReason}
// 							threadStatus={data.thread.status}
// 							activeRunId={data.thread.activeRunId}
// 							actions={data.actions}
// 						/>
// 					</div>
// 					<div className={cn("h-full", mobileTab !== "resume" && "hidden")}>
// 						<ResumePane
// 							resume={data.resume}
// 							onTemplateChange={() => void handleTemplateChange()}
// 						/>
// 					</div>
// 					<div className={cn("h-full", mobileTab !== "cover-letter" && "hidden")}>
// 						<CoverLetterPane coverLetter={latestCoverLetter} />
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }

import type { UIMessage, UIMessageChunk } from "ai";
import type * as React from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import type { RouterOutput } from "@/libs/orpc/client";
import { useChat } from "@ai-sdk/react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { eventIteratorToUnproxiedDataStream } from "@orpc/client";
import {
	ArchiveIcon,
	ArrowClockwiseIcon,
	ArrowSquareOutIcon,
	ChatCircleDotsIcon,
	CircleNotchIcon,
	ClockCounterClockwiseIcon,
	CopyIcon,
	DotsThreeVerticalIcon,
	FileIcon,
	FilePdfIcon,
	MinusIcon,
	NotePencilIcon,
	PaperclipIcon,
	PaperPlaneRightIcon,
	PlusIcon,
	SidebarSimpleIcon,
	SlideshowIcon,
	SparkleIcon,
	SquaresFourIcon,
	StopIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { m } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@reactive-resume/ui/components/dropdown-menu";
import { ResizableGroup, ResizablePanel, ResizableSeparator } from "@reactive-resume/ui/components/resizable";
import { ScrollArea } from "@reactive-resume/ui/components/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@reactive-resume/ui/components/tabs";
import { Textarea } from "@reactive-resume/ui/components/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@reactive-resume/ui/components/tooltip";
import { downloadWithAnchor, generateFilename } from "@reactive-resume/utils/file";
import { cn } from "@reactive-resume/utils/style";
import { templates as resumeTemplates } from "@/dialogs/resume/template/data";
import { createResumePdfBlob } from "@/features/resume/export/pdf-document";
import { ResumePreview } from "@/features/resume/preview/preview";
import { useConfirm } from "@/hooks/use-confirm";
import { getOrpcErrorMessage } from "@/libs/error-message";
import { client, orpc, streamClient } from "@/libs/orpc/client";
import { AgentThreadSidebar } from "./-components/thread-sidebar";
import { attachmentIdsFromTransportBody, buildAgentChatSubmission } from "./-helpers/chat-attachments";
import { useAgentResumeUpdateSubscription } from "./-hooks/use-agent-resume-updates";

type AgentThreadDetail = RouterOutput["agent"]["threads"]["get"];
type AgentAction = AgentThreadDetail["actions"][number];
type AgentAttachment = AgentThreadDetail["attachments"][number];
type PatchOperation = AgentAction["operations"][number];

type CoverLetterToolCardProps = {
	part: UIMessage["parts"][number];
};

type PatchToolCardProps = {
	part: UIMessage["parts"][number];
	action: AgentAction | undefined;
	onRevert: (actionId: string) => void;
	isReverting: boolean;
};

type StarterPromptMarqueeProps = {
	onSelect: (prompt: string) => void;
};

type AssistantMarkdownProps = {
	text: string;
};

type MessagePartProps = {
	part: UIMessage["parts"][number];
	isUser: boolean;
	onAnswer: (toolCallId: string, answer: string) => void;
	onRevert: (actionId: string) => void;
	isReverting: boolean;
	actionsById: Map<string, AgentAction>;
};

type ChatMessageProps = {
	message: UIMessage;
	onAnswer: (toolCallId: string, answer: string) => void;
	onRevert: (actionId: string) => void;
	isReverting: boolean;
	actionsById: Map<string, AgentAction>;
};

type AgentChatProps = {
	threadId: string;
	initialMessages: UIMessage[];
	isReadOnly: boolean;
	readOnlyReason: "archived" | "missing" | null;
	threadStatus: string;
	activeRunId: string | null;
	actions: AgentAction[];
	onToggleThreads?: () => void;
	onToggleResume?: () => void;
};

type AgentChatReadOnlyBannerProps = {
	isReadOnly: boolean;
	readOnlyReason: "archived" | "missing" | null;
};

type AgentChatMessagesProps = {
	actionsById: Map<string, AgentAction>;
	error: Error | undefined;
	isReadOnly: boolean;
	isReverting: boolean;
	isStreaming: boolean;
	messages: UIMessage[];
	onAnswer: (toolCallId: string, answer: string) => void;
	onRevert: (actionId: string) => void;
	onRetry: () => void;
	onStarterSelect: (prompt: string) => void;
};

type AgentChatHeaderProps = {
	isArchived: boolean;
	isArchivePending: boolean;
	isDeletePending: boolean;
	onArchive: () => void;
	onCopyConversation: () => void;
	onCopyConversationJson: () => void;
	onDelete: () => void;
	onToggleResume?: () => void;
	onToggleThreads?: () => void;
};

type AgentChatComposerProps = {
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	input: string;
	isReadOnly: boolean;
	isStreaming: boolean;
	isUploading: boolean;
	pendingAttachments: Array<Pick<AgentAttachment, "filename" | "id" | "mediaType">>;
	onInputChange: (value: string) => void;
	onSend: () => void;
	onStopRun: () => void;
	onUploadFiles: (files: FileList | null) => void;
};

type ToolbarButtonProps = React.ComponentProps<typeof Button> & {
	label: string;
};

type ResumePaneProps = {
	resume: AgentThreadDetail["resume"];
	onTemplateChange?: () => void;
};

type CoverLetterPaneProps = {
	coverLetter: {
		id: string;
		title: string;
		company: string;
		role: string;
		yourName: string;
		content: string;
		template: string;
	} | null;
};

// ─── Gemini Rate Limit: Retry with exponential backoff ────────────────────────

async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 4): Promise<T> {
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : String(error);
			const isRateLimit =
				msg.includes("429") ||
				msg.toLowerCase().includes("quota") ||
				msg.toLowerCase().includes("rate limit") ||
				msg.toLowerCase().includes("resource_exhausted");
			if (!isRateLimit || attempt === maxRetries - 1) throw error;
			const delayMs = 2 ** (attempt + 1) * 1500; // 3s, 6s, 12s, 24s
			console.warn(`[agent] Gemini rate limit hit, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`);
			toast.warning(t`API limit hit, retrying in ${Math.round(delayMs / 1000)}s…`);
			await new Promise((res) => setTimeout(res, delayMs));
		}
	}
	throw new Error("Max retries exceeded");
}

// ─── Template field definitions ───────────────────────────────────────────────

type FieldDef = { label: string; example: string; required: boolean };

const TEMPLATE_FIELDS: Record<string, FieldDef[]> = {
	onyx: [
		{ label: "Full Name", example: "e.g. Priya Sharma", required: true },
		{ label: "Headline", example: "e.g. Senior Software Engineer", required: true },
		{ label: "Email", example: "e.g. priya@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Bangalore, India", required: false },
		{ label: "Summary", example: "Short bio / professional summary", required: false },
		{ label: "Experience", example: "Company · Role · Duration · Description", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Skills", example: "e.g. React, TypeScript, Node.js", required: false },
	],
	azurill: [
		{ label: "Full Name", example: "e.g. Riddhi Bhardwaj", required: true },
		{ label: "Headline", example: "e.g. UI/UX Designer", required: true },
		{ label: "Email", example: "e.g. riddhi@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Jaipur, India", required: false },
		{ label: "Profile Photo", example: "Upload a photo (optional)", required: false },
		{ label: "Summary", example: "Short intro about yourself", required: false },
		{ label: "Skills", example: "e.g. Figma, React, CSS — shown as skill bars", required: true },
		{ label: "Experience", example: "Company · Role · Duration", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Profiles / Social", example: "GitHub, LinkedIn usernames", required: false },
	],
	bronzor: [
		{ label: "Full Name", example: "e.g. Arjun Mehta", required: true },
		{ label: "Headline", example: "e.g. Financial Analyst", required: true },
		{ label: "Email", example: "e.g. arjun@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Mumbai, India", required: false },
		{ label: "Summary", example: "Professional summary", required: false },
		{ label: "Experience", example: "Company · Role · Duration", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Skills", example: "e.g. Excel, SAP, Financial Modelling", required: false },
		{ label: "Certifications", example: "e.g. CFA Level 1", required: false },
	],
	chikorita: [
		{ label: "Full Name", example: "e.g. Sneha Kapoor", required: true },
		{ label: "Headline", example: "e.g. HR Manager", required: true },
		{ label: "Email", example: "e.g. sneha@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Delhi, India", required: false },
		{ label: "Profile Photo", example: "Circular photo displayed in header", required: false },
		{ label: "Summary", example: "Short professional bio", required: false },
		{ label: "Experience", example: "Company · Role · Duration", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Skills", example: "e.g. Recruitment, HRMS, Payroll", required: false },
	],
	ditgar: [
		{ label: "Full Name", example: "e.g. Karan Verma", required: true },
		{ label: "Headline", example: "e.g. Data Scientist", required: true },
		{ label: "Email", example: "e.g. karan@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Hyderabad, India", required: false },
		{ label: "Summary", example: "Short technical bio", required: false },
		{ label: "Skills", example: "e.g. Python, ML, TensorFlow — shown as grid", required: true },
		{ label: "Experience", example: "Company · Role · Duration", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Projects", example: "Project name · Description · Link", required: false },
	],
	ditto: [
		{ label: "Full Name", example: "e.g. Rohit Singh", required: true },
		{ label: "Headline", example: "e.g. Software Developer", required: true },
		{ label: "Email", example: "e.g. rohit@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Pune, India", required: false },
		{ label: "Summary", example: "ATS-friendly professional summary", required: false },
		{ label: "Experience", example: "Company · Role · Duration", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Skills", example: "Plain text skill list for ATS", required: false },
	],
	gengar: [
		{ label: "Full Name", example: "e.g. Neha Gupta", required: true },
		{ label: "Headline", example: "e.g. Business Analyst", required: true },
		{ label: "Email", example: "e.g. neha@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Chennai, India", required: false },
		{ label: "Summary", example: "Professional overview", required: false },
		{ label: "Experience", example: "Company · Role · Duration", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Skills", example: "e.g. SQL, Tableau, Excel", required: false },
	],
	glalie: [
		{ label: "Full Name", example: "e.g. Vikram Nair", required: true },
		{ label: "Headline", example: "e.g. Senior Counsel", required: true },
		{ label: "Email", example: "e.g. vikram@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Kolkata, India", required: false },
		{ label: "Summary", example: "Executive summary", required: false },
		{ label: "Experience", example: "Company · Role · Duration", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Skills", example: "e.g. Corporate Law, Contracts", required: false },
		{ label: "Certifications", example: "e.g. Bar Council enrollment", required: false },
	],
	kakuna: [
		{ label: "Full Name", example: "e.g. Ananya Joshi", required: true },
		{ label: "Headline", example: "e.g. Software Intern", required: true },
		{ label: "Email", example: "e.g. ananya@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Ahmedabad, India", required: false },
		{ label: "Education", example: "University · Degree · Year · CGPA", required: true },
		{ label: "Projects", example: "Project name · Tech used · Description", required: true },
		{ label: "Skills", example: "e.g. Java, Spring Boot, MySQL", required: true },
		{ label: "Experience", example: "Internship / Part-time work", required: false },
	],
	lapras: [
		{ label: "Full Name", example: "e.g. Suresh Pillai", required: true },
		{ label: "Headline", example: "e.g. VP of Engineering", required: true },
		{ label: "Email", example: "e.g. suresh@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Bangalore, India", required: false },
		{ label: "Summary", example: "Senior executive summary", required: true },
		{ label: "Experience", example: "Company · Role · Duration · Key achievements", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Awards", example: "e.g. Employee of the Year 2022", required: false },
	],
	leafish: [
		{ label: "Full Name", example: "e.g. Meera Iyer", required: true },
		{ label: "Headline", example: "e.g. Public Health Specialist", required: true },
		{ label: "Email", example: "e.g. meera@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Coimbatore, India", required: false },
		{ label: "Summary", example: "Mission-driven professional summary", required: false },
		{ label: "Experience", example: "Organization · Role · Duration", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Volunteer", example: "Organization · Role · Duration", required: false },
		{ label: "Skills", example: "e.g. Epidemiology, SPSS, Public Policy", required: false },
	],
	meowth: [
		{ label: "Full Name", example: "e.g. Li Wei / 李伟", required: true },
		{ label: "Headline", example: "e.g. Software Engineer", required: true },
		{ label: "Email", example: "e.g. liwei@email.com", required: true },
		{ label: "Phone", example: "e.g. +86 138 0000 0000", required: false },
		{ label: "Location", example: "e.g. Beijing, China", required: false },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Experience", example: "Company · Role · Duration — compact inline format", required: true },
		{ label: "Skills", example: "e.g. Java, Python, Spring", required: true },
		{ label: "Projects", example: "Project · Tech stack · Brief description", required: false },
	],
	pikachu: [
		{ label: "Full Name", example: "e.g. Tanya Malhotra", required: true },
		{ label: "Headline", example: "e.g. Content Strategist", required: true },
		{ label: "Email", example: "e.g. tanya@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Noida, India", required: false },
		{ label: "Summary", example: "Creative intro about yourself", required: false },
		{ label: "Experience", example: "Company · Role · Duration", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Skills", example: "e.g. SEO, Copywriting, Figma", required: false },
		{ label: "Profiles / Social", example: "LinkedIn, Portfolio link", required: false },
	],
	rhyhorn: [
		{ label: "Full Name", example: "e.g. Aditya Rao", required: true },
		{ label: "Headline", example: "e.g. UX Designer", required: true },
		{ label: "Email", example: "e.g. aditya@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Bangalore, India", required: false },
		{ label: "Summary", example: "Minimal one-line intro", required: false },
		{ label: "Experience", example: "Company · Role · Duration", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Projects", example: "Project name · Outcome · Link", required: false },
		{ label: "Skills", example: "e.g. Figma, Sketch, Prototyping", required: false },
	],
	scizor: [
		{ label: "Full Name", example: "e.g. Rahul Sharma", required: true },
		{ label: "Headline", example: "e.g. Strategy Consultant", required: true },
		{ label: "Email", example: "e.g. rahul@email.com", required: true },
		{ label: "Phone", example: "e.g. +91 98765 43210", required: false },
		{ label: "Location", example: "e.g. Gurugram, India", required: false },
		{ label: "Summary", example: "Executive-level professional summary", required: true },
		{ label: "Experience", example: "Company · Role · Duration · Achievements", required: true },
		{ label: "Education", example: "University · Degree · Year", required: true },
		{ label: "Skills", example: "e.g. Strategy, M&A, Leadership", required: false },
		{ label: "Certifications", example: "e.g. PMP, CFA", required: false },
	],
};

function getTemplateFields(templateId: string): FieldDef[] {
	return TEMPLATE_FIELDS[templateId] ?? TEMPLATE_FIELDS.onyx ?? [];
}

// ─── Resume Field Guide ────────────────────────────────────────────────────────

type ResumeFieldGuideProps = {
	resume: AgentThreadDetail["resume"];
};

function ResumeFieldGuide({ resume }: ResumeFieldGuideProps) {
	const template = resume?.data?.metadata?.template ?? "onyx";
	const basics = resume?.data?.basics;
	const hasContent = !!(basics?.name && basics.name.trim().length > 0);

	if (hasContent) return null;

	const fields = getTemplateFields(template);
	const templateMeta = resumeTemplates[template as keyof typeof resumeTemplates];
	const templateName = templateMeta?.name ?? template;

	return (
		<div className="mx-auto w-full max-w-lg rounded-xl border border-primary/20 bg-background p-5 shadow-sm">
			<div className="mb-4 flex items-start gap-3">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
					<SparkleIcon className="size-5 text-primary" />
				</div>
				<div>
					<div className="font-semibold text-foreground">
						Template: <span className="text-primary capitalize">{templateName}</span>
					</div>
				</div>
			</div>

			{templateMeta?.imageUrl && (
				<div className="mb-4 overflow-hidden rounded-lg border">
					<img
						src={templateMeta.imageUrl}
						alt={templateName}
						className="w-full object-cover"
						style={{ maxHeight: "160px", objectPosition: "top" }}
					/>
				</div>
			)}

			<div className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
				Fields used in this template
			</div>
			<div className="space-y-1.5">
				{fields.map((field) => (
					<div
						key={field.label}
						className={cn(
							"flex items-center justify-between rounded-md px-3 py-2 text-xs",
							field.required ? "border border-primary/20 bg-primary/5" : "border border-border bg-muted/30",
						)}
					>
						<div className="flex items-center gap-2">
							{field.required ? (
								<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
							) : (
								<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
							)}
							<span className={cn("font-medium", field.required ? "text-foreground" : "text-muted-foreground")}>
								{field.label}
							</span>
						</div>
						<span className="text-right text-muted-foreground/70">{field.example}</span>
					</div>
				))}
			</div>

			<div className="mt-3 flex items-center gap-4 text-muted-foreground text-xs">
				<div className="flex items-center gap-1.5">
					<span className="h-1.5 w-1.5 rounded-full bg-primary" />
					Required
				</div>
				<div className="flex items-center gap-1.5">
					<span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
					Optional
				</div>
			</div>

			<div className="mt-4 rounded-lg border border-muted-foreground/30 border-dashed bg-muted/20 p-3 text-muted-foreground text-xs leading-relaxed">
				💬 Chat mein likho:{" "}
				<span className="text-foreground/70 italic">
					"My name is Priya Sharma, I am a Senior Software Engineer at Google..."
				</span>{" "}
				— AI agent baaki sab fields automatically fill kar dega.
			</div>
		</div>
	);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toRecord(value: unknown) {
	return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function PatchToolCard({ part, action, onRevert, isReverting }: PatchToolCardProps) {
	const partRecord = part as Record<string, unknown>;
	const state = typeof partRecord.state === "string" ? partRecord.state : null;
	const input = toRecord(partRecord.input);
	const output = toRecord(partRecord.output);

	// ── DEBUG: summary/skills/projects patch detection ──
	useEffect(() => {
		if (state === "output-available" && output) {
			console.group("[PatchToolCard] Patch Output Debug");
			console.log("state:", state);
			console.log("output:", output);
			console.log("operations:", action?.operations ?? output?.operations ?? input?.operations ?? []);
			console.log("action:", action);
			console.groupEnd();
		}
		if (state === "output-error") {
			console.error("[PatchToolCard] Patch FAILED:", partRecord);
		}
	}, [state, output, action, input, partRecord]);

	const actionId =
		state === "output-available"
			? (action?.id ?? (typeof output?.actionId === "string" ? output.actionId : null))
			: null;
	const title =
		action?.title ??
		(typeof output?.title === "string" ? output.title : null) ??
		(typeof input?.title === "string" ? input.title : t`Resume patch`);
	const operations: PatchOperation[] =
		action?.operations ??
		(Array.isArray(output?.operations)
			? (output.operations as PatchOperation[])
			: Array.isArray(input?.operations)
				? (input.operations as PatchOperation[])
				: []);
	const status = action?.status ?? "applied";
	const revertMessage = action?.revertMessage ?? null;
	const label =
		state === "output-error"
			? t`Patch failed`
			: state !== "output-available"
				? t`Patch pending`
				: status === "rolled_back" || status === "reverted"
					? t`Patch rolled back`
					: status === "conflicted"
						? t`Patch conflicted`
						: t`Patch applied`;
	const canRollback = action?.canRollback ?? (Boolean(actionId) && status === "applied");
	const revertDisabled =
		isReverting || !canRollback || status === "rolled_back" || status === "reverted" || status === "conflicted";
	const errorText = typeof partRecord.errorText === "string" ? partRecord.errorText : null;
	const rawPayload = JSON.stringify(
		{
			state,
			input,
			...(partRecord.rawInput !== undefined ? { rawInput: partRecord.rawInput } : {}),
			output,
			...(errorText ? { errorText } : {}),
			...(action ? { action } : {}),
			operations,
		},
		null,
		2,
	);

	return (
		<details className="group text-muted-foreground text-xs">
			<summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-md py-1 font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
				<span>{label}</span>
				<span className="text-muted-foreground/70 group-open:hidden">{title}</span>
			</summary>
			<div className="mt-2 space-y-2 rounded-md border bg-muted/20 p-3">
				<div className="flex items-center justify-between gap-3">
					<div className="min-w-0">
						<p className="truncate font-medium text-foreground">{title}</p>
						{status === "conflicted" && revertMessage ? (
							<p className="mt-1 text-amber-600 dark:text-amber-300">{revertMessage}</p>
						) : null}
						{status === "rolled_back" && revertMessage ? (
							<p className="mt-1 text-muted-foreground">{revertMessage}</p>
						) : null}
						{errorText ? <p className="mt-1 text-rose-500">{errorText}</p> : null}
					</div>
					{actionId ? (
						<Button size="xs" variant="ghost" disabled={revertDisabled} onClick={() => onRevert(actionId)}>
							<ClockCounterClockwiseIcon />
							<Trans>Restore</Trans>
						</Button>
					) : null}
				</div>
				<pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded border bg-background p-3 font-mono text-[0.7rem] leading-relaxed">
					{rawPayload}
				</pre>
			</div>
		</details>
	);
}

function CoverLetterToolCard({ part }: CoverLetterToolCardProps) {
	const partRecord = part as Record<string, unknown>;
	const output =
		typeof partRecord.output === "object" && partRecord.output ? (partRecord.output as Record<string, unknown>) : null;
	const state = typeof partRecord.state === "string" ? partRecord.state : null;
	const coverLetter = typeof output?.coverLetter === "string" ? output.coverLetter : null;
	const jobTitle = typeof output?.jobTitle === "string" ? output.jobTitle : null;
	const companyName = typeof output?.companyName === "string" ? output.companyName : null;
	const isReady = state === "output-available" && coverLetter;

	const handleCopy = () => {
		if (!coverLetter) return;
		void navigator.clipboard.writeText(coverLetter);
		toast.success(t`Cover letter copied!`);
	};

	return (
		<details className="group text-muted-foreground text-xs" open={!!isReady}>
			<summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-md py-1 font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
				<span>{isReady ? t`Cover Letter Ready` : t`Generating Cover Letter…`}</span>
				{jobTitle && companyName ? (
					<span className="text-muted-foreground/70 group-open:hidden">
						{jobTitle} @ {companyName}
					</span>
				) : null}
			</summary>
			{isReady ? (
				<div className="mt-2 space-y-2 rounded-md border bg-muted/20 p-3">
					<div className="flex items-center justify-between gap-3">
						<p className="font-medium text-foreground">
							{jobTitle} @ {companyName}
						</p>
						<Button size="xs" variant="outline" onClick={handleCopy}>
							<CopyIcon />
							<Trans>Copy</Trans>
						</Button>
					</div>
					<pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded border bg-background p-3 font-mono text-[0.7rem] leading-relaxed">
						{coverLetter}
					</pre>
				</div>
			) : (
				<div className="mt-2 rounded-md border bg-muted/20 p-3 text-muted-foreground">
					<Trans>Please wait…</Trans>
				</div>
			)}
		</details>
	);
}

export const Route = createFileRoute("/agent/$threadId")({
	component: RouteComponent,
});

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

function textFromMessage(message: UIMessage) {
	const textParts: string[] = [];
	for (const part of message.parts) {
		if (part.type === "text") textParts.push(part.text);
	}
	return textParts.join("\n");
}

function parseAgentSseStream(stream: ReadableStream<string>) {
	let buffer = "";
	const eventBoundary = /\r?\n\r?\n/;
	return stream.pipeThrough(
		new TransformStream<string, UIMessageChunk>({
			transform(chunk, controller) {
				buffer += chunk;
				let boundary = eventBoundary.exec(buffer);
				while (boundary) {
					const event = buffer.slice(0, boundary.index);
					buffer = buffer.slice(boundary.index + boundary[0].length);
					for (const line of event.split(/\r?\n/)) {
						if (!line.startsWith("data:")) continue;
						const data = line.slice("data:".length).trimStart();
						if (!data || data === "[DONE]") continue;
						try {
							controller.enqueue(JSON.parse(data) as UIMessageChunk);
						} catch (error) {
							console.warn("[agent] dropping malformed SSE frame", error);
						}
					}
					boundary = eventBoundary.exec(buffer);
				}
			},
		}),
	);
}

function promptPreview(prompt: string) {
	const words = prompt.split(/\s+/).filter(Boolean);
	return `${words.slice(0, 7).join(" ")}${words.length > 7 ? "…" : ""}`;
}

function chunkPrompts(prompts: string[], columns: number) {
	return prompts.reduce<string[][]>(
		(rows, prompt, index) => {
			rows[index % columns]?.push(prompt);
			return rows;
		},
		Array.from({ length: columns }, () => []),
	);
}

function StarterPromptMarquee({ onSelect }: StarterPromptMarqueeProps) {
	const prompts = [
		t`Tailor this resume to a product manager job description and emphasize roadmap ownership, stakeholder communication, and measurable launch outcomes.`,
		t`Compare this resume against this role URL and update keywords while keeping the voice concise and credible.`,
		t`Find weak bullets and rewrite them with stronger outcomes, numbers, scope, and sharper verbs.`,
		t`Rework the summary so it targets a senior engineering manager role without sounding generic.`,
		t`Identify gaps for an applicant tracking system and apply only high-confidence keyword improvements.`,
		t`Rewrite this resume for a startup founder-to-product-lead transition with clear business impact.`,
		t`Make the experience section more results-oriented and remove vague responsibilities.`,
		t`Adjust the resume for a remote-first role that values async communication and ownership.`,
		t`Review the resume against a job description and ask me questions before changing uncertain sections.`,
		t`Tighten the skills section so it supports the target role instead of reading like a keyword dump.`,
		t`Update project bullets to show leadership, constraints, tradeoffs, and measurable outcomes.`,
		t`Prepare a conservative patch that improves clarity without changing my career narrative.`,
	];
	const promptRows = chunkPrompts(prompts, 3);
	return (
		<div className="relative mx-auto grid w-full max-w-4xl gap-3 overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
			{promptRows.map((row, rowIndex) => {
				const marqueePrompts = row.flatMap((prompt) => [
					{ id: `${prompt}-primary`, prompt },
					{ id: `${prompt}-repeat-a`, prompt },
					{ id: `${prompt}-repeat-b`, prompt },
				]);
				const duration = 135 + rowIndex * 22;
				const animate = rowIndex % 2 === 0 ? { x: ["0%", "-33.333%"] } : { x: ["-33.333%", "0%"] };
				return (
					<m.div
						key={`prompt-row-${row.join("|")}`}
						className="flex w-max gap-3"
						animate={animate}
						transition={{ duration, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
					>
						{marqueePrompts.map(({ id, prompt }) => (
							<Button
								key={id}
								type="button"
								variant="outline"
								className="h-8 shrink-0 rounded-full bg-background/70 px-3 font-normal text-muted-foreground hover:text-foreground"
								onClick={() => onSelect(prompt)}
							>
								{promptPreview(prompt)}
							</Button>
						))}
					</m.div>
				);
			})}
		</div>
	);
}

function getMessagePartKey(messageId: string, part: UIMessage["parts"][number]) {
	if ("toolCallId" in part && typeof part.toolCallId === "string")
		return `${messageId}-${part.type}-${part.toolCallId}`;
	if (part.type === "text") return `${messageId}-text-${part.text}`;
	if (part.type === "file") return `${messageId}-file-${part.url ?? part.filename}`;
	return `${messageId}-${part.type}-${JSON.stringify(part)}`;
}

function AssistantMarkdown({ text }: AssistantMarkdownProps) {
	return (
		<ReactMarkdown
			skipHtml
			components={{
				p: ({ children }) => <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
				ul: ({ children }) => <ul className="my-2 ms-5 list-disc space-y-1">{children}</ul>,
				ol: ({ children }) => <ol className="my-2 ms-5 list-decimal space-y-1">{children}</ol>,
				li: ({ children }) => <li className="ps-1">{children}</li>,
				a: ({ children, href }) => (
					<a className="text-primary underline underline-offset-4" href={href} target="_blank" rel="noreferrer">
						{children}
					</a>
				),
				code: ({ children, className }) => (
					<code className={cn("rounded border bg-muted px-1 py-0.5 font-mono text-[0.85em]", className)}>
						{children}
					</code>
				),
				pre: ({ children }) => (
					<pre className="my-3 max-w-full overflow-auto rounded-md border bg-muted/30 p-3 text-xs leading-relaxed">
						{children}
					</pre>
				),
				blockquote: ({ children }) => (
					<blockquote className="my-3 border-l-2 ps-3 text-muted-foreground">{children}</blockquote>
				),
			}}
		>
			{text}
		</ReactMarkdown>
	);
}

function MessagePart({ part, isUser, onAnswer, onRevert, isReverting, actionsById }: MessagePartProps) {
	if (part.type === "text") {
		return isUser ? (
			<div className="whitespace-pre-wrap leading-relaxed">{part.text}</div>
		) : (
			<AssistantMarkdown text={part.text} />
		);
	}
	if (part.type === "reasoning") {
		return (
			<details className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
				<summary className="cursor-pointer text-muted-foreground">
					<Trans>Thinking</Trans>
				</summary>
				<div className="mt-2 whitespace-pre-wrap">{part.text}</div>
			</details>
		);
	}
	if (part.type === "tool-ask_user_question") {
		const input =
			"input" in part && typeof part.input === "object" && part.input ? (part.input as Record<string, unknown>) : {};
		const choices = Array.isArray(input.choices)
			? input.choices.filter((choice): choice is string => typeof choice === "string")
			: [];
		const question = typeof input.question === "string" ? input.question : t`The agent needs your input.`;
		return (
			<div className="space-y-3 rounded-md border bg-card p-3">
				<div className="font-medium">{question}</div>
				<div className="flex flex-wrap gap-2">
					{choices.map((choice) => (
						<Button key={choice} size="sm" variant="outline" onClick={() => onAnswer(part.toolCallId, choice)}>
							{choice}
						</Button>
					))}
				</div>
			</div>
		);
	}
	if (part.type === "tool-apply_resume_patch") {
		const output =
			"output" in part && typeof part.output === "object" && part.output
				? (part.output as Record<string, unknown>)
				: null;
		const actionId = typeof output?.actionId === "string" ? output.actionId : null;
		const action = actionId ? actionsById.get(actionId) : undefined;
		return <PatchToolCard part={part} action={action} onRevert={onRevert} isReverting={isReverting} />;
	}
	if (part.type === "tool-generate_cover_letter") {
		return <CoverLetterToolCard part={part} />;
	}
	if (part.type === "source-url") {
		const title = part.title?.trim() || null;
		return (
			<a className="block text-primary text-sm underline" href={part.url} target="_blank" rel="noreferrer">
				{title ? (
					<>
						<span className="block truncate">{title}</span>
						<span className="block truncate text-muted-foreground">{part.url}</span>
					</>
				) : (
					<span className="block truncate">{part.url}</span>
				)}
			</a>
		);
	}
	if (part.type === "file") {
		return (
			<div className="flex max-w-full items-center gap-2 rounded-md border bg-background/20 px-2 py-1 text-sm">
				<FileIcon className="shrink-0" />
				<span className="truncate">{part.filename ?? part.url}</span>
			</div>
		);
	}
	return null;
}

function ChatMessage({ message, onAnswer, onRevert, isReverting, actionsById }: ChatMessageProps) {
	const isUser = message.role === "user";
	return (
		<div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
			<div
				className={cn(
					"space-y-3 text-sm",
					isUser
						? "max-w-[86%] rounded-md bg-primary px-4 py-3 text-primary-foreground"
						: "w-full max-w-full py-1 text-foreground",
				)}
			>
				{message.parts.map((part) => (
					<MessagePart
						key={getMessagePartKey(message.id, part)}
						part={part}
						isUser={isUser}
						onAnswer={onAnswer}
						onRevert={onRevert}
						isReverting={isReverting}
						actionsById={actionsById}
					/>
				))}
			</div>
		</div>
	);
}

function AgentChat({
	threadId,
	initialMessages,
	isReadOnly,
	readOnlyReason,
	threadStatus,
	activeRunId,
	actions,
	onToggleThreads,
	onToggleResume,
}: AgentChatProps) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const confirm = useConfirm();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const refreshedPatchOutputsRef = useRef(new Set<string>());
	const lastSyncedThreadIdRef = useRef<string | null>(null);
	const [input, setInput] = useState("");
	const [pendingAttachments, setPendingAttachments] = useState<
		Array<Pick<AgentAttachment, "id" | "filename" | "mediaType">>
	>([]);
	const [isUploading, setIsUploading] = useState(false);
	const revertMutation = useMutation(orpc.agent.actions.revert.mutationOptions());
	const archiveMutation = useMutation(orpc.agent.threads.archive.mutationOptions());
	const deleteMutation = useMutation(orpc.agent.threads.delete.mutationOptions());
	const isArchived = threadStatus === "archived";

	const refreshThread = useCallback(async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: orpc.agent.threads.list.queryKey() }),
			queryClient.invalidateQueries({ queryKey: orpc.agent.threads.get.queryKey({ input: { id: threadId } }) }),
		]);
	}, [queryClient, threadId]);

	const actionsById = useMemo(() => {
		const map = new Map<string, AgentAction>();
		for (const action of actions) map.set(action.id, action);
		return map;
	}, [actions]);

	const handleArchive = () => {
		archiveMutation.mutate(
			{ id: threadId },
			{
				onSuccess: async () => {
					toast.success(t`Thread archived.`);
					await refreshThread();
				},
				onError: (error) => {
					toast.error(getOrpcErrorMessage(error, { fallback: t`Failed to archive thread.` }));
				},
			},
		);
	};

	const handleDelete = async () => {
		const confirmation = await confirm(t`Delete this agent thread?`, {
			description: t`This action cannot be undone. Conversation messages and uploaded attachments will be removed. The working resume draft remains in your dashboard and can be deleted separately.`,
		});
		if (!confirmation) return;
		deleteMutation.mutate(
			{ id: threadId },
			{
				onSuccess: async () => {
					toast.success(t`Thread deleted.`);
					await queryClient.invalidateQueries({ queryKey: orpc.agent.threads.list.queryKey() });
					void navigate({ to: "/agent" });
				},
				onError: (error) => {
					toast.error(getOrpcErrorMessage(error, { fallback: t`Failed to delete thread.` }));
				},
			},
		);
	};

	// ── Transport with Gemini rate-limit retry ────────────────────────────────
	const transport = useMemo(
		() => ({
			async sendMessages(options: { messages: UIMessage[]; abortSignal?: AbortSignal; body?: object }) {
				const message = options.messages.at(-1);
				if (!message) throw new Error("No message to send.");
				const attachmentIds = attachmentIdsFromTransportBody(options.body);
				return parseAgentSseStream(
					eventIteratorToUnproxiedDataStream(
						await fetchWithRetry(() =>
							streamClient.agent.messages.send({ threadId, message, attachmentIds }, { signal: options.abortSignal }),
						),
					),
				);
			},
			async reconnectToStream() {
				return parseAgentSseStream(
					eventIteratorToUnproxiedDataStream(
						await fetchWithRetry(() => streamClient.agent.messages.resume({ threadId })),
					),
				);
			},
		}),
		[threadId],
	);

	const { messages, sendMessage, regenerate, setMessages, status, error, clearError, addToolOutput } = useChat({
		id: threadId,
		messages: initialMessages,
		resume: !!activeRunId,
		transport,
		sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
		onFinish: () => {
			void refreshThread();
		},
	});

	useEffect(() => {
		let shouldRefresh = false;
		for (const message of messages) {
			for (const part of message.parts) {
				if (part.type !== "tool-apply_resume_patch" || !("output" in part) || !part.output) continue;
				const output = typeof part.output === "object" ? (part.output as Record<string, unknown>) : null;
				const actionId = typeof output?.actionId === "string" ? output.actionId : null;
				const toolCallId = "toolCallId" in part && typeof part.toolCallId === "string" ? part.toolCallId : null;
				const patchOutputKey = actionId ?? toolCallId;
				if (!patchOutputKey || refreshedPatchOutputsRef.current.has(patchOutputKey)) continue;
				refreshedPatchOutputsRef.current.add(patchOutputKey);
				shouldRefresh = true;
			}
		}
		if (shouldRefresh) void refreshThread();
	}, [messages, refreshThread]);

	useEffect(() => {
		if (lastSyncedThreadIdRef.current === threadId) return;
		lastSyncedThreadIdRef.current = threadId;
		setMessages(initialMessages);
	}, [threadId, initialMessages, setMessages]);

	const isStreaming = status === "submitted" || status === "streaming";

	const send = () => {
		const text = input.trim();
		if ((!text && pendingAttachments.length === 0) || isReadOnly || isStreaming || isUploading) return;
		clearError();
		const submission = buildAgentChatSubmission(text, pendingAttachments);
		sendMessage(submission.message, submission.options);
		setInput("");
		setPendingAttachments([]);
	};

	const uploadFiles = async (files: FileList | null) => {
		if (!files?.length) return;
		setIsUploading(true);
		try {
			const attachments = await Promise.all(
				Array.from(files).map(async (file) => {
					const attachment = await client.agent.attachments.create({
						threadId,
						filename: file.name,
						mediaType: file.type || "application/octet-stream",
						data: await fileToBase64(file),
					});
					return { id: attachment.id, filename: attachment.filename, mediaType: attachment.mediaType };
				}),
			);
			setPendingAttachments((current) => [...current, ...attachments]);
			toast.success(t`Attachment uploaded.`);
		} catch (error) {
			toast.error(getOrpcErrorMessage(error, { fallback: t`Failed to upload attachment.` }));
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const stopRun = async () => {
		const last = messages.at(-1);
		await client.agent.messages.stop({
			threadId,
			...(last?.role === "assistant" ? { partialMessage: last } : {}),
		});
	};

	const copyConversationJson = () => {
		void navigator.clipboard.writeText(
			JSON.stringify(
				{ threadId, threadStatus, chatStatus: status, isReadOnly, readOnlyReason, messages, actions },
				null,
				2,
			),
		);
		toast.success(t`Conversation JSON copied.`);
	};

	const copyConversationText = () => {
		void navigator.clipboard.writeText(messages.map(textFromMessage).join("\n\n"));
		toast.success(t`Conversation copied.`);
	};

	const answerToolCall = (toolCallId: string, answer: string) => {
		addToolOutput({ tool: "ask_user_question", toolCallId, output: answer });
	};

	const revertAction = (actionId: string) => {
		const confirmation = window.confirm(
			t`Restore the resume to before this patch? This will roll back this patch and any patches applied after it.`,
		);
		if (!confirmation) return;
		revertMutation.mutate(
			{ id: actionId },
			{
				onSuccess: (action) => {
					if (action.status === "conflicted") {
						toast.error(action.revertMessage ?? t`Cannot restore; the resume has changed since this edit was applied.`);
					} else if (action.status === "rolled_back" || action.status === "reverted") {
						toast.success(t`Patch rolled back.`);
					}
					void refreshThread();
				},
				onError: (error) => toast.error(getOrpcErrorMessage(error, { fallback: t`Could not restore this patch.` })),
			},
		);
	};

	const retryLastMessage = () => {
		clearError();
		void regenerate();
	};

	return (
		<section className="flex h-full min-h-0 flex-col bg-background">
			<AgentChatHeader
				isArchived={isArchived}
				isArchivePending={archiveMutation.isPending}
				isDeletePending={deleteMutation.isPending}
				onArchive={handleArchive}
				onCopyConversation={copyConversationText}
				onCopyConversationJson={copyConversationJson}
				onDelete={() => void handleDelete()}
				onToggleResume={onToggleResume}
				onToggleThreads={onToggleThreads}
			/>
			<AgentChatReadOnlyBanner isReadOnly={isReadOnly} readOnlyReason={readOnlyReason} />
			<AgentChatMessages
				actionsById={actionsById}
				error={error}
				isReadOnly={isReadOnly}
				isReverting={revertMutation.isPending}
				isStreaming={isStreaming}
				messages={messages}
				onAnswer={answerToolCall}
				onRevert={revertAction}
				onRetry={retryLastMessage}
				onStarterSelect={setInput}
			/>
			<AgentChatComposer
				fileInputRef={fileInputRef}
				input={input}
				isReadOnly={isReadOnly}
				isStreaming={isStreaming}
				isUploading={isUploading}
				pendingAttachments={pendingAttachments}
				onInputChange={setInput}
				onSend={send}
				onStopRun={() => void stopRun()}
				onUploadFiles={(files) => void uploadFiles(files)}
			/>
		</section>
	);
}

function AgentChatReadOnlyBanner({ isReadOnly, readOnlyReason }: AgentChatReadOnlyBannerProps) {
	if (!isReadOnly) return null;
	return (
		<div className="border-amber-300 border-b bg-amber-50 px-4 py-2 text-amber-950 text-sm dark:bg-amber-950/20 dark:text-amber-200">
			{readOnlyReason === "archived" ? (
				<Trans>This thread is archived. New messages cannot be sent.</Trans>
			) : (
				<Trans>This thread is read-only because the working resume or AI provider is unavailable.</Trans>
			)}
		</div>
	);
}

function AgentChatMessages({
	actionsById,
	error,
	isReadOnly,
	isReverting,
	isStreaming,
	messages,
	onAnswer,
	onRevert,
	onRetry,
	onStarterSelect,
}: AgentChatMessagesProps) {
	return (
		<ScrollArea className="min-h-0 flex-1">
			<div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
				{messages.length === 0 ? (
					<div className="grid gap-6 py-12 text-center">
						<SparkleIcon className="mx-auto size-8 text-muted-foreground" />
						<h2 className="font-semibold text-2xl">
							<Trans>What do you want to do?</Trans>
						</h2>
						<StarterPromptMarquee onSelect={onStarterSelect} />
					</div>
				) : null}
				{messages.map((message) => (
					<ChatMessage
						key={message.id}
						message={message}
						isReverting={isReverting}
						actionsById={actionsById}
						onAnswer={onAnswer}
						onRevert={onRevert}
					/>
				))}
				{isStreaming ? (
					<div className="flex justify-start">
						<div className="rounded-md bg-muted px-4 py-3 text-muted-foreground text-sm">
							<Trans>Working…</Trans>
						</div>
					</div>
				) : null}
				{error ? (
					<div className="flex items-center justify-between gap-3 rounded-md border border-rose-300 bg-rose-50 p-3 text-rose-950 text-sm dark:bg-rose-950/20 dark:text-rose-200">
						<span>{error.message}</span>
						{!isReadOnly ? (
							<Button size="sm" variant="outline" type="button" onClick={onRetry}>
								<ArrowClockwiseIcon />
								<Trans>Retry</Trans>
							</Button>
						) : null}
					</div>
				) : null}
			</div>
		</ScrollArea>
	);
}

function AgentChatHeader({
	isArchived,
	isArchivePending,
	isDeletePending,
	onArchive,
	onCopyConversation,
	onCopyConversationJson,
	onDelete,
	onToggleResume,
	onToggleThreads,
}: AgentChatHeaderProps) {
	return (
		<div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
			<div className="flex min-w-0 items-center gap-2">
				{onToggleThreads ? (
					<Button size="icon-sm" variant="ghost" onClick={onToggleThreads}>
						<SidebarSimpleIcon />
						<span className="sr-only">
							<Trans>Toggle threads</Trans>
						</span>
					</Button>
				) : null}
				<div className="min-w-0 truncate font-semibold">
					<Trans>Chat</Trans>
				</div>
			</div>
			<div className="flex items-center gap-1">
				{onToggleResume ? (
					<Button size="icon-sm" variant="ghost" onClick={onToggleResume}>
						<SquaresFourIcon />
						<span className="sr-only">
							<Trans>Toggle resume preview</Trans>
						</span>
					</Button>
				) : null}
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button size="icon-sm" variant="ghost">
								<DotsThreeVerticalIcon />
								<span className="sr-only">
									<Trans>Thread actions</Trans>
								</span>
							</Button>
						}
					/>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={onCopyConversation}>
							<CopyIcon />
							<Trans>Copy</Trans>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onCopyConversationJson}>
							<CopyIcon />
							<Trans>Copy JSON</Trans>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{!isArchived ? (
							<DropdownMenuItem disabled={isArchivePending} onClick={onArchive}>
								<ArchiveIcon />
								<Trans>Archive</Trans>
							</DropdownMenuItem>
						) : null}
						<DropdownMenuItem variant="destructive" disabled={isDeletePending} onClick={onDelete}>
							<TrashIcon />
							<Trans>Delete</Trans>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

function AgentChatComposer({
	fileInputRef,
	input,
	isReadOnly,
	isStreaming,
	isUploading,
	pendingAttachments,
	onInputChange,
	onSend,
	onStopRun,
	onUploadFiles,
}: AgentChatComposerProps) {
	return (
		<form
			className="border-t p-3"
			onSubmit={(event) => {
				event.preventDefault();
				onSend();
			}}
		>
			<div className="mx-auto max-w-3xl space-y-2">
				{pendingAttachments.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{pendingAttachments.map((attachment) => (
							<Badge key={attachment.id} variant="secondary">
								<FileIcon />
								{attachment.filename}
							</Badge>
						))}
					</div>
				) : null}
				<div className="flex items-end gap-1 rounded-md border bg-card p-1.5">
					<input
						ref={fileInputRef}
						type="file"
						multiple
						aria-label={t`Upload attachments`}
						className="hidden"
						onChange={(event) => onUploadFiles(event.target.files)}
					/>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						aria-label={t`Attach files`}
						disabled={isReadOnly || isUploading}
						onClick={() => fileInputRef.current?.click()}
					>
						{isUploading ? <ArrowClockwiseIcon className="animate-spin" /> : <PaperclipIcon />}
					</Button>
					<Textarea
						value={input}
						rows={1}
						disabled={isReadOnly || isStreaming}
						onChange={(event) => onInputChange(event.target.value)}
						onKeyDown={(event) => {
							if (event.nativeEvent.isComposing) return;
							if (event.key !== "Enter" || event.shiftKey) return;
							event.preventDefault();
							onSend();
						}}
						placeholder={isReadOnly ? t`This thread is read-only` : t`Ask anything about this resume`}
						className="max-h-40 min-h-9 resize-none border-0 bg-transparent p-2 leading-5 shadow-none focus-visible:ring-0"
					/>
					{isStreaming && !isReadOnly ? (
						<Button type="button" size="icon" variant="outline" aria-label={t`Stop generation`} onClick={onStopRun}>
							<StopIcon />
						</Button>
					) : (
						<Button
							type="submit"
							size="icon"
							aria-label={t`Send message`}
							disabled={isReadOnly || isUploading || (!input.trim() && pendingAttachments.length === 0)}
						>
							<PaperPlaneRightIcon />
						</Button>
					)}
				</div>
			</div>
		</form>
	);
}

const AGENT_PREVIEW_ZOOM_STORAGE_KEY = "reactive-resume:agent-preview-zoom:v3";
const AGENT_PREVIEW_ZOOM_MIGRATION_KEY = `${AGENT_PREVIEW_ZOOM_STORAGE_KEY}:initialized`;
const MIN_PREVIEW_ZOOM = 0.4;
const MAX_PREVIEW_ZOOM = 1.5;
const PREVIEW_ZOOM_STEP = 0.05;
const DEFAULT_PREVIEW_ZOOM = 1;

function clampPreviewZoom(value: number) {
	return Math.min(MAX_PREVIEW_ZOOM, Math.max(MIN_PREVIEW_ZOOM, value));
}

function getInitialPreviewZoom() {
	if (typeof window === "undefined") return DEFAULT_PREVIEW_ZOOM;
	if (!window.localStorage.getItem(AGENT_PREVIEW_ZOOM_MIGRATION_KEY)) {
		window.localStorage.setItem(AGENT_PREVIEW_ZOOM_STORAGE_KEY, String(DEFAULT_PREVIEW_ZOOM));
		window.localStorage.setItem(AGENT_PREVIEW_ZOOM_MIGRATION_KEY, "true");
		return DEFAULT_PREVIEW_ZOOM;
	}
	const stored = Number(window.localStorage.getItem(AGENT_PREVIEW_ZOOM_STORAGE_KEY));
	return Number.isFinite(stored) ? clampPreviewZoom(stored) : DEFAULT_PREVIEW_ZOOM;
}

function ToolbarButton({ label, children, ...props }: ToolbarButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button size="icon-sm" variant="ghost" aria-label={label} {...props}>
						{children}
					</Button>
				}
			/>
			<TooltipContent side="bottom" align="center">
				{label}
			</TooltipContent>
		</Tooltip>
	);
}

function ResumePane({ resume, onTemplateChange }: ResumePaneProps) {
	const queryClient = useQueryClient();
	const [zoom, setZoom] = useState(getInitialPreviewZoom);
	const [isPrinting, setIsPrinting] = useState(false);
	const [showTemplatePanel, setShowTemplatePanel] = useState(false);

	useEffect(() => {
		window.localStorage.setItem(AGENT_PREVIEW_ZOOM_STORAGE_KEY, String(zoom));
	}, [zoom]);

	const setClampedZoom = useCallback((value: number) => {
		setZoom(clampPreviewZoom(Number(value.toFixed(2))));
	}, []);

	const onDownloadPDF = useCallback(async () => {
		if (!resume) return;
		const filename = generateFilename(resume.name || resume.data.basics.name || resume.id, "pdf");
		const toastId = toast.loading(t`Please wait while your PDF is being generated…`);
		setIsPrinting(true);
		try {
			const blob = await createResumePdfBlob(resume.data);
			downloadWithAnchor(blob, filename);
		} catch {
			toast.error(t`There was a problem while generating the PDF, please try again.`);
		} finally {
			setIsPrinting(false);
			toast.dismiss(toastId);
		}
	}, [resume]);

	const handleTemplateSelect = async (templateId: string) => {
		if (!resume) return;
		try {
			await client.resume.update({
				id: resume.id,
				data: {
					...resume.data,
					metadata: {
						...resume.data.metadata,
						template: templateId as never,
					},
				},
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.agent.threads.get.queryKey({ input: { id: resume.id } }),
			});
			await queryClient.invalidateQueries({
				queryKey: orpc.agent.threads.list.queryKey(),
			});
			toast.success(t`Template changed!`);
			onTemplateChange?.();
		} catch {
			toast.error(t`Failed to change template.`);
		}
		setShowTemplatePanel(false);
	};

	const zoomPercent = Math.round(zoom * 100);
	const currentTemplate = resume?.data.metadata.template ?? "";
	const hasContent = !!(resume?.data?.basics?.name && resume.data.basics.name.trim().length > 0);

	return (
		<section className="flex h-full min-h-0 flex-col bg-muted/30">
			<div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
				<div>
					<div className="font-semibold">
						<Trans>Resume</Trans>
					</div>
					<div className="text-muted-foreground text-xs">
						{resume?.name ?? t`Missing working resume`}
						{currentTemplate ? <span className="ml-2 text-primary capitalize">· {currentTemplate}</span> : null}
					</div>
				</div>
				{resume && (
					<ToolbarButton label={t`Change template`} onClick={() => setShowTemplatePanel((prev) => !prev)}>
						<SlideshowIcon />
					</ToolbarButton>
				)}
			</div>

			{showTemplatePanel && (
				<div className="border-b bg-background p-3">
					<div className="mb-2 flex items-center justify-between">
						<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							<Trans>Select Template</Trans>
						</p>
						<button
							type="button"
							className="text-muted-foreground text-xs hover:text-foreground"
							onClick={() => setShowTemplatePanel(false)}
						>
							✕
						</button>
					</div>
					<ScrollArea className="h-48">
						<div className="grid grid-cols-3 gap-2 pr-2">
							{Object.entries(resumeTemplates).map(([id, metadata]) => (
								<button
									key={id}
									type="button"
									onClick={() => void handleTemplateSelect(id)}
									className={cn(
										"flex flex-col gap-1 rounded-md border p-1.5 text-left transition-all hover:border-primary",
										currentTemplate === id && "border-primary ring-1 ring-primary",
									)}
								>
									<img
										src={metadata.imageUrl}
										alt={metadata.name}
										className="aspect-[210/297] w-full rounded object-cover"
									/>
									<span className="truncate text-center font-medium text-xs">{metadata.name}</span>
								</button>
							))}
						</div>
					</ScrollArea>
				</div>
			)}

			{hasContent && (
				<div className="sticky top-0 z-10 flex h-10 items-center justify-between border-b bg-background/90 px-2 backdrop-blur">
					<div className="flex items-center gap-1">
						<ToolbarButton
							label={t`Decrease zoom`}
							disabled={!resume}
							onClick={() => setClampedZoom(zoom - PREVIEW_ZOOM_STEP)}
						>
							<MinusIcon />
						</ToolbarButton>
						<Tooltip>
							<TooltipTrigger
								render={
									<input
										type="text"
										inputMode="numeric"
										value={`${zoomPercent}%`}
										disabled={!resume}
										aria-label={t`Zoom level`}
										className="h-8 w-14 rounded-md border bg-background px-1 text-center text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
										onChange={(event) => {
											const nextValue = Number(event.target.value.replace(/[^0-9.]/g, ""));
											if (Number.isFinite(nextValue)) setClampedZoom(nextValue / 100);
										}}
									/>
								}
							/>
							<TooltipContent side="bottom" align="center">
								<Trans>Zoom level</Trans>
							</TooltipContent>
						</Tooltip>
						<ToolbarButton
							label={t`Increase zoom`}
							disabled={!resume}
							onClick={() => setClampedZoom(zoom + PREVIEW_ZOOM_STEP)}
						>
							<PlusIcon />
						</ToolbarButton>
					</div>
					<div className="flex items-center gap-1">
						<ToolbarButton
							label={t`Open in builder`}
							disabled={!resume}
							nativeButton={false}
							render={resume ? <Link to="/builder/$resumeId" params={{ resumeId: resume.id }} /> : undefined}
						>
							<ArrowSquareOutIcon />
						</ToolbarButton>
						<ToolbarButton
							label={t`Download PDF`}
							disabled={!resume || isPrinting}
							onClick={() => void onDownloadPDF()}
						>
							{isPrinting ? <CircleNotchIcon className="animate-spin" /> : <FilePdfIcon />}
						</ToolbarButton>
					</div>
				</div>
			)}

			<div className="min-h-0 flex-1 overflow-auto">
				{!hasContent && resume && (
					<div className="flex h-10 items-center justify-end border-b bg-background/90 px-2">
						<div className="flex items-center gap-1">
							<ToolbarButton
								label={t`Open in builder`}
								disabled={!resume}
								nativeButton={false}
								render={resume ? <Link to="/builder/$resumeId" params={{ resumeId: resume.id }} /> : undefined}
							>
								<ArrowSquareOutIcon />
							</ToolbarButton>
						</div>
					</div>
				)}
				<div className="p-4">
					{resume ? (
						hasContent ? (
							<ResumePreview
								data={resume.data}
								pageLayout="vertical"
								pageScale={zoom}
								showPageNumbers
								className="mx-auto"
								pageClassName="shadow-lg"
							/>
						) : (
							<ResumeFieldGuide resume={resume} />
						)
					) : (
						<div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
							<Trans>The working resume was deleted. This thread is read-only.</Trans>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

function parseCoverLetterContent(content: string) {
	const lines = content.split("\n").map((l) => l.trim());
	let idx = 0;
	const next = () => {
		while (idx < lines.length && lines[idx] === "") idx++;
		return lines[idx] ?? "";
	};
	const consume = () => lines[idx++] ?? "";
	next();
	const name = consume();
	next();
	const titleLine = consume();
	next();
	const contactLine = consume();
	next();
	const date = consume();
	next();
	const recipientLines: string[] = [];
	while (idx < lines.length) {
		const l = lines[idx];
		if (l === "") {
			idx++;
			continue;
		}
		recipientLines.push(l);
		idx++;
		if (l.toLowerCase().startsWith("re:")) break;
	}
	const recipientBlock = recipientLines.join("\n");
	next();
	const salutation = consume();
	const signoffKeywords = [
		"warm regards",
		"sincerely",
		"best regards",
		"kind regards",
		"yours faithfully",
		"yours sincerely",
		"regards,",
	];
	const bodyParagraphs: string[] = [];
	let currentPara: string[] = [];
	while (idx < lines.length) {
		const l = lines[idx];
		if (signoffKeywords.some((k) => l.toLowerCase().startsWith(k))) break;
		if (l === "") {
			if (currentPara.length > 0) {
				bodyParagraphs.push(currentPara.join(" "));
				currentPara = [];
			}
		} else {
			currentPara.push(l);
		}
		idx++;
	}
	if (currentPara.length > 0) bodyParagraphs.push(currentPara.join(" "));
	const signoff = consume();
	next();
	const signeeName = consume();
	next();
	const signeeTitle = consume();
	next();
	const signeeLinkedIn = consume();
	return {
		name,
		titleLine,
		contactLine,
		date,
		recipientBlock,
		salutation,
		bodyParagraphs,
		signoff,
		signeeName,
		signeeTitle,
		signeeLinkedIn,
	};
}

function RenderCoverLetterTemplate({ letter }: { letter: NonNullable<CoverLetterPaneProps["coverLetter"]> }) {
	const p = parseCoverLetterContent(letter.content);

	if (letter.template === "Modern") {
		return (
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "180px 1fr",
					borderRadius: "12px",
					overflow: "hidden",
					border: "1px solid #e2e8f0",
					fontFamily: "system-ui, sans-serif",
					background: "#ffffff",
				}}
			>
				<div
					style={{ background: "#1e1b4b", padding: "28px 16px", display: "flex", flexDirection: "column", gap: "20px" }}
				>
					<div>
						<div
							style={{
								width: "44px",
								height: "44px",
								borderRadius: "50%",
								background: "#7c3aed",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "16px",
								fontWeight: 700,
								color: "#fff",
								marginBottom: "10px",
							}}
						>
							{(p.name || letter.yourName).charAt(0).toUpperCase()}
						</div>
						<div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8ff" }}>{p.name || letter.yourName}</div>
						{p.titleLine && <div style={{ fontSize: "10px", color: "#a5b4fc", marginTop: "3px" }}>{p.titleLine}</div>}
					</div>
					{p.contactLine && (
						<div style={{ borderTop: "1px solid #3730a3", paddingTop: "12px" }}>
							<div
								style={{
									fontSize: "9px",
									color: "#a5b4fc",
									letterSpacing: "0.1em",
									textTransform: "uppercase" as const,
									marginBottom: "6px",
								}}
							>
								Contact
							</div>
							{p.contactLine.split("|").map((part, i) => (
								<div key={i} style={{ fontSize: "10px", color: "#c7d2fe", lineHeight: 1.6 }}>
									{part.trim()}
								</div>
							))}
						</div>
					)}
					<div style={{ borderTop: "1px solid #3730a3", paddingTop: "12px" }}>
						<div
							style={{
								fontSize: "9px",
								color: "#a5b4fc",
								letterSpacing: "0.1em",
								textTransform: "uppercase" as const,
								marginBottom: "6px",
							}}
						>
							Applying for
						</div>
						<div style={{ fontSize: "11px", color: "#c7d2fe" }}>{letter.role}</div>
						<div style={{ fontSize: "10px", color: "#818cf8", marginTop: "3px" }}>at {letter.company}</div>
					</div>
				</div>
				<div style={{ padding: "28px 24px", color: "#1e293b" }}>
					<div
						style={{
							fontSize: "10px",
							fontWeight: 600,
							letterSpacing: "0.12em",
							textTransform: "uppercase" as const,
							color: "#7c3aed",
							marginBottom: "12px",
						}}
					>
						Cover Letter
					</div>
					{p.salutation && <div style={{ fontSize: "13px", marginBottom: "12px" }}>{p.salutation}</div>}
					<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
						{p.bodyParagraphs.map((para, i) => (
							<p key={i} style={{ margin: 0, fontSize: "13px", lineHeight: "1.8", color: "#334155" }}>
								{para}
							</p>
						))}
					</div>
					<div style={{ marginTop: "20px" }}>
						<div style={{ fontSize: "12px", color: "#334155", marginBottom: "8px" }}>
							{p.signoff || "Warm regards,"}
						</div>
						<div style={{ fontSize: "13px", fontWeight: 700, color: "#1e1b4b" }}>{p.signeeName || letter.yourName}</div>
					</div>
				</div>
			</div>
		);
	}

	if (letter.template === "Minimal") {
		return (
			<div
				style={{
					background: "#ffffff",
					borderRadius: "12px",
					border: "1px solid #e2e8f0",
					padding: "36px 40px",
					fontFamily: "'Inter', system-ui, sans-serif",
					color: "#0f172a",
				}}
			>
				<div style={{ marginBottom: "24px" }}>
					<div style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a" }}>{p.name || letter.yourName}</div>
					{p.titleLine && (
						<div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "5px" }}>
							<div style={{ width: "28px", height: "2px", background: "#065f46", borderRadius: "1px" }} />
							<span style={{ fontSize: "11px", color: "#334155" }}>{p.titleLine}</span>
						</div>
					)}
					{p.contactLine && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "5px" }}>{p.contactLine}</div>}
				</div>
				{p.salutation && <div style={{ fontSize: "13px", marginBottom: "16px" }}>{p.salutation}</div>}
				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					{p.bodyParagraphs.map((para, i) => (
						<div key={i} style={{ display: "flex", gap: "12px" }}>
							{i === 0 && <div style={{ width: "3px", background: "#065f46", borderRadius: "2px", flexShrink: 0 }} />}
							<p style={{ margin: 0, fontSize: "13px", lineHeight: "1.9", color: "#334155", flex: 1 }}>{para}</p>
						</div>
					))}
				</div>
				<div style={{ marginTop: "28px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
					<div style={{ fontSize: "12px", color: "#334155", marginBottom: "10px" }}>{p.signoff || "Warm regards,"}</div>
					<div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{p.signeeName || letter.yourName}</div>
				</div>
			</div>
		);
	}

	if (letter.template === "Executive") {
		return (
			<div
				style={{
					background: "#fffdf8",
					borderRadius: "12px",
					border: "1px solid #e7e0d0",
					padding: "40px 44px",
					fontFamily: "Georgia, serif",
					color: "#1c1917",
				}}
			>
				<div style={{ textAlign: "center", marginBottom: "8px" }}>
					<div style={{ borderTop: "2px solid #78350f", borderBottom: "2px solid #78350f", padding: "10px 0" }}>
						<div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "0.05em" }}>
							{(p.name || letter.yourName).toUpperCase()}
						</div>
						{p.titleLine && (
							<div
								style={{
									fontSize: "10px",
									color: "#92400e",
									letterSpacing: "0.12em",
									marginTop: "3px",
									fontFamily: "system-ui",
									textTransform: "uppercase" as const,
								}}
							>
								{p.titleLine}
							</div>
						)}
					</div>
					{p.contactLine && (
						<div style={{ fontSize: "11px", color: "#a16207", marginTop: "8px", fontFamily: "system-ui" }}>
							{p.contactLine}
						</div>
					)}
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
					<div style={{ flex: 1, height: "1px", background: "#d6c9a8" }} />
					<div style={{ width: "6px", height: "6px", background: "#78350f", borderRadius: "50%" }} />
					<div style={{ flex: 1, height: "1px", background: "#d6c9a8" }} />
				</div>
				{p.salutation && <div style={{ fontSize: "13px", marginBottom: "16px" }}>{p.salutation}</div>}
				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					{p.bodyParagraphs.map((para, i) => (
						<p
							key={i}
							style={{
								margin: 0,
								fontSize: "13px",
								lineHeight: "1.9",
								color: "#292524",
								textAlign: "justify" as const,
							}}
						>
							{para}
						</p>
					))}
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
					<div style={{ flex: 1, height: "1px", background: "#d6c9a8" }} />
					<div style={{ width: "6px", height: "6px", background: "#78350f", borderRadius: "50%" }} />
					<div style={{ flex: 1, height: "1px", background: "#d6c9a8" }} />
				</div>
				<div style={{ fontSize: "13px", marginBottom: "12px" }}>{p.signoff || "Warm regards,"}</div>
				<div style={{ fontSize: "14px", fontWeight: 700 }}>{p.signeeName || letter.yourName}</div>
			</div>
		);
	}

	return (
		<div
			style={{
				fontFamily: "Georgia, serif",
				background: "#ffffff",
				color: "#1a1a2e",
				padding: "36px 40px",
				borderRadius: "12px",
				border: "1px solid #e2e8f0",
			}}
		>
			<div style={{ borderBottom: "2px solid #1e3a5f", paddingBottom: "16px", marginBottom: "20px" }}>
				<div style={{ fontSize: "20px", fontWeight: 700, color: "#1e3a5f" }}>{p.name || letter.yourName}</div>
				{p.titleLine && (
					<div style={{ fontSize: "12px", color: "#334155", marginTop: "3px", fontFamily: "system-ui" }}>
						{p.titleLine}
					</div>
				)}
				{p.contactLine && (
					<div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px", fontFamily: "system-ui" }}>
						{p.contactLine}
					</div>
				)}
			</div>
			{p.date && (
				<div
					style={{
						fontSize: "12px",
						color: "#64748b",
						marginBottom: "16px",
						fontFamily: "system-ui",
						fontStyle: "italic",
					}}
				>
					{p.date}
				</div>
			)}
			{p.recipientBlock && (
				<div style={{ marginBottom: "16px", fontFamily: "system-ui" }}>
					{p.recipientBlock.split("\n").map((line, i, arr) => (
						<div
							key={i}
							style={{
								fontSize: "12px",
								color: i === arr.length - 1 ? "#1e3a5f" : "#334155",
								fontWeight: i === arr.length - 1 ? 600 : 400,
								lineHeight: "1.6",
							}}
						>
							{line}
						</div>
					))}
				</div>
			)}
			{p.salutation && <div style={{ fontSize: "13px", marginBottom: "16px" }}>{p.salutation}</div>}
			<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
				{p.bodyParagraphs.map((para, i) => (
					<p key={i} style={{ margin: 0, fontSize: "13px", lineHeight: "1.85", color: "#2d3748" }}>
						{para}
					</p>
				))}
			</div>
			<div style={{ marginTop: "24px" }}>
				<div style={{ fontSize: "13px", color: "#2d3748", marginBottom: "12px" }}>{p.signoff || "Warm regards,"}</div>
				<div style={{ fontSize: "14px", fontWeight: 700, color: "#1e3a5f" }}>{p.signeeName || letter.yourName}</div>
				{p.signeeTitle && (
					<div style={{ fontSize: "12px", color: "#64748b", fontFamily: "system-ui", marginTop: "2px" }}>
						{p.signeeTitle}
					</div>
				)}
			</div>
		</div>
	);
}

function CoverLetterPane({ coverLetter }: CoverLetterPaneProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		if (!coverLetter) return;
		void navigator.clipboard.writeText(coverLetter.content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<section className="flex min-h-0 flex-col bg-muted/30">
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex h-14 w-full shrink-0 items-center justify-between border-b px-4 text-left transition-colors hover:bg-muted/50"
			>
				<div>
					<div className="font-semibold">
						<Trans>Cover Letter</Trans>
					</div>
					<div className="text-muted-foreground text-xs">
						{coverLetter ? `${coverLetter.role} @ ${coverLetter.company}` : <Trans>No cover letter yet</Trans>}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{coverLetter && isOpen && (
						<Button
							size="xs"
							variant="outline"
							onClick={(e) => {
								e.stopPropagation();
								handleCopy();
							}}
						>
							<CopyIcon />
							{copied ? <Trans>Copied!</Trans> : <Trans>Copy</Trans>}
						</Button>
					)}
					<span className="text-muted-foreground text-xs">{isOpen ? "▲" : "▼"}</span>
				</div>
			</button>
			{isOpen && (
				<div className="min-h-0 flex-1 overflow-auto p-4">
					{coverLetter ? (
						<RenderCoverLetterTemplate letter={coverLetter} />
					) : (
						<div className="rounded-md border border-dashed p-6 text-center text-muted-foreground text-sm">
							<Trans>Generate a cover letter in the chat to see it here.</Trans>
						</div>
					)}
				</div>
			)}
		</section>
	);
}

function RouteComponent() {
	const { threadId } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [mobileTab, setMobileTab] = useState("chat");
	const threadsPanelRef = useRef<PanelImperativeHandle | null>(null);
	const [isThreadsCollapsed, setIsThreadsCollapsed] = useState(false);
	const { data, isLoading, error } = useQuery(orpc.agent.threads.get.queryOptions({ input: { id: threadId } }));
	useAgentResumeUpdateSubscription({ resumeId: data?.resume?.id, threadId });

	const latestCoverLetter = useMemo(() => {
		if (!data?.messages) return null;

		// Method 1: tool-generate_cover_letter type se
		for (const message of [...data.messages].reverse()) {
			for (const part of message.parts) {
				if (part.type !== "tool-generate_cover_letter") continue;
				const output =
					"output" in part && typeof part.output === "object" && part.output
						? (part.output as Record<string, unknown>)
						: null;
				if (!output) continue;
				const coverLetterText = typeof output.coverLetter === "string" ? output.coverLetter : null;
				const jobTitle = typeof output.jobTitle === "string" ? output.jobTitle : "";
				const companyName = typeof output.companyName === "string" ? output.companyName : "";
				if (coverLetterText) {
					return {
						id: "thread-cover-letter",
						title: `Cover Letter – ${companyName}`,
						company: companyName,
						role: jobTitle,
						yourName: "",
						content: coverLetterText,
						template: "Classic",
					};
				}
			}
		}

		// Method 2: assistant text message se extract karo
		for (const message of [...data.messages].reverse()) {
			if (message.role !== "assistant") continue;
			for (const part of message.parts) {
				if (part.type !== "text") continue;
				const text = part.text;
				// "Dear Hiring Manager" ya "Dear [Name]" se shuru hone wala text cover letter hai
				const hasSalutation = /dear\s+(hiring\s+manager|[a-z\s]+,)/i.test(text);
				const hasSignoff = /sincerely|warm regards|best regards|yours faithfully/i.test(text);
				if (!hasSalutation || !hasSignoff) continue;
				// Company aur role dhundo message history se
				let company = "";
				let role = "";
				for (const msg of data.messages) {
					for (const p of msg.parts) {
						if (p.type !== "text") continue;
						const roleMatch = p.text.match(
							/cover letter.*?for\s+(.+?)\s+(?:role|position|at)\s+(?:at\s+)?([A-Z][^\s,]+)/i,
						);
						if (roleMatch) {
							role = roleMatch[1] ?? "";
							company = roleMatch[2] ?? "";
						}
						const atMatch = p.text.match(/([A-Z][a-z][\w\s]+)\s+(?:role|position)\s+at\s+([A-Z][^\s,]+)/i);
						if (atMatch) {
							role = atMatch[1] ?? "";
							company = atMatch[2] ?? "";
						}
					}
				}
				return {
					id: "thread-cover-letter-text",
					title: `Cover Letter${company ? ` – ${company}` : ""}`,
					company,
					role,
					yourName: "",
					content: text,
					template: "Classic",
				};
			}
		}

		return null;
	}, [data?.messages]);

	// DEBUG: Cover letter detection
	useEffect(() => {
		console.log(
			"[CoverLetter Debug] parts:",
			data?.messages?.flatMap((m) =>
				m.parts.map((p) => ({
					type: p.type,
					hasOutput: "output" in p,
					output: "output" in p ? p.output : null,
				})),
			),
		);
		console.log("[CoverLetter Debug] latestCoverLetter:", latestCoverLetter);
	}, [data?.messages, latestCoverLetter]);

	const toggleThreadsPanel = useCallback(() => {
		const panel = threadsPanelRef.current;
		if (!panel) return;
		if (panel.isCollapsed()) {
			panel.expand();
			setIsThreadsCollapsed(false);
		} else {
			panel.collapse();
			setIsThreadsCollapsed(true);
		}
	}, []);

	const handleTemplateChange = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: orpc.agent.threads.get.queryKey({ input: { id: threadId } }),
		});
	}, [queryClient, threadId]);

	if (isLoading) {
		return (
			<div className="grid h-svh place-items-center bg-background text-muted-foreground">
				<Trans>Loading agent workspace…</Trans>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="grid h-svh place-items-center bg-background p-6 text-center">
				<div className="space-y-4">
					<p className="text-muted-foreground">
						<Trans>This agent thread could not be opened.</Trans>
					</p>
					<Button onClick={() => void navigate({ to: "/agent/new" })}>
						<Trans>Start a new thread</Trans>
					</Button>
				</div>
			</div>
		);
	}

	const readOnlyReason: "archived" | "missing" | null = data.isReadOnly
		? data.thread.status === "archived"
			? "archived"
			: "missing"
		: null;

	return (
		<div className="h-svh bg-background">
			{/* Desktop */}
			<div className="hidden h-full lg:block">
				<ResizableGroup orientation="horizontal" className="h-full">
					<ResizablePanel
						id="threads"
						panelRef={threadsPanelRef}
						defaultSize="18%"
						minSize="240px"
						maxSize="360px"
						collapsible
						collapsedSize="0px"
						onResize={(size) => setIsThreadsCollapsed(size.inPixels < 24)}
					>
						<AgentThreadSidebar activeThreadId={threadId} className={cn(isThreadsCollapsed && "invisible")} />
					</ResizablePanel>
					<ResizableSeparator withHandle />
					<ResizablePanel id="chat" defaultSize="34%" minSize="280px">
						<AgentChat
							threadId={threadId}
							initialMessages={data.messages}
							isReadOnly={data.isReadOnly}
							readOnlyReason={readOnlyReason}
							threadStatus={data.thread.status}
							activeRunId={data.thread.activeRunId}
							actions={data.actions}
							onToggleThreads={toggleThreadsPanel}
						/>
					</ResizablePanel>
					<ResizableSeparator withHandle />
					<ResizablePanel id="right-stack" defaultSize="48%" minSize="300px" maxSize="60%">
						<div className="flex h-full flex-col">
							<div className="min-h-0 flex-1 overflow-auto">
								<ResumePane resume={data.resume} onTemplateChange={() => void handleTemplateChange()} />
							</div>
							<div className="h-px shrink-0 bg-border" />
							<CoverLetterPane coverLetter={latestCoverLetter} />
						</div>
					</ResizablePanel>
				</ResizableGroup>
			</div>

			{/* Mobile */}
			<div className="flex h-full flex-col lg:hidden">
				<div className="border-b p-2">
					<Tabs value={mobileTab} onValueChange={setMobileTab}>
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="threads">
								<SidebarSimpleIcon />
								<Trans>Threads</Trans>
							</TabsTrigger>
							<TabsTrigger value="chat">
								<ChatCircleDotsIcon />
								<Trans>Chat</Trans>
							</TabsTrigger>
							<TabsTrigger value="resume">
								<SquaresFourIcon />
								<Trans>Resume</Trans>
							</TabsTrigger>
							<TabsTrigger value="cover-letter">
								<NotePencilIcon />
								<Trans>Cover Letter</Trans>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
				<div className="min-h-0 flex-1">
					<div className={cn("h-full", mobileTab !== "threads" && "hidden")}>
						<AgentThreadSidebar activeThreadId={threadId} />
					</div>
					<div className={cn("h-full", mobileTab !== "chat" && "hidden")}>
						<AgentChat
							threadId={threadId}
							initialMessages={data.messages}
							isReadOnly={data.isReadOnly}
							readOnlyReason={readOnlyReason}
							threadStatus={data.thread.status}
							activeRunId={data.thread.activeRunId}
							actions={data.actions}
						/>
					</div>
					<div className={cn("h-full", mobileTab !== "resume" && "hidden")}>
						<ResumePane resume={data.resume} onTemplateChange={() => void handleTemplateChange()} />
					</div>
					<div className={cn("h-full", mobileTab !== "cover-letter" && "hidden")}>
						<CoverLetterPane coverLetter={latestCoverLetter} />
					</div>
				</div>
			</div>
		</div>
	);
}
