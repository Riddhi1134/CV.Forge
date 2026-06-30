import OpenAI from "openai";

const client = new OpenAI({
	apiKey: process.env.GROQ_API_KEY,
	baseURL: "https://api.groq.com/openai/v1",
});

const res = await client.chat.completions.create({
	model: "llama-3.3-70b-versatile",
	messages: [{ role: "user", content: "hello" }],
});

console.log(res.choices[0].message.content);
