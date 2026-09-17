// backend/src/modules/presence/presence.gateway.ts

/**
 * Presence Gateway - Handles real-time user presence (online/offline status)
 * Uses Socket.IO for WebSocket communication
 *
 * What this does:
 * 1. Tracks which users are online
 * 2. Broadcasts when users come online/go offline
 * 3. Tracks which project users are viewing
 * 4. Sends heartbeats to keep connections alive
 */

import {
    WebSocketGateway, // Decorator to mark this as a WebSocket gateway
    WebSocketServer, // Decorator to inject the Socket.IO server instance
    SubscribeMessage, // Decorator to handle specific message types
    OnGatewayConnection, // Interface for connection lifecycle
    OnGatewayDisconnect, // Interface for disconnection lifecycle
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';

/**
 * @WebSocketGateway() - Configures the WebSocket server
 * - cors: Allows connections from the frontend (http://localhost:3000)
 * - namespace: '/presence' - All connections go to this namespace
 *   (Separates presence traffic from other WebSocket traffic)
 */
@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    },
    namespace: 'presence',
})
export class PresenceGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    /**
     * @WebSocketServer() - The Socket.IO server instance
     * This is used to broadcast messages to ALL connected clients
     * Example: this.server.emit('userOnline', data) sends to everyone
     */
    @WebSocketServer()
    server: Server;

    /**
     * Constructor - Injects the PresenceService
     * This service handles the actual presence data storage (in Redis)
     */
    constructor(private presenceService: PresenceService) {}

    /**
     * handleConnection - Called when a client connects
     *
     * Flow:
     * 1. Extract userId and username from the connection query parameters
     * 2. Store the user as "online" in Redis
     * 3. Broadcast to all other clients that this user is online
     * 4. Send the new client the full list of online users
     *
     * @param client - The Socket.IO client that connected
     */
    async handleConnection(client: Socket) {
        // Get user info from the connection URL: ws://localhost:3001/presence?userId=xxx&username=yyy
        const userId = client.handshake.query.userId as string;
        const username = client.handshake.query.username as string;

        if (userId && username) {
            // Store user presence in Redis
            await this.presenceService.setUserPresence(userId, username);

            // Store userId on the client object for later use (disconnect)
            client.data.userId = userId;

            // Broadcast to ALL other clients that this user is online
            // This allows other users to see "X is online" notifications
            this.server.emit('userOnline', { userId, username });

            // Get all currently online users from Redis
            const onlineUsers = await this.presenceService.getAllOnlineUsers();

            // Send the full list to the NEW client only
            // This initializes their online users list
            client.emit('onlineUsers', onlineUsers);
        }
    }

    /**
     * handleDisconnect - Called when a client disconnects
     *
     * Flow:
     * 1. Get the userId from the stored client data
     * 2. Remove the user from Redis presence data
     * 3. Broadcast to all clients that this user went offline
     *
     * @param client - The Socket.IO client that disconnected
     */
    async handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            // Remove user from Redis presence data
            await this.presenceService.removeUserPresence(userId);

            // Broadcast to ALL clients that this user is now offline
            this.server.emit('userOffline', { userId });
        }
    }

    /**
     * @SubscribeMessage('joinProject') - Handles "joinProject" messages
     *
     * Called when a user opens a specific project page
     *
     * Flow:
     * 1. Get userId from client data
     * 2. Update the user's presence to show which project they're viewing
     * 3. Get the list of all users in that project
     * 4. Send the project users list to THIS client only
     *
     * This allows users to see who else is working on the same project
     *
     * @param client - The Socket.IO client sending the message
     * @param projectId - The ID of the project the user is viewing
     */
    @SubscribeMessage('joinProject')
    async handleJoinProject(client: Socket, projectId: string) {
        const userId = client.data.userId;
        if (userId && projectId) {
            // Update user's presence with the project they're viewing
            await this.presenceService.updateUserProject(userId, projectId);

            // Get all users currently viewing this project
            const projectUsers =
                await this.presenceService.getProjectUsers(projectId);

            // Send project users to THIS client only
            client.emit('projectUsers', projectUsers);
        }
    }

    /**
     * @SubscribeMessage('heartbeat') - Handles "heartbeat" messages
     *
     * Heartbeats are sent periodically (every 30 seconds) by the client
     * to keep the connection alive and update the "lastSeen" timestamp
     *
     * Without heartbeats, we wouldn't know if a user is still active
     * (they might have closed the tab without disconnecting)
     *
     * @param client - The Socket.IO client sending the heartbeat
     */
    @SubscribeMessage('heartbeat')
    async handleHeartbeat(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            // Update the user's lastSeen timestamp in Redis
            await this.presenceService.heartbeat(userId);
        }
    }
}
