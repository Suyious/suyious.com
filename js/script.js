// Mobile Menu
const hamburger = document.getElementById('hamburger');
const navOverlay = document.getElementById('nav-overlay');
const navLinks = document.getElementById('nav-links');
const navLinkItems = document.querySelectorAll('.nav-link');

function toggleMenu() {
    const isHidden = navOverlay.classList.contains('hidden');
    if (isHidden) {
        navOverlay.classList.remove('hidden');
        // subtle delay to allow display:block to apply before transition
        setTimeout(() => {
            navOverlay.classList.remove('translate-x-[150%]');
            navOverlay.classList.add('translate-x-0');
            navLinks.classList.remove('translate-x-[150%]');
            navLinks.classList.add('translate-x-0');
        }, 10);
    } else {
        navOverlay.classList.remove('translate-x-0');
        navOverlay.classList.add('translate-x-[150%]');
        navLinks.classList.remove('translate-x-0');
        navLinks.classList.add('translate-x-[150%]');
        setTimeout(() => {
            navOverlay.classList.add('hidden');
        }, 300);
    }
}

if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', toggleMenu);
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) { // Only on mobile
                toggleMenu();
            }
        });
    });
}

// Carousel Logic
class Carousel {
    constructor(trackId, prevId, nextId, itemSelector) {
        this.track = document.getElementById(trackId);
        this.prevBtn = document.getElementById(prevId);
        this.nextBtn = document.getElementById(nextId);
        this.items = this.track ? this.track.querySelectorAll(itemSelector) : [];

        this.offset = 0;
        this.transform = 0;
        this.capacity = 3; // Default capacity
        this.desiredCapacity = 3;

        this.init();
    }

    init() {
        if (!this.track) return;

        this.updateCapacity();
        window.addEventListener('resize', () => this.updateCapacity());

        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.scroll(1));
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.scroll(-1));

        this.updateControls();
    }

    updateCapacity() {
        const width = window.innerWidth;
        if (width < 768) this.capacity = 1;
        else if (width < 1024) this.capacity = 2;
        else this.capacity = 3; // Or derived from constructor if needed to be flexible

        // Update item widths based on capacity if needed, but Tailwind handles responsiveness mostly.
        // However, generic carousel needs to know how much to shift.
        // In the React code: width: ${100 / capacity}%
        // Here we rely on Tailwind classes w-full, md:w-1/2, lg:w-1/3 which matches 1, 2, 3.
        // So we just need to ensure our shift logic matches.

        // Re-clamp offset if capacity changed
        // if (this.offset < this.capacity - this.items.length) {
        //      this.offset = this.capacity - this.items.length;
        //      this.transform = this.offset * (100 / this.capacity);
        //      this.track.style.transform = `translateX(${this.transform}%)`;
        // }

        this.updateControls();
    }

    scroll(direction) {
        // direction: next: -1, prev: +1
        // checks boundaries
        if (direction === -1 && this.offset + direction < this.capacity - this.items.length) return;
        if (direction === 1 && this.offset + direction > 0) return;

        this.transform += direction * (100 / this.capacity);
        this.offset += direction;

        this.track.style.transform = `translateX(${this.transform}%)`;
        this.updateControls();
    }

    updateControls() {
        if (this.prevBtn) {
            if (this.offset === 0) this.prevBtn.classList.add('hidden');
            else this.prevBtn.classList.remove('hidden');
        }
        if (this.nextBtn) {
            if (this.capacity > this.items.length || this.offset === this.capacity - this.items.length) this.nextBtn.classList.add('hidden');
            else this.nextBtn.classList.remove('hidden');
        }
    }
}

// Initialize Carousels
// Projects Carousel
// Need to ensure capacity logic matches CSS breakpoints:
// sm: w-full (1), md: w-1/2 (2), lg: w-1/3 (3)
new Carousel('projects-track', 'projects-prev', 'projects-next', '#projects-track > div');

