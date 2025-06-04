import { getSocketIOInstance } from '../socket.js';
import { getRobotSocketId } from './deviceRegistryService.js';

export function sendDisableAlertToRobot(robotId, payload) {
    const io = getSocketIOInstance();
    const socketId = getRobotSocketId(robotId);
    if (!socketId) {
        throw new Error(`Aucun robot enregistré avec l’ID ${robotId}`);
    }
    io.to(socketId).emit('disableAlert', payload);
}
