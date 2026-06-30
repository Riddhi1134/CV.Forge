// import { ORPCError } from "@orpc/server";
// import { db } from "@reactive-resume/db/client";
// import { coverLetter } from "@reactive-resume/db/schema";
// import { eq, and } from "drizzle-orm";
// import { z } from "zod";
// import { protectedProcedure } from "../../context";

// const TEMPLATE_STYLE_GUIDE: Record<string, string> = {
//   Classic: "Traditional and formal. Respectful salutation. Measured tone. Complete sentences. Formal sign-off.",
//   Modern: "Lead with your strongest achievement in the very first sentence. Direct, energetic, short paragraphs. Confident.",
//   Minimal: "Extremely concise. Max 2-3 sentences per paragraph. Strip all filler. Quiet confidence, no superlatives.",
//   Executive: "Gravitas for senior roles. Emphasize strategic outcomes, leadership, and organizational impact. Authoritative.",
// };

// export const coverLetterRouter = {
//   list: protectedProcedure.handler(async ({ context }) => {
//     const letters = await db
//       .select()
//       .from(coverLetter)
//       .where(eq(coverLetter.userId, context.user.id))
//       .orderBy(coverLetter.createdAt);
//     return letters.reverse();
//   }),

//   save: protectedProcedure
//     .input(z.object({
//       id: z.string(),
//       title: z.string(),
//       company: z.string(),
//       role: z.string(),
//       yourName: z.string(),
//       content: z.string(),
//       template: z.enum(["Classic", "Modern", "Minimal", "Executive"]),
//     }))
//     .handler(async ({ input, context }) => {
//       const [saved] = await db
//         .insert(coverLetter)
//         .values({ ...input, userId: context.user.id })
//         .returning();
//       return saved;
//     }),

//   update: protectedProcedure
//     .input(z.object({
//       id: z.string(),
//       title: z.string().min(1),
//       content: z.string().min(1),
//     }))
//     .handler(async ({ input, context }) => {
//       const [updated] = await db
//         .update(coverLetter)
//         .set({ title: input.title, content: input.content, updatedAt: new Date() })
//         .where(and(eq(coverLetter.id, input.id), eq(coverLetter.userId, context.user.id)))
//         .returning();
//       return updated;
//     }),

//   delete: protectedProcedure
//     .input(z.object({ id: z.string() }))
//     .handler(async ({ input, context }) => {
//       await db
//         .delete(coverLetter)
//         .where(and(eq(coverLetter.id, input.id), eq(coverLetter.userId, context.user.id)));
//       return { success: true };
//     }),

//   generate: protectedProcedure
//     .input(z.object({
//       prompt: z.string().min(1),
//       template: z.enum(["Classic", "Modern", "Minimal", "Executive"]).default("Classic"),
//     }))
//     .handler(async ({ input }) => {
//       const apiKey = process.env.GROQ_API_KEY;
//       if (!apiKey) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "GROQ_API_KEY is not configured." });

//       const styleGuide = TEMPLATE_STYLE_GUIDE[input.template];

//       const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${apiKey}`,
//           "Accept-Encoding": "identity",
//         },
//         body: JSON.stringify({
//           model: "llama-3.3-70b-versatile",
//           max_tokens: 1000,
//           messages: [
//             {
//               role: "system",
//               content: `You are a senior career coach and professional cover letter writer.

// WRITING STYLE: ${styleGuide}

// Structure — 4 paragraphs:
// 1. OPENING: Compelling reason why THIS company and THIS role. Never start with "I am writing to apply for..."
// 2. VALUE: 2-3 specific achievements from the resume. Quantify impact wherever possible.
// 3. ALIGNMENT: Genuine understanding of company mission. Why your values align.
// 4. CLOSE: Confident, forward-looking. Strong professional sign-off.

// STRICT RULES:
// - The user message starts with "CANDIDATE NAME: <name>". Use that EXACT name in the sign-off. NEVER write "Anonymous".
// - Never use: "passionate", "hard-working", "team player", "great fit"
// - Never use placeholders like [Your Name], [Date]
// - Output ONLY the cover letter text. Nothing else.`,
//             },
//             { role: "user", content: input.prompt },
//           ],
//         }),
//       });

//       if (!response.ok) {
//         const err = await response.text();
//         throw new ORPCError("INTERNAL_SERVER_ERROR", { message: `Groq error: ${err}` });
//       }

//       const data = await response.json();
//       const content: string = data.choices?.[0]?.message?.content ?? "";
//       return { content };
//     }),
// };

import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@reactive-resume/db/client";
import { coverLetter } from "@reactive-resume/db/schema";
import { protectedProcedure } from "../../context";

const TEMPLATE_STYLE_GUIDE: Record<string, string> = {
	Classic:
		"Traditional and formal. Measured, professional tone. Complete sentences. Formal sign-off. Best for corporate, government, and traditional industries.",
	Modern:
		"Lead with your strongest achievement in the very first sentence. Direct, energetic, short paragraphs. Confident and punchy. Best for tech and startups.",
	Minimal:
		"Extremely concise. Max 2-3 sentences per paragraph. Strip all filler. Quiet confidence, no superlatives. Best for design and creative roles.",
	Executive:
		"Gravitas and authority. Emphasize strategic outcomes, leadership impact, and organizational value. Measured and authoritative. Best for finance and consulting.",
};

