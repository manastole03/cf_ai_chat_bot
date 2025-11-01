// Configuration
const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.port === '8788';
const API_ENDPOINT = isLocalDev
    ? 'ws://127.0.0.1:8787/agent'  // Local development
    : 'wss://cf-ai-smart-assistant.YOUR-SUBDOMAIN.workers.dev/agent';  // Production

// State
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;

// DOM elements
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const statusDiv = document.getElementById('status');

/**
 * Connect to the WebSocket server
 */
function connect() {
    updateStatus('Connecting...', 'connecting');

    try {
        ws = new WebSocket(API_ENDPOINT);

        ws.onopen = handleOpen;
        ws.onmessage = handleMessage;
        ws.onerror = handleError;
        ws.onclose = handleClose;
    } catch (error) {
        console.error('WebSocket connection error:', error);
        updateStatus('Connection failed', 'error');
        scheduleReconnect();
    }
}

/**
 * WebSocket opened successfully
 */
function handleOpen() {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    updateStatus('Connected', 'connected');
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
}

/**
 * Received a message from the server
 */
function handleMessage(event) {
    try {
        const data = JSON.parse(event.data);

        if (data.role === 'assistant') {
            addMessage('assistant', data.content);
        }
    } catch (error) {
        console.error('Error parsing message:', error);
    }
}

/**
 * WebSocket error occurred
 */
function handleError(error) {
    console.error('WebSocket error:', error);
    updateStatus('Connection error', 'error');
}

/**
 * WebSocket connection closed
 */
function handleClose(event) {
    console.log('WebSocket closed', event.code, event.reason);
    messageInput.disabled = true;
    sendButton.disabled = true;

    if (event.code !== 1000) { // Not a normal closure
        updateStatus('Disconnected - Reconnecting...', 'error');
        scheduleReconnect();
    } else {
        updateStatus('Disconnected', 'error');
    }
}

/**
 * Schedule a reconnection attempt
 */
function scheduleReconnect() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Reconnecting... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(connect, RECONNECT_DELAY);
    } else {
        updateStatus('Connection failed. Please refresh the page.', 'error');
    }
}

/**
 * Update the status indicator
 */
function updateStatus(text, state) {
    statusDiv.textContent = text;
    statusDiv.className = 'status';

    if (state === 'connected') {
        statusDiv.classList.add('connected');
    } else if (state === 'error') {
        statusDiv.classList.add('error');
    }
}

/**
 * Add a message to the chat
 */
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(contentDiv);
    messagesDiv.appendChild(messageDiv);

    // Auto-scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/**
 * Send a message to the server
 */
function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
        addMessage('assistant', 'Not connected. Please wait for reconnection...');
        return;
    }

    // Send to server
    ws.send(JSON.stringify({
        role: 'user',
        content: message
    }));

    // Display user message
    addMessage('user', message);

    // Clear input
    messageInput.value = '';
    messageInput.focus();
}

/**
 * Handle send button click
 */
sendButton.addEventListener('click', sendMessage);

/**
 * Handle Enter key press
 */
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

/**
 * Initialize the application
 */
function init() {
    console.log('Smart Assistant initializing...');
    console.log('API Endpoint:', API_ENDPOINT);

    // Show helpful message if on production but endpoint not configured
    if (!isLocalDev && API_ENDPOINT.includes('YOUR-SUBDOMAIN')) {
        updateStatus('⚠️ Please configure API_ENDPOINT in app.js', 'error');
        addMessage('assistant', 'Setup required: Update the API_ENDPOINT in app.js with your Worker URL');
        return;
    }

    // Connect to WebSocket
    connect();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
