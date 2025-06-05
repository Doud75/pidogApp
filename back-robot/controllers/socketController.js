import {
    registerRobot,
    unregisterRobotBySocketId,
    registerUser,
    unregisterUserBySocketId
} from '../services/deviceRegistryService.js';

import { broadcastIntrusionAlert }          from '../services/alertService.js';
import { sendDisableAlertToRobot }          from '../services/robotCommandService.js';
import { sendDisableAlertToUsers }          from '../services/userCommandService.js';

export async function socketController(fastify) {
    const io = (await import('../socket.js')).getSocketIOInstance();

    io.on('connection', (socket) => {
        console.log(`Socket connectée [${socket.id}]`);

        socket.on('register', (payload) => {
            try {
                const { type, id } = payload;
                if (type === 'robot') {
                    registerRobot(id, socket);
                    socket.join(`robot_${id}`);
                    console.log(`Robot enregistré → id=${id} (socket ${socket.id})`);
                } else if (type === 'user') {
                    registerUser(id, socket);
                    socket.join('users');
                    console.log(`User enregistré → id=${id} (socket ${socket.id})`);
                } else {
                    fastify.log.warn(`Type de registration inconnu : ${type}`);
                }
            } catch (err) {
                fastify.log.error(`Erreur register : ${err.message}`);
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('intruderDetected', (payload) => {
            try {
                console.log(`Intrusion détectée par le robot ${payload.robotId}`);
                broadcastIntrusionAlert(payload);
            } catch (err) {
                fastify.log.error(`Erreur intruderDetected : ${err.message}`);
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('disableAlert', (payload) => {
            try {
                const { userId, robotId } = payload;
                console.log(`Requête disableAlert de l'utilisateur ${userId} pour le robot ${robotId}`);

                sendDisableAlertToRobot(robotId, {
                    requestedBy: userId,
                    timestamp:   Date.now()
                });

                sendDisableAlertToUsers(robotId, {
                    requestedBy: userId,
                    timestamp:   Date.now()
                });
            } catch (err) {
                fastify.log.error(`Erreur disableAlert : ${err.message}`);
                socket.emit('error', { message: err.message });
            }
        });

        socket.on('disconnect', (reason) => {
            console.log(`Socket déconnectée [${socket.id}] (${reason})`);
            unregisterRobotBySocketId(socket.id);
            unregisterUserBySocketId(socket.id);
        });
    });
}
