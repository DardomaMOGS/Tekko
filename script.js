"use strict";

/* =========================================================
   TEKKO AI v3.5
   Browser Prototype
   ========================================================= */

const $ = id => document.getElementById(id);

const STORAGE = {
  chats: "tekko_v35_chats",
  settings: "tekko_v35_settings",
  theme: "tekko_v35_theme"
};

let chats = JSON.parse(localStorage.getItem(STORAGE.chats) || "[]");

let settings = JSON.parse(
  localStorage.getItem(STORAGE.settings) ||
  JSON.stringify({
    typing: true,
    history: true,
    enter: true
  })
);

let currentChat = null;
let currentMode = "General";

/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadTheme();
  loadSettings();
  renderChatList();

  if (chats.length > 0 && settings.history) {
    openChat(chats[0].id);
  } else {
    createNewChat(false);
  }

  setupEvents();

});

/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

  $("newChat").addEventListener("click", () => {
    createNewChat(true);
  });

  $("sendButton").addEventListener("click", sendMessage);

  $("messageInput").addEventListener("keydown", e => {

    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      settings.enter
    ) {
      e.preventDefault();
      sendMessage();
    }

  });

  $("messageInput").addEventListener("input", autoResize);

  $("chatSearch").addEventListener("input", renderChatList);

  $("themeButton").addEventListener("click", toggleTheme);

  $("settingsButton").addEventListener("click", () => {
    $("settingsOverlay").classList.remove("hidden");
  });

  $("closeSettings").addEventListener("click", () => {
    $("settingsOverlay").classList.add("hidden");
  });

  $("clearChat").addEventListener("click", clearCurrentChat);

  $("deleteHistory").addEventListener("click", deleteHistory);

  $("mobileMenu").addEventListener("click", () => {
    $("sidebar").classList.toggle("open");
  });

  $("imageButton").addEventListener("click", openImagePanel);

  $("closeImagePanel").addEventListener("click", closeImagePanel);

  $("generateImage").addEventListener("click", createImage);

  $("typingSetting").addEventListener("change", saveSettings);

  $("historySetting").addEventListener("change", saveSettings);

  $("enterSetting").addEventListener("change", saveSettings);

  document.querySelectorAll(".mode-card").forEach(card => {

    card.addEventListener("click", () => {

      const mode = card.dataset.mode;

      if (mode === "Image") {
        openImagePanel();
        return;
      }

      currentMode = mode;

      $("messageInput").placeholder =
        `${mode} mode — Message TEKKO...`;

      $("messageInput").focus();

    });

  });

}

/* =========================================================
   CHAT CREATION
   ========================================================= */

function createNewChat(save = true) {

  const chat = {
    id: Date.now().toString(),
    title: "New Chat",
    mode: "General",
    messages: []
  };

  currentChat = chat;

  if (save && settings.history) {
    chats.unshift(chat);
    saveChats();
  }

  $("messages").innerHTML = "";
  $("welcome").classList.remove("hidden");

  renderChatList();

}

/* =========================================================
   OPEN CHAT
   ========================================================= */

function openChat(id) {

  const chat = chats.find(c => c.id === id);

  if (!chat) return;

  currentChat = chat;
  currentMode = chat.mode || "General";

  $("welcome").classList.toggle(
    "hidden",
    chat.messages.length > 0
  );

  $("messages").innerHTML = "";

  chat.messages.forEach(message => {

    renderMessage(
      message.role,
      message.text,
      false
    );

  });

  renderChatList();

  $("sidebar").classList.remove("open");

}

/* =========================================================
   SEND MESSAGE
   ========================================================= */

function sendMessage() {

  const input = $("messageInput");
  const text = input.value.trim();

  if (!text) return;

  if (!currentChat) {
    createNewChat(true);
  }

  $("welcome").classList.add("hidden");

  addMessage("user", text);

  input.value = "";
  autoResize();

  const typing = showTyping();

  setTimeout(() => {

    typing.remove();

    const response = generateResponse(text);

    addMessage("ai", response);

  }, settings.typing ? 700 : 100);

}

/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(role, text) {

  if (!currentChat) return;

  currentChat.messages.push({
    role,
    text
  });

  if (
    currentChat.title === "New Chat" &&
    role === "user"
  ) {
    currentChat.title =
      text.length > 30
        ? text.substring(0, 30) + "..."
        : text;
  }

  if (settings.history) {
    saveChats();
  }

  renderMessage(role, text, true);
  renderChatList();

}

