import {
	CheckCircleIcon,
	FileTextIcon,
	ScanIcon,
	SpinnerGapIcon,
	StarIcon,
	UploadSimpleIcon,
	WarningCircleIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { Button } from "@reactive-resume/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@reactive-resume/ui/components/card";
import { Combobox } from "@/components/ui/combobox";
import { orpc } from "@/libs/orpc/client";

export const Route = createFileRoute("/dashboard/ats-scanner")({
	component: AtsScannerPage,
});

type AnalysisResult = {
	score: number;
	keywords: { found: string[]; missing: string[] };
	issues: string[];
	recommendations: string[];
	strengths: string[];
};

type ScanMode = "saved" | "upload";

// ─── Groq Analysis ────────────────────────────────────────────────────────────

async function analyzeWithGroq(resumeText: string): Promise<AnalysisResult> {
	const apiKey = import.meta.env.VITE_GROQ_API_KEY;

	const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			temperature: 0.3,
			max_tokens: 1500,
			messages: [
				{
					role: "system",
					content:
						"You are an expert ATS resume analyzer. Always respond with valid JSON only. No markdown, no code fences, no explanation.",
				},
				{
					role: "user",
					content: `Analyze this resume and return ONLY a valid JSON object with this exact structure:
{
  "score": <number 0-100>,
  "keywords": {
    "found": [<strong keywords already present>],
    "missing": [<important missing keywords>]
  },
  "issues": [<specific problems reducing ATS score>],
  "recommendations": [<actionable improvements>],
  "strengths": [<things the resume does well>]
}

Resume content:
${resumeText}`,
				},
			],
		}),
	});

	if (!response.ok) {
		const err = await response.json();
		throw new Error(err?.error?.message ?? `API error: ${response.status}`);
	}

	const data = await response.json();
	const text: string = data.choices?.[0]?.message?.content ?? "";
	const clean = text.replace(/```json|```/g, "").trim();
	return JSON.parse(clean) as AnalysisResult;
}

// ─── File Extractors ──────────────────────────────────────────────────────────

async function extractFromJson(file: File): Promise<string> {
	const text = await file.text();
	try {
		const parsed = JSON.parse(text);
		return JSON.stringify(parsed, null, 2);
	} catch {
		throw new Error("Invalid JSON file.");
	}
}

async function extractFromPdf(file: File): Promise<string> {
	const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

	pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).href;

	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

	let fullText = "";
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content = await page.getTextContent();
		const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
		fullText += `${pageText}\n`;
	}

	if (!fullText.trim()) throw new Error("Could not extract text from PDF.");
	return fullText;
}

async function extractFromDocx(file: File): Promise<string> {
	const mammoth = await import("mammoth");
	const arrayBuffer = await file.arrayBuffer();
	const result = await mammoth.extractRawText({ arrayBuffer });
	if (!result.value.trim()) throw new Error("Could not extract text from DOCX.");
	return result.value;
}

async function extractTextFromFile(file: File): Promise<string> {
	const ext = file.name.split(".").pop()?.toLowerCase();
	if (ext === "json") return extractFromJson(file);
	if (ext === "pdf") return extractFromPdf(file);
	if (ext === "docx" || ext === "doc") return extractFromDocx(file);
	throw new Error("Unsupported file type. Please upload PDF, DOCX, or JSON.");
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
	const color = score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500";
	const label = score >= 80 ? "Excellent" : score >= 60 ? "Needs Work" : "Poor";
	return (
		<div className="text-right">
			<p className={`font-bold text-6xl ${color}`}>{score}</p>
			<p className={`font-semibold text-sm ${color}`}>{label}</p>
			<p className="text-muted-foreground text-xs">ATS Score</p>
		</div>
	);
}

