# Quick Start Guide

## Project: cf_ai_smart_assistant

### What is this?

An AI-powered chat assistant built with:
- **Cloudflare Agents SDK** - Framework for AI agents
- **Workers AI** - Llama 3.3 70B model
- **Durable Objects** - Persistent conversation memory
- **WebSockets** - Real-time chat interface

### Assignment Requirements Met

✅ **LLM**: Llama 3.3 70B Instruct via Workers AI
✅ **Workflow/Coordination**: Cloudflare Workers + Agents SDK + Durable Objects
✅ **User Input**: Real-time WebSocket chat interface
✅ **Memory/State**: Durable Objects for conversation persistence
✅ **Naming**: Repository prefixed with `cf_ai_`
✅ **Documentation**: README.md with full instructions
✅ **AI Prompts**: PROMPTS.md with all prompts used

### Quick Commands

```bash
# Install dependencies
npm install

# Run locally (requires Cloudflare account + wrangler login)
npm run dev

# Deploy to Cloudflare
npm run deploy
```

### Before Running

1. **Cloudflare Account**: Sign up at https://dash.cloudflare.com
2. **Workers AI Access**: Enable in your dashboard
3. **Wrangler Auth**: Run `npx wrangler login`

### Project Structure

```
cf_ai_smart_assistant/
├── src/index.ts          # Main Worker + SmartAssistant Agent
├── wrangler.toml         # Cloudflare configuration
├── package.json          # Dependencies
├── README.md             # Full documentation
├── PROMPTS.md            # AI prompts used
└── .gitignore            # Git ignore rules
```

### Features

- Real-time AI chat powered by Llama 3.3
- Persistent conversation history across sessions
- User personalization (remembers your name)
- Special commands:
  - `/name <name>` - Set your name
  - `/history` - View conversation history
  - `/clear` - Clear conversation
- Auto-reconnecting WebSocket
- Modern, responsive UI

### Architecture

```
User Browser (WebSocket)
    ↓
Cloudflare Worker (routing)
    ↓
SmartAssistant Durable Object (Agent)
    ├─→ State storage (conversation history)
    └─→ Workers AI (Llama 3.3 70B)
```

### Next Steps

1. **Push to GitHub** with repository name starting with `cf_ai_`
2. **Test Locally**: Run `npm run dev` and visit http://localhost:8787
3. **Deploy**: Run `npm run deploy` to publish globally
4. **Submit**: Share your GitHub repository URL

### Testing Checklist

- [ ] Dependencies install successfully (`npm install`)
- [ ] Local dev server starts (`npm run dev`)
- [ ] WebSocket connects in browser
- [ ] AI responds to messages
- [ ] `/name` command persists across reconnects
- [ ] `/history` shows past messages
- [ ] `/clear` resets conversation
- [ ] Deployment succeeds (`npm run deploy`)

### Troubleshooting

**Issue**: `AI binding not found`
**Fix**: Enable Workers AI in Cloudflare dashboard

**Issue**: WebSocket fails
**Fix**: Ensure Durable Objects enabled, check browser console

**Issue**: Can't deploy
**Fix**: Run `npx wrangler login` first

### Documentation

- Full README: `README.md`
- AI Prompts: `PROMPTS.md`
- Cloudflare Agents: https://developers.cloudflare.com/agents/
- Workers AI: https://developers.cloudflare.com/workers-ai/

---

**Built with AI assistance as encouraged by the assignment**
