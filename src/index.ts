export default {
	async fetch(request, env, ctx): Promise<Response> {
		// Return 404
		return new Response(null, { status: 404 });
	},

	async queue(batch, env): Promise<void> {
		for (let message of batch.messages) {
			// Process each message (we'll just log these)
			console.log(`processing ${message.id}`);

			let response = await fetch(env.RELAY_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-functions-key': env.RELAY_KEY,
				},
				body: JSON.stringify({
					Email: message.body.to,
					Message: message.body.message,
				}),
			});

			if (response.ok) {
				message.ack();
			} else {
				console.error(`Failed to process message ${message.id}: ${response.statusText}`);
				message.retry();
			}
		}
	},
} satisfies ExportedHandler<Env, EmailMessageItem>;

interface EmailMessageItem {
	to: string;
	message: string;
}
