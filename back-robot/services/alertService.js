import { getSocketIOInstance } from '../socket.js';

export function broadcastIntrusionAlert(payload) {
    const io = getSocketIOInstance();
    io.to('users').emit('intrusionAlert', payload);
}
