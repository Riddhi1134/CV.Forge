// packages/api/src/features/ai/ats-service.ts

import type { AIProvider } from "@reactive-resume/ai/types";
import type { ResumeData } from "@reactive-resume/schema/resume/data";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getModel } from "./service";

// ── Output schema ──────────────────────────────────────────────────────────────

export const atsKeywordSchema = z.object({
	keyword: z.string(),
	found: z.boolean(),
	context: z.string().nullable(), // where it was found in resume, or null
});

export const atsSectionScoreSchema = z.object({
	section: z.string(), // e.g. "Skills", "Experience", "Education"
	score: z.number().int().min(0).max(100),
	rationale: z.string(),
});

export const atsSuggestionSchema = z.object({
	title: z.string(),
	impact: z.enum(["high", "medium", "low"]),
	description: z.string(),
	example: z.string().nullable(),
});

export const atsReportSchema = z.object({
	overallScore: z.number().int().min(0).max(100),
	matchScore: z.number().int().min(0).max(100), // JD match %
	sectionScores: z.array(atsSectionScoreSchema),
	keywords: z.array(atsKeywordSchema),
	missingKeywords: z.array(z.string()),
	strengths: z.array(z.string()).max(8),
	suggestions: z.array(atsSuggestionSchema).max(10),
	summary: z.string(), // 2-3 line executive summary
});

// Stored version with metadata
export const storedAtsReportSchema = atsReportSchema.extend({
	resumeId: z.string(),
	jobDescription: z.string(),
	updatedAt: z.coerce.date(),
	modelMeta: z.object({
		provider: z.string(),
		model: z.string(),
	}),
});

export type AtsReport = z.infer<typeof atsReportSchema>;
export type StoredAtsReport = z.infer<typeof storedAtsReportSchema>;

// ── Prompt builder ─────────────────────────────────────────────────────────────

function buildAtsSystemPrompt(resumeData: ResumeData, jobDescription: string): string {
	return `You are an expert ATS (Applicant Tracking System) analyzer and career coach.

Your task is to analyze a resume against a job description and return a structured ATS compatibility report.

## Instructions

1. Calculate an **overallScore** (0-100) based on format, completeness, and ATS-friendliness.
2. Calculate a **matchScore** (0-100) based on how well the resume matches the job description keywords, skills, and requirements.
3. For **sectionScores**, evaluate these sections: "Contact Info", "Summary/Objective", "Work Experience", "Education", "Skills", "Keywords Match".
4. For **keywords**: Extract the top 20 most important keywords/skills from the job description and check if each is present in the resume. For found keywords, include the context (where it appears).
5. For **missingKeywords**: List keywords from the job description that are completely absent from the resume.
6. For **strengths**: List what the resume does well (max 8 items).
7. For **suggestions**: Provide actionable improvements ordered by impact (max 10 items). Include concrete examples where possible.
8. Write a **summary**: 2-3 sentence executive summary of the overall fit.

## Job Description

${jobDescription}

## Resume Data

${JSON.stringify(resumeData, null, 2)}

Return ONLY the structured JSON report. No explanations outside the JSON.`;
}

// Output schema for AI SDK (slightly relaxed for generation)
const atsReportOutputSchema = z.object({
	overallScore: z.number(),
	matchScore: z.number(),
	sectionScores: z.array(
		z.object({
			section: z.string(),
			score: z.number(),
			rationale: z.string(),
		}),
	),
	keywords: z.array(
		z.object({
			keyword: z.string(),
			found: z.boolean(),
			context: z.string().nullable(),
		}),
	),
	missingKeywords: z.array(z.string()),
	strengths: z.array(z.string()),
	suggestions: z.array(
		z.object({
			title: z.string(),
			impact: z.enum(["high", "medium", "low"]),
			description: z.string(),
			example: z.string().nullable(),
		}),
	),
	summary: z.string(),
});

// ── Service function ───────────────────────────────────────────────────────────

type AtsAnalyzeInput = {
	provider: AIProvider;
	model: string;
	apiKey: string;
	baseURL?: string;
	resumeData: ResumeData;
	jobDescription: string;
};

export async function analyzeAts(input: AtsAnalyzeInput): Promise<AtsReport> {
	const model = getModel(input);
	const systemPrompt = buildAtsSystemPrompt(input.resumeData, input.jobDescription);

	const result = await generateText({
		model,
		output: Output.object({ schema: atsReportOutputSchema }),
		messages: [
			{ role: "system", content: systemPrompt },
			{
				role: "user",
				content: "Analyze this resume against the job description and return the full ATS compatibility report.",
			},
		],
	});

	if (result.output == null) {
		throw new Error("AI returned no ATS analysis output.");
	}

	return atsReportSchema.parse(result.output);
}
