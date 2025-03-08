const API_URL = 'https://api.openai.com/v1/chat/completions';
import { system_prompt } from "./prompts";

export async function POST(request: Request) {
	const openai_api_key = process.env.OPENAI_API_KEY;

	if (!openai_api_key) {
		throw new Error('Add OPENAI_API_KEY in your .env');
	}

	try {
		const data = await request.json();
		const content = data.content;
		console.log(content);
		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${openai_api_key}`
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{ role: 'system', content: system_prompt },
					{ role: 'user', content: content }
				],
				// max_tokens: 150,
				temperature: 0.5
			})
		})
		
		const res = await response.json();
		console.log(res.choices[0].message.content)
		return Response.json({ response: res })
	} catch (error) {
		console.error(error);
		return Response.json({ e: 'failed to hit openai' });
	}
}