function ScoreBar({ score }: { score: number }) {
	const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";
	return (
		<div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
			<div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
		</div>
	);
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({ file, onFile, onClear }: { file: File | null; onFile: (f: File) => void; onClear: () => void }) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragging(false);
			const dropped = e.dataTransfer.files[0];
			if (dropped) onFile(dropped);
		},
		[onFile],
	);

	if (file) {
		return (
			<div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
				<div className="flex items-center gap-3">
					<FileTextIcon size={20} className="text-primary" weight="duotone" />
					<div>
						<p className="font-medium text-foreground text-sm">{file.name}</p>
						<p className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(1)} KB</p>
					</div>
				</div>
				<button
					type="button"
					onClick={onClear}
					className="text-muted-foreground transition-colors hover:text-destructive"
				>
					<XCircleIcon size={20} />
				</button>
			</div>
		);
	}

	return (
		<button
			type="button"
			onDragOver={(e) => {
				e.preventDefault();
				setDragging(true);
			}}
			onDragLeave={() => setDragging(false)}
			onDrop={handleDrop}
			onClick={() => inputRef.current?.click()}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
			}}
			className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50"}`}
		>
			<UploadSimpleIcon size={28} className="text-muted-foreground" weight="duotone" />
			<p className="font-medium text-foreground text-sm">
				Drop your resume here or <span className="text-primary underline">browse</span>
			</p>
			<p className="text-muted-foreground text-xs">Supports PDF, DOCX, DOC, JSON</p>
			<input
				ref={inputRef}
				type="file"
				accept=".pdf,.doc,.docx,.json"
				className="hidden"
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) onFile(f);
				}}
			/>
		</button>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function AtsScannerPage() {
	const [mode, setMode] = useState<ScanMode>("saved");
	const [selectedResume, setSelectedResume] = useState("");
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { data: resumes } = useQuery(
		orpc.resume.list.queryOptions({
			input: { tags: [], sort: "lastUpdatedAt" },
		}),
	);

	const { data: resumeDetails } = useQuery({
		...orpc.resume.getById.queryOptions({
			input: { id: selectedResume },
		}),
		enabled: !!selectedResume,
	});

	const resumeOptions = resumes?.map((resume) => ({ value: resume.id, label: resume.name })) ?? [];

	const canScan = mode === "saved" ? !!selectedResume : !!uploadedFile;

	const handleScan = async () => {
		setLoading(true);
		setError(null);
		setResult(null);

		try {
			let resumeText = "";

			if (mode === "saved") {
				if (!resumeDetails?.data) throw new Error("Resume data not loaded yet.");
				resumeText = JSON.stringify(resumeDetails.data, null, 2);
			} else {
				if (!uploadedFile) throw new Error("No file selected.");
				resumeText = await extractTextFromFile(uploadedFile);
			}

			const analysis = await analyzeWithGroq(resumeText);
			setResult(analysis);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const resetAll = () => {
		setResult(null);
		setError(null);
		setUploadedFile(null);
		setSelectedResume("");
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div>
				<h1 className="flex items-center gap-2 font-bold text-3xl">
					<ScanIcon weight="duotone" />
					ATS Scanner
				</h1>
				<p className="text-muted-foreground">Analyze your resume for ATS compatibility using Groq AI.</p>
			</div>

			{/* Score Hero */}
			<Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
				<CardContent className="p-6">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h2 className="font-semibold text-xl">Resume ATS Score</h2>
							<p className="text-muted-foreground text-sm">
								Select or upload a resume and click Scan for AI-powered feedback.
							</p>
							{result && <ScoreBar score={result.score} />}
						</div>
						{result ? (
							<ScoreBadge score={result.score} />
						) : (
							<div className="text-right">
								<p className="font-bold text-6xl text-primary/30">--</p>
								<p className="text-muted-foreground text-xs">ATS Score</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Mode Toggle + Input */}
			<Card>
				<CardHeader>
					<CardTitle>Select Resume</CardTitle>
					<CardDescription>Choose a saved resume or upload one from your device.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Tab Toggle */}
					<div className="flex gap-1 rounded-lg border bg-secondary/30 p-1">
						<button
							type="button"
							onClick={() => {
								setMode("saved");
								resetAll();
							}}
							className={`flex-1 rounded-md px-4 py-2 font-medium text-sm transition-all ${
								mode === "saved"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Saved Resumes
						</button>
						<button
							type="button"
							onClick={() => {
								setMode("upload");
								resetAll();
							}}
							className={`flex-1 rounded-md px-4 py-2 font-medium text-sm transition-all ${
								mode === "upload"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Upload from Device
						</button>
					</div>

					{/* Input Area */}
					{mode === "saved" ? (
						<Combobox
							value={selectedResume}
							options={resumeOptions}
							placeholder="Select a resume"
							onValueChange={(value) => {
								setSelectedResume(value ?? "");
								setResult(null);
								setError(null);
							}}
						/>
					) : (
						<DropZone
							file={uploadedFile}
							onFile={(f) => {
								setUploadedFile(f);
								setResult(null);
								setError(null);
							}}
							onClear={() => {
								setUploadedFile(null);
								setResult(null);
								setError(null);
							}}
						/>
					)}

					<Button className="w-full" disabled={!canScan || loading} onClick={handleScan}>
						{loading ? (
							<>
								<SpinnerGapIcon className="mr-2 animate-spin" size={16} />
								Analyzing with Groq AI…
							</>
						) : (
							<>
								<ScanIcon className="mr-2" size={16} />
								Scan Resume
							</>
						)}
					</Button>

					{error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-destructive text-sm">⚠️ {error}</p>}
				</CardContent>
			</Card>

			{/* Results Grid */}
			{result && (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<FileTextIcon weight="duotone" />
								Keywords Found
							</CardTitle>
						</CardHeader>
						<CardContent>
							{result.keywords.found.length === 0 ? (
								<p className="text-muted-foreground text-sm">None detected.</p>
							) : (
								<div className="flex flex-wrap gap-1.5">
									{result.keywords.found.map((kw) => (
										<span
											key={kw}
											className="rounded-full bg-green-500/10 px-2 py-0.5 font-medium text-green-600 text-xs"
										>
											{kw}
										</span>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<FileTextIcon weight="duotone" className="text-yellow-500" />
								Missing Keywords
							</CardTitle>
						</CardHeader>
						<CardContent>
							{result.keywords.missing.length === 0 ? (
								<p className="text-muted-foreground text-sm">Great coverage!</p>
							) : (
								<div className="flex flex-wrap gap-1.5">
									{result.keywords.missing.map((kw) => (
										<span
											key={kw}
											className="rounded-full bg-yellow-500/10 px-2 py-0.5 font-medium text-xs text-yellow-600"
										>
											{kw}
										</span>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<WarningCircleIcon weight="duotone" className="text-red-500" />
								Issues
							</CardTitle>
						</CardHeader>
						<CardContent>
							{result.issues.length === 0 ? (
								<p className="text-muted-foreground text-sm">No issues found!</p>
							) : (
								<ul className="space-y-1.5 text-sm">
									{result.issues.map((issue) => (
										<li key={issue} className="flex gap-2">
											<span className="mt-0.5 shrink-0 text-red-400">✗</span>
											{issue}
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<StarIcon weight="duotone" className="text-primary" />
								Strengths
							</CardTitle>
						</CardHeader>
						<CardContent>
							{result.strengths.length === 0 ? (
								<p className="text-muted-foreground text-sm">Add more detail to your resume.</p>
							) : (
								<ul className="space-y-1.5 text-sm">
									{result.strengths.map((s) => (
										<li key={s} className="flex gap-2">
											<span className="mt-0.5 shrink-0 text-green-500">✓</span>
											{s}
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>
				</div>
			)}

			{/* Recommendations */}
			{result && result.recommendations.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircleIcon weight="duotone" className="text-primary" />
							Recommendations
						</CardTitle>
						<CardDescription>AI-suggested improvements to boost your ATS score.</CardDescription>
					</CardHeader>
					<CardContent>
						<ol className="space-y-2 text-sm">
							{result.recommendations.map((rec, i) => (
								<li key={rec} className="flex gap-3">
									<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
										{i + 1}
									</span>
									{rec}
								</li>
							))}
						</ol>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
