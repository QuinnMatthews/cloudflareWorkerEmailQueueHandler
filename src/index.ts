export default {
	async fetch(): Promise<Response> {
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
				body: JSON.stringify(message.body),
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


// Define the shape of the message payload, should match the expected structure of the downstream service
interface EmailMessageItem {
	To: Array<string>;
	CC: Array<string> | undefined;
	BCC: Array<string> | undefined;
	Subject: string | undefined;
	Message: string;
}
