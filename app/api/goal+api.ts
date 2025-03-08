const API_URL = 'https://api.openai.com/v1/chat/completions';

export async function POST(request: Request) {
	const openai_api_key = process.env.OPENAI_API_KEY;

	if (!openai_api_key) {
		throw new Error('Add OPENAI_API_KEY in your .env');
	}

	try {
		const data = await request.json();
		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${openai_api_key}`
			},
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{ role: 'system', content: 'system prompt here'},
					{ role: 'user', content: data }
				],
				max_tokens: 150,
				temperature: 0.5
			})
		})
		console.log(response);
		const f = await response.json();
		console.log(f.choises[0].message.content)
		return Response.json({ response: f })
	} catch (error) {
		console.error(error);
		return Response.json({ e: 'failed to hit openai' });
	}
}