// ================================================================
// CHAT WIDGET
// ================================================================

const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatWindow = document.getElementById('chat-window');
const chatCloseBtn = document.getElementById('chat-close-btn');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');

let chatIsOpen = false;

function openChat() {
    chatIsOpen = true;
    chatWindow.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');

    // Hide floating toggle to prevent overlap with the chat window (crucial on mobile)
    chatToggleBtn.classList.add('hidden');

    // Prevent body scroll on mobile when chat is open
    if (window.innerWidth < 768) document.body.style.overflow = 'hidden';

    // Slight delay to allow transition before focus
    setTimeout(() => chatInput.focus(), 300);
}

function closeChat() {
    chatIsOpen = false;
    chatWindow.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');

    // Show toggle again
    chatToggleBtn.classList.remove('hidden');

    document.body.style.overflow = '';
}

chatToggleBtn.addEventListener('click', () => chatIsOpen ? closeChat() : openChat());
chatCloseBtn.addEventListener('click', closeChat);

// ── Message helpers ──────────────────────────────────────────────

function appendUserMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-message-user flex flex-col gap-1 items-end';
    wrapper.innerHTML = `
        <span class="text-[0.7em] font-bold opacity-50 uppercase tracking-wider mr-1">You</span>
        <div class="border-2 border-white bg-white text-primary text-[0.9em] font-bold leading-relaxed
                    rounded-[5px] px-4 py-3 max-w-[90%]">
            ${escapeHtml(text)}
        </div>`;
    chatMessages.appendChild(wrapper);
    scrollToBottom();
}

function appendBotMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-message-bot flex flex-col gap-1 items-start';
    wrapper.innerHTML = `
        <span class="text-[0.7em] font-bold opacity-50 uppercase tracking-wider ml-1">AI Assistant</span>
        <div class="border-2 border-white bg-transparent text-white text-[0.9em] font-medium leading-relaxed
                    rounded-[5px] px-4 py-3 max-w-[90%]">
            ${escapeHtml(text)}
        </div>`;
    chatMessages.appendChild(wrapper);
    scrollToBottom();
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'chat-typing-indicator';
    indicator.className = 'chat-message-bot flex flex-col gap-1 items-start';
    indicator.innerHTML = `
        <span class="text-[0.7em] font-bold opacity-50 uppercase tracking-wider ml-1">AI Assistant</span>
        <div class="border-2 border-white bg-transparent rounded-[5px] px-4 py-4 flex gap-1.5 items-center max-w-[90%]">
            <div class="chat-typing-dot bg-white"></div>
            <div class="chat-typing-dot bg-white"></div>
            <div class="chat-typing-dot bg-white"></div>
        </div>`;
    chatMessages.appendChild(indicator);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('chat-typing-indicator');
    if (indicator) indicator.remove();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── API Integration ──────────────────────────────────────────────
//
// Replace this function to wire up your real backend / LLM API.
// It receives the user's message string and must return a Promise
// that resolves to the bot's reply string.
//
// Example skeleton:
//   async function callChatAPI(userMessage) {
//       const response = await fetch('/api/chat', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ message: userMessage }),
//       });
//       const data = await response.json();
//       return data.reply;
//   }
//
async function callChatAPI(userMessage) {
    const response = await fetch('https://api-suyious-com.vercel.app/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
        throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.reply;
}

// ── Send logic ───────────────────────────────────────────────────

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    chatSendBtn.disabled = true;

    appendUserMessage(text);
    showTypingIndicator();

    try {
        const reply = await callChatAPI(text);
        removeTypingIndicator();
        appendBotMessage(reply);
    } catch (err) {
        removeTypingIndicator();
        appendBotMessage('Oops — something went wrong. Please try again.');
        console.error('[Chat] API error:', err);
    } finally {
        chatSendBtn.disabled = false;
        chatInput.focus();
    }
}

chatSendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