/* =========================================================
   RENDER MESSAGE
   ========================================================= */

function renderMessage(role, text, scroll = true) {

  const wrapper = document.createElement("div");

  wrapper.className =
    `message ${role === "user" ? "user" : "ai"}`;

  const content = document.createElement("div");

  const bubble = document.createElement("div");

  bubble.className = "bubble";

  bubble.textContent = text;

  content.appendChild(bubble);

  if (role === "ai") {

    const actions = document.createElement("div");

    actions.className = "message-actions";

    const copy = document.createElement("button");

    copy.textContent = "📋 Copy";

    copy.addEventListener("click", () => {
      navigator.clipboard.writeText(text);
      copy.textContent = "✓ Copied";

      setTimeout(() => {
        copy.textContent = "📋 Copy";
      }, 1200);
    });

    const regenerate = document.createElement("button");

    regenerate.textContent = "↻ Regenerate";

    regenerate.addEventListener("click", () => {

      const response = generateResponse(
        getLastUserMessage()
      );

      addMessage("ai", response);

    });

    actions.appendChild(copy);
    actions.appendChild(regenerate);

    content.appendChild(actions);

  }

  wrapper.appendChild(content);

  $("messages").appendChild(wrapper);

  if (scroll) {
    $("chatArea").scrollTop =
      $("chatArea").scrollHeight;
  }

}

/* =========================================================
   TYPING
   ========================================================= */

function showTyping() {

  const wrapper = document.createElement("div");

  wrapper.className = "message ai";

  const bubble = document.createElement("div");

  bubble.className = "bubble typing";

  bubble.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  wrapper.appendChild(bubble);

  $("messages").appendChild(wrapper);

  $("chatArea").scrollTop =
    $("chatArea").scrollHeight;

  return wrapper;

}

/* =========================================================
   LOCAL RESPONSE ENGINE
   ========================================================= */

function generateResponse(input) {

  const text = input.toLowerCase();

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey")
  ) {
    return `Hey! 👋 I'm TEKKO AI v3.5.

I'm ready to help with coding, Roblox, studying, YouTube ideas, projects, or just a normal conversation.`;
  }

  if (
    text.includes("who are you") ||
    text.includes("what are you")
  ) {
    return `I'm TEKKO AI v3.5 🤖

Your AI. Your way.

This browser version includes chat history, modes, settings, image creation UI, copying, regeneration, and more.`;
  }

  if (
    text.includes("code") ||
    text.includes("javascript") ||
    text.includes("html") ||
    text.includes("css") ||
    text.includes("python")
  ) {
    return `💻 CODING MODE

I can help you build websites, JavaScript projects, HTML/CSS interfaces, Python programs, and debug code.

Tell me what you're trying to build and what isn't working.`;
  }

  if (
    text.includes("roblox") ||
    text.includes("lua")
  ) {
    return `🎮 ROBLOX MODE

I can help with Roblox Studio ideas, Lua scripting, game mechanics, UI ideas, maps, and game-development planning.

What's the Roblox project you're working on?`;
  }

  if (
    text.includes("youtube") ||
    text.includes("video") ||
    text.includes("thumbnail")
  ) {
    return `🎬 CREATOR MODE

I can help with:

• Video ideas
• Titles
• Thumbnails
• Shorts
• Captions
• Video structure
• Roblox content ideas

Let's make something awesome. 🔥`;
  }

  if (
    text.includes("school") ||
    text.includes("study") ||
    text.includes("homework")
  ) {
    return `📚 STUDY MODE

I can explain school topics, work through exercises, help organize assignments, and make difficult concepts easier to understand.

Send me the topic or exercise.`;
  }

  if (
    text.includes("project") ||
    text.includes("website")
  ) {
    return `🚀 PROJECT MODE

Let's build it step by step.

I can help with:
• Planning
• UI design
• HTML
• CSS
• JavaScript
• Features
• Debugging
• Publishing

Tell me what you're building.`;
  }

  if (
    text.includes("image") ||
    text.includes("draw") ||
    text.includes("picture")
  ) {
    return `🎨 TEKKO can prepare an image-generation prompt for your idea.

Use the 🎨 button beside the message box to open the image creator.`;
  }

  if (
    text.includes("thank")
  ) {
    return `You're welcome! 😎🤖`;
  }

  if (
    text.includes("bye")
  ) {
    return `See you later! 👋`;
  }

  return `I understand! 🤖

You said:

"${input}"

In the full AI-powered version of TEKKO, this is where the real AI model would generate a detailed response.

For now, you can try asking about coding, Roblox, YouTube, studying, projects, or image creation.`;
}

