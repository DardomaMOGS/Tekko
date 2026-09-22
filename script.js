"use strict";

/* =========================================================
   TEKKO AI v2.0
   Browser Prototype
   ========================================================= */

/* =========================
   ELEMENTS
========================= */

const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const clearButton = document.getElementById("clearButton");
const newChatButton = document.getElementById("newChatButton");

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const closeSidebar = document.getElementById("closeSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const chatHistory = document.getElementById("chatHistory");
const searchChats = document.getElementById("searchChats");

const themeButton = document.getElementById("themeButton");

const settingsButton = document.getElementById("settingsButton");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");

const typingToggle = document.getElementById("typingToggle");
const historyToggle = document.getElementById("historyToggle");
const enterToggle = document.getElementById("enterToggle");

const deleteHistoryButton =
    document.getElementById("deleteHistoryButton");


/* =========================
   STORAGE
========================= */

const STORAGE = {
    chats: "tekko_v2_chats",
    theme: "tekko_v2_theme",
    settings: "tekko_v2_settings"
};


/* =========================
   STATE
========================= */

let chats = loadChats();

let currentChatId = null;

let conversation = [];

let isThinking = false;

let settings = loadSettings();


/* =========================
   DEFAULT SETTINGS
========================= */

function loadSettings() {

    const saved =
        localStorage.getItem(STORAGE.settings);

    if (!saved) {

        return {
            typing: true,
            history: true,
            enterToSend: true
        };

    }

    try {

        return {
            typing: saved.typing !== false,
            history: saved.history !== false,
            enterToSend: saved.enterToSend !== false
        };

    } catch {

        return {
            typing: true,
            history: true,
            enterToSend: true
        };
    }
}


/* =========================
   LOAD CHATS
========================= */

function loadChats() {

    const saved =
        localStorage.getItem(STORAGE.chats);

    if (!saved) return [];

    try {

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch {

        return [];
    }
}


/* =========================
   SAVE CHATS
========================= */

function saveChats() {

    if (!settings.history) return;

    localStorage.setItem(
        STORAGE.chats,
        JSON.stringify(chats)
    );
}


/* =========================
   SAVE SETTINGS
========================= */

function saveSettings() {

    localStorage.setItem(
        STORAGE.settings,
        JSON.stringify(settings)
    );
}


/* =========================
   CHAT ID
========================= */

function createId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .slice(2);
}


/* =========================
   NEW CHAT
========================= */

function startNewChat() {

    currentChatId = createId();

    conversation = [];

    renderWelcome();

    input.value = "";

    resizeInput();

    renderHistory();

    closeMobileSidebar();

    input.focus();
}


/* =========================
   WELCOME SCREEN
========================= */

function renderWelcome() {

    chat.innerHTML = `
        <div id="welcome" class="welcome">

            <div class="welcome-logo">
                T
            </div>

            <h2>Hey! I'm TEKKO 🤖</h2>

            <p>
                Your AI assistant, upgraded.
            </p>

            <div class="welcome-line">
                <span></span>
                <b>What can I help you with?</b>
                <span></span>
            </div>

            <div class="suggestions">

                <button class="suggestion"
                    data-message="Give me a cool project idea"
                    type="button">

                    <span>💡</span>

                    <div>
                        <strong>Project idea</strong>
                        <small>
                            Give me something cool to build
                        </small>
                    </div>

                </button>

                <button class="suggestion"
                    data-message="Help me with coding"
                    type="button">

                    <span>💻</span>

                    <div>
                        <strong>Coding</strong>
                        <small>
                            Help me build something
                        </small>
                    </div>

                </button>

                <button class="suggestion"
                    data-message="Tell me something interesting"
                    type="button">

                    <span>🧠</span>

                    <div>
                        <strong>Something interesting</strong>
                        <small>
                            Teach me something awesome
                        </small>
                    </div>

                </button>

                <button class="suggestion"
                    data-message="Give me a Roblox game idea"
                    type="button">

                    <span>🎮</span>

                    <div>
                        <strong>Roblox</strong>
                        <small>
                            Give me a game idea
                        </small>
                    </div>

                </button>

            </div>
        </div>
    `;

    setupSuggestions();
}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(text, role) {

    const row =
        document.createElement("div");

    row.className =
        "message-row " + role;

    const bubble =
        document.createElement("div");

    bubble.className =
        "message " +
        (role === "user"
            ? "user-message"
            : "ai-message");

    bubble.textContent = text;

    row.appendChild(bubble);

    chat.appendChild(row);

    scrollToBottom();

    return bubble;
}


/* =========================
   TYPING INDICATOR
========================= */

function addTypingIndicator() {

    const row =
        document.createElement("div");

    row.className =
        "message-row assistant";

    row.id =
        "typingIndicator";

    const bubble =
        document.createElement("div");

    bubble.className =
        "message ai-message";

    bubble.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    row.appendChild(bubble);

    chat.appendChild(row);

    scrollToBottom();
}


/* =========================
   REMOVE TYPING
========================= */

function removeTypingIndicator() {

    const indicator =
        document.getElementById(
            "typingIndicator"
        );

    if (indicator) {
        indicator.remove();
    }
}


/* =========================
   SCROLL
========================= */

function scrollToBottom() {

    requestAnimationFrame(() => {

        chat.scrollTo({
            top: chat.scrollHeight,
            behavior: "smooth"
        });

    });
}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage(text) {

    text = text.trim();

    if (!text || isThinking) return;

    const welcome =
        document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }

    addMessage(text, "user");

    conversation.push({
        role: "user",
        content: text
    });

    input.value = "";

    resizeInput();

    isThinking = true;

    input.disabled = true;
    sendButton.disabled = true;

    addTypingIndicator();

    await wait(650);

    removeTypingIndicator();

    const response =
        generateLocalResponse(text);

    if (settings.typing) {

        const bubble =
            addMessage("", "assistant");

        await typeResponse(
            bubble,
            response
        );

    } else {

        addMessage(
            response,
            "assistant"
        );

    }

    conversation.push({
        role: "assistant",
        content: response
    });

    saveCurrentChat();

    isThinking = false;

    input.disabled = false;
    sendButton.disabled = false;

    input.focus();

    renderHistory();
}


