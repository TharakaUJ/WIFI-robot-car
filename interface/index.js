const ws = new WebSocket('ws://192.168.8.122:80');
const statusElement = document.getElementById('ws-status');
const keyIndicator = document.getElementById('key-indicator');
const buttonElements = {
    up: document.getElementById('up'),
    down: document.getElementById('down'),
    left: document.getElementById('left'),
    right: document.getElementById('right')
};

// Initialize control values
let controlState = { throttle: 0, turn: 0 };
let lastSentState = { throttle: 0, turn: 0 };
let lastAcknowledgedState = { throttle: 0, turn: 0 };

// Track which keys are currently pressed
let keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// WebSocket Handling
ws.onopen = () => {
    statusElement.textContent = 'Connected';
    statusElement.className = 'connected';
    sendControlState(); // Send initial state
};

ws.onclose = () => {
    statusElement.textContent = 'Disconnected';
    statusElement.className = 'disconnected';
};

ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
    statusElement.textContent = 'Error';
    statusElement.className = 'error';
};

// Handle WebSocket Messages (Acknowledgment)
ws.onmessage = (event) => {
    try {
        const receivedData = JSON.parse(event.data);
        if (receivedData.throttle !== undefined && receivedData.turn !== undefined) {
            lastAcknowledgedState = receivedData;
        }
    } catch (error) {
        console.error("Invalid WebSocket message:", event.data);
    }
};

// Periodic sending loop to ensure acknowledgment
setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        if (controlState.throttle !== lastAcknowledgedState.throttle || 
            controlState.turn !== lastAcknowledgedState.turn) {
            sendControlState();
        }
    }
}, 100); // Repeat every 100ms

function sendControlState() {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(controlState));
        lastSentState = { ...controlState };
        updateKeyIndicator();
    }
}

// Update key indicators
function updateKeyIndicator() {
    let activeControls = [];
    if (controlState.throttle === 1) activeControls.push('Forward');
    if (controlState.throttle === -1) activeControls.push('Backward');
    if (controlState.turn === 1) activeControls.push('Left');
    if (controlState.turn === -1) activeControls.push('Right');
    
    keyIndicator.textContent = activeControls.length > 0 ? 
        activeControls.join(' + ') : 'No movement';
}

// Update button visual state
function updateButtonVisualState() {
    buttonElements.up.classList.toggle('active', controlState.throttle === 1);
    buttonElements.down.classList.toggle('active', controlState.throttle === -1);
    buttonElements.left.classList.toggle('active', controlState.turn === 1);
    buttonElements.right.classList.toggle('active', controlState.turn === -1);
}

// Update control state
function updateControlState() {
    controlState.throttle = 0;
    controlState.turn = 0;

    if (keysPressed.ArrowUp) controlState.throttle = 1;
    if (keysPressed.ArrowDown) controlState.throttle = -1;
    if (keysPressed.ArrowLeft) controlState.turn = 1;
    if (keysPressed.ArrowRight) controlState.turn = -1;
    
    updateButtonVisualState();
    sendControlState();
}

// Button event listeners
buttonElements.up.addEventListener('mousedown', () => { controlState.throttle = 1; sendControlState(); });
buttonElements.down.addEventListener('mousedown', () => { controlState.throttle = -1; sendControlState(); });
buttonElements.left.addEventListener('mousedown', () => { controlState.turn = 1; sendControlState(); });
buttonElements.right.addEventListener('mousedown', () => { controlState.turn = -1; sendControlState(); });

document.addEventListener('mouseup', (event) => {
    if (event.target.classList.contains('button')) {
        if (event.target.id === 'up' || event.target.id === 'down') {
            controlState.throttle = 0;
        } else if (event.target.id === 'left' || event.target.id === 'right') {
            controlState.turn = 0;
        }
        sendControlState();
    }
});

// Touch events for mobile
const buttons = document.querySelectorAll('.button');
buttons.forEach(button => {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (button.id === 'up') controlState.throttle = 1;
        else if (button.id === 'down') controlState.throttle = -1;
        else if (button.id === 'left') controlState.turn = 1;
        else if (button.id === 'right') controlState.turn = -1;
        sendControlState();
    });

    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (button.id === 'up' || button.id === 'down') {
            controlState.throttle = 0;
        } else if (button.id === 'left' || button.id === 'right') {
            controlState.turn = 0;
        }
        sendControlState();
    });
});

// Keyboard handling
document.addEventListener('keydown', (event) => {
    if (Object.keys(keysPressed).includes(event.key)) {
        event.preventDefault();
        keysPressed[event.key] = true;
        updateControlState();
    }
});

document.addEventListener('keyup', (event) => {
    if (Object.keys(keysPressed).includes(event.key)) {
        keysPressed[event.key] = false;
        updateControlState();
    }
});

// Reset state when window loses focus
window.addEventListener('blur', () => {
    Object.keys(keysPressed).forEach(key => keysPressed[key] = false);
    controlState.throttle = 0;
    controlState.turn = 0;
    sendControlState();
});
