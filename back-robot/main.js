import Fastify from 'fastify';
import process from 'process';
import http from 'http';
import config from './config.json' with { type: 'json' };
import { initializeSocketIO } from './socket.js';
import {socketController} from './controllers/socketController.js';
import cors from '@fastify/cors';

async function build() {
    const fastify = Fastify({ logger: true });
    const hostMyIp = config.hostMyIp || '0.0.0.0';

    await fastify.register(cors, {
        origin: '*'
    });

    const server = http.createServer(fastify.server);

    initializeSocketIO(server);

    await fastify.register(socketController);

    return { fastify, server, hostMyIp };
}

(async () => {
    try {
        const { fastify, server, hostMyIp } = await build();

        await fastify.listen({ port: 4499, host: hostMyIp });
        console.log(`Fastify démarré sur http://${hostMyIp}:4499`);

        await server.listen(4500, hostMyIp, () => {
            console.log(`Socket.IO serveur en écoute sur http://${hostMyIp}:4500`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
