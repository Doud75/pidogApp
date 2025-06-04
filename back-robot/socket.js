import { Server } from 'socket.io';
let io;

export function initializeSocketIO(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
}

export function getSocketIOInstance() {
    if (!io) {
        throw new Error('Socket.IO n’est pas encore initialisé');
    }
    return io;
}
