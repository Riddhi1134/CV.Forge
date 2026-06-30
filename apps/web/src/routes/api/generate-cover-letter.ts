// // apps/web/src/routes/api/generate-cover-letter.ts
// // TanStack Start server route — runs only on the server, never in the browser.
// // Add your ANTHROPIC_API_KEY to your .env file: ANTHROPIC_API_KEY=sk-ant-...

// import { json } from "@tanstack/start";
// import { createAPIFileRoute } from "@tanstack/start/api";

// export const APIRoute = createAPIFileRoute("/api/generate-cover-letter")({
//   POST: async ({ request }) => {
//     const apiKey = process.env.ANTHROPIC_API_KEY;

//     if (!apiKey) {
//       return json({ error: "ANTHROPIC_API_KEY is not configured on the server." }, { status: 500 });
//     }

//     let body: { prompt?: string };
//     try {
//       body = await request.json();
//     } catch {
//       return json({ error: "Invalid JSON body." }, { status: 400 });
//     }

//     if (!body.prompt) {
//       return json({ error: "Missing required field: prompt" }, { status: 400 });
//     }

//     const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": apiKey,
//         "anthropic-version": "2023-06-01",
//       },
//       body: JSON.stringify({
//         model: "claude-sonnet-4-20250514",
//         max_tokens: 1000,
//         messages: [{ role: "user", content: body.prompt }],
//       }),
//     });

//     if (!anthropicResponse.ok) {
//       const errorText = await anthropicResponse.text();
//       return json({ error: `Anthropic API error: ${errorText}` }, { status: anthropicResponse.status });
//     }

//     const data = await anthropicResponse.json();
//     const content = data.content
//       ?.map((block: { type: string; text?: string }) => (block.type === "text" ? block.text : ""))
//       .join("") ?? "";

//     return json({ content });
//   },
// });