/* =========================
   TYPE RESPONSE
========================= */

function typeResponse(element, text) {

    return new Promise(resolve => {

        let index = 0;

        const speed = 12;

        function type() {

            if (index >= text.length) {

                resolve();

                return;
            }

            element.textContent +=
                text[index];

            index++;

            scrollToBottom();

            setTimeout(type, speed);
        }

        type();

    });
}


/* =========================
   WAIT
========================= */

function wait(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });
}


/* =========================
   SAVE CURRENT CHAT
========================= */

function saveCurrentChat() {

    if (!settings.history) return;

    if (conversation.length === 0) return;

    const firstUserMessage =
        conversation.find(
            message =>
                message.role === "user"
        );

    const title =
        firstUserMessage
            ? firstUserMessage.content
            : "New Chat";

    const existing =
        chats.find(
            chatItem =>
                chatItem.id === currentChatId
        );

    if (existing) {

        existing.title = title;

        existing.messages =
            conversation;

        existing.updated =
            Date.now();

    } else {

        chats.unshift({

            id: currentChatId,

            title: title,

            messages: conversation,

            updated: Date.now()

        });

    }

    chats =
        chats
            .sort(
                (a, b) =>
                    b.updated - a.updated
            )
            .slice(0, 50);

    saveChats();
}


/* =========================
   LOAD CHAT
========================= */

function loadChat(id) {

    const selected =
        chats.find(
            item => item.id === id
        );

    if (!selected) return;

    currentChatId =
        selected.id;

    conversation =
        Array.isArray(selected.messages)
            ? selected.messages
            : [];

    chat.innerHTML = "";

    conversation.forEach(message => {

        addMessage(
            message.content,
            message.role === "user"
                ? "user"
                : "assistant"
        );

    });

    renderHistory();

    closeMobileSidebar();

    input.focus();
}


/* =========================
   HISTORY
========================= */

function renderHistory() {

    chatHistory.innerHTML = "";

    if (!settings.history) {

        chatHistory.innerHTML = `
            <div class="history-empty">
                Chat history is disabled.
            </div>
        `;

        return;
    }

    const query =
        searchChats.value
            .toLowerCase()
            .trim();

    const filtered =
        chats.filter(chatItem =>
            chatItem.title
                .toLowerCase()
                .includes(query)
        );

    if (filtered.length === 0) {

        chatHistory.innerHTML = `
            <div class="history-empty">
                No saved chats yet.
            </div>
        `;

        return;
    }

    filtered.forEach(chatItem => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "history-item" +
            (
                chatItem.id === currentChatId
                    ? " active"
                    : ""
            );

        button.innerHTML = `
            <span class="history-icon">💬</span>
            <span class="history-text"></span>
        `;

        button
            .querySelector(".history-text")
            .textContent =
                chatItem.title;

        button.addEventListener(
            "click",
            () => loadChat(chatItem.id)
        );

        chatHistory.appendChild(button);

    });
}


