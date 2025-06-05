import { getSocketIOInstance } from '../socket.js';

export function sendDisableAlertToUsers(robotId, payload) {
    const io = getSocketIOInstance();
    io.to('users').emit('disableAlert', {
        robotId,
        requestedBy: payload.requestedBy,
        timestamp:   payload.timestamp
    });
}
