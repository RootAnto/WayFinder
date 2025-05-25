function toggleChat(event) {
    if (event) {
        event.stopPropagation();
    }
    const chat = document.getElementById('chat-container');
    chat.classList.toggle('hidden');
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message === "") return;

    addMessage("user", message);
    input.value = "";

    try {
        const response = await fetch('http://127.0.0.1:8000/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message }),
        });

        const data = await response.json();
        addMessage("bot", data.reply);
    } catch (error) {
        addMessage("bot", "Lo siento, hubo un error al conectar con el servidor.");
    }
}

function addMessage(sender, text) {
    const chat = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender;
    messageDiv.textContent = text;
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
}

document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});