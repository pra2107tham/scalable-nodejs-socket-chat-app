import { Server } from "socket.io";
import Redis from "ioredis";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate environment variables
const requiredEnvVars = ['REDIS_HOST', 'REDIS_PORT', 'REDIS_USERNAME', 'REDIS_PASSWORD'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const pub = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
});

const sub = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
});

// Add error handlers for Redis connections
pub.on('error', (err) => console.error('Redis Publisher Error:', err));
sub.on('error', (err) => console.error('Redis Subscriber Error:', err));

class SocketService {
    private io: Server;

    constructor() {
        console.log("SocketService constructor: new instance created");
        this.io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*"
            }
        });
        sub.subscribe("MESSAGES");
    }

    public initListeners() {
        console.log("SocketService initListeners: initializing listeners");
        this.io.on("connection", (socket) => {
            console.log("SocketService initListeners: new connection established", socket.id);
            socket.on("event:message", (message: string) => {
                console.log("SocketService initListeners: message received", message);
                pub.publish("MESSAGES", JSON.stringify({
                    id: socket.id,
                    message
                }));
            });
        });
        sub.on("message", (channel, message) => {
            if(channel === "MESSAGES"){
                try {
                    const parsedMessage = JSON.parse(message);
                    // Broadcast to all connected clients
                    this.io.emit("event:message", parsedMessage.message);
                    console.log("Message broadcast to all clients:", parsedMessage.message);
                } catch (error) {
                    console.error("Error parsing message:", error);
                }
            } 
        });
    }

    getIo() {
        console.log("SocketService getIo: returning io instance");
        return this.io;
    }
}

export default SocketService;