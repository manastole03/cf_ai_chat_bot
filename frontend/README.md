# Frontend - Cloudflare Pages

This directory contains the static frontend for the Smart Assistant application, deployed on **Cloudflare Pages**.

## Structure

```
frontend/
├── index.html      # Main HTML page
├── styles.css      # Application styles
├── app.js          # WebSocket client and UI logic
└── _headers        # Cloudflare Pages headers configuration
```

## Local Development

### Option 1: Using Wrangler Pages (Recommended)

```bash
cd frontend
npx wrangler pages dev .
```

This starts a local server at `http://localhost:8788`

### Option 2: Using any static server

```bash
cd frontend
python3 -m http.server 8788
# or
npx serve -p 8788
```

**Important**: Update `API_ENDPOINT` in `app.js` to point to your Worker:
- Local: `ws://localhost:8787/agent`
- Production: `wss://cf-ai-smart-assistant.YOUR-SUBDOMAIN.workers.dev/agent`

## Deployment to Cloudflare Pages

### Method 1: Using Wrangler CLI

```bash
cd frontend
npx wrangler pages deploy . --project-name=cf-ai-smart-assistant
```

### Method 2: Via Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Navigate to **Pages**
3. Click **Create a project**
4. Connect your GitHub repository
5. Set build configuration:
   - **Build command**: (leave empty - static files)
   - **Build output directory**: `frontend`
6. Deploy

### Method 3: Git Integration

1. Push your code to GitHub
2. In Cloudflare Dashboard → Pages → **Create a project**
3. Select your repository
4. Set **Root directory**: `frontend`
5. Deploy

## After Deployment

1. Note your Pages URL (e.g., `https://cf-ai-smart-assistant.pages.dev`)
2. Update `API_ENDPOINT` in `app.js` with your Worker URL
3. Redeploy Pages
4. Update CORS allowed origins in `src/index.ts` if using custom domain

## Features

- **Real-time WebSocket** connection to Worker backend
- **Auto-reconnect** logic for dropped connections
- **Responsive design** works on mobile and desktop
- **Security headers** configured via `_headers` file
- **Static caching** for CSS/JS files

## Configuration

Edit `app.js` to configure:

```javascript
const API_ENDPOINT = 'wss://your-worker-url.workers.dev/agent';
```

## Testing

1. Ensure Worker is running (`npm run dev` in root)
2. Start Pages dev server
3. Open http://localhost:8788
4. Verify WebSocket connection status shows "Connected"
5. Test chat functionality