export const coverLetterRouter = {
	list: protectedProcedure.handler(async ({ context }) => {
		const letters = await db
			.select()
			.from(coverLetter)
			.where(eq(coverLetter.userId, context.user.id))
			.orderBy(coverLetter.createdAt);
		return letters.reverse();
	}),

	save: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string(),
				company: z.string(),
				role: z.string(),
				yourName: z.string(),
				content: z.string(),
				template: z.enum(["Classic", "Modern", "Minimal", "Executive"]),
			}),
		)
		.handler(async ({ input, context }) => {
			const [saved] = await db
				.insert(coverLetter)
				.values({ ...input, userId: context.user.id })
				.returning();
			return saved;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1),
				content: z.string().min(1),
			}),
		)
		.handler(async ({ input, context }) => {
			const [updated] = await db
				.update(coverLetter)
				.set({ title: input.title, content: input.content, updatedAt: new Date() })
				.where(and(eq(coverLetter.id, input.id), eq(coverLetter.userId, context.user.id)))
				.returning();
			return updated;
		}),

	delete: protectedProcedure.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
		await db.delete(coverLetter).where(and(eq(coverLetter.id, input.id), eq(coverLetter.userId, context.user.id)));
		return { success: true };
	}),

	generate: protectedProcedure
		.input(
			z.object({
				prompt: z.string().min(1),
				template: z.enum(["Classic", "Modern", "Minimal", "Executive"]).default("Classic"),
			}),
		)
		.handler(async ({ input }) => {
			const apiKey = process.env.GROQ_API_KEY;
			if (!apiKey) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "GROQ_API_KEY is not configured." });

			const styleGuide = TEMPLATE_STYLE_GUIDE[input.template];

			const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
					"Accept-Encoding": "identity",
				},
				body: JSON.stringify({
					model: "llama-3.3-70b-versatile",
					max_tokens: 1200,
					messages: [
						{
							role: "system",
							content: `You are a senior career coach writing professional cover letters.

WRITING STYLE: ${styleGuide}

You must output the cover letter in EXACTLY this structure — no deviations:

---

[CANDIDATE_NAME]
[CANDIDATE_TITLE] | [TECH_STACK_TAGS]
[EMAIL] | [PHONE] | [LOCATION] | [LINKEDIN]

[DATE]

Hiring Manager
[COMPANY]

Re: [ROLE] — Application

Dear Hiring Manager,

PARAGRAPH 1 — WHO YOU ARE + WHY THIS COMPANY:
Introduce yourself with your title, location, and years of experience in the first sentence.
Then explain specifically why this company caught your attention — reference something real about them (their product, mission, tech stack, or industry focus). Never write generic reasons.
End with: "I believe my background maps closely to what you are looking for."

PARAGRAPH 2 — CURRENT ROLE + TECH STACK + PROJECTS:
Name your current or most recent employer and describe what you do there.
Explicitly list your core tech stack (frameworks, languages, databases, cloud tools).
Mention 2-3 types of projects or domains you have worked on (e.g. e-commerce, AI platforms, fintech).
Describe your delivery scope — end-to-end, architecture, deployment, client communication — whatever the resume supports.

PARAGRAPH 3 — WHAT SETS YOU APART:
Highlight what differentiates you beyond raw technical skill.
This could include: leading projects independently, mentoring junior developers, direct client or stakeholder communication, cross-timezone collaboration, ownership mindset, Agile experience, or any other soft/leadership skill evident from the resume.
Mention one thing you are currently learning or expanding into, if present in the resume.
End with a sentence about how you thrive in collaborative environments and take ownership.

PARAGRAPH 4 — AVAILABILITY + CALL TO ACTION:
State availability for interviews (including video calls / time zones if relevant).
Mention notice period or start date if available in the resume.
Ask to discuss how your experience can contribute.
End with: "Please find my resume attached. Thank you for your time and consideration."

Warm regards,

[CANDIDATE_NAME]
[CANDIDATE_TITLE]
[LINKEDIN_URL]

---

STRICT RULES:
- The user message contains "CANDIDATE NAME: <name>". Use that EXACT name in the header and sign-off. NEVER write "Anonymous" or leave it blank.
- Replace every [placeholder] with real values extracted from the resume. If a value is missing, omit that line entirely — never leave bracketed placeholders in the output.
- If phone, email, location, or LinkedIn are not in the resume, omit those lines silently.
- Never use the words: "passionate", "hard-working", "team player", "great fit", "synergy", "leverage", "dynamic"
- Never start paragraph 1 with "I am writing to apply for..."
- Never invent facts not present in the resume.
- Output ONLY the cover letter text. No commentary, no notes, no markdown headers, nothing else.`,
						},
						{ role: "user", content: input.prompt },
					],
				}),
			});

			if (!response.ok) {
				const err = await response.text();
				throw new ORPCError("INTERNAL_SERVER_ERROR", { message: `Groq error: ${err}` });
			}

			const data = await response.json();
			const content: string = data.choices?.[0]?.message?.content ?? "";
			return { content };
		}),
};
