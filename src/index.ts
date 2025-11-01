import { Agent } from 'agents';


export interface Env {
	AI: Ai;
	SMART_ASSISTANT: DurableObjectNamespace;
}

/**
 * SmartAssistant Agent - AI-powered conversational assistant with memory
 * Uses Llama 3.3 70B via Workers AI and maintains conversation history
 */
export class SmartAssistant extends Agent<Env> {
	initialState = {
		conversationHistory: [],
		userName: 'User',
	};

	async onStart() {
		// Optional: initialization logic. State persistence is handled by the Agents SDK.
	}

	async onConnect(connection: any, ctx: any) {
		const { userName } = this.state as { userName: string };
		await connection.send(
			JSON.stringify({
				role: 'assistant',
				content: `Hello${userName !== 'User' ? ' ' + userName : ''}! I'm your Smart Assistant powered by Llama 3.3. I have persistent memory, so I remember our conversations. How can I help you today?`,
			})
		);
	}

	async onMessage(connection: any, rawMessage: any) {
		let msgObj: { role?: string; content?: string } = {};

		if (typeof rawMessage === 'string') {
			try {
				msgObj = JSON.parse(rawMessage);
			} catch {
				msgObj = { role: 'user', content: rawMessage };
			}
		} else {
			const text = rawMessage instanceof ArrayBuffer
				? new TextDecoder().decode(rawMessage)
				: typeof rawMessage === 'object' && 'buffer' in (rawMessage as any)
				? new TextDecoder().decode(rawMessage as ArrayBufferView)
				: '';
			try {
				msgObj = JSON.parse(text);
			} catch {
				msgObj = { role: 'user', content: text };
			}
		}

		const content = (msgObj.content || '').trim();
		if (!content) return;

		const state = this.state as {
			conversationHistory?: { role: string; content: string }[];
			userName?: string;
		};
		const currentHistory = state.conversationHistory ?? [];

		// Handle special commands
		if (content.startsWith('/name ')) {
			const name = content.substring(6).trim() || 'User';
			this.setState({ userName: name });
			await connection.send(
				JSON.stringify({ role: 'assistant', content: `Great! I'll remember to call you ${name}.` })
			);
			return;
		}

		if (content === '/clear') {
			this.setState({ conversationHistory: [] });
			await connection.send(
				JSON.stringify({ role: 'assistant', content: 'Conversation history cleared. Starting fresh!' })
			);
			return;
		}

		if (content === '/history') {
			const historyText = currentHistory.length > 0

				? currentHistory
						.map((msg, i) => `${i + 1}. ${msg.role}: ${msg.content}`)
						.join('\n')
				: 'No conversation history yet.';
			await connection.send(
				JSON.stringify({ role: 'assistant', content: `Conversation History:\n${historyText}` })
			);
			return;
		}

		// Add user message to history and trim
		const updatedHistory = [
			...currentHistory,
			{ role: 'user', content },
		];
		const trimmedHistory = updatedHistory.length > 20 ? updatedHistory.slice(-20) : updatedHistory;
		this.setState({ conversationHistory: trimmedHistory });

		// Prepare messages for AI with system prompt
		const userName = state.userName ?? 'User';
		const messages = [
			{
				role: 'system',
				content: `You are a helpful AI assistant named Smart Assistant. You have memory of previous conversations. The user's name is ${userName}. Be friendly, concise, and helpful.`,
			},
			...trimmedHistory,
		];

		try {
			const aiResponse = (await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
				messages,
				stream: false,
			})) as { response: string };

			const assistantMessage = aiResponse.response;

			// Add assistant response to history
			const finalHistory = [
				...trimmedHistory,
				{ role: 'assistant', content: assistantMessage },
			];
			this.setState({ conversationHistory: finalHistory });

			await connection.send(
				JSON.stringify({ role: 'assistant', content: assistantMessage })
			);
		} catch (error) {
			console.error('AI Error:', error);
			await connection.send(
				JSON.stringify({
					role: 'assistant',
					content: 'Sorry, I encountered an error processing your request. Please try again.',
				})
			);
		}
	}

	// Overload signatures to match Agent base type
	onError(connection: any, error: unknown): Promise<void>;
	onError(error: unknown): Promise<void>;
	async onError(arg1: any, arg2?: unknown): Promise<void> {
		const connection = typeof arg2 !== 'undefined' ? arg1 : null;
		const error = typeof arg2 !== 'undefined' ? arg2 : arg1;
		console.error('Agent Error:', error);
		if (connection && typeof connection.send === 'function') {
			await connection.send(
				JSON.stringify({
					role: 'assistant',
					content: 'An error occurred. Please try again or start a new conversation.',
				})
			);
		}
	}
}

/**
 * Helper function to add CORS headers
 */
function corsHeaders(origin: string | null): Record<string, string> {
	// Allow Pages frontend to connect
	const allowedOrigins = [
		'http://localhost:8788',  // Pages dev server
		'https://cf-ai-smart-assistant.pages.dev',  // Your Pages deployment
	];

	const headers: Record<string, string> = {
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};

	if (origin && (allowedOrigins.includes(origin) || origin.endsWith('.pages.dev'))) {
		headers['Access-Control-Allow-Origin'] = origin;
	}

	return headers;
}

/**
 * Worker entry point - API and WebSocket endpoints only
 * Frontend is served separately via Cloudflare Pages
 */
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const origin = request.headers.get('Origin');

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders(origin),
			});
		}

		// WebSocket endpoint for agent connection
		if (url.pathname === '/agent') {
			const id = env.SMART_ASSISTANT.idFromName('default');
			const stub = env.SMART_ASSISTANT.get(id);
			return stub.fetch(request);
		}

		// API endpoint to get agent info
		if (url.pathname === '/api/info') {
			return Response.json(
				{
					name: 'Smart Assistant',
					model: 'Llama 3.3 70B',
					features: ['Persistent Memory', 'Real-time Chat', 'Context Awareness'],
					commands: [
						'/name <your-name> - Set your name',
						'/history - View conversation history',
						'/clear - Clear conversation history',
					],
				},
				{
					headers: corsHeaders(origin),
				}
			);
		}

		// Health check endpoint
		if (url.pathname === '/health') {
			return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
		}

		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