/* =========================
   DELETE HISTORY
========================= */

function deleteAllHistory() {

    chats = [];

    currentChatId = createId();

    conversation = [];

    localStorage.removeItem(
        STORAGE.chats
    );

    renderHistory();

    renderWelcome();

    input.focus();
}


/* =========================
   CLEAR CURRENT CHAT
========================= */

function clearCurrentChat() {

    conversation = [];

    currentChatId = createId();

    renderWelcome();

    renderHistory();

    input.value = "";

    resizeInput();

    input.focus();
}


/* =========================
   SUGGESTIONS
========================= */

function setupSuggestions() {

    const buttons =
        document.querySelectorAll(
            ".suggestion"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const message =
                    button.dataset.message;

                if (!message) return;

                input.value =
                    message;

                resizeInput();

                input.focus();

            }
        );

    });
}


/* =========================
   INPUT SIZE
========================= */

function resizeInput() {

    input.style.height =
        "auto";

    input.style.height =
        Math.min(
            input.scrollHeight,
            150
        ) + "px";
}


/* =========================
   FORM
========================= */

form.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        sendMessage(
            input.value
        );

    }
);


/* =========================
   ENTER KEY
========================= */

input.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            settings.enterToSend
        ) {

            event.preventDefault();

            form.requestSubmit();

        }

    }
);


/* =========================
   INPUT EVENT
========================= */

input.addEventListener(
    "input",
    resizeInput
);


/* =========================
   LOCAL AI RESPONSE ENGINE
========================= */

function generateLocalResponse(text) {

    const message =
        text.toLowerCase().trim();


    /* GREETINGS */

    if (
        /^(hi|hello|hey|yo|hiya|sup)\b/
            .test(message)
    ) {

        return "Heyyy! 👋😎 I'm TEKKO v2.0. What are we building today?";

    }


    /* IDENTITY */

    if (
        message.includes("who are you") ||
        message.includes("what are you")
    ) {

        return "I'm TEKKO AI v2.0 🤖 — a browser-based AI assistant prototype with chat history, themes, typing effects, settings, and a futuristic interface.";

    }


    /* TEKKO */

    if (
        message.includes("tekko")
    ) {

        return "TEKKO online. 🤖⚡ Systems ready. Give me something to build!";

    }


    /* CODING */

    if (
        message.includes("code") ||
        message.includes("coding") ||
        message.includes("program") ||
        message.includes("javascript") ||
        message.includes("html") ||
        message.includes("css")
    ) {

        return "💻 CODING MODE ACTIVATED!\n\nTell me what you want to build, what language you're using, and what you want it to do. I can help you plan the project and work through the code.";

    }


    /* ROBLOX */

    if (
        message.includes("roblox")
    ) {

        return "🎮 Roblox detected!\n\nIdeas you could build:\n• Tycoon\n• Simulator\n• Obby\n• Tower defense\n• Racing game\n• Horror game\n• Mini-game collection\n\nIf you're making a YouTube video, you could also turn the project into a challenge.";

    }


    /* PROJECT */

    if (
        message.includes("project") ||
        message.includes("idea")
    ) {

        return "💡 Here's a cool idea:\n\nBuild a browser-based mini operating system with apps, games, settings, files, a notes app, and TEKKO built directly into the desktop. 👀\n\nBasically... your own tiny computer inside a website.";

    }


    /* SCHOOL */

    if (
        message.includes("school") ||
        message.includes("homework") ||
        message.includes("study")
    ) {

        return "📚 Study mode activated!\n\nSend me the exact question or topic you're working on and I can explain it step-by-step.";

    }


    /* YOUTUBE */

    if (
        message.includes("youtube") ||
        message.includes("video") ||
        message.includes("thumbnail")
    ) {

        return "📺 CREATOR MODE!\n\nA strong Roblox video usually needs:\n\n1. A clear idea\n2. An interesting opening\n3. Fast pacing\n4. Funny or surprising moments\n5. A satisfying ending\n\nAnd don't forget the thumbnail! 👀";

    }


    /* GAMES */

    if (
        message.includes("game")
    ) {

        return "🎮 Game idea:\n\n'Upgrade Everything' — players start with almost nothing and constantly upgrade their base, tools, speed, money system, and abilities.\n\nAdd random events to keep every round different. ⚡";

    }


    /* HELP */

    if (
        message.includes("help") ||
        message.includes("how do i") ||
        message.includes("can you")
    ) {

        return "Absolutely! 🧠 Tell me exactly what you're trying to do, and we'll figure out the next step together.";

    }


    /* THANKS */

    if (
        message.includes("thank")
    ) {

        return "You're welcome! 😎⚡";

    }


    /* BYE */

    if (
        message === "bye" ||
        message.includes("goodbye")
    ) {

        return "See you later! 👋 TEKKO will be here.";

    }


    /* RANDOM FALLBACKS */

    const responses = [

        "Interesting... 👀 Tell me more about that.",

        "Hmm. 🧠 Let's think about this together.",

        "That's actually pretty interesting! ⚡",

        "I'm listening. 👀 What happens next?",

        "TEKKO is processing that... 🤖",

        "Okayyy, I see where you're going with this. 😎",

        "That's a cool idea. Let's build on it! 🔥",

        "Got it! What would you like to do with that?",

        "Interesting question! 🧠 Let's break it down."

    ];

    return responses[
        Math.floor(
            Math.random() *
            responses.length
        )
    ];
}


