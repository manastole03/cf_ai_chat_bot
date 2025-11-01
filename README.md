🤖 Chat assistant

A **serverless AI chat assistant** built entirely on **Cloudflare Workers** and **Pages**.  
It uses **Durable Objects** to store chat memory and **Workers AI** for responses — no servers, no databases, no fuss.

---

## 🌟 Features

- 💬 Real-time chat (WebSocket)
- 🧠 Memory with Durable Objects
- ⚙️ Commands: `/name`, `/history`, `/clear`
- 🤖 Powered by **Llama 3.3 70B Instruct (FP8 Fast)**
- 🚀 100% Cloudflare-based — fast, scalable, and serverless

---

## 🏗️ Architecture


[ Cloudflare Pages ] → frontend (UI + WebSocket)
        ↓
[ Cloudflare Worker ] → API + chat logic
        ↓
[ Durable Object ] → memory + session state
        ↓
[ Workers AI ] → Llama 3.3 70B model


---

## ⚙️ Setup

### Prerequisites
- Node.js ≥ 18
- Cloudflare account (Workers AI enabled)
- Wrangler CLI installed

### Installation
```bash
git clone <repo-url>
cd cf_ai_smart_assistant
npm install
npx wrangler login

## 🧩 Local Development

### Start Backend
npm run dev

## Start Frontend
cd frontend
npx wrangler pages dev .

### 🚀 Deployment

##  Deploy Backend

npm run deploy

## Deploy Frontend

cd frontend
npx wrangler pages deploy . --project-name=cf-ai-smart-assistant

