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
let controlState = {
    throttle: 0,  // forward/backward: -1, 0, 1
    turn: 0       // left/right: -1, 0, 1
};

// Keep track of last sent values to avoid redundant messages
let lastSentState = {...controlState};

// Track which keys are currently pressed
let keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// For periodic sending
let sendInterval = null;
const SEND_INTERVAL_MS = 100; // Send every 100ms

ws.onopen = () => {
    statusElement.textContent = 'Connected';
    statusElement.className = 'connected';
    
    // Start periodic sending
    startPeriodicSending();
};

ws.onclose = () => {
    statusElement.textContent = 'Disconnected';
    statusElement.className = 'disconnected';
    stopPeriodicSending();
};

ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
    statusElement.textContent = 'Error';
    statusElement.className = 'error';
};

function startPeriodicSending() {
    if (sendInterval === null) {
        sendInterval = setInterval(sendControlState, SEND_INTERVAL_MS);
    }
}

function stopPeriodicSending() {
    if (sendInterval !== null) {
        clearInterval(sendInterval);
        sendInterval = null;
    }
}

function sendControlState() {
    // Only send if values changed or connection just established
    if (ws.readyState === WebSocket.OPEN && 
        (controlState.throttle !== lastSentState.throttle || 
         controlState.turn !== lastSentState.turn)) {
        
        ws.send(JSON.stringify(controlState));
        lastSentState = {...controlState};
        
        // Update key indicator
        updateKeyIndicator();
    }
}

function updateKeyIndicator() {
    let activeControls = [];
    
    if (controlState.throttle === 1) activeControls.push('Forward');
    if (controlState.throttle === -1) activeControls.push('Backward');
    if (controlState.turn === 1) activeControls.push('Left');
    if (controlState.turn === -1) activeControls.push('Right');
    
    keyIndicator.textContent = activeControls.length > 0 ? 
        activeControls.join(' + ') : 'No movement';
}

function updateButtonVisualState() {
    buttonElements.up.classList.toggle('active', controlState.throttle === 1);
    buttonElements.down.classList.toggle('active', controlState.throttle === -1);
    buttonElements.left.classList.toggle('active', controlState.turn === 1);
    buttonElements.right.classList.toggle('active', controlState.turn === -1);
}

function updateControlState() {
    // Reset control state
    controlState.throttle = 0;
    controlState.turn = 0;
    
    // Update based on keys currently pressed
    if (keysPressed.ArrowUp) controlState.throttle = 1;
    if (keysPressed.ArrowDown) controlState.throttle = -1;
    if (keysPressed.ArrowLeft) controlState.turn = 1;
    if (keysPressed.ArrowRight) controlState.turn = -1;
    
    // Update the visual state of buttons
    updateButtonVisualState();
    
    // Send immediately on state change
    sendControlState();
}

// Handle button clicks
buttonElements.up.addEventListener('mousedown', () => {
    controlState.throttle = 1;
    updateButtonVisualState();
    sendControlState();
});

buttonElements.down.addEventListener('mousedown', () => {
    controlState.throttle = -1;
    updateButtonVisualState();
    sendControlState();
});

buttonElements.left.addEventListener('mousedown', () => {
    controlState.turn = 1;
    updateButtonVisualState();
    sendControlState();
});

buttonElements.right.addEventListener('mousedown', () => {
    controlState.turn = -1;
    updateButtonVisualState();
    sendControlState();
});

// Reset values on button release
document.addEventListener('mouseup', (event) => {
    if (event.target.classList.contains('button')) {
        if (event.target.id === 'up' || event.target.id === 'down') {
            controlState.throttle = 0;
        } else if (event.target.id === 'left' || event.target.id === 'right') {
            controlState.turn = 0;
        }
        updateButtonVisualState();
        sendControlState();
    }
});

// Handle touch events for mobile devices
const buttons = document.querySelectorAll('.button');
buttons.forEach(button => {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default touch behavior
        
        if (button.id === 'up') controlState.throttle = 1;
        else if (button.id === 'down') controlState.throttle = -1;
        else if (button.id === 'left') controlState.turn = 1;
        else if (button.id === 'right') controlState.turn = -1;
        
        updateButtonVisualState();
        sendControlState();
    });
    
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        if (button.id === 'up' || button.id === 'down') {
            controlState.throttle = 0;
        } else if (button.id === 'left' || button.id === 'right') {
            controlState.turn = 0;
        }
        
        updateButtonVisualState();
        sendControlState();
    });
});

// Keyboard event handlers
document.addEventListener('keydown', (event) => {
    // Only process arrow keys and prevent default scrolling
    if (Object.keys(keysPressed).includes(event.key)) {
        event.preventDefault();
        
        // Update key state
        keysPressed[event.key] = true;
        
        // Update control values based on current key states
        updateControlState();
    }
});

document.addEventListener('keyup', (event) => {
    // Only process arrow keys
    if (Object.keys(keysPressed).includes(event.key)) {
        // Update key state
        keysPressed[event.key] = false;
        
        // Update control values based on current key states
        updateControlState();
    }
});

// Handle when window loses focus
window.addEventListener('blur', () => {
    // Reset all key states when window loses focus
    Object.keys(keysPressed).forEach(key => {
        keysPressed[key] = false;
    });
    
    // Reset control values
    controlState.throttle = 0;
    controlState.turn = 0;
    
    updateButtonVisualState();
    sendControlState();
});