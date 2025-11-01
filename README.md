🌍 Overview

cf_ai_smart_assistant is a fully serverless conversational assistant that runs on Cloudflare Workers and Pages, using Durable Objects to store conversation history and context between sessions.

Built with the Cloudflare Agents SDK, it combines AI intelligence with edge-native performance — no external infrastructure required.

✨ Key Features

🤖 AI Intelligence – Powered by Llama 3.3 70B Instruct (FP8 Fast)

💬 Real-time Conversation – WebSocket-based live chat

🧠 Persistent Memory – Remembers context using Durable Objects

🪄 Stateful Agent – Manages sessions with Cloudflare Agents SDK

👤 Personalized Experience – Remembers names and preferences

⚙️ Command System – /name, /history, /clear for easy control

🏗️ Architecture

The assistant runs entirely on Cloudflare’s stack:

┌─────────────────────────────┐
│ Cloudflare Pages (Frontend) │
│  • Static UI + WebSocket    │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Cloudflare Worker (Backend) │
│  • WebSocket API (/agent)   │
│  • REST API (/api/info)     │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ SmartAssistant (DurableObj) │
│  • Memory + State Logic     │
│  • Connects to Workers AI   │
└────────────┬────────────────┘
             ▼
┌─────────────────────────────┐
│ Cloudflare Workers AI       │
│  • Llama 3.3 70B Instruct   │
└─────────────────────────────┘

Design Principles

All-in-Cloudflare: No external servers, databases, or APIs

Separation of Concerns: Pages for UI, Worker for logic, DO for memory

Scalable by Design: Handles millions of concurrent users

Low Latency: Inference and state at the edge

⚙️ Setup
Prerequisites

Node.js ≥ 18

Cloudflare account with Workers AI enabled

Wrangler CLI

Installation
git clone <repo-url>
cd cf_ai_smart_assistant
npm install
npx wrangler login

🧩 Local Development

Run both backend and frontend locally:

Backend (Worker):

npm run dev


→ http://localhost:8787
 (WebSocket endpoint: ws://localhost:8787/agent)

Frontend (Pages):

cd frontend
npx wrangler pages dev .


→ http://localhost:8788

Open the browser and start chatting.

Note: Some SDK features may behave differently in local mode.
For full reliability, deploy to Cloudflare.

🚀 Deployment

1️⃣ Deploy the Worker

npm run deploy


2️⃣ Update frontend config

// frontend/app.js
const API_ENDPOINT = 'wss://cf-ai-smart-assistant.YOUR-SUBDOMAIN.workers.dev/agent';


3️⃣ Deploy the Frontend

cd frontend
npx wrangler pages deploy . --project-name=cf-ai-smart-assistant


Your project will be live at:

Frontend: https://cf-ai-smart-assistant.pages.dev

Backend: https://cf-ai-smart-assistant.<your-subdomain>.workers.dev

💬 Usage
Commands
Command	Description	Example
/name <name>	Sets your name	/name Alice
/history	Displays chat history	/history
/clear	Clears memory	/clear
Example
User: Hello!
Assistant: Hi! I’m your Smart Assistant powered by Llama 3.3.

User: /name John
Assistant: Great! I’ll remember your name, John.

User: What’s the capital of France?
Assistant: Paris 🇫🇷

🔌 API Reference
WebSocket /agent

Send

{ "role": "user", "content": "Hello!" }


Receive

{ "role": "assistant", "content": "Hi there!" }

REST /api/info
{
  "name": "Smart Assistant",
  "model": "Llama 3.3 70B",
  "features": ["Memory", "Real-time Chat", "Personalization"],
  "commands": ["/name", "/history", "/clear"]
}

🧠 Technical Notes
State Management

Persistent conversation history via Durable Objects

Stores up to 20 recent messages

Data survives redeployments

Model Configuration

Model: @cf/meta/llama-3.3-70b-instruct-fp8-fast

Context: 20 messages

Temperature: Model default

Prompt Style: Helpful and natural

Performance
Metric	Value
Cold Start	< 500 ms
Inference Latency	1 – 3 s
Concurrency	Millions of sessions
Storage	Auto-trimmed to 20 messages