/* =========================================================
   IMAGE CREATION UI
   ========================================================= */

function openImagePanel() {

  $("imagePanel").classList.remove("hidden");

  $("imagePrompt").focus();

}

function closeImagePanel() {

  $("imagePanel").classList.add("hidden");

}

function createImage() {

  const prompt = $("imagePrompt").value.trim();

  if (!prompt) {

    $("imageResult").innerHTML = `
      <div class="image-placeholder">
        ✏️ Enter an image description first.
      </div>
    `;

    return;
  }

  const style = $("imageStyle").value;
  const ratio = $("imageRatio").value;

  $("imageResult").innerHTML = `
    <div class="image-placeholder">
      <strong>🎨 Image request prepared!</strong>
      <br><br>
      Prompt: ${escapeHTML(prompt)}
      <br>
      Style: ${escapeHTML(style)}
      <br>
      Size: ${escapeHTML(ratio)}
      <br><br>
      <small>
        Real image generation will be connected through
        TEKKO's secure AI backend.
      </small>
    </div>
  `;

}

/* =========================================================
   CHAT LIST
   ========================================================= */

function renderChatList() {

  const list = $("chatList");

  list.innerHTML = "";

  const query =
    $("chatSearch").value.toLowerCase();

  chats
    .filter(chat =>
      chat.title.toLowerCase().includes(query)
    )
    .forEach(chat => {

      const button = document.createElement("button");

      button.className =
        "chat-item" +
        (
          currentChat &&
          currentChat.id === chat.id
            ? " active"
            : ""
        );

      button.textContent =
        `${chat.mode === "Image" ? "🎨" : "💬"} ${chat.title}`;

      button.addEventListener("click", () => {
        openChat(chat.id);
      });

      list.appendChild(button);

    });

}

/* =========================================================
   CLEAR CHAT
   ========================================================= */

function clearCurrentChat() {

  if (!currentChat) return;

  currentChat.messages = [];
  currentChat.title = "New Chat";

  $("messages").innerHTML = "";

  $("welcome").classList.remove("hidden");

  saveChats();
  renderChatList();

}

/* =========================================================
   DELETE HISTORY
   ========================================================= */

function deleteHistory() {

  localStorage.removeItem(STORAGE.chats);

  chats = [];

  createNewChat(false);

  $("settingsOverlay").classList.add("hidden");

  renderChatList();

}

/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettings() {

  $("typingSetting").checked =
    settings.typing;

  $("historySetting").checked =
    settings.history;

  $("enterSetting").checked =
    settings.enter;

}

function saveSettings() {

  settings.typing =
    $("typingSetting").checked;

  settings.history =
    $("historySetting").checked;

  settings.enter =
    $("enterSetting").checked;

  localStorage.setItem(
    STORAGE.settings,
    JSON.stringify(settings)
  );

  if (!settings.history) {
    localStorage.removeItem(STORAGE.chats);
  }

}

/* =========================================================
   THEME
   ========================================================= */

function loadTheme() {

  const theme =
    localStorage.getItem(STORAGE.theme);

  if (theme === "light") {
    document.body.classList.add("light");
  }

}

function toggleTheme() {

  document.body.classList.toggle("light");

  const light =
    document.body.classList.contains("light");

  localStorage.setItem(
    STORAGE.theme,
    light ? "light" : "dark"
  );

}

/* =========================================================
   SAVE
   ========================================================= */

function saveChats() {

  localStorage.setItem(
    STORAGE.chats,
    JSON.stringify(chats)
  );

}

/* =========================================================
   HELPERS
   ========================================================= */

function getLastUserMessage() {

  if (!currentChat) return "";

  const messages =
    currentChat.messages;

  for (let i = messages.length - 1; i >= 0; i--) {

    if (messages[i].role === "user") {
      return messages[i].text;
    }

  }

  return "";

}

function autoResize() {

  const input = $("messageInput");

  input.style.height = "auto";

  input.style.height =
    Math.min(input.scrollHeight, 150) + "px";

}

function escapeHTML(text) {

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
