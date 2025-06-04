const robotSockets = new Map();
const userSockets = new Map();

export function registerRobot(robotId, socket) {
    robotSockets.set(robotId, socket.id);
}

export function getRobotSocketId(robotId) {
    return robotSockets.get(robotId);
}

export function unregisterRobotBySocketId(socketId) {
    for (const [rid, sid] of robotSockets.entries()) {
        if (sid === socketId) {
            robotSockets.delete(rid);
            break;
        }
    }
}

export function registerUser(userId, socket) {
    userSockets.set(userId, socket.id);
}

export function unregisterUserBySocketId(socketId) {
    for (const [uid, sid] of userSockets.entries()) {
        if (sid === socketId) {
            userSockets.delete(uid);
            break;
        }
    }
}

export function getAllUserSocketIds() {
    return Array.from(userSockets.values());
}