/* =========================
   THEME
========================= */

function applyTheme(theme) {

    if (theme === "light") {

        document.body.classList.add(
            "light"
        );

    } else {

        document.body.classList.remove(
            "light"
        );

    }

    localStorage.setItem(
        STORAGE.theme,
        theme
    );
}


function toggleTheme() {

    const isLight =
        document.body.classList.contains(
            "light"
        );

    applyTheme(
        isLight
            ? "dark"
            : "light"
    );
}


/* =========================
   MOBILE SIDEBAR
========================= */

function openMobileSidebar() {

    sidebar.classList.add("open");

}


function closeMobileSidebar() {

    sidebar.classList.remove("open");

}


/* =========================
   SETTINGS
========================= */

function openSettings() {

    settingsModal.classList.remove(
        "hidden"
    );

}


function closeSettingsModal() {

    settingsModal.classList.add(
        "hidden"
    );

}


/* =========================
   SETTINGS CONTROLS
========================= */

typingToggle.checked =
    settings.typing;

historyToggle.checked =
    settings.history;

enterToggle.checked =
    settings.enterToSend;


typingToggle.addEventListener(
    "change",
    () => {

        settings.typing =
            typingToggle.checked;

        saveSettings();

    }
);


historyToggle.addEventListener(
    "change",
    () => {

        settings.history =
            historyToggle.checked;

        saveSettings();

        renderHistory();

    }
);


enterToggle.addEventListener(
    "change",
    () => {

        settings.enterToSend =
            enterToggle.checked;

        saveSettings();

    }
);


/* =========================
   BUTTON EVENTS
========================= */

form.addEventListener(
    "submit",
    event => {
        event.preventDefault();
    }
);


/* Re-register actual sending listener */

form.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        sendMessage(
            input.value
        );

    }
);


clearButton.addEventListener(
    "click",
    clearCurrentChat
);


newChatButton.addEventListener(
    "click",
    startNewChat
);


themeButton.addEventListener(
    "click",
    toggleTheme
);


settingsButton.addEventListener(
    "click",
    openSettings
);


closeSettings.addEventListener(
    "click",
    closeSettingsModal
);


deleteHistoryButton.addEventListener(
    "click",
    deleteAllHistory
);


menuButton.addEventListener(
    "click",
    openMobileSidebar
);


closeSidebar.addEventListener(
    "click",
    closeMobileSidebar
);


sidebarOverlay.addEventListener(
    "click",
    closeMobileSidebar
);


searchChats.addEventListener(
    "input",
    renderHistory
);


/* =========================
   MODAL OUTSIDE CLICK
========================= */

settingsModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            settingsModal
        ) {

            closeSettingsModal();

        }

    }
);


/* =========================
   ESCAPE
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape")
            return;

        closeMobileSidebar();

        closeSettingsModal();

    }
);


/* =========================
   STARTUP
========================= */

const savedTheme =
    localStorage.getItem(
        STORAGE.theme
    );

applyTheme(
    savedTheme || "dark"
);

currentChatId =
    createId();

renderHistory();

resizeInput();

setupSuggestions();

input.focus();

console.log(
    "🤖 TEKKO AI v2.0 loaded successfully!"
);
