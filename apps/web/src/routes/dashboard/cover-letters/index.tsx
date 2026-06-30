import { Trans } from "@lingui/react/macro";
import {
	ArrowLeftIcon,
	CopyIcon,
	DownloadSimpleIcon,
	FloppyDiskIcon,
	NotePencilIcon,
	PencilSimpleIcon,
	PlusIcon,
	SparkleIcon,
	TrashIcon,
	UploadSimpleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { client } from "@/libs/orpc/client";

export const Route = createFileRoute("/dashboard/cover-letters/")({
	component: CoverLettersPage,
});

type TemplateStyle = "Classic" | "Modern" | "Minimal" | "Executive";
type CreationMode = "manual" | "resume";
type Step = "pick-template" | "fill-form";

type CoverLetter = {
	id: string;
	title: string;
	company: string;
	role: string;
	yourName: string;
	content: string;
	createdAt: string;
	template: TemplateStyle;
};

// ─── Template metadata ────────────────────────────────────────────────────────

const TEMPLATES: {
	id: TemplateStyle;
	label: string;
	desc: string;
	tag: string;
	color: string;
	bg: string;
	border: string;
	tagStyle: string;
}[] = [
	{
		id: "Classic",
		label: "Classic",
		desc: "Timeless layout with clean serif typography and a formal header",
		tag: "Universal",
		color: "#1e3a5f",
		bg: "#f8f9fc",
		border: "#c9d6e3",
		tagStyle: "bg-blue-50 text-blue-700 border border-blue-200",
	},
	{
		id: "Modern",
		label: "Modern",
		desc: "Bold navy sidebar with name & contact info — standout for tech roles",
		tag: "Tech & Startups",
		color: "#7c3aed",
		bg: "#f5f3ff",
		border: "#ddd6fe",
		tagStyle: "bg-violet-50 text-violet-700 border border-violet-200",
	},
	{
		id: "Minimal",
		label: "Minimal",
		desc: "Ultra-clean layout — single left accent line, pure whitespace",
		tag: "Design & Creative",
		color: "#065f46",
		bg: "#f0fdf4",
		border: "#bbf7d0",
		tagStyle: "bg-emerald-50 text-emerald-700 border border-emerald-200",
	},
	{
		id: "Executive",
		label: "Executive",
		desc: "Centered crest-style header with double rules — finance & consulting",
		tag: "Finance & Consulting",
		color: "#78350f",
		bg: "#fffbeb",
		border: "#fde68a",
		tagStyle: "bg-amber-50 text-amber-800 border border-amber-200",
	},
];

// ─── Template Renderers ───────────────────────────────────────────────────────

/**
 * The first "paragraph" of every letter is the structured header block:
 *   Name
 *   Title | Stack
 *   Email | Phone | Location | LinkedIn
 *   Date
 *   (blank)
 *   Hiring Manager
 *   Company
 *   Re: Role — Application
 *
 * We parse this out and render it with template-specific styling,
 * then render the rest as normal body paragraphs.
 */

type ParsedLetter = {
	name: string;
	titleLine: string; // "Senior Full Stack Developer | MERN · Next.js …"
	contactLine: string; // "email | phone | city | linkedin"
	date: string;
	recipientBlock: string; // "Hiring Manager\nCOMPANY\nRe: …"
	salutation: string; // "Dear Hiring Manager,"
	bodyParagraphs: string[];
	signoff: string; // "Warm regards,"
	signeeName: string; // bold name
	signeeTitle: string;
	signeeLinkedIn: string;
};

function parseLetter(content: string): ParsedLetter {
	const lines = content.split("\n").map((l) => l.trim());
	let idx = 0;

	const next = () => {
		while (idx < lines.length && lines[idx] === "") idx++;
		return lines[idx] ?? "";
	};
	const consume = () => lines[idx++] ?? "";

	// Name — first non-empty line
	next();
	const name = consume();

	// Title | stack line
	next();
	const titleLine = consume();

	// Contact line — contains @ or phone pattern
	next();
	const contactLine = consume();

	// Date — next non-empty line that looks like a date or starts with digits
	next();
	const date = consume();

	// Recipient block — up to and including the "Re:" line
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

	// Salutation
	next();
	const salutation = consume();

	// Body paragraphs — collect until sign-off keywords
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

	// Sign-off
	const signoff = consume();

	// Signee block
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

// ── Classic ──────────────────────────────────────────────────────────────────

function ClassicTemplate({ letter }: { letter: CoverLetter }) {
	const p = parseLetter(letter.content);
	return (
		<div
			style={{
				fontFamily: "Georgia, 'Times New Roman', serif",
				background: "#ffffff",
				color: "#1a1a2e",
				padding: "48px 52px",
				borderRadius: "12px",
				border: "1px solid #e2e8f0",
			}}
		>
			{/* Header */}
			<div style={{ borderBottom: "2px solid #1e3a5f", paddingBottom: "20px", marginBottom: "24px" }}>
				<div style={{ fontSize: "22px", fontWeight: 700, color: "#1e3a5f", letterSpacing: "-0.3px" }}>
					{p.name || letter.yourName}
				</div>
				{p.titleLine && (
					<div style={{ fontSize: "13px", color: "#334155", marginTop: "3px", fontFamily: "system-ui, sans-serif" }}>
						{p.titleLine}
					</div>
				)}
				{p.contactLine && (
					<div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px", fontFamily: "system-ui, sans-serif" }}>
						{p.contactLine}
					</div>
				)}
			</div>
			{/* Date */}
			{p.date && (
				<div
					style={{
						fontSize: "13px",
						color: "#64748b",
						marginBottom: "20px",
						fontFamily: "system-ui, sans-serif",
						fontStyle: "italic",
					}}
				>
					{p.date}
				</div>
			)}
			{/* Recipient */}
			{p.recipientBlock && (
				<div style={{ marginBottom: "20px", fontFamily: "system-ui, sans-serif" }}>
					{p.recipientBlock.split("\n").map((line, i) => (
						<div
							key={i}
							style={{
								fontSize: i === p.recipientBlock.split("\n").length - 1 ? "13px" : "13px",
								color: i === p.recipientBlock.split("\n").length - 1 ? "#1e3a5f" : "#334155",
								fontWeight: i === p.recipientBlock.split("\n").length - 1 ? 600 : 400,
								lineHeight: "1.6",
							}}
						>
							{line}
						</div>
					))}
				</div>
			)}
			{/* Salutation */}
			{p.salutation && <div style={{ fontSize: "14.5px", marginBottom: "20px", color: "#1a1a2e" }}>{p.salutation}</div>}
			{/* Body */}
			<div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
				{p.bodyParagraphs.map((para, i) => (
					<p key={i} style={{ margin: 0, fontSize: "14.5px", lineHeight: "1.85", color: "#2d3748" }}>
						{para}
					</p>
				))}
			</div>
			{/* Sign-off */}
			<div style={{ marginTop: "32px" }}>
				<div style={{ fontSize: "14px", color: "#2d3748", marginBottom: "16px" }}>{p.signoff || "Warm regards,"}</div>
				<div style={{ fontSize: "15px", fontWeight: 700, color: "#1e3a5f" }}>{p.signeeName || letter.yourName}</div>
				{p.signeeTitle && (
					<div style={{ fontSize: "13px", color: "#64748b", fontFamily: "system-ui, sans-serif", marginTop: "2px" }}>
						{p.signeeTitle}
					</div>
				)}
				{p.signeeLinkedIn && (
					<div style={{ fontSize: "12px", fontFamily: "system-ui, sans-serif", marginTop: "2px" }}>
						<a
							href={p.signeeLinkedIn.startsWith("http") ? p.signeeLinkedIn : `https://${p.signeeLinkedIn}`}
							target="_blank"
							rel="noreferrer"
							style={{ color: "#3b82f6", textDecoration: "none" }}
						>
							{p.signeeLinkedIn}
						</a>
					</div>
				)}
			</div>
		</div>
	);
}

// ── Modern ───────────────────────────────────────────────────────────────────

function ModernTemplate({ letter }: { letter: CoverLetter }) {
	const p = parseLetter(letter.content);
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "200px 1fr",
				borderRadius: "12px",
				overflow: "hidden",
				border: "1px solid #e2e8f0",
				fontFamily: "system-ui, -apple-system, sans-serif",
				background: "#ffffff",
			}}
		>
			{/* Sidebar */}
			<div
				style={{ background: "#1e1b4b", padding: "36px 20px", display: "flex", flexDirection: "column", gap: "24px" }}
			>
				<div>
					<div
						style={{
							width: "52px",
							height: "52px",
							borderRadius: "50%",
							background: "#7c3aed",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "18px",
							fontWeight: 700,
							color: "#fff",
							marginBottom: "12px",
						}}
					>
						{(p.name || letter.yourName).charAt(0).toUpperCase()}
					</div>
					<div style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8ff", lineHeight: 1.3 }}>
						{p.name || letter.yourName}
					</div>
					{p.titleLine && (
						<div style={{ fontSize: "11px", color: "#a5b4fc", marginTop: "4px", lineHeight: 1.4 }}>{p.titleLine}</div>
					)}
				</div>
				{p.contactLine && (
					<div style={{ borderTop: "1px solid #3730a3", paddingTop: "16px" }}>
						<div
							style={{
								fontSize: "10px",
								color: "#a5b4fc",
								letterSpacing: "0.1em",
								textTransform: "uppercase" as const,
								marginBottom: "8px",
							}}
						>
							Contact
						</div>
						{p.contactLine.split("|").map((part, i) => (
							<div key={i} style={{ fontSize: "11px", color: "#c7d2fe", lineHeight: 1.6 }}>
								{part.trim()}
							</div>
						))}
					</div>
				)}
				<div style={{ borderTop: "1px solid #3730a3", paddingTop: "16px" }}>
					<div
						style={{
							fontSize: "10px",
							color: "#a5b4fc",
							letterSpacing: "0.1em",
							textTransform: "uppercase" as const,
							marginBottom: "8px",
						}}
					>
						Applying for
					</div>
					<div style={{ fontSize: "12px", color: "#c7d2fe", lineHeight: 1.5 }}>{letter.role}</div>
					<div style={{ fontSize: "11px", color: "#818cf8", marginTop: "4px" }}>at {letter.company}</div>
				</div>
				{p.date && (
					<div style={{ borderTop: "1px solid #3730a3", paddingTop: "16px" }}>
						<div
							style={{
								fontSize: "10px",
								color: "#a5b4fc",
								letterSpacing: "0.1em",
								textTransform: "uppercase" as const,
								marginBottom: "8px",
							}}
						>
							Date
						</div>
						<div style={{ fontSize: "11px", color: "#c7d2fe" }}>{p.date}</div>
					</div>
				)}
				<div style={{ marginTop: "auto", width: "40px", height: "3px", background: "#7c3aed", borderRadius: "2px" }} />
			</div>
			{/* Body */}
			<div style={{ padding: "36px 32px", color: "#1e293b" }}>
				<div
					style={{
						fontSize: "11px",
						fontWeight: 600,
						letterSpacing: "0.12em",
						textTransform: "uppercase" as const,
						color: "#7c3aed",
						marginBottom: "16px",
					}}
				>
					Cover Letter
				</div>
				{p.recipientBlock && (
					<div style={{ marginBottom: "16px" }}>
						{p.recipientBlock.split("\n").map((line, i) => (
							<div
								key={i}
								style={{
									fontSize: "12px",
									color: i === p.recipientBlock.split("\n").length - 1 ? "#7c3aed" : "#64748b",
									fontWeight: i === p.recipientBlock.split("\n").length - 1 ? 600 : 400,
									lineHeight: "1.6",
								}}
							>
								{line}
							</div>
						))}
					</div>
				)}
				{p.salutation && <div style={{ fontSize: "14px", marginBottom: "16px", color: "#1e293b" }}>{p.salutation}</div>}
				<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
					{p.bodyParagraphs.map((para, i) => (
						<p key={i} style={{ margin: 0, fontSize: "14px", lineHeight: "1.8", color: "#334155" }}>
							{para}
						</p>
					))}
				</div>
				<div style={{ marginTop: "28px" }}>
					<div style={{ fontSize: "13px", color: "#334155", marginBottom: "12px" }}>{p.signoff || "Warm regards,"}</div>
					<div style={{ fontSize: "14px", fontWeight: 700, color: "#1e1b4b" }}>{p.signeeName || letter.yourName}</div>
					{p.signeeTitle && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{p.signeeTitle}</div>}
					{p.signeeLinkedIn && (
						<div style={{ fontSize: "11px", marginTop: "2px" }}>
							<a
								href={p.signeeLinkedIn.startsWith("http") ? p.signeeLinkedIn : `https://${p.signeeLinkedIn}`}
								target="_blank"
								rel="noreferrer"
								style={{ color: "#7c3aed", textDecoration: "none" }}
							>
								{p.signeeLinkedIn}
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ── Minimal ──────────────────────────────────────────────────────────────────

function MinimalTemplate({ letter }: { letter: CoverLetter }) {
	const p = parseLetter(letter.content);
	return (
		<div
			style={{
				background: "#ffffff",
				borderRadius: "12px",
				border: "1px solid #e2e8f0",
				padding: "48px 52px",
				fontFamily: "'Inter', system-ui, sans-serif",
				color: "#0f172a",
			}}
		>
			{/* Header */}
			<div style={{ marginBottom: "32px" }}>
				<div style={{ fontSize: "24px", fontWeight: 600, color: "#0f172a", letterSpacing: "-0.5px" }}>
					{p.name || letter.yourName}
				</div>
				{p.titleLine && (
					<div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
						<div style={{ width: "32px", height: "2px", background: "#065f46", borderRadius: "1px", flexShrink: 0 }} />
						<span style={{ fontSize: "12px", color: "#334155" }}>{p.titleLine}</span>
					</div>
				)}
				{p.contactLine && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>{p.contactLine}</div>}
			</div>
			{/* Date + Recipient */}
			{p.date && (
				<div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic", marginBottom: "12px" }}>{p.date}</div>
			)}
			{p.recipientBlock && (
				<div style={{ marginBottom: "20px" }}>
					{p.recipientBlock.split("\n").map((line, i) => (
						<div
							key={i}
							style={{
								fontSize: "13px",
								color: i === p.recipientBlock.split("\n").length - 1 ? "#065f46" : "#64748b",
								fontWeight: i === p.recipientBlock.split("\n").length - 1 ? 600 : 400,
								lineHeight: "1.6",
							}}
						>
							{line}
						</div>
					))}
				</div>
			)}
			{p.salutation && <div style={{ fontSize: "14px", marginBottom: "20px", color: "#0f172a" }}>{p.salutation}</div>}
			{/* Body with left accent on first para */}
			<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				{p.bodyParagraphs.map((para, i) => (
					<div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
						{i === 0 && (
							<div
								style={{
									width: "3px",
									background: "#065f46",
									borderRadius: "2px",
									alignSelf: "stretch",
									flexShrink: 0,
								}}
							/>
						)}
						<p style={{ margin: 0, fontSize: "14px", lineHeight: "1.9", color: "#334155", flex: 1 }}>{para}</p>
					</div>
				))}
			</div>
			{/* Sign-off */}
			<div style={{ marginTop: "36px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
				<div style={{ fontSize: "13px", color: "#334155", marginBottom: "12px" }}>{p.signoff || "Warm regards,"}</div>
				<div style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>{p.signeeName || letter.yourName}</div>
				{p.signeeTitle && <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{p.signeeTitle}</div>}
				{p.signeeLinkedIn && (
					<div style={{ fontSize: "12px", marginTop: "2px" }}>
						<a
							href={p.signeeLinkedIn.startsWith("http") ? p.signeeLinkedIn : `https://${p.signeeLinkedIn}`}
							target="_blank"
							rel="noreferrer"
							style={{ color: "#065f46", textDecoration: "none" }}
						>
							{p.signeeLinkedIn}
						</a>
					</div>
				)}
			</div>
		</div>
	);
}

// ── Executive ────────────────────────────────────────────────────────────────

function ExecutiveTemplate({ letter }: { letter: CoverLetter }) {
	const p = parseLetter(letter.content);
	const Divider = () => (
		<div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
			<div style={{ flex: 1, height: "1px", background: "#d6c9a8" }} />
			<div style={{ width: "6px", height: "6px", background: "#78350f", borderRadius: "50%", flexShrink: 0 }} />
			<div style={{ flex: 1, height: "1px", background: "#d6c9a8" }} />
		</div>
	);
	return (
		<div
			style={{
				background: "#fffdf8",
				borderRadius: "12px",
				border: "1px solid #e7e0d0",
				padding: "52px 56px",
				fontFamily: "Georgia, 'Times New Roman', serif",
				color: "#1c1917",
			}}
		>
			{/* Centered header */}
			<div style={{ textAlign: "center", marginBottom: "8px" }}>
				<div style={{ borderTop: "2px solid #78350f", borderBottom: "2px solid #78350f", padding: "12px 0" }}>
					<div style={{ fontSize: "20px", fontWeight: 700, color: "#1c1917", letterSpacing: "0.05em" }}>
						{(p.name || letter.yourName).toUpperCase()}
					</div>
					{p.titleLine && (
						<div
							style={{
								fontSize: "11px",
								color: "#92400e",
								letterSpacing: "0.12em",
								marginTop: "4px",
								fontFamily: "system-ui, sans-serif",
								textTransform: "uppercase" as const,
							}}
						>
							{p.titleLine}
						</div>
					)}
				</div>
				{p.contactLine && (
					<div style={{ fontSize: "12px", color: "#a16207", marginTop: "10px", fontFamily: "system-ui, sans-serif" }}>
						{p.contactLine}
					</div>
				)}
				{p.date && (
					<div
						style={{
							fontSize: "12px",
							color: "#a16207",
							marginTop: "6px",
							fontFamily: "system-ui, sans-serif",
							fontStyle: "italic",
						}}
					>
						{p.date}
					</div>
				)}
			</div>
			<Divider />
			{/* Recipient */}
			{p.recipientBlock && (
				<div style={{ marginBottom: "20px", fontFamily: "system-ui, sans-serif" }}>
					{p.recipientBlock.split("\n").map((line, i) => (
						<div
							key={i}
							style={{
								fontSize: "13px",
								color: i === p.recipientBlock.split("\n").length - 1 ? "#78350f" : "#44403c",
								fontWeight: i === p.recipientBlock.split("\n").length - 1 ? 600 : 400,
								lineHeight: "1.6",
							}}
						>
							{line}
						</div>
					))}
				</div>
			)}
			{p.salutation && <div style={{ fontSize: "14.5px", marginBottom: "20px" }}>{p.salutation}</div>}
			{/* Body */}
			<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				{p.bodyParagraphs.map((para, i) => (
					<p
						key={i}
						style={{
							margin: 0,
							fontSize: "14.5px",
							lineHeight: "1.9",
							color: "#292524",
							textAlign: "justify" as const,
						}}
					>
						{para}
					</p>
				))}
			</div>
			<Divider />
			{/* Sign-off */}
			<div>
				<div style={{ fontSize: "14px", marginBottom: "16px", color: "#292524" }}>{p.signoff || "Warm regards,"}</div>
				<div style={{ fontSize: "15px", fontWeight: 700, color: "#1c1917" }}>{p.signeeName || letter.yourName}</div>
				{p.signeeTitle && (
					<div style={{ fontSize: "12px", color: "#92400e", fontFamily: "system-ui, sans-serif", marginTop: "2px" }}>
						{p.signeeTitle}
					</div>
				)}
				{p.signeeLinkedIn && (
					<div style={{ fontSize: "12px", fontFamily: "system-ui, sans-serif", marginTop: "2px" }}>
						<a
							href={p.signeeLinkedIn.startsWith("http") ? p.signeeLinkedIn : `https://${p.signeeLinkedIn}`}
							target="_blank"
							rel="noreferrer"
							style={{ color: "#78350f", textDecoration: "none" }}
						>
							{p.signeeLinkedIn}
						</a>
					</div>
				)}
			</div>
		</div>
	);
}

function RenderedLetter({ letter }: { letter: CoverLetter }) {
	switch (letter.template) {
		case "Modern":
			return <ModernTemplate letter={letter} />;
		case "Minimal":
			return <MinimalTemplate letter={letter} />;
		case "Executive":
			return <ExecutiveTemplate letter={letter} />;
		default:
			return <ClassicTemplate letter={letter} />;
	}
}

// ─── Download helpers ─────────────────────────────────────────────────────────

async function downloadAsDOCX(letter: CoverLetter) {
	const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = await import("docx");
	const p = parseLetter(letter.content);

	const children = [
		// Name
		new Paragraph({
			children: [new TextRun({ text: p.name || letter.yourName, bold: true, size: 36, color: "1e3a5f" })],
			spacing: { after: 60 },
		}),
		// Title line
		...(p.titleLine
			? [
					new Paragraph({
						children: [new TextRun({ text: p.titleLine, size: 22, color: "334155" })],
						spacing: { after: 60 },
					}),
				]
			: []),
		// Contact line
		...(p.contactLine
			? [
					new Paragraph({
						children: [new TextRun({ text: p.contactLine, size: 20, color: "64748b" })],
						spacing: { after: 200 },
						border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1e3a5f", space: 8 } },
					}),
				]
			: []),
		// Date
		...(p.date
			? [
					new Paragraph({
						children: [new TextRun({ text: p.date, size: 20, color: "64748b", italics: true })],
						spacing: { after: 160 },
					}),
				]
			: []),
		// Recipient block
		...(p.recipientBlock
			? p.recipientBlock.split("\n").map(
					(line, i, arr) =>
						new Paragraph({
							children: [new TextRun({ text: line, size: 22, color: "334155", bold: i === arr.length - 1 })],
							spacing: { after: i === arr.length - 1 ? 200 : 40 },
						}),
				)
			: []),
		// Salutation
		...(p.salutation
			? [
					new Paragraph({
						children: [new TextRun({ text: p.salutation, size: 24 })],
						spacing: { after: 200 },
					}),
				]
			: []),
		// Body paragraphs
		...p.bodyParagraphs.map(
			(para) =>
				new Paragraph({
					children: [new TextRun({ text: para, size: 24 })],
					spacing: { after: 200 },
					alignment: AlignmentType.JUSTIFIED,
				}),
		),
		// Sign-off
		new Paragraph({
			children: [new TextRun({ text: p.signoff || "Warm regards,", size: 24 })],
			spacing: { before: 320, after: 160 },
		}),
		new Paragraph({
			children: [new TextRun({ text: p.signeeName || letter.yourName, bold: true, size: 26, color: "1e3a5f" })],
			spacing: { after: 60 },
		}),
		...(p.signeeTitle
			? [
					new Paragraph({
						children: [new TextRun({ text: p.signeeTitle, size: 22, color: "64748b" })],
						spacing: { after: 60 },
					}),
				]
			: []),
		...(p.signeeLinkedIn
			? [
					new Paragraph({
						children: [new TextRun({ text: p.signeeLinkedIn, size: 20, color: "3b82f6" })],
					}),
				]
			: []),
	];

	const doc = new Document({
		sections: [
			{
				properties: {
					page: {
						size: { width: 12240, height: 15840 },
						margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
					},
				},
				children,
			},
		],
	});

	const buffer = await Packer.toBuffer(doc);
	const blob = new Blob([new Uint8Array(buffer)], {
		type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${letter.title.replace(/[^a-z0-9]/gi, "_")}.docx`;
	a.click();
	URL.revokeObjectURL(url);
}

async function downloadAsPDF(letter: CoverLetter) {
	const iframe = document.createElement("iframe");
	iframe.style.position = "fixed";
	iframe.style.top = "-9999px";
	iframe.style.left = "-9999px";
	iframe.style.width = "794px";
	iframe.style.height = "1123px";
	document.body.appendChild(iframe);

	const doc = iframe.contentDocument;
	if (!doc) return;
	const templateHTML = getTemplateHTML(letter);

	doc.open();
	doc.write(
		`<!DOCTYPE html><html><head><meta charset="utf-8" /><style>* { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; } body { width: 794px; } @page { size: A4; margin: 0; } @media print { body { width: 794px; } }</style></head><body>${templateHTML}</body></html>`,
	);
	doc.close();

	await new Promise((r) => setTimeout(r, 500));
	iframe.contentWindow?.focus();
	iframe.contentWindow?.print();
	setTimeout(() => document.body.removeChild(iframe), 2000);
}

function getTemplateHTML(letter: CoverLetter): string {
	const p = parseLetter(letter.content);

	const recipientHTML = p.recipientBlock
		? p.recipientBlock
				.split("\n")
				.map(
					(line, i, arr) =>
						`<div style="font-size:13px;color:${i === arr.length - 1 ? "#1e3a5f" : "#334155"};font-weight:${i === arr.length - 1 ? 600 : 400};line-height:1.6;">${line}</div>`,
				)
				.join("")
		: "";

	const bodyHTML = p.bodyParagraphs
		.map((para) => `<p style="margin:0 0 18px 0;font-size:14px;line-height:1.85;color:#334155;">${para}</p>`)
		.join("");

	const signoffHTML = `
    <div style="margin-top:32px;">
      <div style="font-size:14px;color:#2d3748;margin-bottom:14px;">${p.signoff || "Warm regards,"}</div>
      <div style="font-size:15px;font-weight:700;color:#1e3a5f;">${p.signeeName || letter.yourName}</div>
      ${p.signeeTitle ? `<div style="font-size:12px;color:#64748b;margin-top:2px;">${p.signeeTitle}</div>` : ""}
      ${p.signeeLinkedIn ? `<div style="font-size:11px;margin-top:2px;"><a href="${p.signeeLinkedIn.startsWith("http") ? p.signeeLinkedIn : `https://${p.signeeLinkedIn}`}" style="color:#3b82f6;text-decoration:none;">${p.signeeLinkedIn}</a></div>` : ""}
    </div>`;

	if (letter.template === "Modern") {
		const contactItems = p.contactLine
			? p.contactLine
					.split("|")
					.map((part) => `<div style="font-size:11px;color:#c7d2fe;line-height:1.6;">${part.trim()}</div>`)
					.join("")
			: "";
		return `
      <div style="display:flex;min-height:1123px;font-family:system-ui,sans-serif;">
        <div style="width:210px;background:#1e1b4b;padding:40px 22px;display:flex;flex-direction:column;gap:24px;flex-shrink:0;">
          <div>
            <div style="width:54px;height:54px;border-radius:50%;background:#7c3aed;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;margin-bottom:12px;">${(p.name || letter.yourName).charAt(0).toUpperCase()}</div>
            <div style="font-size:14px;font-weight:600;color:#e2e8ff;line-height:1.3;">${p.name || letter.yourName}</div>
            ${p.titleLine ? `<div style="font-size:11px;color:#a5b4fc;margin-top:4px;line-height:1.4;">${p.titleLine}</div>` : ""}
          </div>
          ${p.contactLine ? `<div style="border-top:1px solid #3730a3;padding-top:16px;"><div style="font-size:10px;color:#a5b4fc;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Contact</div>${contactItems}</div>` : ""}
          <div style="border-top:1px solid #3730a3;padding-top:16px;">
            <div style="font-size:10px;color:#a5b4fc;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Applying for</div>
            <div style="font-size:12px;color:#c7d2fe;line-height:1.5;">${letter.role}</div>
            <div style="font-size:11px;color:#818cf8;margin-top:4px;">at ${letter.company}</div>
          </div>
          ${p.date ? `<div style="border-top:1px solid #3730a3;padding-top:16px;"><div style="font-size:10px;color:#a5b4fc;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Date</div><div style="font-size:11px;color:#c7d2fe;">${p.date}</div></div>` : ""}
        </div>
        <div style="flex:1;padding:40px 36px;background:#fff;">
          <div style="font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#7c3aed;margin-bottom:16px;">Cover Letter</div>
          ${recipientHTML ? `<div style="margin-bottom:16px;">${recipientHTML}</div>` : ""}
          ${p.salutation ? `<div style="font-size:14px;margin-bottom:16px;color:#1e293b;">${p.salutation}</div>` : ""}
          ${bodyHTML}
          <div style="margin-top:28px;">
            <div style="font-size:13px;color:#334155;margin-bottom:12px;">${p.signoff || "Warm regards,"}</div>
            <div style="font-size:14px;font-weight:700;color:#1e1b4b;">${p.signeeName || letter.yourName}</div>
            ${p.signeeTitle ? `<div style="font-size:12px;color:#64748b;margin-top:2px;">${p.signeeTitle}</div>` : ""}
            ${p.signeeLinkedIn ? `<div style="font-size:11px;margin-top:2px;"><a href="${p.signeeLinkedIn.startsWith("http") ? p.signeeLinkedIn : `https://${p.signeeLinkedIn}`}" style="color:#7c3aed;text-decoration:none;">${p.signeeLinkedIn}</a></div>` : ""}
          </div>
        </div>
      </div>`;
	}

	if (letter.template === "Minimal") {
		const [firstPara, ...restParas] = p.bodyParagraphs;
		return `
      <div style="padding:60px 64px;font-family:'Inter',system-ui,sans-serif;background:#fff;min-height:1123px;">
        <div style="margin-bottom:32px;">
          <div style="font-size:26px;font-weight:600;color:#0f172a;letter-spacing:-0.5px;">${p.name || letter.yourName}</div>
          ${p.titleLine ? `<div style="display:flex;align-items:center;gap:10px;margin-top:8px;"><div style="width:32px;height:2px;background:#065f46;border-radius:1px;flex-shrink:0;"></div><span style="font-size:12px;color:#334155;">${p.titleLine}</span></div>` : ""}
          ${p.contactLine ? `<div style="font-size:12px;color:#64748b;margin-top:6px;">${p.contactLine}</div>` : ""}
        </div>
        ${p.date ? `<div style="font-size:12px;color:#94a3b8;font-style:italic;margin-bottom:12px;">${p.date}</div>` : ""}
        ${p.recipientBlock ? `<div style="margin-bottom:20px;">${recipientHTML}</div>` : ""}
        ${p.salutation ? `<div style="font-size:14px;margin-bottom:20px;color:#0f172a;">${p.salutation}</div>` : ""}
        ${firstPara ? `<div style="display:flex;gap:18px;margin-bottom:20px;"><div style="width:3px;background:#065f46;border-radius:2px;flex-shrink:0;"></div><p style="margin:0;font-size:14px;line-height:1.9;color:#334155;">${firstPara}</p></div>` : ""}
        ${restParas.map((para) => `<p style="margin:0 0 20px 0;font-size:14px;line-height:1.9;color:#334155;">${para}</p>`).join("")}
        <div style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:18px;">
          <div style="font-size:13px;color:#334155;margin-bottom:12px;">${p.signoff || "Warm regards,"}</div>
          <div style="font-size:15px;font-weight:600;color:#0f172a;">${p.signeeName || letter.yourName}</div>
          ${p.signeeTitle ? `<div style="font-size:12px;color:#64748b;margin-top:2px;">${p.signeeTitle}</div>` : ""}
          ${p.signeeLinkedIn ? `<div style="font-size:12px;margin-top:2px;"><a href="${p.signeeLinkedIn.startsWith("http") ? p.signeeLinkedIn : `https://${p.signeeLinkedIn}`}" style="color:#065f46;text-decoration:none;">${p.signeeLinkedIn}</a></div>` : ""}
        </div>
      </div>`;
	}

	if (letter.template === "Executive") {
		const divider = `<div style="display:flex;align-items:center;gap:12px;margin:24px 0;"><div style="flex:1;height:1px;background:#d6c9a8;"></div><div style="width:6px;height:6px;background:#78350f;border-radius:50%;flex-shrink:0;"></div><div style="flex:1;height:1px;background:#d6c9a8;"></div></div>`;
		return `
      <div style="padding:60px 64px;font-family:Georgia,'Times New Roman',serif;background:#fffdf8;min-height:1123px;">
        <div style="text-align:center;margin-bottom:8px;">
          <div style="border-top:2px solid #78350f;border-bottom:2px solid #78350f;padding:14px 0;">
            <div style="font-size:22px;font-weight:700;color:#1c1917;letter-spacing:0.05em;">${(p.name || letter.yourName).toUpperCase()}</div>
            ${p.titleLine ? `<div style="font-size:11px;color:#92400e;letter-spacing:0.12em;margin-top:4px;font-family:system-ui,sans-serif;text-transform:uppercase;">${p.titleLine}</div>` : ""}
          </div>
          ${p.contactLine ? `<div style="font-size:12px;color:#a16207;margin-top:10px;font-family:system-ui,sans-serif;">${p.contactLine}</div>` : ""}
          ${p.date ? `<div style="font-size:12px;color:#a16207;margin-top:6px;font-family:system-ui,sans-serif;font-style:italic;">${p.date}</div>` : ""}
        </div>
        ${divider}
        ${
					p.recipientBlock
						? `<div style="margin-bottom:20px;font-family:system-ui,sans-serif;">${p.recipientBlock
								.split("\n")
								.map(
									(line, i, arr) =>
										`<div style="font-size:13px;color:${i === arr.length - 1 ? "#78350f" : "#44403c"};font-weight:${i === arr.length - 1 ? 600 : 400};line-height:1.6;">${line}</div>`,
								)
								.join("")}</div>`
						: ""
				}
        ${p.salutation ? `<div style="font-size:14.5px;margin-bottom:20px;">${p.salutation}</div>` : ""}
        ${p.bodyParagraphs.map((para) => `<p style="margin:0 0 20px 0;font-size:14.5px;line-height:1.9;color:#292524;text-align:justify;">${para}</p>`).join("")}
        ${divider}
        <div style="font-size:14px;margin-bottom:14px;color:#292524;">${p.signoff || "Warm regards,"}</div>
        <div style="font-size:15px;font-weight:700;color:#1c1917;">${p.signeeName || letter.yourName}</div>
        ${p.signeeTitle ? `<div style="font-size:12px;color:#92400e;font-family:system-ui,sans-serif;margin-top:2px;">${p.signeeTitle}</div>` : ""}
        ${p.signeeLinkedIn ? `<div style="font-size:12px;font-family:system-ui,sans-serif;margin-top:2px;"><a href="${p.signeeLinkedIn.startsWith("http") ? p.signeeLinkedIn : `https://${p.signeeLinkedIn}`}" style="color:#78350f;text-decoration:none;">${p.signeeLinkedIn}</a></div>` : ""}
      </div>`;
	}

	// Classic (default)
	return `
    <div style="padding:56px 60px;font-family:Georgia,'Times New Roman',serif;background:#fff;min-height:1123px;">
      <div style="border-bottom:2px solid #1e3a5f;padding-bottom:22px;margin-bottom:24px;">
        <div style="font-size:24px;font-weight:700;color:#1e3a5f;letter-spacing:-0.3px;">${p.name || letter.yourName}</div>
        ${p.titleLine ? `<div style="font-size:13px;color:#334155;margin-top:3px;font-family:system-ui,sans-serif;">${p.titleLine}</div>` : ""}
        ${p.contactLine ? `<div style="font-size:12px;color:#64748b;margin-top:3px;font-family:system-ui,sans-serif;">${p.contactLine}</div>` : ""}
      </div>
      ${p.date ? `<div style="font-size:13px;color:#64748b;margin-bottom:18px;font-family:system-ui,sans-serif;font-style:italic;">${p.date}</div>` : ""}
      ${p.recipientBlock ? `<div style="margin-bottom:20px;font-family:system-ui,sans-serif;">${recipientHTML}</div>` : ""}
      ${p.salutation ? `<div style="font-size:14.5px;margin-bottom:20px;">${p.salutation}</div>` : ""}
      ${bodyHTML}
      ${signoffHTML}
    </div>`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function CoverLettersPage() {
	const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [step, setStep] = useState<Step>("pick-template");
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [creationMode, setCreationMode] = useState<CreationMode>("manual");
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>("Classic");
	const [copied, setCopied] = useState(false);
	const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
	const [downloadingDocx, setDownloadingDocx] = useState(false);
	const [downloadingPdf, setDownloadingPdf] = useState(false);

	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState("");
	const [editTitle, setEditTitle] = useState("");
	const [isSavingEdit, setIsSavingEdit] = useState(false);

	// Manual form — now includes phone, location, linkedin, availability, noticePeriod
	const [form, setForm] = useState({
		title: "",
		yourName: "",
		yourEmail: "",
		yourPhone: "",
		yourLocation: "",
		yourLinkedIn: "",
		yourTitle: "",
		techStack: "",
		company: "",
		role: "",
		currentEmployer: "",
		experience: "",
		projectTypes: "",
		whyCompany: "",
		differentiatorsLeadership: "",
		currentlyLearning: "",
		noticePeriod: "",
		availability: "",
	});

	const [resumeForm, setResumeForm] = useState({
		title: "",
		company: "",
		role: "",
		yourName: "",
		extraNotes: "",
	});
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [resumeText, setResumeText] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generateError, setGenerateError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// ── Load ──────────────────────────────────────────────────────────────────
	useEffect(() => {
		client.coverLetter
			.list()
			.then((letters) => {
				const normalized = (letters as unknown[]).map((l: unknown) => {
					const letter = l as Record<string, unknown>;
					return {
						...letter,
						createdAt:
							letter.createdAt instanceof Date ? letter.createdAt.toLocaleDateString() : String(letter.createdAt ?? ""),
					} as CoverLetter;
				});
				setCoverLetters(normalized);
			})
			.catch((err) => console.error("Failed to load cover letters:", err))
			.finally(() => setIsLoading(false));
	}, []);

	// ── Helpers ───────────────────────────────────────────────────────────────
	function handleCreate() {
		setForm({
			title: "",
			yourName: "",
			yourEmail: "",
			yourPhone: "",
			yourLocation: "",
			yourLinkedIn: "",
			yourTitle: "",
			techStack: "",
			company: "",
			role: "",
			currentEmployer: "",
			experience: "",
			projectTypes: "",
			whyCompany: "",
			differentiatorsLeadership: "",
			currentlyLearning: "",
			noticePeriod: "",
			availability: "",
		});
		setResumeForm({ title: "", company: "", role: "", yourName: "", extraNotes: "" });
		setResumeFile(null);
		setResumeText("");
		setGenerateError(null);
		setSelectedTemplate("Classic");
		setStep("pick-template");
		setIsCreating(true);
		setEditingId(null);
		setIsEditing(false);
	}

	async function handleDelete(id: string) {
		setDeleteLoadingId(id);
		try {
			await client.coverLetter.delete({ id });
			setCoverLetters((prev) => prev.filter((l) => l.id !== id));
			if (editingId === id) setEditingId(null);
		} catch (err) {
			console.error("Failed to delete:", err);
		} finally {
			setDeleteLoadingId(null);
		}
	}

	function handleCopy(content: string) {
		navigator.clipboard.writeText(content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	function handleStartEdit(letter: CoverLetter) {
		setEditContent(letter.content);
		setEditTitle(letter.title);
		setIsEditing(true);
	}

	function handleCancelEdit() {
		setIsEditing(false);
		setEditContent("");
		setEditTitle("");
	}

	async function handleSaveEdit() {
		if (!editingId) return;
		setIsSavingEdit(true);
		try {
			await client.coverLetter.update({ id: editingId, title: editTitle, content: editContent });
			setCoverLetters((prev) =>
				prev.map((l) => (l.id === editingId ? { ...l, title: editTitle, content: editContent } : l)),
			);
			setIsEditing(false);
		} catch (err) {
			console.error("Failed to save edit:", err);
		} finally {
			setIsSavingEdit(false);
		}
	}

	async function saveLetter(newLetter: CoverLetter) {
		try {
			await client.coverLetter.save({
				id: newLetter.id,
				title: newLetter.title,
				company: newLetter.company,
				role: newLetter.role,
				yourName: newLetter.yourName,
				content: newLetter.content,
				template: newLetter.template,
			});
			setCoverLetters((prev) => [newLetter, ...prev]);
			setIsCreating(false);
		} catch {
			setGenerateError("Generated but failed to save. Please try again.");
		}
	}

	// ── Manual generate ───────────────────────────────────────────────────────
	function handleManualGenerate() {
		const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

		const contactParts = [form.yourEmail, form.yourPhone, form.yourLocation, form.yourLinkedIn].filter(Boolean);
		const headerBlock = [
			form.yourName,
			[form.yourTitle, form.techStack].filter(Boolean).join(" | "),
			contactParts.join(" | "),
			today,
		]
			.filter(Boolean)
			.join("\n");

		const recipientBlock = ["Hiring Manager", form.company, `Re: ${form.role} — Application`].join("\n");

		const para1 = `I am a${form.yourTitle ? ` ${form.yourTitle}` : " professional"}${form.yourLocation ? ` based in ${form.yourLocation}` : ""}${form.experience ? ` with ${form.experience} of experience` : ""}. I am actively seeking a ${form.role} role, and ${form.company} immediately caught my attention${form.whyCompany ? ` because ${form.whyCompany}` : ""}. I believe my background maps closely to what you are looking for.`;

		const para2 = `${form.currentEmployer ? `In my current role at ${form.currentEmployer}, I ` : "I "}work with a core stack of ${form.techStack || "modern web technologies"}${form.projectTypes ? `, building ${form.projectTypes}` : ""}. I handle end-to-end delivery — from requirement gathering and architecture design through deployment and post-release support.`;

		const para3Lines = [
			form.differentiatorsLeadership ||
				"What sets me apart is the combination of technical depth and client-facing experience.",
			form.currentlyLearning
				? `I am currently expanding my skills in ${form.currentlyLearning} to complement my existing expertise.`
				: "",
			"I thrive in collaborative, Agile environments and take ownership of both quality and delivery.",
		].filter(Boolean);
		const para3 = para3Lines.join(" ");

		const para4 = `I am available for interviews at your convenience${form.availability ? ` — ${form.availability}` : ""}${form.noticePeriod ? `, and can join within ${form.noticePeriod}` : ""}. I would welcome the opportunity to discuss how my experience can contribute to your team. Please find my resume attached. Thank you for your time and consideration.`;

		const signoff = "Warm regards,";
		const signeeBlock = [form.yourName, form.yourTitle, form.yourLinkedIn].filter(Boolean).join("\n");

		const content = [
			headerBlock,
			"",
			recipientBlock,
			"",
			"Dear Hiring Manager,",
			"",
			para1,
			"",
			para2,
			"",
			para3,
			"",
			para4,
			"",
			signoff,
			"",
			signeeBlock,
		].join("\n");

		void saveLetter({
			id: crypto.randomUUID(),
			title: form.title || `Cover Letter – ${form.company}`,
			company: form.company,
			role: form.role,
			yourName: form.yourName,
			content,
			createdAt: new Date().toLocaleDateString(),
			template: selectedTemplate,
		});
	}

	// ── File reading ──────────────────────────────────────────────────────────
	async function handleResumeFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setResumeFile(file);
		setGenerateError(null);
		setResumeText("");
		try {
			const text = await extractTextFromFile(file);
			if (!text.trim()) throw new Error("Could not extract text. Try saving as .txt instead.");
			setResumeText(text);
		} catch (err) {
			setGenerateError(err instanceof Error ? err.message : "Failed to read file.");
			setResumeFile(null);
		}
	}

	async function extractTextFromFile(file: File): Promise<string> {
		const ext = file.name.split(".").pop()?.toLowerCase();
		if (ext === "txt" || ext === "md") {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (e) => resolve((e.target?.result as string) ?? "");
				reader.onerror = () => reject(new Error("Failed to read file"));
				reader.readAsText(file);
			});
		}
		if (ext === "pdf") {
			const arrayBuffer = await file.arrayBuffer();
			const pdfjsLib = await import("pdfjs-dist");
			pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
				"pdfjs-dist/build/pdf.worker.min.mjs",
				import.meta.url,
			).toString();
			const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
			const pages: string[] = [];
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();
				pages.push(
					content.items
						.map((item: unknown) => ("str" in (item as object) ? (item as { str: string }).str : ""))
						.join(" "),
				);
			}
			return pages.join("\n\n");
		}
		if (ext === "docx" || ext === "doc") {
			const arrayBuffer = await file.arrayBuffer();
			const mammoth = await import("mammoth");
			const result = await mammoth.extractRawText({ arrayBuffer });
			return result.value;
		}
		throw new Error(`Unsupported file type: .${ext}. Use .pdf, .docx, or .txt`);
	}

	// ── AI generate ───────────────────────────────────────────────────────────
	async function handleGenerateFromResume() {
		if (!resumeText || !resumeForm.company || !resumeForm.role || !resumeForm.yourName) return;
		setIsGenerating(true);
		setGenerateError(null);
		try {
			const prompt = `CANDIDATE NAME (use exactly this in the header and sign-off): ${resumeForm.yourName}

Target Company: ${resumeForm.company}
Target Role: ${resumeForm.role}
Template Style: ${selectedTemplate}
${resumeForm.extraNotes ? `Additional instructions: ${resumeForm.extraNotes}` : ""}

Resume Content:
${resumeText}`;

			const { content } = await client.coverLetter.generate({ prompt, template: selectedTemplate });
			if (!content) throw new Error("Empty response");
			await saveLetter({
				id: crypto.randomUUID(),
				title: resumeForm.title || `Cover Letter – ${resumeForm.company}`,
				company: resumeForm.company,
				role: resumeForm.role,
				yourName: resumeForm.yourName,
				content: content.trim(),
				createdAt: new Date().toLocaleDateString(),
				template: selectedTemplate,
			});
		} catch (err) {
			setGenerateError(err instanceof Error ? err.message : "Failed to generate. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	}

	const editing = coverLetters.find((l) => l.id === editingId);
	const selectedTemplateMeta = TEMPLATES.find((t) => t.id === selectedTemplate);

	// ── Field groups for manual form ──────────────────────────────────────────
	const personalFields = [
		{ key: "yourName", label: "Full Name *", placeholder: "Alex Rivera" },
		{ key: "yourTitle", label: "Your Title *", placeholder: "Senior Full Stack Developer" },
		{ key: "yourEmail", label: "Email", placeholder: "alex.rivera@gmail.com" },
		{ key: "yourPhone", label: "Phone", placeholder: "+91 98234 56710" },
		{ key: "yourLocation", label: "Location", placeholder: "Bangalore, India" },
		{ key: "yourLinkedIn", label: "LinkedIn URL", placeholder: "linkedin.com/in/alex-rivera-dev" },
	];

	const jobFields = [
		{ key: "company", label: "Target Company *", placeholder: "Stripe" },
		{ key: "role", label: "Target Role *", placeholder: "Senior Frontend Engineer" },
		{ key: "title", label: "Letter Title (optional)", placeholder: "Cover Letter – Stripe" },
	];

	const contentFields = [
		{ key: "techStack", label: "Tech Stack *", placeholder: "React, Next.js, Node.js, NestJS, PostgreSQL, AWS EC2/S3" },
		{ key: "currentEmployer", label: "Current / Last Employer", placeholder: "Infosys Ltd." },
		{ key: "experience", label: "Years of Experience", placeholder: "5+ years" },
		{
			key: "projectTypes",
			label: "Types of Projects",
			placeholder: "fintech dashboards, SaaS platforms, e-commerce, real-time chat apps",
		},
	];

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Cover Letters</h1>
					<p className="text-muted-foreground">Create and manage your professional cover letters.</p>
				</div>
				<button
					type="button"
					onClick={handleCreate}
					className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90"
				>
					<PlusIcon size={16} />
					<Trans>New Cover Letter</Trans>
				</button>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
				{/* Left — list */}
				<div className="space-y-3">
					{isLoading && (
						<div className="flex min-h-[20vh] items-center justify-center">
							<svg className="h-6 w-6 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
								<title>Loading</title>
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z"
								/>
							</svg>
						</div>
					)}

					{!isLoading &&
						coverLetters.map((letter) => {
							const meta = TEMPLATES.find((t) => t.id === letter.template);
							return (
								<button
									type="button"
									key={letter.id}
									onClick={() => {
										setEditingId(letter.id);
										setIsCreating(false);
										setIsEditing(false);
									}}
									className={`w-full cursor-pointer rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md ${editingId === letter.id ? "ring-2 ring-ring ring-offset-2" : ""}`}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0 space-y-1">
											<h3 className="truncate font-semibold">{letter.title}</h3>
											<p className="truncate text-muted-foreground text-sm">
												{letter.role} · {letter.company}
											</p>
											<div className="flex flex-wrap items-center gap-2">
												<p className="text-muted-foreground text-xs">{letter.createdAt}</p>
												{meta && (
													<span className={`rounded-full px-2 py-0.5 font-medium text-xs ${meta.tagStyle}`}>
														{meta.label}
													</span>
												)}
											</div>
										</div>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												void handleDelete(letter.id);
											}}
											disabled={deleteLoadingId === letter.id}
											className="flex-shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
										>
											{deleteLoadingId === letter.id ? (
												<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
													<title>Deleting</title>
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z"
													/>
												</svg>
											) : (
												<TrashIcon size={15} />
											)}
										</button>
									</div>
								</button>
							);
						})}
				</div>

				{/* Right — creator */}
				{isCreating && (
					<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
						{/* Step 1: Pick template */}
						{step === "pick-template" && (
							<div className="space-y-5 p-6">
								<div>
									<h2 className="font-semibold text-lg">Choose a template</h2>
									<p className="mt-0.5 text-muted-foreground text-sm">
										Each template has a distinct visual style and tone.
									</p>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									{TEMPLATES.map((t) => (
										<button
											key={t.id}
											type="button"
											onClick={() => {
												setSelectedTemplate(t.id);
												setStep("fill-form");
											}}
											className="group flex flex-col gap-3 rounded-xl border-2 border-transparent bg-background p-4 text-left transition-all hover:shadow-sm focus:outline-none"
											onMouseEnter={(e) => {
												(e.currentTarget as HTMLButtonElement).style.borderColor = `${t.color}40`;
											}}
											onMouseLeave={(e) => {
												(e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
											}}
										>
											<div
												className="w-full overflow-hidden rounded-lg"
												style={{ background: t.bg, border: `1px solid ${t.border}`, minHeight: "90px" }}
											>
												{t.id === "Classic" && (
													<div style={{ padding: "12px 14px" }}>
														<div
															style={{
																height: "7px",
																width: "55%",
																background: t.color,
																borderRadius: "3px",
																marginBottom: "4px",
																opacity: 0.9,
															}}
														/>
														<div
															style={{
																height: "4px",
																width: "35%",
																background: t.color,
																borderRadius: "2px",
																opacity: 0.35,
																marginBottom: "10px",
															}}
														/>
														<div
															style={{
																borderTop: `2px solid ${t.color}`,
																paddingTop: "8px",
																display: "flex",
																flexDirection: "column",
																gap: "4px",
															}}
														>
															{[1, 0.7, 0.9, 0.6].map((op, i) => (
																<div
																	key={i}
																	style={{
																		height: "4px",
																		width: `${[100, 85, 95, 60][i]}%`,
																		background: "#94a3b8",
																		borderRadius: "2px",
																		opacity: op * 0.5,
																	}}
																/>
															))}
														</div>
													</div>
												)}
												{t.id === "Modern" && (
													<div style={{ display: "grid", gridTemplateColumns: "40px 1fr", height: "90px" }}>
														<div
															style={{
																background: "#1e1b4b",
																display: "flex",
																flexDirection: "column",
																alignItems: "center",
																padding: "10px 0",
																gap: "6px",
															}}
														>
															<div
																style={{ width: "20px", height: "20px", borderRadius: "50%", background: t.color }}
															/>
															<div
																style={{ height: "3px", width: "20px", background: "#4338ca", borderRadius: "1px" }}
															/>
															<div
																style={{
																	height: "3px",
																	width: "14px",
																	background: "#4338ca",
																	borderRadius: "1px",
																	opacity: 0.6,
																}}
															/>
														</div>
														<div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
															<div
																style={{
																	height: "4px",
																	width: "40%",
																	background: t.color,
																	borderRadius: "2px",
																	opacity: 0.7,
																	marginBottom: "4px",
																}}
															/>
															{[100, 80, 95, 70].map((w, i) => (
																<div
																	key={i}
																	style={{
																		height: "3.5px",
																		width: `${w}%`,
																		background: "#94a3b8",
																		borderRadius: "2px",
																		opacity: 0.5,
																	}}
																/>
															))}
														</div>
													</div>
												)}
												{t.id === "Minimal" && (
													<div style={{ padding: "12px 14px" }}>
														<div
															style={{
																height: "7px",
																width: "45%",
																background: "#0f172a",
																borderRadius: "3px",
																marginBottom: "6px",
															}}
														/>
														<div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
															<div style={{ width: "24px", height: "2px", background: t.color, borderRadius: "1px" }} />
															<div
																style={{
																	height: "3px",
																	width: "30%",
																	background: "#94a3b8",
																	borderRadius: "2px",
																	opacity: 0.4,
																}}
															/>
														</div>
														<div style={{ display: "flex", gap: "6px" }}>
															<div
																style={{ width: "2px", background: t.color, borderRadius: "1px", alignSelf: "stretch" }}
															/>
															<div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
																{[100, 80, 90].map((w, i) => (
																	<div
																		key={i}
																		style={{
																			height: "4px",
																			width: `${w}%`,
																			background: "#94a3b8",
																			borderRadius: "2px",
																			opacity: 0.45,
																		}}
																	/>
																))}
															</div>
														</div>
													</div>
												)}
												{t.id === "Executive" && (
													<div style={{ padding: "12px 14px", textAlign: "center" as const }}>
														<div
															style={{
																borderTop: `1.5px solid ${t.color}`,
																borderBottom: `1.5px solid ${t.color}`,
																padding: "6px 0",
																marginBottom: "8px",
															}}
														>
															<div
																style={{
																	height: "6px",
																	width: "50%",
																	background: t.color,
																	borderRadius: "2px",
																	margin: "0 auto 3px",
																	opacity: 0.8,
																}}
															/>
															<div
																style={{
																	height: "3px",
																	width: "30%",
																	background: t.color,
																	borderRadius: "2px",
																	margin: "0 auto",
																	opacity: 0.4,
																}}
															/>
														</div>
														<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
															{[85, 100, 75, 90].map((w, i) => (
																<div
																	key={i}
																	style={{
																		height: "3.5px",
																		width: `${w}%`,
																		background: "#94a3b8",
																		borderRadius: "2px",
																		margin: "0 auto",
																		opacity: 0.45,
																	}}
																/>
															))}
														</div>
													</div>
												)}
											</div>
											<div className="flex items-center justify-between gap-2">
												<span className="font-semibold text-sm">{t.label}</span>
												<span className={`rounded-full px-2 py-0.5 font-medium text-xs ${t.tagStyle}`}>{t.tag}</span>
											</div>
											<p className="-mt-1 text-muted-foreground text-xs leading-relaxed">{t.desc}</p>
										</button>
									))}
								</div>
								<div className="flex justify-end">
									<button
										type="button"
										onClick={() => setIsCreating(false)}
										className="rounded-lg border px-5 py-2 font-medium text-sm transition-colors hover:bg-secondary"
									>
										<Trans>Cancel</Trans>
									</button>
								</div>
							</div>
						)}

						{/* Step 2: Fill form */}
						{step === "fill-form" && (
							<div className="space-y-5 p-6">
								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={() => setStep("pick-template")}
										className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
									>
										<ArrowLeftIcon size={16} />
									</button>
									<h2 className="font-semibold text-lg">New Cover Letter</h2>
									{selectedTemplateMeta && (
										<span
											className={`ml-auto rounded-full px-3 py-0.5 font-medium text-xs ${selectedTemplateMeta.tagStyle}`}
										>
											{selectedTemplateMeta.label}
										</span>
									)}
								</div>

								{/* Mode tabs */}
								<div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
									{(["manual", "resume"] as CreationMode[]).map((mode) => (
										<button
											key={mode}
											type="button"
											onClick={() => setCreationMode(mode)}
											className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 font-medium text-sm transition-all ${creationMode === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
										>
											{mode === "manual" ? <NotePencilIcon size={15} /> : <SparkleIcon size={15} />}
											{mode === "manual" ? <Trans>Fill Manually</Trans> : <Trans>From Resume (AI)</Trans>}
										</button>
									))}
								</div>

								{/* ── Manual form ── */}
								{creationMode === "manual" && (
									<div className="space-y-5">
										{/* Personal info */}
										<div>
											<p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
												Your Info
											</p>
											<div className="grid gap-3 sm:grid-cols-2">
												{personalFields.map(({ key, label, placeholder }) => (
													<div key={key} className="space-y-1">
														<label htmlFor={key} className="font-medium text-sm">
															{label}
														</label>

														<input
															id={key}
															type="text"
															placeholder={placeholder}
															value={form[key as keyof typeof form]}
															onChange={(e) =>
																setForm((p) => ({
																	...p,
																	[key]: e.target.value,
																}))
															}
															className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
														/>
													</div>
												))}
											</div>
										</div>

										{/* Job info */}
										<div>
											<p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
												Job Details
											</p>
											<div className="grid gap-3 sm:grid-cols-2">
												{jobFields.map(({ key, label, placeholder }) => (
													<div key={key} className="space-y-1">
														<label htmlFor={`job-${key}`} className="font-medium text-sm">
															{label}
														</label>
														<input
															id={`job-${key}`}
															type="text"
															placeholder={placeholder}
															value={form[key as keyof typeof form]}
															onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
															className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
														/>
													</div>
												))}
											</div>
										</div>

										{/* Content fields */}
										<div>
											<p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
												Background
											</p>
											<div className="grid gap-3 sm:grid-cols-2">
												{contentFields.map(({ key, label, placeholder }) => (
													<div key={key} className="space-y-1">
														<label htmlFor={`content-${key}`} className="font-medium text-sm">
															{label}
														</label>
														<input
															id={`content-${key}`}
															type="text"
															placeholder={placeholder}
															value={form[key as keyof typeof form]}
															onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
															className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
														/>
													</div>
												))}
											</div>
										</div>

										{/* Textarea fields */}
										<div className="space-y-3">
											<div className="space-y-1">
												<label htmlFor="whyCompany" className="font-medium text-sm">
													Why this company?
												</label>
												<textarea
													id="whyCompany"
													rows={2}
													placeholder="their focus on building scalable payment infrastructure and developer-first products"
													value={form.whyCompany}
													onChange={(e) => setForm((p) => ({ ...p, whyCompany: e.target.value }))}
													className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
												/>
											</div>
											<div className="space-y-1">
												<label htmlFor="differentiatorsLeadership" className="font-medium text-sm">
													Leadership / differentiators
												</label>
												<textarea
													id="differentiatorsLeadership"
													rows={2}
													placeholder="Led a team of 4 engineers, mentored 2 junior devs, managed client communication across US and EU time zones"
													value={form.differentiatorsLeadership}
													onChange={(e) => setForm((p) => ({ ...p, differentiatorsLeadership: e.target.value }))}
													className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
												/>
											</div>
											<div className="grid gap-3 sm:grid-cols-2">
												<div className="space-y-1">
													<label htmlFor="currentlyLearning" className="font-medium text-sm">
														Currently learning
													</label>
													<input
														id="currentlyLearning"
														type="text"
														placeholder="Rust, system design at scale"
														value={form.currentlyLearning}
														onChange={(e) => setForm((p) => ({ ...p, currentlyLearning: e.target.value }))}
														className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
													/>
												</div>
												<div className="space-y-1">
													<label htmlFor="noticePeriod" className="font-medium text-sm">
														Notice period / availability
													</label>
													<input
														id="noticePeriod"
														type="text"
														placeholder="30 days"
														value={form.noticePeriod}
														onChange={(e) => setForm((p) => ({ ...p, noticePeriod: e.target.value }))}
														className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
													/>
												</div>
											</div>
											<div className="space-y-1">
												<label htmlFor="availability" className="font-medium text-sm">
													Interview availability
												</label>
												<input
													id="availability"
													type="text"
													placeholder="available for video calls across IST / EST / GMT"
													value={form.availability}
													onChange={(e) => setForm((p) => ({ ...p, availability: e.target.value }))}
													className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
												/>
											</div>
										</div>

										<div className="flex gap-3">
											<button
												type="button"
												onClick={handleManualGenerate}
												disabled={!form.yourName || !form.company || !form.role || !form.yourTitle || !form.techStack}
												className="rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
											>
												<Trans>Generate Cover Letter</Trans>
											</button>
											<button
												type="button"
												onClick={() => setIsCreating(false)}
												className="rounded-lg border px-5 py-2 font-medium text-sm transition-colors hover:bg-secondary"
											>
												<Trans>Cancel</Trans>
											</button>
										</div>
									</div>
								)}

								{/* ── Resume / AI form ── */}
								{creationMode === "resume" && (
									<div className="space-y-4">
										<div className="grid gap-4 sm:grid-cols-2">
											{[
												{ key: "yourName", label: "Your Name *", placeholder: "Alex Rivera" },
												{ key: "company", label: "Target Company *", placeholder: "Stripe" },
												{ key: "role", label: "Target Role *", placeholder: "Senior Frontend Engineer" },
												{ key: "title", label: "Letter Title (optional)", placeholder: "Cover Letter – Stripe" },
											].map(({ key, label, placeholder }) => (
												<div key={key} className="space-y-1">
													<label htmlFor={`resume-${key}`} className="font-medium text-sm">
														{label}
													</label>
													<input
														id={`resume-${key}`}
														type="text"
														placeholder={placeholder}
														value={resumeForm[key as keyof typeof resumeForm]}
														onChange={(e) => setResumeForm((p) => ({ ...p, [key]: e.target.value }))}
														className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
													/>
												</div>
											))}
										</div>
										<div className="space-y-1">
											<label htmlFor="extraNotes" className="font-medium text-sm">
												Extra instructions (optional)
											</label>
											<textarea
												id="extraNotes"
												rows={2}
												placeholder="e.g. Emphasise my open-source contributions and Web3 experience. Mention I can join in 30 days."
												value={resumeForm.extraNotes}
												onChange={(e) => setResumeForm((p) => ({ ...p, extraNotes: e.target.value }))}
												className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
											/>
										</div>
										<div className="space-y-2">
											<label htmlFor="resumeFileInput" className="font-medium text-sm">
												Upload Resume *
											</label>
											<button
												type="button"
												tabIndex={0}
												onClick={() => fileInputRef.current?.click()}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
												}}
												className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${resumeFile ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
											>
												<div className={`rounded-full p-3 ${resumeFile ? "bg-primary/10" : "bg-muted"}`}>
													<UploadSimpleIcon
														size={22}
														className={resumeFile ? "text-primary" : "text-muted-foreground"}
													/>
												</div>
												{resumeFile ? (
													<div>
														<p className="font-medium text-sm">{resumeFile.name}</p>
														<p className="mt-0.5 text-muted-foreground text-xs">Click to replace</p>
													</div>
												) : (
													<div>
														<p className="font-medium text-sm">
															<Trans>Click to upload your resume</Trans>
														</p>
														<p className="mt-0.5 text-muted-foreground text-xs">.pdf, .docx, .txt, .md supported</p>
													</div>
												)}
											</button>
											<input
												id="resumeFileInput"
												ref={fileInputRef}
												type="file"
												accept=".txt,.md,.pdf,.doc,.docx"
												className="hidden"
												onChange={handleResumeFileChange}
											/>
										</div>
										{resumeText && (
											<pre className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 font-sans text-muted-foreground text-xs leading-relaxed">
												{resumeText.slice(0, 600)}
												{resumeText.length > 600 ? "\n…" : ""}
											</pre>
										)}
										{generateError && (
											<p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm">{generateError}</p>
										)}
										<div className="flex gap-3">
											<button
												type="button"
												onClick={handleGenerateFromResume}
												disabled={
													isGenerating || !resumeText || !resumeForm.company || !resumeForm.role || !resumeForm.yourName
												}
												className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
											>
												{isGenerating ? (
													<>
														<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
															<title>Generating</title>
															<circle
																className="opacity-25"
																cx="12"
																cy="12"
																r="10"
																stroke="currentColor"
																strokeWidth="4"
															/>
															<path
																className="opacity-75"
																fill="currentColor"
																d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3-3-3h4z"
															/>
														</svg>
														<Trans>Generating…</Trans>
													</>
												) : (
													<>
														<SparkleIcon size={15} />
														<Trans>Generate with AI</Trans>
													</>
												)}
											</button>
											<button
												type="button"
												onClick={() => setIsCreating(false)}
												className="rounded-lg border px-5 py-2 font-medium text-sm transition-colors hover:bg-secondary"
											>
												<Trans>Cancel</Trans>
											</button>
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* Right — preview / edit */}
				{editing && !isCreating && (
					<div className="space-y-3">
						{/* Toolbar */}
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div>
								<h2 className="font-semibold text-lg">{editing.title}</h2>
								{(() => {
									const meta = TEMPLATES.find((t) => t.id === editing.template);
									return meta ? (
										<span className={`rounded-full px-2 py-0.5 font-medium text-xs ${meta.tagStyle}`}>
											{meta.label} template
										</span>
									) : null;
								})()}
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{!isEditing ? (
									<button
										type="button"
										onClick={() => handleStartEdit(editing)}
										className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
									>
										<PencilSimpleIcon size={13} />
										Edit
									</button>
								) : (
									<>
										<button
											type="button"
											onClick={handleSaveEdit}
											disabled={isSavingEdit}
											className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground text-xs transition-opacity hover:opacity-90 disabled:opacity-50"
										>
											<FloppyDiskIcon size={13} />
											{isSavingEdit ? "Saving…" : "Save"}
										</button>
										<button
											type="button"
											onClick={handleCancelEdit}
											className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
										>
											<XIcon size={13} />
											Cancel
										</button>
									</>
								)}
								<button
									type="button"
									onClick={() => handleCopy(editing.content)}
									className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
								>
									<CopyIcon size={13} />
									{copied ? "Copied!" : "Copy"}
								</button>
								<button
									type="button"
									disabled={downloadingDocx}
									onClick={async () => {
										setDownloadingDocx(true);
										await downloadAsDOCX(editing).finally(() => setDownloadingDocx(false));
									}}
									className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-secondary disabled:opacity-50"
								>
									<DownloadSimpleIcon size={13} />
									{downloadingDocx ? "…" : "DOCX"}
								</button>
								<button
									type="button"
									disabled={downloadingPdf}
									onClick={async () => {
										setDownloadingPdf(true);
										await downloadAsPDF(editing).finally(() => setDownloadingPdf(false));
									}}
									className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-secondary disabled:opacity-50"
								>
									<DownloadSimpleIcon size={13} />
									{downloadingPdf ? "…" : "PDF"}
								</button>
							</div>
						</div>

						{/* Edit mode */}
						{isEditing ? (
							<div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
								<div className="space-y-1">
									<label htmlFor="letterTitle" className="font-medium text-sm">
										Title
									</label>
									<input
										type="text"
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
									/>
								</div>
								<div className="space-y-1">
									<label htmlFor="letterContent" className="font-medium text-sm">
										Content
									</label>
									<textarea
										id="letterContent"
										rows={22}
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
									/>
								</div>
								<p className="text-muted-foreground text-xs">
									The letter uses a structured format: Name → Title | Stack → Contact → Date → Recipient block →
									Salutation → Body paragraphs → Sign-off → Your name → Title → LinkedIn
								</p>
							</div>
						) : (
							<RenderedLetter letter={editing} />
						)}
					</div>
				)}
			</div>
		</div>
	);
}
