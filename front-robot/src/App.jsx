import React, {useEffect, useState, useCallback} from 'react';
import {io} from 'socket.io-client';
import {v4 as uuidv4} from 'uuid';
import './App.css';

const SOCKET_SERVER_URL = 'http://localhost:4500';

function usePersistentUserId() {
    const key = 'intruder-app-userId';
    const [userId] = useState(() => {
        const stored = window.localStorage.getItem(key);
        if (stored) return stored;
        const newId = uuidv4();
        window.localStorage.setItem(key, newId);
        return newId;
    });
    return userId;
}

export default function App() {
    const userId = usePersistentUserId();
    const [alerts, setAlerts] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketIo = io(SOCKET_SERVER_URL, {
            reconnectionAttempts: 5,
            transports: ['websocket']
        });

        socketIo.on('connect', () => {
            setSocketConnected(true);
            socketIo.emit('register', {type: 'user', id: userId});
        });

        socketIo.on('connect_error', (err) => {
            console.error('Erreur WS:', err.message);
            setSocketConnected(false);
        });

        socketIo.on('disconnect', (reason) => {
            console.log('Déconnecté WS:', reason);
            setSocketConnected(false);
        });

        socketIo.on('intrusionAlert', (payload) => {
            setAlerts((prev) => [
                {
                    id: `${payload.robotId}-${payload.timestamp}`,
                    ...payload,
                    handled: false
                },
                ...prev
            ]);
        });

        setSocket(socketIo);
        return () => {
            socketIo.disconnect();
            setSocket(null);
        };
    }, [userId]);

    const handleDisableAlert = useCallback(
        (robotId) => {
            if (!socket || !socketConnected) return;
            socket.emit('disableAlert', {userId, robotId});
            setAlerts((prev) =>
                prev.map((a) =>
                    a.robotId === robotId && !a.handled
                        ? {...a, handled: true}
                        : a
                )
            );
        },
        [socket, socketConnected, userId]
    );

    return (
        <div className="App">
            <header className="App-header">
                <h1>Alertes d’intrusion</h1>
                <p>Statut : {socketConnected ? 'Connecté' : 'Hors-ligne'}</p>
            </header>

            <main>
                {alerts.length === 0 && <p>Aucune alerte pour le moment…</p>}

                <ul className="alert-list">
                    {alerts.map((alert) => (
                        <li
                            key={alert.id}
                            className={`alert-item ${
                                alert.handled ? 'handled' : ''
                            }`}
                        >
                            <div className="alert-info">
                                <strong>Robot :</strong> {alert.robotId} <br/>
                                <strong>Zone :</strong>{' '}
                                {alert.details?.zone ?? 'N/A'} <br/>
                                <strong>Heure :</strong>{' '}
                                {new Date(alert.timestamp).toLocaleString()}
                            </div>
                            {!alert.handled ? (
                                <button
                                    className="btn-disable"
                                    onClick={() => handleDisableAlert(alert.robotId)}
                                >
                                    Désactiver l’alerte
                                </button>
                            ) : (
                                <span className="label-handled">
                  Alerte désactivée
                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}
