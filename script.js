"use strict";

/* =========================================
   TEKKO AI v1.0
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const chat =
    document.getElementById("chat");

const form =
    document.getElementById("chatForm");

const input =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const clearButton =
    document.getElementById("clearButton");


/* =========================================
   STATE
========================================= */

let conversation = [];

let isThinking = false;


/* =========================================
   ADD MESSAGE
========================================= */

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
}


/* =========================================
   SCROLL TO BOTTOM
========================================= */

function scrollToBottom() {

    requestAnimationFrame(() => {

        chat.scrollTo({
            top: chat.scrollHeight,
            behavior: "smooth"
        });

    });
}


/* =========================================
   REMOVE WELCOME SCREEN
========================================= */

function removeWelcome() {

    const welcome =
        document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }
}


/* =========================================
   SEND MESSAGE
========================================= */

function sendMessage(text) {

    text = text.trim();


    if (!text || isThinking) {
        return;
    }


    removeWelcome();


    addMessage(
        text,
        "user"
    );


    conversation.push({
        role: "user",
        content: text
    });


    input.value = "";

    resizeInput();


    /* Disable input while TEKKO responds */

    isThinking = true;

    input.disabled = true;

    sendButton.disabled = true;


    /*
        This is currently a local prototype.
        Later, this function can send the
        conversation to a secure AI backend.
    */

    setTimeout(() => {

        const response =
            generateLocalResponse(text);


        addMessage(
            response,
            "assistant"
        );


        conversation.push({
            role: "assistant",
            content: response
        });


        isThinking = false;

        input.disabled = false;

        sendButton.disabled = false;

        input.focus();

    }, 650);
}


/* =========================================
   FORM SUBMIT
========================================= */

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        sendMessage(
            input.value
        );

    }
);


/* =========================================
   ENTER TO SEND
========================================= */

input.addEventListener(
    "keydown",
    function(event) {

        /*
            Enter = send
            Shift + Enter = new line
        */

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            form.requestSubmit();
        }

    }
);


/* =========================================
   AUTO RESIZE
========================================= */

function resizeInput() {

    input.style.height =
        "auto";

    input.style.height =
        Math.min(
            input.scrollHeight,
            150
        ) + "px";
}


input.addEventListener(
    "input",
    resizeInput
);


/* =========================================
   SUGGESTION BUTTONS
========================================= */

function setupSuggestions() {

    const buttons =
        document.querySelectorAll(
            ".suggestion"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const message =
                    button.dataset.message;

                if (!message) {
                    return;
                }

                input.value =
                    message;

                resizeInput();

                input.focus();

            }
        );

    });
}


setupSuggestions();


/* =========================================
   CLEAR CHAT
========================================= */

clearButton.addEventListener(
    "click",
    function() {

        conversation = [];

        isThinking = false;

        input.disabled = false;

        sendButton.disabled = false;


        chat.innerHTML = `

            <section
                id="welcome"
                class="welcome"
            >

                <div class="welcome-logo">
                    T
                </div>

                <h2>
                    Hey! I'm TEKKO 🤖
                </h2>

                <p>
                    Your personal AI assistant.
                </p>

                <div class="suggestions">

                    <button
                        class="suggestion"
                        data-message="Give me a cool project idea"
                        type="button"
                    >
                        💡 Give me an idea
                    </button>

                    <button
                        class="suggestion"
                        data-message="Help me with coding"
                        type="button"
                    >
                        💻 Help with coding
                    </button>

                    <button
                        class="suggestion"
                        data-message="Tell me something interesting"
                        type="button"
                    >
                        🧠 Tell me something
                    </button>

                </div>

            </section>

        `;


        setupSuggestions();

        input.value = "";

        resizeInput();

        input.focus();

    }
);


/* =========================================
   LOCAL TEKKO BRAIN
========================================= */

function generateLocalResponse(text) {

    const message =
        text.toLowerCase().trim();


    /* Greetings */

    if (
        message.includes("hello") ||
        message.includes("hi") ||
        message.includes("hey")
    ) {

        return (
            "Hey! 👋 I'm TEKKO. " +
            "What are we building today?"
        );

    }


    /* Identity */

    if (
        message.includes("who are you") ||
        message.includes("what are you")
    ) {

        return (
            "I'm TEKKO AI v1.0 🤖 — " +
            "a browser-based AI assistant prototype."
        );

    }


    /* Coding */

    if (
        message.includes("code") ||
        message.includes("coding") ||
        message.includes("program") ||
        message.includes("javascript") ||
        message.includes("html") ||
        message.includes("css")
    ) {

        return (
            "💻 Coding mode activated! " +
            "Tell me what you want to build, " +
            "and I'll help you plan it."
        );

    }


    /* Roblox */

    if (
        message.includes("roblox")
    ) {

        return (
            "🎮 Roblox detected! " +
            "You could build a simulator, " +
            "tycoon, obby, horror game, " +
            "or even your own mini-game."
        );

    }


    /* Projects */

    if (
        message.includes("idea") ||
        message.includes("project")
    ) {

        return (
            "💡 Project idea: build a browser " +
            "desktop OS with apps, games, " +
            "settings, files, and TEKKO as " +
            "the built-in AI assistant."
        );

    }


    /* Help */

    if (
        message.includes("help")
    ) {

        return (
            "Absolutely! 🧠 Tell me what you're " +
            "working on and I'll help you figure " +
            "out the next step."
        );

    }


    /* Thanks */

    if (
        message.includes("thank")
    ) {

        return (
            "You're welcome! 😎"
        );

    }


    /* Goodbye */

    if (
        message === "bye" ||
        message.includes("goodbye")
    ) {

        return (
            "See you later! 👋"
        );

    }


    /* Random fallback */

    const responses = [

        "Interesting! 🤔 Tell me more.",

        "I'm listening! 👀",

        "That's a cool idea! 🔥",

        "Hmm... let's figure this out together. 🧠",

        "TEKKO is thinking... 🤖",

        "I like where this is going! ⚡",

        "That's interesting! Let's explore it."

    ];


    const randomIndex =
        Math.floor(
            Math.random() *
            responses.length
        );


    return responses[randomIndex];
}


/* =========================================
   STARTUP
========================================= */

console.log(
    "🤖 TEKKO AI v1.0 loaded successfully!"
);

input.focus();
