import type { AIProvider } from "@reactive-resume/ai/types";
import type { ToolSet } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { tool } from "ai";
import z from "zod";
import { jsonPatchOperationSchema } from "@reactive-resume/resume/patch";
import { supportsProviderNativeWebSearch } from "../ai/capabilities";

type AgentProviderConfig = {
	provider: AIProvider;
	model: string;
	apiKey: string;
	baseURL?: string | null;
};

const applyResumePatchToolInputSchema = z.object({
	title: z.string().trim().min(1),
	summary: z.string().trim().optional(),
	operations: z.array(jsonPatchOperationSchema).min(1),
});

type ApplyResumePatchToolInput = z.infer<typeof applyResumePatchToolInputSchema>;

type BuildAgentToolsInput = {
	provider: AgentProviderConfig;
	userId: string;
	handlers: {
		readResume: () => Promise<unknown>;
		readAttachment: (attachmentId: string) => Promise<unknown>;
		applyResumePatch: (input: ApplyResumePatchToolInput) => Promise<unknown>;
	};
};

function buildProviderNativeAgentTools(provider: AgentProviderConfig): ToolSet {
	if (!supportsProviderNativeWebSearch(provider)) return {};

	const openai = createOpenAI({
		apiKey: provider.apiKey,
		...(provider.baseURL ? { baseURL: provider.baseURL } : {}),
	});

	if (typeof openai.tools.webSearch !== "function") return {};

	return {
		web_search: openai.tools.webSearch({
			searchContextSize: "low",
		}),
	};
}

export function buildAgentInstructions({ hasProviderNativeSearch }: { hasProviderNativeSearch: boolean }) {
	const baseInstructions =
		"You are an expert resume-writing agent inside Reactive Resume. Help the user improve the working resume for a target role. Read the resume before editing. Respond to the user in clean Markdown with concise paragraphs, bullets, and bold text when it improves scanability. Apply concise, valid JSON Patch operations when changes are useful. Patch paths are evaluated against the resume data object returned by read_resume, so use paths like /basics/name for the visible name and never /data/basics/name or /name. apply_resume_patch cannot rename the resume file/title metadata. Batch related JSON Patch operations into one apply_resume_patch call for each coherent edit instead of making repeated patch calls for the same request. Ask the user a question when a missing preference blocks a high-confidence edit.";

	if (!hasProviderNativeSearch) {
		return `${baseInstructions} Live web research is unavailable with the selected provider or model. If the user asks you to browse, search the web, fetch a URL, or use current online context, briefly tell them live web research is unavailable with the selected provider/model and ask them to paste or attach the relevant content. Continue normal resume editing using the resume, chat context, and attachments.`;
	}

	return `${baseInstructions} Use web_search for live or current web research, including user-provided public URLs, job descriptions, company pages, and recent company, industry, or role context.`;
}

async function callGroq(prompt: string): Promise<string> {
	const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.GROQ_API_KEY ?? ""}`,
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			max_tokens: 1200,
			messages: [{ role: "user", content: prompt }],
		}),
	});
	const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
	return data.choices?.[0]?.message?.content ?? "";
}

export function buildAgentTools(input: BuildAgentToolsInput): ToolSet {
	return {
		...buildProviderNativeAgentTools(input.provider),
		ask_user_question: tool({
			description:
				"Ask the user a short question when you need a preference, missing fact, or choice before continuing. Provide 2-4 recommended answer choices when possible.",
			inputSchema: z.object({
				question: z.string().trim().min(1),
				choices: z.array(z.string().trim().min(1)).min(1).max(4).optional(),
				recommendedChoice: z.string().trim().optional(),
			}),
		}),
		read_resume: tool({
			description: "Read the current working resume JSON and metadata.",
			inputSchema: z.object({}),
			execute: input.handlers.readResume,
		}),
		read_attachment: tool({
			description:
				"Read a message attachment by id. Text, Markdown, and JSON attachments include content; images and supported files may already be provided directly to the model.",
			inputSchema: z.object({ attachmentId: z.string().trim().min(1) }),
			execute: ({ attachmentId }) => input.handlers.readAttachment(attachmentId),
		}),
		apply_resume_patch: tool({
			description:
				"Apply one cohesive batch of JSON Patch operations to the working resume data immediately. Paths are rooted at resume data; use /basics/name for the visible resume name, not /data/basics/name or /name. This tool cannot rename the resume file/title metadata. The user can restore the draft to the snapshot captured before a patch later.",
			inputSchema: applyResumePatchToolInputSchema,
			execute: (toolInput) => input.handlers.applyResumePatch(toolInput),
		}),
		improve_resume: tool({
			description:
				"Improve a specific section of the resume using AI. Use this when user asks to make resume better, stronger, or more impactful.",
			inputSchema: z.object({
				section: z.string().trim().min(1).describe("Which section to improve e.g. summary, experience, skills"),
				targetRole: z.string().trim().optional().describe("Job role the user is targeting"),
				instruction: z.string().trim().optional().describe("Specific instruction from user"),
			}),
			execute: async ({ section, targetRole, instruction }) => {
				const resume = await input.handlers.readResume();

				const prompt = `
					You are an expert resume writer.

					Current resume data:
					${JSON.stringify(resume)}

					Task: Improve the "${section}" section.
					${targetRole ? `Target Role: ${targetRole}` : ""}
					${instruction ? `Specific instruction: ${instruction}` : ""}

					Return ONLY the improved content as plain text. No explanations.
				`;

				const improvedContent = await callGroq(prompt);
				return { improvedContent, section };
			},
		}),
		generate_cover_letter: tool({
			description:
				"Generate a professional cover letter based on the current resume and a target job. Use when user asks for cover letter.",
			inputSchema: z.object({
				jobTitle: z.string().trim().min(1).describe("Target job title"),
				companyName: z.string().trim().min(1).describe("Company name"),
				jobDescription: z.string().trim().optional().describe("Job description if user provided"),
				tone: z.enum(["professional", "enthusiastic", "concise"]).default("professional"),
			}),
			execute: async ({ jobTitle, companyName, jobDescription, tone: _tone }) => {
				const resume = await input.handlers.readResume();

				const prompt = `You are an expert cover letter writer.

Candidate's resume:
${JSON.stringify(resume)}

Write a professional cover letter for:
- Job Title: ${jobTitle}
- Company: ${companyName}
${jobDescription ? `- Job Description: ${jobDescription}` : ""}

IMPORTANT: Output MUST follow this EXACT structure with no extra text:

[Candidate Full Name]
[Candidate Title] | [Key Skills]
[Email] | [Phone] | [Location]

${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

Hiring Manager
${companyName}
Re: ${jobTitle} — Application

Dear Hiring Manager,

[Opening paragraph - genuine interest in role and company]

[Second paragraph - relevant experience and key achievements]

[Third paragraph - specific skills that match this role]

[Fourth paragraph - closing with call to action. End with: "Please find my resume attached. Thank you for your time and consideration."]

Warm regards,

[Candidate Full Name]
[Candidate Title]

Return ONLY the cover letter. No markdown, no code blocks, no explanations.`;

				const coverLetter = await callGroq(prompt);
				return { coverLetter, jobTitle, companyName };
			},
		}),
	};
}
